/**
 * Tests for catalog use cases — authorization integration.
 *
 * Tests that catalog operations correctly validate authorization.
 *
 * Reference: authorization.md §16
 */

import { describe, it, expect, vi } from "vitest";
import { CreateProductUseCase } from "../create-product-use-case";
import { ListProductsUseCase } from "../list-products-use-case";
import { CreateCategoryUseCase } from "../create-category-use-case";
import { ListCategoriesUseCase } from "../list-categories-use-case";
import type { AuthorizationService, AuthorizationDecision, Permission } from "@/modules/authorization/domain";
import type { ProductRepository, ProductRecord } from "@/modules/sales/domain";
import type { ProductCategoryRepository, ProductCategoryRecord } from "@/modules/sales/domain";
import type { AuthorizationContext } from "@/modules/authorization/domain";

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

function makeAllowDecision(permission: string): AuthorizationDecision {
  return {
    allowed: true,
    permission: permission as Permission,
    reason: "granted",
  };
}

function makeDenyDecision(permission: string): AuthorizationDecision {
  return {
    allowed: false,
    permission: permission as Permission,
    reason: `Not authorized: ${permission} not granted.`,
  };
}

function makeProductRecord(overrides?: Partial<ProductRecord>): ProductRecord {
  return {
    id: "prod-1",
    code: "PROD-001",
    name: "Product A",
    description: null,
    price: 100,
    categoryId: "cat-1",
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date(),
    ...overrides,
  };
}

function makeCategoryRecord(overrides?: Partial<ProductCategoryRecord>): ProductCategoryRecord {
  return {
    id: "cat-1",
    name: "Skincare",
    description: null,
    createdAt: new Date(),
    updatedAt: new Date(),
    ...overrides,
  };
}

function makeProductRepo(overrides?: Partial<ProductRepository>): ProductRepository {
  return {
    findById: vi.fn().mockResolvedValue(makeProductRecord()),
    findByCode: vi.fn().mockResolvedValue(null),
    create: vi.fn().mockResolvedValue(makeProductRecord()),
    update: vi.fn().mockResolvedValue(makeProductRecord()),
    list: vi.fn().mockResolvedValue([makeProductRecord()]),
    ...overrides,
  };
}

function makeCategoryRepo(overrides?: Partial<ProductCategoryRepository>): ProductCategoryRepository {
  return {
    findById: vi.fn().mockResolvedValue(makeCategoryRecord()),
    create: vi.fn().mockResolvedValue(makeCategoryRecord()),
    update: vi.fn().mockResolvedValue(makeCategoryRecord()),
    list: vi.fn().mockResolvedValue([makeCategoryRecord()]),
    ...overrides,
  };
}

function makeAuth(overrides?: Partial<AuthorizationService>): AuthorizationService {
  return {
    authorize: vi.fn().mockResolvedValue(makeAllowDecision("catalog.create")),
    ...overrides,
  };
}

// =============================================================================
// CreateProductUseCase
// =============================================================================

describe("CreateProductUseCase", () => {
  it("creates a product when authorized", async () => {
    const auth = makeAuth();
    const productRepo = makeProductRepo();
    const uc = new CreateProductUseCase(auth, productRepo);

    const result = await uc.execute({
      authContext: makeAuthContext(),
      code: "PROD-001",
      name: "Product A",
      price: 100,
      categoryId: "cat-1",
    });

    expect(result.product).toBeDefined();
    expect(productRepo.create).toHaveBeenCalledOnce();
  });

  it("throws when not authorized", async () => {
    const auth = makeAuth({
      authorize: vi.fn().mockResolvedValue(
        makeDenyDecision("catalog.create"),
      ),
    });
    const productRepo = makeProductRepo();
    const uc = new CreateProductUseCase(auth, productRepo);

    await expect(
      uc.execute({
        authContext: makeAuthContext({ role: "SELLER", levelId: 1 }),
        code: "PROD-001",
        name: "Product A",
        price: 100,
        categoryId: "cat-1",
      }),
    ).rejects.toThrow("Not authorized");
  });

  it("rejects duplicate code", async () => {
    const auth = makeAuth();
    const productRepo = makeProductRepo({
      findByCode: vi.fn().mockResolvedValue(makeProductRecord()),
    });
    const uc = new CreateProductUseCase(auth, productRepo);

    await expect(
      uc.execute({
        authContext: makeAuthContext(),
        code: "PROD-001",
        name: "Product A",
        price: 100,
        categoryId: "cat-1",
      }),
    ).rejects.toThrow("already exists");
  });
});

// =============================================================================
// ListProductsUseCase
// =============================================================================

describe("ListProductsUseCase", () => {
  it("lists products when authorized", async () => {
    const auth = makeAuth({
      authorize: vi.fn().mockResolvedValue(
        makeAllowDecision("catalog.read"),
      ),
    });
    const productRepo = makeProductRepo();
    const uc = new ListProductsUseCase(auth, productRepo);

    const result = await uc.execute({
      authContext: makeAuthContext(),
    });

    expect(result.products).toHaveLength(1);
  });

  it("throws when not authorized", async () => {
    const auth = makeAuth({
      authorize: vi.fn().mockResolvedValue(
        makeDenyDecision("catalog.read"),
      ),
    });
    const productRepo = makeProductRepo();
    const uc = new ListProductsUseCase(auth, productRepo);

    await expect(
      uc.execute({
        authContext: makeAuthContext({ role: "SELLER", levelId: 1 }),
      }),
    ).rejects.toThrow("Not authorized");
  });
});

// =============================================================================
// CreateCategoryUseCase
// =============================================================================

describe("CreateCategoryUseCase", () => {
  it("creates a category when authorized", async () => {
    const auth = makeAuth();
    const categoryRepo = makeCategoryRepo();
    const uc = new CreateCategoryUseCase(auth, categoryRepo);

    const result = await uc.execute({
      authContext: makeAuthContext(),
      name: "Skincare",
    });

    expect(result.category).toBeDefined();
  });

  it("throws when not authorized", async () => {
    const auth = makeAuth({
      authorize: vi.fn().mockResolvedValue(
        makeDenyDecision("catalog.create"),
      ),
    });
    const categoryRepo = makeCategoryRepo();
    const uc = new CreateCategoryUseCase(auth, categoryRepo);

    await expect(
      uc.execute({
        authContext: makeAuthContext({ role: "SELLER", levelId: 1 }),
        name: "Skincare",
      }),
    ).rejects.toThrow("Not authorized");
  });
});

// =============================================================================
// ListCategoriesUseCase
// =============================================================================

describe("ListCategoriesUseCase", () => {
  it("lists categories when authorized", async () => {
    const auth = makeAuth({
      authorize: vi.fn().mockResolvedValue(
        makeAllowDecision("catalog.read"),
      ),
    });
    const categoryRepo = makeCategoryRepo();
    const uc = new ListCategoriesUseCase(auth, categoryRepo);

    const result = await uc.execute({
      authContext: makeAuthContext(),
    });

    expect(result.categories).toHaveLength(1);
  });

  it("throws when not authorized", async () => {
    const auth = makeAuth({
      authorize: vi.fn().mockResolvedValue(
        makeDenyDecision("catalog.read"),
      ),
    });
    const categoryRepo = makeCategoryRepo();
    const uc = new ListCategoriesUseCase(auth, categoryRepo);

    await expect(
      uc.execute({
        authContext: makeAuthContext({ role: "SELLER", levelId: 1 }),
      }),
    ).rejects.toThrow("Not authorized");
  });
});
