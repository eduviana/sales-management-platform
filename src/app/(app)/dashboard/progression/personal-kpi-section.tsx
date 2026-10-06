import { formatDate } from "@/shared/presentation/format";
import type { ProgressionEntry } from "@/modules/progression/presentation/progression-view-models";
import {
  getBreakdownDetails,
  TYPE_CONFIG,
  TYPE_ICONS,
  type ProgressionFilter,
} from "./progression-display";

interface PersonalKpiSectionProps {
  filter: ProgressionFilter;
  isMaxLevel: boolean;
  filteredTotal: number;
  threshold: number;
  targetPercentage: number;
  pointsToNextLevel: number;
  employeeJoinedAt: string;
  entries: ProgressionEntry[];
  summary: Record<string, number>;
}

/** Personal scope: points card + per-type breakdown cards. */
export function PersonalKpiSection({
  filter,
  isMaxLevel,
  filteredTotal,
  threshold,
  targetPercentage,
  pointsToNextLevel,
  employeeJoinedAt,
  entries,
  summary,
}: PersonalKpiSectionProps) {
  return (
    <section className="grid grid-cols-1 lg:grid-cols-12 gap-5">
      {/* Main card: Points */}
      <div className="lg:col-span-4 bg-surface-container border border-outline-variant rounded-2xl p-6 relative overflow-hidden flex flex-col justify-between">
        <div className="absolute -right-10 -bottom-10 w-44 h-44 bg-[#00df81]/5 rounded-full blur-3xl pointer-events-none" />

        <div>
          <div className="flex items-center justify-between">
            <span className="text-[12px] font-semibold tracking-wider text-on-surface-variant uppercase">
              {filter === "all" ? "Puntos Totales" : "Puntos del Período"}
            </span>
            {filter !== "all" && filteredTotal > 0 && (
              <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[12px] font-semibold bg-[#00df81]/10 text-[#00df81] border border-[#00df81]/20">
                +{filteredTotal} pts logrados
              </span>
            )}
          </div>
          <div className="mt-4 flex items-baseline gap-3">
            <span className="text-5xl font-extrabold text-on-surface tracking-tight">
              {filteredTotal}
            </span>
            {!isMaxLevel && filter !== "all" && (
              <span className="text-sm font-medium text-zinc-500">/ {threshold} pts objetivo</span>
            )}
          </div>
        </div>

        {!isMaxLevel && filter !== "all" ? (
          <div className="mt-6 pt-5 border-t border-outline-variant/80">
            <div className="flex justify-between items-center text-xs mb-2">
              <span className="text-on-surface-variant">Avance de meta</span>
              <span className="font-semibold text-on-surface">{targetPercentage.toFixed(1)}%</span>
            </div>
            <div className="w-full bg-surface-container-high h-2 rounded-full overflow-hidden">
              <div
                className="bg-gradient-to-r from-[#00df81] to-[#00b96b] h-full rounded-full transition-all duration-500"
                style={{ width: `${targetPercentage}%` }}
              />
            </div>
            <div className="flex justify-between items-center mt-3 text-[11px] text-zinc-500">
              <span>
                Desde:{" "}
                <strong className="text-on-surface-variant font-medium">
                  {formatDate(employeeJoinedAt)}
                </strong>
              </span>
              <span>
                Restan:{" "}
                <strong className="text-on-surface font-medium">{pointsToNextLevel} pts</strong>
              </span>
            </div>
          </div>
        ) : (
          <div className="mt-6 pt-5 border-t border-outline-variant/80">
            <div className="text-[11px] text-zinc-500">
              {isMaxLevel ? (
                <strong className="text-on-surface-variant font-medium">Nivel máximo alcanzado</strong>
              ) : (
                <>
                  Desde:{" "}
                  <strong className="text-on-surface-variant font-medium">
                    {formatDate(employeeJoinedAt)}
                  </strong>
                </>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Breakdown cards */}
      <div className="lg:col-span-8 grid grid-cols-1 sm:grid-cols-2 gap-4">
        {(["VISIT", "SALE", "SENIORITY", "TARGET"] as const).map((type) => {
          const config = TYPE_CONFIG[type];
          const Icon = TYPE_ICONS[type];
          const details = getBreakdownDetails(type, entries);
          return (
            <div
              key={type}
              className="bg-surface-container border border-outline-variant hover:border-zinc-700/60 rounded-2xl p-5 flex flex-col justify-between transition-all"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className={`p-2 rounded-lg ${config.iconBg} ${config.iconText}`}>
                    <Icon size={16} />
                  </div>
                  <span className="text-sm font-semibold text-on-surface">{config.label}</span>
                </div>
                <span
                  className={`px-2 py-0.5 rounded-full text-[12px] font-bold ${config.bg} ${config.text} border ${config.border}`}
                >
                  {summary[type]} pts
                </span>
              </div>
              <div className="mt-4 flex items-center justify-between text-sm">
                <span className="text-on-surface-variant">{details.main}</span>
                <span className="text-zinc-500">{details.sub}</span>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
