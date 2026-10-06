/**
 * Shared display constants and pure helpers for the progression detail view.
 *
 * Extracted from ProgressionClient so the view components can stay focused on
 * markup. Contains no data access and no business rules.
 */

import { Clock, MapPin, Sparkles, TrendingUp } from "lucide-react";
import type {
  ProgressionEntry,
  TeamHistoryStatus,
} from "@/modules/progression/presentation/progression-view-models";

export type ProgressionFilter = "current" | "all" | "specific";

/** Visual metadata per progression entry type. */
export const TYPE_CONFIG: Record<
  string,
  {
    label: string;
    bg: string;
    text: string;
    border: string;
    iconBg: string;
    iconText: string;
  }
> = {
  SENIORITY: {
    label: "Antigüedad",
    bg: "bg-primary/10",
    text: "text-primary",
    border: "border-primary/20",
    iconBg: "bg-primary/10",
    iconText: "text-primary",
  },
  VISIT: {
    label: "Visitas",
    bg: "bg-[#00df81]/10",
    text: "text-[#00df81]",
    border: "border-[#00df81]/20",
    iconBg: "bg-[#00df81]/10",
    iconText: "text-[#00df81]",
  },
  SALE: {
    label: "Ventas",
    bg: "bg-tertiary/15",
    text: "text-tertiary",
    border: "border-tertiary/30",
    iconBg: "bg-tertiary/10",
    iconText: "text-tertiary",
  },
  TARGET: {
    label: "Objetivo",
    bg: "bg-[#c084fc]/10",
    text: "text-[#c084fc]",
    border: "border-[#c084fc]/20",
    iconBg: "bg-[#c084fc]/10",
    iconText: "text-[#c084fc]",
  },
};

/** Icon per progression entry type. */
export const TYPE_ICONS: Record<string, typeof MapPin> = {
  SENIORITY: Clock,
  VISIT: MapPin,
  SALE: TrendingUp,
  TARGET: Sparkles,
};

/** Status label + color per status in the team history table. */
export const HISTORY_STATUS: Record<
  TeamHistoryStatus,
  { label: string; text: string }
> = {
  NO_SALE: { label: "Sin venta", text: "text-on-surface-variant" },
  VISIT_CANCELLED: { label: "Cancelada", text: "text-zinc-500" },
  SALE_PENDING: {
    label: "Venta pendiente de aprobación",
    text: "text-amber-400",
  },
  SALE_APPROVED: { label: "Venta aprobada", text: "text-[#00df81]" },
  SALE_REJECTED: { label: "Venta rechazada", text: "text-red-400" },
  SALE_CANCELLED: { label: "Venta cancelada", text: "text-zinc-500" },
};

/** Distinct `YYYY-MM` keys present in the given dated records, newest first. */
export function getAvailableMonths(entries: Array<{ date: string }>): string[] {
  const months = new Set<string>();
  for (const entry of entries) {
    const d = new Date(entry.date);
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
    months.add(key);
  }
  return Array.from(months).sort().reverse();
}

/** Human-readable breakdown label/detail for a progression entry type. */
export function getBreakdownDetails(
  type: string,
  entries: ProgressionEntry[],
): { main: string; sub: string } {
  const typeEntries = entries.filter((e) => e.type === type);
  const count = typeEntries.length;
  const points = typeEntries.reduce((sum, e) => sum + e.points, 0);

  switch (type) {
    case "VISIT":
      return {
        main: `${count} visita${count !== 1 ? "s" : ""} registrada${count !== 1 ? "s" : ""}`,
        sub: "2 pts c/u",
      };
    case "SALE": {
      const lastSale = typeEntries[typeEntries.length - 1];
      const saleNum = lastSale?.description.match(/VT-\d+/)?.[0] ?? "";
      return {
        main: `${count} venta${count !== 1 ? "s" : ""} aprobada${count !== 1 ? "s" : ""}`,
        sub: saleNum || `${points} pts`,
      };
    }
    case "SENIORITY":
      return {
        main: points > 0 ? `${count} mes${count !== 1 ? "es" : ""}` : "Sin antigüedad",
        sub: points > 0 ? "1 pt/mes" : "Próxima suma",
      };
    case "TARGET":
      return {
        main: count > 0 ? `${count} objetivo${count !== 1 ? "s" : ""}` : "Bono por cumplimiento",
        sub: count > 0 ? "10 pts c/u" : "Pendiente",
      };
    default:
      return { main: "", sub: "" };
  }
}

/** Whether a record date belongs to the selected period. */
export function matchesFilter(
  dateStr: string,
  filter: ProgressionFilter,
  selectedMonth: string,
): boolean {
  if (filter === "all") return true;
  const d = new Date(dateStr);
  const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
  if (filter === "current") {
    const now = new Date();
    const currentMonthKey = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
    return key === currentMonthKey;
  }
  return selectedMonth ? key === selectedMonth : true;
}
