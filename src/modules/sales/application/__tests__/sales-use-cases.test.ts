/**
 * Tests for sales use cases — authorization integration.
 *
 * Tests that each use case correctly validates authorization
 * before executing business logic.
 *
 * Reference: authorization.md §16
 */

import { describe, it, expect, vi } from "vitest";
import { CreateSaleUseCase } from "../create-sale-use-case";
import { UpdateSaleUseCase } from "../update-sale-use-case";
import { ApproveSaleUseCase } from "../approve-sale-use-case";
import { RejectSaleUseCase } from "../reject-sale-use-case";
import { CancelSaleUseCase } from "../cancel-sale-use-case";
import { GetSaleUseCase } from "../get-sale-use-case";
import { ListSalesUseCase } from "../list-sales-use-case";
import type { AuthorizationService, AuthorizationDecision, Permission } from "@/modules/authorization/domain";
import type { SaleRepository, SaleRecord } from "@/modules/sales/domain";
import type { OrganizationRepository } from "@/modules/organization/domain";
import type { AuthorizationContext } from "@/modules/authorization/domain";
import type { AuditPort } from "@/shared/ports/audit-port";
import type { VisitRepository } from "@/modules/visits/domain/visit-repository";

// =============================================================================
// Mocks
// =============================================================================

function makeAuthContext(overrides?: Partial<AuthorizationContext>): AuthorizationContext {
  return {
    userId: "user-1",
    employeeId: "emp-1",
    levelId: 3,
    role: "SELLER",
    supervisorId: "sup-1",
    userEmail: "user@example.com",
    ...overrides,
  };
}

function makeAllowDecision(permission: string): AuthorizationDecision {
  return {
    allowed: true,
    permission: permission as Permission,
    reason: `Permission '${permission}' granted.`,
  };
}

function makeDenyDecision(permission: string): AuthorizationDecision {
  return {
    allowed: false,
    permission: permission as Permission,
    reason: `Not authorized: ${permission} not granted.`,
  };
}

function makeSaleRecord(overrides?: Partial<SaleRecord>): SaleRecord {
  return {
    id: "sale-1",
    saleNumber: 1,
    employeeId: "emp-1",
    saleDate: new Date("2026-09-01"),
    status: "DRAFT",
    totalAmount: 100,
    approvedAt: null,
    buyerName: null,
    rejectionReason: null,
    notes: null,
    createdAt: new Date(),
    updatedAt: new Date(),
    items: [],
    ...overrides,
  };
}

function makeSaleRepository(overrides?: Partial<SaleRepository>): SaleRepository {
  return {
    findById: vi.fn().mockResolvedValue(makeSaleRecord()),
    create: vi.fn().mockResolvedValue(makeSaleRecord()),
    update: vi.fn().mockResolvedValue(makeSaleRecord()),
    replaceItems: vi.fn().mockResolvedValue(makeSaleRecord()),
    updateStatus: vi.fn().mockResolvedValue(makeSaleRecord()),
    updateStatusIfCurrent: vi.fn().mockResolvedValue(makeSaleRecord()),
    list: vi.fn().mockResolvedValue({
      sales: [makeSaleRecord()],
      totalCount: 1,
      page: 1,
      pageSize: 20,
    }),
    countApprovedSince: vi.fn().mockResolvedValue(0),
    countApprovedInPeriod: vi.fn().mockResolvedValue(0),
    countApprovedSinceByEmployee: vi.fn().mockResolvedValue(new Map()),
    getMonthlyTarget: vi.fn().mockResolvedValue(0),
    countInPeriodByEmployee: vi.fn().mockResolvedValue(new Map()),
    countInPeriodForEmployees: vi.fn().mockResolvedValue(0),
    findApprovedByEmployeeId: vi.fn().mockResolvedValue([]),
    findByVisitIds: vi.fn().mockResolvedValue([]),
    findStatusRowsByEmployeeIds: vi.fn().mockResolvedValue([]),
    findSummariesByIds: vi.fn().mockResolvedValue([]),
    getMonthlyTargetsByLevelIds: vi.fn().mockResolvedValue(new Map()),
    ...overrides,
  };
}

