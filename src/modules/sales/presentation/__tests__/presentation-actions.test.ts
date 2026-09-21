/**
 * Tests for sales presentation — Server Actions auth integration.
 *
 * Tests that Server Actions correctly:
 * - Resolve auth context from session
 * - Reject unauthenticated requests
 * - Delegate to use cases with proper authorization
 *
 * Reference: authorization.md §16, business-rules.md §8
 */

import { describe, it, expect, vi, beforeEach } from "vitest";
import { AuthenticationError, AuthorizationError, ValidationError } from "@/shared/errors";

// =============================================================================
// Mock the resolveAuthContext helper
// =============================================================================

const mockResolveAuthContext = vi.fn();

vi.mock("@/modules/sales/presentation/resolve-auth-context", () => ({
  resolveAuthContext: () => mockResolveAuthContext(),
}));

// =============================================================================
// Mock use cases
// =============================================================================

const mockUseCases = {
  createSale: { execute: vi.fn() },
  updateSale: { execute: vi.fn() },
  submitSaleForReview: { execute: vi.fn() },
  approveSale: { execute: vi.fn() },
  rejectSale: { execute: vi.fn() },
  cancelSale: { execute: vi.fn() },
  getSale: { execute: vi.fn() },
  listSales: { execute: vi.fn() },
  createProduct: { execute: vi.fn() },
  updateProduct: { execute: vi.fn() },
  listProducts: { execute: vi.fn() },
  createCategory: { execute: vi.fn() },
  listCategories: { execute: vi.fn() },
};

vi.mock("@/modules/sales/composition-root", () => ({
  createSalesUseCases: () => mockUseCases,
}));

vi.mock("@/modules/authorization/composition-root", () => ({
  createAuthorizationService: () => ({}),
}));

vi.mock("@/infrastructure/organization/prisma-organization-repository", () => ({
  PrismaOrganizationRepository: vi.fn(),
}));

vi.mock("@/infrastructure/prisma/client", () => ({
  prisma: {},
}));

// =============================================================================
// Tests
// =============================================================================

