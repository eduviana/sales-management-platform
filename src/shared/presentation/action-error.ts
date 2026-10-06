/**
 * Safe error message mapping for Server Actions.
 *
 * Server Actions must not expose raw/internal error messages (Prisma,
 * infrastructure, unexpected exceptions) to the client. Only errors that are
 * intentionally user-facing are surfaced:
 *
 * - AuthorizationError / AuthenticationError → generic "not authorized".
 * - Any DomainError (Validation, DomainRule, Conflict, NotFound) → its message.
 * - Anything else → a generic fallback, logged server-side.
 *
 * Reference: system-architecture.md §7 (error handling), ADR-020
 */

import {
  AuthenticationError,
  AuthorizationError,
  DomainError,
} from "@/shared/errors";

export const GENERIC_ACTION_ERROR =
  "Ocurrió un error. Intentá nuevamente.";

export function toActionErrorMessage(
  error: unknown,
  fallback: string = GENERIC_ACTION_ERROR,
): string {
  if (error instanceof AuthorizationError || error instanceof AuthenticationError) {
    return "No autorizado.";
  }

  if (error instanceof DomainError) {
    return error.message;
  }

  console.error("[server-action] Unexpected error:", error);
  return fallback;
}
