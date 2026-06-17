import { NextRequest, NextResponse } from "next/server";
import Papa from "papaparse";
import readXlsxFile from "read-excel-file/node";
import { authorize } from "@/lib/auth";
import { writeAuditLog } from "@/lib/audit";
import { importEquipment, importWarehouse } from "@/lib/services/import";
import { formatZodError, importRequestSchema } from "@/lib/validation";

const MAX_IMPORT_BYTES = 5 * 1024 * 1024;
const MAX_IMPORT_ROWS = 5000;

async function parseFile(file: File): Promise<Record<string, string>[]> {
  const buffer = await file.arrayBuffer();
  const name = file.name.toLowerCase();

  if (buffer.byteLength > MAX_IMPORT_BYTES) {
    throw new Error("Файл слишком большой. Максимальный размер: 5 МБ");
  }

  if (name.endsWith(".xlsx")) {
    return parseXlsx(buffer);
  }

  if (!name.endsWith(".csv")) {
    throw new Error("Поддерживаются только CSV и XLSX");
  }

  const text = decodeCsv(buffer);
  const delimiter = text.includes(";") && !text.includes(",") ? ";" : ",";
  const parsed = Papa.parse<Record<string, string>>(text, {
    header: true,
    skipEmptyLines: true,
    delimiter,
  });

  if (parsed.errors.length > 0) {
    throw new Error(`Ошибка разбора CSV: ${parsed.errors[0]?.message ?? "неверный формат"}`);
  }

  if (parsed.data.length > MAX_IMPORT_ROWS) {
    throw new Error(`Слишком много строк. Максимум: ${MAX_IMPORT_ROWS}`);
  }

  return parsed.data;
}

async function parseXlsx(buffer: ArrayBuffer): Promise<Record<string, string>[]> {
  const sheet = (await readXlsxFile(Buffer.from(buffer) as never)) as unknown as unknown[][];
  if (sheet.length === 0) return [];

  const [headerRow, ...dataRows] = sheet;
  const headers = headerRow.map((header) => cellToString(header).trim());
  const rows: Record<string, string>[] = [];

  for (const row of dataRows) {
    if (rows.length >= MAX_IMPORT_ROWS) {
      throw new Error(`Слишком много строк. Максимум: ${MAX_IMPORT_ROWS}`);
    }

    const item: Record<string, string> = {};
    headers.forEach((header, index) => {
      if (!header) return;
      item[header] = cellToString(row[index]);
    });

    if (Object.values(item).some((value) => value.length > 0)) {
      rows.push(item);
    }
  }

  return rows;
}

function cellToString(value: unknown): string {
  if (value === null || value === undefined) return "";
  if (value instanceof Date) return value.toISOString();
  return String(value);
}

function decodeCsv(buffer: ArrayBuffer): string {
  try {
    return new TextDecoder("utf-8", { fatal: true }).decode(buffer);
  } catch {
    return new TextDecoder("windows-1251").decode(buffer);
  }
}

export async function POST(req: NextRequest) {
  try {
    const auth = await authorize(req, ["DISPATCHER", "LEAD_SPECIALIST", "MANAGER"]);
    if (!auth.ok) return auth.response;

    const formData = await req.formData();
    const file = formData.get("file") as File | null;
    const parsed = importRequestSchema.safeParse({
      dataType: formData.get("dataType"),
    });

    if (!file) {
      return NextResponse.json({ error: "Файл не выбран" }, { status: 400 });
    }

    if (!parsed.success) {
      return NextResponse.json({ error: formatZodError(parsed.error) }, { status: 400 });
    }

    const rows = await parseFile(file);
    if (rows.length === 0) {
      return NextResponse.json({ error: "Файл пуст или неверный формат" }, { status: 400 });
    }

    const result =
      parsed.data.dataType === "warehouse"
        ? await importWarehouse(rows, auth.user.id)
        : await importEquipment(rows, auth.user.id);

    await writeAuditLog({
      userId: auth.user.id,
      action: "IMPORT_COMPLETED",
      entity: "ImportLog",
      details: {
        fileName: file.name,
        dataType: parsed.data.dataType,
        totalRows: rows.length,
        successRows: result.success,
        errorRows: result.errors.length,
      },
    });

    return NextResponse.json(result);
  } catch (e) {
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "Ошибка импорта" },
      { status: 500 }
    );
  }
}
