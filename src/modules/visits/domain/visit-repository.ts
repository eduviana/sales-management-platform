/**
 * VisitRepository — Port for visit persistence.
 *
 * Reference: docs/database/data-model.md §21
 */

import type { Visit, VisitStatus, CreateVisitData, UpdateVisitData } from "../domain/visit";

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
}
