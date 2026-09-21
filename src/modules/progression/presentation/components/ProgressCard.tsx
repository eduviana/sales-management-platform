/**
 * ProgressCard — Displays an employee's progression toward the next level.
 *
 * Shows a progress bar with points breakdown.
 *
 * Reference: requirements.md §3.12
 */

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

export function ProgressCard({ progression }: { progression: EmployeeProgression }) {
  const { currentLevelId, currentPoints, pointsToNextLevel, percentage, breakdown } = progression;
  const isMaxLevel = currentLevelId === null || currentLevelId >= 7;

  const currentLevelName = currentLevelId ? LEVEL_NAMES[currentLevelId] ?? `N${currentLevelId}` : "ADMIN";
  const nextLevelName = currentLevelId ? LEVEL_NAMES[currentLevelId + 1] ?? `N${currentLevelId + 1}` : null;

  if (isMaxLevel) {
    return (
      <div className="bg-surface border border-outline-variant rounded-xl p-6">
        <h3 className="text-sm font-semibold text-on-surface-variant uppercase tracking-wider mb-3">
          Progreso
        </h3>
        <p className="text-on-surface text-sm">Nivel máximo alcanzado</p>
      </div>
    );
  }

  return (
    <div className="bg-surface border border-outline-variant rounded-xl p-6">
      <h3 className="text-sm font-semibold text-on-surface-variant uppercase tracking-wider mb-3">
        Progreso hacia {nextLevelName}
      </h3>

      {/* Progress bar */}
      <div className="mb-3">
        <div className="flex justify-between text-xs text-on-surface-variant mb-1">
          <span>{currentLevelName}</span>
          <span>{nextLevelName}</span>
        </div>
        <div className="w-full h-3 bg-surface-container-low rounded-full overflow-hidden">
          <div
            className="h-full bg-[#00df81] rounded-full transition-all duration-500"
            style={{ width: `${percentage}%` }}
          />
        </div>
        <div className="flex justify-between text-xs mt-1">
          <span className="text-on-surface-variant">{currentPoints} puntos</span>
          <span className="text-on-surface-variant">{pointsToNextLevel} restantes</span>
        </div>
      </div>

      {/* Percentage */}
      <div className="text-center mb-4">
        <span className="text-2xl font-bold text-on-surface">{percentage}%</span>
      </div>

      {/* Breakdown */}
      <div className="space-y-2 text-xs">
        <BreakdownRow label="Antigüedad" points={breakdown.seniorityPoints} />
        <BreakdownRow label="Visitas" points={breakdown.visitPoints} />
        <BreakdownRow label="Ventas" points={breakdown.salePoints} />
        <BreakdownRow label="Objetivos" points={breakdown.targetPoints} />
      </div>
    </div>
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
