/**
 * Get commission entry labels use case.
 *
 * Resolves the readable reference (`Comisión VT-0042`) of several commission
 * entries. Used by the audit trail, which persists `resourceType` +
 * `resourceId` and only derives the label at read time
 * (requirements.md §3.12.1.1).
 *
 * The Commissions module owns `commissionEntry.saleId` and the Sales module
 * owns `sale.saleNumber`, so this service reads its own table through the
 * commission port and the sale number through the sales port (a composed
 * read, as in `GetMonthlyCommissionOverviewUseCase`).
 *
 * This is a labeling query: it declares no permission of its own. The caller
 * runs the `audit.read` check before resolving labels.
 *
 * Reference: system-architecture.md §6.4, data-architecture.md §7
 */

import type { SaleRepository } from "@/modules/sales/domain/sale-repository";
import type { CommissionEntryRepository } from "../domain/commission-entry-repository";

export interface GetCommissionEntryLabelsInput {
  readonly entryIds: readonly string[];
}

export class GetCommissionEntryLabelsUseCase {
  constructor(
    private readonly commissionEntryRepository: CommissionEntryRepository,
    private readonly saleRepository: SaleRepository,
  ) {}

  /** Label per commission entry id. Unknown ids are absent from the map. */
  async execute(
    input: GetCommissionEntryLabelsInput,
  ): Promise<ReadonlyMap<string, string>> {
    if (input.entryIds.length === 0) return new Map();

    const entries = await this.commissionEntryRepository.findSaleIdsByIds(
      input.entryIds,
    );
    if (entries.length === 0) return new Map();

    const sales = await this.saleRepository.findSummariesByIds(
      entries.map((entry) => entry.saleId),
    );
    const saleNumbers = new Map(
      sales.map((sale) => [sale.id, sale.saleNumber]),
    );

    const labels = new Map<string, string>();
    for (const entry of entries) {
      const saleNumber = saleNumbers.get(entry.saleId);
      if (saleNumber === undefined) continue;
      labels.set(
        entry.id,
        `Comisión VT-${String(saleNumber).padStart(4, "0")}`,
      );
    }
    return labels;
  }
}
