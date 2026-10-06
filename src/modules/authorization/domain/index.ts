/**
 * Authorization domain barrel exports.
 *
 * All types, interfaces, and functions exported from this module
 * are pure domain concepts with no framework or persistence dependencies.
 *
 * Reference: system-architecture.md §6
 */

// Types
export type { Permission } from "./permission";
export { PERMISSION_GROUPS } from "./permission";

export { ScopeType, isScopeBroaden } from "./scope";

export type { AuthorizationRole } from "./authorization-context";
export type { AuthorizationContext } from "./authorization-context";

export type { AuthorizationDecision } from "./authorization-decision";
export { allow, deny, grantsResourceAccess } from "./authorization-decision";

// Ports (interfaces)
export type { PermissionEvaluationResult } from "./permission-evaluator";
export type { PermissionEvaluator } from "./permission-evaluator";

export type { ScopeResolver } from "./scope-resolver";

export type { ResourceType } from "./resource-authorization-policy";
export type { ResourceAuthorizationPolicy } from "./resource-authorization-policy";

export type { AuthorizationRequest } from "./authorization-service";
export type { AuthorizationService } from "./authorization-service";
