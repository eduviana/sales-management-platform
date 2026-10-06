/**
 * Tests for GetDashboardDataUseCase.
 *
 * Tests scope resolution, authorization, target calculation,
 * and period handling for the dashboard.
 *
 * Reference: requirements.md §2.4–§2.6, §3.2
 */

import { describe, it, expect, vi, beforeEach } from "vitest";
import { GetDashboardDataUseCase } from "../get-dashboard-data-use-case";
import type {
  AuthorizationService,
  AuthorizationDecision,
  Permission,
} from "@/modules/authorization/domain";
import type { OrganizationRepository, EmployeeRecord } from "@/modules/organization/domain";
import type { AnalyticsReadRepository } from "../../domain";
import type { AuthorizationContext } from "@/modules/authorization/domain";

// =============================================================================
// Mocks
// =============================================================================

function makeAuthContext(overrides?: Partial<AuthorizationContext>): AuthorizationContext {
  return {
    userId: "user-1",
    employeeId: "emp-1",
    levelId: 1,
    role: "SELLER",
    supervisorId: null,
    userEmail: "user@example.com",
    ...overrides,
  };
}

function makeAllowDecision(): AuthorizationDecision {
  return {
    allowed: true,
    permission: "dashboard.view" as Permission,
    reason: "Granted",
  };
}

function makeDenyDecision(): AuthorizationDecision {
  return {
    allowed: false,
    permission: "dashboard.view" as Permission,
    reason: "Not authorized",
  };
}

function makeEmployee(id: string, overrides?: Partial<EmployeeRecord>): EmployeeRecord {
  return {
    id,
    firstName: `First${id}`,
    lastName: `Last${id}`,
    joinedAt: new Date("2025-01-01"),
    currentLevelId: 1,
    supervisorId: null,
    status: "ACTIVE",
    createdAt: new Date("2025-01-01"),
    updatedAt: new Date("2025-01-01"),
    employeeCode: 1,
    dni: null,
    email: null,
    phone: null,
    dateOfBirth: null,
    deactivatedAt: null,
    deactivationReason: null,
    street: null,
    streetNumber: null,
    floor: null,
    apartment: null,
    city: null,
    province: null,
    postalCode: null,
    ...overrides,
  };
}

function createMockAnalyticsRepo(overrides?: Partial<AnalyticsReadRepository>): AnalyticsReadRepository {
  return {
    sumSalesAmount: vi.fn().mockResolvedValue(50000),
    countActiveSellers: vi.fn().mockResolvedValue(3),
    countSales: vi.fn().mockResolvedValue(15),
    sumPersonalSales: vi.fn().mockResolvedValue(20000),
    getDailySales: vi.fn().mockResolvedValue([
      { date: "2026-09-01", label: "1", amount: 10000 },
      { date: "2026-09-02", label: "2", amount: 15000 },
    ]),
    getMonthlySaleCounts: vi.fn().mockResolvedValue([
      { date: "2026-09-01", label: "1", count: 5 },
      { date: "2026-09-02", label: "2", count: 8 },
    ]),
    getLevelDistribution: vi.fn().mockResolvedValue([
      { levelCode: "N1", levelName: "Vendedor", amount: 30000, percentage: 60 },
      { levelCode: "N2", levelName: "Vendedor Junior", amount: 20000, percentage: 40 },
    ]),
    getTeamPerformance: vi.fn().mockResolvedValue([
      {
        employeeId: "emp-2",
        firstName: "Sarah",
        lastName: "Jenkins",
        levelCode: "N1",
        saleCount: 12,
        totalAmount: 35000,
        targetStatus: "on_track",
      },
    ]),
    getMonthlyTarget: vi.fn().mockResolvedValue(15),
    countPendingReviewSales: vi.fn().mockResolvedValue(3),
    countApprovedSales: vi.fn().mockResolvedValue(12),
    sumAllTimeSales: vi.fn().mockResolvedValue(100000),
    sumAllTimeSalesForEmployees: vi.fn().mockResolvedValue(250000),
    sumCurrentMonthSales: vi.fn().mockResolvedValue(8000),
    getCommissionPercentage: vi.fn().mockResolvedValue(5),
    getPersonalPerformance: vi.fn().mockResolvedValue(null),
    ...overrides,
  };
}

