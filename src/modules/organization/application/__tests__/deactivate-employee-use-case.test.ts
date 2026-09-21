import { describe, it, expect, vi, beforeEach } from "vitest";
import { DeactivateEmployeeUseCase } from "../deactivate-employee-use-case";
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
let useCase: DeactivateEmployeeUseCase;

beforeEach(() => {
  mockRepo = createMockRepo();
  vi.mocked(mockAuditPort.log).mockClear();
  useCase = new DeactivateEmployeeUseCase(mockRepo, mockAuditPort);
});

describe("DeactivateEmployeeUseCase", () => {
  it("should deactivate an active employee", async () => {
    vi.mocked(mockRepo.findEmployeeById).mockResolvedValue(makeEmployee());

    const result = await useCase.execute({
      employeeId: "emp-1",
      reason: "Left the company",
      actorId: "admin-1",
      actorEmail: "admin@example.com",
    });

    expect(result.status).toBe("INACTIVE");
    expect(mockRepo.updateEmployeeStatus).toHaveBeenCalledWith(
      "emp-1",
      "INACTIVE",
    );
  });

  it("should throw if employee is already inactive", async () => {
    vi.mocked(mockRepo.findEmployeeById).mockResolvedValue(makeEmployee({ status: "INACTIVE" }));

    await expect(
      useCase.execute({ employeeId: "emp-1", actorId: "admin-1", actorEmail: "admin@example.com" }),
    ).rejects.toThrow("already inactive");
  });

  it("should throw NotFoundError for non-existent employee", async () => {
    vi.mocked(mockRepo.findEmployeeById).mockResolvedValue(null);

    await expect(
      useCase.execute({ employeeId: "nonexistent", actorId: "admin-1", actorEmail: "admin@example.com" }),
    ).rejects.toThrow("Employee");
  });
});
