/**
 * Recruit employee use case.
 *
 * Creates a new employee through the normal recruitment flow.
 * The recruiter's level determines the new employee's initial level
 * according to the recruitment ladder.
 *
 * The recruiter becomes the initial supervisor of the new employee.
 *
 * Reference: organizational-model.md §12.8, business-rules.md §16.1
 */

import type {
  OrganizationRepository,
  EmployeeRecord,
} from "@/modules/organization/domain";
import type { AuditPort } from "@/shared/ports/audit-port";
import { AuditAction } from "@/shared/ports/audit-port";
import {
  canRecruit,
  getRecruitedLevel,
} from "@/modules/organization/domain";
import {
  NotFoundError,
  DomainRuleError,
} from "@/shared/errors";

export interface RecruitEmployeeInput {
  /** ID of the employee doing the recruiting. */
  readonly recruiterId: string;
  readonly firstName: string;
  readonly lastName: string;
  readonly joinedAt: Date;
  readonly actorEmail: string;
  /**
   * Account id of the recruiter: `audit_event.actorId` is a FK to
   * `UserAccount`, never to the employee.
   */
  readonly actorId: string;
  readonly dni: string;
  readonly email: string;
  readonly phone: string;
  readonly dateOfBirth: Date;
  readonly street: string;
  readonly streetNumber: string;
  readonly floor: string | null;
  readonly apartment: string | null;
  readonly city: string;
  readonly province: string;
  readonly postalCode: string;
}

export interface RecruitEmployeeOutput {
  readonly employee: EmployeeRecord;
  readonly assignedLevel: number;
  readonly supervisorId: string;
}

export class RecruitEmployeeUseCase {
  constructor(
    private readonly organizationRepository: OrganizationRepository,
    private readonly auditPort: AuditPort,
  ) {}

  async execute(
    input: RecruitEmployeeInput,
  ): Promise<RecruitEmployeeOutput> {
    return this.organizationRepository.executeInTransaction(async (repo) => {
      // 1. Find recruiter
      const recruiter = await repo.findEmployeeById(input.recruiterId);
      if (!recruiter) {
        throw new NotFoundError("Recruiter", input.recruiterId);
      }

      if (recruiter.status !== "ACTIVE") {
        throw new DomainRuleError(
          "Only active employees can recruit.",
          "RECRUITER_INACTIVE",
        );
      }

      // 2. Validate recruiter can recruit
      if (!canRecruit(recruiter.currentLevelId ?? 0)) {
        throw new DomainRuleError(
          `Level N${recruiter.currentLevelId} does not have recruitment capability.`,
          "RECRUITMENT_NOT_ALLOWED",
        );
      }

      // 3. Determine assigned level
      const assignedLevel = getRecruitedLevel(
        recruiter.currentLevelId!,
      );
      if (assignedLevel === null) {
        throw new DomainRuleError(
          "Cannot determine recruitment level.",
          "RECRUITMENT_LEVEL_UNKNOWN",
        );
      }

      // 4. Create employee
      const newEmployee = await repo.createEmployee({
        firstName: input.firstName,
        lastName: input.lastName,
        joinedAt: input.joinedAt,
        currentLevelId: assignedLevel,
        supervisorId: input.recruiterId,
        dni: input.dni,
        email: input.email,
        phone: input.phone,
        dateOfBirth: input.dateOfBirth,
        street: input.street,
        streetNumber: input.streetNumber,
        floor: input.floor,
        apartment: input.apartment,
        city: input.city,
        province: input.province,
        postalCode: input.postalCode,
      });

      // 5. Create level history
      await repo.createLevelHistory({
        employeeId: newEmployee.id,
        levelId: assignedLevel,
        startedAt: input.joinedAt,
        reason: `Initial recruitment by ${recruiter.firstName} ${recruiter.lastName}`,
      });

      // 6. Create supervisor history
      await repo.createSupervisorHistory({
        employeeId: newEmployee.id,
        supervisorId: input.recruiterId,
        startedAt: input.joinedAt,
        reason: `Initial recruitment by ${recruiter.firstName} ${recruiter.lastName}`,
      });

      const now = new Date();

      // 7. Record audit event
      await this.auditPort.log({
        actorId: input.actorId,
        actorEmail: input.actorEmail,
        action: AuditAction.EMPLOYEE_CREATED,
        resourceType: "Employee",
        resourceId: newEmployee.id,
        result: "SUCCESS",
        correlationId: null,
        metadata: {
          firstName: input.firstName,
          lastName: input.lastName,
          assignedLevel,
          supervisorId: input.recruiterId,
          joinedAt: input.joinedAt,
        },
        timestamp: now,
      });

      return {
        employee: newEmployee,
        assignedLevel,
        supervisorId: input.recruiterId,
      };
    });
  }
}
