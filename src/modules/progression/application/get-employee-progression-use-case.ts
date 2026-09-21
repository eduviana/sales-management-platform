/**
 * Get employee progression use case.
 *
 * Returns the current progression summary for an employee.
 * - Seniority, visits, and sales points are calculated in real-time.
 * - Target bonus points are read from employee_progress.
 *
 * Reference: business-rules.md REG-082
 */

import type { PrismaClient } from "@prisma/client";
import type { EmployeeProgression, ProgressionBreakdown } from "../domain";
import { getThresholdForLevel, POINT_VALUES } from "../domain";
import type { ProgressionRepository } from "../domain/progression-repository";

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
    private readonly prisma: PrismaClient,
    private readonly progressionRepository: ProgressionRepository,
  ) {}

  async execute(input: GetEmployeeProgressionInput): Promise<EmployeeProgression> {
    const { employeeId, currentLevelId, joinedAt } = input;

    // 1. Seniority: months since joinedAt
    const monthsSinceJoining = this.monthsBetween(joinedAt, new Date());
    const seniorityPoints = monthsSinceJoining * POINT_VALUES.SENIORITY;

    // 2. Visits: count completed visits (COMPLETED, NO_SALE)
    const visitCount = await this.prisma.visit.count({
      where: {
        sellerId: employeeId,
        status: { in: ["COMPLETED", "NO_SALE"] },
      },
    });
    const visitPoints = visitCount * POINT_VALUES.VISIT;

    // 3. Sales: count approved sales
    const saleCount = await this.prisma.sale.count({
      where: {
        employeeId,
        status: "APPROVED",
      },
    });
    const salePoints = saleCount * POINT_VALUES.SALE;

    // 4. Target bonuses: read from employee_progress
    const targetEntries = await this.progressionRepository.getEntriesByEmployee(employeeId);
    const targetPoints = targetEntries
      .filter((e) => e.type === "TARGET_ACHIEVED")
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

    // Get target bonuses for all employees in one query
    const employeeIds = employees.map((e) => e.id);
    const targetBonuses = await this.getTargetBonusesBatch(employeeIds);

    for (const emp of employees) {
      if (emp.currentLevelId === null) continue;

      // Seniority
      const monthsSinceJoining = this.monthsBetween(emp.joinedAt, new Date());
      const seniorityPoints = monthsSinceJoining * POINT_VALUES.SENIORITY;

      // Visits
      const visitCount = await this.prisma.visit.count({
        where: {
          sellerId: emp.id,
          status: { in: ["COMPLETED", "NO_SALE"] },
        },
      });
      const visitPoints = visitCount * POINT_VALUES.VISIT;

      // Sales
      const saleCount = await this.prisma.sale.count({
        where: {
          employeeId: emp.id,
          status: "APPROVED",
        },
      });
      const salePoints = saleCount * POINT_VALUES.SALE;

      // Target bonuses
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

  private async getTargetBonusesBatch(employeeIds: string[]): Promise<Map<string, number>> {
    if (employeeIds.length === 0) return new Map();

    const entries = await this.prisma.employeeProgress.groupBy({
      by: ["employeeId"],
      where: {
        employeeId: { in: employeeIds },
        type: "TARGET_ACHIEVED",
      },
      _sum: { points: true },
    });

    const map = new Map<string, number>();
    for (const entry of entries) {
      map.set(entry.employeeId, entry._sum.points ?? 0);
    }
    return map;
  }

  private monthsBetween(from: Date, to: Date): number {
    const fromD = new Date(from);
    const toD = new Date(to);
    return (toD.getFullYear() - fromD.getFullYear()) * 12 + (toD.getMonth() - fromD.getMonth());
  }
}
