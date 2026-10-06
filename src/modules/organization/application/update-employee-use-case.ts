/**
 * Update employee use case.
 *
 * Updates an employee's editable personal data and records an audit event.
 *
 * Authorization is performed here (not in the caller) so that the permission
 * `employee.update` and its scope are always enforced, regardless of which
 * entry point invokes the use case.
 *
 * Reference: system-architecture.md §10-11, permissions-matrix.md §4.2, ADR-020
 */

import type {
  AuthorizationContext,
  AuthorizationService,
} from "@/modules/authorization/domain";
import { grantsResourceAccess } from "@/modules/authorization/domain";
import type {
  OrganizationRepository,
  UpdateEmployeeData,
} from "@/modules/organization/domain";
import type { AuditPort } from "@/shared/ports/audit-port";
import { AuditAction } from "@/shared/ports/audit-port";
import {
  AuthorizationError,
  NotFoundError,
  ValidationError,
} from "@/shared/errors";

export interface UpdateEmployeeInput {
  readonly authContext: AuthorizationContext;
  readonly employeeId: string;
  readonly data: UpdateEmployeeData;
}

export class UpdateEmployeeUseCase {
  constructor(
    private readonly authorizationService: AuthorizationService,
    private readonly organizationRepository: OrganizationRepository,
    private readonly auditPort: AuditPort,
  ) {}

  async execute(input: UpdateEmployeeInput): Promise<void> {
    const { data } = input;

    if (!data.firstName.trim() || !data.lastName.trim()) {
      throw new ValidationError(
        "Nombre y apellido son obligatorios.",
        "firstName",
      );
    }

    await this.organizationRepository.executeInTransaction(async (repo) => {
      const employee = await repo.findEmployeeById(input.employeeId);
      if (!employee) {
        throw new NotFoundError("Employee", input.employeeId);
      }

      // The employee is the owner of its own record, so the scope check
      // verifies that the target belongs to the actor's hierarchy.
      const decision = await this.authorizationService.authorize(
        input.authContext,
        {
          permission: "employee.update",
          resource: {
            type: "employee",
            id: employee.id,
            ownerId: employee.id,
          },
        },
      );

      // GLOBAL means "the whole organization" (permissions-matrix.md §2.2),
      // so it also covers the inactive employees that the scope resolver omits.
      if (!grantsResourceAccess(decision)) {
        throw new AuthorizationError(
          "No autorizado para actualizar este empleado.",
        );
      }

      await repo.updateEmployee(input.employeeId, data);

      await this.auditPort.log({
        actorId: input.authContext.userId,
        actorEmail: input.authContext.userEmail,
        action: AuditAction.EMPLOYEE_UPDATED,
        resourceType: "Employee",
        resourceId: input.employeeId,
        result: "SUCCESS",
        correlationId: null,
        // Only the field names are recorded to avoid persisting personal data.
        metadata: { fields: Object.keys(data) },
        timestamp: new Date(),
      });
    });
  }
}