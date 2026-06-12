import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { PageHeader } from "@/components/PageHeader";
import { Badge } from "@/components/Badge";
import { CRITICALITY_LABELS, MOVEMENT_LABELS } from "@/lib/constants";
import { formatDateTime } from "@/lib/utils";

export const dynamic = "force-dynamic";

export default async function WarehousePage() {
  const [items, movements] = await Promise.all([
    prisma.warehouseItem.findMany({ orderBy: { name: "asc" } }),
    prisma.warehouseMovement.findMany({
      include: { item: true, work: true, equipment: true, takenBy: true },
      orderBy: { date: "desc" },
      take: 30,
    }),
  ]);

  return (
    <div>
      <PageHeader
        title="Склад ЗИП"
        description="Остатки, движения ТМЦ, контроль минимальных остатков"
        actions={
          <Link href="/warehouse/movement" className="btn-primary">
            Новое движение
          </Link>
        }
      />

      <section className="card mb-6">
        <h2 className="mb-4 font-semibold">Номенклатура</h2>
        <div className="table-wrap border-0">
          <table className="data-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Наименование</th>
                <th>Категория</th>
                <th>Место</th>
                <th>Остаток</th>
                <th>Мин.</th>
                <th>Точка заказа</th>
                <th>Авар. резерв</th>
                <th>Критичность</th>
              </tr>
            </thead>
            <tbody>
              {items.map((item) => {
                const low = item.quantity < item.minQuantity;
                const zero = item.quantity === 0;
                return (
                  <tr key={item.id} className={low ? "bg-amber-50/60" : ""}>
                    <td className="font-mono text-xs">{item.externalId ?? item.id.slice(0, 8)}</td>
                    <td className="font-medium">{item.name}</td>
                    <td>{item.category}</td>
                    <td>{item.storageLocation}</td>
                    <td className={zero ? "font-bold text-red-600" : low ? "font-medium text-amber-700" : ""}>
                      {item.quantity} {item.unit}
                    </td>
                    <td>{item.minQuantity}</td>
                    <td>{item.reorderPoint}</td>
                    <td>{item.emergencyReserve}</td>
                    <td><Badge value={item.criticality} label={CRITICALITY_LABELS[item.criticality]} /></td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </section>

      <section className="card">
        <h2 className="mb-4 font-semibold">Журнал движений ТМЦ</h2>
        <div className="table-wrap border-0">
          <table className="data-table">
            <thead>
              <tr>
                <th>Дата</th>
                <th>ТМЦ</th>
                <th>Кол-во</th>
                <th>Операция</th>
                <th>Основание</th>
                <th>Работа</th>
                <th>Оборудование</th>
                <th>Получил</th>
              </tr>
            </thead>
            <tbody>
              {movements.map((m) => (
                <tr key={m.id}>
                  <td>{formatDateTime(m.date)}</td>
                  <td>{m.item.name}</td>
                  <td>{m.quantity}</td>
                  <td>{MOVEMENT_LABELS[m.type] ?? m.type}</td>
                  <td>{m.basis ?? "—"}</td>
                  <td>
                    {m.work ? (
                      <Link href={`/works/${m.work.id}`} className="text-brand-700 hover:underline">
                        {m.work.number}
                      </Link>
                    ) : "—"}
                  </td>
                  <td>{m.equipment?.name ?? "—"}</td>
                  <td>{m.takenBy?.name ?? "—"}</td>
                </tr>
              ))}
              {movements.length === 0 && (
                <tr><td colSpan={8} className="text-center text-slate-500">Движений нет</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
