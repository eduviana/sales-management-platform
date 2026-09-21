/**
 * Shared helper to resolve auth context for Presentation layer.
 *
 * Resolves the current user's identity from session and builds
 * the AuthorizationContext needed by use cases.
 *
 * Must be called from server-side code only (Server Actions, Server Components).
 *
 * Reference: authorization.md §4, system-architecture.md §11
 */

import { createIdentityModule } from "@/modules/identity/composition-root";
import { AuthenticationError } from "@/shared/errors";
import type { AuthorizationContext } from "@/modules/authorization/domain";

/**
 * Resolve the current authenticated user's authorization context.
 *
 * @returns The AuthorizationContext for the current user.
 * @throws AuthenticationError if no valid session exists.
 */
export async function resolveAuthContext(): Promise<AuthorizationContext> {
  const { resolveIdentityUseCase } = await createIdentityModule();
  const identity = await resolveIdentityUseCase.execute();

  if (!identity) {
    throw new AuthenticationError();
  }

  return {
    userId: identity.userAccount.id,
    employeeId: identity.employee.id,
    levelId: identity.employee.currentLevelId,
    role: identity.employee.currentLevelId === null ? "ADMIN" : "SELLER",
    supervisorId: identity.employee.supervisorId,
    userEmail: identity.userAccount.email,
  };
}
