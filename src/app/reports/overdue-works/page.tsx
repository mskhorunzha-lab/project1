import Link from "next/link";
import { PageHeader } from "@/components/PageHeader";
import { Badge } from "@/components/Badge";
import { getOverdueWorks } from "@/lib/services/reports";
import {
  SYSTEM_LABELS,
  WORK_TYPE_LABELS,
  WORK_STATUS_LABELS,
  PRIORITY_LABELS,
} from "@/lib/constants";
import { formatDate } from "@/lib/utils";

export const dynamic = "force-dynamic";

export default async function OverdueWorksReport() {
  const works = await getOverdueWorks();

  return (
    <div>
      <PageHeader title="Просроченные работы" description="Работы с истёкшим плановым сроком" />
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
              <th>Причина ожидания</th>
            </tr>
          </thead>
          <tbody>
            {works.map((w) => (
              <tr key={w.id}>
                <td>
                  <Link href={`/works/${w.id}`} className="text-brand-700 hover:underline">
                    {w.number}
                  </Link>
                </td>
                <td>{WORK_TYPE_LABELS[w.type]}</td>
                <td>{w.title}</td>
                <td>{SYSTEM_LABELS[w.system]}</td>
                <td><Badge value={w.priority} label={PRIORITY_LABELS[w.priority]} /></td>
                <td><Badge value={w.status} label={WORK_STATUS_LABELS[w.status]} /></td>
                <td className="font-medium text-red-600">{formatDate(w.plannedDate)}</td>
                <td>{w.assignee?.name ?? "—"}</td>
                <td>{w.waitReason ?? "—"}</td>
              </tr>
            ))}
            {works.length === 0 && (
              <tr><td colSpan={9} className="py-8 text-center text-green-600">Просроченных работ нет</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