function makeAuth(overrides?: Partial<AuthorizationService>): AuthorizationService {
  return {
    authorize: vi.fn().mockResolvedValue(makeAllowDecision("sale.create")),
    ...overrides,
  };
}

function makeOrgRepo(overrides?: Partial<OrganizationRepository>): OrganizationRepository {
  return {
    findEmployeeById: vi.fn(),
    createEmployee: vi.fn(),
    updateEmployeeLevel: vi.fn(),
    updateEmployeeSupervisor: vi.fn(),
    updateEmployeeStatus: vi.fn(),
    findLevelById: vi.fn(),
    findOpenLevelHistory: vi.fn(),
    findOpenLevelHistories: vi.fn(),
    closeLevelHistory: vi.fn(),
    createLevelHistory: vi.fn(),
    findOpenSupervisorHistory: vi.fn(),
    closeSupervisorHistory: vi.fn(),
    createSupervisorHistory: vi.fn(),
    getDirectSubordinates: vi.fn().mockResolvedValue([]),
    getDescendantIds: vi.fn().mockResolvedValue([]),
    getAncestorIds: vi.fn().mockResolvedValue([]),
    countDirectSubordinates: vi.fn(),
    getActiveEmployeeIds: vi.fn().mockResolvedValue([]),
    executeInTransaction: vi.fn().mockImplementation((fn) => fn(makeOrgRepo())),
    ...overrides,
  } as OrganizationRepository;
}

const mockAuditPort: AuditPort = {
  log: vi.fn().mockResolvedValue(undefined),
};

// =============================================================================
// CreateSaleUseCase
// =============================================================================

describe("CreateSaleUseCase", () => {
  it("creates a sale when authorized", async () => {
    const auth = makeAuth();
    const saleRepo = makeSaleRepository();
    const visitRepo: VisitRepository = {
      findById: vi.fn().mockResolvedValue({
        id: "visit-1",
        sellerId: "emp-1",
        clientId: "client-1",
        assignedById: "sup-1",
        scheduledDate: new Date("2026-09-01"),
        completedDate: new Date("2026-09-01"),
        status: "completed",
        notes: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      }),
      findBySellerId: vi.fn(),
      findBySellerIds: vi.fn(),
      findByClientId: vi.fn(),
      findByStatus: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
      countBySellerId: vi.fn(),
      countPendingBySellerId: vi.fn(),
      countCompletedBySellerIdSince: vi.fn().mockResolvedValue(0),
      countCompletedBySellerIdSinceBatch: vi.fn().mockResolvedValue(new Map()),
      countStatusBySellerIds: vi.fn().mockResolvedValue(new Map()),
    };
    const uc = new CreateSaleUseCase(auth, saleRepo, mockAuditPort, visitRepo);

    const result = await uc.execute({
      authContext: makeAuthContext(),
      saleDate: new Date("2026-09-01"),
      items: [{ productId: "p1", quantity: 2, unitPrice: 50 }],
      visitId: "visit-1",
      buyerName: "Cliente de prueba",
      clientPhone: "1111111111",
      deliveryAddress: "Dirección de prueba",
      paymentMethod: "EFECTIVO",
      paymentStatus: "PAID",
      deliveryStatus: "PENDING",
    });

    expect(result.sale).toBeDefined();
    expect(auth.authorize).toHaveBeenCalledOnce();
    expect(saleRepo.create).toHaveBeenCalledOnce();
  });

  it("throws AuthorizationError when not authorized", async () => {
    const auth = makeAuth({
      authorize: vi.fn().mockResolvedValue(
        makeDenyDecision("sale.create"),
      ),
    });
    const saleRepo = makeSaleRepository();
    const uc = new CreateSaleUseCase(auth, saleRepo, mockAuditPort);

    await expect(
      uc.execute({
        authContext: makeAuthContext(),
        saleDate: new Date("2026-09-01"),
        items: [{ productId: "p1", quantity: 1, unitPrice: 100 }],
      }),
    ).rejects.toThrow("Not authorized");
  });

  it("rejects empty items", async () => {
    const auth = makeAuth();
    const saleRepo = makeSaleRepository();
    const uc = new CreateSaleUseCase(auth, saleRepo, mockAuditPort);

    await expect(
      uc.execute({
        authContext: makeAuthContext(),
        saleDate: new Date("2026-09-01"),
        items: [],
      }),
    ).rejects.toThrow("at least one item");
  });
});

