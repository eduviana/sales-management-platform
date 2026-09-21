/**
 * Sale status and transition rules.
 *
 * Defines the allowed state transitions for a sale within the system.
 * The lifecycle is:
 *
 *   DRAFT → PENDING_REVIEW → APPROVED / REJECTED
 *                          → CANCELLED
 *   REJECTED → DRAFT (re-edit after rejection)
 *   APPROVED → CANCELLED (controlled cancellation)
 *
 * Reference: data-model.md §11, business-rules.md §16.1
 */

/**
 * All possible sale statuses.
 * Must match the SaleStatus enum in the Prisma schema exactly.
 */
export type SaleStatus =
  | "DRAFT"
  | "PENDING_REVIEW"
  | "APPROVED"
  | "REJECTED"
  | "CANCELLED";

/**
 * Allowed transitions from each status.
 *
 * DRAFT: seller can submit for review or continue editing.
 * PENDING_REVIEW: supervisor can approve or reject.
 * REJECTED: seller can re-edit (back to DRAFT).
 * APPROVED: can be cancelled.
 * CANCELLED: terminal state.
 */
const TRANSITIONS: Record<SaleStatus, readonly SaleStatus[]> = {
  DRAFT: ["PENDING_REVIEW"],
  PENDING_REVIEW: ["APPROVED", "REJECTED"],
  APPROVED: ["CANCELLED"],
  REJECTED: ["DRAFT"],
  CANCELLED: [],
};

/**
 * Check whether a sale can transition from one status to another.
 *
 * @param from - Current status of the sale.
 * @param to - Desired target status.
 * @returns true if the transition is allowed.
 */
export function canTransitionTo(from: SaleStatus, to: SaleStatus): boolean {
  const allowed = TRANSITIONS[from];
  return allowed.includes(to);
}

/**
 * Get all valid target statuses from a given status.
 *
 * @param from - Current status of the sale.
 * @returns Array of valid target statuses.
 */
export function getValidTransitions(
  from: SaleStatus,
): readonly SaleStatus[] {
  return TRANSITIONS[from];
}

/**
 * Check if a status represents a terminal state (no outgoing transitions).
 */
export function isTerminalStatus(status: SaleStatus): boolean {
  return TRANSITIONS[status].length === 0;
}
