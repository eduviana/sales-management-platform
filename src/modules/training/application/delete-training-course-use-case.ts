/**
 * Delete training course use case.
 *
 * Requires training.delete permission (ADMIN only).
 */

import type { AuthorizationService, AuthorizationContext } from "@/modules/authorization/domain";
import type { TrainingCourseRepository } from "../domain";
import { AuthorizationError, NotFoundError } from "@/shared/errors";

export interface DeleteTrainingCourseInput {
  readonly authContext: AuthorizationContext;
  readonly courseId: string;
}

export class DeleteTrainingCourseUseCase {
  constructor(
    private readonly authorizationService: AuthorizationService,
    private readonly courseRepo: TrainingCourseRepository,
  ) {}

  async execute(input: DeleteTrainingCourseInput): Promise<void> {
    const decision = await this.authorizationService.authorize(
      input.authContext,
      { permission: "training.delete" },
    );

    if (!decision.allowed) {
      throw new AuthorizationError(decision.reason ?? "Not authorized to delete training courses.");
    }

    const existing = await this.courseRepo.findById(input.courseId);
    if (!existing) {
      throw new NotFoundError("Training course not found.");
    }

    await this.courseRepo.delete(input.courseId);
  }
}
