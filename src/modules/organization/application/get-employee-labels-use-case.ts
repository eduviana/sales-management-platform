/**
 * Get employee labels use case.
 *
 * Resolves the readable reference (`EMP-<code>`) of several employees. Used by
 * the audit trail, which persists `resourceType` + `resourceId` and only
 * derives the label at read time (requirements.md §3.12.1.1).
 *
 * The Organization module owns `employee.employeeCode`, so the lookup lives
 * here instead of in the audit module.
 *
 * This is a labeling query: it declares no permission of its own. The caller
 * runs the `audit.read` check before resolving labels.
 *
 * Reference: system-architecture.md §6.4, data-architecture.md §7
 */

import type { OrganizationRepository } from "../domain";

export interface GetEmployeeLabelsInput {
  readonly employeeIds: readonly string[];
}

export class GetEmployeeLabelsUseCase {
  constructor(private readonly organizationRepository: OrganizationRepository) {}

  /** Label per employee id. Unknown ids are absent from the map. */
  async execute(
    input: GetEmployeeLabelsInput,
  ): Promise<ReadonlyMap<string, string>> {
    if (input.employeeIds.length === 0) return new Map();

    const rows = await this.organizationRepository.findEmployeeCodesByIds(
      input.employeeIds,
    );

    return new Map(
      rows.map((row) => [row.id, `EMP-${String(row.employeeCode)}`]),
    );
  }
}
