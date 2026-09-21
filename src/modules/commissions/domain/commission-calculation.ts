import { ValidationError } from "@/shared/errors";

export interface CommissionCalculation {
  readonly baseAmount: number;
  readonly percentage: number;
  readonly amount: number;
}

export function roundHalfUpToTwoDecimals(value: number): number {
  return Math.floor((value + Number.EPSILON) * 100 + 0.5) / 100;
}

export function calculateCommission(
  baseAmount: number,
  percentage: number,
): CommissionCalculation {
  if (!Number.isFinite(baseAmount) || baseAmount <= 0) {
    throw new ValidationError("Commission base amount must be positive.", "baseAmount");
  }
  if (!Number.isFinite(percentage) || percentage <= 0 || percentage > 100) {
    throw new ValidationError("Commission percentage is invalid.", "percentage");
  }

  return {
    baseAmount: roundHalfUpToTwoDecimals(baseAmount),
    percentage,
    amount: roundHalfUpToTwoDecimals((baseAmount * percentage) / 100),
  };
}
