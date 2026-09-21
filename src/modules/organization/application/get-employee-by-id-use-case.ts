/**
 * Get employee by ID use case.
 *
 * Returns full employee details for the /team/[id] detail page.
 * Authorization: employee.read with TEAM scope (supervisor must be above the employee).
 */

import type { AuthorizationService } from "@/modules/authorization/domain";
import type { AuthorizationContext } from "@/modules/authorization/domain";
import type { OrganizationRepository } from "../domain";
import type { EmployeeRecord } from "../domain";
import { AuthorizationError, NotFoundError } from "@/shared/errors";

export interface GetEmployeeByIdInput {
  readonly authContext: AuthorizationContext;
  readonly employeeId: string;
}

export class GetEmployeeByIdUseCase {
  constructor(
    private readonly authorizationService: AuthorizationService,
    private readonly organizationRepository: OrganizationRepository,
  ) {}

  async execute(input: GetEmployeeByIdInput): Promise<EmployeeRecord> {
    // 1. Authorize
    const decision = await this.authorizationService.authorize(
      input.authContext,
      { permission: "employee.read" },
    );

    if (!decision.allowed) {
      throw new AuthorizationError(
        decision.reason ?? "Not authorized to view employee details.",
      );
    }

    // 2. Get employee
    const employee = await this.organizationRepository.findEmployeeById(
      input.employeeId,
    );

    if (!employee) {
      throw new NotFoundError("Employee not found.");
    }

    return employee;
  }
}
