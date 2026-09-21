/**
 * ReferralContact — Domain entity for referral contacts.
 *
 * When a client provides 5 contacts, they get a 20% discount on their purchase.
 * Referral contacts are added to the N3+ supervisor's client base.
 * The supervisor validates that referral contacts don't already exist
 * in their client database before applying the discount.
 *
 * Reference: docs/database/data-model.md §22, docs/domain/business-rules.md REG-068
 */

export interface ReferralContact {
  id: string;
  saleId: string;
  clientName: string;
  phone: string;
  email?: string | null;
  street?: string | null;
  streetNumber?: string | null;
  floor?: string | null;
  apartment?: string | null;
  city?: string | null;
  province?: string | null;
  postalCode?: string | null;
  addressNotes?: string | null;
  createdAt: Date;
}

export interface CreateReferralContactData {
  saleId: string;
  clientName: string;
  phone: string;
  email?: string;
  street?: string;
  streetNumber?: string;
  floor?: string;
  apartment?: string;
  city?: string;
  province?: string;
  postalCode?: string;
  addressNotes?: string;
}

export const REFERRAL_DISCOUNT_PERCENTAGE = 20;
export const REFERRAL_REQUIRED_CONTACTS = 5;
