/**
 * Tests for catalog domain validation rules.
 *
 * Reference: data-model.md §13
 */

import { describe, it, expect } from "vitest";
import {
  validateProductForCreation,
  validateProductForUpdate,
  validateCategoryForCreation,
  validateCategoryForUpdate,
} from "../catalog";

describe("catalog domain", () => {
  describe("validateProductForCreation", () => {
    const validInput = {
      code: "PROD-001",
      name: "Product A",
      price: 100,
      categoryId: "cat-1",
    };

    it("passes with valid input", () => {
      expect(() => validateProductForCreation(validInput)).not.toThrow();
    });

    it("passes with optional description", () => {
      expect(() =>
        validateProductForCreation({ ...validInput, description: "A product" }),
      ).not.toThrow();
    });

    it("rejects empty code", () => {
      expect(() =>
        validateProductForCreation({ ...validInput, code: "" }),
      ).toThrow("Product code is required");
    });

    it("rejects code exceeding 50 characters", () => {
      expect(() =>
        validateProductForCreation({
          ...validInput,
          code: "A".repeat(51),
        }),
      ).toThrow("not exceed 50 characters");
    });

    it("rejects empty name", () => {
      expect(() =>
        validateProductForCreation({ ...validInput, name: "" }),
      ).toThrow("Product name is required");
    });

    it("rejects name exceeding 200 characters", () => {
      expect(() =>
        validateProductForCreation({
          ...validInput,
          name: "A".repeat(201),
        }),
      ).toThrow("not exceed 200 characters");
    });

    it("rejects zero price", () => {
      expect(() =>
        validateProductForCreation({ ...validInput, price: 0 }),
      ).toThrow("positive");
    });

    it("rejects negative price", () => {
      expect(() =>
        validateProductForCreation({ ...validInput, price: -10 }),
      ).toThrow("positive");
    });

    it("rejects empty categoryId", () => {
      expect(() =>
        validateProductForCreation({ ...validInput, categoryId: "" }),
      ).toThrow("Category ID is required");
    });
  });

  describe("validateProductForUpdate", () => {
    it("passes with valid name update", () => {
      expect(() =>
        validateProductForUpdate({ name: "New Name" }),
      ).not.toThrow();
    });

    it("passes with valid price update", () => {
      expect(() =>
        validateProductForUpdate({ price: 200 }),
      ).not.toThrow();
    });

    it("passes with empty update (no changes)", () => {
      expect(() => validateProductForUpdate({})).not.toThrow();
    });

    it("rejects empty name", () => {
      expect(() =>
        validateProductForUpdate({ name: "" }),
      ).toThrow("cannot be empty");
    });

    it("rejects name exceeding 200 characters", () => {
      expect(() =>
        validateProductForUpdate({ name: "A".repeat(201) }),
      ).toThrow("not exceed 200 characters");
    });

    it("rejects zero price", () => {
      expect(() =>
        validateProductForUpdate({ price: 0 }),
      ).toThrow("positive");
    });
  });

  describe("validateCategoryForCreation", () => {
    it("passes with valid name", () => {
      expect(() =>
        validateCategoryForCreation({ name: "Skincare" }),
      ).not.toThrow();
    });

    it("passes with description", () => {
      expect(() =>
        validateCategoryForCreation({
          name: "Skincare",
          description: "Skin care products",
        }),
      ).not.toThrow();
    });

    it("rejects empty name", () => {
      expect(() =>
        validateCategoryForCreation({ name: "" }),
      ).toThrow("Category name is required");
    });

    it("rejects name exceeding 150 characters", () => {
      expect(() =>
        validateCategoryForCreation({ name: "A".repeat(151) }),
      ).toThrow("not exceed 150 characters");
    });
  });

  describe("validateCategoryForUpdate", () => {
    it("passes with valid name update", () => {
      expect(() =>
        validateCategoryForUpdate({ name: "New Name" }),
      ).not.toThrow();
    });

    it("passes with empty update", () => {
      expect(() => validateCategoryForUpdate({})).not.toThrow();
    });

    it("rejects empty name", () => {
      expect(() =>
        validateCategoryForUpdate({ name: "" }),
      ).toThrow("cannot be empty");
    });

    it("rejects name exceeding 150 characters", () => {
      expect(() =>
        validateCategoryForUpdate({ name: "A".repeat(151) }),
      ).toThrow("not exceed 150 characters");
    });
  });
});
