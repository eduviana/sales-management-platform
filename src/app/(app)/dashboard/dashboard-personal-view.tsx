import Link from "next/link";
import { DollarSign, Target } from "lucide-react";
import { MetricCard } from "@/modules/analytics/presentation/components/MetricCard";
import { MonthlySalesChart } from "@/modules/analytics/presentation/components/MonthlySalesChart";
import { SalesTable } from "@/app/(app)/sales/sales-table";
import type { SalesTableSale } from "@/app/(app)/sales/sales-table";
import type { DashboardData } from "@/modules/analytics/domain";
import { formatCurrency } from "@/shared/presentation/format";

interface DashboardPersonalViewProps {
  data: DashboardData;
  recentSales: SalesTableSale[];
}

/** "Mis ventas" tab: personal KPIs, chart and recent sales (N1/N2 and N3+). */
export function DashboardPersonalView({
  data,
  recentSales,
}: DashboardPersonalViewProps) {
  const personal = data.personalDashboard;
  const isN1N2 = !data.hasTeam;

  // KPIs: use personal data for N3+, or existing kpis for N1/N2
  const kpis = isN1N2
    ? {
        totalSalesAllTime: data.kpis.totalSalesAllTime,
        salesThisMonth: data.kpis.salesThisMonth,
        estimatedCommissions: data.kpis.estimatedCommissions,
        personalTarget: data.kpis.targetTotal,
        personalTargetProgress: data.kpis.targetProgress,
      }
    : personal!.kpis;

  // Chart data: use personal dailySaleCounts for N3+, or existing for N1/N2
  const chartData = isN1N2 ? data.dailySaleCounts : personal!.dailySaleCounts;
  const targetCount = kpis.personalTarget;

  return (
    <>
      {/* KPI Cards — Personal */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
        <Link
          href="/dashboard/sales/all"
          className="col-span-1 md:col-span-3"
        >
          <MetricCard
            label="Ventas Totales"
            value={formatCurrency(kpis.totalSalesAllTime)}
            icon={DollarSign}
          />
        </Link>
        <Link
          href="/dashboard/sales/month"
          className="col-span-1 md:col-span-3"
        >
          <MetricCard
            label="Ventas Este Mes"
            value={formatCurrency(kpis.salesThisMonth)}
            icon={DollarSign}
            variant="primary"
          />
        </Link>
        <Link
          href="/dashboard/commissions"
          className="col-span-1 md:col-span-3"
        >
          <MetricCard
            label="Comisiones Estimadas"
            value={formatCurrency(kpis.estimatedCommissions)}
            icon={DollarSign}
            variant="secondary"
          />
        </Link>
        <Link
          href="/dashboard/progression"
          className="col-span-1 md:col-span-3"
        >
          <MetricCard
            label="Progreso del Objetivo"
            value={`${kpis.personalTargetProgress}%`}
            icon={Target}
            variant="tertiary"
            progress={kpis.personalTargetProgress}
          />
        </Link>
      </div>

      {/* Chart — Personal */}
      <div className="bg-surface border border-outline-variant rounded-xl p-6">
        <h2 className="text-lg font-semibold text-on-surface mb-4">
          Ventas Mensuales vs Objetivo
        </h2>
        <MonthlySalesChart data={chartData} targetCount={targetCount} />
      </div>

      {/* Recent Sales Table — same table and source as the /sales page */}
      <div className="bg-surface border border-outline-variant rounded-xl overflow-hidden flex flex-col">
        <div className="p-6 border-b border-outline-variant bg-surface-container-lowest flex items-center justify-between">
          <h3 className="text-lg font-semibold text-on-surface">
            Historial Reciente
          </h3>
          <Link
            href="/sales"
            className="px-4 py-2 text-sm font-medium rounded-lg bg-[#27272a] hover:bg-[#323238] text-zinc-300 border border-[#3f3f46] transition-colors"
          >
            Ver todo
          </Link>
        </div>
        <SalesTable
          sales={recentSales}
          showCreateAction={false}
          showHeader={false}
          showSearch={false}
        />
      </div>
    </>
  );
}
