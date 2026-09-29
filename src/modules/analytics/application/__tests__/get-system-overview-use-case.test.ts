/**
 * Tests for GetSystemOverviewUseCase.
 *
 * Covers authorization, KPI aggregation, level distribution and
 * activity gap filling for the ADMIN system overview.
 *
 * Reference: requirements.md §3.12.1, permissions-matrix.md §4.11
 */

import { describe, it, expect, vi, beforeEach } from "vitest";
import { GetSystemOverviewUseCase } from "../get-system-overview-use-case";
import type { AuthorizationService } from "@/modules/authorization/domain";
import type { AuthorizationContext } from "@/modules/authorization/domain";
import type { OrganizationRepository } from "@/modules/organization/domain";
import type {
  AnalyticsReadRepository,
  SystemAdminReadRepository,
} from "../../domain";
import type { AuditEventRepository } from "@/modules/audit/domain/audit-event-repository";
import { formatWeekdayLabel } from "@/modules/audit/domain/audit-event-repository";
import { AuditAction } from "@/shared/ports/audit-port";

// =============================================================================
// Mocks
// =============================================================================

function makeAuthContext(overrides?: Partial<AuthorizationContext>): AuthorizationContext {
  return {
    userId: "user-1",
    employeeId: "emp-1",
    levelId: null,
    role: "ADMIN",
    supervisorId: null,
    userEmail: "admin@example.com",
    ...overrides,
  };
}

function makeAllowAuth(): AuthorizationService {
  return {
    authorize: vi.fn().mockResolvedValue({
      allowed: true,
      permission: "audit.read",
    }),
  };
}

function makeDenyAuth(): AuthorizationService {
  return {
    authorize: vi.fn().mockResolvedValue({
      allowed: false,
      permission: "audit.read",
      reason: "Not authorized",
    }),
  };
}

function makeSystemRepo(overrides?: Partial<SystemAdminReadRepository>): SystemAdminReadRepository {
  return {
    countActiveEmployees: vi.fn().mockResolvedValue(5),
    getLevelEmployeeCounts: vi.fn().mockResolvedValue([]),
    ...overrides,
  };
}

function makeAuditRepo(overrides?: Partial<AuditEventRepository>): AuditEventRepository {
  return {
    findMany: vi.fn().mockResolvedValue({
      events: [
        {
          id: "event-1",
          actorId: "user-1",
          actorEmail: "admin@example.com",
          action: AuditAction.LOGIN_SUCCESS,
          resourceType: "UserAccount",
          resourceId: "user-1",
          result: "SUCCESS" as const,
          correlationId: null,
          metadata: null,
          createdAt: new Date("2026-09-24T12:00:00Z"),
        },
      ],
      totalCount: 1,
      page: 1,
      pageSize: 10,
    }),
    countByResult: vi.fn().mockResolvedValue([
      { result: "SUCCESS", count: 80 },
      { result: "FAILURE", count: 10 },
      { result: "DENIED", count: 10 },
    ]),
    getDailyActivity: vi.fn().mockResolvedValue([
      { date: "2026-09-24", label: formatWeekdayLabel("2026-09-24"), success: 5, failure: 1, denied: 0 },
    ]),
    ...overrides,
  };
}

// =============================================================================
// Tests
// =============================================================================