// =============================================================================
// UpdateSaleUseCase
// =============================================================================

describe("UpdateSaleUseCase", () => {
  it("updates a DRAFT sale when authorized and owner", async () => {
    const auth = makeAuth();
    const saleRepo = makeSaleRepository();
    const uc = new UpdateSaleUseCase(auth, saleRepo, mockAuditPort);

    const result = await uc.execute({
      authContext: makeAuthContext({ employeeId: "emp-1" }),
      saleId: "sale-1",
      buyerName: "Customer A",
    });

    expect(result.sale).toBeDefined();
  });

  it("rejects update of non-DRAFT sale", async () => {
    const saleRepo = makeSaleRepository({
      findById: vi.fn().mockResolvedValue(
        makeSaleRecord({ status: "APPROVED" }),
      ),
    });
    const auth = makeAuth();
    const uc = new UpdateSaleUseCase(auth, saleRepo, mockAuditPort);

    await expect(
      uc.execute({
        authContext: makeAuthContext(),
        saleId: "sale-1",
        buyerName: "Customer",
      }),
    ).rejects.toThrow("Only DRAFT");
  });

  it("rejects update when not authorized", async () => {
    const auth = makeAuth({
      authorize: vi.fn().mockResolvedValue(
        makeDenyDecision("sale.update"),
      ),
    });
    const saleRepo = makeSaleRepository();
    const uc = new UpdateSaleUseCase(auth, saleRepo, mockAuditPort);

    await expect(
      uc.execute({
        authContext: makeAuthContext(),
        saleId: "sale-1",
        buyerName: "Customer",
      }),
    ).rejects.toThrow("Not authorized");
  });
});

// =============================================================================
// ApproveSaleUseCase
// =============================================================================

describe("ApproveSaleUseCase", () => {
  it("approves a PENDING_REVIEW sale when authorized", async () => {
    const auth = makeAuth({
      authorize: vi.fn().mockResolvedValue(
        makeAllowDecision("sale.approve"),
      ),
    });
    const saleRepo = makeSaleRepository({
      findById: vi.fn().mockResolvedValue(
        makeSaleRecord({ status: "PENDING_REVIEW" }),
      ),
    });
    const uc = new ApproveSaleUseCase(auth, saleRepo, mockAuditPort);

    const result = await uc.execute({
      authContext: makeAuthContext({ levelId: 4 }),
      saleId: "sale-1",
    });

    expect(result.sale).toBeDefined();
    expect(saleRepo.updateStatus).toHaveBeenCalledWith(
      "sale-1",
      "APPROVED",
    );
  });

  it("rejects approval of non-PENDING_REVIEW sale", async () => {
    const auth = makeAuth({
      authorize: vi.fn().mockResolvedValue(
        makeAllowDecision("sale.approve"),
      ),
    });
    const saleRepo = makeSaleRepository({
      findById: vi.fn().mockResolvedValue(
        makeSaleRecord({ status: "DRAFT" }),
      ),
    });
    const uc = new ApproveSaleUseCase(auth, saleRepo, mockAuditPort);

    await expect(
      uc.execute({
        authContext: makeAuthContext({ levelId: 4 }),
        saleId: "sale-1",
      }),
    ).rejects.toThrow("Cannot transition");
  });

  it("rejects approval when not authorized", async () => {
    const auth = makeAuth({
      authorize: vi.fn().mockResolvedValue(
        makeDenyDecision("sale.approve"),
      ),
    });
    const saleRepo = makeSaleRepository({
      findById: vi.fn().mockResolvedValue(
        makeSaleRecord({ status: "PENDING_REVIEW" }),
      ),
    });
    const uc = new ApproveSaleUseCase(auth, saleRepo, mockAuditPort);

    await expect(
      uc.execute({
        authContext: makeAuthContext({ levelId: 1 }),
        saleId: "sale-1",
      }),
    ).rejects.toThrow("Not authorized");
  });
});

