import { describe, it, expect } from "vitest";
import { RoleBasedPermissionEvaluator } from "../role-based-permission-evaluator";
import { ScopeType } from "@/modules/authorization/domain";
import type { AuthorizationContext } from "@/modules/authorization/domain";
import type { Permission } from "@/modules/authorization/domain";

function createContext(overrides: Partial<AuthorizationContext> = {}): AuthorizationContext {
  return {
    userId: "user-1",
    employeeId: "emp-1",
    levelId: 1,
    role: "SELLER",
    supervisorId: null,
    userEmail: "user@example.com",
    ...overrides,
  };
}

describe("RoleBasedPermissionEvaluator", () => {
  const evaluator = new RoleBasedPermissionEvaluator();

  // =========================================================================
  // ADMIN tests
  // =========================================================================

  describe("ADMIN role", () => {
    it("ADMIN has employee.read with GLOBAL scope", () => {
      const ctx = createContext({ role: "ADMIN", levelId: null });
      const result = evaluator.evaluate(ctx, "employee.read");
      expect(result.granted).toBe(true);
      expect(result.maxScope).toBe(ScopeType.GLOBAL);
    });

    it("ADMIN has employee.create with GLOBAL scope", () => {
      const ctx = createContext({ role: "ADMIN", levelId: null });
      const result = evaluator.evaluate(ctx, "employee.create");
      expect(result.granted).toBe(true);
      expect(result.maxScope).toBe(ScopeType.GLOBAL);
    });

    it("ADMIN has training.manage with GLOBAL scope", () => {
      const ctx = createContext({ role: "ADMIN", levelId: null });
      const result = evaluator.evaluate(ctx, "training.manage");
      expect(result.granted).toBe(true);
      expect(result.maxScope).toBe(ScopeType.GLOBAL);
    });

    it("ADMIN has audit.read with GLOBAL scope", () => {
      const ctx = createContext({ role: "ADMIN", levelId: null });
      const result = evaluator.evaluate(ctx, "audit.read");
      expect(result.granted).toBe(true);
      expect(result.maxScope).toBe(ScopeType.GLOBAL);
    });

    it("ADMIN has sale.readGlobal with GLOBAL scope", () => {
      const ctx = createContext({ role: "ADMIN", levelId: null });
      const result = evaluator.evaluate(ctx, "sale.readGlobal");
      expect(result.granted).toBe(true);
      expect(result.maxScope).toBe(ScopeType.GLOBAL);
    });

    it("ADMIN has level.update with GLOBAL scope", () => {
      const ctx = createContext({ role: "ADMIN", levelId: null });
      const result = evaluator.evaluate(ctx, "level.update");
      expect(result.granted).toBe(true);
      expect(result.maxScope).toBe(ScopeType.GLOBAL);
    });

    // Phase 5: ADMIN catalog and sale review permissions
    it("ADMIN has catalog.read with GLOBAL scope", () => {
      const ctx = createContext({ role: "ADMIN", levelId: null });
      const result = evaluator.evaluate(ctx, "catalog.read");
      expect(result.granted).toBe(true);
      expect(result.maxScope).toBe(ScopeType.GLOBAL);
    });

    it("ADMIN has catalog.create with GLOBAL scope", () => {
      const ctx = createContext({ role: "ADMIN", levelId: null });
      const result = evaluator.evaluate(ctx, "catalog.create");
      expect(result.granted).toBe(true);
      expect(result.maxScope).toBe(ScopeType.GLOBAL);
    });

    it("ADMIN has catalog.update with GLOBAL scope", () => {
      const ctx = createContext({ role: "ADMIN", levelId: null });
      const result = evaluator.evaluate(ctx, "catalog.update");
      expect(result.granted).toBe(true);
      expect(result.maxScope).toBe(ScopeType.GLOBAL);
    });

    it("ADMIN has sale.approve with GLOBAL scope", () => {
      const ctx = createContext({ role: "ADMIN", levelId: null });
      const result = evaluator.evaluate(ctx, "sale.approve");
      expect(result.granted).toBe(true);
      expect(result.maxScope).toBe(ScopeType.GLOBAL);
    });

    it("ADMIN has sale.reject with GLOBAL scope", () => {
      const ctx = createContext({ role: "ADMIN", levelId: null });
      const result = evaluator.evaluate(ctx, "sale.reject");
      expect(result.granted).toBe(true);
      expect(result.maxScope).toBe(ScopeType.GLOBAL);
    });
  });

  // =========================================================================
  // Level 1 — Vendedor
  // =========================================================================

  describe("Level 1 (Vendedor)", () => {
    const ctx = createContext({ levelId: 1 });

    it("has dashboard.view with OWN scope", () => {
      const result = evaluator.evaluate(ctx, "dashboard.view");
      expect(result.granted).toBe(true);
      expect(result.maxScope).toBe(ScopeType.OWN);
    });

    it("has dashboard.viewOwnMetrics with OWN scope", () => {
      const result = evaluator.evaluate(ctx, "dashboard.viewOwnMetrics");
      expect(result.granted).toBe(true);
      expect(result.maxScope).toBe(ScopeType.OWN);
    });

    it("does NOT have dashboard.viewTeamMetrics", () => {
      const result = evaluator.evaluate(ctx, "dashboard.viewTeamMetrics");
      expect(result.granted).toBe(false);
    });

    it("has sale.readOwn with OWN scope", () => {
      const result = evaluator.evaluate(ctx, "sale.readOwn");
      expect(result.granted).toBe(true);
      expect(result.maxScope).toBe(ScopeType.OWN);
    });

    it("has sale.create with OWN scope", () => {
      const result = evaluator.evaluate(ctx, "sale.create");
      expect(result.granted).toBe(true);
      expect(result.maxScope).toBe(ScopeType.OWN);
    });

    it("does NOT have sale.readTeam", () => {
      const result = evaluator.evaluate(ctx, "sale.readTeam");
      expect(result.granted).toBe(false);
    });

    it("does NOT have employee.read", () => {
      const result = evaluator.evaluate(ctx, "employee.read");
      expect(result.granted).toBe(false);
    });

    it("does NOT have employee.create", () => {
      const result = evaluator.evaluate(ctx, "employee.create");
      expect(result.granted).toBe(false);
    });

    it("has training.read with GLOBAL scope", () => {
      const result = evaluator.evaluate(ctx, "training.read");
      expect(result.granted).toBe(true);
      expect(result.maxScope).toBe(ScopeType.GLOBAL);
    });

    it("has training.download with GLOBAL scope", () => {
      const result = evaluator.evaluate(ctx, "training.download");
      expect(result.granted).toBe(true);
      expect(result.maxScope).toBe(ScopeType.GLOBAL);
    });

    it("does NOT have training.manage", () => {
      const result = evaluator.evaluate(ctx, "training.manage");
      expect(result.granted).toBe(false);
    });

    it("does NOT have audit.read", () => {
      const result = evaluator.evaluate(ctx, "audit.read");
      expect(result.granted).toBe(false);
    });

    it("has analytics.viewOwn with OWN scope", () => {
      const result = evaluator.evaluate(ctx, "analytics.viewOwn");
      expect(result.granted).toBe(true);
      expect(result.maxScope).toBe(ScopeType.OWN);
    });

    it("does NOT have analytics.viewTeam", () => {
      const result = evaluator.evaluate(ctx, "analytics.viewTeam");
      expect(result.granted).toBe(false);
    });

    it("has hierarchy.readOwn with OWN scope", () => {
      const result = evaluator.evaluate(ctx, "hierarchy.readOwn");
      expect(result.granted).toBe(true);
      expect(result.maxScope).toBe(ScopeType.OWN);
    });

    it("has commission.readOwn with OWN scope", () => {
      const result = evaluator.evaluate(ctx, "commission.readOwn");
      expect(result.granted).toBe(true);
      expect(result.maxScope).toBe(ScopeType.OWN);
    });

    it("does NOT have commission.readTeam", () => {
      const result = evaluator.evaluate(ctx, "commission.readTeam");
      expect(result.granted).toBe(false);
    });

    // Phase 5: catalog permissions
    it("has catalog.read with GLOBAL scope", () => {
      const result = evaluator.evaluate(ctx, "catalog.read");
      expect(result.granted).toBe(true);
      expect(result.maxScope).toBe(ScopeType.GLOBAL);
    });

    it("does NOT have catalog.create", () => {
      const result = evaluator.evaluate(ctx, "catalog.create");
      expect(result.granted).toBe(false);
    });

    it("does NOT have catalog.update", () => {
      const result = evaluator.evaluate(ctx, "catalog.update");
      expect(result.granted).toBe(false);
    });

    // Phase 5: sale.approve/reject
    it("does NOT have sale.approve", () => {
      const result = evaluator.evaluate(ctx, "sale.approve");
      expect(result.granted).toBe(false);
    });

    it("does NOT have sale.reject", () => {
      const result = evaluator.evaluate(ctx, "sale.reject");
      expect(result.granted).toBe(false);
    });
  });

  // =========================================================================
  // Level 2 — Vendedor Junior
  // =========================================================================

  describe("Level 2 (Vendedor Junior)", () => {
    const ctx = createContext({ levelId: 2 });

    it("has dashboard.view with OWN scope", () => {
      const result = evaluator.evaluate(ctx, "dashboard.view");
      expect(result.granted).toBe(true);
      expect(result.maxScope).toBe(ScopeType.OWN);
    });

    it("does NOT have employee.read", () => {
      const result = evaluator.evaluate(ctx, "employee.read");
      expect(result.granted).toBe(false);
    });

    it("has sale.readOwn with OWN scope", () => {
      const result = evaluator.evaluate(ctx, "sale.readOwn");
      expect(result.granted).toBe(true);
      expect(result.maxScope).toBe(ScopeType.OWN);
    });

    it("does NOT have sale.readTeam", () => {
      const result = evaluator.evaluate(ctx, "sale.readTeam");
      expect(result.granted).toBe(false);
    });

    // Phase 5: N2 cannot approve/reject
    it("has catalog.read with GLOBAL scope", () => {
      const result = evaluator.evaluate(ctx, "catalog.read");
      expect(result.granted).toBe(true);
      expect(result.maxScope).toBe(ScopeType.GLOBAL);
    });

    it("does NOT have sale.approve", () => {
      const result = evaluator.evaluate(ctx, "sale.approve");
      expect(result.granted).toBe(false);
    });

    it("does NOT have sale.reject", () => {
      const result = evaluator.evaluate(ctx, "sale.reject");
      expect(result.granted).toBe(false);
    });
  });

  // =========================================================================
  // Level 3 — Distribuidor
  // =========================================================================

  describe("Level 3 (Distribuidor)", () => {
    const ctx = createContext({ levelId: 3 });

    it("has employee.read with TEAM scope", () => {
      const result = evaluator.evaluate(ctx, "employee.read");
      expect(result.granted).toBe(true);
      expect(result.maxScope).toBe(ScopeType.TEAM);
    });

    it("has employee.create with TEAM scope", () => {
      const result = evaluator.evaluate(ctx, "employee.create");
      expect(result.granted).toBe(true);
      expect(result.maxScope).toBe(ScopeType.TEAM);
    });

    it("has employee.update with TEAM scope", () => {
      const result = evaluator.evaluate(ctx, "employee.update");
      expect(result.granted).toBe(true);
      expect(result.maxScope).toBe(ScopeType.TEAM);
    });

    it("has dashboard.viewTeamMetrics with TEAM scope", () => {
      const result = evaluator.evaluate(ctx, "dashboard.viewTeamMetrics");
      expect(result.granted).toBe(true);
      expect(result.maxScope).toBe(ScopeType.TEAM);
    });

    it("does NOT have dashboard.viewBranchMetrics", () => {
      const result = evaluator.evaluate(ctx, "dashboard.viewBranchMetrics");
      expect(result.granted).toBe(false);
    });

    it("has sale.readTeam with TEAM scope", () => {
      const result = evaluator.evaluate(ctx, "sale.readTeam");
      expect(result.granted).toBe(true);
      expect(result.maxScope).toBe(ScopeType.TEAM);
    });

    it("does NOT have sale.readBranch", () => {
      const result = evaluator.evaluate(ctx, "sale.readBranch");
      expect(result.granted).toBe(false);
    });

    it("has team.read with TEAM scope", () => {
      const result = evaluator.evaluate(ctx, "team.read");
      expect(result.granted).toBe(true);
      expect(result.maxScope).toBe(ScopeType.TEAM);
    });

    it("does NOT have team.create", () => {
      const result = evaluator.evaluate(ctx, "team.create");
      expect(result.granted).toBe(false);
    });

    it("has analytics.viewTeam with TEAM scope", () => {
      const result = evaluator.evaluate(ctx, "analytics.viewTeam");
      expect(result.granted).toBe(true);
      expect(result.maxScope).toBe(ScopeType.TEAM);
    });

    it("has hierarchy.readTeam with TEAM scope", () => {
      const result = evaluator.evaluate(ctx, "hierarchy.readTeam");
      expect(result.granted).toBe(true);
      expect(result.maxScope).toBe(ScopeType.TEAM);
    });

    it("has commission.readTeam with TEAM scope", () => {
      const result = evaluator.evaluate(ctx, "commission.readTeam");
      expect(result.granted).toBe(true);
      expect(result.maxScope).toBe(ScopeType.TEAM);
    });

    it("does NOT have level.update", () => {
      const result = evaluator.evaluate(ctx, "level.update");
      expect(result.granted).toBe(false);
    });

    // Phase 5: Level 3 can approve/reject
    it("has catalog.read with GLOBAL scope", () => {
      const result = evaluator.evaluate(ctx, "catalog.read");
      expect(result.granted).toBe(true);
      expect(result.maxScope).toBe(ScopeType.GLOBAL);
    });

    it("has sale.approve with TEAM scope", () => {
      const result = evaluator.evaluate(ctx, "sale.approve");
      expect(result.granted).toBe(true);
      expect(result.maxScope).toBe(ScopeType.TEAM);
    });

    it("has sale.reject with TEAM scope", () => {
      const result = evaluator.evaluate(ctx, "sale.reject");
      expect(result.granted).toBe(true);
      expect(result.maxScope).toBe(ScopeType.TEAM);
    });
  });

  // =========================================================================
  // Level 4 — Blue
  // =========================================================================

  describe("Level 4 (Blue)", () => {
    const ctx = createContext({ levelId: 4 });

    it("has employee.read with TEAM scope (minLevel: 3 rule)", () => {
      const result = evaluator.evaluate(ctx, "employee.read");
      expect(result.granted).toBe(true);
      expect(result.maxScope).toBe(ScopeType.TEAM);
    });

    it("has dashboard.viewBranchMetrics with BRANCH scope", () => {
      const result = evaluator.evaluate(ctx, "dashboard.viewBranchMetrics");
      expect(result.granted).toBe(true);
      expect(result.maxScope).toBe(ScopeType.BRANCH);
    });

    it("has sale.readBranch with BRANCH scope", () => {
      const result = evaluator.evaluate(ctx, "sale.readBranch");
      expect(result.granted).toBe(true);
      expect(result.maxScope).toBe(ScopeType.BRANCH);
    });

    it("does NOT have sale.readGlobal", () => {
      const result = evaluator.evaluate(ctx, "sale.readGlobal");
      expect(result.granted).toBe(false);
    });

    it("has employee.update with BRANCH scope", () => {
      const result = evaluator.evaluate(ctx, "employee.update");
      expect(result.granted).toBe(true);
      expect(result.maxScope).toBe(ScopeType.BRANCH);
    });

    it("has analytics.comparePeriods with BRANCH scope", () => {
      const result = evaluator.evaluate(ctx, "analytics.comparePeriods");
      expect(result.granted).toBe(true);
      expect(result.maxScope).toBe(ScopeType.BRANCH);
    });

    it("has report.generate with BRANCH scope", () => {
      const result = evaluator.evaluate(ctx, "report.generate");
      expect(result.granted).toBe(true);
      expect(result.maxScope).toBe(ScopeType.BRANCH);
    });

    // Phase 5: Level 4 can approve/reject
    it("has catalog.read with GLOBAL scope", () => {
      const result = evaluator.evaluate(ctx, "catalog.read");
      expect(result.granted).toBe(true);
      expect(result.maxScope).toBe(ScopeType.GLOBAL);
    });

    it("has sale.approve with TEAM scope", () => {
      const result = evaluator.evaluate(ctx, "sale.approve");
      expect(result.granted).toBe(true);
      expect(result.maxScope).toBe(ScopeType.TEAM);
    });

    it("has sale.reject with TEAM scope", () => {
      const result = evaluator.evaluate(ctx, "sale.reject");
      expect(result.granted).toBe(true);
      expect(result.maxScope).toBe(ScopeType.TEAM);
    });
  });

  // =========================================================================
  // Level 7 — Max
  // =========================================================================

  describe("Level 7 (Max)", () => {
    const ctx = createContext({ levelId: 7 });

    it("has dashboard.viewGlobalMetrics with GLOBAL scope", () => {
      const result = evaluator.evaluate(ctx, "dashboard.viewGlobalMetrics");
      expect(result.granted).toBe(true);
      expect(result.maxScope).toBe(ScopeType.GLOBAL);
    });

    it("has sale.readGlobal with GLOBAL scope", () => {
      const result = evaluator.evaluate(ctx, "sale.readGlobal");
      expect(result.granted).toBe(true);
      expect(result.maxScope).toBe(ScopeType.GLOBAL);
    });

    it("has employee.update with GLOBAL scope", () => {
      const result = evaluator.evaluate(ctx, "employee.update");
      expect(result.granted).toBe(true);
      expect(result.maxScope).toBe(ScopeType.GLOBAL);
    });

    it("has team.create with GLOBAL scope", () => {
      const result = evaluator.evaluate(ctx, "team.create");
      expect(result.granted).toBe(true);
      expect(result.maxScope).toBe(ScopeType.GLOBAL);
    });

    it("has level.update with GLOBAL scope", () => {
      const result = evaluator.evaluate(ctx, "level.update");
      expect(result.granted).toBe(true);
      expect(result.maxScope).toBe(ScopeType.GLOBAL);
    });

    it("has commission.manageRules with GLOBAL scope", () => {
      const result = evaluator.evaluate(ctx, "commission.manageRules");
      expect(result.granted).toBe(true);
      expect(result.maxScope).toBe(ScopeType.GLOBAL);
    });

    it("has hierarchy.update with GLOBAL scope", () => {
      const result = evaluator.evaluate(ctx, "hierarchy.update");
      expect(result.granted).toBe(true);
      expect(result.maxScope).toBe(ScopeType.GLOBAL);
    });
  });

  // =========================================================================
  // Security: escalation tests
  // =========================================================================

  describe("Security: escalation prevention", () => {
    it("Level 1 cannot escalate to employee.read", () => {
      const ctx = createContext({ levelId: 1 });
      const result = evaluator.evaluate(ctx, "employee.read");
      expect(result.granted).toBe(false);
    });

    it("Level 2 cannot escalate to employee.read", () => {
      const ctx = createContext({ levelId: 2 });
      const result = evaluator.evaluate(ctx, "employee.read");
      expect(result.granted).toBe(false);
    });

    it("Level 3 cannot escalate to sale.readGlobal", () => {
      const ctx = createContext({ levelId: 3 });
      const result = evaluator.evaluate(ctx, "sale.readGlobal");
      expect(result.granted).toBe(false);
    });

    it("Level 3 cannot escalate to level.update", () => {
      const ctx = createContext({ levelId: 3 });
      const result = evaluator.evaluate(ctx, "level.update");
      expect(result.granted).toBe(false);
    });

    it("Level 4 cannot escalate to sale.readGlobal", () => {
      const ctx = createContext({ levelId: 4 });
      const result = evaluator.evaluate(ctx, "sale.readGlobal");
      expect(result.granted).toBe(false);
    });

    it("Level 6 cannot escalate to level.update", () => {
      const ctx = createContext({ levelId: 6 });
      const result = evaluator.evaluate(ctx, "level.update");
      expect(result.granted).toBe(false);
    });

    it("SELLER cannot use ADMIN permissions", () => {
      const ctx = createContext({ role: "SELLER", levelId: 7 });
      const result = evaluator.evaluate(ctx, "audit.read");
      expect(result.granted).toBe(false);
    });
  });

  // =========================================================================
  // Unknown permission
  // =========================================================================

  describe("Unknown permission", () => {
    it("denies unknown permission", () => {
      const ctx = createContext({ role: "ADMIN", levelId: null });
      const result = evaluator.evaluate(ctx, "nonexistent.permission" as Permission);
      expect(result.granted).toBe(false);
    });
  });
});
