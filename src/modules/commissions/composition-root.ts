import type { PrismaClient } from "@prisma/client";
import type { AuthorizationService } from "@/modules/authorization/domain";
import type { EmployeeCommissionContextPort } from "@/modules/organization/domain";
import { PrismaAuditAdapter } from "@/modules/audit/infrastructure/prisma-audit-adapter";
import { PrismaCommissionEntryRepository } from "./infrastructure/prisma-commission-entry-repository";
import { PrismaCommissionRuleRepository } from "./infrastructure/prisma-commission-rule-repository";
import {
  CreateCommissionRuleVersionUseCase,
  GenerateCommissionForApprovedSaleUseCase,
  GetApplicableCommissionRuleUseCase,
  GetCommissionEntriesForSaleUseCase,
  ReverseCommissionForCancelledSaleUseCase,
} from "./application";

export function createCommissionUseCases(
  prisma: PrismaClient,
  authorizationService: AuthorizationService,
  organizationRepository: EmployeeCommissionContextPort,
) {
  const ruleRepository = new PrismaCommissionRuleRepository(prisma);
  const entryRepository = new PrismaCommissionEntryRepository(prisma);
  const auditPort = new PrismaAuditAdapter(prisma);

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
  };
}
