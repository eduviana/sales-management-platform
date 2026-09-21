/**
 * Resource Authorization Policy port for Royal Prestige.
 *
 * Provides fine-grained authorization checks for specific resources.
 * This is used when scope alone is not sufficient to determine access.
 *
 * For example:
 * - A seller can read sales within their scope, but can only UPDATE their own.
 * - A supervisor can read team sales, but can only APPROVE sales in their branch.
 *
 * Most operations do NOT need a resource policy — scope alone is sufficient.
 * This port is optional and used only for operations that require additional
 * resource-level validation.
 *
 * Reference: authorization.md §9
 */

import type { AuthorizationContext } from "./authorization-context";
import type { Permission } from "./permission";

/**
 * Resource types that may require fine-grained authorization.
 */
export type ResourceType =
  | "employee"
  | "sale"
  | "team"
  | "commission"
  | "training"
  | "audit"
  | "goal";

/**
 * Port for fine-grained resource-level authorization.
 *
 * The implementation contains business rules specific to each resource type.
 * When no policy is registered for a resource type, scope alone determines
 * access.
 */
export interface ResourceAuthorizationPolicy {
  /**
   * Check whether the context can access a specific resource for the given permission.
   *
   * @param context - The authorization context.
   * @param permission - The permission being checked.
   * @param resourceType - The type of resource.
   * @param resourceId - The ID of the specific resource.
   * @param ownerId - The owner/employee ID associated with the resource (if applicable).
   * @returns true if access is allowed, false otherwise.
   */
  checkResourceAccess(
    context: AuthorizationContext,
    permission: Permission,
    resourceType: ResourceType,
    resourceId: string,
    ownerId?: string,
  ): boolean;
}