describe("GetSystemOverviewUseCase", () => {
  let auth: AuthorizationService;
  let orgRepo: OrganizationRepository;
  let analyticsRepo: AnalyticsReadRepository;
  let systemRepo: SystemAdminReadRepository;
  let auditRepo: AuditEventRepository;
  let useCase: GetSystemOverviewUseCase;

  beforeEach(() => {
    auth = makeAllowAuth();
    orgRepo = {
      getActiveEmployeeIds: vi.fn().mockResolvedValue(["emp-1", "emp-2", "emp-3"]),
    } as unknown as OrganizationRepository;
    analyticsRepo = {
      sumAllTimeSalesForEmployees: vi.fn().mockResolvedValue(15000),
      sumSalesAmount: vi.fn().mockResolvedValue(1200),
      countPendingReviewSales: vi.fn().mockResolvedValue(4),
      getLevelDistribution: vi.fn().mockResolvedValue([
        { levelCode: "N1", levelName: "Nivel 1", amount: 800, percentage: 67 },
        { levelCode: "N2", levelName: "Nivel 2", amount: 400, percentage: 33 },
      ]),
    } as unknown as AnalyticsReadRepository;
    systemRepo = makeSystemRepo();
    auditRepo = makeAuditRepo();
    useCase = new GetSystemOverviewUseCase(
      auth,
      orgRepo,
      analyticsRepo,
      systemRepo,
      auditRepo,
    );
  });

  // =========================================================================
  // Authorization
  // =========================================================================

  it("should throw AuthorizationError when audit.read is denied", async () => {
    const denyUseCase = new GetSystemOverviewUseCase(
      makeDenyAuth(),
      orgRepo,
      analyticsRepo,
      systemRepo,
      auditRepo,
    );

    await expect(
      denyUseCase.execute({ authContext: makeAuthContext() }),
    ).rejects.toThrow("Not authorized");
  });

  it("should call authorize with audit.read permission", async () => {
    await useCase.execute({ authContext: makeAuthContext() });

    expect(auth.authorize).toHaveBeenCalledWith(
      expect.anything(),
      { permission: "audit.read" },
    );
  });

  // =========================================================================
  // KPIs
  // =========================================================================

  it("should aggregate KPI values from repositories", async () => {
    const result = await useCase.execute({ authContext: makeAuthContext() });

    expect(result.kpis).toEqual({
      totalSalesAmount: 15000,
      monthSalesAmount: 1200,
      activeEmployeeCount: 5,
      dangerousAuditEventCount: 20,
    });
  });

  it("should resolve global employee scope for sales KPIs", async () => {
    await useCase.execute({ authContext: makeAuthContext() });

    expect(analyticsRepo.sumAllTimeSalesForEmployees).toHaveBeenCalledWith(
      ["emp-1", "emp-2", "emp-3"],
    );
    expect(analyticsRepo.sumSalesAmount).toHaveBeenCalledWith(
      ["emp-1", "emp-2", "emp-3"],
      expect.anything(),
    );
  });

  // =========================================================================
  // Level distribution
  // =========================================================================

  it("should return level distribution for the current month", async () => {
    const result = await useCase.execute({ authContext: makeAuthContext() });

    expect(result.levelDistribution).toEqual([
      { levelCode: "N1", levelName: "Nivel 1", amount: 800, percentage: 67 },
      { levelCode: "N2", levelName: "Nivel 2", amount: 400, percentage: 33 },
    ]);
    expect(analyticsRepo.getLevelDistribution).toHaveBeenCalledWith(
      ["emp-1", "emp-2", "emp-3"],
      expect.any(Object),
    );
  });

  it("should return empty level distribution when there are no sales", async () => {
    const emptyAnalyticsRepo = {
      ...analyticsRepo,
      getLevelDistribution: vi.fn().mockResolvedValue([]),
    } as unknown as AnalyticsReadRepository;
    const emptyUseCase = new GetSystemOverviewUseCase(
      auth,
      orgRepo,
      emptyAnalyticsRepo,
      systemRepo,
      auditRepo,
    );

    const result = await emptyUseCase.execute({ authContext: makeAuthContext() });

    expect(result.levelDistribution).toEqual([]);
  });

  // =========================================================================
  // Activity gap filling
  // =========================================================================

  it("should fill days without events with zero counts", async () => {
    // Mocked getDailyActivity returns only today; the use case must fill the
    // remaining ACTIVITY_DAYS-1 days with zero values.
    const result = await useCase.execute({ authContext: makeAuthContext() });

    expect(result.auditActivity).toHaveLength(7);
    const today = result.auditActivity.find((p) => p.date === "2026-09-24");
    expect(today).toEqual({
      date: "2026-09-24",
      label: formatWeekdayLabel("2026-09-24"),
      success: 5,
      failure: 1,
      denied: 0,
    });
    const empty = result.auditActivity.filter((p) => p.success === 0 && p.failure === 0 && p.denied === 0);
    expect(empty).toHaveLength(6);
  });

  it("should keep a single point when there is no activity data", async () => {
    const emptyActivityRepo = makeAuditRepo({
      getDailyActivity: vi.fn().mockResolvedValue([]),
    });
    const emptyUseCase = new GetSystemOverviewUseCase(
      auth,
      orgRepo,
      analyticsRepo,
      systemRepo,
      emptyActivityRepo,
    );

    // Mocked getDailyActivity returns no rows; the use case must fill all
    // ACTIVITY_DAYS days with zero values.
    const result = await emptyUseCase.execute({ authContext: makeAuthContext() });

    expect(result.auditActivity).toHaveLength(7);
    expect(result.auditActivity.every((p) => p.success === 0 && p.failure === 0 && p.denied === 0)).toBe(true);
  });

  // =========================================================================
  // Recent events
  // =========================================================================

  it("should map recent events to the overview shape", async () => {
    const result = await useCase.execute({ authContext: makeAuthContext() });

    expect(result.recentEvents).toHaveLength(1);
    expect(result.recentEvents[0]).toMatchObject({
      id: "event-1",
      actorEmail: "admin@example.com",
      action: AuditAction.LOGIN_SUCCESS,
      result: "SUCCESS",
    });
  });
});