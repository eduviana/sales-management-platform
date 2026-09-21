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
// Personal Sales History (N1/N2 Table)
// =============================================================================

export type SaleStatusDisplay = "PENDING_REVIEW" | "APPROVED" | "REJECTED" | "CANCELLED";

export interface PersonalSalesRow {
  readonly saleId: string;
  readonly saleDate: string;
  readonly buyerName: string;
  readonly totalAmount: number;
  readonly status: SaleStatusDisplay;
}

// =============================================================================
// Dashboard Data (Composite)
// =============================================================================

export interface DashboardData {
  readonly kpis: KpiSummary;
  readonly dailySales: DailySalesBar[];
  readonly dailySaleCounts: DailySaleCount[];
  readonly levelDistribution: LevelDistribution[];
  readonly teamPerformance: TeamPerformanceRow[];
  readonly personalSalesHistory: PersonalSalesRow[];
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
  readonly salesHistory: PersonalSalesRow[];
}
