/**
 * Request password reset use case.
 *
 * Generates a password reset token for a user identified by email.
 * The token is hashed and stored in the database. The raw token is
 * delivered via the PasswordResetNotifier port (not returned to the caller),
 * preventing exposure to the client browser.
 *
 * Implements enumeration protection: always returns success regardless
 * of whether the email exists.
 *
 * Records an audit event for the password reset request.
 *
 * Reference: authorization.md §4, data-model.md §10.1
 */

import type {
  TokenService,
  IdentityRepository,
  PasswordResetNotifier,
} from "@/modules/identity/domain";
import type { AuditPort } from "@/shared/ports/audit-port";
import { AuditAction } from "@/shared/ports/audit-port";

export interface RequestPasswordResetInput {
  readonly email: string;
}

export interface RequestPasswordResetOutput {
  /** Always true to prevent email enumeration. */
  readonly success: boolean;
}

const RESET_TOKEN_TTL_MS = 60 * 60 * 1000; // 1 hour

export class RequestPasswordResetUseCase {
  constructor(
    private readonly identityRepository: IdentityRepository,
    private readonly tokenService: TokenService,
    private readonly notifier: PasswordResetNotifier,
    private readonly auditPort: AuditPort,
  ) {}

  async execute(
    input: RequestPasswordResetInput,
  ): Promise<RequestPasswordResetOutput> {
    const email = input.email.trim().toLowerCase();

    // Always return success to prevent email enumeration
    const record = await this.identityRepository.findByEmail(email);
    if (!record) {
      // Record audit event for non-existent email (best-effort)
      await this.auditPort.log({
        actorId: null,
        actorEmail: email,
        action: AuditAction.PASSWORD_RESET_REQUESTED,
        resourceType: "UserAccount",
        resourceId: null,
        result: "SUCCESS",
        correlationId: null,
        metadata: { emailExists: false },
        timestamp: new Date(),
      });

      return { success: true };
    }

    // Generate token
    const { raw, hash } = await this.tokenService.generate();
    const expiresAt = new Date(Date.now() + RESET_TOKEN_TTL_MS);

    // Store hashed token
    await this.identityRepository.createResetToken(
      record.userAccount.id,
      hash,
      expiresAt,
    );

    // Deliver raw token via notification port (never returned to caller)
    await this.notifier.notify(raw, email);

    // Record audit event
    await this.auditPort.log({
      actorId: record.userAccount.id,
      actorEmail: email,
      action: AuditAction.PASSWORD_RESET_REQUESTED,
      resourceType: "UserAccount",
      resourceId: record.userAccount.id,
      result: "SUCCESS",
      correlationId: null,
      metadata: { emailExists: true },
      timestamp: new Date(),
    });

    return { success: true };
  }
}
