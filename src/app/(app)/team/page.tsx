/**
 * Team page — Team performance for N3+ supervisors.
 *
 * Shows the full team performance table with pagination.
 * Dashboard shows a summary; this page shows the complete view.
 *
 * Reference: business-rules.md REG-069, REG-071
 */

import { resolveAuthContext } from "@/modules/sales/presentation/resolve-auth-context";
import { createAuthorizationService } from "@/modules/authorization/composition-root";
import { createAnalyticsUseCases } from "@/modules/analytics/composition-root";
import { prisma } from "@/infrastructure/prisma/client";
import Link from "next/link";
import { TeamPerformanceClient } from "./team-performance-client";

export default async function TeamPage() {
  const authContext = await resolveAuthContext();
  const auth = createAuthorizationService(prisma);
  const { getTeamPerformance } = createAnalyticsUseCases(prisma, auth);

  const { teamPerformance } = await getTeamPerformance.execute({
    authContext,
  });

  return (
    <div className="space-y-6">
      <header className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-on-surface mb-1">Mi Equipo</h1>
          <p className="text-on-surface-variant">Rendimiento de los integrantes del equipo</p>
        </div>
        <Link
          href="/team/new"
          className="px-4 py-2 text-sm font-medium text-[#0a1b12] bg-[#00df81] rounded-lg hover:bg-[#00c873] transition-colors"
        >
          Nuevo empleado
        </Link>
      </header>
      <TeamPerformanceClient initialData={teamPerformance} />
    </div>
  );
}
