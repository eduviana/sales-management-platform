/**
 * Authorization Service port for Royal Prestige.
 *
 * Orchestrates the evaluation of authorization for protected operations.
 * This is the primary entry point for all authorization decisions.
 *
 * The service coordinates:
 * 1. Permission evaluation (does the user have the permission?)
 * 2. Scope resolution (what resources can the user access?)
 * 3. Resource access check (is this specific resource within scope?)
 *
 * Reference: authorization.md §7, §8
 */

import type { AuthorizationContext } from "./authorization-context";
import type { AuthorizationDecision } from "./authorization-decision";
import type { Permission } from "./permission";
import type { ResourceType } from "./resource-authorization-policy";

/**
 * Input for an authorization check.
 */
export interface AuthorizationRequest {
  /** The permission to check. */
  readonly permission: Permission;

  /**
   * The specific resource to check (optional).
   * When provided, the service performs fine-grained resource validation.
   */
  readonly resource?: {
    readonly type: ResourceType;
    readonly id: string;
    /** The employee ID that owns/is associated with the resource. */
    readonly ownerId?: string;
  };
}

/**
 * Port for the central authorization service.
 *
 * Application layer invokes this before every protected use case.
 * The service delegates to PermissionEvaluator, ScopeResolver,
 * and ResourceAuthorizationPolicy.
 *
 * Reference: authorization.md §7
 */
export interface AuthorizationService {
  /**
   * Authorize a protected operation.
   *
   * Flow:
   * 1. Evaluate permission → granted? scope?
   * 2. If resource provided: resolve scope → check resource ownership
   * 3. Return decision
   *
   * @param context - The authorization context (built server-side).
   * @param request - The authorization request.
   * @returns The authorization decision.
   */
  authorize(
    context: AuthorizationContext,
    request: AuthorizationRequest,
  ): Promise<AuthorizationDecision>;
}
