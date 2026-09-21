import {
  CommissionNotApplicableError,
  CommissionReversalAlreadyExistsError,
  validateCommissionEntryInput,
  type CommissionEntryData,
  type CommissionEntryRepository,
} from "@/modules/commissions/domain";

export interface ReverseCommissionInput {
  readonly saleId: string;
  readonly employeeId: string;
  readonly saleDate: Date;
}

export class ReverseCommissionForCancelledSaleUseCase {
  constructor(private readonly entryRepository: CommissionEntryRepository) {}

  async execute(input: ReverseCommissionInput): Promise<CommissionEntryData> {
    const earned = await this.entryRepository.findEarnedBySaleId(input.saleId);
    if (!earned || earned.employeeId !== input.employeeId) {
      throw new CommissionNotApplicableError(
        "The approved sale has no commission entry for its seller.",
      );
    }

    const existingReversal = await this.entryRepository.findReversalByParentId(earned.id);
    if (existingReversal) {
      throw new CommissionReversalAlreadyExistsError(earned.id);
    }

    const entryInput = {
      saleId: earned.saleId,
      employeeId: earned.employeeId,
      ruleId: earned.ruleId,
      parentId: earned.id,
      type: "REVERSAL" as const,
      percentage: earned.percentage,
      baseAmount: earned.baseAmount,
      amount: -earned.amount,
      saleDate: input.saleDate,
    };
    validateCommissionEntryInput(entryInput);
    return this.entryRepository.create(entryInput);
  }
}
