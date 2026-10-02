/**
 * Update training category use case.
 *
 * Requires training.update permission (ADMIN only).
 *
 * Reference: permissions-matrix.md §4.13
 */

import type { AuthorizationService, AuthorizationContext } from "@/modules/authorization/domain";
import type { TrainingCategoryRepository, TrainingCategory } from "../domain";
import { AuthorizationError, NotFoundError } from "@/shared/errors";

export interface UpdateTrainingCategoryInput {
  readonly authContext: AuthorizationContext;
  readonly categoryId: string;
  readonly name?: string;
  readonly description?: string;
}

export class UpdateTrainingCategoryUseCase {
  constructor(
    private readonly authorizationService: AuthorizationService,
    private readonly categoryRepo: TrainingCategoryRepository,
  ) {}

  async execute(input: UpdateTrainingCategoryInput): Promise<TrainingCategory> {
    const decision = await this.authorizationService.authorize(
      input.authContext,
      { permission: "training.update" },
    );

    if (!decision.allowed) {
      throw new AuthorizationError(decision.reason ?? "Not authorized to update training categories.");
    }

    const existing = await this.categoryRepo.findById(input.categoryId);
    if (!existing) {
      throw new NotFoundError("Training category not found.");
    }

    return this.categoryRepo.update(input.categoryId, {
      name: input.name,
      description: input.description,
    });
  }
}
