/**
 * Get employee by ID use case.
 *
 * Returns full employee details for the /team/[id] detail page.
 * Authorization: employee.read with the employee as the checked resource, so a
 * supervisor only reaches the employees inside their scope (TEAM for N3, BRANCH
 * for N4-N6, GLOBAL for N7 and ADMIN).
 */

import type { AuthorizationService } from "@/modules/authorization/domain";
import { grantsResourceAccess } from "@/modules/authorization/domain";
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
    // 1. Authorize against the requested employee. Without the resource the
    //    permission alone would decide and any supervisor could read any
    //    employee record just by knowing its id.
    const decision = await this.authorizationService.authorize(
      input.authContext,
      {
        permission: "employee.read",
        resource: { type: "employee", id: input.employeeId },
      },
    );

    if (!grantsResourceAccess(decision)) {
      throw new AuthorizationError(
        decision.reason ?? "No autorizado para consultar este empleado.",
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