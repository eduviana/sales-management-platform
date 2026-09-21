/**
 * Training module repository port.
 *
 * Application layer depends on this interface for module persistence.
 * Infrastructure implements the concrete Prisma-based repository.
 *
 * Reference: data-model.md §17
 */

import type { TrainingModule } from "./training-module";

export interface CreateTrainingModuleData {
  readonly courseId: string;
  readonly name: string;
  readonly description?: string;
  readonly sortOrder?: number;
}

export interface UpdateTrainingModuleData {
  readonly name?: string;
  readonly description?: string;
  readonly sortOrder?: number;
}

export interface TrainingModuleRepository {
  findById(id: string): Promise<TrainingModule | null>;
  findByCourseId(courseId: string): Promise<readonly TrainingModule[]>;
  create(data: CreateTrainingModuleData): Promise<TrainingModule>;
  update(id: string, data: UpdateTrainingModuleData): Promise<TrainingModule>;
  delete(id: string): Promise<void>;
}
