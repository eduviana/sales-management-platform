/**
 * Get commission rule labels use case.
 *
 * Resolves the readable reference (`Regla N3`) of several commission rules.
 * Used by the audit trail, which persists `resourceType` + `resourceId` and
 * only derives the label at read time (requirements.md §3.12.1.1).
 *
 * The Commissions module owns `commissionRule.levelId`, so the lookup lives
 * here instead of in the audit module.
 *
 * This is a labeling query: it declares no permission of its own. The caller
 * runs the `audit.read` check before resolving labels.
 *
 * Reference: system-architecture.md §6.4, data-architecture.md §7
 */

import type { CommissionRuleRepository } from "../domain/commission-rule-repository";

export interface GetCommissionRuleLabelsInput {
  readonly ruleIds: readonly string[];
}

export class GetCommissionRuleLabelsUseCase {
  constructor(
    private readonly commissionRuleRepository: CommissionRuleRepository,
  ) {}

  /** Label per rule id. Unknown ids are absent from the map. */
  async execute(
    input: GetCommissionRuleLabelsInput,
  ): Promise<ReadonlyMap<string, string>> {
    if (input.ruleIds.length === 0) return new Map();

    const rows = await this.commissionRuleRepository.findLevelIdsByIds(
      input.ruleIds,
    );

    return new Map(rows.map((row) => [row.id, `Regla N${row.levelId}`]));
  }
}
