import { PageHeader } from "@/components/PageHeader";
import { Badge } from "@/components/Badge";
import { getPurchaseNeeds } from "@/lib/services/reports";
import { CRITICALITY_LABELS } from "@/lib/constants";

export const dynamic = "force-dynamic";

export default async function WarehouseReport() {
  const items = await getPurchaseNeeds();

  return (
    <div>
      <PageHeader
        title="Склад и закупочная потребность"
        description="Позиции ниже точки заказа с расчётом потребности"
      />
      <div className="table-wrap">
        <table className="data-table">
          <thead>
            <tr>
              <th>Наименование</th>
              <th>Категория</th>
              <th>Остаток</th>
              <th>Мин. остаток</th>
              <th>Точка заказа</th>
              <th>Авар. резерв</th>
              <th>Критичность</th>
              <th>Нужно купить</th>
            </tr>
          </thead>
          <tbody>
            {items.map((item) => (
              <tr key={item.id}>
                <td className="font-medium">{item.name}</td>
                <td>{item.category}</td>
                <td className={item.quantity === 0 ? "font-bold text-red-600" : ""}>
                  {item.quantity}
                </td>
                <td>{item.minQuantity}</td>
                <td>{item.reorderPoint}</td>
                <td>{item.emergencyReserve}</td>
                <td><Badge value={item.criticality} label={CRITICALITY_LABELS[item.criticality]} /></td>
                <td className="font-semibold text-brand-700">{item.needToBuy}</td>
              </tr>
            ))}
            {items.length === 0 && (
              <tr><td colSpan={8} className="py-8 text-center text-green-600">Все позиции в норме</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
