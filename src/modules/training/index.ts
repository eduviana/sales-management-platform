/**
 * Barrel export for the Training module.
 */
// Domain
export type {
  TrainingCategory,
  TrainingCourse,
  TrainingModule,
  TrainingMaterial,
  ContentType,
  ContentStatus,
  TrainingCategoryRepository,
  TrainingCourseRepository,
  TrainingModuleRepository,
  TrainingMaterialRepository,
} from "./domain";

// Application
export { ListTrainingCategoriesUseCase } from "./application";
export { GetTrainingCategoryUseCase } from "./application";
export { GetTrainingCourseUseCase } from "./application";
export { CreateTrainingCategoryUseCase } from "./application";
export { UpdateTrainingCategoryUseCase } from "./application";
export { DeleteTrainingCategoryUseCase } from "./application";
export { CreateTrainingCourseUseCase } from "./application";
export { UpdateTrainingCourseUseCase } from "./application";
export { DeleteTrainingCourseUseCase } from "./application";
export { CreateTrainingModuleUseCase } from "./application";
export { UpdateTrainingModuleUseCase } from "./application";
export { DeleteTrainingModuleUseCase } from "./application";
export { CreateTrainingMaterialUseCase } from "./application";
export { UpdateTrainingMaterialUseCase } from "./application";
export { DeleteTrainingMaterialUseCase } from "./application";
export { PublishTrainingContentUseCase } from "./application";
export { ArchiveTrainingContentUseCase } from "./application";

// Composition root
export { createTrainingModule } from "./composition-root";
