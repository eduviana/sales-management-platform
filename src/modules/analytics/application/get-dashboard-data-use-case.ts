/**
 * Get dashboard data use case.
 *
 * Orchestrates all dashboard queries: KPIs, charts, team performance.
 * Resolves scope based on user's level and role.
 * Authorization: dashboard.view
 *
 * Reference: requirements.md §2.4–§2.6, §3.2
 */

import type { AuthorizationService } from "@/modules/authorization/domain";
import type { AuthorizationContext } from "@/modules/authorization/domain";
import type { OrganizationRepository } from "@/modules/organization/domain";
import type { AnalyticsReadRepository } from "../domain";
import type {
  DashboardPeriod,
  DateRange,
  DashboardData,
  PersonalDashboardData,
  TargetStatus,
} from "../domain";
import { AuthorizationError } from "@/shared/errors";

export interface GetDashboardDataInput {
  readonly authContext: AuthorizationContext;
  readonly period?: DashboardPeriod;
  /** When true and hasTeam, also fetch personal dashboard data for the "Mis ventas" tab. */
  readonly includePersonalData?: boolean;
}

export class GetDashboardDataUseCase {
  constructor(
    private readonly authorizationService: AuthorizationService,
    private readonly organizationRepository: OrganizationRepository,
    private readonly analyticsRepository: AnalyticsReadRepository,
  ) {}

  async execute(input: GetDashboardDataInput): Promise<DashboardData> {
    const period = input.period ?? "month";

    // 1. Authorize
    const decision = await this.authorizationService.authorize(
      input.authContext,
      { permission: "dashboard.view" },
    );

    if (!decision.allowed) {
      throw new AuthorizationError(
        decision.reason ?? "Not authorized to view dashboard.",
      );
    }

    // 2. Resolve date range from period
    const dateRange = this.resolveDateRange(period);

    // 3. Resolve employee IDs based on scope
    const { employeeIds, hasTeam } = await this.resolveScope(input.authContext);

    // 4. Fetch all dashboard data in parallel
    const [
      totalSalesAmount,
      personalSalesAmount,
      activeSellerCount,
      currentSales,
      pendingReviewCount,
      approvedCount,
      dailySales,
      dailySaleCounts,
      levelDistribution,
      teamPerformance,
      totalSalesAllTime,
      salesThisMonth,
      personalSalesHistory,
    ] = await Promise.all([
      this.analyticsRepository.sumSalesAmount(employeeIds, dateRange),
      this.analyticsRepository.sumPersonalSales(input.authContext.employeeId, dateRange),
      this.analyticsRepository.countActiveSellers(employeeIds, dateRange),
      this.analyticsRepository.countSales(employeeIds, dateRange),
      this.analyticsRepository.countPendingReviewSales(employeeIds, dateRange),
      this.analyticsRepository.countApprovedSales(employeeIds, dateRange),
      this.analyticsRepository.getDailySales(employeeIds, dateRange),
      this.analyticsRepository.getMonthlySaleCounts(employeeIds, dateRange),
      this.analyticsRepository.getLevelDistribution(employeeIds, dateRange),
      hasTeam
        ? this.analyticsRepository.getTeamPerformance(input.authContext.employeeId, dateRange)
        : Promise.resolve([]),
      this.analyticsRepository.sumAllTimeSales(input.authContext.employeeId),
      this.analyticsRepository.sumCurrentMonthSales(input.authContext.employeeId),
      !hasTeam
        ? this.analyticsRepository.getPersonalSalesHistory(input.authContext.employeeId, dateRange)
        : Promise.resolve([]),
    ]);

    // 5. Calculate target
    const targetTotal = await this.calculateTarget(input.authContext, hasTeam, employeeIds.length);
    const targetProgress = targetTotal > 0
      ? Math.min(Math.round((currentSales / targetTotal) * 100), 100)
      : 0;

    // 6. Calculate target amount (targetTotal × average sale amount)
    const averageSaleAmount = currentSales > 0 ? personalSalesAmount / currentSales : 0;
    const targetAmount = Math.round(targetTotal * averageSaleAmount * 100) / 100;

    // 7. Calculate estimated commissions for the current month
    const estimatedCommissions = await this.calculateEstimatedCommissions(
      input.authContext,
      salesThisMonth,
    );

    // 7. Calculate target status for team members
    const teamPerformanceWithStatus = teamPerformance.map((row) => ({
      ...row,
      targetStatus: this.calculateTargetStatus(row.saleCount),
    }));

    // 8. Personal dashboard data (N3+ "Mis ventas" tab)
    let personalDashboard: PersonalDashboardData | null = null;
    if (hasTeam && input.includePersonalData) {
      const employeeId = input.authContext.employeeId;

      const [personalDailySaleCounts, personalSalesHistory, personalSalesAmount, personalCurrentSales] =
        await Promise.all([
          this.analyticsRepository.getMonthlySaleCounts([employeeId], dateRange),
          this.analyticsRepository.getPersonalSalesHistory(employeeId, dateRange),
          this.analyticsRepository.sumPersonalSales(employeeId, dateRange),
          this.analyticsRepository.countSales([employeeId], dateRange),
        ]);

      const personalTarget = await this.calculateTarget(input.authContext, false, 1);
      const personalTargetProgress = personalTarget > 0
        ? Math.min(Math.round((personalCurrentSales / personalTarget) * 100), 100)
        : 0;

      const personalEstimatedCommissions = await this.calculateEstimatedCommissions(
        input.authContext,
        personalSalesAmount,
      );

      personalDashboard = {
        kpis: {
          totalSalesAllTime,
          salesThisMonth,
          estimatedCommissions: personalEstimatedCommissions,
          personalTarget,
          personalTargetProgress,
        },
        dailySaleCounts: personalDailySaleCounts,
        salesHistory: personalSalesHistory,
      };
    }

    return {
      kpis: {
        totalSalesAmount,
        personalSalesAmount,
        activeSellerCount,
        targetProgress,
        targetTotal,
        targetAmount,
        currentSales,
        pendingReviewCount,
        approvedCount,
        totalSalesAllTime,
        salesThisMonth,
        estimatedCommissions,
      },
      dailySales,
      dailySaleCounts,
      levelDistribution,
      teamPerformance: teamPerformanceWithStatus,
      personalSalesHistory,
      period,
      dateRange,
      hasTeam,
      personalDashboard,
    };
  }

