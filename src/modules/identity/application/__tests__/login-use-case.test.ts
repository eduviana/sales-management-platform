import { describe, it, expect, vi, beforeEach } from "vitest";
import { LoginUseCase } from "../login-use-case";
import type {
  PasswordService,
  SessionPort,
  IdentityRepository,
} from "@/modules/identity/domain";
import type { AuditPort } from "@/shared/ports/audit-port";
import { AuthenticationError, ValidationError } from "@/shared/errors";

function createMocks() {
  const identityRepository: IdentityRepository = {
    findByEmail: vi.fn(),
    findById: vi.fn(),
    findAccountEmailsByIds: vi.fn().mockResolvedValue([]),
    updateLastLogin: vi.fn(),
    updatePassword: vi.fn(),
    updateStatus: vi.fn(),
    createResetToken: vi.fn(),
    findValidResetToken: vi.fn(),
    markResetTokenUsed: vi.fn(),
    invalidateAllResetTokens: vi.fn(),
  };

  const passwordService: PasswordService = {
    hash: vi.fn(),
    verify: vi.fn(),
  };

  const sessionPort: SessionPort = {
    create: vi.fn(),
    destroy: vi.fn(),
    resolve: vi.fn(),
  };

  const auditPort: AuditPort = {
    log: vi.fn().mockResolvedValue(undefined),
  };

  return { identityRepository, passwordService, sessionPort, auditPort };
}

describe("LoginUseCase", () => {
  let mocks: ReturnType<typeof createMocks>;
  let useCase: LoginUseCase;

  beforeEach(() => {
    mocks = createMocks();
    useCase = new LoginUseCase(
      mocks.identityRepository,
      mocks.passwordService,
      mocks.sessionPort,
      mocks.auditPort,
    );
  });

  it("should throw ValidationError when email is empty", async () => {
    await expect(
      useCase.execute({ email: "", password: "pass1234" }),
    ).rejects.toThrow(ValidationError);
  });

  it("should throw ValidationError when password is empty", async () => {
    await expect(
      useCase.execute({ email: "test@example.com", password: "" }),
    ).rejects.toThrow(ValidationError);
  });

  it("should throw AuthenticationError when user not found", async () => {
    vi.mocked(mocks.identityRepository.findByEmail).mockResolvedValue(null);

    await expect(
      useCase.execute({ email: "unknown@example.com", password: "pass1234" }),
    ).rejects.toThrow(AuthenticationError);
  });

  it("should throw AuthenticationError when password is invalid", async () => {
    vi.mocked(mocks.identityRepository.findByEmail).mockResolvedValue({
      userAccount: {
        id: "user-1",
        employeeId: "emp-1",
        email: "test@example.com",
        passwordHash: "hashed",
        status: "ACTIVE",
        mustChangePassword: false,
        lastLoginAt: null,
      },
      employee: {
        id: "emp-1",
        firstName: "Juan",
        lastName: "Pérez",
        status: "ACTIVE",
        currentLevelId: 1,
        supervisorId: null,
      },
    });
    vi.mocked(mocks.passwordService.verify).mockResolvedValue(false);

    await expect(
      useCase.execute({ email: "test@example.com", password: "wrong" }),
    ).rejects.toThrow(AuthenticationError);
  });

  it("should throw AuthenticationError when account is SUSPENDED", async () => {
    vi.mocked(mocks.identityRepository.findByEmail).mockResolvedValue({
      userAccount: {
        id: "user-1",
        employeeId: "emp-1",
        email: "test@example.com",
        passwordHash: "hashed",
        status: "SUSPENDED",
        mustChangePassword: false,
        lastLoginAt: null,
      },
      employee: {
        id: "emp-1",
        firstName: "Juan",
        lastName: "Pérez",
        status: "ACTIVE",
        currentLevelId: 1,
        supervisorId: null,
      },
    });
    vi.mocked(mocks.passwordService.verify).mockResolvedValue(true);

    await expect(
      useCase.execute({ email: "test@example.com", password: "pass1234" }),
    ).rejects.toThrow(AuthenticationError);
  });

  it("should throw AuthenticationError when employee is INACTIVE", async () => {
    vi.mocked(mocks.identityRepository.findByEmail).mockResolvedValue({
      userAccount: {
        id: "user-1",
        employeeId: "emp-1",
        email: "test@example.com",
        passwordHash: "hashed",
        status: "ACTIVE",
        mustChangePassword: false,
        lastLoginAt: null,
      },
      employee: {
        id: "emp-1",
        firstName: "Juan",
        lastName: "Pérez",
        status: "INACTIVE",
        currentLevelId: 1,
        supervisorId: null,
      },
    });
    vi.mocked(mocks.passwordService.verify).mockResolvedValue(true);

    await expect(
      useCase.execute({ email: "test@example.com", password: "pass1234" }),
    ).rejects.toThrow(AuthenticationError);
  });

  it("should succeed with valid credentials", async () => {
    vi.mocked(mocks.identityRepository.findByEmail).mockResolvedValue({
      userAccount: {
        id: "user-1",
        employeeId: "emp-1",
        email: "test@example.com",
        passwordHash: "hashed",
        status: "ACTIVE",
        mustChangePassword: false,
        lastLoginAt: null,
      },
      employee: {
        id: "emp-1",
        firstName: "Juan",
        lastName: "Pérez",
        status: "ACTIVE",
        currentLevelId: 1,
        supervisorId: null,
      },
    });
    vi.mocked(mocks.passwordService.verify).mockResolvedValue(true);

    const result = await useCase.execute({
      email: "test@example.com",
      password: "pass1234",
    });

    expect(result.identity.userAccount.id).toBe("user-1");
    expect(result.mustChangePassword).toBe(false);
    expect(mocks.sessionPort.create).toHaveBeenCalledWith("user-1");
    expect(mocks.identityRepository.updateLastLogin).toHaveBeenCalled();
  });

  it("should return mustChangePassword=true when user must change password", async () => {
    vi.mocked(mocks.identityRepository.findByEmail).mockResolvedValue({
      userAccount: {
        id: "user-1",
        employeeId: "emp-1",
        email: "test@example.com",
        passwordHash: "hashed",
        status: "ACTIVE",
        mustChangePassword: true,
        lastLoginAt: null,
      },
      employee: {
        id: "emp-1",
        firstName: "Juan",
        lastName: "Pérez",
        status: "ACTIVE",
        currentLevelId: 1,
        supervisorId: null,
      },
    });
    vi.mocked(mocks.passwordService.verify).mockResolvedValue(true);

    const result = await useCase.execute({
      email: "test@example.com",
      password: "pass1234",
    });

    expect(result.mustChangePassword).toBe(true);
  });
});
