import { ConflictError, DomainError, NotFoundError } from "@/shared/errors";

export class CommissionRuleNotFoundError extends NotFoundError {
  constructor(levelId: number, at: Date) {
    super("ApplicableCommissionRule", `${levelId}@${at.toISOString()}`);
    this.name = "CommissionRuleNotFoundError";
  }
}

export class CommissionRuleConflictError extends ConflictError {
  constructor(message = "More than one commission rule applies to the same context.") {
    super(message);
    this.name = "CommissionRuleConflictError";
  }
}

export class CommissionNotApplicableError extends DomainError {
  constructor(message = "No commission rule is applicable to this sale.") {
    super(message);
    this.name = "CommissionNotApplicableError";
  }
}

export class CommissionAlreadyExistsError extends ConflictError {
  constructor(saleId: string) {
    super(`An earned commission already exists for sale '${saleId}'.`);
    this.name = "CommissionAlreadyExistsError";
  }
}

export class CommissionReversalAlreadyExistsError extends ConflictError {
  constructor(entryId: string) {
    super(`A reversal already exists for commission entry '${entryId}'.`);
    this.name = "CommissionReversalAlreadyExistsError";
  }
}
