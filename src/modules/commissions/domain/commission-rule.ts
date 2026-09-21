import { ValidationError } from "@/shared/errors";

export interface CommissionRuleData {
  readonly id: string;
  readonly levelId: number;
  readonly percentage: number;
  readonly effectiveFrom: Date;
  readonly effectiveTo: Date | null;
  readonly createdAt: Date;
  readonly updatedAt: Date;
}

export interface CreateCommissionRuleInput {
  readonly levelId: number;
  readonly percentage: number;
  readonly effectiveFrom: Date;
  readonly effectiveTo?: Date | null;
}

export function validateCommissionRuleInput(
  input: CreateCommissionRuleInput,
): void {
  if (!Number.isInteger(input.levelId) || input.levelId < 1 || input.levelId > 7) {
    throw new ValidationError("Commission level must be between 1 and 7.", "levelId");
  }

  if (!Number.isFinite(input.percentage) || input.percentage <= 0 || input.percentage > 100) {
    throw new ValidationError(
      "Commission percentage must be greater than 0 and at most 100.",
      "percentage",
    );
  }

  if (!(input.effectiveFrom instanceof Date) || Number.isNaN(input.effectiveFrom.getTime())) {
    throw new ValidationError("A valid effective-from date is required.", "effectiveFrom");
  }

  if (input.effectiveTo !== undefined && input.effectiveTo !== null) {
    if (!(input.effectiveTo instanceof Date) || Number.isNaN(input.effectiveTo.getTime())) {
      throw new ValidationError("A valid effective-to date is required.", "effectiveTo");
    }
    if (input.effectiveTo <= input.effectiveFrom) {
      throw new ValidationError("Effective-to must be after effective-from.", "effectiveTo");
    }
  }
}
