/**
 * Update training course use case.
 *
 * Requires training.update permission (ADMIN only).
 */

import type { AuthorizationService, AuthorizationContext } from "@/modules/authorization/domain";
import type { TrainingCourseRepository, TrainingCourse, ContentStatus } from "../domain";
import { AuthorizationError, NotFoundError } from "@/shared/errors";

export interface UpdateTrainingCourseInput {
  readonly authContext: AuthorizationContext;
  readonly courseId: string;
  readonly name?: string;
  readonly description?: string;
  readonly status?: ContentStatus;
}

export class UpdateTrainingCourseUseCase {
  constructor(
    private readonly authorizationService: AuthorizationService,
    private readonly courseRepo: TrainingCourseRepository,
  ) {}

  async execute(input: UpdateTrainingCourseInput): Promise<TrainingCourse> {
    const decision = await this.authorizationService.authorize(
      input.authContext,
      { permission: "training.update" },
    );

    if (!decision.allowed) {
      throw new AuthorizationError(decision.reason ?? "Not authorized to update training courses.");
    }

    const existing = await this.courseRepo.findById(input.courseId);
    if (!existing) {
      throw new NotFoundError("Training course not found.");
    }

    return this.courseRepo.update(input.courseId, {
      name: input.name,
      description: input.description,
      status: input.status,
    });
  }
}