// =============================================================================
// RejectSaleUseCase
// =============================================================================

describe("RejectSaleUseCase", () => {
  it("rejects a PENDING_REVIEW sale with reason when authorized", async () => {
    const auth = makeAuth({
      authorize: vi.fn().mockResolvedValue(
        makeAllowDecision("sale.reject"),
      ),
    });
    const saleRepo = makeSaleRepository({
      findById: vi.fn().mockResolvedValue(
        makeSaleRecord({ status: "PENDING_REVIEW" }),
      ),
    });
    const uc = new RejectSaleUseCase(auth, saleRepo, mockAuditPort);

    const result = await uc.execute({
      authContext: makeAuthContext({ levelId: 4 }),
      saleId: "sale-1",
      reason: "Missing documentation",
    });

    expect(result.sale).toBeDefined();
    expect(saleRepo.updateStatus).toHaveBeenCalledWith(
      "sale-1",
      "REJECTED",
      "Missing documentation",
    );
  });

  it("rejects when reason is empty", async () => {
    const auth = makeAuth({
      authorize: vi.fn().mockResolvedValue(
        makeAllowDecision("sale.reject"),
      ),
    });
    const saleRepo = makeSaleRepository({
      findById: vi.fn().mockResolvedValue(
        makeSaleRecord({ status: "PENDING_REVIEW" }),
      ),
    });
    const uc = new RejectSaleUseCase(auth, saleRepo, mockAuditPort);

    await expect(
      uc.execute({
        authContext: makeAuthContext({ levelId: 4 }),
        saleId: "sale-1",
        reason: "",
      }),
    ).rejects.toThrow("rejection reason is required");
  });

  it("rejects when not authorized", async () => {
    const auth = makeAuth({
      authorize: vi.fn().mockResolvedValue(
        makeDenyDecision("sale.reject"),
      ),
    });
    const saleRepo = makeSaleRepository({
      findById: vi.fn().mockResolvedValue(
        makeSaleRecord({ status: "PENDING_REVIEW" }),
      ),
    });
    const uc = new RejectSaleUseCase(auth, saleRepo, mockAuditPort);

    await expect(
      uc.execute({
        authContext: makeAuthContext({ levelId: 1 }),
        saleId: "sale-1",
        reason: "Bad sale",
      }),
    ).rejects.toThrow("Not authorized");
  });
});

// =============================================================================
// CancelSaleUseCase
// =============================================================================

describe("CancelSaleUseCase", () => {
  it("cancels an APPROVED sale when authorized", async () => {
    const auth = makeAuth({
      authorize: vi.fn().mockResolvedValue(
        makeAllowDecision("sale.cancel"),
      ),
    });
    const saleRepo = makeSaleRepository({
      findById: vi.fn().mockResolvedValue(
        makeSaleRecord({ status: "APPROVED" }),
      ),
    });
    const uc = new CancelSaleUseCase(auth, saleRepo, mockAuditPort);

    const result = await uc.execute({
      authContext: makeAuthContext(),
      saleId: "sale-1",
    });

    expect(result.sale).toBeDefined();
    expect(saleRepo.updateStatus).toHaveBeenCalledWith(
      "sale-1",
      "CANCELLED",
    );
  });

  it("rejects cancellation of non-APPROVED sale", async () => {
    const auth = makeAuth({
      authorize: vi.fn().mockResolvedValue(
        makeAllowDecision("sale.cancel"),
      ),
    });
    const saleRepo = makeSaleRepository({
      findById: vi.fn().mockResolvedValue(
        makeSaleRecord({ status: "DRAFT" }),
      ),
    });
    const uc = new CancelSaleUseCase(auth, saleRepo, mockAuditPort);

    await expect(
      uc.execute({
        authContext: makeAuthContext(),
        saleId: "sale-1",
      }),
    ).rejects.toThrow("Cannot transition");
  });
});

