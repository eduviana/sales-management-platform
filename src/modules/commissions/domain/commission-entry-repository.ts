import type {
  CommissionEntryData,
  CreateCommissionEntryInput,
} from "./commission-entry";

export interface CommissionEntryRepository {
  findEarnedBySaleId(saleId: string): Promise<CommissionEntryData | null>;
  findReversalByParentId(parentId: string): Promise<CommissionEntryData | null>;
  create(input: CreateCommissionEntryInput): Promise<CommissionEntryData>;
  findBySaleId(saleId: string): Promise<CommissionEntryData[]>;

  /**
   * Earned entries of several employees, newest sale first.
   *
   * `period` narrows the entries to a sale date range when given. Consumed by
   * the progression and commissions read models, so those screens read the
   * commission entry table through this port instead of querying it directly.
   */
  findEarnedByEmployeeIds(
    employeeIds: readonly string[],
    period?: { readonly from: Date; readonly to: Date },
  ): Promise<CommissionEntryData[]>;

  /**
   * Earned amount of each given sale, for labelling sale lists.
   * Sales without an earned entry are absent from the result.
   */
  /** Sale of several commission entries (label lookup for audit events). */
  findSaleIdsByIds(
    entryIds: readonly string[],
  ): Promise<Array<{ readonly id: string; readonly saleId: string }>>;

  findEarnedAmountsBySaleIds(
    saleIds: readonly string[],
  ): Promise<Array<{ readonly saleId: string; readonly amount: number }>>;
}
