import { describe, it, expect, vi, beforeEach } from "vitest";
import { ChangeSupervisorUseCase } from "../change-supervisor-use-case";
import type { OrganizationRepository } from "@/modules/organization/domain";
import type { AuditPort } from "@/shared/ports/audit-port";

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
let useCase: ChangeSupervisorUseCase;

beforeEach(() => {
  mockRepo = createMockRepo();
  vi.mocked(mockAuditPort.log).mockClear();
  useCase = new ChangeSupervisorUseCase(mockRepo, mockAuditPort);
});

function makeEmployee(overrides: Partial<Record<string, unknown>> = {}) {
  return {
    id: "emp-1",
    firstName: "Juan",
    lastName: "Pérez",
    joinedAt: new Date("2026-01-01"),
    currentLevelId: 1,
    supervisorId: "old-sup",
    status: "ACTIVE" as const,
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

describe("ChangeSupervisorUseCase", () => {
  it("should change supervisor successfully", async () => {
    vi.mocked(mockRepo.findEmployeeById)
      .mockResolvedValueOnce(makeEmployee())
      .mockResolvedValueOnce({
        ...makeEmployee({ id: "new-sup", firstName: "Carlos" }),
      });
    vi.mocked(mockRepo.getDescendantIds).mockResolvedValue(["emp-2", "emp-3"]);
    vi.mocked(mockRepo.findOpenSupervisorHistory).mockResolvedValue({
      id: "hist-1",
      employeeId: "emp-1",
      supervisorId: "old-sup",
      startedAt: new Date("2026-01-01"),
      endedAt: null,
      reason: null,
      createdAt: new Date(),
    });

    const result = await useCase.execute({
      employeeId: "emp-1",
      newSupervisorId: "new-sup",
      reason: "Reorganization",
      actorId: "admin-1",
      actorEmail: "admin@example.com",
    });

    expect(result.previousSupervisorId).toBe("old-sup");
    expect(result.newSupervisorId).toBe("new-sup");
    expect(mockRepo.closeSupervisorHistory).toHaveBeenCalledWith(
      "hist-1",
      expect.any(Date),
    );
    expect(mockRepo.updateEmployeeSupervisor).toHaveBeenCalledWith(
      "emp-1",
      "new-sup",
    );
  });

  it("should allow removing supervisor (setting to null)", async () => {
    vi.mocked(mockRepo.findEmployeeById).mockResolvedValueOnce(makeEmployee());
    vi.mocked(mockRepo.findOpenSupervisorHistory).mockResolvedValue({
      id: "hist-1",
      employeeId: "emp-1",
      supervisorId: "old-sup",
      startedAt: new Date("2026-01-01"),
      endedAt: null,
      reason: null,
      createdAt: new Date(),
    });

    const result = await useCase.execute({
      employeeId: "emp-1",
      newSupervisorId: null,
      actorId: "admin-1",
      actorEmail: "admin@example.com",
    });

    expect(result.newSupervisorId).toBeNull();
    expect(mockRepo.updateEmployeeSupervisor).toHaveBeenCalledWith(
      "emp-1",
      null,
    );
  });

  it("should reject self-supervision", async () => {
    vi.mocked(mockRepo.findEmployeeById).mockResolvedValueOnce(makeEmployee());

    await expect(
      useCase.execute({
        employeeId: "emp-1",
        newSupervisorId: "emp-1",
        actorId: "admin-1",
        actorEmail: "admin@example.com",
      }),
    ).rejects.toThrow("cannot be their own supervisor");
  });

  it("should reject cycle creation", async () => {
    vi.mocked(mockRepo.findEmployeeById)
      .mockResolvedValueOnce(makeEmployee())
      .mockResolvedValueOnce(makeEmployee({ id: "descendant" }));
    // descendant is in the employee's descendant list — assigning it as supervisor creates a cycle
    vi.mocked(mockRepo.getDescendantIds).mockResolvedValue([
      "descendant",
      "other",
    ]);

    await expect(
      useCase.execute({
        employeeId: "emp-1",
        newSupervisorId: "descendant",
        actorId: "admin-1",
        actorEmail: "admin@example.com",
      }),
    ).rejects.toThrow("cycle");
  });

  it("should throw NotFoundError for non-existent employee", async () => {
    vi.mocked(mockRepo.findEmployeeById).mockResolvedValueOnce(null);

    await expect(
      useCase.execute({
        employeeId: "nonexistent",
        newSupervisorId: "sup-1",
        actorId: "admin-1",
        actorEmail: "admin@example.com",
      }),
    ).rejects.toThrow("Employee");
  });

  it("should throw NotFoundError for non-existent supervisor", async () => {
    vi.mocked(mockRepo.findEmployeeById)
      .mockResolvedValueOnce(makeEmployee())
      .mockResolvedValueOnce(null);
    vi.mocked(mockRepo.getDescendantIds).mockResolvedValue([]);

    await expect(
      useCase.execute({
        employeeId: "emp-1",
        newSupervisorId: "nonexistent",
        actorId: "admin-1",
        actorEmail: "admin@example.com",
      }),
    ).rejects.toThrow("Supervisor");
  });

  it("should skip update if supervisor is the same", async () => {
    vi.mocked(mockRepo.findEmployeeById).mockResolvedValueOnce(
      makeEmployee({ supervisorId: "same-sup" }),
    );
    vi.mocked(mockRepo.getDescendantIds).mockResolvedValue([]);

    const result = await useCase.execute({
      employeeId: "emp-1",
      newSupervisorId: "same-sup",
      actorId: "admin-1",
      actorEmail: "admin@example.com",
    });

    expect(result.previousSupervisorId).toBe("same-sup");
    expect(result.newSupervisorId).toBe("same-sup");
    expect(mockRepo.closeSupervisorHistory).not.toHaveBeenCalled();
    expect(mockRepo.updateEmployeeSupervisor).not.toHaveBeenCalled();
  });
});
