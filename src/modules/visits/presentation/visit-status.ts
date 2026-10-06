/**
 * Visit status presentation labels and badge colours.
 *
 * Shared by the visit list, the team visit list and the visit detail page so
 * wording and colours stay consistent across screens. These values are a
 * visual concern: the domain keeps only the `VisitStatus` type
 * (ADR-020, decision 8 — domain purity).
 *
 * Reference: ADR-020 (pureza del dominio), ADR-019 (kernel de presentación)
 */

import type { VisitStatus } from "../domain/visit";

export const VISIT_STATUS_LABELS: Record<VisitStatus, string> = {
  assigned: "Pendiente",
  completed: "Completada",
  no_sale: "Sin venta",
  cancelled: "Cancelada",
};

export const VISIT_STATUS_COLORS: Record<
  VisitStatus,
  { bg: string; text: string; border: string }
> = {
  assigned: { bg: "bg-primary/10", text: "text-primary", border: "border-primary/20" },
  completed: { bg: "bg-secondary/10", text: "text-secondary", border: "border-secondary/20" },
  no_sale: { bg: "bg-tertiary/10", text: "text-tertiary", border: "border-tertiary/20" },
  cancelled: {
    bg: "bg-surface-container-high",
    text: "text-on-surface-variant",
    border: "border-outline-variant",
  },
};
