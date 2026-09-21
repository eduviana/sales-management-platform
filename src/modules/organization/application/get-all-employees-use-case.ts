/**
 * Get all employees use case.
 *
 * Returns all employees in the organization, ordered by employee code.
 * Used by ADMIN to manage employees.
 *
 * Reference: requirements.md §3.12
 */

import type { EmployeeRecord, OrganizationRepository } from "../domain";

export interface GetAllEmployeesOutput {
  readonly employees: EmployeeRecord[];
}

export class GetAllEmployeesUseCase {
  constructor(
    private readonly organizationRepository: OrganizationRepository,
  ) {}

  async execute(): Promise<GetAllEmployeesOutput> {
    const employees = await this.organizationRepository.getAllEmployees();
    return { employees };
  }
}
