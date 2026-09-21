import { describe, it, expect } from "vitest";
import { allow, deny } from "../authorization-decision";
import { ScopeType } from "../scope";

describe("allow", () => {
  it("should create an allowed decision without scope", () => {
    const decision = allow("employee.read");
    expect(decision.allowed).toBe(true);
    expect(decision.permission).toBe("employee.read");
    expect(decision.scope).toBeUndefined();
    expect(decision.reason).toContain("granted");
  });

  it("should create an allowed decision with scope", () => {
    const decision = allow("employee.read", ScopeType.TEAM);
    expect(decision.allowed).toBe(true);
    expect(decision.permission).toBe("employee.read");
    expect(decision.scope).toBe(ScopeType.TEAM);
    expect(decision.reason).toContain("TEAM");
  });
});

describe("deny", () => {
  it("should create a denied decision", () => {
    const decision = deny("employee.read", "No permission");
    expect(decision.allowed).toBe(false);
    expect(decision.permission).toBe("employee.read");
    expect(decision.reason).toContain("Denied");
    expect(decision.reason).toContain("No permission");
  });

  it("should create a denied decision with scope", () => {
    const decision = deny(
      "employee.read",
      "Resource outside scope",
      ScopeType.OWN,
    );
    expect(decision.allowed).toBe(false);
    expect(decision.scope).toBe(ScopeType.OWN);
  });
});
