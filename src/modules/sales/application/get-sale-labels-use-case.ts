/**
 * Get sale labels use case.
 *
 * Resolves the readable reference (`VT-0042`) of several sales. Used by the
 * audit trail, which persists `resourceType` + `resourceId` and only derives
 * the label at read time (requirements.md §3.12.1.1).
 *
 * The Sales module owns `sale.saleNumber`, so the lookup lives here instead
 * of in the audit module.
 *
 * This is a labeling query: it declares no permission of its own. The caller
 * runs the `audit.read` check before resolving labels.
 *
 * Reference: system-architecture.md §6.4, data-architecture.md §7
 */

import type { SaleRepository } from "../domain/sale-repository";

export interface GetSaleLabelsInput {
  readonly saleIds: readonly string[];
}

export class GetSaleLabelsUseCase {
  constructor(private readonly saleRepository: SaleRepository) {}

  /** Label per sale id. Unknown ids are absent from the map. */
  async execute(
    input: GetSaleLabelsInput,
  ): Promise<ReadonlyMap<string, string>> {
    if (input.saleIds.length === 0) return new Map();

    const rows = await this.saleRepository.findSummariesByIds(input.saleIds);

    return new Map(
      rows.map((row) => [
        row.id,
        `VT-${String(row.saleNumber).padStart(4, "0")}`,
      ]),
    );
  }
}
