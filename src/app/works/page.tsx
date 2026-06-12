import Link from "next/link";
import { Plus } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { PageHeader } from "@/components/PageHeader";
import { Badge } from "@/components/Badge";
import {
  SYSTEM_LABELS,
  WORK_TYPE_LABELS,
  WORK_STATUS_LABELS,
  PRIORITY_LABELS,
} from "@/lib/constants";
import { formatDate, isOverdue } from "@/lib/utils";

export const dynamic = "force-dynamic";

export default async function WorksPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string; type?: string }>;
}) {
  const params = await searchParams;
  const where: Record<string, unknown> = {};
  if (params.status) where.status = params.status;
  if (params.type) where.type = params.type;

  const works = await prisma.work.findMany({
    where,
    include: { equipment: true, assignee: true, leadSpecialist: true },
    orderBy: [{ plannedDate: "asc" }],
  });

  return (
    <div>
      <PageHeader
        title="Работы инфраструктуры"
        description="Внутренний производственный журнал — не дублирует Service Desk"
        actions={
          <Link href="/works/new" className="btn-primary">
            <Plus size={16} />
            Новая работа
          </Link>
        }
      />

      <form className="card mb-6 flex flex-wrap gap-3">
        <select name="type" defaultValue={params.type ?? ""} className="input max-w-[200px]">
          <option value="">Все типы</option>
          {Object.entries(WORK_TYPE_LABELS).map(([k, v]) => (
            <option key={k} value={k}>{v}</option>
          ))}
        </select>
        <select name="status" defaultValue={params.status ?? ""} className="input max-w-[220px]">
          <option value="">Все статусы</option>
          {Object.entries(WORK_STATUS_LABELS).map(([k, v]) => (
            <option key={k} value={k}>{v}</option>
          ))}
        </select>
        <button type="submit" className="btn-secondary">Фильтр</button>
      </form>

      <div className="table-wrap">
        <table className="data-table">
          <thead>
            <tr>
              <th>Номер</th>
              <th>Тип</th>
              <th>Заголовок</th>
              <th>Система</th>
              <th>Приоритет</th>
              <th>Статус</th>
              <th>План</th>
              <th>Исполнитель</th>
              <th>SD</th>
            </tr>
          </thead>
          <tbody>
            {works.map((w) => {
              const overdue = isOverdue(w.plannedDate) && !["CLOSED", "CANCELLED", "DONE"].includes(w.status);
              return (
                <tr key={w.id} className={overdue ? "bg-red-50/50" : ""}>
                  <td>
                    <Link href={`/works/${w.id}`} className="font-mono text-brand-700 hover:underline">
                      {w.number}
                    </Link>
                  </td>
                  <td>{WORK_TYPE_LABELS[w.type]}</td>
                  <td className="max-w-[240px] truncate font-medium">{w.title}</td>
                  <td>{SYSTEM_LABELS[w.system]}</td>
                  <td><Badge value={w.priority} label={PRIORITY_LABELS[w.priority]} /></td>
                  <td><Badge value={w.status} label={WORK_STATUS_LABELS[w.status]} /></td>
                  <td className={overdue ? "font-medium text-red-600" : ""}>
                    {formatDate(w.plannedDate)}
                  </td>
                  <td>{w.assignee?.name ?? "—"}</td>
                  <td>{w.serviceDeskTicket ?? "—"}</td>
                </tr>
              );
            })}
            {works.length === 0 && (
              <tr>
                <td colSpan={9} className="py-8 text-center text-slate-500">
                  Работы не найдены
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
