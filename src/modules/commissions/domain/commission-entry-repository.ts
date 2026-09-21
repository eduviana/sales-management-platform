import type {
  CommissionEntryData,
  CreateCommissionEntryInput,
} from "./commission-entry";

export interface CommissionEntryRepository {
  findEarnedBySaleId(saleId: string): Promise<CommissionEntryData | null>;
  findReversalByParentId(parentId: string): Promise<CommissionEntryData | null>;
  create(input: CreateCommissionEntryInput): Promise<CommissionEntryData>;
  findBySaleId(saleId: string): Promise<CommissionEntryData[]>;
}
