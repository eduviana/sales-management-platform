import { describe, it, expect, vi, beforeEach } from "vitest";
import { ChangeLevelUseCase } from "../change-level-use-case";
import type { OrganizationRepository, EmployeeRecord } from "@/modules/organization/domain";
import type { AuditPort } from "@/shared/ports/audit-port";

function makeEmployee(overrides?: Partial<EmployeeRecord>): EmployeeRecord {
  return {
    id: "emp-1",
    firstName: "Juan",
    lastName: "Pérez",
    joinedAt: new Date("2026-01-01"),
    currentLevelId: 1,
    supervisorId: null,
    status: "ACTIVE",
    createdAt: new Date(),
    updatedAt: new Date(),
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
    executeInTransaction: vi.fn(async (fn) => fn(mockRepo)),
  };
}

const mockAuditPort: AuditPort = {
  log: vi.fn().mockResolvedValue(undefined),
};

let mockRepo: OrganizationRepository;
let useCase: ChangeLevelUseCase;

beforeEach(() => {
  mockRepo = createMockRepo();
  vi.mocked(mockAuditPort.log).mockClear();
  useCase = new ChangeLevelUseCase(mockRepo, mockAuditPort);
});

describe("ChangeLevelUseCase", () => {
  it("should promote an employee from N1 to N2", async () => {
    vi.mocked(mockRepo.findEmployeeById).mockResolvedValue(makeEmployee({ supervisorId: "sup-1" }));
    vi.mocked(mockRepo.findOpenLevelHistory).mockResolvedValue({
      id: "hist-1",
      employeeId: "emp-1",
      levelId: 1,
      startedAt: new Date("2026-01-01"),
      endedAt: null,
      reason: null,
      createdAt: new Date(),
    });

    const result = await useCase.execute({
      employeeId: "emp-1",
      targetLevelId: 2,
      reason: "Good performance",
      actorId: "admin-1",
      actorEmail: "admin@example.com",
    });

    expect(result.changeType).toBe("promotion");
    expect(result.previousLevelId).toBe(1);
    expect(result.newLevelId).toBe(2);
    expect(mockRepo.closeLevelHistory).toHaveBeenCalledWith(
      "hist-1",
      expect.any(Date),
    );
    expect(mockRepo.createLevelHistory).toHaveBeenCalledWith(
      expect.objectContaining({
        employeeId: "emp-1",
        levelId: 2,
        reason: "Good performance",
      }),
    );
    expect(mockRepo.updateEmployeeLevel).toHaveBeenCalledWith("emp-1", 2);
  });

  it("should demote an employee from N3 to N1", async () => {
    vi.mocked(mockRepo.findEmployeeById).mockResolvedValue(makeEmployee({ currentLevelId: 3, supervisorId: "sup-1" }));
    vi.mocked(mockRepo.findOpenLevelHistory).mockResolvedValue({
      id: "hist-1",
      employeeId: "emp-1",
      levelId: 3,
      startedAt: new Date("2026-01-01"),
      endedAt: null,
      reason: null,
      createdAt: new Date(),
    });

    const result = await useCase.execute({
      employeeId: "emp-1",
      targetLevelId: 1,
      reason: "Performance issue",
      actorId: "admin-1",
      actorEmail: "admin@example.com",
    });

    expect(result.changeType).toBe("demotion");
    expect(result.previousLevelId).toBe(3);
    expect(result.newLevelId).toBe(1);
  });

  it("should handle initial level assignment for employee without current level", async () => {
    vi.mocked(mockRepo.findEmployeeById).mockResolvedValue(makeEmployee({ currentLevelId: null }));

    const result = await useCase.execute({
      employeeId: "emp-1",
      targetLevelId: 1,
      actorId: "admin-1",
      actorEmail: "admin@example.com",
    });

    expect(result.changeType).toBe("initial");
    expect(result.previousLevelId).toBe(0);
    expect(result.newLevelId).toBe(1);
    expect(mockRepo.closeLevelHistory).not.toHaveBeenCalled();
  });

  it("should throw NotFoundError for non-existent employee", async () => {
    vi.mocked(mockRepo.findEmployeeById).mockResolvedValue(null);

    await expect(
      useCase.execute({ employeeId: "nonexistent", targetLevelId: 2, actorId: "admin-1", actorEmail: "admin@example.com" }),
    ).rejects.toThrow("Employee");
  });

  it("should throw ValidationError for invalid target level", async () => {
    vi.mocked(mockRepo.findEmployeeById).mockResolvedValue(makeEmployee());

    await expect(
      useCase.execute({ employeeId: "emp-1", targetLevelId: 8, actorId: "admin-1", actorEmail: "admin@example.com" }),
    ).rejects.toThrow("Invalid target level");
  });

  it("should throw DomainRuleError for multi-level jump", async () => {
    vi.mocked(mockRepo.findEmployeeById).mockResolvedValue(makeEmployee());

    await expect(
      useCase.execute({ employeeId: "emp-1", targetLevelId: 3, actorId: "admin-1", actorEmail: "admin@example.com" }),
    ).rejects.toThrow("Invalid level change");
  });

  it("should detect lateral change (same level)", async () => {
    vi.mocked(mockRepo.findEmployeeById).mockResolvedValue(makeEmployee({ currentLevelId: 3 }));
    vi.mocked(mockRepo.findOpenLevelHistory).mockResolvedValue({
      id: "hist-1",
      employeeId: "emp-1",
      levelId: 3,
      startedAt: new Date("2026-01-01"),
      endedAt: null,
      reason: null,
      createdAt: new Date(),
    });

    const result = await useCase.execute({
      employeeId: "emp-1",
      targetLevelId: 3,
      reason: "Administrative correction",
      actorId: "admin-1",
      actorEmail: "admin@example.com",
    });

    expect(result.changeType).toBe("lateral");
  });
});