  // =========================================================================
  // Private helpers
  // =========================================================================

  private resolveDateRange(period: DashboardPeriod): DateRange {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

    switch (period) {
      case "today":
        return {
          from: today,
          to: new Date(today.getFullYear(), today.getMonth(), today.getDate(), 23, 59, 59),
        };

      case "week": {
        const dayOfWeek = today.getDay();
        const mondayOffset = dayOfWeek === 0 ? -6 : 1 - dayOfWeek;
        const monday = new Date(today);
        monday.setDate(today.getDate() + mondayOffset);
        return { from: monday, to: now };
      }

      case "month":
      default: {
        const firstDay = new Date(now.getFullYear(), now.getMonth(), 1);
        return { from: firstDay, to: now };
      }
    }
  }

  private async resolveScope(
    context: AuthorizationContext,
  ): Promise<{ employeeIds: string[]; hasTeam: boolean }> {
    const isAdmin = context.role === "ADMIN";
    const levelId = context.levelId;

    // ADMIN or Level 7 → GLOBAL
    if (isAdmin || (levelId !== null && levelId >= 7)) {
      const allIds = await this.organizationRepository.getActiveEmployeeIds();
      return { employeeIds: allIds, hasTeam: true };
    }

    // Level 4–6 → BRANCH (self + all descendants)
    if (levelId !== null && levelId >= 4) {
      const descendants = await this.organizationRepository.getDescendantIds(context.employeeId);
      return {
        employeeIds: [context.employeeId, ...descendants],
        hasTeam: descendants.length > 0,
      };
    }

    // Level 3 → TEAM (self + direct subordinates)
    if (levelId !== null && levelId >= 3) {
      const subordinates = await this.organizationRepository.getDirectSubordinates(context.employeeId);
      return {
        employeeIds: [context.employeeId, ...subordinates.map((e) => e.id)],
        hasTeam: subordinates.length > 0,
      };
    }

    // Level 1–2 → OWN (self only)
    return { employeeIds: [context.employeeId], hasTeam: false };
  }

  private async calculateTarget(
    context: AuthorizationContext,
    hasTeam: boolean,
    employeeCount: number,
  ): Promise<number> {
    const levelId = context.levelId;
    if (levelId === null) return 0; // ADMIN has no personal target

    const targetPerSeller = await this.analyticsRepository.getMonthlyTarget(levelId);

    if (!hasTeam) {
      // Individual seller: target is per-seller
      return targetPerSeller;
    }

    // Supervisor: target is per-seller × number of subordinates (excluding self)
    const subordinateCount = employeeCount - 1;
    return subordinateCount > 0 ? targetPerSeller * subordinateCount : targetPerSeller;
  }

  private calculateTargetStatus(saleCount: number): TargetStatus {
    // Target status is based on percentage of target achieved
    // This is a simplified heuristic; could be made configurable
    if (saleCount >= 10) return "exceeding";
    if (saleCount >= 5) return "on_track";
    return "at_risk";
  }

  private async calculateEstimatedCommissions(
    context: AuthorizationContext,
    salesThisMonth: number,
  ): Promise<number> {
    const levelId = context.levelId;
    if (levelId === null || salesThisMonth <= 0) return 0;

    const percentage = await this.analyticsRepository.getCommissionPercentage(
      levelId,
      new Date(),
    );

    if (percentage <= 0) return 0;

    return Math.round((salesThisMonth * percentage) / 100 * 100) / 100;
  }
}
