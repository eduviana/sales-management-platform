/**
 * Negative authorization tests for the commissions module (P3, ADR-020 roadmap).
 *
 * Team scope requires `sale.readTeam`; own scope needs no extra permission
 * (matching the existing screen).
 *
 * Reference: requirements.md §3.2, permissions-matrix.md §4.7
 */

import { describe, it, expect, vi } from "vitest";
import { GetMonthlyCommissionOverviewUseCase } from "../get-monthly-commission-overview-use-case";
import { CreateCommissionRuleVersionUseCase } from "../create-commission-rule-version-use-case";
import { GetApplicableCommissionRuleUseCase } from "../get-applicable-commission-rule-use-case";
import { GetCommissionEntriesForSaleUseCase } from "../get-commission-for-sale-use-case";
import { AuthorizationError } from "@/shared/errors";
import type {
  AuthorizationContext,
  AuthorizationDecision,
  AuthorizationService,
  Permission,
} from "@/modules/authorization/domain";
import type { OrganizationRepository } from "@/modules/organization/domain";
import type { SaleRepository } from "@/modules/sales/domain";
import type {
  CommissionEntryRepository,
  CommissionRuleRepository,
} from "@/modules/commissions/domain";
import type { AuditPort } from "@/shared/ports/audit-port";

// =============================================================================
// Helpers
// =============================================================================

function makeAuthContext(
  overrides?: Partial<AuthorizationContext>,
): AuthorizationContext {
  return {
    userId: "user-1",
    employeeId: "emp-1",
    levelId: 3,
    role: "SELLER",
    supervisorId: "sup-1",
    userEmail: "seller@example.com",
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
  };
}

function makeAuthService(decision: AuthorizationDecision): {
  service: AuthorizationService;
  authorize: ReturnType<typeof vi.fn>;
} {
  const authorize = vi.fn().mockResolvedValue(decision);
  return { service: { authorize } as unknown as AuthorizationService, authorize };
}

function makeOrganizationRepo(): OrganizationRepository {
  return {
    getDirectSubordinates: vi.fn().mockResolvedValue([]),
    findEmployeeById: vi.fn().mockResolvedValue(null),
  } as unknown as OrganizationRepository;
}

function makeSaleRepo(): SaleRepository {
  return {
    findSummariesByIds: vi.fn().mockResolvedValue([]),
  } as unknown as SaleRepository;
}

function makeCommissionEntryRepo(): CommissionEntryRepository {
  return {
    findEarnedByEmployeeIds: vi.fn().mockResolvedValue([]),
  } as unknown as CommissionEntryRepository;
}

// =============================================================================
// GetMonthlyCommissionOverviewUseCase
// =============================================================================

describe("GetMonthlyCommissionOverviewUseCase — negative authorization", () => {
  it("throws AuthorizationError in team scope when sale.readTeam is denied", async () => {
    const { service, authorize } = makeAuthService(
      makeDenyDecision("sale.readTeam"),
    );
    const organizationRepository = makeOrganizationRepo();
    const saleRepository = makeSaleRepo();
    const commissionEntryRepository = makeCommissionEntryRepo();
    const useCase = new GetMonthlyCommissionOverviewUseCase(
      service,
      organizationRepository,
      saleRepository,
      commissionEntryRepository,
    );

    await expect(
      useCase.execute({ authContext: makeAuthContext(), scope: "TEAM" }),
    ).rejects.toThrow(AuthorizationError);

    expect(authorize).toHaveBeenCalledWith(makeAuthContext(), {
      permission: "sale.readTeam",
    });
    expect(
      organizationRepository.getDirectSubordinates,
    ).not.toHaveBeenCalled();
    expect(commissionEntryRepository.findEarnedByEmployeeIds).not.toHaveBeenCalled();
  });

  it("does not require an extra permission in own scope", async () => {
    const { service, authorize } = makeAuthService(
      makeDenyDecision("sale.readTeam"),
    );
    const useCase = new GetMonthlyCommissionOverviewUseCase(
      service,
      makeOrganizationRepo(),
      makeSaleRepo(),
      makeCommissionEntryRepo(),
    );

    const overview = await useCase.execute({
      authContext: makeAuthContext(),
      scope: "OWN",
    });

    expect(authorize).not.toHaveBeenCalled();
    expect(overview.entries).toEqual([]);
    expect(overview.totalAmount).toBe(0);
  });
});