function createMockOrgRepo(overrides?: Partial<OrganizationRepository>): OrganizationRepository {
  return {
    findEmployeeById: vi.fn(),
    createEmployee: vi.fn(),
    updateEmployee: vi.fn(),
    updateEmployeeLevel: vi.fn(),
    updateEmployeeSupervisor: vi.fn(),
    updateEmployeeStatus: vi.fn(),
    findLevelById: vi.fn(),
    findOpenLevelHistory: vi.fn(),
    findOpenLevelHistories: vi.fn(),
    findEmployeeCodesByIds: vi.fn().mockResolvedValue([]),
    findNamesByIds: vi.fn().mockResolvedValue([]),
    closeLevelHistory: vi.fn(),
    createLevelHistory: vi.fn(),
    findOpenSupervisorHistory: vi.fn(),
    closeSupervisorHistory: vi.fn(),
    createSupervisorHistory: vi.fn(),
    getDirectSubordinates: vi.fn().mockResolvedValue([
      makeEmployee("emp-2", { supervisorId: "emp-1" }),
      makeEmployee("emp-3", { supervisorId: "emp-1" }),
    ]),
    getDescendantIds: vi.fn().mockResolvedValue(["emp-2", "emp-3", "emp-4"]),
    getAncestorIds: vi.fn(),
    countDirectSubordinates: vi.fn(),
    getActiveEmployeeIds: vi.fn().mockResolvedValue(["emp-1", "emp-2", "emp-3", "emp-4"]),
    getAllEmployees: vi.fn().mockResolvedValue([]),
    executeInTransaction: vi.fn(),
    ...overrides,
  };
}

// =============================================================================
// Tests
// =============================================================================