// =============================================================================
// GetSaleUseCase
// =============================================================================

describe("GetSaleUseCase", () => {
  it("returns sale when authorized", async () => {
    const auth = makeAuth({
      authorize: vi.fn().mockResolvedValue(
        makeAllowDecision("sale.readOwn"),
      ),
    });
    const saleRepo = makeSaleRepository();
    const uc = new GetSaleUseCase(auth, saleRepo);

    const result = await uc.execute({
      authContext: makeAuthContext(),
      saleId: "sale-1",
    });

    expect(result.sale).toBeDefined();
  });

  it("throws when not authorized", async () => {
    const auth = makeAuth({
      authorize: vi.fn().mockResolvedValue(
        makeDenyDecision("sale.readOwn"),
      ),
    });
    const saleRepo = makeSaleRepository();
    const uc = new GetSaleUseCase(auth, saleRepo);

    await expect(
      uc.execute({
        authContext: makeAuthContext(),
        saleId: "sale-1",
      }),
    ).rejects.toThrow("Not authorized");
  });

  it("throws NotFoundError when sale does not exist", async () => {
    const auth = makeAuth();
    const saleRepo = makeSaleRepository({
      findById: vi.fn().mockResolvedValue(null),
    });
    const uc = new GetSaleUseCase(auth, saleRepo);

    await expect(
      uc.execute({
        authContext: makeAuthContext(),
        saleId: "nonexistent",
      }),
    ).rejects.toThrow("not found");
  });
});

// =============================================================================
// ListSalesUseCase
// =============================================================================

describe("ListSalesUseCase", () => {
  it("lists sales with OWN scope for level 1", async () => {
    const auth = makeAuth({
      authorize: vi.fn().mockResolvedValue(
        makeAllowDecision("sale.readOwn"),
      ),
    });
    const saleRepo = makeSaleRepository();
    const orgRepo = makeOrgRepo();
    const uc = new ListSalesUseCase(auth, saleRepo, orgRepo);

    const result = await uc.execute({
      authContext: makeAuthContext({ levelId: 1 }),
    });

    expect(result.sales).toBeDefined();
    expect(result.totalCount).toBe(1);
  });

  it("lists sales with BRANCH scope for level 3+", async () => {
    const auth = makeAuth({
      authorize: vi.fn().mockResolvedValue(
        makeAllowDecision("sale.readBranch"),
      ),
    });
    const saleRepo = makeSaleRepository();
    const orgRepo = makeOrgRepo({
      getDescendantIds: vi.fn().mockResolvedValue(["emp-2", "emp-3"]),
    });
    const uc = new ListSalesUseCase(auth, saleRepo, orgRepo);

    const result = await uc.execute({
      authContext: makeAuthContext({ levelId: 3 }),
    });

    expect(result.sales).toBeDefined();
  });

  it("lists all sales with GLOBAL scope for admin", async () => {
    const auth = makeAuth({
      authorize: vi.fn().mockResolvedValue(
        makeAllowDecision("sale.readGlobal"),
      ),
    });
    const saleRepo = makeSaleRepository();
    const orgRepo = makeOrgRepo();
    const uc = new ListSalesUseCase(auth, saleRepo, orgRepo);

    const result = await uc.execute({
      authContext: makeAuthContext({ role: "ADMIN", levelId: null }),
    });

    expect(result.sales).toBeDefined();
  });

  it("rejects when not authorized", async () => {
    const auth = makeAuth({
      authorize: vi.fn().mockResolvedValue(
        makeDenyDecision("sale.readOwn"),
      ),
    });
    const saleRepo = makeSaleRepository();
    const orgRepo = makeOrgRepo();
    const uc = new ListSalesUseCase(auth, saleRepo, orgRepo);

    await expect(
      uc.execute({
        authContext: makeAuthContext({ levelId: 1 }),
      }),
    ).rejects.toThrow("Not authorized");
  });
});