// =============================================================================
// CreateCommissionRuleVersionUseCase
// =============================================================================

describe("CreateCommissionRuleVersionUseCase — negative authorization", () => {
  it("throws AuthorizationError and never touches the rules when denied", async () => {
    const { service, authorize } = makeAuthService(
      makeDenyDecision("commission.manageRules"),
    );
    const ruleRepository = {
      findOverlapping: vi.fn(),
      create: vi.fn(),
      closeAt: vi.fn(),
    } as unknown as CommissionRuleRepository;
    const auditPort = { log: vi.fn() } as unknown as AuditPort;
    const useCase = new CreateCommissionRuleVersionUseCase(
      service,
      ruleRepository,
      auditPort,
    );

    await expect(
      useCase.execute({
        authContext: makeAuthContext(),
        levelId: 1,
        percentage: 15,
        effectiveFrom: new Date(2026, 0, 1),
      }),
    ).rejects.toThrow(AuthorizationError);

    expect(authorize).toHaveBeenCalledWith(makeAuthContext(), {
      permission: "commission.manageRules",
    });
    expect(ruleRepository.findOverlapping).not.toHaveBeenCalled();
    expect(ruleRepository.create).not.toHaveBeenCalled();
    expect(auditPort.log).not.toHaveBeenCalled();
  });
});

// =============================================================================
// GetApplicableCommissionRuleUseCase
// =============================================================================

describe("GetApplicableCommissionRuleUseCase — negative authorization", () => {
  it("throws AuthorizationError and never queries the rule when denied", async () => {
    const { service, authorize } = makeAuthService(
      makeDenyDecision("commission.viewRules"),
    );
    const ruleRepository = {
      findApplicable: vi.fn(),
    } as unknown as CommissionRuleRepository;
    const useCase = new GetApplicableCommissionRuleUseCase(
      service,
      ruleRepository,
    );

    await expect(
      useCase.execute({
        authContext: makeAuthContext(),
        levelId: 1,
        at: new Date(2026, 3, 1),
      }),
    ).rejects.toThrow(AuthorizationError);

    expect(authorize).toHaveBeenCalledWith(makeAuthContext(), {
      permission: "commission.viewRules",
    });
    expect(ruleRepository.findApplicable).not.toHaveBeenCalled();
  });
});

// =============================================================================
// GetCommissionEntriesForSaleUseCase
// =============================================================================

describe("GetCommissionEntriesForSaleUseCase — negative authorization", () => {
  function makeEntryRepo(): {
    entryRepository: CommissionEntryRepository;
    findBySaleId: ReturnType<typeof vi.fn>;
  } {
    const findBySaleId = vi.fn().mockResolvedValue([]);
    return {
      entryRepository: { findBySaleId } as unknown as CommissionEntryRepository,
      findBySaleId,
    };
  }

  const saleInput = {
    saleId: "sale-1",
    ownerId: "emp-99",
  };

  it("throws only after every commission scope is denied and reads nothing", async () => {
    const { service, authorize } = makeAuthService(
      makeDenyDecision("commission.readOwn"),
    );
    const { entryRepository, findBySaleId } = makeEntryRepo();
    const useCase = new GetCommissionEntriesForSaleUseCase(
      service,
      entryRepository,
    );

    await expect(
      useCase.execute({ authContext: makeAuthContext(), ...saleInput }),
    ).rejects.toThrow(AuthorizationError);

    // It walks the scope ladder global → branch → team → own.
    expect(authorize).toHaveBeenCalledTimes(4);
    expect(authorize).toHaveBeenCalledWith(makeAuthContext(), {
      permission: "commission.readOwn",
      resource: { type: "commission", id: "sale-1", ownerId: "emp-99" },
    });
    expect(findBySaleId).not.toHaveBeenCalled();
  });

  it("reads the entries as soon as one scope is granted", async () => {
    const { service, authorize } = makeAuthService(
      makeAllowDecision("commission.readTeam"),
    );
    const { entryRepository, findBySaleId } = makeEntryRepo();
    const useCase = new GetCommissionEntriesForSaleUseCase(
      service,
      entryRepository,
    );

    const entries = await useCase.execute({
      authContext: makeAuthContext(),
      ...saleInput,
    });

    expect(authorize).toHaveBeenCalledTimes(1);
    expect(findBySaleId).toHaveBeenCalledWith("sale-1");
    expect(entries).toEqual([]);
  });
});
