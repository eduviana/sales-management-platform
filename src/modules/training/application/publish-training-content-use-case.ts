/**
 * Publish training content use case.
 *
 * Changes the status of a course or material to PUBLISHED.
 * Requires training.publish permission (ADMIN only).
 *
 * Reference: permissions-matrix.md §4.10
 */

import type { AuthorizationService, AuthorizationContext } from "@/modules/authorization/domain";
import type { TrainingCourseRepository, TrainingMaterialRepository } from "../domain";
import { AuthorizationError, NotFoundError } from "@/shared/errors";

export interface PublishTrainingContentInput {
  readonly authContext: AuthorizationContext;
  readonly contentType: "course" | "material";
  readonly contentId: string;
}

export class PublishTrainingContentUseCase {
  constructor(
    private readonly authorizationService: AuthorizationService,
    private readonly courseRepo: TrainingCourseRepository,
    private readonly materialRepo: TrainingMaterialRepository,
  ) {}

  async execute(input: PublishTrainingContentInput): Promise<void> {
    const decision = await this.authorizationService.authorize(
      input.authContext,
      { permission: "training.publish" },
    );

    if (!decision.allowed) {
      throw new AuthorizationError(decision.reason ?? "Not authorized to publish training content.");
    }

    if (input.contentType === "course") {
      const course = await this.courseRepo.findById(input.contentId);
      if (!course) {
        throw new NotFoundError("Training course not found.");
      }
      await this.courseRepo.update(input.contentId, { status: "PUBLISHED" });
    } else {
      const material = await this.materialRepo.findById(input.contentId);
      if (!material) {
        throw new NotFoundError("Training material not found.");
      }
      await this.materialRepo.update(input.contentId, { status: "PUBLISHED" });
    }
  }
}
