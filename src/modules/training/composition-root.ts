/**
 * Composition root for the Training module.
 *
 * Wires up all dependencies: repositories, use cases.
 * This is the only place that knows about concrete implementations.
 *
 * Must be called from server-side code only.
 */

import { prisma } from "@/infrastructure/prisma/client";
import { PrismaTrainingCategoryRepository } from "@/infrastructure/prisma-training/prisma-training-category-repository";
import { PrismaTrainingCourseRepository } from "@/infrastructure/prisma-training/prisma-training-course-repository";
import { PrismaTrainingModuleRepository } from "@/infrastructure/prisma-training/prisma-training-module-repository";
import { PrismaTrainingMaterialRepository } from "@/infrastructure/prisma-training/prisma-training-material-repository";
import type { AuthorizationService } from "@/modules/authorization/domain";

// Read use cases
import { ListTrainingCategoriesUseCase } from "./application/list-training-categories-use-case";
import { GetTrainingCategoryUseCase } from "./application/get-training-category-use-case";
import { GetTrainingCourseUseCase } from "./application/get-training-course-use-case";

// Write use cases
import { CreateTrainingCategoryUseCase } from "./application/create-training-category-use-case";
import { UpdateTrainingCategoryUseCase } from "./application/update-training-category-use-case";
import { DeleteTrainingCategoryUseCase } from "./application/delete-training-category-use-case";
import { CreateTrainingCourseUseCase } from "./application/create-training-course-use-case";
import { UpdateTrainingCourseUseCase } from "./application/update-training-course-use-case";
import { DeleteTrainingCourseUseCase } from "./application/delete-training-course-use-case";
import { CreateTrainingModuleUseCase } from "./application/create-training-module-use-case";
import { UpdateTrainingModuleUseCase } from "./application/update-training-module-use-case";
import { DeleteTrainingModuleUseCase } from "./application/delete-training-module-use-case";
import { CreateTrainingMaterialUseCase } from "./application/create-training-material-use-case";
import { UpdateTrainingMaterialUseCase } from "./application/update-training-material-use-case";
import { DeleteTrainingMaterialUseCase } from "./application/delete-training-material-use-case";
import { PublishTrainingContentUseCase } from "./application/publish-training-content-use-case";
import { ArchiveTrainingContentUseCase } from "./application/archive-training-content-use-case";

/**
 * Create all Training module dependencies and return use cases.
 *
 * Each call creates fresh adapter instances scoped to the current request.
 */
export function createTrainingModule(authorizationService: AuthorizationService) {
  // Infrastructure — repositories
  const categoryRepo = new PrismaTrainingCategoryRepository(prisma);
  const courseRepo = new PrismaTrainingCourseRepository(prisma);
  const moduleRepo = new PrismaTrainingModuleRepository(prisma);
  const materialRepo = new PrismaTrainingMaterialRepository(prisma);

  // Read use cases
  const listCategories = new ListTrainingCategoriesUseCase(authorizationService, categoryRepo, courseRepo);
  const getCategory = new GetTrainingCategoryUseCase(authorizationService, categoryRepo, courseRepo);
  const getCourse = new GetTrainingCourseUseCase(authorizationService, courseRepo, moduleRepo, materialRepo);

  // Write use cases
  const createCategory = new CreateTrainingCategoryUseCase(authorizationService, categoryRepo);
  const updateCategory = new UpdateTrainingCategoryUseCase(authorizationService, categoryRepo);
  const deleteCategory = new DeleteTrainingCategoryUseCase(authorizationService, categoryRepo);
  const createCourse = new CreateTrainingCourseUseCase(authorizationService, courseRepo);
  const updateCourse = new UpdateTrainingCourseUseCase(authorizationService, courseRepo);
  const deleteCourse = new DeleteTrainingCourseUseCase(authorizationService, courseRepo);
  const createModule = new CreateTrainingModuleUseCase(authorizationService, moduleRepo);
  const updateModule = new UpdateTrainingModuleUseCase(authorizationService, moduleRepo);
  const deleteModule = new DeleteTrainingModuleUseCase(authorizationService, moduleRepo);
  const createMaterial = new CreateTrainingMaterialUseCase(authorizationService, materialRepo);
  const updateMaterial = new UpdateTrainingMaterialUseCase(authorizationService, materialRepo);
  const deleteMaterial = new DeleteTrainingMaterialUseCase(authorizationService, materialRepo);
  const publishContent = new PublishTrainingContentUseCase(authorizationService, courseRepo, materialRepo);
  const archiveContent = new ArchiveTrainingContentUseCase(authorizationService, courseRepo, materialRepo);

  return {
    // Repositories (for direct access if needed)
    categoryRepo,
    courseRepo,
    moduleRepo,
    materialRepo,

    // Read
    listCategories,
    getCategory,
    getCourse,

    // Write
    createCategory,
    updateCategory,
    deleteCategory,
    createCourse,
    updateCourse,
    deleteCourse,
    createModule,
    updateModule,
    deleteModule,
    createMaterial,
    updateMaterial,
    deleteMaterial,
    publishContent,
    archiveContent,
  };
}
