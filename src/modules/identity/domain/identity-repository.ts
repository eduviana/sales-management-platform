/**
 * Identity repository port (contract).
 *
 * Application layer depends on this interface for identity-related
 * persistence operations. Infrastructure implements the concrete
 * Prisma-based repositories.
 *
 * Reference: data-architecture.md §7, system-architecture.md §6.4
 */

import type { AccountStatus } from "./authenticated-identity";

/**
 * Minimal UserAccount representation returned by identity queries.
 * Avoids leaking Prisma types into the Application layer.
 */
export interface UserAccountRecord {
  readonly id: string;
  readonly employeeId: string;
  readonly email: string;
  readonly passwordHash: string;
  readonly status: AccountStatus;
  readonly mustChangePassword: boolean;
  readonly lastLoginAt: Date | null;
}

/**
 * Minimal Employee representation returned by identity queries.
 */
export interface EmployeeRecord {
  readonly id: string;
  readonly firstName: string;
  readonly lastName: string;
  readonly status: "ACTIVE" | "INACTIVE";
  readonly currentLevelId: number | null;
  readonly supervisorId: string | null;
}

/**
 * Combined identity record (UserAccount + Employee).
 */
export interface IdentityRecord {
  readonly userAccount: UserAccountRecord;
  readonly employee: EmployeeRecord;
}

/**
 * Password reset token record.
 */
export interface PasswordResetTokenRecord {
  readonly id: string;
  readonly userId: string;
  readonly tokenHash: string;
  readonly expiresAt: Date;
  readonly usedAt: Date | null;
}

export interface IdentityRepository {
  /**
   * Find a UserAccount by email (case-insensitive).
   * Returns null if not found.
   */
  findByEmail(email: string): Promise<IdentityRecord | null>;

  /**
   * Find a UserAccount by ID with associated Employee.
   * Returns null if not found.
   */
  findById(userId: string): Promise<IdentityRecord | null>;

  /**
   * Update lastLoginAt for a user account.
   */
  updateLastLogin(userId: string, timestamp: Date): Promise<void>;

  /**
   * Update passwordHash and mustChangePassword for a user account.
   */
  updatePassword(
    userId: string,
    passwordHash: string,
    mustChangePassword: boolean,
  ): Promise<void>;

  /**
   * Update account status.
   */
  updateStatus(userId: string, status: AccountStatus): Promise<void>;

  /**
   * Create a password reset token.
   */
  createResetToken(
    userId: string,
    tokenHash: string,
    expiresAt: Date,
  ): Promise<PasswordResetTokenRecord>;

  /**
   * Find a valid (unused, non-expired) reset token by its hash.
   */
  findValidResetToken(
    tokenHash: string,
  ): Promise<PasswordResetTokenRecord | null>;

  /**
   * Mark a reset token as used.
   */
  markResetTokenUsed(tokenId: string, usedAt: Date): Promise<void>;

  /**
   * Invalidate all active reset tokens for a user.
   * Called after a successful password reset.
   */
  invalidateAllResetTokens(userId: string): Promise<void>;
}
