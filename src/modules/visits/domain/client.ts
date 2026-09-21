/**
 * Client — Domain entity for clients.
 *
 * Clients are assigned to N3+ supervisors and can be assigned to sellers.
 * Referral contacts from sellers' team are added to the N3+ supervisor's client base.
 *
 * Reference: docs/database/data-model.md §20, docs/domain/business-rules.md REG-069
 */

export interface Client {
  id: string;
  clientNumber: number;
  name: string;
  documentNumber?: string | null;
  phone?: string | null;
  email?: string | null;
  address?: string | null;
  street?: string | null;
  streetNumber?: string | null;
  floor?: string | null;
  apartment?: string | null;
  city?: string | null;
  province?: string | null;
  postalCode?: string | null;
  addressNotes?: string | null;
  referredBySaleId?: string | null;
  ownerEmployeeId: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateClientData {
  name: string;
  documentNumber?: string;
  phone?: string;
  email?: string;
  address: string;
  street: string;
  streetNumber: string;
  floor?: string;
  apartment?: string;
  city: string;
  province: string;
  postalCode?: string;
  addressNotes?: string;
  referredBySaleId?: string;
  ownerEmployeeId: string;
}

export interface UpdateClientData {
  name?: string;
  documentNumber?: string;
  phone?: string;
  email?: string;
  address?: string;
  street?: string;
  streetNumber?: string;
  floor?: string;
  apartment?: string;
  city?: string;
  province?: string;
  postalCode?: string;
  addressNotes?: string;
}

export function formatClientAddress(data: {
  street?: string | null;
  streetNumber?: string | null;
  floor?: string | null;
  apartment?: string | null;
  city?: string | null;
  province?: string | null;
  postalCode?: string | null;
  addressNotes?: string | null;
  address?: string | null;
}): string {
  if (!data.street || !data.streetNumber) return data.address ?? "Dirección pendiente";
  const line = `${data.street} ${data.streetNumber}${data.floor ? `, Piso ${data.floor}` : ""}${data.apartment ? `, Depto. ${data.apartment}` : ""}`;
  const locality = [data.city, data.province, data.postalCode].filter(Boolean).join(", ");
  return [line, locality, data.addressNotes].filter(Boolean).join(" — ");
}
