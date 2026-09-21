/**
 * Delete training material use case.
 *
 * Requires training.delete permission (ADMIN only).
 */

import type { AuthorizationService, AuthorizationContext } from "@/modules/authorization/domain";
import type { TrainingMaterialRepository } from "../domain";
import { AuthorizationError, NotFoundError } from "@/shared/errors";

export interface DeleteTrainingMaterialInput {
  readonly authContext: AuthorizationContext;
  readonly materialId: string;
}

export class DeleteTrainingMaterialUseCase {
  constructor(
    private readonly authorizationService: AuthorizationService,
    private readonly materialRepo: TrainingMaterialRepository,
  ) {}

  async execute(input: DeleteTrainingMaterialInput): Promise<void> {
    const decision = await this.authorizationService.authorize(
      input.authContext,
      { permission: "training.delete" },
    );

    if (!decision.allowed) {
      throw new AuthorizationError(decision.reason ?? "Not authorized to delete training materials.");
    }

    const existing = await this.materialRepo.findById(input.materialId);
    if (!existing) {
      throw new NotFoundError("Training material not found.");
    }

    await this.materialRepo.delete(input.materialId);
  }
}
