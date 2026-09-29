/**
 * Prisma implementation of AuditEventRepository.
 *
 * Provides read-only query access to audit events.
 *
 * Reference: data-architecture.md §13, ADR-008
 */

import type { PrismaClient, AuditAction as PrismaAuditAction } from "@prisma/client";
import type {
  AuditEventRepository,
  AuditEventRecord,
  AuditEventQueryFilters,
  AuditEventQueryOptions,
  AuditEventQueryResult,
  AuditResultCount,
  AuditResultType,
  DailyAuditActivity,
} from "../domain/audit-event-repository";
import { formatWeekdayLabel } from "../domain/audit-event-repository";
import type { AuditAction } from "@/shared/ports/audit-port";

export class PrismaAuditEventRepository implements AuditEventRepository {
  constructor(private readonly prisma: PrismaClient) {}

  async findMany(
    filters: AuditEventQueryFilters,
    options: AuditEventQueryOptions,
  ): Promise<AuditEventQueryResult> {
    const page = options.page ?? 1;
    const pageSize = Math.min(options.pageSize ?? 20, 100);
    const sortOrder = options.sortOrder ?? "desc";

    // Build where clause
    const where: Record<string, unknown> = {};

    if (filters.actorId) {
      where.actorId = filters.actorId;
    }
    if (filters.action) {
      where.action = filters.action;
    }
    if (filters.resourceType) {
      where.resourceType = filters.resourceType;
    }
    if (filters.resourceId) {
      where.resourceId = filters.resourceId;
    }
    if (filters.result) {
      where.result = filters.result;
    }
    if (filters.correlationId) {
      where.correlationId = filters.correlationId;
    }
    if (filters.from || filters.to) {
      where.createdAt = {};
      if (filters.from) {
        (where.createdAt as Record<string, Date>).gte = filters.from;
      }
      if (filters.to) {
        (where.createdAt as Record<string, Date>).lte = filters.to;
      }
    }

    // Execute queries in parallel
    const [events, totalCount] = await Promise.all([
      this.prisma.auditEvent.findMany({
        where,
        orderBy: { createdAt: sortOrder },
        skip: (page - 1) * pageSize,
        take: pageSize,
      }),
      this.prisma.auditEvent.count({ where }),
    ]);

    return {
      events: events.map(this.mapRecord),
      totalCount,
      page,
      pageSize,
    };
  }

  private mapRecord(raw: {
    id: string;
    actorId: string | null;
    actorEmail: string | null;
    action: PrismaAuditAction;
    resourceType: string;
    resourceId: string | null;
    result: string;
    correlationId: string | null;
    metadata: unknown;
    createdAt: Date;
  }): AuditEventRecord {
    return {
      id: raw.id,
      actorId: raw.actorId,
      actorEmail: raw.actorEmail,
      action: raw.action as AuditAction,
      resourceType: raw.resourceType,
      resourceId: raw.resourceId,
      result: raw.result as AuditEventRecord["result"],
      correlationId: raw.correlationId,
      metadata: raw.metadata as Record<string, unknown> | null,
      createdAt: raw.createdAt,
    };
  }

  // =========================================================================
  // Aggregations
  // =========================================================================

  async countByResult(
    filters: { from?: Date; to?: Date },
  ): Promise<AuditResultCount[]> {
    const where: Record<string, unknown> = {};
    if (filters.from || filters.to) {
      where.createdAt = {};
      if (filters.from) {
        (where.createdAt as Record<string, Date>).gte = filters.from;
      }
      if (filters.to) {
        (where.createdAt as Record<string, Date>).lte = filters.to;
      }
    }

    const grouped = await this.prisma.auditEvent.groupBy({
      by: ["result"],
      _count: { _all: true },
      where,
    });

    return grouped.map((row) => ({
      result: row.result as AuditResultType,
      count: row._count._all,
    }));
  }

  async getDailyActivity(
    from: Date,
    to: Date,
  ): Promise<DailyAuditActivity[]> {
    const rows: Array<{
      day: string;
      success: bigint;
      failure: bigint;
      denied: bigint;
    }> = await this.prisma.$queryRaw`
      SELECT
        TO_CHAR("createdAt", 'YYYY-MM-DD') AS day,
        COUNT(*) FILTER (WHERE result = 'SUCCESS')::bigint AS success,
        COUNT(*) FILTER (WHERE result = 'FAILURE')::bigint AS failure,
        COUNT(*) FILTER (WHERE result = 'DENIED')::bigint AS denied
      FROM audit_event
      WHERE "createdAt" BETWEEN ${from} AND ${to}
      GROUP BY TO_CHAR("createdAt", 'YYYY-MM-DD')
      ORDER BY day
    `;

    return rows.map((row) => ({
      date: row.day,
      label: formatWeekdayLabel(row.day),
      success: Number(row.success),
      failure: Number(row.failure),
      denied: Number(row.denied),
    }));
  }
}
