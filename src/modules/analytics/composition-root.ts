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

import { prisma } from "@/infrastructure/prisma/client";
import { createAuthorizationService } from "@/modules/authorization/composition-root";
import { PrismaOrganizationRepository } from "@/infrastructure/organization/prisma-organization-repository";
import { PrismaAuditEventRepository } from "@/modules/audit/infrastructure/prisma-audit-event-repository";
import { PrismaAnalyticsRepository } from "./infrastructure";
import { GetDashboardDataUseCase } from "./application";
import { GetTeamPerformanceUseCase } from "./application";
import { GetSystemOverviewUseCase } from "./application";

/**
 * Create all analytics use cases with dependencies wired.
 */
export function createAnalyticsUseCases() {
  const authorizationService = createAuthorizationService();
  const orgRepo = new PrismaOrganizationRepository(prisma);
  const auditRepo = new PrismaAuditEventRepository(prisma);
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
    getSystemOverview: new GetSystemOverviewUseCase(
      authorizationService,
      orgRepo,
      analyticsRepository,
      analyticsRepository,
      auditRepo,
    ),
  };
}
