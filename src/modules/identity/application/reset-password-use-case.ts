/**
 * Reset password use case.
 *
 * Resets a user's password using a valid reset token.
 * Invalidates all active reset tokens after successful reset.
 * Records an audit event after successful password reset.
 *
 * Reference: authorization.md §4, data-model.md §10.1
 */

import type {
  PasswordService,
  TokenService,
  IdentityRepository,
} from "@/modules/identity/domain";
import type { AuditPort } from "@/shared/ports/audit-port";
import { AuditAction } from "@/shared/ports/audit-port";
import {
  ValidationError,
  DomainRuleError,
} from "@/shared/errors";

export interface ResetPasswordInput {
  readonly token: string;
  readonly newPassword: string;
  readonly confirmPassword: string;
}

export class ResetPasswordUseCase {
  constructor(
    private readonly identityRepository: IdentityRepository,
    private readonly passwordService: PasswordService,
    private readonly tokenService: TokenService,
    private readonly auditPort: AuditPort,
  ) {}

  async execute(input: ResetPasswordInput): Promise<void> {
    // 1. Validate input
    if (!input.token || !input.newPassword || !input.confirmPassword) {
      throw new ValidationError("Token, new password, and confirmation are required.");
    }

    if (input.newPassword !== input.confirmPassword) {
      throw new ValidationError("New password and confirmation do not match.", "confirmPassword");
    }

    if (input.newPassword.length < 8) {
      throw new ValidationError("New password must be at least 8 characters.", "newPassword");
    }

    // 2. Hash the raw token for lookup
    const tokenHash = await this.tokenService.hash(input.token);

    // 3. Find valid token
    const resetToken = await this.identityRepository.findValidResetToken(tokenHash);
    if (!resetToken) {
      throw new DomainRuleError("Invalid or expired reset token.");
    }

    // 4. Find the user to hash the new password
    const record = await this.identityRepository.findById(resetToken.userId);
    if (!record) {
      throw new DomainRuleError("User account not found.");
    }

    // 5. Ensure new password is different from current
    const samePassword = await this.passwordService.verify(
      input.newPassword,
      record.userAccount.passwordHash,
    );
    if (samePassword) {
      throw new DomainRuleError("New password must be different from the current password.");
    }

    // 6. Hash new password
    const newHash = await this.passwordService.hash(input.newPassword);

    // 7. Update password and clear mustChangePassword flag
    await this.identityRepository.updatePassword(
      resetToken.userId,
      newHash,
      false,
    );

    // 8. Mark token as used
    await this.identityRepository.markResetTokenUsed(resetToken.id, new Date());

    // 9. Invalidate all other active reset tokens for this user
    await this.identityRepository.invalidateAllResetTokens(resetToken.userId);

    // 10. Record audit event
    await this.auditPort.log({
      actorId: resetToken.userId,
      actorEmail: record.userAccount.email,
      action: AuditAction.PASSWORD_RESET_COMPLETED,
      resourceType: "UserAccount",
      resourceId: resetToken.userId,
      result: "SUCCESS",
      correlationId: null,
      metadata: null,
      timestamp: new Date(),
    });
  }
}
