/**
 * Change supervisor use case.
 *
 * Changes an employee's direct supervisor (reorganization).
 * Handles the full transactional operation:
 *   1. Validate the supervisor change (no self, no cycles)
 *   2. Close the current supervisor history record
 *   3. Create a new supervisor history record
 *   4. Update the employee's supervisorId
 *   5. Record audit event
 *
 * Reference: organizational-model.md §12.8, business-rules.md REG-012,
 *            ADR-004
 */

import type { OrganizationRepository } from "@/modules/organization/domain";
import type { AuditPort } from "@/shared/ports/audit-port";
import { AuditAction } from "@/shared/ports/audit-port";
import {
  isValidSupervisorAssignment,
  wouldCreateCycle,
} from "@/modules/organization/domain";
import {
  NotFoundError,
  DomainRuleError,
} from "@/shared/errors";

export interface ChangeSupervisorInput {
  readonly employeeId: string;
  readonly newSupervisorId: string | null;
  readonly reason?: string;
  readonly actorId: string;
  readonly actorEmail: string;
}

export interface ChangeSupervisorOutput {
  readonly employeeId: string;
  readonly previousSupervisorId: string | null;
  readonly newSupervisorId: string | null;
}

export class ChangeSupervisorUseCase {
  constructor(
    private readonly organizationRepository: OrganizationRepository,
    private readonly auditPort: AuditPort,
  ) {}

  async execute(
    input: ChangeSupervisorInput,
  ): Promise<ChangeSupervisorOutput> {
    return this.organizationRepository.executeInTransaction(async (repo) => {
      // 1. Find employee
      const employee = await repo.findEmployeeById(input.employeeId);
      if (!employee) {
        throw new NotFoundError("Employee", input.employeeId);
      }

      const previousSupervisorId = employee.supervisorId;

      // 2. Skip if supervisor is the same
      if (previousSupervisorId === input.newSupervisorId) {
        return {
          employeeId: input.employeeId,
          previousSupervisorId,
          newSupervisorId: input.newSupervisorId,
        };
      }

      // 3. Validate structural rules (no self-supervision)
      if (
        !isValidSupervisorAssignment(
          input.employeeId,
          input.newSupervisorId,
        )
      ) {
        throw new DomainRuleError(
          "An employee cannot be their own supervisor.",
          "SELF_SUPERVISION",
        );
      }

      // 4. Validate cycle detection (if assigning a new supervisor)
      if (input.newSupervisorId !== null) {
        // Check the candidate supervisor exists
        const candidateSupervisor = await repo.findEmployeeById(
          input.newSupervisorId,
        );
        if (!candidateSupervisor) {
          throw new NotFoundError(
            "Supervisor",
            input.newSupervisorId,
          );
        }

        // Get descendants of the employee to check for cycles
        const descendantIds = await repo.getDescendantIds(
          input.employeeId,
        );

        if (wouldCreateCycle(descendantIds, input.newSupervisorId)) {
          throw new DomainRuleError(
            "Assigning this supervisor would create a cycle in the hierarchy.",
            "HIERARCHY_CYCLE",
          );
        }
      }

      const now = new Date();

      // 5. Close current supervisor history record (if exists)
      const openHistory = await repo.findOpenSupervisorHistory(
        input.employeeId,
      );
      if (openHistory) {
        await repo.closeSupervisorHistory(openHistory.id, now);
      }

      // 6. Create new supervisor history record
      await repo.createSupervisorHistory({
        employeeId: input.employeeId,
        supervisorId: input.newSupervisorId,
        startedAt: now,
        reason: input.reason ?? null,
      });

      // 7. Update employee's supervisor
      await repo.updateEmployeeSupervisor(
        input.employeeId,
        input.newSupervisorId,
      );

      // 8. Record audit event
      await this.auditPort.log({
        actorId: input.actorId,
        actorEmail: input.actorEmail,
        action: AuditAction.EMPLOYEE_SUPERVISOR_CHANGED,
        resourceType: "Employee",
        resourceId: input.employeeId,
        result: "SUCCESS",
        correlationId: null,
        metadata: {
          previousSupervisorId,
          newSupervisorId: input.newSupervisorId,
          reason: input.reason,
        },
        timestamp: now,
      });

      return {
        employeeId: input.employeeId,
        previousSupervisorId,
        newSupervisorId: input.newSupervisorId,
      };
    });
  }
}
