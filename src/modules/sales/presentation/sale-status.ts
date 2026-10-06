/**
 * Sale status presentation labels and badge variants.
 *
 * Shared by the sales list, the dashboard sales detail table and the sale
 * detail page so wording and colors stay consistent across screens.
 *
 * Reference: requirements.md §3.3
 */

export const SALE_STATUS_LABELS: Record<string, string> = {
  DRAFT: "Borrador",
  PENDING_REVIEW: "Pend. revisión",
  APPROVED: "Aprobada",
  REJECTED: "Rechazada",
  CANCELLED: "Cancelada",
};

export const SALE_STATUS_BADGE: Record<string, string> = {
  DRAFT: "badge-neutral",
  PENDING_REVIEW: "badge-warning",
  APPROVED: "badge-success",
  REJECTED: "badge-error",
  CANCELLED: "badge-error",
};
