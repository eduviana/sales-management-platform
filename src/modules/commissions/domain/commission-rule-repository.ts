import type {
  CommissionRuleData,
  CreateCommissionRuleInput,
} from "./commission-rule";

export interface CommissionRuleRepository {
  findApplicable(levelId: number, at: Date): Promise<CommissionRuleData | null>;
  findOverlapping(input: CreateCommissionRuleInput): Promise<CommissionRuleData[]>;

  /** Level of several rules (label lookup for audit events). */
  findLevelIdsByIds(
    ruleIds: readonly string[],
  ): Promise<Array<{ readonly id: string; readonly levelId: number }>>;
  create(input: CreateCommissionRuleInput): Promise<CommissionRuleData>;
  closeAt(levelId: number, effectiveTo: Date): Promise<void>;
}
