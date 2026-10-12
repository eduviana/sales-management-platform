/**
 * Hierarchy-based Scope Resolver implementation.
 *
 * Resolves scopes by delegating to the Organization hierarchy queries.
 * Reuses the existing OrganizationRepository port for hierarchy traversal.
 *
 * Reference: authorization.md §6, ADR-004, ADR-009
 */

import type {
  AuthorizationContext,
  ScopeResolver,
} from "@/modules/authorization/domain";
import { ScopeType } from "@/modules/authorization/domain";
import type { OrganizationRepository } from "@/modules/organization/domain";

export class HierarchyScopeResolver implements ScopeResolver {
  constructor(private readonly organizationRepo: OrganizationRepository) {}

  async resolveScope(
    context: AuthorizationContext,
    scopeType: ScopeType,
  ): Promise<string[]> {
    switch (scopeType) {
      case ScopeType.OWN:
        return this.resolveOwn(context);

      case ScopeType.TEAM:
        return this.resolveTeam(context);

      case ScopeType.BRANCH:
        return this.resolveBranch(context);

      case ScopeType.GLOBAL:
        return this.resolveGlobal();

      case ScopeType.SYSTEM:
        return [];
    }
  }

  /**
   * OWN scope: the user themselves.
   */
  private async resolveOwn(context: AuthorizationContext): Promise<string[]> {
    return [context.employeeId];
  }

  /**
   * TEAM scope: the actor + direct subordinates (not all descendants).
   *
   * The actor is always included — consistent with BRANCH and GLOBAL, and
   * with `ListSalesUseCase`'s own TEAM resolution. Excluding the actor would
   * deny N3+ users access to their own resources on any TEAM-scoped
   * permission (e.g. `sale.readTeam` on their own sale).
   *
   * Note: inactive subordinates are excluded. When a decision must cover them,
   * `grantsResourceAccess` treats an organization-wide scope as sufficient.
   *
   * Reference: permissions-matrix.md §2.2, authorization.md §6
   */
  private async resolveTeam(
    context: AuthorizationContext,
  ): Promise<string[]> {
    const subordinates = await this.organizationRepo.getDirectSubordinates(
      context.employeeId,
    );
    return [
      context.employeeId,
      ...subordinates
        .filter((emp) => emp.status === "ACTIVE")
        .map((emp) => emp.id),
    ];
  }

  /**
   * BRANCH scope: the actor + all descendants (recursive).
   *
   * Reference: permissions-matrix.md §2.2, authorization.md §6
   */
  private async resolveBranch(
    context: AuthorizationContext,
  ): Promise<string[]> {
    const descendantIds = await this.organizationRepo.getDescendantIds(
      context.employeeId,
    );
    // Include the actor themselves in BRANCH scope
    return [context.employeeId, ...descendantIds];
  }

  /**
   * GLOBAL scope: all active employees in the organization.
   *
   * Note: inactive employees are excluded, so an organization-wide decision
   * may deny an inactive record; `grantsResourceAccess` covers that case.
   *
   * Reference: permissions-matrix.md §2.2
   */
  private async resolveGlobal(): Promise<string[]> {
    return this.organizationRepo.getActiveEmployeeIds();
  }
}
