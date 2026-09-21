/**
 * Dashboard page — main analytics panel.
 *
 * Server Component that fetches dashboard data and renders:
 * - Header with contextual title
 * - 4 KPI cards (bento grid)
 * - Bar chart (daily sales)
 * - Donut chart (level distribution)
 * - Team performance table
 *
 * All data comes from the database via GetDashboardDataUseCase.
 * Visual reference: design/stitch/code.html
 *
 * Reference: requirements.md §2.4–§2.6, §3.2
 */

import { resolveAuthContext } from "@/modules/sales/presentation/resolve-auth-context";
import { createAuthorizationService } from "@/modules/authorization/composition-root";
import { createAnalyticsUseCases } from "@/modules/analytics/composition-root";
import { prisma } from "@/infrastructure/prisma/client";
import { DashboardClient } from "./dashboard-client";

export default async function DashboardPage() {
  const authContext = await resolveAuthContext();
  const auth = createAuthorizationService(prisma);
  const { getDashboardData } = createAnalyticsUseCases(prisma, auth);

  const isAdmin = authContext.role === "ADMIN";

  const data = await getDashboardData.execute({
    authContext,
    period: "month",
    includePersonalData: true,
  });

  const headerTitle = isAdmin
    ? "Vista General del Sistema"
    : data.hasTeam
      ? "Vista General del Equipo"
      : "Panel de Control";

  const headerSubtitle = isAdmin
    ? "Métricas globales de toda la organización."
    : data.hasTeam
      ? "Métricas de rendimiento para el período actual."
      : "Tus métricas de rendimiento para el período actual.";

  return (
    <DashboardClient
      initialData={data}
      headerTitle={headerTitle}
      headerSubtitle={headerSubtitle}
      isAdmin={isAdmin}
    />
  );
}
