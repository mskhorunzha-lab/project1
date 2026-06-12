import { prisma } from "@/lib/prisma";
import { PageHeader } from "@/components/PageHeader";
import { EquipmentForm } from "@/components/EquipmentForm";

export const dynamic = "force-dynamic";

export default async function NewEquipmentPage() {
  const regulations = await prisma.maintenanceRegulation.findMany();

  return (
    <div>
      <PageHeader title="Добавить оборудование" description="Новая карточка в реестре" />
      <div className="card max-w-2xl">
        <EquipmentForm regulations={regulations} />
      </div>
    </div>
  );
}
