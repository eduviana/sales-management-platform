/**
 * Visit — Domain entity for visits/demonstrations.
 *
 * Visits are assigned by supervisors (N3+) to sellers.
 * Sellers perform visits and record results (with or without sale).
 *
 * Reference: docs/database/data-model.md §21, docs/domain/business-rules.md REG-066, REG-067
 */

export type VisitStatus = "assigned" | "completed" | "no_sale" | "cancelled";

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

export const VISIT_STATUS_LABELS: Record<VisitStatus, string> = {
  assigned: "Pendiente",
  completed: "Completada",
  no_sale: "Sin venta",
  cancelled: "Cancelada",
};

/** Formats a date-only visit value without applying the browser's timezone. */
export function formatVisitDate(date: Date | string): string {
  return new Intl.DateTimeFormat("es-AR", { timeZone: "UTC" }).format(new Date(date));
}

export const VISIT_STATUS_COLORS: Record<VisitStatus, { bg: string; text: string; border: string }> = {
  assigned: { bg: "bg-primary/10", text: "text-primary", border: "border-primary/20" },
  completed: { bg: "bg-secondary/10", text: "text-secondary", border: "border-secondary/20" },
  no_sale: { bg: "bg-tertiary/10", text: "text-tertiary", border: "border-tertiary/20" },
  cancelled: { bg: "bg-surface-container-high", text: "text-on-surface-variant", border: "border-outline-variant" },
};
