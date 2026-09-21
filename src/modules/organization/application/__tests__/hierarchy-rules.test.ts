import { describe, it, expect } from "vitest";
import {
  isValidSupervisorAssignment,
  wouldCreateCycle,
} from "../../domain/hierarchy-rules";

describe("Hierarchy rules", () => {
  describe("isValidSupervisorAssignment", () => {
    it("should allow null supervisor (top of hierarchy)", () => {
      expect(isValidSupervisorAssignment("A", null)).toBe(true);
    });

    it("should allow different employee as supervisor", () => {
      expect(isValidSupervisorAssignment("A", "B")).toBe(true);
    });

    it("should reject self-supervision", () => {
      expect(isValidSupervisorAssignment("A", "A")).toBe(false);
    });
  });

  describe("wouldCreateCycle", () => {
    it("should return true when candidate supervisor is in descendants", () => {
      expect(
        wouldCreateCycle(["B", "C", "D"], "C"),
      ).toBe(true);
    });

    it("should return false when candidate supervisor is not in descendants", () => {
      expect(
        wouldCreateCycle(["B", "C", "D"], "E"),
      ).toBe(false);
    });

    it("should return false for empty descendants", () => {
      expect(wouldCreateCycle([], "A")).toBe(false);
    });

    it("should return true when candidate is direct child", () => {
      expect(wouldCreateCycle(["B"], "B")).toBe(true);
    });
  });
});
