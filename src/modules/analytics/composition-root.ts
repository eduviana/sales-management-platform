/**
 * Analytics module composition root.
 *
 * Wires together all analytics and dashboard components:
 * - PrismaAnalyticsRepository (Infrastructure)
 * - AuthorizationService
 * - OrganizationRepository
 * - GetDashboardDataUseCase (Application)
 *
 * Reference: system-architecture.md §6.4
 */

import type { PrismaClient } from "@prisma/client";
import type { AuthorizationService } from "@/modules/authorization/domain";
import type { OrganizationRepository } from "@/modules/organization/domain";
import { PrismaOrganizationRepository } from "@/infrastructure/organization/prisma-organization-repository";
import { PrismaAnalyticsRepository } from "./infrastructure";
import { GetDashboardDataUseCase } from "./application";
import { GetTeamPerformanceUseCase } from "./application";

/**
 * Create all analytics use cases with dependencies wired.
 */
export function createAnalyticsUseCases(
  prisma: PrismaClient,
  authorizationService: AuthorizationService,
  organizationRepository?: OrganizationRepository,
) {
  const orgRepo = organizationRepository ?? new PrismaOrganizationRepository(prisma);
  const analyticsRepository = new PrismaAnalyticsRepository(prisma);

  return {
    getDashboardData: new GetDashboardDataUseCase(
      authorizationService,
      orgRepo,
      analyticsRepository,
    ),
    getTeamPerformance: new GetTeamPerformanceUseCase(
      authorizationService,
      analyticsRepository,
    ),
  };
}
