import { describe, it, expect } from "vitest";
import {
  RECRUITMENT_LADDER,
  canRecruit,
  getRecruitedLevel,
  isValidRecruitment,
} from "../../domain/recruitment-rules";

describe("Recruitment rules", () => {
  describe("RECRUITMENT_LADDER", () => {
    it("should define the correct recruitment mapping", () => {
      expect(RECRUITMENT_LADDER).toEqual({
        7: 6,
        6: 5,
        5: 4,
        4: 3,
        3: 1,
      });
    });
  });

  describe("canRecruit", () => {
    it.each([3, 4, 5, 6, 7])(
      "should allow recruitment for level N%s",
      (n) => {
        expect(canRecruit(n)).toBe(true);
      },
    );

    it.each([1, 2])(
      "should not allow recruitment for level N%s",
      (n) => {
        expect(canRecruit(n)).toBe(false);
      },
    );
  });

  describe("getRecruitedLevel", () => {
    it("should return N1 when recruiter is N3", () => {
      expect(getRecruitedLevel(3)).toBe(1);
    });

    it("should return N3 when recruiter is N4", () => {
      expect(getRecruitedLevel(4)).toBe(3);
    });

    it("should return N4 when recruiter is N5", () => {
      expect(getRecruitedLevel(5)).toBe(4);
    });

    it("should return N5 when recruiter is N6", () => {
      expect(getRecruitedLevel(6)).toBe(5);
    });

    it("should return N6 when recruiter is N7", () => {
      expect(getRecruitedLevel(7)).toBe(6);
    });

    it.each([1, 2])(
      "should return null for level N%s (no recruitment)",
      (n) => {
        expect(getRecruitedLevel(n)).toBeNull();
      },
    );
  });

  describe("isValidRecruitment", () => {
    it("should accept N3 recruiting N1", () => {
      expect(isValidRecruitment(3, 1)).toBe(true);
    });

    it("should accept N4 recruiting N3", () => {
      expect(isValidRecruitment(4, 3)).toBe(true);
    });

    it("should accept N7 recruiting N6", () => {
      expect(isValidRecruitment(7, 6)).toBe(true);
    });

    it("should reject N3 recruiting N2", () => {
      expect(isValidRecruitment(3, 2)).toBe(false);
    });

    it("should reject N1 recruiting anyone", () => {
      expect(isValidRecruitment(1, 1)).toBe(false);
    });

    it("should reject N2 recruiting anyone", () => {
      expect(isValidRecruitment(2, 1)).toBe(false);
    });

    it("should reject N4 recruiting N1", () => {
      expect(isValidRecruitment(4, 1)).toBe(false);
    });

    it("should reject invalid levels", () => {
      expect(isValidRecruitment(0, 1)).toBe(false);
      expect(isValidRecruitment(3, 8)).toBe(false);
    });
  });
});