describe("GetDashboardDataUseCase", () => {
  let auth: AuthorizationService;
  let orgRepo: OrganizationRepository;
  let analyticsRepo: AnalyticsReadRepository;
  let useCase: GetDashboardDataUseCase;

  beforeEach(() => {
    auth = {
      authorize: vi.fn().mockResolvedValue(makeAllowDecision()),
    } as unknown as AuthorizationService;
    orgRepo = createMockOrgRepo();
    analyticsRepo = createMockAnalyticsRepo();
    useCase = new GetDashboardDataUseCase(auth, orgRepo, analyticsRepo);
  });

  // =========================================================================
  // Authorization
  // =========================================================================

  it("should throw AuthorizationError when dashboard.view is denied", async () => {
    (auth.authorize as ReturnType<typeof vi.fn>).mockResolvedValue(makeDenyDecision());

    await expect(
      useCase.execute({ authContext: makeAuthContext() }),
    ).rejects.toThrow("Not authorized");
  });

  it("should call authorize with dashboard.view permission", async () => {
    await useCase.execute({ authContext: makeAuthContext() });

    expect(auth.authorize).toHaveBeenCalledWith(
      expect.anything(),
      { permission: "dashboard.view" },
    );
  });

  // =========================================================================
  // Scope resolution
  // =========================================================================

  it("should use OWN scope for Level 1 seller (self only)", async () => {
    const ctx = makeAuthContext({ levelId: 1 });
    await useCase.execute({ authContext: ctx });

    expect(analyticsRepo.sumSalesAmount).toHaveBeenCalledWith(
      ["emp-1"],
      expect.anything(),
    );
  });

  it("should use OWN scope for Level 2 seller (self only)", async () => {
    const ctx = makeAuthContext({ levelId: 2 });
    await useCase.execute({ authContext: ctx });

    expect(analyticsRepo.sumSalesAmount).toHaveBeenCalledWith(
      ["emp-1"],
      expect.anything(),
    );
  });

  it("should use TEAM scope for Level 3 (self + direct subordinates)", async () => {
    const ctx = makeAuthContext({ levelId: 3 });
    await useCase.execute({ authContext: ctx });

    expect(analyticsRepo.sumSalesAmount).toHaveBeenCalledWith(
      ["emp-1", "emp-2", "emp-3"],
      expect.anything(),
    );
  });

  it("should use BRANCH scope for Level 4 (self + all descendants)", async () => {
    const ctx = makeAuthContext({ levelId: 4 });
    await useCase.execute({ authContext: ctx });

    expect(analyticsRepo.sumSalesAmount).toHaveBeenCalledWith(
      ["emp-1", "emp-2", "emp-3", "emp-4"],
      expect.anything(),
    );
  });

  it("should use GLOBAL scope for ADMIN", async () => {
    const ctx = makeAuthContext({ role: "ADMIN", levelId: null });
    await useCase.execute({ authContext: ctx });

    expect(analyticsRepo.sumSalesAmount).toHaveBeenCalledWith(
      ["emp-1", "emp-2", "emp-3", "emp-4"],
      expect.anything(),
    );
  });

  // =========================================================================
  // hasTeam flag
  // =========================================================================

  it("should return hasTeam=false for Level 1 seller", async () => {
    const ctx = makeAuthContext({ levelId: 1 });
    const result = await useCase.execute({ authContext: ctx });

    expect(result.hasTeam).toBe(false);
  });

  it("should return hasTeam=true for Level 3 with subordinates", async () => {
    const ctx = makeAuthContext({ levelId: 3 });
    const result = await useCase.execute({ authContext: ctx });

    expect(result.hasTeam).toBe(true);
  });

  it("should return hasTeam=false for Level 3 with no subordinates", async () => {
    (orgRepo.getDirectSubordinates as ReturnType<typeof vi.fn>).mockResolvedValue([]);
    const ctx = makeAuthContext({ levelId: 3 });
    const result = await useCase.execute({ authContext: ctx });

    expect(result.hasTeam).toBe(false);
  });

  // =========================================================================
  // Target calculation
  // =========================================================================

  it("should calculate personal target for Level 1 (no team)", async () => {
    const ctx = makeAuthContext({ levelId: 1 });
    const result = await useCase.execute({ authContext: ctx });

    // Target = 15 (from monthly_target for N1)
    expect(result.kpis.targetTotal).toBe(15);
    expect(analyticsRepo.getMonthlyTarget).toHaveBeenCalledWith(1);
  });

  it("should calculate team target for Level 3 (target × subordinates)", async () => {
    const ctx = makeAuthContext({ levelId: 3 });
    const result = await useCase.execute({ authContext: ctx });

    // Target = 15 × 2 subordinates = 30
    expect(result.kpis.targetTotal).toBe(30);
  });

  it("should compute team objective using only subordinates' sales (excludes supervisor)", async () => {
    // First countSales (scope-wide currentSales) = 15; second (objective sales) = 6
    (analyticsRepo.countSales as ReturnType<typeof vi.fn>)
      .mockResolvedValueOnce(15)
      .mockResolvedValueOnce(6);
    const ctx = makeAuthContext({ levelId: 3 });
    const result = await useCase.execute({ authContext: ctx });

    // currentSales remains the scope-wide KPI (self + subordinates)
    expect(result.kpis.currentSales).toBe(15);
    // Objective progress = 6 / (15 × 2) = 20%
    expect(result.kpis.targetTotal).toBe(30);
    expect(result.kpis.targetProgress).toBe(20);
    // Objective sales must be queried only against subordinates, excluding self
    expect(analyticsRepo.countSales).toHaveBeenLastCalledWith(
      ["emp-2", "emp-3"],
      expect.anything(),
    );
  });

  it("should compute team chart daily counts using only subordinates' sales", async () => {
    const ctx = makeAuthContext({ levelId: 3 });
    const result = await useCase.execute({ authContext: ctx });

    // Team chart must query daily counts only against subordinates, excluding self
    expect(analyticsRepo.getMonthlySaleCounts).toHaveBeenLastCalledWith(
      ["emp-2", "emp-3"],
      expect.anything(),
    );
    expect(result.teamDailySaleCounts).toEqual([
      { date: "2026-09-01", label: "1", count: 5 },
      { date: "2026-09-02", label: "2", count: 8 },
    ]);
  });

  it("should calculate target progress percentage", async () => {
    (analyticsRepo.countSales as ReturnType<typeof vi.fn>).mockResolvedValue(8);
    const ctx = makeAuthContext({ levelId: 1 });
    const result = await useCase.execute({ authContext: ctx });

    // 8 sales / 15 target = 53%
    expect(result.kpis.targetProgress).toBe(53);
  });

  it("should cap target progress at 100%", async () => {
    (analyticsRepo.countSales as ReturnType<typeof vi.fn>).mockResolvedValue(15);
    const ctx = makeAuthContext({ levelId: 1 });
    const result = await useCase.execute({ authContext: ctx });

    // 15 sales / 10 target = 150%, capped at 100%
    expect(result.kpis.targetProgress).toBe(100);
  });

  // =========================================================================
  // Period handling
  // =========================================================================

  it("should default to month period", async () => {
    const ctx = makeAuthContext();
    const result = await useCase.execute({ authContext: ctx });

    expect(result.period).toBe("month");
  });

  it("should handle 'today' period", async () => {
    const ctx = makeAuthContext();
    const result = await useCase.execute({ authContext: ctx, period: "today" });

    expect(result.period).toBe("today");
    expect(result.dateRange.from).toBeInstanceOf(Date);
  });

  it("should handle 'week' period", async () => {
    const ctx = makeAuthContext();
    const result = await useCase.execute({ authContext: ctx, period: "week" });

    expect(result.period).toBe("week");
  });

  // =========================================================================
  // Data aggregation
  // =========================================================================

  it("should return KPI data from analytics repository", async () => {
    const ctx = makeAuthContext();
    const result = await useCase.execute({ authContext: ctx });

    expect(result.kpis.totalSalesAmount).toBe(50000);
    expect(result.kpis.activeSellerCount).toBe(3);
    expect(result.kpis.currentSales).toBe(15);
  });

  it("should return daily sales data", async () => {
    const ctx = makeAuthContext();
    const result = await useCase.execute({ authContext: ctx });

    expect(result.dailySales).toHaveLength(2);
    expect(result.dailySales[0].date).toBe("2026-09-01");
  });

  it("should return level distribution data", async () => {
    const ctx = makeAuthContext();
    const result = await useCase.execute({ authContext: ctx });

    expect(result.levelDistribution).toHaveLength(2);
    expect(result.levelDistribution[0].levelCode).toBe("N1");
  });

  it("should return empty team performance for users without team", async () => {
    const ctx = makeAuthContext({ levelId: 1 });
    const result = await useCase.execute({ authContext: ctx });

    expect(result.teamPerformance).toHaveLength(0);
  });

  it("should return team performance for users with team", async () => {
    const ctx = makeAuthContext({ levelId: 3 });
    const result = await useCase.execute({ authContext: ctx });

    expect(result.teamPerformance).toHaveLength(1);
    expect(result.teamPerformance[0].employeeId).toBe("emp-2");
  });

  it("should not call getTeamPerformance for users without team", async () => {
    const ctx = makeAuthContext({ levelId: 1 });
    await useCase.execute({ authContext: ctx });

    expect(analyticsRepo.getTeamPerformance).not.toHaveBeenCalled();
  });

  // =========================================================================
  // Personal sales
  // =========================================================================

  it("should always include personal sales amount", async () => {
    const ctx = makeAuthContext({ levelId: 3 });
    const result = await useCase.execute({ authContext: ctx });

    expect(analyticsRepo.sumPersonalSales).toHaveBeenCalledWith("emp-1", expect.anything());
    expect(result.kpis.personalSalesAmount).toBe(20000);
  });
});
