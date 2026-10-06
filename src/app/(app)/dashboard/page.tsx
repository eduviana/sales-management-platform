/**
 * Dashboard page — main analytics panel.
 *
 * Server Component that fetches dashboard data and renders:
 * - ADMIN: system health & organization overview (GetSystemOverviewUseCase)
 * - SELLER: contextual header, 4 KPI cards (bento grid), bar chart,
 *   donut chart and team/personal performance (GetDashboardDataUseCase)
 *
 * Visual reference: design/stitch/code.html
 *
 * Reference: requirements.md §2.4–§2.6, §3.2, §3.12.1
 */

import { resolveAuthContext } from "@/modules/identity/resolve-auth-context";
import { createAnalyticsUseCases } from "@/modules/analytics/composition-root";
import { createSalesUseCases } from "@/modules/sales/composition-root";
import { createCommissionUseCases } from "@/modules/commissions/composition-root";
import { DashboardClient } from "./dashboard-client";

/** Number of recent personal sales shown in the dashboard "Historial Reciente" table. */
const RECENT_SALES_LIMIT = 10;

export default async function DashboardPage() {
  const authContext = await resolveAuthContext();
  const { getDashboardData, getSystemOverview } = createAnalyticsUseCases();

  const isAdmin = authContext.role === "ADMIN";

  // ADMIN: system health + organization overview (audit charts, KPIs, search)
  if (isAdmin) {
    const systemOverview = await getSystemOverview.execute({ authContext });

    return (
      <DashboardClient
        headerTitle="Vista General del Sistema"
        headerSubtitle="Salud del sistema e información de la organización."
        isAdmin={isAdmin}
        systemOverview={systemOverview}
      />
    );
  }

  const salesUseCases = createSalesUseCases();
  const { getSaleAmounts } = createCommissionUseCases();

  const data = await getDashboardData.execute({
    authContext,
    period: "month",
    includePersonalData: true,
  });

  // Recent personal sales — same source as the "Mis Ventas" page (/sales),
  // own sales of the authenticated employee, ordered by date desc.
  const recentSalesResult = await salesUseCases.listSales.execute({
    authContext,
    scope: "OWN",
    page: 1,
    pageSize: RECENT_SALES_LIMIT,
  });

  // Earned commission of each recent sale, for the commission column
  const commissionAmounts = await getSaleAmounts.execute({
    saleIds: recentSalesResult.sales.map((s) => s.id),
  });

  const recentSales = recentSalesResult.sales.map((s) => ({
    id: s.id,
    saleNumber: s.saleNumber,
    saleDate: s.saleDate.toISOString(),
    buyerName: s.buyerName,
    totalAmount: s.totalAmount,
    status: s.status,
    commissionAmount: commissionAmounts.get(s.id) ?? null,
  }));

  const headerTitle = data.hasTeam
    ? "Vista General del Equipo"
    : "Panel de Control";

  const headerSubtitle = data.hasTeam
    ? "Métricas de rendimiento para el período actual."
    : "Tus métricas de rendimiento para el período actual.";

  return (
    <DashboardClient
      initialData={data}
      recentSales={recentSales}
      headerTitle={headerTitle}
      headerSubtitle={headerSubtitle}
      isAdmin={isAdmin}
    />
  );
}
