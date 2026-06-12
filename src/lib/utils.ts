import { format, isBefore, startOfDay } from "date-fns";
import { ru } from "date-fns/locale";

export function formatDate(date: Date | string | null | undefined): string {
  if (!date) return "—";
  const d = typeof date === "string" ? new Date(date) : date;
  return format(d, "dd.MM.yyyy", { locale: ru });
}

export function formatDateTime(date: Date | string | null | undefined): string {
  if (!date) return "—";
  const d = typeof date === "string" ? new Date(date) : date;
  return format(d, "dd.MM.yyyy HH:mm", { locale: ru });
}

export function isOverdue(plannedDate: Date | string): boolean {
  const d = typeof plannedDate === "string" ? new Date(plannedDate) : plannedDate;
  return isBefore(startOfDay(d), startOfDay(new Date()));
}

export function generateWorkNumber(seq: number): string {
  const year = new Date().getFullYear();
  return `WRK-${year}-${String(seq).padStart(5, "0")}`;
}

export function cn(...classes: (string | false | undefined | null)[]): string {
  return classes.filter(Boolean).join(" ");
}

export function statusBadgeColor(status: string): string {
  const map: Record<string, string> = {
    OK: "bg-green-100 text-green-800",
    FAULTY: "bg-red-100 text-red-800",
    LIMITED: "bg-yellow-100 text-yellow-800",
    DECOMMISSIONED: "bg-gray-100 text-gray-600",
    NEW: "bg-blue-100 text-blue-800",
    ASSIGNED: "bg-indigo-100 text-indigo-800",
    IN_PROGRESS: "bg-cyan-100 text-cyan-800",
    WAITING_ACCESS: "bg-orange-100 text-orange-800",
    WAITING_MATERIALS: "bg-orange-100 text-orange-800",
    WAITING_CONTRACTOR: "bg-orange-100 text-orange-800",
    WAITING_APPROVAL: "bg-orange-100 text-orange-800",
    DONE: "bg-teal-100 text-teal-800",
    ON_REVIEW: "bg-purple-100 text-purple-800",
    CLOSED: "bg-green-100 text-green-800",
    CANCELLED: "bg-gray-100 text-gray-600",
    P1: "bg-red-100 text-red-800",
    P2: "bg-orange-100 text-orange-800",
    P3: "bg-yellow-100 text-yellow-800",
    P4: "bg-gray-100 text-gray-700",
    PLANNED: "bg-blue-100 text-blue-800",
    HIGH: "bg-red-100 text-red-800",
    MEDIUM: "bg-yellow-100 text-yellow-800",
    LOW: "bg-green-100 text-green-800",
  };
  return map[status] ?? "bg-gray-100 text-gray-700";
}
