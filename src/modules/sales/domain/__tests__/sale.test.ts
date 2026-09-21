/**
 * Tests for sale domain validation rules.
 *
 * Reference: data-model.md §11, §12
 */

import { describe, it, expect } from "vitest";
import {
  calculateSaleTotal,
  validateSaleForCreation,
  validateSaleForUpdate,
  validateSaleStatusTransition,
  validateRejectionReason,
} from "../sale";

describe("sale domain", () => {
  describe("calculateSaleTotal", () => {
    it("calculates total from multiple items", () => {
      const items = [
        { productId: "p1", quantity: 2, unitPrice: 100 },
        { productId: "p2", quantity: 3, unitPrice: 50 },
      ];
      expect(calculateSaleTotal(items)).toBe(350);
    });

    it("returns 0 for empty items", () => {
      expect(calculateSaleTotal([])).toBe(0);
    });

    it("handles single item", () => {
      const items = [{ productId: "p1", quantity: 5, unitPrice: 25 }];
      expect(calculateSaleTotal(items)).toBe(125);
    });
  });

  describe("validateSaleForCreation", () => {
    it("passes with valid input", () => {
      expect(() =>
        validateSaleForCreation({
          employeeId: "emp-1",
          saleDate: new Date(),
          items: [{ productId: "p1", quantity: 1, unitPrice: 100 }],
          visitId: "visit-1",
          buyerName: "Cliente de prueba",
          clientPhone: "1111111111",
          deliveryAddress: "Dirección de prueba",
          paymentMethod: "EFECTIVO",
          paymentStatus: "PAID",
          deliveryStatus: "PENDING",
        }),
      ).not.toThrow();
    });

    it("rejects empty employeeId", () => {
      expect(() =>
        validateSaleForCreation({
          employeeId: "",
          saleDate: new Date(),
          items: [{ productId: "p1", quantity: 1, unitPrice: 100 }],
        }),
      ).toThrow("Employee ID is required");
    });

    it("rejects invalid saleDate", () => {
      expect(() =>
        validateSaleForCreation({
          employeeId: "emp-1",
          saleDate: new Date("invalid"),
          items: [{ productId: "p1", quantity: 1, unitPrice: 100 }],
        }),
      ).toThrow("valid sale date");
    });

    it("rejects empty items", () => {
      expect(() =>
        validateSaleForCreation({
          employeeId: "emp-1",
          saleDate: new Date(),
          items: [],
        }),
      ).toThrow("at least one item");
    });

    it("rejects item with empty productId", () => {
      expect(() =>
        validateSaleForCreation({
          employeeId: "emp-1",
          saleDate: new Date(),
          items: [{ productId: "", quantity: 1, unitPrice: 100 }],
        }),
      ).toThrow("missing a product ID");
    });

    it("rejects item with zero quantity", () => {
      expect(() =>
        validateSaleForCreation({
          employeeId: "emp-1",
          saleDate: new Date(),
          items: [{ productId: "p1", quantity: 0, unitPrice: 100 }],
        }),
      ).toThrow("positive integer quantity");
    });

    it("rejects item with negative quantity", () => {
      expect(() =>
        validateSaleForCreation({
          employeeId: "emp-1",
          saleDate: new Date(),
          items: [{ productId: "p1", quantity: -1, unitPrice: 100 }],
        }),
      ).toThrow("positive integer quantity");
    });

    it("rejects item with zero unitPrice", () => {
      expect(() =>
        validateSaleForCreation({
          employeeId: "emp-1",
          saleDate: new Date(),
          items: [{ productId: "p1", quantity: 1, unitPrice: 0 }],
        }),
      ).toThrow("positive unit price");
    });

    it("rejects item with negative unitPrice", () => {
      expect(() =>
        validateSaleForCreation({
          employeeId: "emp-1",
          saleDate: new Date(),
          items: [{ productId: "p1", quantity: 1, unitPrice: -10 }],
        }),
      ).toThrow("positive unit price");
    });
  });

  describe("validateSaleForUpdate", () => {
    it("passes with valid partial update", () => {
      expect(() =>
        validateSaleForUpdate({ saleDate: new Date() }),
      ).not.toThrow();
    });

    it("passes with valid items update", () => {
      expect(() =>
        validateSaleForUpdate({
          items: [{ productId: "p1", quantity: 2, unitPrice: 50 }],
        }),
      ).not.toThrow();
    });

    it("rejects empty items array", () => {
      expect(() =>
        validateSaleForUpdate({ items: [] }),
      ).toThrow("at least one item");
    });

    it("rejects invalid saleDate", () => {
      expect(() =>
        validateSaleForUpdate({ saleDate: new Date("invalid") }),
      ).toThrow("valid sale date");
    });
  });

  describe("validateSaleStatusTransition", () => {
    it("passes for valid transition", () => {
      expect(() =>
        validateSaleStatusTransition("DRAFT", "PENDING_REVIEW"),
      ).not.toThrow();
    });

    it("throws for invalid transition", () => {
      expect(() =>
        validateSaleStatusTransition("DRAFT", "APPROVED"),
      ).toThrow("Cannot transition");
    });

    it("includes rule code in error", () => {
      try {
        validateSaleStatusTransition("DRAFT", "CANCELLED");
        expect.fail("Should have thrown");
      } catch (error: unknown) {
        expect((error as { rule: string }).rule).toBe("INVALID_SALE_TRANSITION");
      }
    });
  });

  describe("validateRejectionReason", () => {
    it("passes with valid reason", () => {
      expect(() =>
        validateRejectionReason("Missing documentation"),
      ).not.toThrow();
    });

    it("throws for empty reason", () => {
      expect(() => validateRejectionReason("")).toThrow(
        "rejection reason is required",
      );
    });

    it("throws for whitespace-only reason", () => {
      expect(() => validateRejectionReason("   ")).toThrow(
        "rejection reason is required",
      );
    });

    it("throws for undefined reason", () => {
      expect(() => validateRejectionReason(undefined)).toThrow(
        "rejection reason is required",
      );
    });
  });
});
