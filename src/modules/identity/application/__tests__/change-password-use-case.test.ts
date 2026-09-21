import { describe, it, expect, vi, beforeEach } from "vitest";
import { ChangePasswordUseCase } from "../change-password-use-case";
import type {
  PasswordService,
  IdentityRepository,
} from "@/modules/identity/domain";
import type { AuditPort } from "@/shared/ports/audit-port";
import { ValidationError, DomainRuleError } from "@/shared/errors";

function createMocks() {
  const identityRepository: IdentityRepository = {
    findByEmail: vi.fn(),
    findById: vi.fn(),
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

  const auditPort: AuditPort = {
    log: vi.fn().mockResolvedValue(undefined),
  };

  return { identityRepository, passwordService, auditPort };
}

describe("ChangePasswordUseCase", () => {
  let mocks: ReturnType<typeof createMocks>;
  let useCase: ChangePasswordUseCase;

  const validInput = {
    userId: "user-1",
    userEmail: "test@example.com",
    currentPassword: "oldPass123",
    newPassword: "newPass456",
    confirmPassword: "newPass456",
  };

  beforeEach(() => {
    mocks = createMocks();
    useCase = new ChangePasswordUseCase(
      mocks.identityRepository,
      mocks.passwordService,
      mocks.auditPort,
    );
  });

  it("should throw ValidationError when fields are missing", async () => {
    await expect(
      useCase.execute({ ...validInput, currentPassword: "" }),
    ).rejects.toThrow(ValidationError);
  });

  it("should throw ValidationError when passwords do not match", async () => {
    await expect(
      useCase.execute({ ...validInput, confirmPassword: "different" }),
    ).rejects.toThrow(ValidationError);
  });

  it("should throw ValidationError when new password is too short", async () => {
    await expect(
      useCase.execute({ ...validInput, newPassword: "short", confirmPassword: "short" }),
    ).rejects.toThrow(ValidationError);
  });

  it("should throw DomainRuleError when user not found", async () => {
    vi.mocked(mocks.identityRepository.findById).mockResolvedValue(null);

    await expect(useCase.execute(validInput)).rejects.toThrow(DomainRuleError);
  });

  it("should throw DomainRuleError when current password is incorrect", async () => {
    vi.mocked(mocks.identityRepository.findById).mockResolvedValue({
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
    vi.mocked(mocks.passwordService.verify).mockResolvedValue(false);

    await expect(useCase.execute(validInput)).rejects.toThrow(DomainRuleError);
  });

  it("should throw DomainRuleError when new password is same as current", async () => {
    vi.mocked(mocks.identityRepository.findById).mockResolvedValue({
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
    // First verify call (current password check) returns true
    // Second verify call (same password check) also returns true
    vi.mocked(mocks.passwordService.verify).mockResolvedValue(true);

    await expect(useCase.execute(validInput)).rejects.toThrow(DomainRuleError);
  });

  it("should succeed with valid input", async () => {
    vi.mocked(mocks.identityRepository.findById).mockResolvedValue({
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
    // First verify (current password) = true, second verify (same check) = false
    vi.mocked(mocks.passwordService.verify)
      .mockResolvedValueOnce(true)
      .mockResolvedValueOnce(false);
    vi.mocked(mocks.passwordService.hash).mockResolvedValue("newHashed");

    await useCase.execute(validInput);

    expect(mocks.passwordService.hash).toHaveBeenCalledWith("newPass456");
    expect(mocks.identityRepository.updatePassword).toHaveBeenCalledWith(
      "user-1",
      "newHashed",
      false,
    );
  });
});
