/**
 * Delete training category use case.
 *
 * Requires training.delete permission (ADMIN only).
 *
 * Reference: permissions-matrix.md §4.13
 */

import type { AuthorizationService, AuthorizationContext } from "@/modules/authorization/domain";
import type { TrainingCategoryRepository } from "../domain";
import { AuthorizationError, NotFoundError } from "@/shared/errors";

export interface DeleteTrainingCategoryInput {
  readonly authContext: AuthorizationContext;
  readonly categoryId: string;
}

export class DeleteTrainingCategoryUseCase {
  constructor(
    private readonly authorizationService: AuthorizationService,
    private readonly categoryRepo: TrainingCategoryRepository,
  ) {}

  async execute(input: DeleteTrainingCategoryInput): Promise<void> {
    const decision = await this.authorizationService.authorize(
      input.authContext,
      { permission: "training.delete" },
    );

    if (!decision.allowed) {
      throw new AuthorizationError(decision.reason ?? "Not authorized to delete training categories.");
    }

    const existing = await this.categoryRepo.findById(input.categoryId);
    if (!existing) {
      throw new NotFoundError("Training category not found.");
    }

    await this.categoryRepo.delete(input.categoryId);
  }
}
