import { cn, statusBadgeColor } from "@/lib/utils";

export function Badge({ value, label }: { value: string; label?: string }) {
  return (
    <span className={cn("badge", statusBadgeColor(value))}>
      {label ?? value}
    </span>
  );
}
