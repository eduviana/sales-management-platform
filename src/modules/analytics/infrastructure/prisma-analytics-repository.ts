/**
 * Prisma-based implementation of AnalyticsReadRepository.
 *
 * Encapsulates all Prisma and SQL details within the Infrastructure layer.
 * Uses a mix of Prisma aggregate/groupBy and raw SQL for complex aggregations.
 *
 * Reference: system-architecture.md §16, data-architecture.md §11
 */

import type { PrismaClient } from "@prisma/client";
import type {
  AnalyticsReadRepository,
  SystemAdminReadRepository,
  DateRange,
  DailySalesBar,
  DailySaleCount,
  LevelDistribution,
  TeamPerformanceRow,
  LevelEmployeeCount,
} from "../domain";

/** Spanish month abbreviations for chart labels. */
const MONTH_LABELS = ["Ene", "Feb", "Mar", "Abr", "May", "Jun", "Jul", "Ago", "Sep", "Oct", "Nov", "Dic"];

/** Statuses that count as valid sales for analytics. */
const VALID_STATUSES = ["APPROVED", "PENDING_REVIEW"] as const;

export class PrismaAnalyticsRepository implements AnalyticsReadRepository, SystemAdminReadRepository {
  constructor(private readonly prisma: PrismaClient) {}

  // =========================================================================
  // KPI aggregations
  // =========================================================================

  async sumSalesAmount(employeeIds: string[], dateRange: DateRange): Promise<number> {
    if (employeeIds.length === 0) return 0;

    const result = await this.prisma.sale.aggregate({
      _sum: { totalAmount: true },
      where: {
        employeeId: { in: employeeIds },
        saleDate: { gte: dateRange.from, lte: dateRange.to },
        status: { in: [...VALID_STATUSES] },
      },
    });

    return Number(result._sum.totalAmount ?? 0);
  }

  async countActiveSellers(employeeIds: string[], dateRange: DateRange): Promise<number> {
    if (employeeIds.length === 0) return 0;

    const result = await this.prisma.sale.findMany({
      where: {
        employeeId: { in: employeeIds },
        saleDate: { gte: dateRange.from, lte: dateRange.to },
        status: { in: [...VALID_STATUSES] },
      },
      distinct: ["employeeId"],
      select: { employeeId: true },
    });

    return result.length;
  }

  async countSales(employeeIds: string[], dateRange: DateRange): Promise<number> {
    if (employeeIds.length === 0) return 0;

    return this.prisma.sale.count({
      where: {
        employeeId: { in: employeeIds },
        saleDate: { gte: dateRange.from, lte: dateRange.to },
        status: { in: [...VALID_STATUSES] },
      },
    });
  }

  async countPendingReviewSales(employeeIds: string[], dateRange: DateRange): Promise<number> {
    if (employeeIds.length === 0) return 0;

    return this.prisma.sale.count({
      where: {
        employeeId: { in: employeeIds },
        saleDate: { gte: dateRange.from, lte: dateRange.to },
        status: "PENDING_REVIEW",
      },
    });
  }

  async countApprovedSales(employeeIds: string[], dateRange: DateRange): Promise<number> {
    if (employeeIds.length === 0) return 0;

    return this.prisma.sale.count({
      where: {
        employeeId: { in: employeeIds },
        saleDate: { gte: dateRange.from, lte: dateRange.to },
        status: "APPROVED",
      },
    });
  }

  async sumPersonalSales(employeeId: string, dateRange: DateRange): Promise<number> {
    const result = await this.prisma.sale.aggregate({
      _sum: { totalAmount: true },
      where: {
        employeeId,
        saleDate: { gte: dateRange.from, lte: dateRange.to },
        status: { in: [...VALID_STATUSES] },
      },
    });

    return Number(result._sum.totalAmount ?? 0);
  }

  // =========================================================================
  // Chart data
  // =========================================================================

  async getDailySales(employeeIds: string[], dateRange: DateRange): Promise<DailySalesBar[]> {
    if (employeeIds.length === 0) return [];

    const rows: Array<{ month: string; amount: bigint }> = await this.prisma.$queryRaw`
      SELECT
        TO_CHAR("saleDate", 'YYYY-MM') AS month,
        COALESCE(SUM("totalAmount"), 0) AS amount
      FROM sale
      WHERE "employeeId" = ANY(${employeeIds}::uuid[])
        AND "saleDate" BETWEEN ${dateRange.from} AND ${dateRange.to}
        AND "status" IN ('APPROVED', 'PENDING_REVIEW')
      GROUP BY TO_CHAR("saleDate", 'YYYY-MM')
      ORDER BY month
    `;

    return rows.map((row) => {
      const monthNum = parseInt(row.month.split("-")[1], 10);
      return {
        date: row.month,
        label: MONTH_LABELS[monthNum - 1],
        amount: Number(row.amount),
      };
    });
  }

