/**
 * Get employee names use case.
 *
 * Resolves the display name of several employees (`"Ana Díaz"`) so a screen
 * that already read sales can render the seller column without querying the
 * employee table itself.
 *
 * This is a labeling query for employees the caller already read through an
 * authorized sales read (`ListSalesUseCase` with an explicit scope), so it
 * declares no permission of its own: the authorization boundary stays on the
 * sales read.
 *
 * Reference: ADR-020 (aislamiento entre módulos), permissions-matrix.md §4.4
 */

import type { OrganizationRepository } from "../domain";

export interface GetEmployeeNamesInput {
  readonly employeeIds: readonly string[];
}

export class GetEmployeeNamesUseCase {
  constructor(private readonly organizationRepository: OrganizationRepository) {}

  /** Full name per employee id. Unknown ids are absent from the map. */
  async execute(
    input: GetEmployeeNamesInput,
  ): Promise<ReadonlyMap<string, string>> {
    if (input.employeeIds.length === 0) return new Map();

    const rows = await this.organizationRepository.findNamesByIds(
      input.employeeIds,
    );

    return new Map(
      rows.map((row) => [row.id, `${row.firstName} ${row.lastName}`]),
    );
  }
}
