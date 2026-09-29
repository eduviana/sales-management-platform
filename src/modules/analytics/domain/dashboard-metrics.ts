/**
 * Domain types for dashboard metrics and analytics.
 *
 * These types represent aggregated data for the dashboard.
 * They are framework-agnostic and contain no Prisma or Next.js dependencies.
 *
 * Reference: system-architecture.md §6.3, requirements.md §3.2
 */

// =============================================================================
// Period & Date Range
// =============================================================================

export type DashboardPeriod = "today" | "week" | "month";

export interface DateRange {
  readonly from: Date;
  readonly to: Date;
}

// =============================================================================
// KPI Summary
// =============================================================================

export interface KpiSummary {
  /** Total sales amount within the resolved scope (team or personal). */
  readonly totalSalesAmount: number;
  /** Personal sales amount of the authenticated user. */
  readonly personalSalesAmount: number;
  /** Number of active sellers with sales in the period. */
  readonly activeSellerCount: number;
  /** Target progress percentage (0–100). */
  readonly targetProgress: number;
  /** Total target in number of sales for the period. */
  readonly targetTotal: number;
  /** Target amount in currency (targetTotal × average sale amount). */
  readonly targetAmount: number;
  /** Current number of sales in the scope for the period. */
  readonly currentSales: number;
  /** Number of sales with PENDING_REVIEW status. */
  readonly pendingReviewCount: number;
  /** Number of sales with APPROVED status. */
  readonly approvedCount: number;
  /** Total sales amount all-time (no date filter). */
  readonly totalSalesAllTime: number;
  /** Personal sales amount for the current calendar month. */
  readonly salesThisMonth: number;
  /** Estimated commissions for the current month. */
  readonly estimatedCommissions: number;
}

// =============================================================================
// Daily Sales (Bar Chart — amounts for N3+)
// =============================================================================

export interface DailySalesBar {
  /** ISO date string "YYYY-MM-DD". */
  readonly date: string;
  /** Short label for display (e.g., "Lun", "Mar"). */
  readonly label: string;
  /** Sales amount for that day. */
  readonly amount: number;
}

// =============================================================================
// Daily Sale Counts (Bar Chart — counts for N1/N2)
// =============================================================================

export interface DailySaleCount {
  /** ISO date string "YYYY-MM-DD". */
  readonly date: string;
  /** Day of month number (1–31). */
  readonly label: string;
  /** Number of sales on that day. */
  readonly count: number;
}

// =============================================================================
// Level Distribution (Donut Chart)
// =============================================================================

export interface LevelDistribution {
  /** Level code (e.g., "N1", "N2"). */
  readonly levelCode: string;
  /** Level display name. */
  readonly levelName: string;
  /** Total sales amount for this level. */
  readonly amount: number;
  /** Percentage of total (0–100). */
  readonly percentage: number;
}

// =============================================================================
// Team Performance (Data Table)
// =============================================================================

export type TargetStatus = "exceeding" | "on_track" | "at_risk";

export interface TeamPerformanceRow {
  readonly employeeId: string;
  readonly employeeCode: number;
  readonly firstName: string;
  readonly lastName: string;
  readonly levelCode: string;
  readonly visitCount: number;
  readonly saleCount: number;
  readonly totalAmount: number;
  readonly targetStatus: TargetStatus;
  readonly lastSaleDate: Date | null;
}

// =============================================================================
// Dashboard Data (Composite)
// =============================================================================

export interface DashboardData {
  readonly kpis: KpiSummary;
  readonly dailySales: DailySalesBar[];
  readonly dailySaleCounts: DailySaleCount[];
  /**
   * Daily sale counts for the team members only (excludes the supervisor's own
   * sales). Same baseline as the team objective card. Empty when no team.
   */
  readonly teamDailySaleCounts: DailySaleCount[];
  readonly levelDistribution: LevelDistribution[];
  readonly teamPerformance: TeamPerformanceRow[];
  readonly period: DashboardPeriod;
  readonly dateRange: DateRange;
  /** Whether the user has team members under their scope. */
  readonly hasTeam: boolean;
  /**
   * Personal dashboard data for N3+ users.
   * When hasTeam is true, this contains the individual seller's data
   * for the "Mis ventas" tab. Null for N1/N2 users (they don't have tabs).
   */
  readonly personalDashboard: PersonalDashboardData | null;
}

// =============================================================================
// Personal Dashboard (N3+ "Mis ventas" tab)
// =============================================================================

export interface PersonalDashboardKpis {
  /** Total sales amount all-time for this employee. */
  readonly totalSalesAllTime: number;
  /** Sales amount for the current month. */
  readonly salesThisMonth: number;
  /** Estimated commissions for the current month. */
  readonly estimatedCommissions: number;
  /** Personal target in number of sales (targetPerSeller × subordinateCount). */
  readonly personalTarget: number;
  /** Personal target progress percentage (0–100). */
  readonly personalTargetProgress: number;
}

export interface PersonalDashboardData {
  readonly kpis: PersonalDashboardKpis;
  readonly dailySaleCounts: DailySaleCount[];
}

// =============================================================================
// System Overview (ADMIN dashboard — system health + organization)
// =============================================================================

/** One day of stacked audit activity (bar chart). */
export interface AuditActivityPoint {
  /** ISO date string "YYYY-MM-DD". */
  readonly date: string;
  /** Day of month label (1–31). */
  readonly label: string;
  readonly success: number;
  readonly failure: number;
  readonly denied: number;
}

/** Compact audit event used in the "recent activity" feed. */
export interface SystemAuditEvent {
  readonly id: string;
  readonly actorEmail: string | null;
  readonly action: string;
  readonly result: "SUCCESS" | "FAILURE" | "DENIED";
  readonly createdAt: Date;
}

/** Employee count by level (levelId null = ADMIN). */
export interface LevelEmployeeCount {
  readonly levelId: number | null;
  readonly levelCode: string;
  readonly count: number;
}

export interface SystemOverview {
  readonly kpis: {
    /** Sum of all-time sales amounts across the whole organization. */
    readonly totalSalesAmount: number;
    /** Sum of sales amounts in the current month across the whole organization. */
    readonly monthSalesAmount: number;
    /** Total employees with ACTIVE status. */
    readonly activeEmployeeCount: number;
    /** Dangerous audit events in the current month (FAILURE + DENIED). */
    readonly dangerousAuditEventCount: number;
  };
  /** Last 7 days of audit activity (stacked bar). */
  readonly auditActivity: AuditActivityPoint[];
  /** Sales amounts by level for the current month (donut). */
  readonly levelDistribution: LevelDistribution[];
  /** Recent audit events (feed). */
  readonly recentEvents: SystemAuditEvent[];
}
