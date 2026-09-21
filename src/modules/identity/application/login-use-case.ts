/**
 * Login use case.
 *
 * Authenticates a user with email + password.
 * Resolves the full identity (UserAccount + Employee) and creates a session.
 * Records audit events for both successful and failed login attempts.
 *
 * Reference: authorization.md §4, system-architecture.md §11
 */

import type {
  PasswordService,
  SessionPort,
  IdentityRepository,
} from "@/modules/identity/domain";
import { AuthenticatedIdentity } from "@/modules/identity/domain";
import type { AuditPort } from "@/shared/ports/audit-port";
import { AuditAction } from "@/shared/ports/audit-port";
import {
  AuthenticationError,
  ValidationError,
} from "@/shared/errors";

export interface LoginInput {
  readonly email: string;
  readonly password: string;
}

export interface LoginOutput {
  readonly identity: AuthenticatedIdentity;
  readonly mustChangePassword: boolean;
}

export class LoginUseCase {
  constructor(
    private readonly identityRepository: IdentityRepository,
    private readonly passwordService: PasswordService,
    private readonly sessionPort: SessionPort,
    private readonly auditPort: AuditPort,
  ) {}

  async execute(input: LoginInput): Promise<LoginOutput> {
    // 1. Validate input
    const email = input.email.trim().toLowerCase();
    if (!email || !input.password) {
      throw new ValidationError("Email and password are required.");
    }

    // 2. Find user by email
    const record = await this.identityRepository.findByEmail(email);
    if (!record) {
      // Record failed login attempt
      await this.auditPort.log({
        actorId: null,
        actorEmail: email,
        action: AuditAction.LOGIN_FAILURE,
        resourceType: "UserAccount",
        resourceId: null,
        result: "FAILURE",
        correlationId: null,
        metadata: { reason: "User not found" },
        timestamp: new Date(),
      });

      // Generic message to prevent email enumeration
      throw new AuthenticationError("Invalid email or password.");
    }

    // 3. Verify password
    const passwordValid = await this.passwordService.verify(
      input.password,
      record.userAccount.passwordHash,
    );
    if (!passwordValid) {
      // Record failed login attempt
      await this.auditPort.log({
        actorId: record.userAccount.id,
        actorEmail: email,
        action: AuditAction.LOGIN_FAILURE,
        resourceType: "UserAccount",
        resourceId: record.userAccount.id,
        result: "FAILURE",
        correlationId: null,
        metadata: { reason: "Invalid password" },
        timestamp: new Date(),
      });

      throw new AuthenticationError("Invalid email or password.");
    }

    // 4. Check account status
    if (record.userAccount.status !== "ACTIVE") {
      // Record failed login attempt
      await this.auditPort.log({
        actorId: record.userAccount.id,
        actorEmail: email,
        action: AuditAction.LOGIN_FAILURE,
        resourceType: "UserAccount",
        resourceId: record.userAccount.id,
        result: "FAILURE",
        correlationId: null,
        metadata: { reason: `Account status: ${record.userAccount.status}` },
        timestamp: new Date(),
      });

      throw new AuthenticationError(
        "This account is not active. Please contact an administrator.",
      );
    }

    // 5. Check employee status
    if (record.employee.status !== "ACTIVE") {
      // Record failed login attempt
      await this.auditPort.log({
        actorId: record.userAccount.id,
        actorEmail: email,
        action: AuditAction.LOGIN_FAILURE,
        resourceType: "UserAccount",
        resourceId: record.userAccount.id,
        result: "FAILURE",
        correlationId: null,
        metadata: { reason: `Employee status: ${record.employee.status}` },
        timestamp: new Date(),
      });

      throw new AuthenticationError(
        "This employee account is inactive. Please contact an administrator.",
      );
    }

    // 6. Create session
    await this.sessionPort.create(record.userAccount.id);

    // 7. Update last login timestamp
    await this.identityRepository.updateLastLogin(
      record.userAccount.id,
      new Date(),
    );

    // 8. Record successful login
    await this.auditPort.log({
      actorId: record.userAccount.id,
      actorEmail: email,
      action: AuditAction.LOGIN_SUCCESS,
      resourceType: "UserAccount",
      resourceId: record.userAccount.id,
      result: "SUCCESS",
      correlationId: null,
      metadata: null,
      timestamp: new Date(),
    });

    // 9. Build identity
    const identity = new AuthenticatedIdentity(
      record.userAccount,
      record.employee,
    );

    return {
      identity,
      mustChangePassword: identity.mustChangePassword,
    };
  }
}