  async getMonthlySaleCounts(employeeIds: string[], dateRange: DateRange): Promise<DailySaleCount[]> {
    if (employeeIds.length === 0) return [];

    const rows: Array<{ month: string; sale_count: bigint }> = await this.prisma.$queryRaw`
      SELECT
        TO_CHAR("saleDate", 'YYYY-MM') AS month,
        COUNT(id) AS sale_count
      FROM sale
      WHERE "employeeId" = ANY(${employeeIds}::uuid[])
        AND "saleDate" BETWEEN ${dateRange.from} AND ${dateRange.to}
        AND "status" IN ('APPROVED', 'PENDING_REVIEW')
      GROUP BY TO_CHAR("saleDate", 'YYYY-MM')
      ORDER BY month
    `;

    return rows.map((row) => {
      const monthNum = parseInt(row.month.split("-")[1], 10);
      return {
        date: row.month,
        label: MONTH_LABELS[monthNum - 1],
        count: Number(row.sale_count),
      };
    });
  }

  async getLevelDistribution(employeeIds: string[], dateRange: DateRange): Promise<LevelDistribution[]> {
    if (employeeIds.length === 0) return [];

    const rows: Array<{
      level_code: string;
      level_name: string;
      amount: bigint;
    }> = await this.prisma.$queryRaw`
      SELECT
        l.code AS level_code,
        l.name AS level_name,
        COALESCE(SUM(s."totalAmount"), 0) AS amount
      FROM sale s
      JOIN employee e ON s."employeeId" = e.id
      JOIN level l ON e."currentLevelId" = l.id
      WHERE s."employeeId" = ANY(${employeeIds}::uuid[])
        AND s."saleDate" BETWEEN ${dateRange.from} AND ${dateRange.to}
        AND s."status" IN ('APPROVED', 'PENDING_REVIEW')
      GROUP BY l.code, l.name
      ORDER BY amount DESC
    `;

    const total = rows.reduce((sum, r) => sum + Number(r.amount), 0);

    return rows.map((row) => ({
      levelCode: row.level_code,
      levelName: row.level_name,
      amount: Number(row.amount),
      percentage: total > 0 ? Math.round((Number(row.amount) / total) * 100) : 0,
    }));
  }

  // =========================================================================
  // Team performance
  // =========================================================================

  async getTeamPerformance(supervisorId: string, dateRange: DateRange): Promise<TeamPerformanceRow[]> {
    const rows: Array<{
      id: string;
      employee_code: number;
      first_name: string;
      last_name: string;
      level_code: string;
      visit_count: number;
      sale_count: number;
      total_amount: bigint;
      last_sale_date: Date | null;
    }> = await this.prisma.$queryRaw`
      SELECT
        e.id::text,
        e."employeeCode" AS employee_code,
        e."firstName" AS first_name,
        e."lastName" AS last_name,
        l.code AS level_code,
        (
          SELECT COUNT(*)::int
          FROM visit v
          WHERE v."sellerId" = e.id
            AND v."scheduledDate" BETWEEN ${dateRange.from} AND ${dateRange.to}
            AND v.status IN ('COMPLETED', 'NO_SALE')
        ) AS visit_count,
        COUNT(s.id)::int AS sale_count,
        COALESCE(SUM(s."totalAmount"), 0) AS total_amount,
        MAX(s."saleDate") AS last_sale_date
      FROM employee e
      JOIN level l ON e."currentLevelId" = l.id
      LEFT JOIN sale s
        ON s."employeeId" = e.id
        AND s."saleDate" BETWEEN ${dateRange.from} AND ${dateRange.to}
        AND s."status" IN ('APPROVED', 'PENDING_REVIEW')
      WHERE e."supervisorId" = ${supervisorId}::uuid
        AND e.status = 'ACTIVE'
      GROUP BY e.id, e."employeeCode", e."firstName", e."lastName", l.code
      ORDER BY last_sale_date DESC NULLS LAST
    `;

    return rows.map((row) => ({
      employeeId: row.id,
      employeeCode: row.employee_code,
      firstName: row.first_name,
      lastName: row.last_name,
      levelCode: row.level_code,
      visitCount: row.visit_count,
      saleCount: row.sale_count,
      totalAmount: Number(row.total_amount),
      targetStatus: "on_track" as const, // Will be calculated in use case
      lastSaleDate: row.last_sale_date,
    }));
  }

  // =========================================================================
  // Monthly target
  // =========================================================================

  async getMonthlyTarget(levelId: number): Promise<number> {
    const target = await this.prisma.monthlyTarget.findUnique({
      where: { levelId },
      select: { targetSales: true },
    });

    return target?.targetSales ?? 15; // Default fallback
  }

