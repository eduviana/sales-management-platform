import { describe, it, expect, vi, beforeEach } from "vitest";
import { GetEmployeeByIdUseCase } from "../get-employee-by-id-use-case";
import type {
  AuthorizationContext,
  AuthorizationDecision,
  AuthorizationService,
  Permission,
} from "@/modules/authorization/domain";
import { ScopeType } from "@/modules/authorization/domain";
import type {
  EmployeeRecord,
  OrganizationRepository,
} from "@/modules/organization/domain";
import { AuthorizationError } from "@/shared/errors";

function makeAuthContext(
  overrides?: Partial<AuthorizationContext>,
): AuthorizationContext {
  return {
    userId: "user-1",
    employeeId: "emp-3",
    levelId: 3,
    role: "SELLER",
    supervisorId: "sup-1",
    userEmail: "supervisor@example.com",
    ...overrides,
  };
}

function makeAllowDecision(): AuthorizationDecision {
  return {
    allowed: true,
    permission: "employee.read" as Permission,
    scope: ScopeType.TEAM,
    reason: "Permission 'employee.read' granted with scope 'TEAM'.",
  };
}

function makeDenyDecision(scope?: ScopeType): AuthorizationDecision {
  return {
    allowed: false,
    permission: "employee.read" as Permission,
    scope,
    reason: "Resource is outside the authorized scope.",
  };
}

function makeAuth(
  decision: AuthorizationDecision = makeAllowDecision(),
): AuthorizationService {
  return { authorize: vi.fn().mockResolvedValue(decision) };
}

const employee = { id: "emp-1", firstName: "Juan" } as EmployeeRecord;

function makeRepo(): OrganizationRepository {
  return {
    findEmployeeById: vi.fn().mockResolvedValue(employee),
  } as unknown as OrganizationRepository;
}

let mockAuth: AuthorizationService;
let mockRepo: OrganizationRepository;
let useCase: GetEmployeeByIdUseCase;

beforeEach(() => {
  mockAuth = makeAuth();
  mockRepo = makeRepo();
  useCase = new GetEmployeeByIdUseCase(mockAuth, mockRepo);
});

describe("GetEmployeeByIdUseCase", () => {
  it("should authorize against the requested employee, not only the permission", async () => {
    const result = await useCase.execute({
      authContext: makeAuthContext(),
      employeeId: "emp-1",
    });

    expect(mockAuth.authorize).toHaveBeenCalledWith(expect.anything(), {
      permission: "employee.read",
      resource: { type: "employee", id: "emp-1" },
    });
    expect(result).toBe(employee);
  });

  it("should deny when the employee is outside the actor's scope", async () => {
    mockAuth = makeAuth(makeDenyDecision(ScopeType.TEAM));
    useCase = new GetEmployeeByIdUseCase(mockAuth, mockRepo);

    await expect(
      useCase.execute({
        authContext: makeAuthContext(),
        employeeId: "emp-999",
      }),
    ).rejects.toThrow(AuthorizationError);

    expect(mockRepo.findEmployeeById).not.toHaveBeenCalled();
  });

  it("should deny when the permission is not granted at all", async () => {
    mockAuth = makeAuth(makeDenyDecision());
    useCase = new GetEmployeeByIdUseCase(mockAuth, mockRepo);

    await expect(
      useCase.execute({
        authContext: makeAuthContext({ levelId: 1 }),
        employeeId: "emp-1",
      }),
    ).rejects.toThrow(AuthorizationError);
  });

  it("should allow an organization-wide scope even for an inactive employee", async () => {
    mockAuth = makeAuth(makeDenyDecision(ScopeType.GLOBAL));
    useCase = new GetEmployeeByIdUseCase(mockAuth, mockRepo);

    await expect(
      useCase.execute({
        authContext: makeAuthContext({ role: "ADMIN", levelId: null }),
        employeeId: "emp-1",
      }),
    ).resolves.toBe(employee);
  });

  it("should throw NotFoundError when the employee does not exist", async () => {
    mockAuth = makeAuth(makeDenyDecision(ScopeType.GLOBAL));
    vi.mocked(mockRepo.findEmployeeById).mockResolvedValue(null);
    useCase = new GetEmployeeByIdUseCase(mockAuth, mockRepo);

    await expect(
      useCase.execute({
        authContext: makeAuthContext({ role: "ADMIN", levelId: null }),
        employeeId: "emp-404",
      }),
    ).rejects.toThrow("Employee not found.");
  });
});