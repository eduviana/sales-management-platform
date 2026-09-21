import type {
  CommissionRuleData,
  CreateCommissionRuleInput,
} from "./commission-rule";

export interface CommissionRuleRepository {
  findApplicable(levelId: number, at: Date): Promise<CommissionRuleData | null>;
  findOverlapping(input: CreateCommissionRuleInput): Promise<CommissionRuleData[]>;
  create(input: CreateCommissionRuleInput): Promise<CommissionRuleData>;
  closeAt(levelId: number, effectiveTo: Date): Promise<void>;
}
