/**
 * Composition root for the Organization module.
 *
 * Wires up all dependencies: repository, use cases.
 * This is the only place that knows about concrete implementations.
 *
 * Must be called from server-side code only.
 */

import { prisma } from "@/infrastructure/prisma/client";
import { PrismaOrganizationRepository } from "@/infrastructure/organization/prisma-organization-repository";
import { PrismaAuditAdapter } from "@/modules/audit/infrastructure/prisma-audit-adapter";
import type { AuthorizationService } from "@/modules/authorization/domain";
import { ChangeLevelUseCase } from "./application/change-level-use-case";
import { ChangeSupervisorUseCase } from "./application/change-supervisor-use-case";
import { RecruitEmployeeUseCase } from "./application/recruit-employee-use-case";
import { DeactivateEmployeeUseCase } from "./application/deactivate-employee-use-case";
import { GetEmployeeHierarchyUseCase } from "./application/get-employee-hierarchy-use-case";
import { GetEmployeeByIdUseCase } from "./application/get-employee-by-id-use-case";
import { GetAllEmployeesUseCase } from "./application/get-all-employees-use-case";

/**
 * Create all Organization module dependencies and return use cases.
 *
 * Each call creates fresh adapter instances scoped to the current request.
 */
export function createOrganizationModule(authorizationService: AuthorizationService) {
  // Infrastructure
  const organizationRepository = new PrismaOrganizationRepository(prisma);
  const auditPort = new PrismaAuditAdapter(prisma);

  // Use cases
  const changeLevelUseCase = new ChangeLevelUseCase(organizationRepository, auditPort);
  const changeSupervisorUseCase = new ChangeSupervisorUseCase(
    organizationRepository,
    auditPort,
  );
  const recruitEmployeeUseCase = new RecruitEmployeeUseCase(
    organizationRepository,
    auditPort,
  );
  const deactivateEmployeeUseCase = new DeactivateEmployeeUseCase(
    organizationRepository,
    auditPort,
  );
  const getEmployeeHierarchyUseCase = new GetEmployeeHierarchyUseCase(
    organizationRepository,
  );
  const getEmployeeByIdUseCase = new GetEmployeeByIdUseCase(
    authorizationService,
    organizationRepository,
  );
  const getAllEmployeesUseCase = new GetAllEmployeesUseCase(
    organizationRepository,
  );

  return {
    organizationRepository,
    changeLevelUseCase,
    changeSupervisorUseCase,
    recruitEmployeeUseCase,
    deactivateEmployeeUseCase,
    getEmployeeHierarchyUseCase,
    getEmployeeByIdUseCase,
    getAllEmployeesUseCase,
  };
}
