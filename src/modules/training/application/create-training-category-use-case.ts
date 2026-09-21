/**
 * Create training category use case.
 *
 * Requires training.create permission (ADMIN only).
 *
 * Reference: permissions-matrix.md §4.10
 */

import type { AuthorizationService, AuthorizationContext } from "@/modules/authorization/domain";
import type { TrainingCategoryRepository, TrainingCategory } from "../domain";
import { AuthorizationError } from "@/shared/errors";

export interface CreateTrainingCategoryInput {
  readonly authContext: AuthorizationContext;
  readonly name: string;
  readonly description?: string;
}

export class CreateTrainingCategoryUseCase {
  constructor(
    private readonly authorizationService: AuthorizationService,
    private readonly categoryRepo: TrainingCategoryRepository,
  ) {}

  async execute(input: CreateTrainingCategoryInput): Promise<TrainingCategory> {
    const decision = await this.authorizationService.authorize(
      input.authContext,
      { permission: "training.create" },
    );

    if (!decision.allowed) {
      throw new AuthorizationError(decision.reason ?? "Not authorized to create training categories.");
    }

    return this.categoryRepo.create({
      name: input.name,
      description: input.description,
    });
  }
}
