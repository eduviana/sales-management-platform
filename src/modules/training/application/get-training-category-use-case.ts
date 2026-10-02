/**
 * Get training category use case.
 *
 * Returns a single category with its published courses.
 * For ADMIN: returns all courses regardless of status.
 *
 * Reference: permissions-matrix.md §4.13
 */

import type { AuthorizationService, AuthorizationContext } from "@/modules/authorization/domain";
import type { TrainingCategoryRepository, TrainingCourseRepository, TrainingCategory, TrainingCourse } from "../domain";
import { NotFoundError, AuthorizationError } from "@/shared/errors";

export interface GetTrainingCategoryInput {
  readonly authContext: AuthorizationContext;
  readonly categoryId: string;
}

export interface TrainingCategoryDetail {
  readonly category: TrainingCategory;
  readonly courses: readonly TrainingCourse[];
}

export class GetTrainingCategoryUseCase {
  constructor(
    private readonly authorizationService: AuthorizationService,
    private readonly categoryRepo: TrainingCategoryRepository,
    private readonly courseRepo: TrainingCourseRepository,
  ) {}

  async execute(input: GetTrainingCategoryInput): Promise<TrainingCategoryDetail> {
    // 1. Authorize
    const decision = await this.authorizationService.authorize(
      input.authContext,
      { permission: "training.read" },
    );

    if (!decision.allowed) {
      throw new AuthorizationError(decision.reason ?? "Not authorized to read training content.");
    }

    // 2. Find category
    const category = await this.categoryRepo.findById(input.categoryId);
    if (!category) {
      throw new NotFoundError("Training category not found.");
    }

    // 3. Get courses (filtered by status for non-ADMIN)
    const isAdmin = input.authContext.role === "ADMIN";
    const courses = isAdmin
      ? await this.courseRepo.findByCategoryId(input.categoryId)
      : await this.courseRepo.findByCategoryIdAndStatus(input.categoryId, "PUBLISHED");

    return { category, courses };
  }
}
