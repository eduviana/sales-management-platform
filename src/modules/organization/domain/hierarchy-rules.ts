/**
 * Hierarchy rules.
 *
 * Pure domain functions for validating and reasoning about organizational
 * hierarchy. No framework or persistence dependencies.
 *
 * Reference: organizational-model.md §3, business-rules.md REG-012..REG-016,
 *            ADR-004
 */

/**
 * Validate that a supervisor assignment is structurally valid.
 *
 * Rules:
 * - An employee cannot be their own supervisor.
 * - A null supervisor (top of hierarchy) is always valid structurally.
 * - Cycle detection must be performed separately (requires persistence).
 */
export function isValidSupervisorAssignment(
  employeeId: string,
  supervisorId: string | null,
): boolean {
  // Top of hierarchy — always valid structurally
  if (supervisorId === null) {
    return true;
  }

  // Self-supervision is never allowed
  if (employeeId === supervisorId) {
    return false;
  }

  return true;
}

/**
 * Check whether a set of descendant IDs would create a cycle
 * if the candidate supervisor were assigned.
 *
 * If the candidate supervisor appears in the descendants of the employee,
 * assigning them as supervisor would create a cycle.
 *
 * This is a pure logic function — the descendant set is provided by
 * the infrastructure layer (recursive SQL query).
 *
 * @param descendantIds - The set of all descendant IDs for the employee
 *   (obtained via hierarchical query).
 * @param candidateSupervisorId - The ID of the proposed new supervisor.
 * @returns true if assigning candidateSupervisorId as supervisor would create a cycle.
 */
export function wouldCreateCycle(
  descendantIds: readonly string[],
  candidateSupervisorId: string,
): boolean {
  return descendantIds.includes(candidateSupervisorId);
}
