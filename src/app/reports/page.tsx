import Link from "next/link";
import { PageHeader } from "@/components/PageHeader";
import {
  AlertTriangle,
  Calendar,
  Package,
  ClipboardList,
} from "lucide-react";

const REPORTS = [
  {
    href: "/reports/overdue-works",
    title: "Просроченные работы",
    description: "Контроль сроков исполнения",
    icon: AlertTriangle,
  },
  {
    href: "/reports/overdue-maintenance",
    title: "Просроченное ТО",
    description: "Оборудование без актуального обслуживания",
    icon: Calendar,
  },
  {
    href: "/reports/warehouse",
    title: "Склад и закупки",
    description: "ЗИП ниже минимума, потребность к закупке",
    icon: Package,
  },
  {
    href: "/reports/kpi",
    title: "KPI направления",
    description: "Ключевые показатели инфраструктуры",
    icon: ClipboardList,
  },
];

export default function ReportsPage() {
  return (
    <div>
      <PageHeader
        title="Отчёты"
        description="Обязательная отчётность по концепции управления инфраструктурой"
      />
      <div className="grid gap-4 sm:grid-cols-2">
        {REPORTS.map(({ href, title, description, icon: Icon }) => (
          <Link key={href} href={href} className="card group hover:border-brand-300 hover:shadow-md transition-all">
            <div className="flex items-start gap-4">
              <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-brand-100 text-brand-700 group-hover:bg-brand-600 group-hover:text-white transition-colors">
                <Icon size={22} />
              </div>
              <div>
                <h2 className="font-semibold text-slate-900">{title}</h2>
                <p className="mt-1 text-sm text-slate-500">{description}</p>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
