import { prisma } from "@/lib/prisma";
import { PageHeader } from "@/components/PageHeader";
import { MovementForm } from "@/components/MovementForm";

export const dynamic = "force-dynamic";

export default async function MovementPage() {
  const [items, works, equipment, users] = await Promise.all([
    prisma.warehouseItem.findMany({ orderBy: { name: "asc" } }),
    prisma.work.findMany({
      where: { status: { notIn: ["CLOSED", "CANCELLED"] } },
      orderBy: { plannedDate: "asc" },
    }),
    prisma.equipment.findMany({ orderBy: { name: "asc" } }),
    prisma.user.findMany({ where: { active: true } }),
  ]);

  return (
    <div>
      <PageHeader
        title="Новое движение ТМЦ"
        description="Списание только с основанием — работа, ТО, ремонт или проект"
      />
      <div className="card max-w-2xl">
        <MovementForm items={items} works={works} equipment={equipment} users={users} />
      </div>
    </div>
  );
}
