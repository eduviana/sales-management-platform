import { describe, it, expect, vi, beforeEach } from "vitest";
import { RequestPasswordResetUseCase } from "../request-password-reset-use-case";
import type {
  TokenService,
  IdentityRepository,
  PasswordResetNotifier,
} from "@/modules/identity/domain";
import type { AuditPort } from "@/shared/ports/audit-port";

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

  const tokenService: TokenService = {
    generate: vi.fn(),
    hash: vi.fn(),
  };

  const notifier: PasswordResetNotifier = {
    notify: vi.fn(),
  };

  const auditPort: AuditPort = {
    log: vi.fn().mockResolvedValue(undefined),
  };

  return { identityRepository, tokenService, notifier, auditPort };
}

describe("RequestPasswordResetUseCase", () => {
  let mocks: ReturnType<typeof createMocks>;
  let useCase: RequestPasswordResetUseCase;

  beforeEach(() => {
    mocks = createMocks();
    useCase = new RequestPasswordResetUseCase(
      mocks.identityRepository,
      mocks.tokenService,
      mocks.notifier,
      mocks.auditPort,
    );
  });

  it("should return success even when email does not exist (enumeration protection)", async () => {
    vi.mocked(mocks.identityRepository.findByEmail).mockResolvedValue(null);

    const result = await useCase.execute({ email: "unknown@example.com" });

    expect(result.success).toBe(true);
    expect(mocks.notifier.notify).not.toHaveBeenCalled();
    expect(mocks.identityRepository.createResetToken).not.toHaveBeenCalled();
  });

  it("should generate, store hash, and deliver token via notifier when email exists", async () => {
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
    vi.mocked(mocks.tokenService.generate).mockResolvedValue({
      raw: "raw-token-123",
      hash: "hashed-token-456",
    });
    vi.mocked(mocks.identityRepository.createResetToken).mockResolvedValue({
      id: "token-1",
      userId: "user-1",
      tokenHash: "hashed-token-456",
      expiresAt: new Date(),
      usedAt: null,
    });

    const result = await useCase.execute({ email: "test@example.com" });

    expect(result.success).toBe(true);
    // Raw token is NOT in the output
    expect(result).not.toHaveProperty("token");
    // Hash is stored in DB
    expect(mocks.identityRepository.createResetToken).toHaveBeenCalledWith(
      "user-1",
      "hashed-token-456",
      expect.any(Date),
    );
    // Raw token is delivered via notifier (never to the caller)
    expect(mocks.notifier.notify).toHaveBeenCalledWith(
      "raw-token-123",
      "test@example.com",
    );
  });

  it("should not call notifier when email does not exist", async () => {
    vi.mocked(mocks.identityRepository.findByEmail).mockResolvedValue(null);

    await useCase.execute({ email: "unknown@example.com" });

    expect(mocks.notifier.notify).not.toHaveBeenCalled();
    expect(mocks.tokenService.generate).not.toHaveBeenCalled();
  });
});
