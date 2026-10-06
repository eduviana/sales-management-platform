/**
 * Authorization module composition root.
 *
 * Wires together the authorization components:
 * - PermissionEvaluator (RoleBasedPermissionEvaluator)
 * - ScopeResolver (HierarchyScopeResolver)
 * - AuthorizationService (AuthorizationServiceImpl)
 *
 * Reference: system-architecture.md §6.4
 */

import { prisma } from "@/infrastructure/prisma/client";
import type { AuthorizationService } from "@/modules/authorization/domain";
import { AuthorizationServiceImpl } from "@/modules/authorization/application";
import { RoleBasedPermissionEvaluator } from "@/modules/authorization/infrastructure";
import { HierarchyScopeResolver } from "@/modules/authorization/infrastructure";
import { PrismaOrganizationRepository } from "@/infrastructure/organization/prisma-organization-repository";
import { PrismaAuditAdapter } from "@/modules/audit/infrastructure/prisma-audit-adapter";

/**
 * Create the authorization service with all dependencies wired.
 *
 * Takes no infrastructure arguments: like every composition root it resolves
 * the Prisma client internally, so Server Actions and pages never assemble
 * this graph themselves (ADR-020, points 2 and 3).
 *
 * The audit port is wired here so every denial is recorded (ADR-020,
 * decision 6). No cycle is created: this root depends on the audit module's
 * infrastructure, never on its composition root.
 *
 * @returns The configured AuthorizationService.
 */
export function createAuthorizationService(): AuthorizationService {
  const organizationRepo = new PrismaOrganizationRepository(prisma);
  const permissionEvaluator = new RoleBasedPermissionEvaluator();
  const scopeResolver = new HierarchyScopeResolver(organizationRepo);
  const auditPort = new PrismaAuditAdapter(prisma);

  return new AuthorizationServiceImpl(
    permissionEvaluator,
    scopeResolver,
    undefined, // no resource policy is registered; scope already covers access
    auditPort,
  );
}
