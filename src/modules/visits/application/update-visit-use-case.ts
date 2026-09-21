/**
 * UpdateVisitUseCase — Update visit status.
 *
 * Sellers can update their own visits (mark as completed, no_sale, cancelled).
 * Authorization: visit.update with OWN scope.
 *
 * Reference: business-rules.md REG-066, REG-067, permissions-matrix.md §4.7
 */

import type { AuthorizationService } from "@/modules/authorization/domain";
import type { AuthorizationContext } from "@/modules/authorization/domain";
import type { VisitRepository } from "../domain/visit-repository";
import type { Visit, UpdateVisitData, VisitStatus } from "../domain/visit";
import { AuthorizationError } from "@/shared/errors";

export interface UpdateVisitUseCaseInput {
  readonly authContext: AuthorizationContext;
  readonly visitId: string;
  readonly status: VisitStatus;
  readonly completedDate?: Date;
  readonly notes?: string;
}

export class UpdateVisitUseCase {
  constructor(
    private readonly authorizationService: AuthorizationService,
    private readonly visitRepository: VisitRepository,
  ) {}

  async execute(input: UpdateVisitUseCaseInput): Promise<Visit> {
    // 1. Authorize: visit.update
    const decision = await this.authorizationService.authorize(
      input.authContext,
      { permission: "visit.update" },
    );

    if (!decision.allowed) {
      throw new AuthorizationError(
        decision.reason ?? "Not authorized to update visits.",
      );
    }

    // 2. Verify visit exists and belongs to the seller
    const visit = await this.visitRepository.findById(input.visitId);
    if (!visit) {
      throw new Error("Visit not found.");
    }

    if (visit.sellerId !== input.authContext.employeeId) {
      throw new AuthorizationError("Cannot update visits of other sellers.");
    }

    // 3. Update visit
    const data: UpdateVisitData = {
      status: input.status,
      completedDate: input.completedDate,
      notes: input.notes,
    };

    return this.visitRepository.update(input.visitId, data);
  }
}
