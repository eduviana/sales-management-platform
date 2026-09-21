import { describe, it, expect, vi } from "vitest";
import { AuthorizationServiceImpl } from "../authorization-service";
import { ScopeType } from "@/modules/authorization/domain";
import type {
  AuthorizationContext,
  PermissionEvaluator,
  ScopeResolver,
  ResourceAuthorizationPolicy,
} from "@/modules/authorization/domain";

function createContext(overrides: Partial<AuthorizationContext> = {}): AuthorizationContext {
  return {
    userId: "user-1",
    employeeId: "emp-1",
    levelId: 3,
    role: "SELLER",
    supervisorId: null,
    userEmail: "user@example.com",
    ...overrides,
  };
}

function createMockPermissionEvaluator(
  granted: boolean,
  maxScope?: ScopeType,
): PermissionEvaluator {
  return {
    evaluate: vi.fn().mockReturnValue({ granted, maxScope }),
  };
}

function createMockScopeResolver(employeeIds: string[]): ScopeResolver {
  return {
    resolveScope: vi.fn().mockResolvedValue(employeeIds),
  };
}

function createMockResourcePolicy(allowed: boolean): ResourceAuthorizationPolicy {
  return {
    checkResourceAccess: vi.fn().mockReturnValue(allowed),
  };
}

