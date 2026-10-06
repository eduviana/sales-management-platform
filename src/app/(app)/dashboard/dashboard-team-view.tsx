import Link from "next/link";
import { Clock, DollarSign, Target, Users } from "lucide-react";
import { MetricCard } from "@/modules/analytics/presentation/components/MetricCard";
import { MonthlySalesChart } from "@/modules/analytics/presentation/components/MonthlySalesChart";
import { LevelDistributionChart } from "@/modules/analytics/presentation/components/LevelDistributionChart";
import { TeamPerformanceTable } from "@/modules/analytics/presentation/components/TeamPerformanceTable";
import type { DashboardData } from "@/modules/analytics/domain";
import { formatCurrency } from "@/shared/presentation/format";

/** "Mi equipo" tab: team KPIs, charts and performance table. */
export function DashboardTeamView({ data }: { data: DashboardData }) {
  return (
    <>
      {/* KPI Cards — Team */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
        <Link
          href="/dashboard/sales/all?scope=team"
          className="col-span-1 md:col-span-3"
        >
          <MetricCard
            label="Ventas Totales del Equipo"
            value={formatCurrency(data.kpis.totalSalesAmount)}
            icon={DollarSign}
          />
        </Link>
        <Link
          href="/dashboard/sales/all?scope=team&status=PENDING_REVIEW"
          className="col-span-1 md:col-span-3"
        >
          <MetricCard
            label="Pendientes de Revisión"
            value={String(data.kpis.pendingReviewCount)}
            icon={Clock}
            variant="primary"
          />
        </Link>
        <Link
          href="/team"
          className="col-span-1 md:col-span-3"
        >
          <MetricCard
            label="Vendedores Activos"
            value={String(data.kpis.activeSellerCount)}
            icon={Users}
            variant="secondary"
          />
        </Link>
        <Link
          href="/dashboard/progression?scope=team"
          className="col-span-1 md:col-span-3"
        >
          <MetricCard
            label="Progreso del Objetivo"
            value={`${data.kpis.targetProgress}%`}
            icon={Target}
            variant="tertiary"
            progress={data.kpis.targetProgress}
          />
        </Link>
      </div>

      {/* Charts — Team */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
        <div className="col-span-1 md:col-span-7 lg:col-span-8 bg-surface border border-outline-variant rounded-xl p-6">
          <h2 className="text-lg font-semibold text-on-surface mb-4">
            Ventas del Equipo
          </h2>
          <MonthlySalesChart data={data.teamDailySaleCounts} targetCount={data.kpis.targetTotal} />
        </div>
        <div className="col-span-1 md:col-span-5 lg:col-span-4 bg-surface border border-outline-variant rounded-xl p-6">
          <h2 className="text-lg font-semibold text-on-surface mb-4">
            Distribución por Nivel
          </h2>
          <LevelDistributionChart data={data.levelDistribution} />
        </div>
      </div>

      {/* Team Performance Table */}
      {data.teamPerformance.length > 0 && (
        <div className="bg-surface border border-outline-variant rounded-xl overflow-hidden flex flex-col">
          <div className="p-6 border-b border-outline-variant bg-surface-container-lowest flex items-center justify-between">
            <h3 className="text-lg font-semibold text-on-surface">
              Rendimiento del Equipo
            </h3>
            <Link
              href="/team"
              className="px-4 py-2 text-sm font-medium rounded-lg bg-[#27272a] hover:bg-[#323238] text-zinc-300 border border-[#3f3f46] transition-colors"
            >
              Ver todo
            </Link>
          </div>
          <TeamPerformanceTable data={data.teamPerformance} />
        </div>
      )}
    </>
  );
}
