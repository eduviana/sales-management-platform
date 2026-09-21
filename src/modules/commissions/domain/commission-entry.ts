import { DomainRuleError, ValidationError } from "@/shared/errors";

export type CommissionEntryType = "EARNED" | "REVERSAL" | "ADJUSTMENT";

export interface CommissionEntryData {
  readonly id: string;
  readonly saleId: string;
  readonly employeeId: string;
  readonly ruleId: string;
  readonly parentId: string | null;
  readonly type: CommissionEntryType;
  readonly percentage: number;
  readonly baseAmount: number;
  readonly amount: number;
  readonly saleDate: Date;
  readonly calculatedAt: Date;
  readonly createdAt: Date;
}

export interface CreateCommissionEntryInput {
  readonly saleId: string;
  readonly employeeId: string;
  readonly ruleId: string;
  readonly parentId?: string | null;
  readonly type: CommissionEntryType;
  readonly percentage: number;
  readonly baseAmount: number;
  readonly amount: number;
  readonly saleDate: Date;
}

export function validateCommissionEntryInput(
  input: CreateCommissionEntryInput,
): void {
  if (!input.saleId || !input.employeeId || !input.ruleId) {
    throw new ValidationError("A commission entry requires sale, employee and rule identifiers.");
  }
  if (!Number.isFinite(input.percentage) || input.percentage <= 0 || input.percentage > 100) {
    throw new ValidationError("Commission entry percentage is invalid.", "percentage");
  }
  if (!Number.isFinite(input.baseAmount) || input.baseAmount <= 0) {
    throw new ValidationError("Commission entry base amount must be positive.", "baseAmount");
  }
  if (!Number.isFinite(input.amount) || input.amount === 0) {
    throw new ValidationError("Commission entry amount must be non-zero.", "amount");
  }
  if (input.type === "EARNED" && (input.amount <= 0 || input.parentId !== undefined && input.parentId !== null)) {
    throw new DomainRuleError("An earned commission must be positive and have no parent.", "EARNED_ENTRY");
  }
  if (input.type === "REVERSAL" && (input.amount >= 0 || !input.parentId)) {
    throw new DomainRuleError("A reversal must be negative and reference its original entry.", "REVERSAL_ENTRY");
  }
}
