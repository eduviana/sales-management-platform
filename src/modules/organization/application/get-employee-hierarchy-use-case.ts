/**
 * Get employee hierarchy use case.
 *
 * Provides hierarchy query operations:
 * - Direct supervisor
 * - Direct subordinates
 * - Full descendant tree
 * - Ancestor chain
 *
 * Reference: organizational-model.md §3, data-model.md §7,
 *            ADR-004
 */

import type {
  OrganizationRepository,
} from "@/modules/organization/domain";
import { NotFoundError } from "@/shared/errors";

export interface HierarchyEmployee {
  readonly id: string;
  readonly firstName: string;
  readonly lastName: string;
  readonly currentLevelId: number | null;
  readonly status: "ACTIVE" | "INACTIVE";
}

export interface EmployeeHierarchyResult {
  readonly employee: HierarchyEmployee;
  readonly directSupervisor: HierarchyEmployee | null;
  readonly directSubordinates: readonly HierarchyEmployee[];
  readonly ancestorIds: readonly string[];
  readonly descendantIds: readonly string[];
}

export interface GetEmployeeHierarchyInput {
  readonly employeeId: string;
}

export class GetEmployeeHierarchyUseCase {
  constructor(
    private readonly organizationRepository: OrganizationRepository,
  ) {}

  async execute(
    input: GetEmployeeHierarchyInput,
  ): Promise<EmployeeHierarchyResult> {
    // 1. Find employee
    const employee =
      await this.organizationRepository.findEmployeeById(
        input.employeeId,
      );
    if (!employee) {
      throw new NotFoundError("Employee", input.employeeId);
    }

    // 2. Get direct supervisor
    let directSupervisor: HierarchyEmployee | null = null;
    if (employee.supervisorId) {
      const supervisor =
        await this.organizationRepository.findEmployeeById(
          employee.supervisorId,
        );
      if (supervisor) {
        directSupervisor = {
          id: supervisor.id,
          firstName: supervisor.firstName,
          lastName: supervisor.lastName,
          currentLevelId: supervisor.currentLevelId,
          status: supervisor.status,
        };
      }
    }

    // 3. Get direct subordinates
    const subordinates =
      await this.organizationRepository.getDirectSubordinates(
        input.employeeId,
      );

    // 4. Get ancestor and descendant IDs
    const [ancestorIds, descendantIds] = await Promise.all([
      this.organizationRepository.getAncestorIds(input.employeeId),
      this.organizationRepository.getDescendantIds(input.employeeId),
    ]);

    return {
      employee: {
        id: employee.id,
        firstName: employee.firstName,
        lastName: employee.lastName,
        currentLevelId: employee.currentLevelId,
        status: employee.status,
      },
      directSupervisor,
      directSubordinates: subordinates.map((s) => ({
        id: s.id,
        firstName: s.firstName,
        lastName: s.lastName,
        currentLevelId: s.currentLevelId,
        status: s.status,
      })),
      ancestorIds,
      descendantIds,
    };
  }
}
