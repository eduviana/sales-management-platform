/**
 * ProgressionClient — Client component for progression detail view.
 *
 * Displays progression records with month filter.
 * - scope="personal": individual seller's entries (existing view).
 * - scope="team": aggregated team entries + per-member progression table.
 * Layout adapted from Stitch design reference.
 *
 * Reference: design/stitch/code.html, requirements.md §3.13
 */

"use client";

import { useState, useMemo, useRef, useEffect } from "react";
import Link from "next/link";
import {
  ChevronLeft,
  MapPin,
  TrendingUp,
  Clock,
  Sparkles,
  ChevronDown,
  Users,
  Percent,
  Banknote,
} from "lucide-react";

interface ProgressionEntry {
  date: string;
  type: "SENIORITY" | "VISIT" | "SALE" | "TARGET";
  description: string;
  points: number;
}

interface TeamMember {
  employeeId: string;
  firstName: string;
  lastName: string;
  currentLevelId: number | null;
  joinedAt: string;
  pointsToNextLevel: number;
  assignedVisits: number;
  completedVisits: number;
  pendingVisits: number;
  monthlySales: number;
  monthlyTarget: number;
  objectiveProgress: number;
}

interface TeamTarget {
  progress: number;
  currentSales: number;
  targetTotal: number;
}

interface CommissionEntry {
  date: string;
  amount: number;
}

type TeamVisitStatus = "ASSIGNED" | "COMPLETED" | "NO_SALE" | "CANCELLED";
type TeamSaleStatus = "DRAFT" | "PENDING_REVIEW" | "APPROVED" | "REJECTED" | "CANCELLED";

interface TeamVisit {
  date: string;
  status: TeamVisitStatus;
}

interface TeamSale {
  date: string;
  status: TeamSaleStatus;
}

type TeamHistoryStatus =
  | "NO_SALE" // visita realizada sin venta (aprobación automática)
  | "VISIT_CANCELLED" // visita cancelada
  | "SALE_PENDING" // visita con venta pendiente de aprobación
  | "SALE_APPROVED" // visita con venta aprobada
  | "SALE_REJECTED" // visita con venta rechazada
  | "SALE_CANCELLED"; // visita con venta cancelada

/**
 * Operational history row for the team period table.
 * One row per performed visit; the status expresses the visit outcome
 * (including the state of the linked sale). No point/score data.
 */
interface TeamHistoryEntry {
  date: string;
  memberName: string;
  status: TeamHistoryStatus;
  /** Total quantity of sold products (sum of item quantities). Only when the visit resulted in a sale. */
  productCount?: number;
  /** Sale total (net of discounts). Only when the visit resulted in a sale. */
  total?: number;
}

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

const TYPE_CONFIG: Record<string, { label: string; bg: string; text: string; border: string; iconBg: string; iconText: string }> = {
  SENIORITY: {
    label: "Antigüedad",
    bg: "bg-primary/10",
    text: "text-primary",
    border: "border-primary/20",
    iconBg: "bg-primary/10",
    iconText: "text-primary",
  },
  VISIT: {
    label: "Visitas",
    bg: "bg-[#00df81]/10",
    text: "text-[#00df81]",
    border: "border-[#00df81]/20",
    iconBg: "bg-[#00df81]/10",
    iconText: "text-[#00df81]",
  },
  SALE: {
    label: "Ventas",
    bg: "bg-tertiary/15",
    text: "text-tertiary",
    border: "border-tertiary/30",
    iconBg: "bg-tertiary/10",
    iconText: "text-tertiary",
  },
  TARGET: {
    label: "Objetivo",
    bg: "bg-[#c084fc]/10",
    text: "text-[#c084fc]",
    border: "border-[#c084fc]/20",
    iconBg: "bg-[#c084fc]/10",
    iconText: "text-[#c084fc]",
  },
};

const TYPE_ICONS: Record<string, typeof MapPin> = {
  SENIORITY: Clock,
  VISIT: MapPin,
  SALE: TrendingUp,
  TARGET: Sparkles,
};

const LEVEL_CODES: Record<number, string> = {
  1: "N1",
  2: "N2",
  3: "N3",
  4: "N4",
  5: "N5",
  6: "N6",
  7: "N7",
};

