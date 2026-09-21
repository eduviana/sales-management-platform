/**
 * Training category repository port.
 *
 * Application layer depends on this interface for category persistence.
 * Infrastructure implements the concrete Prisma-based repository.
 *
 * Reference: data-model.md §17
 */

import type { TrainingCategory } from "./training-category";

export interface CreateTrainingCategoryData {
  readonly name: string;
  readonly description?: string;
}

export interface UpdateTrainingCategoryData {
  readonly name?: string;
  readonly description?: string;
}

export interface TrainingCategoryRepository {
  findById(id: string): Promise<TrainingCategory | null>;
  findAll(): Promise<readonly TrainingCategory[]>;
  create(data: CreateTrainingCategoryData): Promise<TrainingCategory>;
  update(id: string, data: UpdateTrainingCategoryData): Promise<TrainingCategory>;
  delete(id: string): Promise<void>;
}
