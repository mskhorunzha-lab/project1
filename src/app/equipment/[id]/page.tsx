import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { PageHeader } from "@/components/PageHeader";
import { Badge } from "@/components/Badge";
import {
  SYSTEM_LABELS,
  TYPE_LABELS,
  STATUS_LABELS,
  CRITICALITY_LABELS,
  WORK_TYPE_LABELS,
  WORK_STATUS_LABELS,
} from "@/lib/constants";
import { formatDate, formatDateTime } from "@/lib/utils";

export const dynamic = "force-dynamic";

export default async function EquipmentDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const equipment = await prisma.equipment.findUnique({
    where: { id },
    include: {
      regulation: true,
      upsDetails: true,
      acsDetails: true,
      works: { orderBy: { createdAt: "desc" }, take: 20 },
      movements: {
        include: { item: true },
        orderBy: { date: "desc" },
        take: 10,
      },
    },
  });

  if (!equipment) notFound();

  return (
    <div>
      <PageHeader
        title={equipment.name}
        description={`${SYSTEM_LABELS[equipment.system]} · ${equipment.location}`}
        actions={
          <Link href={`/works/new?equipmentId=${equipment.id}`} className="btn-primary">
            Создать работу
          </Link>
        }
      />

      <div className="mb-6 grid gap-4 lg:grid-cols-3">
        <div className="card lg:col-span-2">
          <h2 className="mb-4 font-semibold">Карточка оборудования</h2>
          <dl className="grid gap-3 sm:grid-cols-2 text-sm">
            <div><dt className="text-slate-500">ID</dt><dd className="font-mono">{equipment.externalId ?? equipment.id}</dd></div>
            <div><dt className="text-slate-500">Тип</dt><dd>{TYPE_LABELS[equipment.type]}</dd></div>
            <div><dt className="text-slate-500">Производитель / модель</dt><dd>{equipment.manufacturer ?? "—"} {equipment.model ?? ""}</dd></div>
            <div><dt className="text-slate-500">Серийный номер</dt><dd>{equipment.serialNumber ?? "—"}</dd></div>
            <div><dt className="text-slate-500">Состояние</dt><dd><Badge value={equipment.status} label={STATUS_LABELS[equipment.status]} /></dd></div>
            <div><dt className="text-slate-500">Критичность</dt><dd><Badge value={equipment.criticality} label={CRITICALITY_LABELS[equipment.criticality]} /></dd></div>
            <div><dt className="text-slate-500">Регламент ТО</dt><dd>{equipment.regulation?.name ?? "—"}</dd></div>
            <div><dt className="text-slate-500">Последнее ТО</dt><dd>{formatDate(equipment.lastMaintenance)}</dd></div>
            <div><dt className="text-slate-500">Следующее ТО</dt><dd>{formatDate(equipment.nextMaintenance)}</dd></div>
            <div><dt className="text-slate-500">Гарантия до</dt><dd>{formatDate(equipment.warrantyUntil)}</dd></div>
            {equipment.qrCode && (
              <div><dt className="text-slate-500">QR-код</dt><dd className="font-mono">{equipment.qrCode}</dd></div>
            )}
          </dl>
        </div>

        <div className="card">
          <h2 className="mb-4 font-semibold">Специфика</h2>
          {equipment.upsDetails && (
            <dl className="space-y-2 text-sm">
              <div><dt className="text-slate-500">Мощность</dt><dd>{equipment.upsDetails.powerVA ?? "—"} ВА</dd></div>
              <div><dt className="text-slate-500">Нагрузка</dt><dd>{equipment.upsDetails.loadPercent ?? "—"}%</dd></div>
              <div><dt className="text-slate-500">АКБ</dt><dd>{equipment.upsDetails.batteryType} × {equipment.upsDetails.batteryCount}</dd></div>
              <div><dt className="text-slate-500">Состояние АКБ</dt><dd>{equipment.upsDetails.batteryStatus ?? "—"}</dd></div>
            </dl>
          )}
          {equipment.acsDetails && (
            <dl className="space-y-2 text-sm">
              <div><dt className="text-slate-500">Считыватель</dt><dd>{equipment.acsDetails.readerModel ?? "—"}</dd></div>
              <div><dt className="text-slate-500">Замок</dt><dd>{equipment.acsDetails.lockType ?? "—"}</dd></div>
              <div><dt className="text-slate-500">Контроллер</dt><dd>{equipment.acsDetails.controller ?? "—"}</dd></div>
              <div><dt className="text-slate-500">Резервное питание</dt><dd>{equipment.acsDetails.batteryStatus ?? "—"}</dd></div>
            </dl>
          )}
          {!equipment.upsDetails && !equipment.acsDetails && (
            <p className="text-sm text-slate-500">Нет дополнительных полей</p>
          )}
        </div>
      </div>

      <section className="card mb-6">
        <h2 className="mb-4 font-semibold">История работ</h2>
        <div className="table-wrap border-0">
          <table className="data-table">
            <thead>
              <tr>
                <th>Номер</th>
                <th>Тип</th>
                <th>Статус</th>
                <th>План</th>
                <th>Service Desk</th>
              </tr>
            </thead>
            <tbody>
              {equipment.works.map((w) => (
                <tr key={w.id}>
                  <td>
                    <Link href={`/works/${w.id}`} className="text-brand-700 hover:underline">
                      {w.number}
                    </Link>
                  </td>
                  <td>{WORK_TYPE_LABELS[w.type]}</td>
                  <td><Badge value={w.status} label={WORK_STATUS_LABELS[w.status]} /></td>
                  <td>{formatDate(w.plannedDate)}</td>
                  <td>{w.serviceDeskTicket ?? "—"}</td>
                </tr>
              ))}
              {equipment.works.length === 0 && (
                <tr><td colSpan={5} className="text-center text-slate-500">Работ пока нет</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </section>

      <section className="card">
        <h2 className="mb-4 font-semibold">Движения ЗИП по объекту</h2>
        <div className="table-wrap border-0">
          <table className="data-table">
            <thead>
              <tr>
                <th>Дата</th>
                <th>ТМЦ</th>
                <th>Кол-во</th>
                <th>Тип</th>
              </tr>
            </thead>
            <tbody>
              {equipment.movements.map((m) => (
                <tr key={m.id}>
                  <td>{formatDateTime(m.date)}</td>
                  <td>{m.item.name}</td>
                  <td>{m.quantity}</td>
                  <td>{m.type}</td>
                </tr>
              ))}
              {equipment.movements.length === 0 && (
                <tr><td colSpan={4} className="text-center text-slate-500">Движений нет</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
