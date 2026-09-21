/**
 * DashboardClient — Client Component for dashboard rendering.
 *
 * Renders all dashboard sections:
 * - KPI cards (different for N1/N2 vs N3+)
 * - Charts (bar + donut)
 * - Team/personal performance table
 *
 * For N3+ users with a team, shows tabs: "Mis ventas" | "Mi equipo".
 *
 * Visual reference: design/stitch/code.html
 */

"use client";

import Link from "next/link";
import { useState } from "react";
import { DollarSign, UserCheck, Users, Target, Clock } from "lucide-react";
import { MetricCard } from "@/modules/analytics/presentation/components/MetricCard";
import { MonthlySalesChart } from "@/modules/analytics/presentation/components/MonthlySalesChart";
import { LevelDistributionChart } from "@/modules/analytics/presentation/components/LevelDistributionChart";
import { TeamPerformanceTable } from "@/modules/analytics/presentation/components/TeamPerformanceTable";
import { PersonalSalesTable } from "@/modules/analytics/presentation/components/PersonalSalesTable";
import type { DashboardData } from "@/modules/analytics/domain";

interface DashboardClientProps {
  initialData: DashboardData;
  headerTitle: string;
  headerSubtitle: string;
  isAdmin?: boolean;
}

function formatCurrency(amount: number): string {
  return `$${amount.toLocaleString("es-AR")}`;
}

type TabId = "personal" | "team";

export function DashboardClient({
  initialData,
  headerTitle,
  headerSubtitle,
  isAdmin = false,
}: DashboardClientProps) {
  const [activeTab, setActiveTab] = useState<TabId>("team");
  const showTabs = initialData.hasTeam && initialData.personalDashboard;

  // ADMIN sees a completely different dashboard
  if (isAdmin) {
    return <AdminDashboard data={initialData} headerTitle={headerTitle} headerSubtitle={headerSubtitle} />;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <header>
        <h1 className="text-2xl font-semibold text-on-surface mb-1">
          {headerTitle}
        </h1>
        <p className="text-on-surface-variant">
          {headerSubtitle}
        </p>
      </header>

      {/* Tabs (N3+ only) */}
      {showTabs && (
        <div className="flex gap-1 border-b border-outline-variant">
          <button
            onClick={() => setActiveTab("team")}
            className={`px-4 py-2.5 text-sm font-medium border-b-2 transition-colors ${
              activeTab === "team"
                ? "border-primary text-primary"
                : "border-transparent text-on-surface-variant hover:text-on-surface"
            }`}
          >
            Mi equipo
          </button>
          <button
            onClick={() => setActiveTab("personal")}
            className={`px-4 py-2.5 text-sm font-medium border-b-2 transition-colors ${
              activeTab === "personal"
                ? "border-primary text-primary"
                : "border-transparent text-on-surface-variant hover:text-on-surface"
            }`}
          >
            Mis ventas
          </button>
        </div>
      )}

      {/* ================================================================ */}
      {/* TAB: Mi equipo (N3+ team view)                                   */}
      {/* ================================================================ */}
      {showTabs && activeTab === "team" && (
        <>
          {/* KPI Cards — Team */}
          <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
            <div className="col-span-1 md:col-span-3">
              <MetricCard
                label="Ventas Totales del Equipo"
                value={formatCurrency(initialData.kpis.totalSalesAmount)}
                icon={DollarSign}
              />
            </div>
            <div className="col-span-1 md:col-span-3">
              <MetricCard
                label="Pendientes de Revisión"
                value={String(initialData.kpis.pendingReviewCount)}
                icon={Clock}
                variant="primary"
              />
            </div>
            <div className="col-span-1 md:col-span-3">
              <MetricCard
                label="Vendedores Activos"
                value={String(initialData.kpis.activeSellerCount)}
                icon={Users}
                variant="secondary"
              />
            </div>
            <div className="col-span-1 md:col-span-3">
              <MetricCard
                label="Progreso del Objetivo"
                value={`${initialData.kpis.targetProgress}%`}
                icon={Target}
                variant="tertiary"
                progress={initialData.kpis.targetProgress}
              />
            </div>
          </div>

          {/* Charts — Team */}
          <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
            <div className="col-span-1 md:col-span-7 lg:col-span-8 bg-surface border border-outline-variant rounded-xl p-6">
              <h2 className="text-lg font-semibold text-on-surface mb-4">
                Ventas del Equipo
              </h2>
              <MonthlySalesChart data={initialData.dailySaleCounts} targetCount={initialData.kpis.targetTotal} />
            </div>
            <div className="col-span-1 md:col-span-5 lg:col-span-4 bg-surface border border-outline-variant rounded-xl p-6">
              <h2 className="text-lg font-semibold text-on-surface mb-4">
                Distribución por Nivel
              </h2>
              <LevelDistributionChart data={initialData.levelDistribution} />
            </div>
          </div>

          {/* Team Performance Table */}
          {initialData.teamPerformance.length > 0 && (
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
              <TeamPerformanceTable data={initialData.teamPerformance} />
            </div>
          )}
        </>
      )}

      {/* ================================================================ */}
      {/* TAB: Mis ventas (N3+ personal view / N1/N2 view)                 */}
      {/* ================================================================ */}
      {(!showTabs || activeTab === "personal") && (() => {
        const personal = initialData.personalDashboard;
        const isN1N2 = !initialData.hasTeam;

        // KPIs: use personal data for N3+, or existing kpis for N1/N2
        const kpis = isN1N2
          ? {
              totalSalesAllTime: initialData.kpis.totalSalesAllTime,
              salesThisMonth: initialData.kpis.salesThisMonth,
              estimatedCommissions: initialData.kpis.estimatedCommissions,
              personalTarget: initialData.kpis.targetTotal,
              personalTargetProgress: initialData.kpis.targetProgress,
            }
          : personal!.kpis;

        // Chart data: use personal dailySaleCounts for N3+, or existing for N1/N2
        const chartData = isN1N2 ? initialData.dailySaleCounts : personal!.dailySaleCounts;
        const targetCount = kpis.personalTarget;

        // Table data: use personal salesHistory for N3+, or existing for N1/N2
        const tableData = isN1N2
          ? initialData.personalSalesHistory
          : personal!.salesHistory;

        return (
          <>
            {/* KPI Cards — Personal */}
            <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
              <div className="col-span-1 md:col-span-3">
                <MetricCard
                  label="Ventas Totales"
                  value={formatCurrency(kpis.totalSalesAllTime)}
                  icon={DollarSign}
                />
              </div>
              <div className="col-span-1 md:col-span-3">
                <MetricCard
                  label="Ventas Este Mes"
                  value={formatCurrency(kpis.salesThisMonth)}
                  icon={DollarSign}
                  variant="primary"
                />
              </div>
              <div className="col-span-1 md:col-span-3">
                <MetricCard
                  label="Comisiones Estimadas"
                  value={formatCurrency(kpis.estimatedCommissions)}
                  icon={DollarSign}
                  variant="secondary"
                />
              </div>
              <div className="col-span-1 md:col-span-3">
                <MetricCard
                  label="Progreso del Objetivo"
                  value={`${kpis.personalTargetProgress}%`}
                  icon={Target}
                  variant="tertiary"
                  progress={kpis.personalTargetProgress}
                />
              </div>
            </div>

            {/* Chart — Personal */}
            <div className="bg-surface border border-outline-variant rounded-xl p-6">
              <h2 className="text-lg font-semibold text-on-surface mb-4">
                Ventas Mensuales vs Objetivo
              </h2>
              <MonthlySalesChart data={chartData} targetCount={targetCount} />
            </div>

            {/* Personal Sales Table */}
            <div className="bg-surface border border-outline-variant rounded-xl overflow-hidden flex flex-col">
              <div className="p-6 border-b border-outline-variant bg-surface-container-lowest">
                <h3 className="text-lg font-semibold text-on-surface">
                  Mis Ventas
                </h3>
              </div>
              <PersonalSalesTable data={tableData} />
            </div>
          </>
        );
      })()}
    </div>
  );
}

