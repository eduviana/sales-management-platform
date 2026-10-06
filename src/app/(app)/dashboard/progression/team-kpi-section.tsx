import { Banknote, MapPin, Percent, TrendingUp } from "lucide-react";
import { formatCurrency } from "@/shared/presentation/format";
import type { TeamTarget } from "@/modules/progression/presentation/progression-view-models";

interface TeamKpiSectionProps {
  teamMemberCount: number;
  teamTarget?: TeamTarget;
  assignedVisits: number;
  pendingVisits: number;
  completedVisits: number;
  approvedSales: number;
  pendingReviewSales: number;
  rejectedSales: number;
  conversionRate: number;
  commissionTotal: number;
  commissionCount: number;
}

/** Team scope: monthly target card + period breakdown cards. */
export function TeamKpiSection({
  teamMemberCount,
  teamTarget,
  assignedVisits,
  pendingVisits,
  completedVisits,
  approvedSales,
  pendingReviewSales,
  rejectedSales,
  conversionRate,
  commissionTotal,
  commissionCount,
}: TeamKpiSectionProps) {
  return (
    <section className="grid grid-cols-1 lg:grid-cols-12 gap-5">
      {/* Main card: monthly sales target (same figure as dashboard card) */}
      <div className="lg:col-span-4 bg-surface-container border border-outline-variant rounded-2xl p-6 relative overflow-hidden flex flex-col justify-between">
        <div className="absolute -right-10 -bottom-10 w-44 h-44 bg-sky-400/5 rounded-full blur-3xl pointer-events-none" />

        <div>
          <div className="flex items-center justify-between">
            <span className="text-[12px] font-semibold tracking-wider text-on-surface-variant uppercase">
              Objetivo Mensual
            </span>
            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[12px] font-semibold bg-primary/10 text-primary border border-primary/20">
              {teamMemberCount} miembro{teamMemberCount !== 1 ? "s" : ""}
            </span>
          </div>
          <div className="mt-4 flex items-baseline gap-3">
            <span className="text-5xl font-extrabold text-on-surface tracking-tight">
              {teamTarget?.progress ?? 0}%
            </span>
          </div>
        </div>

        <div className="mt-6 pt-5 border-t border-outline-variant/80">
          <div className="flex justify-between items-center text-xs mb-2">
            <span className="text-on-surface-variant">Ventas del mes</span>
            <span className="font-semibold text-on-surface">
              {teamTarget?.currentSales ?? 0} / {teamTarget?.targetTotal ?? 0}
            </span>
          </div>
          <div className="w-full bg-surface-container-high h-2 rounded-full overflow-hidden">
            <div
              className="bg-gradient-to-r from-primary to-sky-400 h-full rounded-full transition-all duration-500"
              style={{ width: `${teamTarget?.progress ?? 0}%` }}
            />
          </div>
        </div>
      </div>

      {/* Breakdown cards — Visitas, Ventas, Tasa de Cierre, Comisiones */}
      <div className="lg:col-span-8 grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* Visitas */}
        <div className="bg-surface-container border border-outline-variant hover:border-zinc-700/60 rounded-2xl p-5 flex flex-col justify-between transition-all">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-lg bg-[#00df81]/10 text-[#00df81]">
                <MapPin size={16} />
              </div>
              <span className="text-sm font-semibold text-on-surface">Visitas</span>
            </div>
            <span className="text-xs text-zinc-500">del período</span>
          </div>
          <div className="mt-4 grid grid-cols-3 gap-2 text-center">
            <div>
              <div className="text-xl font-bold text-on-surface">{assignedVisits}</div>
              <div className="text-[11px] text-on-surface-variant mt-0.5">asignadas</div>
            </div>
            <div>
              <div className="text-xl font-bold text-amber-400">{pendingVisits}</div>
              <div className="text-[11px] text-on-surface-variant mt-0.5">pendientes</div>
            </div>
            <div>
              <div className="text-xl font-bold text-[#00df81]">{completedVisits}</div>
              <div className="text-[11px] text-on-surface-variant mt-0.5">completadas</div>
            </div>
          </div>
        </div>

        {/* Ventas */}
        <div className="bg-surface-container border border-outline-variant hover:border-zinc-700/60 rounded-2xl p-5 flex flex-col justify-between transition-all">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-lg bg-primary/10 text-primary">
                <TrendingUp size={16} />
              </div>
              <span className="text-sm font-semibold text-on-surface">Ventas</span>
            </div>
            <span className="text-xs text-zinc-500">del período</span>
          </div>
          <div className="mt-4 grid grid-cols-3 gap-2 text-center">
            <div>
              <div className="text-xl font-bold text-primary">{approvedSales}</div>
              <div className="text-[11px] text-on-surface-variant mt-0.5">aprobadas</div>
            </div>
            <div>
              <div className="text-xl font-bold text-amber-400">{pendingReviewSales}</div>
              <div className="text-[11px] text-on-surface-variant mt-0.5">pend. aprobación</div>
            </div>
            <div>
              <div className="text-xl font-bold text-red-400">{rejectedSales}</div>
              <div className="text-[11px] text-on-surface-variant mt-0.5">rechazadas</div>
            </div>
          </div>
        </div>

        {/* Tasa de Cierre */}
        <div className="bg-surface-container border border-outline-variant hover:border-zinc-700/60 rounded-2xl p-5 flex flex-col justify-between transition-all">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-lg bg-violet-400/10 text-violet-400">
                <Percent size={16} />
              </div>
              <span className="text-sm font-semibold text-on-surface">Tasa de Cierre</span>
            </div>
            <span className="px-2 py-0.5 rounded-full text-[12px] font-bold bg-violet-400/10 text-violet-400 border border-violet-400/20">
              {conversionRate}%
            </span>
          </div>
          <div className="mt-4 flex items-center justify-between text-sm">
            <span className="text-on-surface-variant">
              {approvedSales} venta{approvedSales !== 1 ? "s" : ""} en {completedVisits} visita{completedVisits !== 1 ? "s" : ""}
            </span>
            <span className="text-zinc-500">del período</span>
          </div>
        </div>

        {/* Comisiones */}
        <div className="bg-surface-container border border-outline-variant hover:border-zinc-700/60 rounded-2xl p-5 flex flex-col justify-between transition-all">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-lg bg-amber-400/10 text-amber-400">
                <Banknote size={16} />
              </div>
              <span className="text-sm font-semibold text-on-surface">Comisiones</span>
            </div>
            <span className="px-2 py-0.5 rounded-full text-[12px] font-bold bg-amber-400/10 text-amber-400 border border-amber-400/20">
              {formatCurrency(commissionTotal)}
            </span>
          </div>
          <div className="mt-4 flex items-center justify-between text-sm">
            <span className="text-on-surface-variant">
              Generadas por el equipo
            </span>
            <span className="text-zinc-500">
              {commissionCount} registro{commissionCount !== 1 ? "s" : ""}
            </span>
          </div>
        </div>
      </div>
    </section>
  );
}
