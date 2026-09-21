/**
 * Prisma-based implementation of ProgressionRepository.
 *
 * Reference: data-architecture.md
 */

import type { PrismaClient } from "@prisma/client";
import type { ProgressionRepository } from "../domain/progression-repository";
import type { ProgressEntry, ProgressType } from "../domain";

export class PrismaProgressionRepository implements ProgressionRepository {
  constructor(private readonly prisma: PrismaClient) {}

  async getEntriesByEmployee(employeeId: string): Promise<ProgressEntry[]> {
    const entries = await this.prisma.employeeProgress.findMany({
      where: { employeeId },
      orderBy: { createdAt: "desc" },
    });
    return entries.map((e) => this.mapEntry(e));
  }

  async getEntriesByPeriod(employeeId: string, period: string): Promise<ProgressEntry[]> {
    const entries = await this.prisma.employeeProgress.findMany({
      where: { employeeId, period },
      orderBy: { createdAt: "desc" },
    });
    return entries.map((e) => this.mapEntry(e));
  }

  async recordEntry(entry: Omit<ProgressEntry, "id" | "createdAt">): Promise<ProgressEntry> {
    const created = await this.prisma.employeeProgress.create({
      data: {
        employeeId: entry.employeeId,
        type: entry.type,
        points: entry.points,
        description: entry.description,
        period: entry.period,
      },
    });
    return this.mapEntry(created);
  }

  async recordEntries(entries: Array<Omit<ProgressEntry, "id" | "createdAt">>): Promise<void> {
    await this.prisma.employeeProgress.createMany({
      data: entries.map((e) => ({
        employeeId: e.employeeId,
        type: e.type,
        points: e.points,
        description: e.description,
        period: e.period,
      })),
    });
  }

  async hasTargetBonus(employeeId: string, period: string): Promise<boolean> {
    const count = await this.prisma.employeeProgress.count({
      where: {
        employeeId,
        type: "TARGET_ACHIEVED",
        period,
      },
    });
    return count > 0;
  }

  async getPointsSummaryByEmployees(
    employeeIds: string[],
  ): Promise<Map<string, { total: number; seniority: number; visits: number; sales: number; targets: number }>> {
    if (employeeIds.length === 0) return new Map();

    const entries = await this.prisma.employeeProgress.groupBy({
      by: ["employeeId", "type"],
      where: { employeeId: { in: employeeIds } },
      _sum: { points: true },
    });

    const summaryMap = new Map<string, { total: number; seniority: number; visits: number; sales: number; targets: number }>();

    // Initialize all employees
    for (const id of employeeIds) {
      summaryMap.set(id, { total: 0, seniority: 0, visits: 0, sales: 0, targets: 0 });
    }

    // Aggregate by employee and type
    for (const entry of entries) {
      const summary = summaryMap.get(entry.employeeId);
      if (!summary) continue;

      const points = entry._sum.points ?? 0;
      summary.total += points;

      switch (entry.type) {
        case "SENIORITY":
          summary.seniority += points;
          break;
        case "VISIT":
          summary.visits += points;
          break;
        case "SALE":
          summary.sales += points;
          break;
        case "TARGET_ACHIEVED":
          summary.targets += points;
          break;
      }
    }

    return summaryMap;
  }

  private mapEntry(raw: {
    id: string;
    employeeId: string;
    type: string;
    points: number;
    description: string | null;
    period: string | null;
    createdAt: Date;
  }): ProgressEntry {
    return {
      id: raw.id,
      employeeId: raw.employeeId,
      type: raw.type as ProgressType,
      points: raw.points,
      description: raw.description,
      period: raw.period,
      createdAt: raw.createdAt,
    };
  }
}
