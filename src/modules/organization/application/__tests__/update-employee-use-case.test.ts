import { describe, it, expect, vi, beforeEach } from "vitest";
import { UpdateEmployeeUseCase } from "../update-employee-use-case";
import type {
  AuthorizationContext,
  AuthorizationDecision,
  AuthorizationService,
  Permission,
} from "@/modules/authorization/domain";
import { ScopeType } from "@/modules/authorization/domain";
import type {
  OrganizationRepository,
  UpdateEmployeeData,
} from "@/modules/organization/domain";
import type { AuditPort } from "@/shared/ports/audit-port";
import { AuditAction } from "@/shared/ports/audit-port";

function makeAuthContext(
  overrides?: Partial<AuthorizationContext>,
): AuthorizationContext {
  return {
    userId: "user-1",
    employeeId: "emp-actor",
    levelId: 3,
    role: "SELLER",
    supervisorId: null,
    userEmail: "actor@example.com",
    ...overrides,
  };
}

function makeAllowDecision(
  permission: string,
  scope?: ScopeType,
): AuthorizationDecision {
  return {
    allowed: true,
    permission: permission as Permission,
    scope,
    reason: `Permission '${permission}' granted.`,
  };
}

function makeDenyDecision(
  permission: string,
  scope?: ScopeType,
): AuthorizationDecision {
  return {
    allowed: false,
    permission: permission as Permission,
    scope,
    reason: `Not authorized: ${permission}.`,
  };
}

function makeAuth(
  decision: AuthorizationDecision = makeAllowDecision("employee.update"),
): AuthorizationService {
  return {
    authorize: vi.fn().mockResolvedValue(decision),
  };
}

function makeUpdateData(
  overrides?: Partial<UpdateEmployeeData>,
): UpdateEmployeeData {
  return {
    firstName: "Juan",
    lastName: "Pérez",
    dni: "12345678",
    email: "juan@example.com",
    phone: "555-1234",
    dateOfBirth: new Date("1990-01-01"),
    street: "Calle Falsa",
    streetNumber: "123",
    floor: null,
    apartment: null,
    city: "Ciudad",
    province: "Provincia",
    postalCode: "1000",
    ...overrides,
  };
}

function createMockRepo(): OrganizationRepository {
  return {
    findEmployeeById: vi.fn(),
    createEmployee: vi.fn(),
    updateEmployee: vi.fn(),
    updateEmployeeLevel: vi.fn(),
    updateEmployeeSupervisor: vi.fn(),
    updateEmployeeStatus: vi.fn(),
    findLevelById: vi.fn(),
    findOpenLevelHistory: vi.fn(),
    findOpenLevelHistories: vi.fn(),
    findEmployeeCodesByIds: vi.fn().mockResolvedValue([]),
    findNamesByIds: vi.fn().mockResolvedValue([]),
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
let mockAuth: AuthorizationService;
let useCase: UpdateEmployeeUseCase;

beforeEach(() => {
  mockRepo = createMockRepo();
  mockAuth = makeAuth();
  vi.mocked(mockAuditPort.log).mockClear();
  vi.mocked(mockRepo.findEmployeeById).mockResolvedValue({ id: "emp-1" } as never);
  useCase = new UpdateEmployeeUseCase(mockAuth, mockRepo, mockAuditPort);
});

describe("UpdateEmployeeUseCase", () => {
  it("should update an employee and record an audit event", async () => {
    const data = makeUpdateData();

    await useCase.execute({
      authContext: makeAuthContext({ role: "ADMIN", levelId: null }),
      employeeId: "emp-1",
      data,
    });

    expect(mockAuth.authorize).toHaveBeenCalledWith(expect.anything(), {
      permission: "employee.update",
      resource: { type: "employee", id: "emp-1", ownerId: "emp-1" },
    });
    expect(mockRepo.updateEmployee).toHaveBeenCalledWith("emp-1", data);
      expect(mockAuditPort.log).toHaveBeenCalledWith(
        expect.objectContaining({
          actorId: "user-1",
          actorEmail: "actor@example.com",
        action: AuditAction.EMPLOYEE_UPDATED,
        resourceType: "Employee",
        resourceId: "emp-1",
        result: "SUCCESS",
      }),
    );
  });

  it("should reject blank required names without touching the repository", async () => {
    await expect(
      useCase.execute({
        authContext: makeAuthContext(),
        employeeId: "emp-1",
        data: makeUpdateData({ firstName: "   " }),
      }),
    ).rejects.toThrow("Nombre y apellido son obligatorios.");

    expect(mockAuth.authorize).not.toHaveBeenCalled();
    expect(mockRepo.updateEmployee).not.toHaveBeenCalled();
    expect(mockAuditPort.log).not.toHaveBeenCalled();
  });

  it("should throw NotFoundError for a non-existent employee", async () => {
    vi.mocked(mockRepo.findEmployeeById).mockResolvedValue(null);

    await expect(
      useCase.execute({
        authContext: makeAuthContext(),
        employeeId: "emp-404",
        data: makeUpdateData(),
      }),
    ).rejects.toThrow("Employee");

    expect(mockRepo.updateEmployee).not.toHaveBeenCalled();
  });

  it("should deny the update when the target is outside the actor's scope", async () => {
    mockAuth = makeAuth(makeDenyDecision("employee.update", ScopeType.TEAM));
    useCase = new UpdateEmployeeUseCase(mockAuth, mockRepo, mockAuditPort);

    await expect(
      useCase.execute({
        authContext: makeAuthContext(),
        employeeId: "emp-1",
        data: makeUpdateData(),
      }),
    ).rejects.toThrow("No autorizado para actualizar este empleado.");

    expect(mockRepo.updateEmployee).not.toHaveBeenCalled();
    expect(mockAuditPort.log).not.toHaveBeenCalled();
  });

  it("should deny the update when the permission is not granted", async () => {
    mockAuth = makeAuth(makeDenyDecision("employee.update"));
    useCase = new UpdateEmployeeUseCase(mockAuth, mockRepo, mockAuditPort);

    await expect(
      useCase.execute({
        authContext: makeAuthContext({ levelId: 1 }),
        employeeId: "emp-1",
        data: makeUpdateData(),
      }),
    ).rejects.toThrow("No autorizado para actualizar este empleado.");

    expect(mockRepo.updateEmployee).not.toHaveBeenCalled();
  });

  it("should allow GLOBAL scope even when the target is outside the resolved scope", async () => {
    // The scope resolver only returns ACTIVE employees, so an inactive
    // employee is rejected by the membership check. GLOBAL covers the whole
    // organization, so the update must still be allowed.
    mockAuth = makeAuth(makeDenyDecision("employee.update", ScopeType.GLOBAL));
    useCase = new UpdateEmployeeUseCase(mockAuth, mockRepo, mockAuditPort);

    await useCase.execute({
      authContext: makeAuthContext({ role: "ADMIN", levelId: null }),
      employeeId: "emp-1",
      data: makeUpdateData(),
    });

    expect(mockRepo.updateEmployee).toHaveBeenCalled();
  });
});