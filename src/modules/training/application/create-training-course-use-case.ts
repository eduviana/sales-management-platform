/**
 * Create training course use case.
 *
 * Requires training.create permission (ADMIN only).
 */

import type { AuthorizationService, AuthorizationContext } from "@/modules/authorization/domain";
import type { TrainingCourseRepository, TrainingCourse } from "../domain";
import { AuthorizationError } from "@/shared/errors";

export interface CreateTrainingCourseInput {
  readonly authContext: AuthorizationContext;
  readonly categoryId: string;
  readonly name: string;
  readonly description?: string;
}

export class CreateTrainingCourseUseCase {
  constructor(
    private readonly authorizationService: AuthorizationService,
    private readonly courseRepo: TrainingCourseRepository,
  ) {}

  async execute(input: CreateTrainingCourseInput): Promise<TrainingCourse> {
    const decision = await this.authorizationService.authorize(
      input.authContext,
      { permission: "training.create" },
    );

    if (!decision.allowed) {
      throw new AuthorizationError(decision.reason ?? "Not authorized to create training courses.");
    }

    return this.courseRepo.create({
      categoryId: input.categoryId,
      name: input.name,
      description: input.description,
    });
  }
}
