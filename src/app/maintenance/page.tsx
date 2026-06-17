import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { PageHeader } from "@/components/PageHeader";
import { Badge } from "@/components/Badge";
import {
  SYSTEM_LABELS,
  WORK_STATUS_LABELS,
} from "@/lib/constants";
import { formatDate, isOverdue } from "@/lib/utils";

export const dynamic = "force-dynamic";

export default async function MaintenancePage() {
  const [regulations, maintenanceWorks, equipmentDue] = await Promise.all([
    prisma.maintenanceRegulation.findMany({ include: { _count: { select: { equipment: true } } } }),
    prisma.work.findMany({
      where: { type: "MAINTENANCE" },
      include: { equipment: true, assignee: true },
      orderBy: { plannedDate: "asc" },
    }),
    prisma.equipment.findMany({
      where: {
        regulationId: { not: null },
        status: { not: "DECOMMISSIONED" },
      },
      include: { regulation: true },
      orderBy: { nextMaintenance: "asc" },
    }),
  ]);

  return (
    <div>
      <PageHeader
        title="Плановое ТО"
        description="Графики обслуживания, автосоздание задач, чек-листы"
        actions={
          <form action="/maintenance/generate" method="post">
            <button type="submit" className="btn-primary">
              Создать задачи ТО
            </button>
          </form>
        }
      />

      <section className="card mb-6">
        <h2 className="mb-4 font-semibold">Регламенты</h2>
        <div className="grid gap-3 sm:grid-cols-2">
          {regulations.map((r) => (
            <div key={r.id} className="rounded-lg border border-slate-100 p-4">
              <p className="font-medium">{r.name}</p>
              <p className="mt-1 text-sm text-slate-500">
                {SYSTEM_LABELS[r.system]} · каждые {r.intervalDays} дн. · {r._count.equipment} объектов
              </p>
            </div>
          ))}
        </div>
      </section>

      <section className="card mb-6">
        <h2 className="mb-4 font-semibold">Задачи ТО</h2>
        <div className="table-wrap border-0">
          <table className="data-table">
            <thead>
              <tr>
                <th>Номер</th>
                <th>Оборудование</th>
                <th>Статус</th>
                <th>План</th>
                <th>Исполнитель</th>
              </tr>
            </thead>
            <tbody>
              {maintenanceWorks.map((w) => {
                const overdue = isOverdue(w.plannedDate) && !["CLOSED", "CANCELLED"].includes(w.status);
                return (
                  <tr key={w.id} className={overdue ? "bg-red-50/50" : ""}>
                    <td>
                      <Link href={`/works/${w.id}`} className="text-brand-700 hover:underline">
                        {w.number}
                      </Link>
                    </td>
                    <td>{w.equipment?.name ?? "—"}</td>
                    <td><Badge value={w.status} label={WORK_STATUS_LABELS[w.status]} /></td>
                    <td className={overdue ? "text-red-600 font-medium" : ""}>
                      {formatDate(w.plannedDate)}
                    </td>
                    <td>{w.assignee?.name ?? "—"}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </section>

      <section className="card">
        <h2 className="mb-4 font-semibold">График по оборудованию</h2>
        <div className="table-wrap border-0">
          <table className="data-table">
            <thead>
              <tr>
                <th>Оборудование</th>
                <th>Регламент</th>
                <th>Последнее ТО</th>
                <th>Следующее ТО</th>
              </tr>
            </thead>
            <tbody>
              {equipmentDue.map((eq) => {
                const overdue = eq.nextMaintenance && isOverdue(eq.nextMaintenance);
                return (
                  <tr key={eq.id} className={overdue ? "bg-amber-50/50" : ""}>
                    <td>
                      <Link href={`/equipment/${eq.id}`} className="text-brand-700 hover:underline">
                        {eq.name}
                      </Link>
                    </td>
                    <td>{eq.regulation?.name ?? "—"}</td>
                    <td>{formatDate(eq.lastMaintenance)}</td>
                    <td className={overdue ? "font-medium text-amber-700" : ""}>
                      {formatDate(eq.nextMaintenance)}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
