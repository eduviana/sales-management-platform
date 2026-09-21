import { describe, it, expect } from "vitest";
import {
  isValidLevel,
  getLevelName,
  isValidPromotion,
  isValidDemotion,
  isValidLevelChange,
} from "../../domain/level";

describe("Level domain rules", () => {
  describe("isValidLevel", () => {
    it.each([1, 2, 3, 4, 5, 6, 7])("should accept valid level N%s", (n) => {
      expect(isValidLevel(n)).toBe(true);
    });

    it.each([0, 8, -1, 1.5, NaN])(
      "should reject invalid level %s",
      (n) => {
        expect(isValidLevel(n)).toBe(false);
      },
    );
  });

  describe("getLevelName", () => {
    it("should return the commercial name for known levels", () => {
      expect(getLevelName(1)).toBe("Vendedor");
      expect(getLevelName(3)).toBe("Distribuidor");
      expect(getLevelName(7)).toBe("Max");
    });

    it("should return a generic name for unknown levels", () => {
      expect(getLevelName(99)).toBe("Nivel 99");
    });
  });

  describe("isValidPromotion", () => {
    it.each([
      [1, 2],
      [2, 3],
      [3, 4],
      [4, 5],
      [5, 6],
      [6, 7],
    ])("should accept valid promotion N%s → N%s", (from, to) => {
      expect(isValidPromotion(from, to)).toBe(true);
    });

    it.each([
      [7, 8],
      [1, 3],
      [3, 2],
      [1, 1],
    ])("should reject invalid promotion N%s → N%s", (from, to) => {
      expect(isValidPromotion(from, to)).toBe(false);
    });
  });

  describe("isValidDemotion", () => {
    it.each([
      [2, 1],
      [3, 2],
      [4, 3],
      [5, 4],
      [6, 5],
      [7, 6],
      [7, 1],
    ])("should accept valid demotion N%s → N%s", (from, to) => {
      expect(isValidDemotion(from, to)).toBe(true);
    });

    it.each([
      [1, 2],
      [3, 4],
      [1, 1],
      [0, 1],
    ])("should reject invalid demotion N%s → N%s", (from, to) => {
      expect(isValidDemotion(from, to)).toBe(false);
    });
  });

  describe("isValidLevelChange", () => {
    it("should accept promotion", () => {
      expect(isValidLevelChange(1, 2)).toBe(true);
    });

    it("should accept demotion", () => {
      expect(isValidLevelChange(3, 1)).toBe(true);
    });

    it("should accept same level (no change)", () => {
      expect(isValidLevelChange(3, 3)).toBe(true);
    });

    it("should reject multi-level jump up", () => {
      expect(isValidLevelChange(1, 3)).toBe(false);
    });

    it("should reject invalid levels", () => {
      expect(isValidLevelChange(0, 1)).toBe(false);
      expect(isValidLevelChange(1, 8)).toBe(false);
    });
  });
});
