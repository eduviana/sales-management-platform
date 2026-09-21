/**
 * ReferralContactRepository — Port for referral contact persistence.
 *
 * Reference: docs/database/data-model.md §22
 */

import type { ReferralContact, CreateReferralContactData } from "../domain/referral-contact";

export interface ReferralContactRepository {
  findBySaleId(saleId: string): Promise<ReferralContact[]>;
  create(data: CreateReferralContactData): Promise<ReferralContact>;
  countBySaleId(saleId: string): Promise<number>;
}
