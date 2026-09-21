/**
 * Training course repository port.
 *
 * Application layer depends on this interface for course persistence.
 * Infrastructure implements the concrete Prisma-based repository.
 *
 * Reference: data-model.md §17
 */

import type { TrainingCourse } from "./training-course";
import type { ContentStatus } from "./content-status";

export interface CreateTrainingCourseData {
  readonly categoryId: string;
  readonly name: string;
  readonly description?: string;
}

export interface UpdateTrainingCourseData {
  readonly name?: string;
  readonly description?: string;
  readonly status?: ContentStatus;
}

export interface TrainingCourseRepository {
  findById(id: string): Promise<TrainingCourse | null>;
  findByCategoryId(categoryId: string): Promise<readonly TrainingCourse[]>;
  findByCategoryIdAndStatus(categoryId: string, status: ContentStatus): Promise<readonly TrainingCourse[]>;
  create(data: CreateTrainingCourseData): Promise<TrainingCourse>;
  update(id: string, data: UpdateTrainingCourseData): Promise<TrainingCourse>;
  delete(id: string): Promise<void>;
}
