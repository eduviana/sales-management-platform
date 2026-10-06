/**
 * Read model of the sale detail screen.
 *
 * Lives in the application layer because it composes records owned by other
 * modules (referral contacts from visits, commission entries from commissions).
 * The sales module is the owner of the screen, not of those records.
 *
 * Reference: business-rules.md §8, §16.1, requirements.md §3.6
 */

import type { SaleRecord } from "@/modules/sales/domain";
import type { ReferralContact } from "@/modules/visits/domain";
import type { CommissionEntryData } from "@/modules/commissions/domain";

/** One line of the sale item table, with its product label. */
export interface SaleDetailItem {
  readonly id: string;
  readonly productId: string;
  readonly product: { readonly code: string; readonly name: string };
  readonly unitPrice: number;
  readonly quantity: number;
  readonly subtotal: number;
}

/** Everything the sale detail screen shows besides the sale itself. */
export interface SaleDetail {
  readonly sale: SaleRecord;
  readonly items: readonly SaleDetailItem[];
  /** Referral contacts of the sale (programa de referidos). */
  readonly referralContacts: readonly ReferralContact[];
  /** Commission entries; empty until the sale has been processed. */
  readonly commissionEntries: readonly CommissionEntryData[];
}