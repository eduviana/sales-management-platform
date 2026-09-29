/**
 * Get full training tree use case.
 *
 * Returns the complete content hierarchy (categories → courses → modules → materials)
 * without any filtering by level or publication status. Used by the ADMIN
 * configuration screen to manage the target level of every material.
 *
 * Requires training.manage permission (ADMIN only).
 *
 * Reference: permissions-matrix.md §4.10, requirements.md §2.8
 */

import type { AuthorizationService, AuthorizationContext } from "@/modules/authorization/domain";
import type {
  TrainingCategoryRepository,
  TrainingCourseRepository,
  TrainingModuleRepository,
  TrainingMaterialRepository,
  TrainingCategory,
  TrainingCourse,
  TrainingModule,
  TrainingMaterial,
} from "../domain";
import { AuthorizationError } from "@/shared/errors";

export interface GetTrainingTreeInput {
  readonly authContext: AuthorizationContext;
}

export interface MaterialConfigNode {
  readonly material: TrainingMaterial;
}

export interface ModuleConfigNode {
  readonly module: TrainingModule;
  readonly materials: readonly MaterialConfigNode[];
}

export interface CourseConfigNode {
  readonly course: TrainingCourse;
  readonly modules: readonly ModuleConfigNode[];
}

export interface CategoryConfigNode {
  readonly category: TrainingCategory;
  readonly courses: readonly CourseConfigNode[];
}

export interface TrainingTree {
  readonly categories: readonly CategoryConfigNode[];
}

export class GetTrainingTreeUseCase {
  constructor(
    private readonly authorizationService: AuthorizationService,
    private readonly categoryRepo: TrainingCategoryRepository,
    private readonly courseRepo: TrainingCourseRepository,
    private readonly moduleRepo: TrainingModuleRepository,
    private readonly materialRepo: TrainingMaterialRepository,
  ) {}

  async execute(input: GetTrainingTreeInput): Promise<TrainingTree> {
    // 1. Authorize (ADMIN only)
    const decision = await this.authorizationService.authorize(
      input.authContext,
      { permission: "training.manage" },
    );

    if (!decision.allowed) {
      throw new AuthorizationError(decision.reason ?? "Not authorized to manage training content.");
    }

    // 2. Load the full hierarchy without filtering by level or status
    const categories = await this.categoryRepo.findAll();
    const categoryNodes: CategoryConfigNode[] = [];

    for (const category of categories) {
      const courses = await this.courseRepo.findByCategoryId(category.id);
      const courseNodes: CourseConfigNode[] = [];

      for (const course of courses) {
        const modules = await this.moduleRepo.findByCourseId(course.id);
        const moduleNodes: ModuleConfigNode[] = [];

        for (const mod of modules) {
          const materials = await this.materialRepo.findAll({ moduleId: mod.id });
          moduleNodes.push({
            module: mod,
            materials: materials.map((material) => ({ material })),
          });
        }

        courseNodes.push({ course, modules: moduleNodes });
      }

      categoryNodes.push({ category, courses: courseNodes });
    }

    return { categories: categoryNodes };
  }
}