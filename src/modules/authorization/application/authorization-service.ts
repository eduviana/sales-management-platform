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
  ResourceType,
  ScopeResolver,
} from "@/modules/authorization/domain";
import { allow, deny, ScopeType } from "@/modules/authorization/domain";
import type { AuditPort } from "@/shared/ports/audit-port";
import { AuditAction } from "@/shared/ports/audit-port";

export class AuthorizationServiceImpl implements AuthorizationService {
  constructor(
    private readonly permissionEvaluator: PermissionEvaluator,
    private readonly scopeResolver: ScopeResolver,
    private readonly resourcePolicy?: ResourceAuthorizationPolicy,
    private readonly auditPort?: AuditPort,
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
      return this.denied(
        context,
        request,
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
      return this.denied(
        context,
        request,
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
        return this.denied(
          context,
          request,
          `Resource policy denied access to '${request.resource.id}' of type '${request.resource.type}'.`,
          scopeType,
        );
      }
    }

    // 6. All checks passed
    return allow(request.permission, scopeType);
  }

  /**
   * Records the denial as an audit event and returns the denied decision.
   *
   * Every denial funnels through here, so the audit trail satisfies ADR-020
   * decision 6 ("toda denegación de autorización se registra"). The write is
   * best-effort: a failing audit port must never break the decision itself.
   *
   * Reference: ADR-013, ADR-020 decision 6, authorization.md §15
   */
  private async denied(
    context: AuthorizationContext,
    request: AuthorizationRequest,
    reason: string,
    scope?: ScopeType,
  ): Promise<AuthorizationDecision> {
    if (this.auditPort) {
      try {
        await this.auditPort.log({
          // `audit_event.actorId` is a FK to `user_account.id`; the actor is
          // identified by the account (`context.userId`), never by the
          // employee id.
          actorId: context.userId,
          actorEmail: context.userEmail,
          action: AuditAction.AUTHORIZATION_DENIED,
          resourceType: request.resource
            ? capitalizeResourceType(request.resource.type)
            : "Authorization",
          resourceId: request.resource?.id ?? null,
          result: "DENIED",
          correlationId: null,
          metadata: {
            permission: request.permission,
            reason,
            ...(scope ? { scope } : {}),
          },
          timestamp: new Date(),
        });
      } catch {
        // Best-effort: audit failures must never propagate.
      }
    }

    return deny(request.permission, reason, scope);
  }
}

/** Maps a `ResourceType` ("employee") to the audit event label ("Employee"). */
function capitalizeResourceType(type: ResourceType): string {
  return type.charAt(0).toUpperCase() + type.slice(1);
}
