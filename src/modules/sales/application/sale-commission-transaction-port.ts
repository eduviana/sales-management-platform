import type { CommissionEntryRepository, CommissionRuleRepository } from "@/modules/commissions/domain";
import type { EmployeeCommissionContextPort } from "@/modules/organization/domain";
import type { SaleRepository } from "@/modules/sales/domain";

export interface SaleCommissionTransactionContext {
  readonly saleRepository: SaleRepository;
  readonly organizationRepository: EmployeeCommissionContextPort;
  readonly commissionRuleRepository: CommissionRuleRepository;
  readonly commissionEntryRepository: CommissionEntryRepository;
}

export interface SaleCommissionTransactionPort {
  execute<T>(
    fn: (context: SaleCommissionTransactionContext) => Promise<T>,
  ): Promise<T>;
}
