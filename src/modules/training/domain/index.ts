/**
 * Barrel export for the Training module — Domain layer.
 */
export type { TrainingCategory } from "./training-category";
export type { TrainingCourse } from "./training-course";
export type { TrainingModule } from "./training-module";
export type { TrainingMaterial } from "./training-material";
export type { ContentType } from "./content-type";
export type { ContentStatus } from "./content-status";
export type {
  TrainingCategoryRepository,
  CreateTrainingCategoryData,
  UpdateTrainingCategoryData,
} from "./training-category-repository";
export type {
  TrainingCourseRepository,
  CreateTrainingCourseData,
  UpdateTrainingCourseData,
} from "./training-course-repository";
export type {
  TrainingModuleRepository,
  CreateTrainingModuleData,
  UpdateTrainingModuleData,
} from "./training-module-repository";
export type {
  TrainingMaterialRepository,
  CreateTrainingMaterialData,
  UpdateTrainingMaterialData,
} from "./training-material-repository";
