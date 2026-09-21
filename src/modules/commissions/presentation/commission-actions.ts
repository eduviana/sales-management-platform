"use server";

import { prisma } from "@/infrastructure/prisma/client";
import { PrismaOrganizationRepository } from "@/infrastructure/organization/prisma-organization-repository";
import { createAuthorizationService } from "@/modules/authorization/composition-root";
import { createCommissionUseCases } from "@/modules/commissions/composition-root";
import { resolveAuthContext } from "@/modules/sales/presentation/resolve-auth-context";

export async function createCommissionRuleVersion(input: {
  levelId: number;
  percentage: number;
  effectiveFrom: Date;
  effectiveTo?: Date | null;
}) {
  const authContext = await resolveAuthContext();
  const authorization = createAuthorizationService(prisma);
  const organizationRepository = new PrismaOrganizationRepository(prisma);
  const useCases = createCommissionUseCases(
    prisma,
    authorization,
    organizationRepository,
  );

  return useCases.createRuleVersion.execute({
    ...input,
    authContext,
  });
}
