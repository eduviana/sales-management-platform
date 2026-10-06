/**
 * Get sale commission amounts use case.
 *
 * Returns the earned commission of each given sale so a sale list can show the
 * commission next to the total (dashboard "Historial Reciente"). Sales without
 * an earned entry are absent from the result.
 *
 * This is a labeling query for sales the caller already read through an
 * authorized sales use case (e.g. `ListSalesUseCase`), so it declares no
 * permission of its own: the authorization boundary stays on the sale read.
 *
 * Reference: requirements.md §3.2
 */

import type { CommissionEntryRepository } from "../domain/commission-entry-repository";

export interface GetSaleCommissionAmountsInput {
  readonly saleIds: readonly string[];
}

export class GetSaleCommissionAmountsUseCase {
  constructor(
    private readonly commissionEntryRepository: CommissionEntryRepository,
  ) {}

  /** Earned amount per sale id. Sales without commission are absent. */
  async execute(
    input: GetSaleCommissionAmountsInput,
  ): Promise<ReadonlyMap<string, number>> {
    if (input.saleIds.length === 0) return new Map();

    const rows =
      await this.commissionEntryRepository.findEarnedAmountsBySaleIds(
        input.saleIds,
      );

    return new Map(rows.map((row) => [row.saleId, row.amount]));
  }
}