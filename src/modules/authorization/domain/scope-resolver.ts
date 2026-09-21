/**
 * Scope Resolver port for Royal Prestige.
 *
 * Determines the set of resources (employee IDs) that a user can access
 * for a given scope type. This is the mechanism that translates abstract
 * scopes (OWN, TEAM, BRANCH, GLOBAL) into concrete resource sets.
 *
 * For scope resolution, "resources" are employee IDs — the organizational
 * hierarchy determines which employees are accessible.
 *
 * This is a port (interface). The concrete implementation belongs to
 * Infrastructure and reuses the Organization hierarchy queries.
 *
 * Reference: authorization.md §6, §7
 */

import type { AuthorizationContext } from "./authorization-context";
import type { ScopeType } from "./scope";

/**
 * Port for resolving the set of accessible resource IDs for a given scope.
 *
 * The implementation delegates to Organization hierarchy queries
 * (getDirectSubordinates, getDescendantIds) to resolve TEAM and BRANCH.
 *
 * Reference: ADR-004, ADR-009
 */
export interface ScopeResolver {
  /**
   * Resolve the set of employee IDs accessible for the given context and scope.
   *
   * - OWN: returns [context.employeeId] (the user themselves).
   * - TEAM: returns direct subordinates of the user.
   * - BRANCH: returns the user + all descendants (recursive).
   * - GLOBAL: returns all active employees.
   * - SYSTEM: returns empty array (system config has no employee scope).
   *
   * @param context - The authorization context.
   * @param scopeType - The scope to resolve.
   * @returns Array of employee IDs that are accessible. Never includes
   *   inactive employees.
   */
  resolveScope(context: AuthorizationContext, scopeType: ScopeType): Promise<string[]>;
}
