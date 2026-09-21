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
   * TEAM scope: direct subordinates only (not all descendants).
   *
   * Reference: permissions-matrix.md §2.2, authorization.md §6
   */
  private async resolveTeam(
    context: AuthorizationContext,
  ): Promise<string[]> {
    const subordinates = await this.organizationRepo.getDirectSubordinates(
      context.employeeId,
    );
    return subordinates
      .filter((emp) => emp.status === "ACTIVE")
      .map((emp) => emp.id);
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
   * Reference: permissions-matrix.md §2.2
   */
  private async resolveGlobal(): Promise<string[]> {
    return this.organizationRepo.getActiveEmployeeIds();
  }
}
