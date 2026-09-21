import { describe, it, expect, vi, beforeEach } from "vitest";
import { RecruitEmployeeUseCase } from "../recruit-employee-use-case";
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
let useCase: RecruitEmployeeUseCase;

beforeEach(() => {
  mockRepo = createMockRepo();
  vi.mocked(mockAuditPort.log).mockClear();
  useCase = new RecruitEmployeeUseCase(mockRepo, mockAuditPort);
});

describe("RecruitEmployeeUseCase", () => {
  it("should recruit N1 when recruiter is N3", async () => {
    vi.mocked(mockRepo.findEmployeeById).mockResolvedValue(
      makeEmployee({ id: "sup-1", firstName: "Carlos", lastName: "García", joinedAt: new Date("2025-01-01"), currentLevelId: 3 }),
    );
    vi.mocked(mockRepo.createEmployee).mockResolvedValue(
      makeEmployee({ id: "emp-new", firstName: "Ana", lastName: "López", joinedAt: new Date("2026-09-07"), currentLevelId: 1, supervisorId: "sup-1" }),
    );

    const result = await useCase.execute({
      recruiterId: "sup-1",
      firstName: "Ana",
      lastName: "López",
      joinedAt: new Date("2026-09-07"),
      actorEmail: "supervisor@example.com",
      dni: "30123456",
      email: "test@example.com",
      phone: "11-5555-0000",
      dateOfBirth: new Date("1990-01-01"),
      street: "Calle Test",
      streetNumber: "123",
      floor: null,
      apartment: null,
      city: "Buenos Aires",
      province: "CABA",
      postalCode: "C1000",
    });

    expect(result.assignedLevel).toBe(1);
    expect(result.supervisorId).toBe("sup-1");
    expect(result.employee.id).toBe("emp-new");
    expect(mockRepo.createLevelHistory).toHaveBeenCalledWith(
      expect.objectContaining({ levelId: 1 }),
    );
    expect(mockRepo.createSupervisorHistory).toHaveBeenCalledWith(
      expect.objectContaining({ supervisorId: "sup-1" }),
    );
  });

  it("should recruit N6 when recruiter is N7", async () => {
    vi.mocked(mockRepo.findEmployeeById).mockResolvedValue(
      makeEmployee({ id: "sup-7", firstName: "Top", lastName: "Boss", joinedAt: new Date("2024-01-01"), currentLevelId: 7 }),
    );
    vi.mocked(mockRepo.createEmployee).mockResolvedValue(
      makeEmployee({ id: "emp-new", firstName: "New", lastName: "Person", joinedAt: new Date("2026-09-07"), currentLevelId: 6, supervisorId: "sup-7" }),
    );

    const result = await useCase.execute({
      recruiterId: "sup-7",
      firstName: "New",
      lastName: "Person",
      joinedAt: new Date("2026-09-07"),
      actorEmail: "supervisor7@example.com",
      dni: "30123456",
      email: "test@example.com",
      phone: "11-5555-0000",
      dateOfBirth: new Date("1990-01-01"),
      street: "Calle Test",
      streetNumber: "123",
      floor: null,
      apartment: null,
      city: "Buenos Aires",
      province: "CABA",
      postalCode: "C1000",
    });

    expect(result.assignedLevel).toBe(6);
  });

  it("should reject recruitment by N1", async () => {
    vi.mocked(mockRepo.findEmployeeById).mockResolvedValue(
      makeEmployee({ id: "emp-1", firstName: "Low", lastName: "Level" }),
    );

    await expect(
      useCase.execute({
        recruiterId: "emp-1",
        firstName: "Test",
        lastName: "User",
        joinedAt: new Date(),
        actorEmail: "n1@example.com",
        dni: "30123456",
        email: "test@example.com",
        phone: "11-5555-0000",
        dateOfBirth: new Date("1990-01-01"),
        street: "Calle Test",
        streetNumber: "123",
        floor: null,
        apartment: null,
        city: "Buenos Aires",
        province: "CABA",
        postalCode: "C1000",
      }),
    ).rejects.toThrow("does not have recruitment capability");
  });

  it("should reject recruitment by N2", async () => {
    vi.mocked(mockRepo.findEmployeeById).mockResolvedValue(
      makeEmployee({ id: "emp-2", firstName: "Low", lastName: "Level", currentLevelId: 2 }),
    );

    await expect(
      useCase.execute({
        recruiterId: "emp-2",
        firstName: "Test",
        lastName: "User",
        joinedAt: new Date(),
        actorEmail: "n2@example.com",
        dni: "30123456",
        email: "test@example.com",
        phone: "11-5555-0000",
        dateOfBirth: new Date("1990-01-01"),
        street: "Calle Test",
        streetNumber: "123",
        floor: null,
        apartment: null,
        city: "Buenos Aires",
        province: "CABA",
        postalCode: "C1000",
      }),
    ).rejects.toThrow("does not have recruitment capability");
  });

  it("should reject inactive recruiter", async () => {
    vi.mocked(mockRepo.findEmployeeById).mockResolvedValue(
      makeEmployee({ id: "sup-1", firstName: "Inactive", lastName: "Recruiter", joinedAt: new Date("2025-01-01"), currentLevelId: 3, status: "INACTIVE" }),
    );

    await expect(
      useCase.execute({
        recruiterId: "sup-1",
        firstName: "Test",
        lastName: "User",
        joinedAt: new Date(),
        actorEmail: "supervisor@example.com",
        dni: "30123456",
        email: "test@example.com",
        phone: "11-5555-0000",
        dateOfBirth: new Date("1990-01-01"),
        street: "Calle Test",
        streetNumber: "123",
        floor: null,
        apartment: null,
        city: "Buenos Aires",
        province: "CABA",
        postalCode: "C1000",
      }),
    ).rejects.toThrow("Only active employees can recruit");
  });

  it("should throw NotFoundError for non-existent recruiter", async () => {
    vi.mocked(mockRepo.findEmployeeById).mockResolvedValue(null);

    await expect(
      useCase.execute({
        recruiterId: "nonexistent",
        firstName: "Test",
        lastName: "User",
        joinedAt: new Date(),
        actorEmail: "supervisor@example.com",
        dni: "30123456",
        email: "test@example.com",
        phone: "11-5555-0000",
        dateOfBirth: new Date("1990-01-01"),
        street: "Calle Test",
        streetNumber: "123",
        floor: null,
        apartment: null,
        city: "Buenos Aires",
        province: "CABA",
        postalCode: "C1000",
      }),
    ).rejects.toThrow("Recruiter");
  });
});