  async getPersonalPerformance(employeeId: string, dateRange: DateRange): Promise<TeamPerformanceRow | null> {
    const rows: Array<{
      id: string;
      employee_code: number;
      first_name: string;
      last_name: string;
      level_code: string;
      visit_count: number;
      sale_count: number;
      total_amount: bigint;
      last_sale_date: Date | null;
    }> = await this.prisma.$queryRaw`
      SELECT
        e.id::text,
        e."employeeCode" AS employee_code,
        e."firstName" AS first_name,
        e."lastName" AS last_name,
        l.code AS level_code,
        (
          SELECT COUNT(*)::int
          FROM visit v
          WHERE v."sellerId" = e.id
            AND v."scheduledDate" BETWEEN ${dateRange.from} AND ${dateRange.to}
            AND v.status IN ('COMPLETED', 'NO_SALE')
        ) AS visit_count,
        COUNT(s.id)::int AS sale_count,
        COALESCE(SUM(s."totalAmount"), 0) AS total_amount,
        MAX(s."saleDate") AS last_sale_date
      FROM employee e
      JOIN level l ON e."currentLevelId" = l.id
      LEFT JOIN sale s
        ON s."employeeId" = e.id
        AND s."saleDate" BETWEEN ${dateRange.from} AND ${dateRange.to}
        AND s."status" IN ('APPROVED', 'PENDING_REVIEW')
      WHERE e.id = ${employeeId}::uuid
        AND e.status = 'ACTIVE'
      GROUP BY e.id, e."employeeCode", e."firstName", e."lastName", l.code
    `;

    if (rows.length === 0) return null;

    const row = rows[0];
    return {
      employeeId: row.id,
      employeeCode: row.employee_code,
      firstName: row.first_name,
      lastName: row.last_name,
      levelCode: row.level_code,
      visitCount: row.visit_count,
      saleCount: row.sale_count,
      totalAmount: Number(row.total_amount),
      targetStatus: "on_track" as const,
      lastSaleDate: row.last_sale_date,
    };
  }

  async sumAllTimeSales(employeeId: string): Promise<number> {
    const result = await this.prisma.sale.aggregate({
      _sum: { totalAmount: true },
      where: {
        employeeId,
        status: { in: [...VALID_STATUSES] },
      },
    });

    return Number(result._sum.totalAmount ?? 0);
  }

  async sumAllTimeSalesForEmployees(employeeIds: string[]): Promise<number> {
    if (employeeIds.length === 0) return 0;

    const result = await this.prisma.sale.aggregate({
      _sum: { totalAmount: true },
      where: {
        employeeId: { in: employeeIds },
        status: { in: [...VALID_STATUSES] },
      },
    });

    return Number(result._sum.totalAmount ?? 0);
  }

  async sumCurrentMonthSales(employeeId: string): Promise<number> {
    const now = new Date();
    const firstDay = new Date(now.getFullYear(), now.getMonth(), 1);
    const endOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59);

    const result = await this.prisma.sale.aggregate({
      _sum: { totalAmount: true },
      where: {
        employeeId,
        saleDate: { gte: firstDay, lte: endOfDay },
        status: { in: [...VALID_STATUSES] },
      },
    });

    return Number(result._sum.totalAmount ?? 0);
  }

  async getCommissionPercentage(levelId: number, at: Date): Promise<number> {
    const rule = await this.prisma.commissionRule.findFirst({
      where: {
        levelId,
        effectiveFrom: { lte: at },
        OR: [
          { effectiveTo: null },
          { effectiveTo: { gte: at } },
        ],
      },
      orderBy: { effectiveFrom: "desc" },
      select: { percentage: true },
    });

    return Number(rule?.percentage ?? 0);
  }

  // =========================================================================
  // System admin queries (ADMIN dashboard)
  // =========================================================================

  async countActiveEmployees(): Promise<number> {
    return this.prisma.employee.count({
      where: { status: "ACTIVE" },
    });
  }

  async getLevelEmployeeCounts(): Promise<LevelEmployeeCount[]> {
    const rows: Array<{
      level_id: number | null;
      level_code: string | null;
      count: bigint;
    }> = await this.prisma.$queryRaw`
      SELECT
        e."currentLevelId" AS level_id,
        l.code AS level_code,
        COUNT(*)::bigint AS count
      FROM employee e
      LEFT JOIN level l ON e."currentLevelId" = l.id
      GROUP BY e."currentLevelId", l.code
      ORDER BY e."currentLevelId" NULLS LAST
    `;

    return rows.map((row) => ({
      levelId: row.level_id,
      levelCode: row.level_code ?? "ADMIN",
      count: Number(row.count),
    }));
  }
}