/** Estado label + color per status in the team history table. */
const HISTORY_STATUS: Record<TeamHistoryStatus, { label: string; text: string }> = {
  NO_SALE: { label: "Sin venta", text: "text-on-surface-variant" },
  VISIT_CANCELLED: { label: "Cancelada", text: "text-zinc-500" },
  SALE_PENDING: { label: "Venta pendiente de aprobación", text: "text-amber-400" },
  SALE_APPROVED: { label: "Venta aprobada", text: "text-[#00df81]" },
  SALE_REJECTED: { label: "Venta rechazada", text: "text-red-400" },
  SALE_CANCELLED: { label: "Venta cancelada", text: "text-zinc-500" },
};

function getAvailableMonths(entries: Array<{ date: string }>): string[] {
  const months = new Set<string>();
  for (const entry of entries) {
    const d = new Date(entry.date);
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
    months.add(key);
  }
  return Array.from(months).sort().reverse();
}

function formatMonth(key: string): string {
  const [year, month] = key.split("-");
  const date = new Date(parseInt(year), parseInt(month) - 1);
  return date.toLocaleDateString("es-AR", { month: "long", year: "numeric" });
}

function getBreakdownDetails(type: string, entries: ProgressionEntry[]): { main: string; sub: string } {
  const typeEntries = entries.filter((e) => e.type === type);
  const count = typeEntries.length;
  const points = typeEntries.reduce((sum, e) => sum + e.points, 0);

  switch (type) {
    case "VISIT":
      return {
        main: `${count} visita${count !== 1 ? "s" : ""} registrada${count !== 1 ? "s" : ""}`,
        sub: "2 pts c/u",
      };
    case "SALE": {
      const lastSale = typeEntries[typeEntries.length - 1];
      const saleNum = lastSale?.description.match(/VT-\d+/)?.[0] ?? "";
      return {
        main: `${count} venta${count !== 1 ? "s" : ""} aprobada${count !== 1 ? "s" : ""}`,
        sub: saleNum || `${points} pts`,
      };
    }
    case "SENIORITY":
      return {
        main: points > 0 ? `${count} mes${count !== 1 ? "es" : ""}` : "Sin antigüedad",
        sub: points > 0 ? "1 pt/mes" : "Próxima suma",
      };
    case "TARGET":
      return {
        main: count > 0 ? `${count} objetivo${count !== 1 ? "s" : ""}` : "Bono por cumplimiento",
        sub: count > 0 ? "10 pts c/u" : "Pendiente",
      };
    default:
      return { main: "", sub: "" };
  }
}

function formatCurrency(amount: number): string {
  return `$${amount.toLocaleString("es-AR")}`;
}

