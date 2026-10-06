/**
 * Read models of the progression screen.
 *
 * These DTOs are what the progression use cases return to the composition
 * root. They cross the Server → Client Component boundary, so they are plain
 * data (no Prisma types) and use the persisted status values already shown by
 * the UI.
 *
 * Reference: requirements.md §3.13, business-rules.md REG-082, REG-083
 */

/** One row of the personal progression timeline. */
export interface ProgressionActivityEntry {
  readonly date: Date;
  readonly type: "SENIORITY" | "VISIT" | "SALE" | "TARGET";
  readonly description: string;
  readonly points: number;
}

/** Personal progression overview for the authenticated employee. */
export interface PersonalProgressionOverview {
  readonly joinedAt: Date;
  /** Points required to reach the next level. 0 = maximum level. */
  readonly threshold: number;
  readonly entries: readonly ProgressionActivityEntry[];
}

/** Per-member row of the team progression table. */
export interface TeamMemberOverview {
  readonly employeeId: string;
  readonly firstName: string;
  readonly lastName: string;
  readonly currentLevelId: number | null;
  readonly joinedAt: Date;
  readonly pointsToNextLevel: number;
  /** All visits ever assigned to the member (the UI labels it "asignadas"). */
  readonly assignedVisits: number;
  readonly completedVisits: number;
  readonly pendingVisits: number;
  readonly monthlySales: number;
  readonly monthlyTarget: number;
  /** Percentage of the current month objective, 0-100. */
  readonly objectiveProgress: number;
}

/** Team monthly objective progress. Same figure as the dashboard card. */
export interface TeamTargetOverview {
  readonly progress: number;
  readonly currentSales: number;
  readonly targetTotal: number;
}

/** Earned commission row of the team commissions card. */
export interface TeamCommissionEntry {
  readonly date: Date;
  readonly amount: number;
}

export type TeamVisitStatus = "ASSIGNED" | "COMPLETED" | "NO_SALE" | "CANCELLED";

export interface TeamVisitRow {
  readonly date: Date;
  readonly status: TeamVisitStatus;
}

export type TeamSaleStatus =
  | "DRAFT"
  | "PENDING_REVIEW"
  | "APPROVED"
  | "REJECTED"
  | "CANCELLED";

export interface TeamSaleRow {
  readonly date: Date;
  readonly status: TeamSaleStatus;
}

export type TeamHistoryStatus =
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
export interface TeamHistoryRow {
  readonly date: Date;
  readonly memberName: string;
  readonly status: TeamHistoryStatus;
  /** Total quantity of sold products. Only when the visit resulted in a sale. */
  readonly productCount?: number;
  /** Sale total (net of discounts). Only when the visit resulted in a sale. */
  readonly total?: number;
}

/** Team progression overview for a supervisor. */
export interface TeamProgressionOverview {
  readonly members: readonly TeamMemberOverview[];
  readonly teamTarget: TeamTargetOverview;
  readonly commissions: readonly TeamCommissionEntry[];
  readonly teamVisits: readonly TeamVisitRow[];
  readonly teamSales: readonly TeamSaleRow[];
  readonly teamHistory: readonly TeamHistoryRow[];
  /** Reference date used by the client to build the period filters. */
  readonly referenceDate: Date;
}