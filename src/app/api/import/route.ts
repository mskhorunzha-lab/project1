import { NextRequest, NextResponse } from "next/server";
import Papa from "papaparse";
import * as XLSX from "xlsx";
import { importEquipment, importWarehouse } from "@/lib/services/import";

async function parseFile(file: File): Promise<Record<string, string>[]> {
  const buffer = await file.arrayBuffer();
  const name = file.name.toLowerCase();

  if (name.endsWith(".xlsx") || name.endsWith(".xls")) {
    const wb = XLSX.read(buffer, { type: "array" });
    const sheet = wb.Sheets[wb.SheetNames[0]];
    return XLSX.utils.sheet_to_json<Record<string, string>>(sheet, { defval: "" });
  }

  const text = new TextDecoder("utf-8").decode(buffer);
  const delimiter = text.includes(";") && !text.includes(",") ? ";" : ",";
  const parsed = Papa.parse<Record<string, string>>(text, {
    header: true,
    skipEmptyLines: true,
    delimiter,
  });

  if (parsed.errors.length > 0 && parsed.data.length === 0) {
    const text1251 = new TextDecoder("windows-1251").decode(buffer);
    const parsed1251 = Papa.parse<Record<string, string>>(text1251, {
      header: true,
      skipEmptyLines: true,
      delimiter,
    });
    return parsed1251.data;
  }

  return parsed.data;
}

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get("file") as File | null;
    const dataType = formData.get("dataType") as string;

    if (!file) {
      return NextResponse.json({ error: "Файл не выбран" }, { status: 400 });
    }

    const rows = await parseFile(file);
    if (rows.length === 0) {
      return NextResponse.json({ error: "Файл пуст или неверный формат" }, { status: 400 });
    }

    const result =
      dataType === "warehouse"
        ? await importWarehouse(rows)
        : await importEquipment(rows);

    return NextResponse.json(result);
  } catch (e) {
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "Ошибка импорта" },
      { status: 500 }
    );
  }
}