function matchesFilter(dateStr: string, filter: "current" | "all" | "specific", selectedMonth: string): boolean {
  if (filter === "all") return true;
  const d = new Date(dateStr);
  const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
  if (filter === "current") {
    const now = new Date();
    const currentMonthKey = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
    return key === currentMonthKey;
  }
  return selectedMonth ? key === selectedMonth : true;
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
  const [filter, setFilter] = useState<"current" | "all" | "specific">("current");
  const [selectedMonth, setSelectedMonth] = useState<string>("");
  const [showMonthDropdown, setShowMonthDropdown] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown on outside click
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setShowMonthDropdown(false);
      }
    }
    if (showMonthDropdown) {
      document.addEventListener("mousedown", handleClickOutside);
      return () => document.removeEventListener("mousedown", handleClickOutside);
    }
  }, [showMonthDropdown]);

  const availableMonths = useMemo(
    () => getAvailableMonths([...entries, ...teamHistory]),
    [entries, teamHistory],
  );

  const filtered = useMemo(() => {
    const now = new Date();
    const currentMonthKey = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;

    if (filter === "current") {
      return entries.filter((e) => {
        const d = new Date(e.date);
        const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
        return key === currentMonthKey;
      });
    }

    if (filter === "specific" && selectedMonth) {
      return entries.filter((e) => {
        const d = new Date(e.date);
        const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
        return key === selectedMonth;
      });
    }

    return entries;
  }, [entries, filter, selectedMonth]);

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

        <div className="inline-flex p-1 bg-surface-container border border-outline-variant rounded-xl self-start sm:self-auto">
          <button
            onClick={() => setFilter("current")}
            className={`px-4 py-1.5 text-xs font-medium rounded-lg transition-all ${
              filter === "current"
                ? "bg-primary/20 text-primary shadow-sm"
                : "text-on-surface-variant hover:text-on-surface"
            }`}
          >
            Mes actual
          </button>
          <button
            onClick={() => setFilter("all")}
            className={`px-4 py-1.5 text-xs font-medium rounded-lg transition-all ${
              filter === "all"
                ? "bg-primary/20 text-primary shadow-sm"
                : "text-on-surface-variant hover:text-on-surface"
            }`}
          >
            Histórico
          </button>
          <div className="relative" ref={dropdownRef}>
            <button
              onClick={() => {
                setFilter("specific");
                setShowMonthDropdown(!showMonthDropdown);
              }}
              className={`px-4 py-1.5 text-xs font-medium rounded-lg transition-all inline-flex items-center gap-1.5 ${
                filter === "specific"
                  ? "bg-primary/20 text-primary shadow-sm"
                  : "text-on-surface-variant hover:text-on-surface"
              }`}
            >
              {filter === "specific" && selectedMonth
                ? formatMonth(selectedMonth)
                : "Mes específico"}
              <ChevronDown size={12} />
            </button>

            {showMonthDropdown && (
              <div className="absolute right-0 top-full mt-1 z-50 bg-surface-container border border-outline-variant rounded-xl shadow-lg py-1 min-w-[200px] max-h-[280px] overflow-y-auto">
                {availableMonths.map((m) => (
                  <button
                    key={m}
                    onClick={() => {
                      setSelectedMonth(m);
                      setFilter("specific");
                      setShowMonthDropdown(false);
                    }}
                    className={`w-full text-left px-4 py-2 text-xs transition-colors ${
                      selectedMonth === m
                        ? "bg-surface-container-high text-on-surface font-medium"
                        : "text-on-surface-variant hover:bg-surface-container-low hover:text-on-surface"
                    }`}
                  >
                    {formatMonth(m)}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ================================================================ */}
      {/* TEAM SCOPE                                                        */}
      {/* ================================================================ */}
      {isTeam && teamStats && (
        <>
          {/* Team KPI Cards Grid */}
          <section className="grid grid-cols-1 lg:grid-cols-12 gap-5">
            {/* Main card: monthly sales target (same figure as dashboard card) */}
            <div className="lg:col-span-4 bg-surface-container border border-outline-variant rounded-2xl p-6 relative overflow-hidden flex flex-col justify-between">
              <div className="absolute -right-10 -bottom-10 w-44 h-44 bg-sky-400/5 rounded-full blur-3xl pointer-events-none" />

              <div>
                <div className="flex items-center justify-between">
                  <span className="text-[12px] font-semibold tracking-wider text-on-surface-variant uppercase">
                    Objetivo Mensual
                  </span>
                  <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[12px] font-semibold bg-primary/10 text-primary border border-primary/20">
                    {teamStats.count} miembro{teamStats.count !== 1 ? "s" : ""}
                  </span>
                </div>
                <div className="mt-4 flex items-baseline gap-3">
                  <span className="text-5xl font-extrabold text-on-surface tracking-tight">
                    {teamTarget?.progress ?? 0}%
                  </span>
                </div>
              </div>

              <div className="mt-6 pt-5 border-t border-outline-variant/80">
                <div className="flex justify-between items-center text-xs mb-2">
                  <span className="text-on-surface-variant">Ventas del mes</span>
                  <span className="font-semibold text-on-surface">
                    {teamTarget?.currentSales ?? 0} / {teamTarget?.targetTotal ?? 0}
                  </span>
                </div>
                <div className="w-full bg-surface-container-high h-2 rounded-full overflow-hidden">
                  <div
                    className="bg-gradient-to-r from-primary to-sky-400 h-full rounded-full transition-all duration-500"
                    style={{ width: `${teamTarget?.progress ?? 0}%` }}
                  />
                </div>
              </div>
            </div>

            {/* Breakdown cards — Visitas, Ventas, Tasa de Cierre, Comisiones */}
            <div className="lg:col-span-8 grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Visitas */}
              <div className="bg-surface-container border border-outline-variant hover:border-zinc-700/60 rounded-2xl p-5 flex flex-col justify-between transition-all">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <div className="p-2 rounded-lg bg-[#00df81]/10 text-[#00df81]">
                      <MapPin size={16} />
                    </div>
                    <span className="text-sm font-semibold text-on-surface">Visitas</span>
                  </div>
                  <span className="text-xs text-zinc-500">del período</span>
                </div>
                <div className="mt-4 grid grid-cols-3 gap-2 text-center">
                  <div>
                    <div className="text-xl font-bold text-on-surface">{assignedVisits}</div>
                    <div className="text-[11px] text-on-surface-variant mt-0.5">asignadas</div>
                  </div>
                  <div>
                    <div className="text-xl font-bold text-amber-400">{pendingVisits}</div>
                    <div className="text-[11px] text-on-surface-variant mt-0.5">pendientes</div>
                  </div>
                  <div>
                    <div className="text-xl font-bold text-[#00df81]">{completedVisits}</div>
                    <div className="text-[11px] text-on-surface-variant mt-0.5">completadas</div>
                  </div>
                </div>
              </div>

              {/* Ventas */}
              <div className="bg-surface-container border border-outline-variant hover:border-zinc-700/60 rounded-2xl p-5 flex flex-col justify-between transition-all">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <div className="p-2 rounded-lg bg-primary/10 text-primary">
                      <TrendingUp size={16} />
                    </div>
                    <span className="text-sm font-semibold text-on-surface">Ventas</span>
                  </div>
                  <span className="text-xs text-zinc-500">del período</span>
                </div>
                <div className="mt-4 grid grid-cols-3 gap-2 text-center">
                  <div>
                    <div className="text-xl font-bold text-primary">{approvedSales}</div>
                    <div className="text-[11px] text-on-surface-variant mt-0.5">aprobadas</div>
                  </div>
                  <div>
                    <div className="text-xl font-bold text-amber-400">{pendingReviewSales}</div>
                    <div className="text-[11px] text-on-surface-variant mt-0.5">pend. aprobación</div>
                  </div>
                  <div>
                    <div className="text-xl font-bold text-red-400">{rejectedSales}</div>
                    <div className="text-[11px] text-on-surface-variant mt-0.5">rechazadas</div>
                  </div>
                </div>
              </div>

              {/* Tasa de Cierre */}
              <div className="bg-surface-container border border-outline-variant hover:border-zinc-700/60 rounded-2xl p-5 flex flex-col justify-between transition-all">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <div className="p-2 rounded-lg bg-violet-400/10 text-violet-400">
                      <Percent size={16} />
                    </div>
                    <span className="text-sm font-semibold text-on-surface">Tasa de Cierre</span>
                  </div>
                  <span className="px-2 py-0.5 rounded-full text-[12px] font-bold bg-violet-400/10 text-violet-400 border border-violet-400/20">
                    {conversionRate}%
                  </span>
                </div>
                <div className="mt-4 flex items-center justify-between text-sm">
                  <span className="text-on-surface-variant">
                    {approvedSales} venta{approvedSales !== 1 ? "s" : ""} en {completedVisits} visita{completedVisits !== 1 ? "s" : ""}
                  </span>
                  <span className="text-zinc-500">del período</span>
                </div>
              </div>

              {/* Comisiones */}
              <div className="bg-surface-container border border-outline-variant hover:border-zinc-700/60 rounded-2xl p-5 flex flex-col justify-between transition-all">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <div className="p-2 rounded-lg bg-amber-400/10 text-amber-400">
                      <Banknote size={16} />
                    </div>
                    <span className="text-sm font-semibold text-on-surface">Comisiones</span>
                  </div>
                  <span className="px-2 py-0.5 rounded-full text-[12px] font-bold bg-amber-400/10 text-amber-400 border border-amber-400/20">
                    {formatCurrency(commissionTotal)}
                  </span>
                </div>
                <div className="mt-4 flex items-center justify-between text-sm">
                  <span className="text-on-surface-variant">
                    Generadas por el equipo
                  </span>
                  <span className="text-zinc-500">
                    {filteredCommissions.length} registro{filteredCommissions.length !== 1 ? "s" : ""}
                  </span>
                </div>
              </div>
            </div>
          </section>

          {/* Team members progression table */}
          <section className="bg-surface-container border border-outline-variant rounded-2xl overflow-hidden">
            <div className="px-6 py-4 border-b border-outline-variant flex items-center justify-between">
              <h3 className="text-sm font-semibold text-on-surface flex items-center gap-2">
                <Users size={16} className="text-on-surface-variant" />
                Progresión por Miembro
              </h3>
              {teamStats.readyForPromotion > 0 && (
                <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[12px] font-semibold bg-[#00df81]/10 text-[#00df81] border border-[#00df81]/20">
                  {teamStats.readyForPromotion} listo{teamStats.readyForPromotion !== 1 ? "s" : ""} para ascenso
                </span>
              )}
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-center border-collapse">
                <thead>
                  <tr className="border-b border-outline-variant bg-surface-container-low text-xs font-semibold text-on-surface-variant uppercase tracking-wider">
                    <th className="py-3.5 px-6" scope="col">Empleado</th>
                    <th className="py-3.5 px-6" scope="col">Nivel</th>
                    <th className="py-3.5 px-6" scope="col">Visitas asignadas</th>
                    <th className="py-3.5 px-6" scope="col">Visitas completadas</th>
                    <th className="py-3.5 px-6" scope="col">Visitas pendientes</th>
                    <th className="py-3.5 px-6" scope="col">Progreso del objetivo</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-outline-variant/60 text-sm">
                  {members.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="py-8 text-center text-on-surface-variant">
                        No hay miembros activos en el equipo.
                      </td>
                    </tr>
                  ) : (
                    members.map((member) => {
                      const levelCode = member.currentLevelId !== null
                        ? LEVEL_CODES[member.currentLevelId] ?? `N${member.currentLevelId}`
                        : "—";
                      return (
                        <tr key={member.employeeId} className="hover:bg-surface-container-low transition-colors">
                          <td className="py-4 px-6 text-on-surface font-medium">
                            {member.firstName} {member.lastName}
                          </td>
                          <td className="py-4 px-6">
                            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[12px] font-semibold bg-surface-container-high text-on-surface-variant border border-outline-variant">
                              {levelCode}
                            </span>
                          </td>
                          <td className="py-4 px-6 text-on-surface font-semibold">
                            {member.assignedVisits}
                          </td>
                          <td className="py-4 px-6 text-[#00df81] font-semibold">
                            {member.completedVisits}
                          </td>
                          <td className="py-4 px-6 font-semibold">
                            <span className={member.pendingVisits > 0 ? "text-amber-400" : "text-on-surface-variant"}>
                              {member.pendingVisits}
                            </span>
                          </td>
                          <td className="py-4 px-6">
                            <div className="flex items-center justify-center gap-2">
                              <div className="w-24 h-1.5 bg-surface-container-high rounded-full overflow-hidden">
                                <div
                                  className="h-full bg-gradient-to-r from-primary to-sky-400 rounded-full transition-all duration-500"
                                  style={{ width: `${member.objectiveProgress}%` }}
                                />
                              </div>
                              <span className="text-xs font-semibold text-on-surface min-w-[36px]">
                                {member.objectiveProgress}%
                              </span>
                            </div>
                            <div className="text-[11px] text-on-surface-variant mt-1">
                              {member.monthlySales} / {member.monthlyTarget} ventas
                            </div>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </section>

          {/* Team operational history */}
          <section className="bg-surface-container border border-outline-variant rounded-2xl overflow-hidden">
            <div className="px-6 py-4 border-b border-outline-variant">
              <h3 className="text-sm font-semibold text-on-surface">Historial Detallado del Período</h3>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-center border-collapse">
                <thead>
                  <tr className="border-b border-outline-variant bg-surface-container-low text-xs font-semibold text-on-surface-variant uppercase tracking-wider">
                    <th className="py-3.5 px-6" scope="col">Empleado</th>
                    <th className="py-3.5 px-6" scope="col">Fecha</th>
                    <th className="py-3.5 px-6" scope="col">Estado</th>
                    <th className="py-3.5 px-6" scope="col">Cant. productos</th>
                    <th className="py-3.5 px-6" scope="col">Total</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-outline-variant/60 text-sm">
                  {filteredHistory.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="py-8 text-center text-on-surface-variant">
                        {teamHistory.length === 0
                          ? "No hay actividad registrada."
                          : "No se encontraron registros para el período seleccionado."}
                      </td>
                    </tr>
                  ) : (
                    filteredHistory.map((entry, idx) => {
                      const estado = HISTORY_STATUS[entry.status];
                      return (
                        <tr key={idx} className="hover:bg-surface-container-low transition-colors">
                          <td className="py-4 px-6 text-on-surface font-medium">
                            {entry.memberName}
                          </td>
                          <td className="py-4 px-6 text-on-surface-variant">
                            {new Date(entry.date).toLocaleDateString("es-AR")}
                          </td>
                          <td className={`py-4 px-6 font-semibold ${estado.text}`}>
                            {estado.label}
                          </td>
                          <td className="py-4 px-6 text-center font-semibold text-on-surface">
                            {entry.productCount !== undefined ? entry.productCount : "—"}
                          </td>
                          <td className="py-4 px-6 text-on-surface-variant">
                            {entry.total !== undefined ? formatCurrency(entry.total) : "—"}
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>

            {filteredHistory.length > 0 && (
              <div className="px-6 py-4 bg-surface-container-low border-t border-outline-variant flex items-center justify-end text-sm">
                <div className="flex items-center gap-2">
                  <span className="text-on-surface-variant">Actividad del período:</span>
                  <span className="text-sm font-extrabold text-on-surface bg-surface-container-high px-2 py-0.5 rounded-full text-[12px] border border-outline-variant">
                    {filteredHistory.length} registro{filteredHistory.length !== 1 ? "s" : ""}
                  </span>
                </div>
              </div>
            )}
          </section>
        </>
      )}

      {/* ================================================================ */}
      {/* PERSONAL SCOPE                                                    */}
      {/* ================================================================ */}
      {!isTeam && (
        <>
          {/* KPI Cards Grid */}
          <section className="grid grid-cols-1 lg:grid-cols-12 gap-5">
            {/* Main card: Points */}
            <div className="lg:col-span-4 bg-surface-container border border-outline-variant rounded-2xl p-6 relative overflow-hidden flex flex-col justify-between">
              <div className="absolute -right-10 -bottom-10 w-44 h-44 bg-[#00df81]/5 rounded-full blur-3xl pointer-events-none" />

              <div>
                <div className="flex items-center justify-between">
                  <span className="text-[12px] font-semibold tracking-wider text-on-surface-variant uppercase">
                    {filter === "all" ? "Puntos Totales" : "Puntos del Período"}
                  </span>
                  {filter !== "all" && filteredTotal > 0 && (
                    <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[12px] font-semibold bg-[#00df81]/10 text-[#00df81] border border-[#00df81]/20">
                      +{filteredTotal} pts logrados
                    </span>
                  )}
                </div>
                <div className="mt-4 flex items-baseline gap-3">
                  <span className="text-5xl font-extrabold text-on-surface tracking-tight">
                    {filteredTotal}
                  </span>
                  {!isMaxLevel && filter !== "all" && (
                    <span className="text-sm font-medium text-zinc-500">/ {threshold} pts objetivo</span>
                  )}
                </div>
              </div>

              {!isMaxLevel && filter !== "all" ? (
                <div className="mt-6 pt-5 border-t border-outline-variant/80">
                  <div className="flex justify-between items-center text-xs mb-2">
                    <span className="text-on-surface-variant">Avance de meta</span>
                    <span className="font-semibold text-on-surface">{targetPercentage.toFixed(1)}%</span>
                  </div>
                  <div className="w-full bg-surface-container-high h-2 rounded-full overflow-hidden">
                    <div
                      className="bg-gradient-to-r from-[#00df81] to-[#00b96b] h-full rounded-full transition-all duration-500"
                      style={{ width: `${targetPercentage}%` }}
                    />
                  </div>
                  <div className="flex justify-between items-center mt-3 text-[11px] text-zinc-500">
                    <span>
                      Desde:{" "}
                      <strong className="text-on-surface-variant font-medium">
                        {new Date(employeeJoinedAt).toLocaleDateString("es-AR")}
                      </strong>
                    </span>
                    <span>
                      Restan:{" "}
                      <strong className="text-on-surface font-medium">{pointsToNextLevel} pts</strong>
                    </span>
                  </div>
                </div>
              ) : (
                <div className="mt-6 pt-5 border-t border-outline-variant/80">
                  <div className="text-[11px] text-zinc-500">
                    {isMaxLevel ? (
                      <strong className="text-on-surface-variant font-medium">Nivel máximo alcanzado</strong>
                    ) : (
                      <>
                        Desde:{" "}
                        <strong className="text-on-surface-variant font-medium">
                          {new Date(employeeJoinedAt).toLocaleDateString("es-AR")}
                        </strong>
                      </>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Breakdown cards */}
            <div className="lg:col-span-8 grid grid-cols-1 sm:grid-cols-2 gap-4">
              {(["VISIT", "SALE", "SENIORITY", "TARGET"] as const).map((type) => {
                const config = TYPE_CONFIG[type];
                const Icon = TYPE_ICONS[type];
                const details = getBreakdownDetails(type, filtered);
                return (
                  <div
                    key={type}
                    className="bg-surface-container border border-outline-variant hover:border-zinc-700/60 rounded-2xl p-5 flex flex-col justify-between transition-all"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2.5">
                        <div className={`p-2 rounded-lg ${config.iconBg} ${config.iconText}`}>
                          <Icon size={16} />
                        </div>
                        <span className="text-sm font-semibold text-on-surface">{config.label}</span>
                      </div>
                      <span
                        className={`px-2 py-0.5 rounded-full text-[12px] font-bold ${config.bg} ${config.text} border ${config.border}`}
                      >
                        {summary[type]} pts
                      </span>
                    </div>
                    <div className="mt-4 flex items-center justify-between text-sm">
                      <span className="text-on-surface-variant">{details.main}</span>
                      <span className="text-zinc-500">{details.sub}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </section>

          {/* Table section */}
          <section className="bg-surface-container border border-outline-variant rounded-2xl overflow-hidden">
            {/* Table header */}
            <div className="px-6 py-4 border-b border-outline-variant">
              <h3 className="text-sm font-semibold text-on-surface">Historial Detallado del Período</h3>
            </div>

            {/* Table */}
            <div className="overflow-x-auto">
              <table className="w-full text-center border-collapse">
                <thead>
                  <tr className="border-b border-outline-variant bg-surface-container-low text-xs font-semibold text-on-surface-variant uppercase tracking-wider">
                    <th className="py-3.5 px-6" scope="col">Fecha</th>
                    <th className="py-3.5 px-6" scope="col">Tipo</th>
                    <th className="py-3.5 px-6" scope="col">Descripción</th>
                    <th className="py-3.5 px-6" scope="col">Puntos</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-outline-variant/60 text-sm">
                  {filtered.length === 0 ? (
                    <tr>
                      <td colSpan={4} className="py-8 text-center text-on-surface-variant">
                        {entries.length === 0
                          ? "No hay registros de progreso."
                          : "No se encontraron registros para el período seleccionado."}
                      </td>
                    </tr>
                  ) : (
                    filtered.map((entry, idx) => {
                      const config = TYPE_CONFIG[entry.type];
                      return (
                        <tr key={idx} className="hover:bg-surface-container-low transition-colors">
                          <td className="py-4 px-6 text-on-surface font-medium">
                            {new Date(entry.date).toLocaleDateString("es-AR")}
                          </td>
                          <td className="py-4 px-6">
                            <span
                              className={`inline-flex items-center px-2 py-0.5 rounded-full text-[12px] font-semibold ${config.bg} ${config.text} border ${config.border}`}
                            >
                              {config.label}
                            </span>
                          </td>
                          <td className="py-4 px-6 text-on-surface-variant">
                            {entry.description}
                          </td>
                          <td className="py-4 px-6 font-bold text-sm text-[#00df81]">
                            +{entry.points}
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>

            {/* Table footer */}
            {filtered.length > 0 && (
              <div className="px-6 py-4 bg-surface-container-low border-t border-outline-variant flex items-center justify-end text-sm">
                <div className="flex items-center gap-2">
                  <span className="text-on-surface-variant">Total acumulado:</span>
                  <span className="text-sm font-extrabold text-[#00df81] bg-[#00df81]/10 px-2 py-0.5 rounded-full text-[12px] border border-[#00df81]/25">
                    +{filteredTotal} pts
                  </span>
                </div>
              </div>
            )}
          </section>
        </>
      )}
    </div>
  );
}
