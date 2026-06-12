import { prisma } from "@/lib/prisma";
import { PageHeader } from "@/components/PageHeader";
import { WorkForm } from "@/components/WorkForm";

export const dynamic = "force-dynamic";

export default async function NewWorkPage({
  searchParams,
}: {
  searchParams: Promise<{ equipmentId?: string }>;
}) {
  const params = await searchParams;
  const [equipment, users] = await Promise.all([
    prisma.equipment.findMany({ orderBy: { name: "asc" } }),
    prisma.user.findMany({ where: { active: true } }),
  ]);

  const preselected = params.equipmentId
    ? equipment.find((e) => e.id === params.equipmentId)
    : undefined;

  return (
    <div>
      <PageHeader title="Новая работа" description="Внутренний журнал работ инфраструктуры" />
      <div className="card max-w-2xl">
        <WorkForm equipment={equipment} users={users} preselected={preselected} />
      </div>
    </div>
  );
}
