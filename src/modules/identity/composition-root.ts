/**
 * Composition root for the Identity module.
 *
 * Wires up all dependencies: ports, adapters, and use cases.
 * This is the only place that knows about concrete implementations.
 *
 * Must be called from server-side code only.
 */

import { cookies } from "next/headers";
import { prisma } from "@/infrastructure/prisma/client";
import { env } from "@/infrastructure/config/env";
import { BcryptPasswordAdapter } from "@/infrastructure/auth/bcrypt-password-adapter";
import { CryptoTokenAdapter } from "@/infrastructure/auth/crypto-token-adapter";
import { createSessionAdapter } from "@/infrastructure/auth/iron-session-adapter";
import { ConsolePasswordResetNotifier } from "@/infrastructure/auth/console-password-reset-notifier";
import { PrismaIdentityRepository } from "@/infrastructure/auth/prisma-identity-repository";
import { PrismaAuditAdapter } from "@/modules/audit/infrastructure/prisma-audit-adapter";
import { LoginUseCase } from "./application/login-use-case";
import { LogoutUseCase } from "./application/logout-use-case";
import { ChangePasswordUseCase } from "./application/change-password-use-case";
import { RequestPasswordResetUseCase } from "./application/request-password-reset-use-case";
import { ResetPasswordUseCase } from "./application/reset-password-use-case";
import { ResolveIdentityUseCase } from "./application/resolve-identity-use-case";

/**
 * Create all Identity module dependencies and return use cases.
 *
 * Each call creates fresh adapter instances scoped to the current request.
 * This avoids cross-request contamination and works correctly with
 * Next.js App Router's server component model.
 */
export async function createIdentityModule() {
  const cookieStore = await cookies();

  // Infrastructure adapters
  const passwordService = new BcryptPasswordAdapter();
  const tokenService = new CryptoTokenAdapter();
  const sessionPort = createSessionAdapter(cookieStore);
  const identityRepository = new PrismaIdentityRepository(prisma);
  const passwordResetNotifier = new ConsolePasswordResetNotifier(env.APP_URL);
  const auditPort = new PrismaAuditAdapter(prisma);

  // Use cases
  const loginUseCase = new LoginUseCase(
    identityRepository,
    passwordService,
    sessionPort,
    auditPort,
  );

  const logoutUseCase = new LogoutUseCase(sessionPort, auditPort);

  const changePasswordUseCase = new ChangePasswordUseCase(
    identityRepository,
    passwordService,
    auditPort,
  );

  const requestPasswordResetUseCase = new RequestPasswordResetUseCase(
    identityRepository,
    tokenService,
    passwordResetNotifier,
    auditPort,
  );

  const resetPasswordUseCase = new ResetPasswordUseCase(
    identityRepository,
    passwordService,
    tokenService,
    auditPort,
  );

  const resolveIdentityUseCase = new ResolveIdentityUseCase(
    sessionPort,
    identityRepository,
  );

  return {
    loginUseCase,
    logoutUseCase,
    changePasswordUseCase,
    requestPasswordResetUseCase,
    resetPasswordUseCase,
    resolveIdentityUseCase,
    sessionPort,
  };
}
