/**
 * ProgressCard — Displays an employee's progression toward the next level.
 *
 * Shows a progress bar with points breakdown.
 *
 * Visual reference: design/stitch/DESIGN.md
 * Reference: requirements.md §3.12
 */

import { TrendingUp } from "lucide-react";
import type { EmployeeProgression } from "../../domain";

const LEVEL_NAMES: Record<number, string> = {
  1: "N1",
  2: "N2",
  3: "N3",
  4: "N4",
  5: "N5",
  6: "N6",
  7: "N7",
};

export function ProgressCard({
  progression,
  className = "",
}: {
  progression: EmployeeProgression;
  className?: string;
}) {
  const { currentLevelId, currentPoints, pointsToNextLevel, percentage, breakdown } = progression;
  const isMaxLevel = currentLevelId === null || currentLevelId >= 7;

  const currentLevelName = currentLevelId ? LEVEL_NAMES[currentLevelId] ?? `N${currentLevelId}` : "ADMIN";
  const nextLevelName = currentLevelId ? LEVEL_NAMES[currentLevelId + 1] ?? `N${currentLevelId + 1}` : null;

  return (
    <section className={`bg-surface-container border border-outline-variant rounded-2xl p-7 flex flex-col ${className}`}>
      <div className="flex items-center gap-2.5 mb-6">
        <div className="p-2 rounded-lg bg-primary/10 text-sky-400">
          <TrendingUp className="w-4 h-4" aria-hidden="true" />
        </div>
        <h2 className="text-sm font-semibold text-on-surface uppercase tracking-wider">
          Progreso{nextLevelName ? ` hacia ${nextLevelName}` : ""}
        </h2>
      </div>

      {isMaxLevel ? (
        <p className="text-on-surface-variant text-sm">Nivel máximo alcanzado</p>
      ) : (
        <div>
          {/* Current vs. target level */}
          <div className="flex items-center justify-between text-xs font-semibold text-on-surface-variant mb-4">
            <div className="flex items-center gap-1.5">
              <span className="text-on-surface font-bold">Nivel Actual:</span>
              <span className="px-2 py-0.5 rounded bg-surface-container-high text-on-surface font-mono">
                {currentLevelName}
              </span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="text-on-surface-variant">Meta:</span>
              <span className="px-2 py-0.5 rounded bg-[#00df81]/10 text-[#00df81] font-mono font-bold">
                {nextLevelName}
              </span>
            </div>
          </div>

          {/* Progress bar */}
          <div className="mb-3">
            <div className="w-full h-3 bg-surface-container-low rounded-full overflow-hidden">
              <div
                className="h-full bg-[#00df81] rounded-full transition-all duration-500"
                style={{ width: `${percentage}%` }}
              />
            </div>
            <div className="flex justify-between text-xs mt-2">
              <span className="text-on-surface-variant">{currentPoints} puntos alcanzados</span>
              <span className="text-on-surface-variant">{pointsToNextLevel} restantes</span>
            </div>
          </div>

          {/* Percentage */}
          <div className="flex items-center justify-between mb-4">
            <span className="text-[10px] text-on-surface-variant uppercase tracking-wider">
              Cumplimiento total
            </span>
            <span className="text-2xl font-bold text-on-surface">{percentage}%</span>
          </div>

          {/* Breakdown */}
          <div className="space-y-2 text-xs">
            <BreakdownRow label="Antigüedad" points={breakdown.seniorityPoints} />
            <BreakdownRow label="Visitas a Clientes" points={breakdown.visitPoints} />
            <BreakdownRow label="Ventas Directas" points={breakdown.salePoints} />
            <BreakdownRow label="Objetivos Grupales" points={breakdown.targetPoints} />
          </div>
        </div>
      )}
    </section>
  );
}

function BreakdownRow({ label, points }: { label: string; points: number }) {
  return (
    <div className="flex justify-between items-center">
      <span className="text-on-surface-variant">{label}</span>
      <span className="text-on-surface font-medium">{points} pts</span>
    </div>
  );
}