import { addDays } from "date-fns";
import { prisma } from "@/lib/prisma";
import { createWorkWithGeneratedNumber } from "@/lib/services/work-number";

export async function generateMaintenanceWorks(): Promise<number> {
  const today = new Date();
  const equipment = await prisma.equipment.findMany({
    where: {
      status: { not: "DECOMMISSIONED" },
      regulationId: { not: null },
      OR: [
        { nextMaintenance: { lte: today } },
        { nextMaintenance: null },
      ],
    },
    include: { regulation: true },
  });

  let created = 0;

  for (const eq of equipment) {
    if (!eq.regulation) continue;

    const existing = await prisma.work.findFirst({
      where: {
        equipmentId: eq.id,
        type: "MAINTENANCE",
        status: { notIn: ["CLOSED", "CANCELLED"] },
      },
    });
    if (existing) continue;

    const plannedDate = eq.nextMaintenance ?? addDays(today, 7);

    await createWorkWithGeneratedNumber({
      type: "MAINTENANCE",
      category: `Плановое ТО — ${eq.regulation.name}`,
      system: eq.system,
      equipmentId: eq.id,
      priority: "PLANNED",
      plannedDate,
      status: "NEW",
      title: `ТО: ${eq.name}`,
      description: `Автоматически создано по регламенту «${eq.regulation.name}»`,
    });
    created++;
  }

  return created;
}

export async function completeMaintenance(
  workId: string,
  nextMaintenanceDate: Date
): Promise<void> {
  const work = await prisma.work.findUnique({
    where: { id: workId },
    include: { equipment: { include: { regulation: true } } },
  });
  if (!work?.equipmentId || !work.equipment) return;

  const now = new Date();
  const interval = work.equipment.regulation?.intervalDays ?? 180;

  await prisma.equipment.update({
    where: { id: work.equipmentId },
    data: {
      lastMaintenance: now,
      nextMaintenance: nextMaintenanceDate ?? addDays(now, interval),
    },
  });
}
