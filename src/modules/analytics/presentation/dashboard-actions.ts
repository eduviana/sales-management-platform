/**
 * Server Action for dashboard data.
 *
 * Resolves auth context and executes GetDashboardDataUseCase.
 * Called from the dashboard page (Server Component).
 *
 * Reference: system-architecture.md §10, authorization.md §12
 */

"use server";

import { createAnalyticsUseCases } from "@/modules/analytics/composition-root";
import { resolveAuthContext } from "@/modules/identity/resolve-auth-context";
import type { DashboardPeriod, DashboardData } from "@/modules/analytics/domain";
import { AuthenticationError, AuthorizationError } from "@/shared/errors";

export async function getDashboardData(
  period: DashboardPeriod = "month",
): Promise<{ data: DashboardData | null; error: string | null }> {
  try {
    const authContext = await resolveAuthContext();
    const { getDashboardData } = createAnalyticsUseCases();

    const data = await getDashboardData.execute({
      authContext,
      period,
    });

    return { data, error: null };
  } catch (error) {
    if (error instanceof AuthenticationError) {
      return { data: null, error: "Debes iniciar sesión para ver el dashboard." };
    }
    if (error instanceof AuthorizationError) {
      return { data: null, error: "No tienes permisos para ver el dashboard." };
    }
    console.error("Dashboard error:", error);
    return { data: null, error: "Error al cargar el dashboard." };
  }
}
