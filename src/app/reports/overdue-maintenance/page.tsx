import Link from "next/link";
import { PageHeader } from "@/components/PageHeader";
import { Badge } from "@/components/Badge";
import { getOverdueMaintenance } from "@/lib/services/reports";
import { SYSTEM_LABELS, STATUS_LABELS, CRITICALITY_LABELS } from "@/lib/constants";
import { formatDate } from "@/lib/utils";

export const dynamic = "force-dynamic";

export default async function OverdueMaintenanceReport() {
  const items = await getOverdueMaintenance();

  return (
    <div>
      <PageHeader title="Просроченное ТО" description="Оборудование с просроченной датой обслуживания" />
      <div className="table-wrap">
        <table className="data-table">
          <thead>
            <tr>
              <th>Оборудование</th>
              <th>Система</th>
              <th>Место</th>
              <th>Состояние</th>
              <th>Критичность</th>
              <th>Регламент</th>
              <th>Последнее ТО</th>
              <th>Следующее ТО</th>
            </tr>
          </thead>
          <tbody>
            {items.map((eq) => (
              <tr key={eq.id}>
                <td>
                  <Link href={`/equipment/${eq.id}`} className="font-medium text-brand-700 hover:underline">
                    {eq.name}
                  </Link>
                </td>
                <td>{SYSTEM_LABELS[eq.system]}</td>
                <td>{eq.location}</td>
                <td><Badge value={eq.status} label={STATUS_LABELS[eq.status]} /></td>
                <td><Badge value={eq.criticality} label={CRITICALITY_LABELS[eq.criticality]} /></td>
                <td>{eq.regulation?.name ?? "—"}</td>
                <td>{formatDate(eq.lastMaintenance)}</td>
                <td className="font-medium text-red-600">{formatDate(eq.nextMaintenance)}</td>
              </tr>
            ))}
            {items.length === 0 && (
              <tr><td colSpan={8} className="py-8 text-center text-green-600">Просроченного ТО нет</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
