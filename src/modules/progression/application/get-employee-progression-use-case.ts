/**
 * Get employee progression use case.
 *
 * Returns the current progression summary for an employee.
 * - Seniority, visits, and sales points are calculated in real-time from the
 *   owning modules' read ports.
 * - Target bonus points are read from employee_progress.
 *
 * Progression is measured from the start of the current level
 * (the startedAt of the open EmployeeLevelHistory record), not from
 * joinedAt. When an employee is promoted, a new level history record is
 * opened with startedAt = now, so the progression bar resets to 0%
 * and grows month by month (Option A, REG-082).
 *
 * Reference: business-rules.md REG-082
 */

import type { EmployeeProgression, ProgressionBreakdown } from "../domain";
import { getThresholdForLevel, POINT_VALUES } from "../domain";
import type { ProgressionRepository } from "../domain/progression-repository";
import type { OrganizationRepository } from "@/modules/organization/domain";
import type { SaleRepository } from "@/modules/sales/domain";
import type { VisitRepository } from "@/modules/visits/domain";

export interface GetEmployeeProgressionInput {
  readonly employeeId: string;
  readonly currentLevelId: number | null;
  readonly joinedAt: Date;
}

/** Simplified progression for list view (no detailed breakdown). */
export interface EmployeeProgressSummary {
  readonly employeeId: string;
  readonly currentLevelId: number | null;
  readonly currentPoints: number;
  readonly pointsToNextLevel: number;
  readonly percentage: number;
}

export class GetEmployeeProgressionUseCase {
  constructor(
    private readonly progressionRepository: ProgressionRepository,
    private readonly organizationRepository: OrganizationRepository,
    private readonly saleRepository: SaleRepository,
    private readonly visitRepository: VisitRepository,
  ) {}

  async execute(input: GetEmployeeProgressionInput): Promise<EmployeeProgression> {
    const { employeeId, currentLevelId, joinedAt } = input;

    // 0. Baseline: progression is measured from the start of the current level
    const levelStartDate = await this.getLevelStartDate(employeeId, joinedAt);

    // 1. Seniority: months since the start of the current level
    const monthsSinceLevelStart = this.monthsBetween(levelStartDate, new Date());
    const seniorityPoints = monthsSinceLevelStart * POINT_VALUES.SENIORITY;

    // 2. Visits: count completed visits (COMPLETED, NO_SALE) since level start
    const visitCount = await this.visitRepository.countCompletedBySellerIdSince(
      employeeId,
      levelStartDate,
    );
    const visitPoints = visitCount * POINT_VALUES.VISIT;

    // 3. Sales: count approved sales since level start
    const saleCount = await this.saleRepository.countApprovedSince(
      employeeId,
      levelStartDate,
    );
    const salePoints = saleCount * POINT_VALUES.SALE;

    // 4. Target bonuses: read from employee_progress (created since level start)
    const targetEntries = await this.progressionRepository.getEntriesByEmployee(employeeId);
    const targetPoints = targetEntries
      .filter(
        (e) =>
          e.type === "TARGET_ACHIEVED" &&
          e.createdAt >= levelStartDate,
      )
      .reduce((sum, e) => sum + e.points, 0);

    const breakdown: ProgressionBreakdown = {
      seniorityPoints,
      visitPoints,
      salePoints,
      targetPoints,
    };

    const totalPoints = seniorityPoints + visitPoints + salePoints + targetPoints;
    const threshold = getThresholdForLevel(currentLevelId);
    const percentage = threshold > 0
      ? Math.min(Math.round((totalPoints / threshold) * 100), 100)
      : 0;

    return {
      employeeId,
      currentLevelId,
      currentPoints: totalPoints,
      pointsToNextLevel: Math.max(threshold - totalPoints, 0),
      percentage,
      breakdown,
    };
  }