describe("Sales Server Actions — auth integration", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("Authentication requirement", () => {
    it("rejects action when user is not authenticated", async () => {
      mockResolveAuthContext.mockRejectedValue(
        new AuthenticationError("Authentication required."),
      );

      // Dynamic import to get the mocked version
      const { createCategory } = await import(
        "@/modules/sales/presentation/catalog-actions"
      );

      const formData = new FormData();
      formData.set("name", "Test Category");

      const result = await createCategory(
        { error: null, success: false },
        formData,
      );

      expect(result.error).toContain("iniciar sesión");
      expect(result.success).toBe(false);
    });

    it("rejects sale action when user is not authenticated", async () => {
      mockResolveAuthContext.mockRejectedValue(
        new AuthenticationError("Authentication required."),
      );

      const { approveSale } = await import(
        "@/modules/sales/presentation/sale-actions"
      );

      const result = await approveSale("sale-123");

      expect(result.error).toContain("iniciar sesión");
    });
  });

  describe("Authorization requirement", () => {
    it("rejects action when user lacks permission", async () => {
      mockResolveAuthContext.mockResolvedValue({
        userId: "user-1",
        employeeId: "emp-1",
        levelId: 1,
        role: "SELLER",
        supervisorId: null,
      });

      mockUseCases.createCategory.execute.mockRejectedValue(
        new AuthorizationError("Not authorized to create categories."),
      );

      const { createCategory } = await import(
        "@/modules/sales/presentation/catalog-actions"
      );

      const formData = new FormData();
      formData.set("name", "Test Category");

      const result = await createCategory(
        { error: null, success: false },
        formData,
      );

      expect(result.error).toContain("permisos");
      expect(result.success).toBe(false);
    });

    it("rejects approve action when user lacks sale.approve permission", async () => {
      mockResolveAuthContext.mockResolvedValue({
        userId: "user-1",
        employeeId: "emp-1",
        levelId: 1,
        role: "SELLER",
        supervisorId: null,
      });

      mockUseCases.approveSale.execute.mockRejectedValue(
        new AuthorizationError("Not authorized to approve sales."),
      );

      const { approveSale } = await import(
        "@/modules/sales/presentation/sale-actions"
      );

      const result = await approveSale("sale-123");

      expect(result.error).toContain("permisos");
    });
  });

  describe("Input validation", () => {
    it("returns validation error for empty category name", async () => {
      mockResolveAuthContext.mockResolvedValue({
        userId: "user-1",
        employeeId: "emp-1",
        levelId: null,
        role: "ADMIN",
        supervisorId: null,
      });

      mockUseCases.createCategory.execute.mockRejectedValue(
        new ValidationError("Category name is required.", "name"),
      );

      const { createCategory } = await import(
        "@/modules/sales/presentation/catalog-actions"
      );

      const formData = new FormData();
      formData.set("name", "");

      const result = await createCategory(
        { error: null, success: false },
        formData,
      );

      expect(result.error).toContain("name");
      expect(result.success).toBe(false);
    });

    it("returns validation error for empty rejection reason", async () => {
      mockResolveAuthContext.mockResolvedValue({
        userId: "user-1",
        employeeId: "emp-1",
        levelId: 3,
        role: "SELLER",
        supervisorId: null,
      });

      mockUseCases.rejectSale.execute.mockRejectedValue(
        new ValidationError("A rejection reason is required.", "rejectionReason"),
      );

      const { rejectSale } = await import(
        "@/modules/sales/presentation/sale-actions"
      );

      const formData = new FormData();
      formData.set("reason", "");

      const result = await rejectSale(
        "sale-123",
        { error: null },
        formData,
      );

      expect(result.error).toContain("reason");
    });
  });

  describe("Successful operations", () => {
    it("returns success when category is created", async () => {
      mockResolveAuthContext.mockResolvedValue({
        userId: "user-1",
        employeeId: "emp-1",
        levelId: null,
        role: "ADMIN",
        supervisorId: null,
      });

      mockUseCases.createCategory.execute.mockResolvedValue({
        category: { id: "cat-1", name: "Test" },
      });

      const { createCategory } = await import(
        "@/modules/sales/presentation/catalog-actions"
      );

      const formData = new FormData();
      formData.set("name", "Test Category");

      const result = await createCategory(
        { error: null, success: false },
        formData,
      );

      expect(result.error).toBeNull();
      expect(result.success).toBe(true);
    });

    it("returns success when sale is approved", async () => {
      mockResolveAuthContext.mockResolvedValue({
        userId: "user-1",
        employeeId: "emp-1",
        levelId: 3,
        role: "SELLER",
        supervisorId: null,
      });

      mockUseCases.approveSale.execute.mockResolvedValue({
        sale: { id: "sale-1", status: "APPROVED" },
      });

      const { approveSale } = await import(
        "@/modules/sales/presentation/sale-actions"
      );

      const result = await approveSale("sale-1");

      expect(result.error).toBeNull();
    });
  });

  describe("IDOR protection", () => {
    it("updateSale uses server-side sale lookup, not client-provided owner", async () => {
      mockResolveAuthContext.mockResolvedValue({
        userId: "user-1",
        employeeId: "emp-1",
        levelId: 1,
        role: "SELLER",
        supervisorId: null,
      });

      // The use case should look up the sale and check ownership
      mockUseCases.updateSale.execute.mockImplementation(async (input) => {
        // Verify that the authContext employeeId is used for authorization
        expect(input.authContext.employeeId).toBe("emp-1");
        // Verify that the saleId comes from the URL parameter, not the client
        expect(input.saleId).toBe("sale-from-url");
        return { sale: { id: "sale-from-url" } };
      });

      const { updateSale } = await import(
        "@/modules/sales/presentation/sale-actions"
      );

      const formData = new FormData();
      formData.set("buyerName", "Updated Name");

      const result = await updateSale(
        "sale-from-url",
        { error: null, saleId: undefined },
        formData,
      );

      expect(result.error).toBeNull();
      expect(mockUseCases.updateSale.execute).toHaveBeenCalled();
    });
  });
});
