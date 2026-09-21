/**
 * GetVisitListUseCase — Get visits for a seller.
 *
 * Sellers can see their own visits.
 * Supervisors (N3+) can see visits of their team.
 * Authorization: visit.view with OWN/TEAM scope.
 *
 * Reference: business-rules.md REG-066, REG-067, permissions-matrix.md §4.7
 */

import type { AuthorizationService } from "@/modules/authorization/domain";
import type { AuthorizationContext } from "@/modules/authorization/domain";
import type { VisitRepository } from "../domain/visit-repository";
import type { Visit } from "../domain/visit";
import type { OrganizationRepository } from "@/modules/organization/domain";
import { AuthorizationError } from "@/shared/errors";

export interface GetVisitListUseCaseInput {
  readonly authContext: AuthorizationContext;
  readonly scope?: "OWN" | "TEAM";
}

export class GetVisitListUseCase {
  constructor(
    private readonly authorizationService: AuthorizationService,
    private readonly visitRepository: VisitRepository,
    private readonly organizationRepository?: OrganizationRepository,
  ) {}

  async execute(input: GetVisitListUseCaseInput): Promise<Visit[]> {
    // 1. Authorize: visit.view
    const decision = await this.authorizationService.authorize(
      input.authContext,
      { permission: "visit.view" },
    );

    if (!decision.allowed) {
      throw new AuthorizationError(
        decision.reason ?? "Not authorized to view visits.",
      );
    }

    if (input.scope === "TEAM") {
      if (!this.organizationRepository) {
        throw new AuthorizationError("No se puede resolver el equipo autorizado.");
      }
      const subordinates = await this.organizationRepository.getDirectSubordinates(input.authContext.employeeId);
      return this.visitRepository.findBySellerIds(subordinates.map((employee) => employee.id));
    }

    return this.visitRepository.findBySellerId(input.authContext.employeeId);
  }
}
