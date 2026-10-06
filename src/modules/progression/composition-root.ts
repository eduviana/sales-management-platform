/**
 * Progression module composition root.
 *
 * Wires up all progression components.
 *
 * Progression derives its points and its overview from sales, visits, level
 * history and commission entries, so the composition root reuses the read
 * contracts of those modules instead of querying their tables (ADR-020,
 * module isolation).
 *
 * Must be called from server-side code only.
 *
 * Reference: system-architecture.md §6.4
 */

import { PrismaOrganizationRepository } from "@/infrastructure/organization/prisma-organization-repository";
import { PrismaCommissionEntryRepository } from "@/modules/commissions/infrastructure";
import { PrismaSaleRepository } from "@/modules/sales/infrastructure/prisma-sale-repository";
import { PrismaVisitRepository } from "@/modules/visits/infrastructure/prisma-visit-repository";
import { prisma } from "@/infrastructure/prisma/client";
import { createAuthorizationService } from "@/modules/authorization/composition-root";
import { PrismaProgressionRepository } from "./infrastructure/prisma-progression-repository";
import { GetEmployeeProgressionUseCase } from "./application/get-employee-progression-use-case";
import { CalculateProgressionUseCase } from "./application/calculate-progression-use-case";
import { GetPersonalProgressionUseCase } from "./application/get-personal-progression-use-case";
import { GetTeamProgressionUseCase } from "./application/get-team-progression-use-case";

export function createProgressionModule() {
  const authorizationService = createAuthorizationService();
  const progressionRepository = new PrismaProgressionRepository(prisma);
  const organizationRepository = new PrismaOrganizationRepository(prisma);
  const saleRepository = new PrismaSaleRepository(prisma);
  const visitRepository = new PrismaVisitRepository(prisma);
  const commissionEntryRepository = new PrismaCommissionEntryRepository(prisma);

  const getEmployeeProgression = new GetEmployeeProgressionUseCase(
    progressionRepository,
    organizationRepository,
    saleRepository,
    visitRepository,
  );

  return {
    getEmployeeProgression,
    calculateProgression: new CalculateProgressionUseCase(
      progressionRepository,
      organizationRepository,
      saleRepository,
    ),
    getPersonalProgression: new GetPersonalProgressionUseCase(
      progressionRepository,
      organizationRepository,
      saleRepository,
      visitRepository,
    ),
    getTeamProgression: new GetTeamProgressionUseCase(
      authorizationService,
      organizationRepository,
      visitRepository,
      saleRepository,
      commissionEntryRepository,
      getEmployeeProgression,
    ),
  };
}