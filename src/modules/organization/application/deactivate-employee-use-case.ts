/**
 * Deactivate employee use case.
 *
 * Marks an employee as INACTIVE when they leave the organization.
 * The employee is not physically deleted — their historical data is preserved.
 * If the employee has a UserAccount, it will no longer be able to authenticate
 * (handled by the identity module's status check during login).
 *
 * Reference: organizational-model.md §12.8, business-rules.md REG-004,
 *            REG-023
 */

import type { OrganizationRepository } from "@/modules/organization/domain";
import type { AuditPort } from "@/shared/ports/audit-port";
import { AuditAction } from "@/shared/ports/audit-port";
import { NotFoundError, DomainRuleError } from "@/shared/errors";

export interface DeactivateEmployeeInput {
  readonly employeeId: string;
  readonly reason?: string;
  /** Account id of the actor: `audit_event.actorId` is a FK to `UserAccount`. */
  readonly actorId: string;
  readonly actorEmail: string;
}

export interface DeactivateEmployeeOutput {
  readonly employeeId: string;
  readonly status: "INACTIVE";
}

export class DeactivateEmployeeUseCase {
  constructor(
    private readonly organizationRepository: OrganizationRepository,
    private readonly auditPort: AuditPort,
  ) {}

  async execute(
    input: DeactivateEmployeeInput,
  ): Promise<DeactivateEmployeeOutput> {
    // 1. Find employee
    const employee =
      await this.organizationRepository.findEmployeeById(
        input.employeeId,
      );
    if (!employee) {
      throw new NotFoundError("Employee", input.employeeId);
    }

    // 2. Validate not already inactive
    if (employee.status === "INACTIVE") {
      throw new DomainRuleError(
        "Employee is already inactive.",
        "EMPLOYEE_ALREADY_INACTIVE",
      );
    }

    // 3. Deactivate (no transaction needed — single update)
    await this.organizationRepository.updateEmployeeStatus(
      input.employeeId,
      "INACTIVE",
    );

    const now = new Date();

    // 4. Record audit event
    await this.auditPort.log({
      actorId: input.actorId,
      actorEmail: input.actorEmail,
      action: AuditAction.EMPLOYEE_DEACTIVATED,
      resourceType: "Employee",
      resourceId: input.employeeId,
      result: "SUCCESS",
      correlationId: null,
      metadata: {
        firstName: employee.firstName,
        lastName: employee.lastName,
        reason: input.reason,
      },
      timestamp: now,
    });

    return {
      employeeId: input.employeeId,
      status: "INACTIVE",
    };
  }
}
