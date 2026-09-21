import { describe, it, expect } from "vitest";
import { ScopeType, isScopeBroaden } from "../scope";

describe("ScopeType", () => {
  it("should have all five scope types", () => {
    expect(Object.values(ScopeType)).toEqual([
      "OWN",
      "TEAM",
      "BRANCH",
      "GLOBAL",
      "SYSTEM",
    ]);
  });
});

describe("isScopeBroaden", () => {
  it("OWN is not broader than OWN", () => {
    expect(isScopeBroaden(ScopeType.OWN, ScopeType.OWN)).toBe(true);
  });

  it("TEAM is broader than OWN", () => {
    expect(isScopeBroaden(ScopeType.TEAM, ScopeType.OWN)).toBe(true);
  });

  it("OWN is not broader than TEAM", () => {
    expect(isScopeBroaden(ScopeType.OWN, ScopeType.TEAM)).toBe(false);
  });

  it("BRANCH is broader than TEAM", () => {
    expect(isScopeBroaden(ScopeType.BRANCH, ScopeType.TEAM)).toBe(true);
  });

  it("GLOBAL is broader than BRANCH", () => {
    expect(isScopeBroaden(ScopeType.GLOBAL, ScopeType.BRANCH)).toBe(true);
  });

  it("SYSTEM is broader than GLOBAL", () => {
    expect(isScopeBroaden(ScopeType.SYSTEM, ScopeType.GLOBAL)).toBe(true);
  });

  it("SYSTEM is broader than OWN", () => {
    expect(isScopeBroaden(ScopeType.SYSTEM, ScopeType.OWN)).toBe(true);
  });

  it("OWN is not broader than SYSTEM", () => {
    expect(isScopeBroaden(ScopeType.OWN, ScopeType.SYSTEM)).toBe(false);
  });
});
