/**
 * Change level use case.
 *
 * Changes an employee's commercial level (promotion or demotion).
 * Handles the full transactional operation:
 *   1. Validate the level change
 *   2. Close the current level history record
 *   3. Create a new level history record
 *   4. Update the employee's currentLevelId
 *   5. Record audit event
 *
 * Level changes do NOT automatically change the supervisor.
 * These are two independent concepts.
 *
 * Reference: organizational-model.md §9, ADR-002, ADR-006
 */

import type { OrganizationRepository } from "@/modules/organization/domain";
import type { AuditPort } from "@/shared/ports/audit-port";
import { AuditAction } from "@/shared/ports/audit-port";
import {
  isValidLevel,
  isValidLevelChange,
  isValidPromotion,
  isValidDemotion,
} from "@/modules/organization/domain";
import {
  NotFoundError,
  ValidationError,
  DomainRuleError,
} from "@/shared/errors";

export interface ChangeLevelInput {
  readonly employeeId: string;
  readonly targetLevelId: number;
  readonly reason?: string;
  readonly actorId: string;
  readonly actorEmail: string;
}

export interface ChangeLevelOutput {
  readonly employeeId: string;
  readonly previousLevelId: number;
  readonly newLevelId: number;
  readonly changeType: "promotion" | "demotion" | "lateral" | "initial";
}

export class ChangeLevelUseCase {
  constructor(
    private readonly organizationRepository: OrganizationRepository,
    private readonly auditPort: AuditPort,
  ) {}

  async execute(input: ChangeLevelInput): Promise<ChangeLevelOutput> {
    return this.organizationRepository.executeInTransaction(async (repo) => {
      // 1. Find employee
      const employee = await repo.findEmployeeById(input.employeeId);
      if (!employee) {
        throw new NotFoundError("Employee", input.employeeId);
      }

      // 2. Validate target level
      if (!isValidLevel(input.targetLevelId)) {
        throw new ValidationError(
          `Invalid target level: ${input.targetLevelId}. Must be between 1 and 7.`,
          "targetLevelId",
        );
      }

      // 3. Validate level change
      const currentLevelId = employee.currentLevelId;
      if (currentLevelId === null) {
        // Employee has no level yet — this is an initial assignment
        // Allow any valid level
      } else if (!isValidLevelChange(currentLevelId, input.targetLevelId)) {
        throw new DomainRuleError(
          `Invalid level change from N${currentLevelId} to N${input.targetLevelId}.`,
          "LEVEL_CHANGE_INVALID",
        );
      }

      const now = new Date();

      // 4. Close current level history record (if exists)
      if (currentLevelId !== null) {
        const openHistory = await repo.findOpenLevelHistory(
          input.employeeId,
        );
        if (openHistory) {
          await repo.closeLevelHistory(openHistory.id, now);
        }
      }

      // 5. Create new level history record
      await repo.createLevelHistory({
        employeeId: input.employeeId,
        levelId: input.targetLevelId,
        startedAt: now,
        reason: input.reason ?? null,
      });

      // 6. Update employee's current level
      await repo.updateEmployeeLevel(
        input.employeeId,
        input.targetLevelId,
      );

      // 7. Determine change type
      let changeType: ChangeLevelOutput["changeType"];
      if (currentLevelId === null) {
        changeType = "initial";
      } else if (isValidPromotion(currentLevelId, input.targetLevelId)) {
        changeType = "promotion";
      } else if (isValidDemotion(currentLevelId, input.targetLevelId)) {
        changeType = "demotion";
      } else {
        changeType = "lateral";
      }

      // 8. Record audit event
      await this.auditPort.log({
        actorId: input.actorId,
        actorEmail: input.actorEmail,
        action: AuditAction.EMPLOYEE_LEVEL_CHANGED,
        resourceType: "Employee",
        resourceId: input.employeeId,
        result: "SUCCESS",
        correlationId: null,
        metadata: {
          previousLevelId: currentLevelId,
          newLevelId: input.targetLevelId,
          changeType,
          reason: input.reason,
        },
        timestamp: now,
      });

      return {
        employeeId: input.employeeId,
        previousLevelId: currentLevelId ?? 0,
        newLevelId: input.targetLevelId,
        changeType,
      };
    });
  }
}
