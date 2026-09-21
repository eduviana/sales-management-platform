/**
 * Create commission rule version use case.
 *
 * Creates a new version of a commission rule for a specific level.
 * The new rule becomes effective from the specified date.
 *
 * Reference: business-rules.md §16.2
 */

import type { AuthorizationContext, AuthorizationService } from "@/modules/authorization/domain";
import {
  CommissionRuleConflictError,
  validateCommissionRuleInput,
  type CommissionRuleData,
  type CommissionRuleRepository,
  type CreateCommissionRuleInput,
} from "@/modules/commissions/domain";
import type { AuditPort } from "@/shared/ports/audit-port";
import { AuditAction } from "@/shared/ports/audit-port";
import { AuthorizationError } from "@/shared/errors";

export interface CreateCommissionRuleVersionInput extends CreateCommissionRuleInput {
  readonly authContext: AuthorizationContext;
}

export class CreateCommissionRuleVersionUseCase {
  constructor(
    private readonly authorizationService: AuthorizationService,
    private readonly ruleRepository: CommissionRuleRepository,
    private readonly auditPort: AuditPort,
  ) {}

  async execute(input: CreateCommissionRuleVersionInput): Promise<CommissionRuleData> {
    const decision = await this.authorizationService.authorize(input.authContext, {
      permission: "commission.manageRules",
    });
    if (!decision.allowed) {
      throw new AuthorizationError(decision.reason ?? "Not authorized to manage commission rules.");
    }

    validateCommissionRuleInput(input);
    const overlaps = await this.ruleRepository.findOverlapping(input);
    const futureOrSameVersion = overlaps.some(
      (rule) => rule.effectiveFrom >= input.effectiveFrom,
    );
    if (futureOrSameVersion) {
      throw new CommissionRuleConflictError(
        "The new commission rule conflicts with an existing or future version for the same level.",
      );
    }

    if (overlaps.length > 0) {
      await this.ruleRepository.closeAt(input.levelId, input.effectiveFrom);
    }

    const rule = await this.ruleRepository.create(input);

    // Record audit event
    await this.auditPort.log({
      actorId: input.authContext.employeeId,
      actorEmail: input.authContext.userEmail,
      action: AuditAction.COMMISSION_RULE_CREATED,
      resourceType: "CommissionRule",
      resourceId: rule.id,
      result: "SUCCESS",
      correlationId: null,
      metadata: {
        levelId: input.levelId,
        percentage: input.percentage,
        effectiveFrom: input.effectiveFrom,
        effectiveTo: input.effectiveTo,
      },
      timestamp: new Date(),
    });

    return rule;
  }
}
