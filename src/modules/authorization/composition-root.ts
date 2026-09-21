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

import type { PrismaClient } from "@prisma/client";
import type { AuthorizationService } from "@/modules/authorization/domain";
import { AuthorizationServiceImpl } from "@/modules/authorization/application";
import { RoleBasedPermissionEvaluator } from "@/modules/authorization/infrastructure";
import { HierarchyScopeResolver } from "@/modules/authorization/infrastructure";
import { PrismaOrganizationRepository } from "@/infrastructure/organization/prisma-organization-repository";

/**
 * Create the authorization service with all dependencies wired.
 *
 * @param prisma - The Prisma client instance.
 * @returns The configured AuthorizationService.
 */
export function createAuthorizationService(
  prisma: PrismaClient,
): AuthorizationService {
  const organizationRepo = new PrismaOrganizationRepository(prisma);
  const permissionEvaluator = new RoleBasedPermissionEvaluator();
  const scopeResolver = new HierarchyScopeResolver(organizationRepo);

  return new AuthorizationServiceImpl(permissionEvaluator, scopeResolver);
}
