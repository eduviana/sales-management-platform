import { describe, it, expect, vi, beforeEach } from "vitest";
import { HierarchyScopeResolver } from "../hierarchy-scope-resolver";
import { ScopeType } from "@/modules/authorization/domain";
import type { AuthorizationContext } from "@/modules/authorization/domain";
import type { OrganizationRepository, EmployeeRecord } from "@/modules/organization/domain";

function makeEmployee(id: string, overrides?: Partial<EmployeeRecord>): EmployeeRecord {
  return {
    id,
    firstName: `First${id}`,
    lastName: `Last${id}`,
    joinedAt: new Date("2025-01-01"),
    currentLevelId: 1,
    supervisorId: null,
    status: "ACTIVE",
    createdAt: new Date("2025-01-01"),
    updatedAt: new Date("2025-01-01"),
    employeeCode: 1,
    dni: null,
    email: null,
    phone: null,
    dateOfBirth: null,
    deactivatedAt: null,
    deactivationReason: null,
    street: null,
    streetNumber: null,
    floor: null,
    apartment: null,
    city: null,
    province: null,
    postalCode: null,
    ...overrides,
  };
}

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

function createMockRepo(): OrganizationRepository {
  return {
    findEmployeeById: vi.fn(),
    createEmployee: vi.fn(),
    updateEmployeeLevel: vi.fn(),
    updateEmployeeSupervisor: vi.fn(),
    updateEmployeeStatus: vi.fn(),
    findLevelById: vi.fn(),
    findOpenLevelHistory: vi.fn(),
    closeLevelHistory: vi.fn(),
    createLevelHistory: vi.fn(),
    findOpenSupervisorHistory: vi.fn(),
    closeSupervisorHistory: vi.fn(),
    createSupervisorHistory: vi.fn(),
    getDirectSubordinates: vi.fn(),
    getDescendantIds: vi.fn(),
    getAncestorIds: vi.fn(),
    countDirectSubordinates: vi.fn(),
    getActiveEmployeeIds: vi.fn(),
    getAllEmployees: vi.fn().mockResolvedValue([]),
    executeInTransaction: vi.fn(),
  };
}

describe("HierarchyScopeResolver", () => {
  let mockRepo: OrganizationRepository;
  let resolver: HierarchyScopeResolver;

  beforeEach(() => {
    mockRepo = createMockRepo();
    resolver = new HierarchyScopeResolver(mockRepo);
  });

  // =========================================================================
  // OWN scope
  // =========================================================================

  describe("OWN scope", () => {
    it("returns the employee themselves", async () => {
      const ctx = createContext({ employeeId: "emp-abc" });
      const result = await resolver.resolveScope(ctx, ScopeType.OWN);
      expect(result).toEqual(["emp-abc"]);
    });
  });

  // =========================================================================
  // TEAM scope
  // =========================================================================

  describe("TEAM scope", () => {
    it("returns direct subordinates (active only)", async () => {
      const ctx = createContext({ employeeId: "supervisor-1" });
      vi.mocked(mockRepo.getDirectSubordinates).mockResolvedValue([
        makeEmployee("sub-1", { supervisorId: "supervisor-1" }),
        makeEmployee("sub-2", { supervisorId: "supervisor-1", status: "INACTIVE" }),
        makeEmployee("sub-3", { supervisorId: "supervisor-1", currentLevelId: 2 }),
      ]);

      const result = await resolver.resolveScope(ctx, ScopeType.TEAM);
      expect(result).toEqual(["sub-1", "sub-3"]);
      expect(mockRepo.getDirectSubordinates).toHaveBeenCalledWith("supervisor-1");
    });

    it("returns empty array when no direct subordinates", async () => {
      const ctx = createContext({ employeeId: "emp-solo" });
      vi.mocked(mockRepo.getDirectSubordinates).mockResolvedValue([]);

      const result = await resolver.resolveScope(ctx, ScopeType.TEAM);
      expect(result).toEqual([]);
    });
  });

  // =========================================================================
  // BRANCH scope
  // =========================================================================

  describe("BRANCH scope", () => {
    it("returns actor + all descendants", async () => {
      const ctx = createContext({ employeeId: "boss-1" });
      vi.mocked(mockRepo.getDescendantIds).mockResolvedValue([
        "sub-1", "sub-2", "sub-1-child",
      ]);

      const result = await resolver.resolveScope(ctx, ScopeType.BRANCH);
      expect(result).toEqual(["boss-1", "sub-1", "sub-2", "sub-1-child"]);
      expect(mockRepo.getDescendantIds).toHaveBeenCalledWith("boss-1");
    });

    it("returns only actor when no descendants", async () => {
      const ctx = createContext({ employeeId: "emp-leaf" });
      vi.mocked(mockRepo.getDescendantIds).mockResolvedValue([]);

      const result = await resolver.resolveScope(ctx, ScopeType.BRANCH);
      expect(result).toEqual(["emp-leaf"]);
    });
  });

  // =========================================================================
  // GLOBAL scope
  // =========================================================================

  describe("GLOBAL scope", () => {
    it("returns all active employee IDs", async () => {
      const ctx = createContext();
      vi.mocked(mockRepo.getActiveEmployeeIds).mockResolvedValue([
        "emp-1", "emp-2", "emp-3",
      ]);

      const result = await resolver.resolveScope(ctx, ScopeType.GLOBAL);
      expect(result).toEqual(["emp-1", "emp-2", "emp-3"]);
      expect(mockRepo.getActiveEmployeeIds).toHaveBeenCalled();
    });
  });

  // =========================================================================
  // SYSTEM scope
  // =========================================================================

  describe("SYSTEM scope", () => {
    it("returns empty array", async () => {
      const ctx = createContext();
      const result = await resolver.resolveScope(ctx, ScopeType.SYSTEM);
      expect(result).toEqual([]);
    });
  });

  // =========================================================================
  // Security: IDOR prevention
  // =========================================================================

  describe("Security: IDOR prevention", () => {
    it("TEAM scope only returns direct subordinates, not all descendants", async () => {
      const ctx = createContext({ employeeId: "boss" });
      vi.mocked(mockRepo.getDirectSubordinates).mockResolvedValue([
        makeEmployee("direct-sub", { supervisorId: "boss" }),
      ]);

      const result = await resolver.resolveScope(ctx, ScopeType.TEAM);
      expect(result).toEqual(["direct-sub"]);
      // Should NOT include indirect descendants
      expect(result).not.toContain("indirect-sub");
    });

    it("BRANCH scope includes the actor (prevents self-exclusion)", async () => {
      const ctx = createContext({ employeeId: "boss" });
      vi.mocked(mockRepo.getDescendantIds).mockResolvedValue(["sub-1"]);

      const result = await resolver.resolveScope(ctx, ScopeType.BRANCH);
      expect(result).toContain("boss");
    });
  });
});
