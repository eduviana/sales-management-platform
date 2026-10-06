/**
 * Negative authorization tests for the analytics module (P3, ADR-020 roadmap).
 *
 * The team performance read model requires `employee.read` before it queries
 * the repository.
 *
 * Reference: permissions-matrix.md §4.3
 */

import { describe, it, expect, vi } from "vitest";
import { GetTeamPerformanceUseCase } from "../get-team-performance-use-case";
import { AuthorizationError } from "@/shared/errors";
import type {
  AuthorizationContext,
  AuthorizationDecision,
  AuthorizationService,
  Permission,
} from "@/modules/authorization/domain";
import type { AnalyticsReadRepository, TeamPerformanceRow } from "@/modules/analytics/domain";

// =============================================================================
// Helpers
// =============================================================================

function makeAuthContext(
  overrides?: Partial<AuthorizationContext>,
): AuthorizationContext {
  return {
    userId: "user-1",
    employeeId: "sup-1",
    levelId: 3,
    role: "SELLER",
    supervisorId: null,
    userEmail: "supervisor@example.com",
    ...overrides,
  };
}

function makeDenyDecision(permission: string): AuthorizationDecision {
  return {
    allowed: false,
    permission: permission as Permission,
    reason: `Not authorized: ${permission} not granted.`,
  };
}

function makeAllowDecision(permission: string): AuthorizationDecision {
  return {
    allowed: true,
    permission: permission as Permission,
    reason: "granted",
  };
}

function makeAuthService(decision: AuthorizationDecision): {
  service: AuthorizationService;
  authorize: ReturnType<typeof vi.fn>;
} {
  const authorize = vi.fn().mockResolvedValue(decision);
  return { service: { authorize } as unknown as AuthorizationService, authorize };
}

function makeTeamRow(saleCount: number): TeamPerformanceRow {
  return {
    employeeId: "emp-1",
    employeeCode: 1,
    firstName: "Juan",
    lastName: "Pérez",
    levelCode: "N1",
    visitCount: 3,
    saleCount,
    totalAmount: saleCount * 100,
    targetStatus: "at_risk",
    lastSaleDate: null,
  };
}

function makeAnalyticsRepo(
  rows: readonly TeamPerformanceRow[],
): AnalyticsReadRepository {
  return {
    getTeamPerformance: vi.fn().mockResolvedValue(rows),
  } as unknown as AnalyticsReadRepository;
}

// =============================================================================
// GetTeamPerformanceUseCase
// =============================================================================

describe("GetTeamPerformanceUseCase — negative authorization", () => {
  it("throws AuthorizationError and never queries the repository when denied", async () => {
    const { service, authorize } = makeAuthService(
      makeDenyDecision("employee.read"),
    );
    const analyticsRepository = makeAnalyticsRepo([]);
    const useCase = new GetTeamPerformanceUseCase(service, analyticsRepository);

    await expect(
      useCase.execute({ authContext: makeAuthContext() }),
    ).rejects.toThrow(AuthorizationError);

    expect(authorize).toHaveBeenCalledWith(makeAuthContext(), {
      permission: "employee.read",
    });
    expect(analyticsRepository.getTeamPerformance).not.toHaveBeenCalled();
  });

  it("returns the team rows only after the permission is granted", async () => {
    const { service, authorize } = makeAuthService(
      makeAllowDecision("employee.read"),
    );
    const analyticsRepository = makeAnalyticsRepo([makeTeamRow(12)]);
    const useCase = new GetTeamPerformanceUseCase(service, analyticsRepository);

    const result = await useCase.execute({ authContext: makeAuthContext() });

    expect(authorize).toHaveBeenCalledTimes(1);
    expect(analyticsRepository.getTeamPerformance).toHaveBeenCalledTimes(1);
    expect(result.teamPerformance).toHaveLength(1);
    expect(result.teamPerformance[0].targetStatus).toBe("exceeding");
  });
});
