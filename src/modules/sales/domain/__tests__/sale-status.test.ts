/**
 * Tests for sale status and transition rules.
 *
 * Reference: business-rules.md §16.1
 */

import { describe, it, expect } from "vitest";
import {
  canTransitionTo,
  getValidTransitions,
  isTerminalStatus,
} from "../sale-status";
import type { SaleStatus } from "../sale-status";

describe("sale-status", () => {
  describe("canTransitionTo", () => {
    describe("DRAFT transitions", () => {
      it("allows DRAFT → PENDING_REVIEW", () => {
        expect(canTransitionTo("DRAFT", "PENDING_REVIEW")).toBe(true);
      });

      it("rejects DRAFT → APPROVED", () => {
        expect(canTransitionTo("DRAFT", "APPROVED")).toBe(false);
      });

      it("rejects DRAFT → REJECTED", () => {
        expect(canTransitionTo("DRAFT", "REJECTED")).toBe(false);
      });

      it("rejects DRAFT → CANCELLED", () => {
        expect(canTransitionTo("DRAFT", "CANCELLED")).toBe(false);
      });

      it("rejects DRAFT → DRAFT (self-transition)", () => {
        expect(canTransitionTo("DRAFT", "DRAFT")).toBe(false);
      });
    });

    describe("PENDING_REVIEW transitions", () => {
      it("allows PENDING_REVIEW → APPROVED", () => {
        expect(canTransitionTo("PENDING_REVIEW", "APPROVED")).toBe(true);
      });

      it("allows PENDING_REVIEW → REJECTED", () => {
        expect(canTransitionTo("PENDING_REVIEW", "REJECTED")).toBe(true);
      });

      it("rejects PENDING_REVIEW → DRAFT", () => {
        expect(canTransitionTo("PENDING_REVIEW", "DRAFT")).toBe(false);
      });

      it("rejects PENDING_REVIEW → CANCELLED", () => {
        expect(canTransitionTo("PENDING_REVIEW", "CANCELLED")).toBe(false);
      });
    });

    describe("APPROVED transitions", () => {
      it("allows APPROVED → CANCELLED", () => {
        expect(canTransitionTo("APPROVED", "CANCELLED")).toBe(true);
      });

      it("rejects APPROVED → DRAFT", () => {
        expect(canTransitionTo("APPROVED", "DRAFT")).toBe(false);
      });

      it("rejects APPROVED → PENDING_REVIEW", () => {
        expect(canTransitionTo("APPROVED", "PENDING_REVIEW")).toBe(false);
      });

      it("rejects APPROVED → REJECTED", () => {
        expect(canTransitionTo("APPROVED", "REJECTED")).toBe(false);
      });
    });

    describe("REJECTED transitions", () => {
      it("allows REJECTED → DRAFT", () => {
        expect(canTransitionTo("REJECTED", "DRAFT")).toBe(true);
      });

      it("rejects REJECTED → PENDING_REVIEW", () => {
        expect(canTransitionTo("REJECTED", "PENDING_REVIEW")).toBe(false);
      });

      it("rejects REJECTED → APPROVED", () => {
        expect(canTransitionTo("REJECTED", "APPROVED")).toBe(false);
      });

      it("rejects REJECTED → CANCELLED", () => {
        expect(canTransitionTo("REJECTED", "CANCELLED")).toBe(false);
      });
    });

    describe("CANCELLED transitions", () => {
      it("rejects all transitions from CANCELLED (terminal)", () => {
        const targets: SaleStatus[] = [
          "DRAFT",
          "PENDING_REVIEW",
          "APPROVED",
          "REJECTED",
          "CANCELLED",
        ];
        for (const target of targets) {
          expect(canTransitionTo("CANCELLED", target)).toBe(false);
        }
      });
    });
  });

  describe("getValidTransitions", () => {
    it("DRAFT → [PENDING_REVIEW]", () => {
      expect(getValidTransitions("DRAFT")).toEqual(["PENDING_REVIEW"]);
    });

    it("PENDING_REVIEW → [APPROVED, REJECTED]", () => {
      expect(getValidTransitions("PENDING_REVIEW")).toEqual([
        "APPROVED",
        "REJECTED",
      ]);
    });

    it("APPROVED → [CANCELLED]", () => {
      expect(getValidTransitions("APPROVED")).toEqual(["CANCELLED"]);
    });

    it("REJECTED → [DRAFT]", () => {
      expect(getValidTransitions("REJECTED")).toEqual(["DRAFT"]);
    });

    it("CANCELLED → []", () => {
      expect(getValidTransitions("CANCELLED")).toEqual([]);
    });
  });

  describe("isTerminalStatus", () => {
    it("CANCELLED is terminal", () => {
      expect(isTerminalStatus("CANCELLED")).toBe(true);
    });

    it("DRAFT is not terminal", () => {
      expect(isTerminalStatus("DRAFT")).toBe(false);
    });

    it("APPROVED is not terminal", () => {
      expect(isTerminalStatus("APPROVED")).toBe(false);
    });
  });
});
