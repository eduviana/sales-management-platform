/**
 * Dashboard — Progreso del objetivo.
 *
 * Composition root of the screen: it resolves the scope, calls the progression
 * use cases and hands their read models to the client component.
 * - scope=own (default): individual seller's progression timeline.
 * - scope=team: N3+ supervisor's team — aggregated entries + per-member summaries.
 *
 * Reference: requirements.md §3.13, business-rules.md REG-082, REG-083
 */

export const dynamic = "force-dynamic";

import { createProgressionModule } from "@/modules/progression/composition-root";
import { resolveAuthContext } from "@/modules/identity/resolve-auth-context";
import { ProgressionClient } from "./progression-client";

export default async function DashboardProgressionPage({
  searchParams,
}: {
  searchParams: Promise<{ scope?: string }>;
}) {
  const params = await searchParams;
  const authContext = await resolveAuthContext();

  const { getPersonalProgression, getTeamProgression } =
    createProgressionModule();

  if (params.scope === "team") {
    const overview = await getTeamProgression.execute({ authContext });

    return (
      <ProgressionClient
        scope="team"
        entries={[]}
        members={overview.members.map((member) => ({
          ...member,
          joinedAt: member.joinedAt.toISOString(),
        }))}
        teamTarget={overview.teamTarget}
        commissions={overview.commissions.map((entry) => ({
          ...entry,
          date: entry.date.toISOString(),
        }))}
        teamVisits={overview.teamVisits.map((row) => ({
          ...row,
          date: row.date.toISOString(),
        }))}
        teamSales={overview.teamSales.map((row) => ({
          ...row,
          date: row.date.toISOString(),
        }))}
        teamHistory={overview.teamHistory.map((row) => ({
          ...row,
          date: row.date.toISOString(),
        }))}
        employeeJoinedAt={overview.referenceDate.toISOString()}
        threshold={0}
      />
    );
  }

  const overview = await getPersonalProgression.execute({
    employeeId: authContext.employeeId,
  });

  if (!overview) {
    return (
      <div className="space-y-6">
        <header>
          <h1 className="text-2xl font-semibold text-on-surface mb-1">
            Progreso del Objetivo
          </h1>
        </header>
        <div className="bg-surface border border-outline-variant rounded-xl p-8 text-center">
          <p className="text-on-surface-variant">Empleado no encontrado.</p>
        </div>
      </div>
    );
  }

  return (
    <ProgressionClient
      scope="personal"
      entries={overview.entries.map((entry) => ({
        ...entry,
        date: entry.date.toISOString(),
      }))}
      employeeJoinedAt={overview.joinedAt.toISOString()}
      threshold={overview.threshold}
    />
  );
}