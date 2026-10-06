/**
 * Negative authorization tests for the sales module (P3, ADR-020 roadmap).
 *
 * Every protected use case must reject with `AuthorizationError` before it
 * touches a repository or the audit port when the authorization service
 * denies the request.
 *
 * Reference: authorization.md §7, permissions-matrix.md §4.7, TEST-authorization
 */

import { describe, it, expect, vi } from "vitest";
import { GetProductByIdUseCase } from "../get-product-by-id-use-case";
import { UpdateProductUseCase } from "../update-product-use-case";
import { SubmitSaleForReviewUseCase } from "../submit-sale-for-review-use-case";
import { AuthorizationError } from "@/shared/errors";
import type {
  AuthorizationContext,
  AuthorizationDecision,
  AuthorizationService,
  Permission,
} from "@/modules/authorization/domain";
import type { ProductRepository, SaleRepository, SaleRecord } from "@/modules/sales/domain";
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

function makeAuthService(decision: AuthorizationDecision): {
  service: AuthorizationService;
  authorize: ReturnType<typeof vi.fn>;
} {
  const authorize = vi.fn().mockResolvedValue(decision);
  return { service: { authorize } as unknown as AuthorizationService, authorize };
}

function makeProductRepo(): ProductRepository {
  return {
    findById: vi.fn().mockResolvedValue(null),
    findByIds: vi.fn().mockResolvedValue([]),
    list: vi.fn().mockResolvedValue({ products: [], totalCount: 0, page: 1, pageSize: 10 }),
    create: vi.fn(),
    update: vi.fn(),
    softDelete: vi.fn(),
  } as unknown as ProductRepository;
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

function makeSaleRepo(): SaleRepository {
  return {
    findById: vi.fn().mockResolvedValue(makeSaleRecord()),
    updateStatus: vi.fn().mockResolvedValue(makeSaleRecord()),
  } as unknown as SaleRepository;
}

function makeAuditPort(): AuditPort {
  return { log: vi.fn().mockResolvedValue(undefined) } as unknown as AuditPort;
}

// =============================================================================
// GetProductByIdUseCase
// =============================================================================

describe("GetProductByIdUseCase — negative authorization", () => {
  it("throws AuthorizationError and never reads the product when denied", async () => {
    const { service, authorize } = makeAuthService(
      makeDenyDecision("catalog.read"),
    );
    const productRepository = makeProductRepo();
    const useCase = new GetProductByIdUseCase(service, productRepository);

    await expect(
      useCase.execute({ authContext: makeAuthContext(), productId: "prod-1" }),
    ).rejects.toThrow(AuthorizationError);

    expect(authorize).toHaveBeenCalledWith(
      makeAuthContext(),
      { permission: "catalog.read" },
    );
    expect(productRepository.findById).not.toHaveBeenCalled();
  });
});

// =============================================================================
// UpdateProductUseCase
// =============================================================================

describe("UpdateProductUseCase — negative authorization", () => {
  it("throws AuthorizationError and never touches the product when denied", async () => {
    const { service, authorize } = makeAuthService(
      makeDenyDecision("catalog.update"),
    );
    const productRepository = makeProductRepo();
    const useCase = new UpdateProductUseCase(service, productRepository);

    await expect(
      useCase.execute({
        authContext: makeAuthContext(),
        productId: "prod-1",
        name: "Nuevo nombre",
      }),
    ).rejects.toThrow(AuthorizationError);

    expect(authorize).toHaveBeenCalledWith(
      makeAuthContext(),
      { permission: "catalog.update" },
    );
    expect(productRepository.findById).not.toHaveBeenCalled();
    expect(productRepository.update).not.toHaveBeenCalled();
  });
});

// =============================================================================
// SubmitSaleForReviewUseCase
// =============================================================================

describe("SubmitSaleForReviewUseCase — negative authorization", () => {
  it("throws AuthorizationError and never transitions the sale when denied", async () => {
    const { service } = makeAuthService(makeDenyDecision("sale.update"));
    const saleRepository = makeSaleRepo();
    const auditPort = makeAuditPort();
    const useCase = new SubmitSaleForReviewUseCase(
      service,
      saleRepository,
      auditPort,
    );

    await expect(
      useCase.execute({ authContext: makeAuthContext(), saleId: "sale-1" }),
    ).rejects.toThrow(AuthorizationError);

    expect(saleRepository.updateStatus).not.toHaveBeenCalled();
    expect(auditPort.log).not.toHaveBeenCalled();
  });

  it("authorizes with the sale as resource (ownership check, no IDOR)", async () => {
    const { service, authorize } = makeAuthService(makeDenyDecision("sale.update"));
    const saleRepository = makeSaleRepo();
    const auditPort = makeAuditPort();
    const useCase = new SubmitSaleForReviewUseCase(
      service,
      saleRepository,
      auditPort,
    );

    await useCase
      .execute({ authContext: makeAuthContext({ employeeId: "emp-2" }), saleId: "sale-1" })
      .catch(() => undefined);

    // The decision is delegated to the service, but the use case must always
    // hand over the resource owner so the service can reject foreign sales.
    expect(authorize).toHaveBeenCalledWith(
      makeAuthContext({ employeeId: "emp-2" }),
      {
        permission: "sale.update",
        resource: {
          type: "sale",
          id: "sale-1",
          ownerId: "emp-1",
        },
      },
    );
  });
});
