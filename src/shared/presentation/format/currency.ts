/**
 * Currency formatting helpers for the presentation layer.
 *
 * Reference: ADR-019
 */

/** Formats a monetary amount as `$1.234` (es-AR, no decimals). */
export function formatCurrency(amount: number): string {
  return `$${amount.toLocaleString("es-AR")}`;
}
