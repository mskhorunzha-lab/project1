"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Server,
  Wrench,
  CalendarClock,
  Warehouse,
  FileBarChart,
  Upload,
  Settings,
} from "lucide-react";
import { cn } from "@/lib/utils";

const NAV = [
  { href: "/", label: "Дашборд", icon: LayoutDashboard },
  { href: "/equipment", label: "Оборудование", icon: Server },
  { href: "/works", label: "Работы", icon: Wrench },
  { href: "/maintenance", label: "ТО", icon: CalendarClock },
  { href: "/warehouse", label: "Склад", icon: Warehouse },
  { href: "/reports", label: "Отчёты", icon: FileBarChart },
  { href: "/import", label: "Импорт", icon: Upload },
  { href: "/admin", label: "Администрирование", icon: Settings },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="flex w-64 shrink-0 flex-col border-r border-slate-200 bg-brand-900 text-white">
      <div className="border-b border-white/10 p-5">
        <h1 className="text-lg font-semibold leading-tight">
          Портал инфраструктуры
        </h1>
        <p className="mt-1 text-xs text-blue-200">
          ИБП · СКУД · ЗИП · ТО
        </p>
      </div>
      <nav className="flex-1 space-y-1 p-3">
        {NAV.map(({ href, label, icon: Icon }) => {
          const active =
            href === "/" ? pathname === "/" : pathname.startsWith(href);
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm transition-colors",
                active
                  ? "bg-white/15 font-medium text-white"
                  : "text-blue-100 hover:bg-white/10 hover:text-white"
              )}
            >
              <Icon size={18} />
              {label}
            </Link>
          );
        })}
      </nav>
      <div className="border-t border-white/10 p-4 text-xs text-blue-200">
        MVP пилот · Модуль 9
      </div>
    </aside>
  );
}
