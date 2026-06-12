import Link from "next/link";
import {
  AlertTriangle,
  Calendar,
  Package,
  Server,
  Wrench,
} from "lucide-react";
import { PageHeader } from "@/components/PageHeader";
import { StatCard } from "@/components/StatCard";
import { Badge } from "@/components/Badge";
import { getDashboardStats } from "@/lib/services/reports";
import {
  SYSTEM_LABELS,
  WORK_STATUS_LABELS,
  WORK_TYPE_LABELS,
} from "@/lib/constants";
import { formatDate } from "@/lib/utils";

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  let stats;
  try {
    stats = await getDashboardStats();
  } catch {
    return (
      <div>
        <PageHeader
          title="Дашборд"
          description="Портал инфраструктуры — пилот ИБП + СКУД + ЗИП"
        />
        <div className="card border-amber-200 bg-amber-50">
          <p className="font-medium text-amber-900">База данных не подключена</p>
          <p className="mt-2 text-sm text-amber-800">
            Запустите PostgreSQL (<code>docker compose up -d</code>), выполните{" "}
            <code>npm run db:push</code> и <code>npm run db:seed</code>.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div>
      <PageHeader
        title="Дашборд"
        description="Управляемый контур: ИБП, СКУД, критичный ЗИП, ТО, журнал работ"
        actions={
          <Link href="/maintenance/generate" className="btn-primary">
            Создать задачи ТО
          </Link>
        }
      />

      <div className="mb-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Оборудование"
          value={stats.equipmentTotal}
          subtitle={`${stats.equipmentFaulty} неисправно`}
          icon={Server}
        />
        <StatCard
          title="Просроченные работы"
          value={stats.worksOverdue}
          subtitle={`${stats.openWorks} открытых всего`}
          icon={Wrench}
          variant={stats.worksOverdue > 0 ? "danger" : "default"}
        />
        <StatCard
          title="Просроченное ТО"
          value={stats.maintenanceOverdue}
          subtitle={`${stats.maintenanceUpcoming} на месяц`}
          icon={Calendar}
          variant={stats.maintenanceOverdue > 0 ? "warning" : "default"}
        />
        <StatCard
          title="ЗИП ниже минимума"
          value={stats.lowStock}
          subtitle={`${stats.zeroStock} с нулевым остатком`}
          icon={Package}
          variant={stats.lowStock > 0 ? "warning" : "default"}
        />
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <section className="card">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="flex items-center gap-2 font-semibold text-slate-900">
              <AlertTriangle size={18} className="text-red-500" />
              Просроченные работы
            </h2>
            <Link href="/reports/overdue-works" className="text-sm text-brand-600 hover:underline">
              Все →
            </Link>
          </div>
          {stats.overdueWorks.length === 0 ? (
            <p className="text-sm text-slate-500">Просрочек нет</p>
          ) : (
            <ul className="space-y-3">
              {stats.overdueWorks.map((w) => (
                <li key={w.id} className="rounded-lg border border-slate-100 p-3">
                  <div className="flex items-start justify-between gap-2">
                    <Link href={`/works/${w.id}`} className="font-medium text-brand-700 hover:underline">
                      {w.number} — {w.title}
                    </Link>
                    <Badge value={w.status} label={WORK_STATUS_LABELS[w.status]} />
                  </div>
                  <p className="mt-1 text-xs text-slate-500">
                    {WORK_TYPE_LABELS[w.type]} · {SYSTEM_LABELS[w.system]} · план: {formatDate(w.plannedDate)}
                  </p>
                </li>
              ))}
            </ul>
          )}
        </section>

        <section className="card">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="flex items-center gap-2 font-semibold text-slate-900">
              <Calendar size={18} className="text-amber-500" />
              Просроченное ТО
            </h2>
            <Link href="/reports/overdue-maintenance" className="text-sm text-brand-600 hover:underline">
              Все →
            </Link>
          </div>
          {stats.overdueMaintenance.length === 0 ? (
            <p className="text-sm text-slate-500">Просрочек ТО нет</p>
          ) : (
            <ul className="space-y-3">
              {stats.overdueMaintenance.map((eq) => (
                <li key={eq.id} className="rounded-lg border border-slate-100 p-3">
                  <Link href={`/equipment/${eq.id}`} className="font-medium text-brand-700 hover:underline">
                    {eq.name}
                  </Link>
                  <p className="mt-1 text-xs text-slate-500">
                    {SYSTEM_LABELS[eq.system]} · {eq.location} · ТО: {formatDate(eq.nextMaintenance)}
                  </p>
                </li>
              ))}
            </ul>
          )}
        </section>

        <section className="card lg:col-span-2">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="font-semibold text-slate-900">ЗИП ниже минимального остатка</h2>
            <Link href="/reports/warehouse" className="text-sm text-brand-600 hover:underline">
              Отчёт по складу →
            </Link>
          </div>
          <div className="table-wrap">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Наименование</th>
                  <th>Остаток</th>
                  <th>Минимум</th>
                  <th>Дефицит</th>
                </tr>
              </thead>
              <tbody>
                {stats.lowStockItems.map((item) => (
                  <tr key={item.id}>
                    <td>{item.name}</td>
                    <td className="font-medium text-red-600">{item.quantity}</td>
                    <td>{item.minQuantity}</td>
                    <td>{Math.max(0, item.minQuantity - item.quantity)}</td>
                  </tr>
                ))}
                {stats.lowStockItems.length === 0 && (
                  <tr>
                    <td colSpan={4} className="text-center text-slate-500">
                      Все позиции в норме
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </section>
      </div>
    </div>
  );
}
