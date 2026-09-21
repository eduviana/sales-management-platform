/**
 * Get team performance use case.
 *
 * Returns performance data for all direct subordinates of a supervisor.
 * Used by the /team page to show the full team performance table.
 *
 * Authorization: employee.read with TEAM scope.
 */

import type { AuthorizationService } from "@/modules/authorization/domain";
import type { AuthorizationContext } from "@/modules/authorization/domain";
import type { AnalyticsReadRepository } from "../domain";
import type { TeamPerformanceRow, TargetStatus } from "../domain";
import { AuthorizationError } from "@/shared/errors";

export interface GetTeamPerformanceInput {
  readonly authContext: AuthorizationContext;
}

export interface GetTeamPerformanceOutput {
  readonly teamPerformance: TeamPerformanceRow[];
}

export class GetTeamPerformanceUseCase {
  constructor(
    private readonly authorizationService: AuthorizationService,
    private readonly analyticsRepository: AnalyticsReadRepository,
  ) {}

  async execute(input: GetTeamPerformanceInput): Promise<GetTeamPerformanceOutput> {
    // 1. Authorize
    const decision = await this.authorizationService.authorize(
      input.authContext,
      { permission: "employee.read" },
    );

    if (!decision.allowed) {
      throw new AuthorizationError(
        decision.reason ?? "Not authorized to view team performance.",
      );
    }

    // 2. Resolve date range (current month)
    const now = new Date();
    const dateRange = {
      from: new Date(now.getFullYear(), now.getMonth(), 1),
      to: new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59),
    };

    // 3. Fetch team performance
    const teamPerformance = await this.analyticsRepository.getTeamPerformance(
      input.authContext.employeeId,
      dateRange,
    );

    // 4. Calculate target status for each member
    const teamPerformanceWithStatus = teamPerformance.map((row) => ({
      ...row,
      targetStatus: this.calculateTargetStatus(row.saleCount),
    }));

    return { teamPerformance: teamPerformanceWithStatus };
  }

  private calculateTargetStatus(saleCount: number): TargetStatus {
    if (saleCount >= 10) return "exceeding";
    if (saleCount >= 5) return "on_track";
    return "at_risk";
  }
}
