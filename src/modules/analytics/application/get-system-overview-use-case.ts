/**
 * Get system overview use case (ADMIN dashboard).
 *
 * Builds the ADMIN system health & organization overview:
 * - KPI cards: total sales (all-time), sales of the current month, active
 *   employees, dangerous audit events in the current month (FAILURE + DENIED).
 * - Audit activity chart (last 7 days).
 * - Sales by level donut (current month).
 * - Recent audit events feed.
 *
 * Authorization: `audit.read` (ADMIN only). This dashboard is a
 * system-administration exclusive surface; the permission guarantees that
 * only the ADMIN role can execute it (permissions-matrix.md §4.14).
 *
 * Reference: requirements.md §3.12.1, permissions-matrix.md §4.14
 */

import type { AuthorizationService } from "@/modules/authorization/domain";
import type { AuthorizationContext } from "@/modules/authorization/domain";
import type { OrganizationRepository } from "@/modules/organization/domain";
import type { AuditEventRepository } from "@/modules/audit/domain/audit-event-repository";
import { formatWeekdayLabel } from "@/modules/audit/domain/audit-event-repository";
import type {
  AnalyticsReadRepository,
  SystemAdminReadRepository,
  SystemOverview,
  AuditActivityPoint,
  SystemAuditEvent,
} from "../domain";
import { AuthorizationError } from "@/shared/errors";

/** Number of recent audit events shown in the overview feed. */
const RECENT_EVENTS_LIMIT = 10;

/** Number of days of audit activity shown in the bar chart. */
const ACTIVITY_DAYS = 7;

export interface GetSystemOverviewInput {
  readonly authContext: AuthorizationContext;
}

export class GetSystemOverviewUseCase {
  constructor(
    private readonly authorizationService: AuthorizationService,
    private readonly organizationRepository: OrganizationRepository,
    private readonly analyticsRepository: AnalyticsReadRepository,
    private readonly systemRepository: SystemAdminReadRepository,
    private readonly auditEventRepository: AuditEventRepository,
  ) {}

  async execute(input: GetSystemOverviewInput): Promise<SystemOverview> {
    // 1. Authorize: audit.read (ADMIN only)
    const decision = await this.authorizationService.authorize(
      input.authContext,
      { permission: "audit.read" },
    );

    if (!decision.allowed) {
      throw new AuthorizationError(
        decision.reason ?? "Not authorized to view system overview.",
      );
    }

    // 2. Resolve date ranges
    const now = new Date();
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
    const activityStart = new Date(now.getFullYear(), now.getMonth(), now.getDate() - (ACTIVITY_DAYS - 1));

    // 3. Resolve global scope (all active employees)
    const employeeIds = await this.organizationRepository.getActiveEmployeeIds();

    // 4. Fetch all data in parallel
    const [
      totalSalesAmount,
      monthSalesAmount,
      activeEmployeeCount,
      auditResults,
      levelDistribution,
      auditActivity,
      recentEvents,
    ] = await Promise.all([
      this.analyticsRepository.sumAllTimeSalesForEmployees(employeeIds),
      this.analyticsRepository.sumSalesAmount(employeeIds, {
        from: monthStart,
        to: now,
      }),
      this.systemRepository.countActiveEmployees(),
      this.auditEventRepository.countByResult({
        from: monthStart,
        to: now,
      }),
      this.analyticsRepository.getLevelDistribution(employeeIds, {
        from: monthStart,
        to: now,
      }),
      this.auditEventRepository.getDailyActivity(activityStart, now),
      this.auditEventRepository.findMany(
        {},
        { page: 1, pageSize: RECENT_EVENTS_LIMIT, sortOrder: "desc" },
      ),
    ]);

    // 5. Build activity points (fill gaps so the chart is continuous)
    const auditActivityPoints = this.fillActivityGaps(auditActivity, activityStart, now);

    // 6. Count dangerous audit events (FAILURE + DENIED) for the current month
    const dangerousAuditEventCount = auditResults
      .filter((row) => row.result !== "SUCCESS")
      .reduce((acc, row) => acc + row.count, 0);

    return {
      kpis: {
        totalSalesAmount,
        monthSalesAmount,
        activeEmployeeCount,
        dangerousAuditEventCount,
      },
      auditActivity: auditActivityPoints,
      levelDistribution,
      recentEvents: recentEvents.events.map(
        (event): SystemAuditEvent => ({
          id: event.id,
          actorEmail: event.actorEmail,
          action: event.action,
          result: event.result,
          createdAt: event.createdAt,
        }),
      ),
    };
  }

  private fillActivityGaps(
    rows: AuditActivityPoint[],
    from: Date,
    to: Date,
  ): AuditActivityPoint[] {
    const byDate = new Map(rows.map((row) => [row.date, row]));
    const points: AuditActivityPoint[] = [];

    const cursor = new Date(from.getFullYear(), from.getMonth(), from.getDate());
    const end = new Date(to.getFullYear(), to.getMonth(), to.getDate());

    while (cursor <= end) {
      const iso = this.toIsoDate(cursor);
      const existing = byDate.get(iso);
      points.push(
        existing ?? {
          date: iso,
          label: formatWeekdayLabel(cursor),
          success: 0,
          failure: 0,
          denied: 0,
        },
      );
      cursor.setDate(cursor.getDate() + 1);
    }

    return points;
  }

  private toIsoDate(date: Date): string {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  }
}