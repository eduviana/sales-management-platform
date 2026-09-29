/**
 * Audit event repository port (read-only query interface).
 *
 * Application layer depends on this interface for querying audit events.
 * Infrastructure implements the concrete Prisma-based repository.
 *
 * Reference: data-architecture.md §13, ADR-009
 */

import type { AuditAction } from "@/shared/ports/audit-port";

// =============================================================================
// Record type
// =============================================================================

export interface AuditEventRecord {
  readonly id: string;
  readonly actorId: string | null;
  readonly actorEmail: string | null;
  readonly action: AuditAction;
  readonly resourceType: string;
  readonly resourceId: string | null;
  readonly result: "SUCCESS" | "FAILURE" | "DENIED";
  readonly correlationId: string | null;
  readonly metadata: Record<string, unknown> | null;
  readonly createdAt: Date;
}

// =============================================================================
// Query types
// =============================================================================

export interface AuditEventQueryFilters {
  /** Filter by actor ID. */
  readonly actorId?: string;

  /** Filter by audit action. */
  readonly action?: AuditAction;

  /** Filter by resource type. */
  readonly resourceType?: string;

  /** Filter by specific resource ID. */
  readonly resourceId?: string;

  /** Filter by result. */
  readonly result?: "SUCCESS" | "FAILURE" | "DENIED";

  /** Filter by correlation ID. */
  readonly correlationId?: string;

  /** Filter events after this date (inclusive). */
  readonly from?: Date;

  /** Filter events before this date (inclusive). */
  readonly to?: Date;
}

export interface AuditEventQueryOptions {
  /** Page number (1-based). */
  readonly page?: number;

  /** Number of items per page. */
  readonly pageSize?: number;

  /** Sort direction. */
  readonly sortOrder?: "asc" | "desc";
}

export interface AuditEventQueryResult {
  readonly events: readonly AuditEventRecord[];
  readonly totalCount: number;
  readonly page: number;
  readonly pageSize: number;
}

// =============================================================================
// Aggregation types
// =============================================================================

export type AuditResultType = "SUCCESS" | "FAILURE" | "DENIED";

export interface AuditResultCount {
  readonly result: AuditResultType;
  readonly count: number;
}

export interface DailyAuditActivity {
  /** ISO date string "YYYY-MM-DD". */
  readonly date: string;
  /** Short label (weekday in Spanish, e.g. "lun", "mar"). */
  readonly label: string;
  readonly success: number;
  readonly failure: number;
  readonly denied: number;
}

// =============================================================================
// Weekday labels
// =============================================================================

const WEEKDAY_LABELS = [
  "dom",
  "lun",
  "mar",
  "mié",
  "jue",
  "vie",
  "sáb",
] as const;

/**
 * Returns the Spanish weekday label for a date (e.g. "lun", "mar", "mié").
 * Accepts either a Date or an ISO string "YYYY-MM-DD" (parsed as local time).
 */
export function formatWeekdayLabel(date: Date | string): string {
  const d = typeof date === "string"
    ? new Date(`${date}T00:00:00`)
    : date;
  return WEEKDAY_LABELS[d.getDay()];
}

// =============================================================================
// Repository port
// =============================================================================

export interface AuditEventRepository {
  /**
   * Query audit events with filters and pagination.
   * Returns results sorted by createdAt (newest first by default).
   */
  findMany(
    filters: AuditEventQueryFilters,
    options: AuditEventQueryOptions,
  ): Promise<AuditEventQueryResult>;

  /**
   * Count audit events grouped by result within an optional date range.
   */
  countByResult(
    filters: { from?: Date; to?: Date },
  ): Promise<AuditResultCount[]>;

  /**
   * Daily audit activity within a date range grouped by day and result.
   */
  getDailyActivity(
    from: Date,
    to: Date,
  ): Promise<DailyAuditActivity[]>;
}