describe("AuthorizationServiceImpl", () => {
  // =========================================================================
  // Permission denied
  // =========================================================================

  describe("Permission denied", () => {
    it("denies when permission is not granted", async () => {
      const permEval = createMockPermissionEvaluator(false);
      const scopeResolver = createMockScopeResolver([]);
      const service = new AuthorizationServiceImpl(permEval, scopeResolver);

      const ctx = createContext();
      const decision = await service.authorize(ctx, {
        permission: "employee.read",
      });

      expect(decision.allowed).toBe(false);
      expect(decision.permission).toBe("employee.read");
      expect(decision.reason).toContain("does not have permission");
    });

    it("does not call ScopeResolver when permission denied", async () => {
      const permEval = createMockPermissionEvaluator(false);
      const scopeResolver = createMockScopeResolver([]);
      const service = new AuthorizationServiceImpl(permEval, scopeResolver);

      const ctx = createContext();
      await service.authorize(ctx, { permission: "employee.read" });

      expect(scopeResolver.resolveScope).not.toHaveBeenCalled();
    });
  });

  // =========================================================================
  // Permission granted, no resource
  // =========================================================================

  describe("Permission granted, no resource", () => {
    it("allows when permission granted and no resource to check", async () => {
      const permEval = createMockPermissionEvaluator(true, ScopeType.TEAM);
      const scopeResolver = createMockScopeResolver([]);
      const service = new AuthorizationServiceImpl(permEval, scopeResolver);

      const ctx = createContext();
      const decision = await service.authorize(ctx, {
        permission: "employee.read",
      });

      expect(decision.allowed).toBe(true);
      expect(decision.scope).toBe(ScopeType.TEAM);
    });
  });

  // =========================================================================
  // Resource within scope
  // =========================================================================

  describe("Resource within scope", () => {
    it("allows when resource owner is within scope", async () => {
      const permEval = createMockPermissionEvaluator(true, ScopeType.TEAM);
      const scopeResolver = createMockScopeResolver(["sub-1", "sub-2"]);
      const service = new AuthorizationServiceImpl(permEval, scopeResolver);

      const ctx = createContext({ employeeId: "supervisor" });
      const decision = await service.authorize(ctx, {
        permission: "employee.read",
        resource: {
          type: "employee",
          id: "emp-sub-1",
          ownerId: "sub-1",
        },
      });

      expect(decision.allowed).toBe(true);
      expect(decision.scope).toBe(ScopeType.TEAM);
    });
  });

  // =========================================================================
  // Resource outside scope (IDOR prevention)
  // =========================================================================

  describe("Resource outside scope (IDOR prevention)", () => {
    it("denies when resource owner is outside scope", async () => {
      const permEval = createMockPermissionEvaluator(true, ScopeType.TEAM);
      const scopeResolver = createMockScopeResolver(["sub-1", "sub-2"]);
      const service = new AuthorizationServiceImpl(permEval, scopeResolver);

      const ctx = createContext({ employeeId: "supervisor" });
      const decision = await service.authorize(ctx, {
        permission: "employee.read",
        resource: {
          type: "employee",
          id: "emp-outside",
          ownerId: "outsider-1",
        },
      });

      expect(decision.allowed).toBe(false);
      expect(decision.reason).toContain("outside the authorized scope");
    });

    it("denies when manipulating resourceId does not expand scope", async () => {
      const permEval = createMockPermissionEvaluator(true, ScopeType.OWN);
      const scopeResolver = createMockScopeResolver(["emp-1"]);
      const service = new AuthorizationServiceImpl(permEval, scopeResolver);

      const ctx = createContext({ employeeId: "emp-1" });
      const decision = await service.authorize(ctx, {
        permission: "sale.update",
        resource: {
          type: "sale",
          id: "sale-of-another-user",
          ownerId: "emp-999",
        },
      });

      expect(decision.allowed).toBe(false);
    });
  });

  // =========================================================================
  // Horizontal escalation prevention
  // =========================================================================

  describe("Horizontal escalation prevention", () => {
    it("prevents Level 3 from accessing Level 4 employee", async () => {
      // Level 3 has TEAM scope for employee.read
      const permEval = createMockPermissionEvaluator(true, ScopeType.TEAM);
      // TEAM scope only includes direct subordinates
      const scopeResolver = createMockScopeResolver(["sub-1", "sub-2"]);
      const service = new AuthorizationServiceImpl(permEval, scopeResolver);

      const ctx = createContext({ levelId: 3, employeeId: "level3-user" });
      const decision = await service.authorize(ctx, {
        permission: "employee.read",
        resource: {
          type: "employee",
          id: "level4-employee",
          ownerId: "level4-user",
        },
      });

      expect(decision.allowed).toBe(false);
    });
  });

  // =========================================================================
  // Vertical escalation prevention
  // =========================================================================

  describe("Vertical escalation prevention", () => {
    it("prevents Level 1 from using Level 3 permission", async () => {
      const permEval = createMockPermissionEvaluator(false);
      const scopeResolver = createMockScopeResolver([]);
      const service = new AuthorizationServiceImpl(permEval, scopeResolver);

      const ctx = createContext({ levelId: 1 });
      const decision = await service.authorize(ctx, {
        permission: "employee.read",
      });

      expect(decision.allowed).toBe(false);
    });

    it("prevents SELLER from using ADMIN permissions", async () => {
      const permEval = createMockPermissionEvaluator(false);
      const scopeResolver = createMockScopeResolver([]);
      const service = new AuthorizationServiceImpl(permEval, scopeResolver);

      const ctx = createContext({ role: "SELLER", levelId: 7 });
      const decision = await service.authorize(ctx, {
        permission: "audit.read",
      });

      expect(decision.allowed).toBe(false);
    });
  });

  // =========================================================================
  // Resource policy integration
  // =========================================================================

  describe("Resource policy integration", () => {
    it("applies resource policy when registered", async () => {
      const permEval = createMockPermissionEvaluator(true, ScopeType.TEAM);
      const scopeResolver = createMockScopeResolver(["sub-1"]);
      const resourcePolicy = createMockResourcePolicy(false);
      const service = new AuthorizationServiceImpl(
        permEval,
        scopeResolver,
        resourcePolicy,
      );

      const ctx = createContext();
      const decision = await service.authorize(ctx, {
        permission: "sale.update",
        resource: {
          type: "sale",
          id: "sale-1",
          ownerId: "sub-1",
        },
      });

      // Scope check passes (sub-1 is in TEAM), but resource policy denies
      expect(decision.allowed).toBe(false);
      expect(decision.reason).toContain("Resource policy denied");
    });

    it("allows when both scope and resource policy pass", async () => {
      const permEval = createMockPermissionEvaluator(true, ScopeType.TEAM);
      const scopeResolver = createMockScopeResolver(["sub-1"]);
      const resourcePolicy = createMockResourcePolicy(true);
      const service = new AuthorizationServiceImpl(
        permEval,
        scopeResolver,
        resourcePolicy,
      );

      const ctx = createContext();
      const decision = await service.authorize(ctx, {
        permission: "sale.update",
        resource: {
          type: "sale",
          id: "sale-1",
          ownerId: "sub-1",
        },
      });

      expect(decision.allowed).toBe(true);
    });
  });

  // =========================================================================
  // Scope fallback
  // =========================================================================

  describe("Scope fallback", () => {
    it("defaults to OWN scope when maxScope is undefined", async () => {
      const permEval = createMockPermissionEvaluator(true, undefined);
      const scopeResolver = createMockScopeResolver(["emp-1"]);
      const service = new AuthorizationServiceImpl(permEval, scopeResolver);

      const ctx = createContext({ employeeId: "emp-1" });
      const decision = await service.authorize(ctx, {
        permission: "sale.create",
        resource: {
          type: "sale",
          id: "sale-1",
          ownerId: "emp-1",
        },
      });

      expect(decision.allowed).toBe(true);
      expect(scopeResolver.resolveScope).toHaveBeenCalledWith(
        ctx,
        ScopeType.OWN,
      );
    });
  });
});