  /** Get progression summaries for multiple employees (batch). */
  async executeBatch(
    employees: Array<{ id: string; currentLevelId: number | null; joinedAt: Date }>,
  ): Promise<Map<string, EmployeeProgressSummary>> {
    const result = new Map<string, EmployeeProgressSummary>();
    const withLevel = employees.filter((e) => e.currentLevelId !== null);
    if (withLevel.length === 0) return result;

    // Baseline per employee: start of the current level (fallback: joinedAt)
    const levelStartByEmployee = await this.getLevelStartDates(
      withLevel.map((e) => e.id),
    );
    const levelStartDates = new Map(
      withLevel.map((e) => [e.id, levelStartByEmployee.get(e.id) ?? e.joinedAt]),
    );

    // Visits and sales since each employee's own level start
    const visitCounts = await this.visitRepository.countCompletedBySellerIdSinceBatch(
      withLevel.map((e) => ({
        sellerId: e.id,
        since: levelStartDates.get(e.id) ?? e.joinedAt,
      })),
    );
    const saleCounts = await this.saleRepository.countApprovedSinceByEmployee(
      withLevel.map((e) => ({
        employeeId: e.id,
        since: levelStartDates.get(e.id) ?? e.joinedAt,
      })),
    );

    // Target bonuses for all employees in one query
    const targetBonuses = await this.getTargetBonusesBatch(
      withLevel.map((e) => e.id),
      levelStartDates,
    );

    for (const emp of withLevel) {
      const levelStartDate = levelStartDates.get(emp.id) ?? emp.joinedAt;

      // Seniority
      const monthsSinceLevelStart = this.monthsBetween(levelStartDate, new Date());
      const seniorityPoints = monthsSinceLevelStart * POINT_VALUES.SENIORITY;

      const visitPoints =
        (visitCounts.get(emp.id) ?? 0) * POINT_VALUES.VISIT;
      const salePoints = (saleCounts.get(emp.id) ?? 0) * POINT_VALUES.SALE;
      const targetPoints = targetBonuses.get(emp.id) ?? 0;

      const totalPoints = seniorityPoints + visitPoints + salePoints + targetPoints;
      const threshold = getThresholdForLevel(emp.currentLevelId);
      const percentage = threshold > 0
        ? Math.min(Math.round((totalPoints / threshold) * 100), 100)
        : 0;

      result.set(emp.id, {
        employeeId: emp.id,
        currentLevelId: emp.currentLevelId,
        currentPoints: totalPoints,
        pointsToNextLevel: Math.max(threshold - totalPoints, 0),
        percentage,
      });
    }

    return result;
  }

  /** Return the start date for the employee's current level (open history), fallback to joinedAt. */
  private async getLevelStartDate(
    employeeId: string,
    joinedAt: Date,
  ): Promise<Date> {
    const openHistory =
      await this.organizationRepository.findOpenLevelHistory(employeeId);
    return openHistory?.startedAt ?? joinedAt;
  }

  /** Return the start date of the current level for multiple employees. */
  private async getLevelStartDates(
    employeeIds: string[],
  ): Promise<Map<string, Date>> {
    if (employeeIds.length === 0) return new Map();

    const records =
      await this.organizationRepository.findOpenLevelHistories(employeeIds);

    return new Map(records.map((r) => [r.employeeId, r.startedAt]));
  }

  private async getTargetBonusesBatch(
    employeeIds: string[],
    levelStartDates: Map<string, Date>,
  ): Promise<Map<string, number>> {
    if (employeeIds.length === 0) return new Map();

    const entries = await this.progressionRepository.getEntriesByEmployees(
      employeeIds,
    );

    const map = new Map<string, number>();
    for (const entry of entries) {
      const levelStartDate = levelStartDates.get(entry.employeeId);
      if (!levelStartDate) continue;
      if (entry.type !== "TARGET_ACHIEVED") continue;
      if (entry.createdAt >= levelStartDate) {
        map.set(entry.employeeId, (map.get(entry.employeeId) ?? 0) + entry.points);
      }
    }
    return map;
  }

  private monthsBetween(from: Date, to: Date): number {
    const fromD = new Date(from);
    const toD = new Date(to);
    return (toD.getFullYear() - fromD.getFullYear()) * 12 + (toD.getMonth() - fromD.getMonth());
  }
}