// =============================================================================
// ADMIN Dashboard — Global system view
// =============================================================================

function AdminDashboard({
  data,
  headerTitle,
  headerSubtitle,
}: {
  data: DashboardData;
  headerTitle: string;
  headerSubtitle: string;
}) {
  return (
    <div className="space-y-6">
      {/* Header */}
      <header>
        <h1 className="text-2xl font-semibold text-on-surface mb-1">
          {headerTitle}
        </h1>
        <p className="text-on-surface-variant">
          {headerSubtitle}
        </p>
      </header>

      {/* KPI Cards — Global */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
        <div className="col-span-1 md:col-span-3">
          <MetricCard
            label="Ventas Totales"
            value={formatCurrency(data.kpis.totalSalesAmount)}
            icon={DollarSign}
          />
        </div>
        <div className="col-span-1 md:col-span-3">
          <MetricCard
            label="Vendedores Activos"
            value={String(data.kpis.activeSellerCount)}
            icon={Users}
            variant="secondary"
          />
        </div>
        <div className="col-span-1 md:col-span-3">
          <MetricCard
            label="Pendientes de Revisión"
            value={String(data.kpis.pendingReviewCount)}
            icon={Clock}
            variant="primary"
          />
        </div>
        <div className="col-span-1 md:col-span-3">
          <MetricCard
            label="Aprobadas"
            value={String(data.kpis.approvedCount)}
            icon={UserCheck}
            variant="tertiary"
          />
        </div>
      </div>

      {/* Charts — Global */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
        <div className="col-span-1 md:col-span-7 lg:col-span-8 bg-surface border border-outline-variant rounded-xl p-6">
          <h2 className="text-lg font-semibold text-on-surface mb-4">
            Ventas del Período
          </h2>
          <MonthlySalesChart data={data.dailySaleCounts} targetCount={0} />
        </div>
        <div className="col-span-1 md:col-span-5 lg:col-span-4 bg-surface border border-outline-variant rounded-xl p-6">
          <h2 className="text-lg font-semibold text-on-surface mb-4">
            Distribución por Nivel
          </h2>
          <LevelDistributionChart data={data.levelDistribution} />
        </div>
      </div>

      {/* All Employees Performance Table */}
      {data.teamPerformance.length > 0 && (
        <div className="bg-surface border border-outline-variant rounded-xl overflow-hidden flex flex-col">
          <div className="p-6 border-b border-outline-variant bg-surface-container-lowest flex items-center justify-between">
              <h3 className="text-lg font-semibold text-on-surface">
                  Todos los Empleados
                </h3>
                <Link
                  href="/employees"
                  className="px-4 py-2 text-sm font-medium rounded-lg bg-[#27272a] hover:bg-[#323238] text-zinc-300 border border-[#3f3f46] transition-colors"
                >
                  Ver todo
                </Link>
          </div>
          <TeamPerformanceTable data={data.teamPerformance} />
        </div>
      )}
    </div>
  );
}
