import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { completeMaintenance } from "@/lib/services/maintenance";

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const body = await req.json();
  const { status, waitReason, result } = body;

  const update: Record<string, unknown> = { status };
  if (waitReason !== undefined) update.waitReason = waitReason;
  if (result !== undefined) update.result = result;

  if (["DONE", "CLOSED", "ON_REVIEW"].includes(status)) {
    update.actualDate = new Date();
  }

  const work = await prisma.work.update({
    where: { id },
    data: update,
    include: { equipment: { include: { regulation: true } } },
  });

  if (status === "CLOSED" && work.type === "MAINTENANCE" && work.equipment) {
    const interval = work.equipment.regulation?.intervalDays ?? 180;
    const nextDate = new Date();
    nextDate.setDate(nextDate.getDate() + interval);
    await completeMaintenance(id, nextDate);
  }

  return NextResponse.json(work);
}
