import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import type { EquipmentType, EquipmentSystem, EquipmentStatus, Criticality } from "@prisma/client";

export async function POST(req: NextRequest) {
  const body = await req.json();
  const {
    name,
    type,
    system,
    location,
    manufacturer,
    model,
    serialNumber,
    externalId,
    status,
    criticality,
    regulationId,
  } = body;

  if (!name || !type || !system || !location) {
    return NextResponse.json({ error: "Заполните обязательные поля" }, { status: 400 });
  }

  const equipment = await prisma.equipment.create({
    data: {
      name,
      type: type as EquipmentType,
      system: system as EquipmentSystem,
      location,
      manufacturer: manufacturer || undefined,
      model: model || undefined,
      serialNumber: serialNumber || undefined,
      externalId: externalId || undefined,
      status: (status as EquipmentStatus) ?? "OK",
      criticality: (criticality as Criticality) ?? "MEDIUM",
      regulationId: regulationId || undefined,
      qrCode: externalId ? `QR-${externalId}` : undefined,
    },
  });

  return NextResponse.json(equipment);
}
