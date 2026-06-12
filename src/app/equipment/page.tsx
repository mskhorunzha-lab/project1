import Link from "next/link";
import { Plus } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { PageHeader } from "@/components/PageHeader";
import { Badge } from "@/components/Badge";
import {
  SYSTEM_LABELS,
  TYPE_LABELS,
  STATUS_LABELS,
  CRITICALITY_LABELS,
} from "@/lib/constants";
import { formatDate } from "@/lib/utils";

export const dynamic = "force-dynamic";

export default async function EquipmentPage({
  searchParams,
}: {
  searchParams: Promise<{ system?: string; status?: string; q?: string }>;
}) {
  const params = await searchParams;
  const where: Record<string, unknown> = {};

  if (params.system) where.system = params.system;
  if (params.status) where.status = params.status;
  if (params.q) {
    where.OR = [
      { name: { contains: params.q, mode: "insensitive" } },
      { location: { contains: params.q, mode: "insensitive" } },
      { externalId: { contains: params.q, mode: "insensitive" } },
      { serialNumber: { contains: params.q, mode: "insensitive" } },
    ];
  }

  const items = await prisma.equipment.findMany({
    where,
    include: { regulation: true },
    orderBy: [{ criticality: "asc" }, { name: "asc" }],
  });

  return (
    <div>
      <PageHeader
        title="Реестр оборудования"
        description="Единый источник данных по объектам инфраструктуры"
        actions={
          <Link href="/equipment/new" className="btn-primary">
            <Plus size={16} />
            Добавить
          </Link>
        }
      />

      <form className="card mb-6 flex flex-wrap gap-3">
        <input
          name="q"
          defaultValue={params.q}
          placeholder="Поиск по названию, месту, ID..."
          className="input max-w-xs"
        />
        <select name="system" defaultValue={params.system ?? ""} className="input max-w-[200px]">
          <option value="">Все системы</option>
          {Object.entries(SYSTEM_LABELS).map(([k, v]) => (
            <option key={k} value={k}>{v}</option>
          ))}
        </select>
        <select name="status" defaultValue={params.status ?? ""} className="input max-w-[200px]">
          <option value="">Все состояния</option>
          {Object.entries(STATUS_LABELS).map(([k, v]) => (
            <option key={k} value={k}>{v}</option>
          ))}
        </select>
        <button type="submit" className="btn-secondary">Фильтр</button>
      </form>

      <div className="table-wrap">
        <table className="data-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Наименование</th>
              <th>Система</th>
              <th>Тип</th>
              <th>Место</th>
              <th>Состояние</th>
              <th>Критичность</th>
              <th>След. ТО</th>
            </tr>
          </thead>
          <tbody>
            {items.map((eq) => (
              <tr key={eq.id}>
                <td>
                  <Link href={`/equipment/${eq.id}`} className="font-mono text-brand-700 hover:underline">
                    {eq.externalId ?? eq.id.slice(0, 8)}
                  </Link>
                </td>
                <td className="font-medium">{eq.name}</td>
                <td>{SYSTEM_LABELS[eq.system]}</td>
                <td>{TYPE_LABELS[eq.type]}</td>
                <td>{eq.location}</td>
                <td>
                  <Badge value={eq.status} label={STATUS_LABELS[eq.status]} />
                </td>
                <td>
                  <Badge value={eq.criticality} label={CRITICALITY_LABELS[eq.criticality]} />
                </td>
                <td>{formatDate(eq.nextMaintenance)}</td>
              </tr>
            ))}
            {items.length === 0 && (
              <tr>
                <td colSpan={8} className="py-8 text-center text-slate-500">
                  Оборудование не найдено. Импортируйте данные или добавьте вручную.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
