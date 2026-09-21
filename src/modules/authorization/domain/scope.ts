/**
 * Scope types for Royal Prestige.
 *
 * Scopes determine the set of resources over which a permission applies.
 * Scope and Permission are independent dimensions — the same permission
 * may have different scopes depending on the user's level and role.
 *
 * Reference: authorization.md §5, permissions-matrix.md §2.2
 */

/**
 * Scope types representing the breadth of resource access.
 *
 * - OWN: Resources belonging to the current user only.
 * - TEAM: Direct subordinates (not all descendants).
 * - BRANCH: The actor + all descendants in the hierarchy.
 * - GLOBAL: All resources across the organization.
 * - SYSTEM: System-wide configuration, independent of hierarchy.
 */
export enum ScopeType {
  /** Resources belonging to the current user. */
  OWN = "OWN",

  /**
   * Direct subordinates of the current user.
   * NOT all descendants — only direct reports.
   */
  TEAM = "TEAM",

  /**
   * The actor + all descendants in the hierarchy.
   * Resolved via recursive query.
   */
  BRANCH = "BRANCH",

  /** All resources in the organization. */
  GLOBAL = "GLOBAL",

  /** System-wide configuration, independent of hierarchy. */
  SYSTEM = "SYSTEM",
}

/**
 * Check if a scope type is broader than another.
 *
 * Ordering: OWN < TEAM < BRANCH < GLOBAL < SYSTEM
 */
export function isScopeBroaden(
  scope: ScopeType,
  threshold: ScopeType,
): boolean {
  const order: ScopeType[] = [
    ScopeType.OWN,
    ScopeType.TEAM,
    ScopeType.BRANCH,
    ScopeType.GLOBAL,
    ScopeType.SYSTEM,
  ];
  return order.indexOf(scope) >= order.indexOf(threshold);
}
