import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { generateWorkNumber } from "@/lib/utils";
import type { WorkType, Priority, EquipmentSystem, WorkStatus } from "@prisma/client";

export async function POST(req: NextRequest) {
  const body = await req.json();
  const {
    title,
    type,
    category,
    system,
    priority,
    equipmentId,
    serviceDeskTicket,
    leadSpecialistId,
    assigneeId,
    plannedDate,
    description,
  } = body;

  if (!title || !type || !category || !system || !plannedDate) {
    return NextResponse.json({ error: "Заполните обязательные поля" }, { status: 400 });
  }

  const count = await prisma.work.count();
  const number = generateWorkNumber(count + 1);

  let status: WorkStatus = "NEW";
  if (assigneeId) status = "ASSIGNED";

  const work = await prisma.work.create({
    data: {
      number,
      title,
      type: type as WorkType,
      category,
      system: system as EquipmentSystem,
      priority: (priority as Priority) ?? "P3",
      equipmentId: equipmentId || undefined,
      serviceDeskTicket: serviceDeskTicket || undefined,
      leadSpecialistId: leadSpecialistId || undefined,
      assigneeId: assigneeId || undefined,
      plannedDate: new Date(plannedDate),
      description: description || undefined,
      status,
    },
  });

  return NextResponse.json(work);
}
