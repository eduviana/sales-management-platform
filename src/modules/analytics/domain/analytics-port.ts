/**
 * Read repository port for analytics and dashboard queries.
 *
 * Infrastructure implements this port with Prisma/SQL.
 * Application consumes it without knowing the persistence details.
 *
 * Reference: system-architecture.md §16, data-architecture.md §11
 */

import type {
  DateRange,
  DailySalesBar,
  DailySaleCount,
  LevelDistribution,
  TeamPerformanceRow,
  LevelEmployeeCount,
} from "./dashboard-metrics";

export interface AnalyticsReadRepository {
  /**
   * Sum of sales amounts for a set of employee IDs within a date range.
   * Only counts APPROVED and PENDING_REVIEW sales.
   */
  sumSalesAmount(employeeIds: string[], dateRange: DateRange): Promise<number>;

  /**
   * Count of distinct sellers with sales in the period.
   */
  countActiveSellers(employeeIds: string[], dateRange: DateRange): Promise<number>;

  /**
   * Count of sales (not amount) for the scope in the period.
   */
  countSales(employeeIds: string[], dateRange: DateRange): Promise<number>;

  /**
   * Count of sales with PENDING_REVIEW status.
   */
  countPendingReviewSales(employeeIds: string[], dateRange: DateRange): Promise<number>;

  /**
   * Count of sales with APPROVED status.
   */
  countApprovedSales(employeeIds: string[], dateRange: DateRange): Promise<number>;

  /**
   * Sum of personal sales for a specific employee.
   */
  sumPersonalSales(employeeId: string, dateRange: DateRange): Promise<number>;

  /**
   * Daily sales breakdown for chart rendering.
   */
  getDailySales(employeeIds: string[], dateRange: DateRange): Promise<DailySalesBar[]>;

  /**
   * Monthly sale counts for chart rendering.
   * Accepts one or more employee IDs.
   */
  getMonthlySaleCounts(employeeIds: string[], dateRange: DateRange): Promise<DailySaleCount[]>;

  /**
   * Sales distribution by employee level.
   */
  getLevelDistribution(employeeIds: string[], dateRange: DateRange): Promise<LevelDistribution[]>;

  /**
   * Team performance table data for direct reports of a supervisor.
   */
  getTeamPerformance(supervisorId: string, dateRange: DateRange): Promise<TeamPerformanceRow[]>;

  /**
   * Personal performance row for a single employee (used for N1/N2 without team).
   */
  getPersonalPerformance(employeeId: string, dateRange: DateRange): Promise<TeamPerformanceRow | null>;

  /**
   * Get the monthly sales target for a given level.
   * Returns the target per seller from the monthly_target table.
   */
  getMonthlyTarget(levelId: number): Promise<number>;

  /**
   * Sum of all-time sales for a specific employee (no date filter).
   * Only counts APPROVED and PENDING_REVIEW sales.
   */
  sumAllTimeSales(employeeId: string): Promise<number>;

  /**
   * Sum of all-time sales for a set of employees (no date filter).
   * Only counts APPROVED and PENDING_REVIEW sales.
   */
  sumAllTimeSalesForEmployees(employeeIds: string[]): Promise<number>;

  /**
   * Sum of personal sales for the current calendar month.
   * Only counts APPROVED and PENDING_REVIEW sales.
   */
  sumCurrentMonthSales(employeeId: string): Promise<number>;

  /**
   * Get the applicable commission percentage for a given level at a point in time.
   * Returns 0 if no rule is found.
   */
  getCommissionPercentage(levelId: number, at: Date): Promise<number>;
}

// =============================================================================
// System admin read port (ADMIN dashboard — system health + organization)
// =============================================================================

export interface SystemAdminReadRepository {
  /** Total employees with ACTIVE status. */
  countActiveEmployees(): Promise<number>;

  /** Employee count by level (all statuses). */
  getLevelEmployeeCounts(): Promise<LevelEmployeeCount[]>;
}
