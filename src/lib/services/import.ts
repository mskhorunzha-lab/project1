import { prisma } from "@/lib/prisma";
import type { EquipmentSystem, EquipmentType, EquipmentStatus, Criticality, ItemCondition } from "@prisma/client";

type ImportResult = {
  success: number;
  errors: { row: number; message: string }[];
};

const EQUIPMENT_SYSTEM_MAP: Record<string, EquipmentSystem> = {
  "ибп": "UPS", "ups": "UPS", "электропитание": "UPS",
  "скуд": "ACS", "acs": "ACS",
  "видеонаблюдение": "CCTV", "cctv": "CCTV",
  "лвс": "LAN", "скс": "LAN", "lan": "LAN",
  "кондиционирование": "HVAC", "hvac": "HVAC",
  "связь": "TELECOM", "телефон": "TELECOM",
};

const EQUIPMENT_TYPE_MAP: Record<string, EquipmentType> = {
  "ибп": "UPS", "ups": "UPS",
  "дверь": "ACS_DOOR", "скуд": "ACS_DOOR",
  "камера": "CAMERA",
  "шкаф": "CABINET",
  "кондиционер": "CONDITIONER",
  "коммутатор": "SWITCH",
};

const STATUS_MAP: Record<string, EquipmentStatus> = {
  "исправно": "OK", "ok": "OK",
  "неисправно": "FAULTY", "faulty": "FAULTY",
  "ограниченно": "LIMITED", "limited": "LIMITED",
  "выведено": "DECOMMISSIONED",
};

const CRITICALITY_MAP: Record<string, Criticality> = {
  "высокая": "HIGH", "high": "HIGH",
  "средняя": "MEDIUM", "medium": "MEDIUM",
  "низкая": "LOW", "low": "LOW",
};

function parseDate(val: string | undefined): Date | undefined {
  if (!val || val === "—" || val === "-") return undefined;
  const d = new Date(val);
  return isNaN(d.getTime()) ? undefined : d;
}

export async function importEquipment(
  rows: Record<string, string>[],
  userId?: string
): Promise<ImportResult> {
  const errors: { row: number; message: string }[] = [];
  let success = 0;

  for (let i = 0; i < rows.length; i++) {
    const row = rows[i];
    const rowNum = i + 2;

    try {
      const externalId = row.equipment_id || row.id;
      const name = row.name;
      const location = row.location;

      if (!name || !location) {
        errors.push({ row: rowNum, message: "Обязательные поля: name, location" });
        continue;
      }

      const systemKey = (row.system || "").toLowerCase();
      const typeKey = (row.type || "").toLowerCase();
      const system = EQUIPMENT_SYSTEM_MAP[systemKey] ?? "OTHER";
      const type = EQUIPMENT_TYPE_MAP[typeKey] ?? "OTHER";
      const status = STATUS_MAP[(row.status || "исправно").toLowerCase()] ?? "OK";
      const criticality = CRITICALITY_MAP[(row.criticality || "средняя").toLowerCase()] ?? "MEDIUM";

      const data = {
        externalId: externalId || undefined,
        type,
        system,
        name,
        model: row.model || undefined,
        serialNumber: row.serial_number || undefined,
        inventoryNumber: row.inventory_number || undefined,
        location,
        status,
        criticality,
        lastMaintenance: parseDate(row.last_maintenance),
        nextMaintenance: parseDate(row.next_maintenance),
        qrCode: externalId ? `QR-${externalId}` : undefined,
      };

      if (externalId) {
        await prisma.equipment.upsert({
          where: { externalId },
          create: data,
          update: data,
        });
      } else {
        await prisma.equipment.create({ data });
      }
      success++;
    } catch (e) {
      errors.push({ row: rowNum, message: e instanceof Error ? e.message : "Ошибка записи" });
    }
  }

  await prisma.importLog.create({
    data: {
      userId,
      fileName: "equipment-import",
      dataType: "equipment",
      totalRows: rows.length,
      successRows: success,
      errorRows: errors.length,
      errors: errors.length > 0 ? errors : undefined,
    },
  });

  return { success, errors };
}

export async function importWarehouse(
  rows: Record<string, string>[],
  userId?: string
): Promise<ImportResult> {
  const errors: { row: number; message: string }[] = [];
  let success = 0;

  const CONDITION_MAP: Record<string, ItemCondition> = {
    "новое": "NEW", "new": "NEW",
    "бу исправное": "USED_OK", "used_ok": "USED_OK",
    "бу неисправное": "USED_FAULTY",
    "гарантийное": "WARRANTY",
  };

  for (let i = 0; i < rows.length; i++) {
    const row = rows[i];
    const rowNum = i + 2;

    try {
      const externalId = row.item_id || row.id;
      const name = row.name;
      if (!name) {
        errors.push({ row: rowNum, message: "Обязательное поле: name" });
        continue;
      }

      const data = {
        externalId: externalId || undefined,
        name,
        category: row.category || "Прочее",
        model: row.model || undefined,
        unit: row.unit || "шт",
        condition: CONDITION_MAP[(row.condition || "новое").toLowerCase()] ?? "NEW",
        storageLocation: row.location || "Склад-1",
        quantity: parseFloat(row.quantity || "0") || 0,
        minQuantity: parseFloat(row.min_quantity || "0") || 0,
        reorderPoint: parseFloat(row.reorder_point || "0") || 0,
        emergencyReserve: parseFloat(row.emergency_reserve || "0") || 0,
        criticality: CRITICALITY_MAP[(row.criticality || "средняя").toLowerCase()] ?? "MEDIUM",
      };

      if (externalId) {
        await prisma.warehouseItem.upsert({
          where: { externalId },
          create: data,
          update: data,
        });
      } else {
        await prisma.warehouseItem.create({ data });
      }
      success++;
    } catch (e) {
      errors.push({ row: rowNum, message: e instanceof Error ? e.message : "Ошибка записи" });
    }
  }

  await prisma.importLog.create({
    data: {
      userId,
      fileName: "warehouse-import",
      dataType: "warehouse",
      totalRows: rows.length,
      successRows: success,
      errorRows: errors.length,
      errors: errors.length > 0 ? errors : undefined,
    },
  });

  return { success, errors };
}
