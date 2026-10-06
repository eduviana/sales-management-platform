/**
 * Visit — Domain entity for visits/demonstrations.
 *
 * Visits are assigned by supervisors (N3+) to sellers.
 * Sellers perform visits and record results (with or without sale).
 *
 * Reference: docs/database/data-model.md §21, docs/domain/business-rules.md REG-066, REG-067
 */

export type VisitStatus = "assigned" | "completed" | "no_sale" | "cancelled";

/**
 * Aggregated visit counts for one seller.
 *
 * - `total`: every visit ever assigned to the seller (any status). Team
 *   dashboards label this figure as "visitas asignadas".
 * - `completed`: visits performed (COMPLETED + NO_SALE).
 * - `pending`: visits still pending (ASSIGNED).
 */
export interface VisitStatusCounts {
  readonly total: number;
  readonly completed: number;
  readonly pending: number;
}

export interface Visit {
  id: string;
  visitNumber: number;
  sellerId: string;
  sellerName?: string | null;
  clientId: string;
  clientName?: string | null;
  clientPhone?: string | null;
  clientEmail?: string | null;
  clientDocumentNumber?: string | null;
  visitStreet?: string | null;
  visitStreetNumber?: string | null;
  visitFloor?: string | null;
  visitApartment?: string | null;
  visitCity?: string | null;
  visitProvince?: string | null;
  visitPostalCode?: string | null;
  visitAddressNotes?: string | null;
  assignedById: string;
  scheduledDate: Date;
  completedDate?: Date | null;
  status: VisitStatus;
  notes?: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateVisitData {
  sellerId: string;
  clientId: string;
  assignedById: string;
  scheduledDate: Date;
  notes?: string;
  visitStreet: string;
  visitStreetNumber: string;
  visitFloor?: string;
  visitApartment?: string;
  visitCity: string;
  visitProvince: string;
  visitPostalCode?: string;
  visitAddressNotes?: string;
}

export interface UpdateVisitData {
  completedDate?: Date;
  status?: VisitStatus;
  notes?: string;
}
