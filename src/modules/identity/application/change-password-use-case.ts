/**
 * Change password use case.
 *
 * Changes the password for an authenticated user.
 * Used for the mustChangePassword flow and voluntary password changes.
 * Records an audit event after successful password change.
 *
 * Reference: authorization.md §4, system-architecture.md §11
 */

import type {
  PasswordService,
  IdentityRepository,
} from "@/modules/identity/domain";
import type { AuditPort } from "@/shared/ports/audit-port";
import { AuditAction } from "@/shared/ports/audit-port";
import {
  ValidationError,
  DomainRuleError,
} from "@/shared/errors";

export interface ChangePasswordInput {
  readonly userId: string;
  readonly userEmail: string;
  readonly currentPassword: string;
  readonly newPassword: string;
  readonly confirmPassword: string;
}

export class ChangePasswordUseCase {
  constructor(
    private readonly identityRepository: IdentityRepository,
    private readonly passwordService: PasswordService,
    private readonly auditPort: AuditPort,
  ) {}

  async execute(input: ChangePasswordInput): Promise<void> {
    // 1. Validate input
    if (!input.currentPassword || !input.newPassword || !input.confirmPassword) {
      throw new ValidationError("All password fields are required.");
    }

    if (input.newPassword !== input.confirmPassword) {
      throw new ValidationError("New password and confirmation do not match.", "confirmPassword");
    }

    if (input.newPassword.length < 8) {
      throw new ValidationError("New password must be at least 8 characters.", "newPassword");
    }

    // 2. Find user
    const record = await this.identityRepository.findById(input.userId);
    if (!record) {
      throw new DomainRuleError("User account not found.");
    }

    // 3. Verify current password
    const currentValid = await this.passwordService.verify(
      input.currentPassword,
      record.userAccount.passwordHash,
    );
    if (!currentValid) {
      throw new DomainRuleError("Current password is incorrect.");
    }

    // 4. Ensure new password is different from current
    const samePassword = await this.passwordService.verify(
      input.newPassword,
      record.userAccount.passwordHash,
    );
    if (samePassword) {
      throw new DomainRuleError("New password must be different from the current password.");
    }

    // 5. Hash new password
    const newHash = await this.passwordService.hash(input.newPassword);

    // 6. Update password and clear mustChangePassword flag
    await this.identityRepository.updatePassword(
      input.userId,
      newHash,
      false, // mustChangePassword = false after successful change
    );

    // 7. Record audit event
    await this.auditPort.log({
      actorId: input.userId,
      actorEmail: input.userEmail,
      action: AuditAction.PASSWORD_CHANGED,
      resourceType: "UserAccount",
      resourceId: input.userId,
      result: "SUCCESS",
      correlationId: null,
      metadata: null,
      timestamp: new Date(),
    });
  }
}
