import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { PageHeader } from "@/components/PageHeader";
import { Badge } from "@/components/Badge";
import { ChecklistForm } from "@/components/ChecklistForm";
import { WorkStatusForm } from "@/components/WorkStatusForm";
import {
  SYSTEM_LABELS,
  WORK_TYPE_LABELS,
  WORK_STATUS_LABELS,
  PRIORITY_LABELS,
  MOVEMENT_LABELS,
} from "@/lib/constants";
import { formatDate, formatDateTime } from "@/lib/utils";
import { getChecklistTypeForEquipment, CHECKLIST_TEMPLATES } from "@/lib/checklists";

export const dynamic = "force-dynamic";

export default async function WorkDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const work = await prisma.work.findUnique({
    where: { id },
    include: {
      equipment: true,
      assignee: true,
      leadSpecialist: true,
      checklist: true,
      materials: { include: { item: true } },
      movements: { include: { item: true } },
    },
  });

  if (!work) notFound();

  const checklistType = work.equipment
    ? getChecklistTypeForEquipment(work.equipment.system, work.type)
    : null;
  const checklistTemplate = checklistType
    ? CHECKLIST_TEMPLATES[checklistType]
    : null;

  return (
    <div>
      <PageHeader
        title={`${work.number} — ${work.title}`}
        description={work.category}
      />

      <div className="mb-6 grid gap-4 lg:grid-cols-3">
        <div className="card lg:col-span-2">
          <h2 className="mb-4 font-semibold">Карточка работы</h2>
          <dl className="grid gap-3 sm:grid-cols-2 text-sm">
            <div><dt className="text-slate-500">Тип</dt><dd>{WORK_TYPE_LABELS[work.type]}</dd></div>
            <div><dt className="text-slate-500">Система</dt><dd>{SYSTEM_LABELS[work.system]}</dd></div>
            <div><dt className="text-slate-500">Приоритет</dt><dd><Badge value={work.priority} label={PRIORITY_LABELS[work.priority]} /></dd></div>
            <div><dt className="text-slate-500">Статус</dt><dd><Badge value={work.status} label={WORK_STATUS_LABELS[work.status]} /></dd></div>
            <div><dt className="text-slate-500">Service Desk</dt><dd>{work.serviceDeskTicket ?? "—"}</dd></div>
            <div><dt className="text-slate-500">Оборудование</dt>
              <dd>
                {work.equipment ? (
                  <Link href={`/equipment/${work.equipment.id}`} className="text-brand-700 hover:underline">
                    {work.equipment.name}
                  </Link>
                ) : "—"}
              </dd>
            </div>
            <div><dt className="text-slate-500">Главный специалист</dt><dd>{work.leadSpecialist?.name ?? "—"}</dd></div>
            <div><dt className="text-slate-500">Исполнитель</dt><dd>{work.assignee?.name ?? "—"}</dd></div>
            <div><dt className="text-slate-500">Плановая дата</dt><dd>{formatDate(work.plannedDate)}</dd></div>
            <div><dt className="text-slate-500">Фактическая дата</dt><dd>{formatDate(work.actualDate)}</dd></div>
            {work.waitReason && (
              <div className="sm:col-span-2"><dt className="text-slate-500">Причина ожидания</dt><dd>{work.waitReason}</dd></div>
            )}
            <div className="sm:col-span-2"><dt className="text-slate-500">Описание</dt><dd>{work.description ?? "—"}</dd></div>
            {work.result && (
              <div className="sm:col-span-2"><dt className="text-slate-500">Результат</dt><dd>{work.result}</dd></div>
            )}
          </dl>
        </div>

        <div className="card">
          <h2 className="mb-4 font-semibold">Изменить статус</h2>
          <WorkStatusForm workId={work.id} currentStatus={work.status} />
        </div>
      </div>

      {checklistTemplate && (
        <section className="card mb-6">
          <h2 className="mb-4 font-semibold">{checklistTemplate.title}</h2>
          <ChecklistForm
            workId={work.id}
            template={checklistTemplate}
            existing={work.checklist}
          />
        </section>
      )}

      <section className="card mb-6">
        <h2 className="mb-4 font-semibold">Использованные материалы</h2>
        <div className="table-wrap border-0">
          <table className="data-table">
            <thead>
              <tr>
                <th>ТМЦ</th>
                <th>Кол-во</th>
                <th>Примечание</th>
              </tr>
            </thead>
            <tbody>
              {work.materials.map((m) => (
                <tr key={m.id}>
                  <td>{m.item.name}</td>
                  <td>{m.quantity} {m.item.unit}</td>
                  <td>{m.notes ?? "—"}</td>
                </tr>
              ))}
              {work.movements.map((m) => (
                <tr key={m.id}>
                  <td>{m.item.name}</td>
                  <td>{m.quantity}</td>
                  <td>{MOVEMENT_LABELS[m.type] ?? m.type}</td>
                </tr>
              ))}
              {work.materials.length === 0 && work.movements.length === 0 && (
                <tr><td colSpan={3} className="text-center text-slate-500">Материалы не списаны</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
