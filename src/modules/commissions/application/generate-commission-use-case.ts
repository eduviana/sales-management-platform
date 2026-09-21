import type { EmployeeCommissionContextPort } from "@/modules/organization/domain";
import {
  calculateCommission,
  CommissionAlreadyExistsError,
  CommissionNotApplicableError,
  CommissionRuleNotFoundError,
  validateCommissionEntryInput,
  type CommissionEntryData,
  type CommissionEntryRepository,
  type CommissionRuleRepository,
  type CommissionRuleData,
} from "@/modules/commissions/domain";

export interface GenerateCommissionInput {
  readonly saleId: string;
  readonly employeeId: string;
  readonly saleDate: Date;
  readonly approvedAt: Date;
  readonly baseAmount: number;
}

export class GenerateCommissionForApprovedSaleUseCase {
  constructor(
    private readonly organizationRepository: EmployeeCommissionContextPort,
    private readonly ruleRepository: CommissionRuleRepository,
    private readonly entryRepository: CommissionEntryRepository,
  ) {}

  async execute(input: GenerateCommissionInput): Promise<CommissionEntryData> {
    const existing = await this.entryRepository.findEarnedBySaleId(input.saleId);
    if (existing) {
      throw new CommissionAlreadyExistsError(input.saleId);
    }

    const context = await this.organizationRepository.getEmployeeCommissionContext(
      input.employeeId,
      input.saleDate,
    );
    if (!context || context.levelId === null) {
      throw new CommissionNotApplicableError(
        "The seller has no applicable historical commercial level.",
      );
    }

    const rule = await this.ruleRepository.findApplicable(
      context.levelId,
      input.approvedAt,
    );
    if (!rule) {
      throw new CommissionRuleNotFoundError(context.levelId, input.approvedAt);
    }

    return this.createEntry(input, rule);
  }

  private async createEntry(
    input: GenerateCommissionInput,
    rule: CommissionRuleData,
  ): Promise<CommissionEntryData> {
    const calculation = calculateCommission(input.baseAmount, rule.percentage);
    const entryInput = {
      saleId: input.saleId,
      employeeId: input.employeeId,
      ruleId: rule.id,
      type: "EARNED" as const,
      percentage: calculation.percentage,
      baseAmount: calculation.baseAmount,
      amount: calculation.amount,
      saleDate: input.saleDate,
    };
    validateCommissionEntryInput(entryInput);
    return this.entryRepository.create(entryInput);
  }
}
