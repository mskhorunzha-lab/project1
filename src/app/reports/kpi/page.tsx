import { PageHeader } from "@/components/PageHeader";
import { StatCard } from "@/components/StatCard";
import { getDashboardStats } from "@/lib/services/reports";
import {
  AlertTriangle,
  Calendar,
  Package,
  Wrench,
  Server,
  ClipboardCheck,
} from "lucide-react";

export const dynamic = "force-dynamic";

export default async function KpiPage() {
  const stats = await getDashboardStats();

  return (
    <div>
      <PageHeader
        title="KPI направления инфраструктуры"
        description="Ключевые показатели по концепции управления"
      />
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <StatCard
          title="Просроченные задачи"
          value={stats.worksOverdue}
          icon={AlertTriangle}
          variant={stats.worksOverdue > 0 ? "danger" : "success"}
        />
        <StatCard
          title="Просроченное ТО"
          value={stats.maintenanceOverdue}
          icon={Calendar}
          variant={stats.maintenanceOverdue > 0 ? "warning" : "success"}
        />
        <StatCard
          title="Повторные неисправности"
          value="—"
          subtitle="Требует накопления истории"
          icon={Wrench}
        />
        <StatCard
          title="Работы без чек-листа"
          value={stats.worksWithoutChecklist}
          icon={ClipboardCheck}
          variant={stats.worksWithoutChecklist > 0 ? "warning" : "default"}
        />
        <StatCard
          title="ЗИП ниже минимума"
          value={stats.lowStock}
          icon={Package}
          variant={stats.lowStock > 0 ? "warning" : "success"}
        />
        <StatCard
          title="Оборудование в реестре"
          value={stats.equipmentTotal}
          subtitle={`${stats.equipmentFaulty} неисправно`}
          icon={Server}
        />
        <StatCard
          title="Открытые работы"
          value={stats.openWorks}
          icon={Wrench}
        />
        <StatCard
          title="ТО на месяц"
          value={stats.maintenanceUpcoming}
          icon={Calendar}
        />
        <StatCard
          title="Нулевой остаток ЗИП"
          value={stats.zeroStock}
          icon={Package}
          variant={stats.zeroStock > 0 ? "danger" : "success"}
        />
      </div>
    </div>
  );
}
