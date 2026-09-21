import type { PrismaClient } from "@prisma/client";
import type {
  SaleCommissionTransactionContext,
  SaleCommissionTransactionPort,
} from "@/modules/sales/application/sale-commission-transaction-port";
import { PrismaSaleRepository } from "@/modules/sales/infrastructure/prisma-sale-repository";
import { PrismaOrganizationRepository } from "@/infrastructure/organization/prisma-organization-repository";
import { PrismaCommissionEntryRepository } from "@/modules/commissions/infrastructure/prisma-commission-entry-repository";
import { PrismaCommissionRuleRepository } from "@/modules/commissions/infrastructure/prisma-commission-rule-repository";

export class PrismaSaleCommissionTransaction implements SaleCommissionTransactionPort {
  constructor(private readonly prisma: PrismaClient) {}

  async execute<T>(
    fn: (context: SaleCommissionTransactionContext) => Promise<T>,
  ): Promise<T> {
    return this.prisma.$transaction(async (tx) => {
      const client = tx as unknown as PrismaClient;
      return fn({
        saleRepository: new PrismaSaleRepository(client),
        organizationRepository: new PrismaOrganizationRepository(client),
        commissionRuleRepository: new PrismaCommissionRuleRepository(client),
        commissionEntryRepository: new PrismaCommissionEntryRepository(client),
      });
    }) as Promise<T>;
  }
}
