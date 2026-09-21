/**
 * Authorization Service implementation.
 *
 * Orchestrates authorization for protected operations by coordinating
 * PermissionEvaluator, ScopeResolver, and ResourceAuthorizationPolicy.
 *
 * This is the concrete implementation of the AuthorizationService port.
 * It lives in the Application layer and depends only on domain ports.
 *
 * Reference: authorization.md §7, §8
 */

import type {
  AuthorizationContext,
  AuthorizationDecision,
  AuthorizationRequest,
  AuthorizationService,
  PermissionEvaluator,
  ResourceAuthorizationPolicy,
  ScopeResolver,
} from "@/modules/authorization/domain";
import { allow, deny, ScopeType } from "@/modules/authorization/domain";

export class AuthorizationServiceImpl implements AuthorizationService {
  constructor(
    private readonly permissionEvaluator: PermissionEvaluator,
    private readonly scopeResolver: ScopeResolver,
    private readonly resourcePolicy?: ResourceAuthorizationPolicy,
  ) {}

  async authorize(
    context: AuthorizationContext,
    request: AuthorizationRequest,
  ): Promise<AuthorizationDecision> {
    // 1. Evaluate permission
    const permResult = this.permissionEvaluator.evaluate(
      context,
      request.permission,
    );

    if (!permResult.granted) {
      return deny(
        request.permission,
        `User does not have permission '${request.permission}'.`,
      );
    }

    // 2. If no resource to check, permission alone decides
    if (!request.resource) {
      return allow(request.permission, permResult.maxScope);
    }

    // 3. Resolve scope to determine accessible resources
    const scopeType = permResult.maxScope ?? ScopeType.OWN;
    const accessibleEmployeeIds = await this.scopeResolver.resolveScope(
      context,
      scopeType,
    );

    // 4. Check if the resource owner is within the resolved scope
    const resourceOwnerId = request.resource.ownerId ?? request.resource.id;
    const isWithinScope = accessibleEmployeeIds.includes(resourceOwnerId);

    if (!isWithinScope) {
      return deny(
        request.permission,
        `Resource '${request.resource.id}' (owner: ${resourceOwnerId}) is outside the authorized scope '${scopeType}'.`,
        scopeType,
      );
    }

    // 5. Fine-grained resource policy check (if registered)
    if (this.resourcePolicy) {
      const resourceAllowed = this.resourcePolicy.checkResourceAccess(
        context,
        request.permission,
        request.resource.type,
        request.resource.id,
        request.resource.ownerId,
      );

      if (!resourceAllowed) {
        return deny(
          request.permission,
          `Resource policy denied access to '${request.resource.id}' of type '${request.resource.type}'.`,
          scopeType,
        );
      }
    }

    // 6. All checks passed
    return allow(request.permission, scopeType);
  }
}
