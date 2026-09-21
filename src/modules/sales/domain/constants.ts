/**
 * Shared constants for the sales module.
 *
 * UI-level enums used in forms and presentation.
 * These are NOT database enums — Prisma schema defines those separately.
 *
 * Reference: requirements.md §3.4
 */

export const PAYMENT_METHODS = [
  { value: "EFECTIVO", label: "Efectivo" },
  { value: "TARJETA_CREDITO", label: "Tarjeta de crédito" },
  { value: "TARJETA_DEBITO", label: "Tarjeta de débito" },
  { value: "TRANSFERENCIA", label: "Transferencia bancaria" },
  { value: "OTRO", label: "Otro" },
] as const;

export const DOCUMENT_TYPES = [
  { value: "DNI", label: "DNI" },
  { value: "CUIT", label: "CUIT" },
  { value: "CUIL", label: "CUIL" },
  { value: "PASSPORT", label: "Pasaporte" },
  { value: "OTHER", label: "Otro" },
] as const;
