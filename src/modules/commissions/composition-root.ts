import { prisma } from "@/infrastructure/prisma/client";
import { createAuthorizationService } from "@/modules/authorization/composition-root";
import { PrismaOrganizationRepository } from "@/infrastructure/organization/prisma-organization-repository";
import { PrismaSaleRepository } from "@/modules/sales/infrastructure/prisma-sale-repository";
import { PrismaAuditAdapter } from "@/modules/audit/infrastructure/prisma-audit-adapter";
import { PrismaCommissionEntryRepository } from "./infrastructure/prisma-commission-entry-repository";
import { PrismaCommissionRuleRepository } from "./infrastructure/prisma-commission-rule-repository";
import {
  CreateCommissionRuleVersionUseCase,
  GetCommissionEntryLabelsUseCase,
  GetCommissionRuleLabelsUseCase,
  GenerateCommissionForApprovedSaleUseCase,
  GetApplicableCommissionRuleUseCase,
  GetCommissionEntriesForSaleUseCase,
  GetMonthlyCommissionOverviewUseCase,
  GetSaleCommissionAmountsUseCase,
  ReverseCommissionForCancelledSaleUseCase,
} from "./application";

export function createCommissionUseCases() {
  const authorizationService = createAuthorizationService();
  /** Employee hierarchy: commission rules need the employee's level (context port) and the monthly overview resolves the scope (repository). */
  const organizationRepository = new PrismaOrganizationRepository(prisma);
  const ruleRepository = new PrismaCommissionRuleRepository(prisma);
  const entryRepository = new PrismaCommissionEntryRepository(prisma);
  const auditPort = new PrismaAuditAdapter(prisma);
  const saleRepository = new PrismaSaleRepository(prisma);

  return {
    ruleRepository,
    entryRepository,
    createRuleVersion: new CreateCommissionRuleVersionUseCase(
      authorizationService,
      ruleRepository,
      auditPort,
    ),
    getApplicableRule: new GetApplicableCommissionRuleUseCase(
      authorizationService,
      ruleRepository,
    ),
    generateForApprovedSale: new GenerateCommissionForApprovedSaleUseCase(
      organizationRepository,
      ruleRepository,
      entryRepository,
    ),
    reverseForCancelledSale: new ReverseCommissionForCancelledSaleUseCase(
      entryRepository,
    ),
    getForSale: new GetCommissionEntriesForSaleUseCase(
      authorizationService,
      entryRepository,
    ),
    getSaleAmounts: new GetSaleCommissionAmountsUseCase(entryRepository),
    getMonthlyOverview: new GetMonthlyCommissionOverviewUseCase(
      authorizationService,
      organizationRepository,
      saleRepository,
      entryRepository,
    ),
    getEntryLabels: new GetCommissionEntryLabelsUseCase(
      entryRepository,
      saleRepository,
    ),
    getRuleLabels: new GetCommissionRuleLabelsUseCase(ruleRepository),
  };
}
