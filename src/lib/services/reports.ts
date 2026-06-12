import { addDays, startOfDay } from "date-fns";
import { prisma } from "@/lib/prisma";

export async function getDashboardStats() {
  const today = startOfDay(new Date());
  const monthAhead = addDays(today, 30);

  const [
    equipmentTotal,
    equipmentFaulty,
    worksOverdue,
    maintenanceOverdue,
    maintenanceUpcoming,
    lowStock,
    zeroStock,
    worksWithoutChecklist,
    openWorks,
  ] = await Promise.all([
    prisma.equipment.count({ where: { status: { not: "DECOMMISSIONED" } } }),
    prisma.equipment.count({ where: { status: "FAULTY" } }),
    prisma.work.count({
      where: {
        plannedDate: { lt: today },
        status: { notIn: ["CLOSED", "CANCELLED", "DONE"] },
      },
    }),
    prisma.equipment.count({
      where: {
        nextMaintenance: { lt: today },
        status: { not: "DECOMMISSIONED" },
      },
    }),
    prisma.work.count({
      where: {
        type: "MAINTENANCE",
        plannedDate: { gte: today, lte: monthAhead },
        status: { notIn: ["CLOSED", "CANCELLED"] },
      },
    }),
    prisma.$queryRaw<[{ count: bigint }]>`
      SELECT COUNT(*)::bigint as count FROM "WarehouseItem"
      WHERE quantity < "minQuantity"
    `.then((r) => Number(r[0]?.count ?? 0)),
    prisma.warehouseItem.count({ where: { quantity: 0 } }),
    prisma.work.count({
      where: {
        type: "MAINTENANCE",
        status: "CLOSED",
        checklist: null,
        system: { in: ["UPS", "ACS"] },
      },
    }),
    prisma.work.count({
      where: { status: { notIn: ["CLOSED", "CANCELLED"] } },
    }),
  ]);

  const lowStockItems = await prisma.$queryRaw<
    { id: string; name: string; quantity: number; minQuantity: number }[]
  >`
    SELECT id, name, quantity, "minQuantity" as "minQuantity"
    FROM "WarehouseItem"
    WHERE quantity < "minQuantity"
    ORDER BY quantity ASC
    LIMIT 10
  `;

  const overdueWorks = await prisma.work.findMany({
    where: {
      plannedDate: { lt: today },
      status: { notIn: ["CLOSED", "CANCELLED", "DONE"] },
    },
    include: { equipment: true, assignee: true },
    orderBy: { plannedDate: "asc" },
    take: 10,
  });

  const overdueMaintenance = await prisma.equipment.findMany({
    where: {
      nextMaintenance: { lt: today },
      status: { not: "DECOMMISSIONED" },
    },
    orderBy: { nextMaintenance: "asc" },
    take: 10,
  });

  return {
    equipmentTotal,
    equipmentFaulty,
    worksOverdue,
    maintenanceOverdue,
    maintenanceUpcoming,
    lowStock: typeof lowStock === "number" ? lowStock : 0,
    zeroStock,
    worksWithoutChecklist,
    openWorks,
    lowStockItems,
    overdueWorks,
    overdueMaintenance,
  };
}

export async function getOverdueWorks() {
  const today = startOfDay(new Date());
  return prisma.work.findMany({
    where: {
      plannedDate: { lt: today },
      status: { notIn: ["CLOSED", "CANCELLED", "DONE"] },
    },
    include: { equipment: true, assignee: true, leadSpecialist: true },
    orderBy: [{ priority: "asc" }, { plannedDate: "asc" }],
  });
}

export async function getOverdueMaintenance() {
  const today = startOfDay(new Date());
  return prisma.equipment.findMany({
    where: {
      nextMaintenance: { lt: today },
      status: { not: "DECOMMISSIONED" },
    },
    include: { regulation: true },
    orderBy: { nextMaintenance: "asc" },
  });
}

export async function getLowStockItems() {
  return prisma.$queryRaw<
    {
      id: string;
      name: string;
      category: string;
      quantity: number;
      minQuantity: number;
      reorderPoint: number;
      emergencyReserve: number;
      criticality: string;
    }[]
  >`
    SELECT id, name, category, quantity, "minQuantity", "reorderPoint",
           "emergencyReserve", criticality::text
    FROM "WarehouseItem"
    WHERE quantity <= "reorderPoint"
    ORDER BY
      CASE criticality::text WHEN 'HIGH' THEN 0 WHEN 'MEDIUM' THEN 1 ELSE 2 END,
      quantity ASC
  `;
}

export async function getPurchaseNeeds() {
  const items = await getLowStockItems();
  return items.map((item) => {
    const need = Math.max(
      0,
      item.minQuantity + item.emergencyReserve - item.quantity
    );
    return { ...item, needToBuy: need };
  });
}
