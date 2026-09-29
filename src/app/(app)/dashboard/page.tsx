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

import { resolveAuthContext } from "@/modules/sales/presentation/resolve-auth-context";
import { createAuthorizationService } from "@/modules/authorization/composition-root";
import { createAnalyticsUseCases } from "@/modules/analytics/composition-root";
import { createSalesUseCases } from "@/modules/sales/composition-root";
import { PrismaOrganizationRepository } from "@/infrastructure/organization/prisma-organization-repository";
import { prisma } from "@/infrastructure/prisma/client";
import { DashboardClient } from "./dashboard-client";

/** Number of recent personal sales shown in the dashboard "Historial Reciente" table. */
const RECENT_SALES_LIMIT = 10;

export default async function DashboardPage() {
  const authContext = await resolveAuthContext();
  const auth = createAuthorizationService(prisma);
  const { getDashboardData, getSystemOverview } = createAnalyticsUseCases(prisma, auth);

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

  const orgRepo = new PrismaOrganizationRepository(prisma);
  const salesUseCases = createSalesUseCases(prisma, auth, orgRepo);

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

  // Fetch commission entries for the recent sales in a single query
  const recentSaleIds = recentSalesResult.sales.map((s) => s.id);
  const recentCommissionEntries = await prisma.commissionEntry.findMany({
    where: { saleId: { in: recentSaleIds }, type: "EARNED" },
    select: { saleId: true, amount: true },
  });
  const recentCommissionMap = new Map(
    recentCommissionEntries.map((e) => [e.saleId, Number(e.amount)]),
  );

  const recentSales = recentSalesResult.sales.map((s) => ({
    id: s.id,
    saleNumber: s.saleNumber,
    saleDate: s.saleDate.toISOString(),
    buyerName: s.buyerName,
    totalAmount: s.totalAmount,
    status: s.status,
    commissionAmount: recentCommissionMap.get(s.id) ?? null,
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
