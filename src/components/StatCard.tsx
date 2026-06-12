import { cn } from "@/lib/utils";
import type { LucideIcon } from "lucide-react";

type Props = {
  title: string;
  value: number | string;
  subtitle?: string;
  icon: LucideIcon;
  variant?: "default" | "warning" | "danger" | "success";
};

const variants = {
  default: "bg-white border-slate-200",
  warning: "bg-amber-50 border-amber-200",
  danger: "bg-red-50 border-red-200",
  success: "bg-green-50 border-green-200",
};

const iconVariants = {
  default: "bg-brand-100 text-brand-700",
  warning: "bg-amber-100 text-amber-700",
  danger: "bg-red-100 text-red-700",
  success: "bg-green-100 text-green-700",
};

export function StatCard({
  title,
  value,
  subtitle,
  icon: Icon,
  variant = "default",
}: Props) {
  return (
    <div className={cn("card flex items-start gap-4", variants[variant])}>
      <div
        className={cn(
          "flex h-11 w-11 shrink-0 items-center justify-center rounded-lg",
          iconVariants[variant]
        )}
      >
        <Icon size={22} />
      </div>
      <div>
        <p className="text-sm text-slate-600">{title}</p>
        <p className="mt-1 text-2xl font-bold text-slate-900">{value}</p>
        {subtitle && (
          <p className="mt-1 text-xs text-slate-500">{subtitle}</p>
        )}
      </div>
    </div>
  );
}
