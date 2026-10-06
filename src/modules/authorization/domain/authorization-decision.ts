/**
 * Authorization decision for Royal Prestige.
 *
 * Represents the result of an authorization evaluation.
 * This is the output of the AuthorizationService.
 *
 * Reference: authorization.md §8, §9
 */

import type { Permission } from "./permission";
import { ScopeType } from "./scope";

/**
 * Result of an authorization evaluation.
 */
export interface AuthorizationDecision {
  /** Whether the operation is authorized. */
  readonly allowed: boolean;

  /**
   * The scope that was evaluated (if applicable).
   * Undefined when the decision is based solely on permission.
   */
  readonly scope?: ScopeType;

  /** The permission that was evaluated. */
  readonly permission: Permission;

  /**
   * Human-readable reason for the decision.
   * Useful for logging and debugging. Should NOT be exposed to end users.
   */
  readonly reason?: string;
}

/**
 * Create an allowed authorization decision.
 */
export function allow(
  permission: Permission,
  scope?: ScopeType,
): AuthorizationDecision {
  return {
    allowed: true,
    permission,
    scope,
    reason: scope
      ? `Permission '${permission}' granted with scope '${scope}'.`
      : `Permission '${permission}' granted.`,
  };
}

/**
 * Create a denied authorization decision.
 */
export function deny(
  permission: Permission,
  reason: string,
  scope?: ScopeType,
): AuthorizationDecision {
  return {
    allowed: false,
    permission,
    scope,
    reason: `Denied: ${reason}`,
  };
}

/**
 * Whether a decision grants access to the specific resource that was checked.
 *
 * A denied decision that carries an organization-wide scope still grants
 * access: GLOBAL means "the whole organization" (permissions-matrix.md §2.2),
 * while HierarchyScopeResolver only returns ACTIVE employees. Without this,
 * an ADMIN could neither read nor correct the record of an employee who has
 * been deactivated.
 *
 * @param decision - The authorization decision to evaluate.
 * @returns true when the resource is accessible.
 */
export function grantsResourceAccess(decision: AuthorizationDecision): boolean {
  return (
    decision.allowed ||
    decision.scope === ScopeType.GLOBAL ||
    decision.scope === ScopeType.SYSTEM
  );
}
