import type { AuthorizationContext, AuthorizationService } from "@/modules/authorization/domain";
import {
  CommissionRuleNotFoundError,
  type CommissionRuleData,
  type CommissionRuleRepository,
} from "@/modules/commissions/domain";
import { AuthorizationError } from "@/shared/errors";

export class GetApplicableCommissionRuleUseCase {
  constructor(
    private readonly authorizationService: AuthorizationService,
    private readonly ruleRepository: CommissionRuleRepository,
  ) {}

  async execute(input: {
    authContext: AuthorizationContext;
    levelId: number;
    at: Date;
  }): Promise<CommissionRuleData> {
    const decision = await this.authorizationService.authorize(input.authContext, {
      permission: "commission.viewRules",
    });
    if (!decision.allowed) {
      throw new AuthorizationError(decision.reason ?? "Not authorized to view commission rules.");
    }

    const rule = await this.ruleRepository.findApplicable(input.levelId, input.at);
    if (!rule) {
      throw new CommissionRuleNotFoundError(input.levelId, input.at);
    }
    return rule;
  }
}
