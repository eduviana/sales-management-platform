/**
 * DashboardClient — Client Component for dashboard rendering.
 *
 * Renders all dashboard sections:
 * - KPI cards (different for N1/N2 vs N3+)
 * - Charts (bar + donut)
 * - Team/personal performance table
 *
 * For N3+ users with a team, shows tabs: "Mis ventas" | "Mi equipo".
 * For ADMIN, renders the system overview (health + organization).
 *
 * The "Mi equipo" and "Mis ventas" contents live in <DashboardTeamView> and
 * <DashboardPersonalView> respectively.
 *
 * Visual reference: design/stitch/code.html
 */

"use client";

import { useState } from "react";
import type { DashboardData, SystemOverview } from "@/modules/analytics/domain";
import type { SalesTableSale } from "@/app/(app)/sales/sales-table";
import { AdminSystemOverview } from "./admin-system-overview";
import { DashboardTeamView } from "./dashboard-team-view";
import { DashboardPersonalView } from "./dashboard-personal-view";

interface DashboardClientProps {
  /** Dashboard data — required for non-ADMIN roles. */
  initialData?: DashboardData;
  /** Recent personal sales (same table and source as the "Mis Ventas" page). */
  recentSales?: SalesTableSale[];
  headerTitle: string;
  headerSubtitle: string;
  isAdmin?: boolean;
  /** System overview data — required when isAdmin is true. */
  systemOverview?: SystemOverview | null;
}

type TabId = "personal" | "team";

export function DashboardClient({
  initialData = undefined,
  recentSales = [],
  headerTitle,
  headerSubtitle,
  isAdmin = false,
  systemOverview = null,
}: DashboardClientProps) {
  const [activeTab, setActiveTab] = useState<TabId>("team");

  // ADMIN sees a completely different dashboard
  if (isAdmin) {
    return (
      <AdminSystemOverview
        overview={systemOverview ?? emptySystemOverview()}
        headerTitle={headerTitle}
        headerSubtitle={headerSubtitle}
      />
    );
  }

  // Non-ADMIN roles require dashboard data
  if (!initialData) {
    return (
      <div className="text-sm text-on-surface-variant">
        No hay datos disponibles para mostrar.
      </div>
    );
  }

  const showTabs = initialData.hasTeam && initialData.personalDashboard;

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

      {/* TAB: Mi equipo (N3+ team view) */}
      {showTabs && activeTab === "team" && (
        <DashboardTeamView data={initialData} />
      )}

      {/* TAB: Mis ventas (N3+ personal view / N1/N2 view) */}
      {(!showTabs || activeTab === "personal") && (
        <DashboardPersonalView data={initialData} recentSales={recentSales} />
      )}
    </div>
  );
}

// =============================================================================
// ADMIN Dashboard — Global system view
// =============================================================================

function emptySystemOverview(): SystemOverview {
  const today = new Date();
  const iso = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, "0")}-${String(today.getDate()).padStart(2, "0")}`;
  return {
    kpis: {
      totalSalesAmount: 0,
      monthSalesAmount: 0,
      activeEmployeeCount: 0,
      dangerousAuditEventCount: 0,
    },
    auditActivity: [{ date: iso, label: String(today.getDate()), success: 0, failure: 0, denied: 0 }],
    levelDistribution: [],
    recentEvents: [],
  };
}
