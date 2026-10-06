/**
 * VisitRepository — Port for visit persistence.
 *
 * Reference: docs/database/data-model.md §21
 */

import type { Visit, VisitStatus, VisitStatusCounts, CreateVisitData, UpdateVisitData } from "../domain/visit";

export interface VisitRepository {
  findById(id: string): Promise<Visit | null>;
  findBySellerId(sellerId: string): Promise<Visit[]>;
  findBySellerIds(sellerIds: readonly string[]): Promise<Visit[]>;
  findByClientId(clientId: string): Promise<Visit[]>;
  findByStatus(status: VisitStatus): Promise<Visit[]>;
  create(data: CreateVisitData): Promise<Visit>;
  update(id: string, data: UpdateVisitData): Promise<Visit>;
  countBySellerId(sellerId: string): Promise<number>;
  countPendingBySellerId(sellerId: string): Promise<number>;

  // -------------------------------------------------------------------------
  // Aggregate reads
  //
  // Consumed by the progression module to compute points, so it reads the
  // visit table through this port instead of querying it directly.
  // -------------------------------------------------------------------------

  /** Count completed visits (COMPLETED, NO_SALE) of a seller since a date. */
  countCompletedBySellerIdSince(sellerId: string, since: Date): Promise<number>;

  /** Count completed visits per seller, each with its own lower bound. */
  countCompletedBySellerIdSinceBatch(
    entries: ReadonlyArray<{ sellerId: string; since: Date }>,
  ): Promise<Map<string, number>>;

  /**
   * Aggregate visit counts per seller (total, completed, pending).
   *
   * Consumed by the progression module to build the team overview, so it reads
   * the visit table through this port instead of querying it directly.
   * Sellers without visits are absent from the map.
   */
  countStatusBySellerIds(
    sellerIds: readonly string[],
  ): Promise<Map<string, VisitStatusCounts>>;
}
