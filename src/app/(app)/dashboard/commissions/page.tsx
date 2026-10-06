/**
 * Dashboard — Comisiones generadas del mes actual.
 *
 * Composition root: it resolves the scope from the URL and hands it to the
 * commissions read model.
 *
 * Reference: requirements.md §3.2
 */

export const dynamic = "force-dynamic";

import { createCommissionUseCases } from "@/modules/commissions/composition-root";
import type { CommissionScope } from "@/modules/commissions/application";
import { resolveAuthContext } from "@/modules/identity/resolve-auth-context";
import { formatMonthYear } from "@/shared/presentation/format";
import { CommissionsClient } from "./commissions-client";

export default async function DashboardCommissionsPage({
  searchParams,
}: {
  searchParams: Promise<{ scope?: string }>;
}) {
  const params = await searchParams;
  const isTeam = params.scope === "team";
  const scope: CommissionScope = isTeam ? "TEAM" : "OWN";

  const authContext = await resolveAuthContext();
  const { getMonthlyOverview } = createCommissionUseCases();

  const overview = await getMonthlyOverview.execute({ authContext, scope });

  const monthName = formatMonthYear(overview.referenceDate);
  const title = isTeam ? "Comisiones del Equipo" : "Comisiones Generadas";
  const subtitle = isTeam
    ? `Comisiones del equipo generadas en ${monthName}`
    : `Comisiones generadas en ${monthName}`;

  return (
    <CommissionsClient
      entries={overview.entries.map((entry) => ({
        id: entry.id,
        saleNumber: entry.saleNumber,
        saleDate: entry.saleDate.toISOString(),
        baseAmount: entry.baseAmount,
        percentage: entry.percentage,
        amount: entry.amount,
        employeeName: entry.employeeName,
      }))}
      totalCommissions={overview.totalAmount}
      title={title}
      subtitle={subtitle}
      showEmployee={isTeam}
    />
  );
}