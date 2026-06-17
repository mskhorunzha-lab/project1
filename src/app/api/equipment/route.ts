import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { authorize } from "@/lib/auth";
import { writeAuditLog } from "@/lib/audit";
import { createEquipmentSchema, formatZodError } from "@/lib/validation";

export async function POST(req: NextRequest) {
  const auth = await authorize(req, ["LEAD_SPECIALIST", "MANAGER"]);
  if (!auth.ok) return auth.response;

  const parsed = createEquipmentSchema.safeParse(await req.json());
  if (!parsed.success) {
    return NextResponse.json({ error: formatZodError(parsed.error) }, { status: 400 });
  }

  const data = parsed.data;
  const equipment = await prisma.equipment.create({
    data: {
      name: data.name,
      type: data.type,
      system: data.system,
      location: data.location,
      manufacturer: data.manufacturer,
      model: data.model,
      serialNumber: data.serialNumber,
      externalId: data.externalId,
      status: data.status,
      criticality: data.criticality,
      regulationId: data.regulationId,
      qrCode: data.externalId ? `QR-${data.externalId}` : undefined,
    },
  });

  await writeAuditLog({
    userId: auth.user.id,
    action: "EQUIPMENT_CREATED",
    entity: "Equipment",
    entityId: equipment.id,
    details: { externalId: equipment.externalId, system: equipment.system },
  });

  return NextResponse.json(equipment);
}
