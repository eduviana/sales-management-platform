/**
 * ProgressionClient — Client component for progression detail view.
 *
 * Displays progression records with month filter.
 * - scope="personal": individual seller's entries (existing view).
 * - scope="team": aggregated team entries + per-member progression table.
 * Layout adapted from Stitch design reference.
 *
 * Presentation is split into <PeriodFilter>, the team sections
 * (TeamKpiSection, TeamMembersTable, TeamHistoryTable) and the personal
 * sections (PersonalKpiSection, PersonalHistoryTable). This component keeps
 * the period state and derives the filtered aggregates.
 *
 * Reference: design/stitch/code.html, requirements.md §3.13
 */

"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { ChevronLeft } from "lucide-react";
import type {
  CommissionEntry,
  ProgressionEntry,
  TeamHistoryEntry,
  TeamMember,
  TeamSale,
  TeamTarget,
  TeamVisit,
} from "@/modules/progression/presentation/progression-view-models";
import {
  getAvailableMonths,
  matchesFilter,
  type ProgressionFilter,
} from "./progression-display";
import { PeriodFilter } from "./period-filter";
import { TeamKpiSection } from "./team-kpi-section";
import { TeamHistoryTable, TeamMembersTable } from "./team-tables";
import { PersonalKpiSection } from "./personal-kpi-section";
import { PersonalHistoryTable } from "./personal-history-table";

interface ProgressionClientProps {
  scope: "personal" | "team";
  entries: ProgressionEntry[];
  employeeJoinedAt: string;
  /** Threshold for the next level (personal scope). 0 = max level / not applicable. */
  threshold: number;
  /** Team members with lifetime summaries (team scope only). */
  members?: TeamMember[];
  /** Monthly sales target progress (team scope only). Same figure as dashboard card. */
  teamTarget?: TeamTarget;
  /** Team commission entries for period-filtered Commissions card (team scope only). */
  commissions?: CommissionEntry[];
  /** Team visit rows (date + status) for period-filtered Visitas card (team scope only). */
  teamVisits?: TeamVisit[];
  /** Team sale rows (date + status) for period-filtered Ventas card (team scope only). */
  teamSales?: TeamSale[];
  /** Team operational history (date, member, activity, status, detail) for the period table (team scope only). */
  teamHistory?: TeamHistoryEntry[];
}

