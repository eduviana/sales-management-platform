/**
 * Prisma implementation of IdentityRepository.
 *
 * Handles all identity-related persistence operations using Prisma.
 * This is a server-only module — never import from Client Components.
 *
 * Reference: ADR-008, data-architecture.md §7
 */

import type { PrismaClient } from "@prisma/client";
import type {
  IdentityRepository,
  IdentityRecord,
  PasswordResetTokenRecord,
} from "@/modules/identity/domain";
import type { AccountStatus } from "@/modules/identity/domain";

export class PrismaIdentityRepository implements IdentityRepository {
  constructor(private readonly prisma: PrismaClient) {}

  async findAccountEmailsByIds(
    userIds: readonly string[],
  ): Promise<Array<{ readonly id: string; readonly email: string | null }>> {
    if (userIds.length === 0) return [];
    const rows = await this.prisma.userAccount.findMany({
      where: { id: { in: [...userIds] } },
      select: { id: true, email: true },
    });
    return rows.map((row) => ({ id: row.id, email: row.email }));
  }

  async findByEmail(email: string): Promise<IdentityRecord | null> {
    const account = await this.prisma.userAccount.findFirst({
      where: { email: { equals: email, mode: "insensitive" } },
      include: { employee: true },
    });

    if (!account) return null;

    return this.mapToIdentityRecord(account);
  }

  async findById(userId: string): Promise<IdentityRecord | null> {
    const account = await this.prisma.userAccount.findUnique({
      where: { id: userId },
      include: { employee: true },
    });

    if (!account) return null;

    return this.mapToIdentityRecord(account);
  }

  async updateLastLogin(userId: string, timestamp: Date): Promise<void> {
    await this.prisma.userAccount.update({
      where: { id: userId },
      data: { lastLoginAt: timestamp },
    });
  }

  async updatePassword(
    userId: string,
    passwordHash: string,
    mustChangePassword: boolean,
  ): Promise<void> {
    await this.prisma.userAccount.update({
      where: { id: userId },
      data: { passwordHash, mustChangePassword },
    });
  }

  async updateStatus(userId: string, status: AccountStatus): Promise<void> {
    await this.prisma.userAccount.update({
      where: { id: userId },
      data: { status },
    });
  }

  async createResetToken(
    userId: string,
    tokenHash: string,
    expiresAt: Date,
  ): Promise<PasswordResetTokenRecord> {
    const token = await this.prisma.passwordResetToken.create({
      data: { userId, tokenHash, expiresAt },
    });

    return {
      id: token.id,
      userId: token.userId,
      tokenHash: token.tokenHash,
      expiresAt: token.expiresAt,
      usedAt: token.usedAt,
    };
  }

  async findValidResetToken(
    tokenHash: string,
  ): Promise<PasswordResetTokenRecord | null> {
    const token = await this.prisma.passwordResetToken.findFirst({
      where: {
        tokenHash,
        usedAt: null,
        expiresAt: { gt: new Date() },
      },
    });

    if (!token) return null;

    return {
      id: token.id,
      userId: token.userId,
      tokenHash: token.tokenHash,
      expiresAt: token.expiresAt,
      usedAt: token.usedAt,
    };
  }

  async markResetTokenUsed(tokenId: string, usedAt: Date): Promise<void> {
    await this.prisma.passwordResetToken.update({
      where: { id: tokenId },
      data: { usedAt },
    });
  }

  async invalidateAllResetTokens(userId: string): Promise<void> {
    await this.prisma.passwordResetToken.updateMany({
      where: { userId, usedAt: null },
      data: { usedAt: new Date() },
    });
  }

  // ---------------------------------------------------------------------------
  // Private helpers
  // ---------------------------------------------------------------------------

  private mapToIdentityRecord(
    account: {
      id: string;
      employeeId: string;
      email: string;
      passwordHash: string;
      status: "ACTIVE" | "SUSPENDED" | "LOCKED";
      mustChangePassword: boolean;
      lastLoginAt: Date | null;
      employee: {
        id: string;
        firstName: string;
        lastName: string;
        status: "ACTIVE" | "INACTIVE";
        currentLevelId: number | null;
        supervisorId: string | null;
      };
    },
  ): IdentityRecord {
    return {
      userAccount: {
        id: account.id,
        employeeId: account.employeeId,
        email: account.email,
        passwordHash: account.passwordHash,
        status: account.status,
        mustChangePassword: account.mustChangePassword,
        lastLoginAt: account.lastLoginAt,
      },
      employee: {
        id: account.employee.id,
        firstName: account.employee.firstName,
        lastName: account.employee.lastName,
        status: account.employee.status,
        currentLevelId: account.employee.currentLevelId,
        supervisorId: account.employee.supervisorId,
      },
    };
  }
}
