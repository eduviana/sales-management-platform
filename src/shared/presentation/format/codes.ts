/**
 * Operational code formatting helpers for the presentation layer.
 *
 * Reference: ADR-019
 */

/** Formats a numeric employee code as `#0002`. */
export function formatEmployeeCode(code: number): string {
  return `#${String(code).padStart(4, "0")}`;
}

/** Formats a commercial level as its short code, e.g. `N3`. */
export function formatLevelCode(level: number): string {
  return `N${level}`;
}