export function ProgressionClient({
  scope,
  entries,
  employeeJoinedAt,
  threshold,
  members = [],
  teamTarget,
  commissions = [],
  teamVisits = [],
  teamSales = [],
  teamHistory = [],
}: ProgressionClientProps) {
  const [filter, setFilter] = useState<ProgressionFilter>("current");
  const [selectedMonth, setSelectedMonth] = useState<string>("");

  const availableMonths = useMemo(
    () => getAvailableMonths([...entries, ...teamHistory]),
    [entries, teamHistory],
  );

  const filtered = useMemo(
    () => entries.filter((e) => matchesFilter(e.date, filter, selectedMonth)),
    [entries, filter, selectedMonth],
  );

  const filteredTotal = filtered.reduce((sum, e) => sum + e.points, 0);

  // Personal: threshold from domain; 0 means max level → no target bar
  const isMaxLevel = threshold <= 0;
  const pointsToNextLevel = isMaxLevel ? 0 : Math.max(threshold - filteredTotal, 0);
  const targetPercentage = isMaxLevel || threshold === 0
    ? 100
    : Math.min((filteredTotal / threshold) * 100, 100);

  // Team aggregates (lifetime, from members) — independent of period filter
  const teamStats = useMemo(() => {
    if (scope !== "team") return null;
    const readyForPromotion = members.filter((m) => m.pointsToNextLevel === 0 && m.currentLevelId !== null && m.currentLevelId < 7).length;
    return { readyForPromotion, count: members.length };
  }, [scope, members]);

  // Summary by type (period-filtered)
  const summary = useMemo(() => {
    const map: Record<string, number> = { SENIORITY: 0, VISIT: 0, SALE: 0, TARGET: 0 };
    for (const e of filtered) {
      map[e.type] += e.points;
    }
    return map;
  }, [filtered]);

  // Team conversion (ventas/visitas) for the selected period.
  // Visit breakdown: assigned = all team visits; pending = ASSIGNED status;
  // completed = COMPLETED + NO_SALE (visits actually performed in the period).
  const filteredTeamVisits = useMemo(
    () => teamVisits.filter((v) => matchesFilter(v.date, filter, selectedMonth)),
    [teamVisits, filter, selectedMonth],
  );
  const assignedVisits = filteredTeamVisits.length;
  const pendingVisits = filteredTeamVisits.filter((v) => v.status === "ASSIGNED").length;
  const completedVisits = filteredTeamVisits.filter(
    (v) => v.status === "COMPLETED" || v.status === "NO_SALE",
  ).length;

  // Sale breakdown: approved = APPROVED; pending approval = PENDING_REVIEW; rejected = REJECTED.
  const filteredTeamSales = useMemo(
    () => teamSales.filter((s) => matchesFilter(s.date, filter, selectedMonth)),
    [teamSales, filter, selectedMonth],
  );
  const approvedSales = filteredTeamSales.filter((s) => s.status === "APPROVED").length;
  const pendingReviewSales = filteredTeamSales.filter((s) => s.status === "PENDING_REVIEW").length;
  const rejectedSales = filteredTeamSales.filter((s) => s.status === "REJECTED").length;

  // Tasa de Cierre: % of visits performed that resulted in an approved sale
  const conversionRate = completedVisits > 0
    ? Math.round((approvedSales / completedVisits) * 100)
    : 0;

  // Team commissions for the selected period
  const filteredCommissions = useMemo(
    () => commissions.filter((c) => matchesFilter(c.date, filter, selectedMonth)),
    [commissions, filter, selectedMonth],
  );
  const commissionTotal = filteredCommissions.reduce((sum, c) => sum + c.amount, 0);

  // Team operational history for the selected period
  const filteredHistory = useMemo(
    () => teamHistory.filter((h) => matchesFilter(h.date, filter, selectedMonth)),
    [teamHistory, filter, selectedMonth],
  );

  const isTeam = scope === "team";

  return (
    <div className="space-y-8">
      {/* Back link */}
      <Link
        href="/dashboard"
        className="inline-flex items-center text-xs font-medium text-sky-400 hover:text-sky-300 transition-colors gap-1.5"
      >
        <ChevronLeft size={14} strokeWidth={2.5} />
        Volver al panel
      </Link>

      {/* Header + filter pills */}
      <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl lg:text-3xl font-bold tracking-tight text-on-surface">
            Progreso del Objetivo
          </h1>
          <p className="text-sm text-on-surface-variant mt-1">
            {isTeam
              ? "Desglose de progresión de los miembros del equipo"
              : "Desglose de registros que suman puntos"}
          </p>
        </div>

        <PeriodFilter
          filter={filter}
          selectedMonth={selectedMonth}
          availableMonths={availableMonths}
          onFilterChange={setFilter}
          onMonthSelect={setSelectedMonth}
        />
      </div>

      {/* ================================================================ */}
      {/* TEAM SCOPE                                                        */}
      {/* ================================================================ */}
      {isTeam && teamStats && (
        <>
          <TeamKpiSection
            teamMemberCount={teamStats.count}
            teamTarget={teamTarget}
            assignedVisits={assignedVisits}
            pendingVisits={pendingVisits}
            completedVisits={completedVisits}
            approvedSales={approvedSales}
            pendingReviewSales={pendingReviewSales}
            rejectedSales={rejectedSales}
            conversionRate={conversionRate}
            commissionTotal={commissionTotal}
            commissionCount={filteredCommissions.length}
          />

          <TeamMembersTable
            members={members}
            readyForPromotion={teamStats.readyForPromotion}
          />

          <TeamHistoryTable
            history={filteredHistory}
            totalCount={teamHistory.length}
          />
        </>
      )}

      {/* ================================================================ */}
      {/* PERSONAL SCOPE                                                    */}
      {/* ================================================================ */}
      {!isTeam && (
        <>
          <PersonalKpiSection
            filter={filter}
            isMaxLevel={isMaxLevel}
            filteredTotal={filteredTotal}
            threshold={threshold}
            targetPercentage={targetPercentage}
            pointsToNextLevel={pointsToNextLevel}
            employeeJoinedAt={employeeJoinedAt}
            entries={filtered}
            summary={summary}
          />

          <PersonalHistoryTable
            entries={filtered}
            totalEntries={entries.length}
            filteredTotal={filteredTotal}
          />
        </>
      )}
    </div>
  );
}
