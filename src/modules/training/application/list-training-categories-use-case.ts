/**
 * List training categories use case.
 *
 * Returns categories that have at least one course (published for non-ADMIN).
 * For ADMIN: returns all categories.
 *
 * Reference: permissions-matrix.md §4.10, business-rules.md REG-045
 */

import type { AuthorizationService, AuthorizationContext } from "@/modules/authorization/domain";
import type { TrainingCategoryRepository, TrainingCourseRepository } from "../domain";

export interface ListTrainingCategoriesInput {
  readonly authContext: AuthorizationContext;
}

export interface TrainingCategorySummary {
  readonly id: string;
  readonly name: string;
  readonly description: string | null;
  readonly courseCount: number;
}

export class ListTrainingCategoriesUseCase {
  constructor(
    private readonly authorizationService: AuthorizationService,
    private readonly categoryRepo: TrainingCategoryRepository,
    private readonly courseRepo: TrainingCourseRepository,
  ) {}

  async execute(input: ListTrainingCategoriesInput): Promise<readonly TrainingCategorySummary[]> {
    // 1. Authorize
    const decision = await this.authorizationService.authorize(
      input.authContext,
      { permission: "training.read" },
    );

    if (!decision.allowed) {
      return [];
    }

    // 2. Get all categories
    const categories = await this.categoryRepo.findAll();
    const isAdmin = input.authContext.role === "ADMIN";

    // 3. For each category, check if it has accessible courses
    const summaries: TrainingCategorySummary[] = [];

    for (const category of categories) {
      const courses = isAdmin
        ? await this.courseRepo.findByCategoryId(category.id)
        : await this.courseRepo.findByCategoryIdAndStatus(category.id, "PUBLISHED");

      if (courses.length === 0) continue;

      summaries.push({
        id: category.id,
        name: category.name,
        description: category.description,
        courseCount: courses.length,
      });
    }

    return summaries;
  }
}
