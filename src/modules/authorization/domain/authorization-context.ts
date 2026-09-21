/**
 * Authorization context for Royal Prestige.
 *
 * Represents the authenticated user's authorization-relevant attributes.
 * This context is built server-side from the AuthenticatedIdentity
 * and should never be constructed from client-provided data.
 *
 * Reference: authorization.md §4
 */

/**
 * The role of the user within the system.
 *
 * "SELLER" represents any of the 7 commercial levels (N1-N7).
 * "ADMIN" is an independent administrative role (not N8).
 */
export type AuthorizationRole = "SELLER" | "ADMIN";

/**
 * Context used for authorization decisions.
 *
 * Built server-side from AuthenticatedIdentity. Contains only the
 * attributes needed to evaluate permissions and scopes.
 */
export interface AuthorizationContext {
  /** The UserAccount ID (for audit trail). */
  readonly userId: string;

  /** The Employee ID (for scope resolution). */
  readonly employeeId: string;

  /**
   * The commercial level (1-7) or null for ADMIN.
   * ADMIN users do not have a commercial level.
   */
  readonly levelId: number | null;

  /** The role: SELLER (any commercial level) or ADMIN. */
  readonly role: AuthorizationRole;

  /** The supervisor ID, used for TEAM scope resolution. */
  readonly supervisorId: string | null;

  /** Historical snapshot of the user's email at event time. */
  readonly userEmail: string;
}
