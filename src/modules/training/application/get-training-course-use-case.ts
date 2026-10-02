/**
 * Get training course use case.
 *
 * Returns a single course with its modules and materials.
 * Materials are filtered by user level (cumulative access).
 *
 * Reference: permissions-matrix.md §4.13
 */

import type { AuthorizationService, AuthorizationContext } from "@/modules/authorization/domain";
import type {
  TrainingCourseRepository,
  TrainingModuleRepository,
  TrainingMaterialRepository,
  TrainingCourse,
  TrainingModule,
  TrainingMaterial,
} from "../domain";
import { NotFoundError, AuthorizationError } from "@/shared/errors";

export interface GetTrainingCourseInput {
  readonly authContext: AuthorizationContext;
  readonly courseId: string;
}

export interface ModuleWithMaterials {
  readonly module: TrainingModule;
  readonly materials: readonly TrainingMaterial[];
}

export interface TrainingCourseDetail {
  readonly course: TrainingCourse;
  readonly modules: readonly ModuleWithMaterials[];
}

export class GetTrainingCourseUseCase {
  constructor(
    private readonly authorizationService: AuthorizationService,
    private readonly courseRepo: TrainingCourseRepository,
    private readonly moduleRepo: TrainingModuleRepository,
    private readonly materialRepo: TrainingMaterialRepository,
  ) {}

  async execute(input: GetTrainingCourseInput): Promise<TrainingCourseDetail> {
    // 1. Authorize
    const decision = await this.authorizationService.authorize(
      input.authContext,
      { permission: "training.read" },
    );

    if (!decision.allowed) {
      throw new AuthorizationError(decision.reason ?? "Not authorized to read training content.");
    }

    // 2. Find course
    const course = await this.courseRepo.findById(input.courseId);
    if (!course) {
      throw new NotFoundError("Training course not found.");
    }

    // 3. Get modules ordered by sortOrder
    const modules = await this.moduleRepo.findByCourseId(input.courseId);

    // 4. For each module, get accessible materials
    const isAdmin = input.authContext.role === "ADMIN";
    const modulesWithMaterials: ModuleWithMaterials[] = [];

    for (const mod of modules) {
      const materials = isAdmin
        ? await this.materialRepo.findAll({ moduleId: mod.id })
        : await this.materialRepo.findAccessibleByLevel(
            input.authContext.levelId,
            { moduleId: mod.id, status: "PUBLISHED" },
          );

      modulesWithMaterials.push({ module: mod, materials });
    }

    return { course, modules: modulesWithMaterials };
  }
}
