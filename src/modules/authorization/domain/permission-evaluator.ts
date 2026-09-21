/**
 * Permission Evaluator port for Royal Prestige.
 *
 * Determines whether an authorization context possesses a given permission.
 * May also determine the maximum scope allowed for that permission.
 *
 * This is a port (interface) — the concrete implementation belongs to
 * Infrastructure. Application depends on this interface, not on the
 * implementation.
 *
 * Reference: authorization.md §7
 */

import type { AuthorizationContext } from "./authorization-context";
import type { Permission } from "./permission";
import type { ScopeType } from "./scope";

/**
 * Result of a permission evaluation.
 */
export interface PermissionEvaluationResult {
  /** Whether the permission is granted. */
  readonly granted: boolean;

  /**
   * The maximum scope allowed for this permission.
   *
   * For example, a level 3 user with `employee.read` may have
   * maxScope = TEAM, while an ADMIN with the same permission
   * may have maxScope = GLOBAL.
   *
   * Undefined when scope is not relevant for the permission
   * (e.g., `training.read` is always GLOBAL).
   */
  readonly maxScope?: ScopeType;
}

/**
 * Port for evaluating whether a user context has a specific permission.
 *
 * The implementation encodes the permission matrix logic:
 * role + level → permissions + max scope.
 *
 * Reference: permissions-matrix.md §5
 */
export interface PermissionEvaluator {
  /**
   * Evaluate whether the given context has the specified permission.
   *
   * @param context - The authorization context (built server-side).
   * @param permission - The permission to evaluate.
   * @returns The evaluation result with granted status and optional max scope.
   */
  evaluate(
    context: AuthorizationContext,
    permission: Permission,
  ): PermissionEvaluationResult;
}
