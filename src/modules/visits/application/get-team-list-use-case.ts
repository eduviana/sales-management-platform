/**
 * GetTeamListUseCase — Get team members for a supervisor.
 *
 * N3+ supervisors can see their direct subordinates.
 * Authorization: employee.read with TEAM scope.
 *
 * Reference: business-rules.md REG-069, REG-071
 */

import type { AuthorizationService } from "@/modules/authorization/domain";
import type { AuthorizationContext } from "@/modules/authorization/domain";
import type { OrganizationRepository } from "@/modules/organization/domain";
import { AuthorizationError } from "@/shared/errors";

export interface TeamMember {
  readonly id: string;
  readonly firstName: string;
  readonly lastName: string;
  readonly currentLevelId: number | null;
  readonly status: "ACTIVE" | "INACTIVE";
}

export interface GetTeamListUseCaseInput {
  readonly authContext: AuthorizationContext;
}

export class GetTeamListUseCase {
  constructor(
    private readonly authorizationService: AuthorizationService,
    private readonly organizationRepository: OrganizationRepository,
  ) {}

  async execute(input: GetTeamListUseCaseInput): Promise<TeamMember[]> {
    // 1. Authorize: employee.read
    const decision = await this.authorizationService.authorize(
      input.authContext,
      { permission: "employee.read" },
    );

    if (!decision.allowed) {
      throw new AuthorizationError(
        decision.reason ?? "Not authorized to view team members.",
      );
    }

    // 2. Get direct subordinates
    const subordinates = await this.organizationRepository.getDirectSubordinates(
      input.authContext.employeeId,
    );

    return subordinates.map((emp) => ({
      id: emp.id,
      firstName: emp.firstName,
      lastName: emp.lastName,
      currentLevelId: emp.currentLevelId,
      status: emp.status,
    }));
  }
}
