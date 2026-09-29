/**
 * Calculate and record progression use case.
 *
 * Calculates points from existing data (seniority, visits, sales, targets).
 * - Seniority, visits, and sales are calculated in real-time from source tables.
 * - Monthly target bonuses are recorded in employee_progress (idempotent).
 *
 * Reference: business-rules.md REG-082
 */

import type { PrismaClient } from "@prisma/client";
import type { ProgressionRepository } from "../domain/progression-repository";
import { POINT_VALUES } from "../domain";

export interface CalculateProgressionInput {
  readonly employeeId: string;
  readonly currentLevelId: number | null;
  readonly joinedAt: Date;
}

export class CalculateProgressionUseCase {
  constructor(
    private readonly prisma: PrismaClient,
    private readonly progressionRepository: ProgressionRepository,
  ) {}

  async execute(input: CalculateProgressionInput): Promise<void> {
    const { employeeId, currentLevelId, joinedAt } = input;

    if (currentLevelId === null) return; // ADMIN has no progression

    const now = new Date();

    // Baseline: progression is measured from the start of the current level.
    // Only record monthly target bonuses earned within the current level
    // (checks for duplicates, idempotent).
    const levelStartDate = await this.getLevelStartDate(employeeId, joinedAt);
    const monthlyTargets = await this.getMonthlyTargets(currentLevelId);
    const monthsToCheck = Math.min(this.monthsBetween(levelStartDate, now), 12);

    const newBonuses: Array<{
      employeeId: string;
      type: "TARGET_ACHIEVED";
      points: number;
      description: string;
      period: string;
    }> = [];

    for (let i = 0; i < monthsToCheck; i++) {
      const targetDate = new Date(now);
      targetDate.setMonth(targetDate.getMonth() - i);
      const period = `${targetDate.getFullYear()}-${String(targetDate.getMonth() + 1).padStart(2, "0")}`;

      // Check if already recorded
      const hasBonus = await this.progressionRepository.hasTargetBonus(employeeId, period);
      if (hasBonus) continue;

      // Count sales in that month
      const monthStart = new Date(targetDate.getFullYear(), targetDate.getMonth(), 1);
      const monthEnd = new Date(targetDate.getFullYear(), targetDate.getMonth() + 1, 0, 23, 59, 59);

      const salesInMonth = await this.prisma.sale.count({
        where: {
          employeeId,
          status: "APPROVED",
          saleDate: { gte: monthStart, lte: monthEnd },
        },
      });

      if (monthlyTargets > 0 && salesInMonth >= monthlyTargets) {
        newBonuses.push({
          employeeId,
          type: "TARGET_ACHIEVED",
          points: POINT_VALUES.TARGET_ACHIEVED,
          description: `Objetivo mensual alcanzado en ${period}`,
          period,
        });
      }
    }

    // Record new target bonuses
    if (newBonuses.length > 0) {
      await this.progressionRepository.recordEntries(newBonuses);
    }
  }

  private monthsBetween(from: Date, to: Date): number {
    const fromD = new Date(from);
    const toD = new Date(to);
    return (toD.getFullYear() - fromD.getFullYear()) * 12 + (toD.getMonth() - fromD.getMonth());
  }

  private async getLevelStartDate(
    employeeId: string,
    joinedAt: Date,
  ): Promise<Date> {
    const openHistory = await this.prisma.employeeLevelHistory.findFirst({
      where: { employeeId, endedAt: null },
      orderBy: { startedAt: "desc" },
      select: { startedAt: true },
    });
    return openHistory?.startedAt ?? joinedAt;
  }

  private async getMonthlyTargets(levelId: number): Promise<number> {
    const target = await this.prisma.monthlyTarget.findUnique({
      where: { levelId },
    });
    return target?.targetSales ?? 0;
  }
}
