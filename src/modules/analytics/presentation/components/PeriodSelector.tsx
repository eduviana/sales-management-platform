/**
 * PeriodSelector — Time period tabs for the dashboard.
 *
 * Client Component for interactivity. Triggers period change via callback.
 *
 * Reference: design/stitch/code.html
 */

"use client";

import type { DashboardPeriod } from "../../domain";

interface PeriodSelectorProps {
  activePeriod: DashboardPeriod;
  onPeriodChange: (period: DashboardPeriod) => void;
}

const PERIODS: Array<{ value: DashboardPeriod; label: string }> = [
  { value: "today", label: "Hoy" },
  { value: "week", label: "Esta Semana" },
  { value: "month", label: "Este Mes" },
];

export function PeriodSelector({ activePeriod, onPeriodChange }: PeriodSelectorProps) {
  return (
    <div className="flex items-center gap-4">
      {PERIODS.map((period) => (
        <button
          key={period.value}
          onClick={() => onPeriodChange(period.value)}
          className={`px-2 py-1 rounded transition-colors cursor-pointer active:scale-95 duration-150 ${
            activePeriod === period.value
              ? "text-primary font-bold border-b-2 border-primary pb-1"
              : "text-on-surface-variant hover:bg-surface-container-high"
          }`}
        >
          {period.label}
        </button>
      ))}
    </div>
  );
}
