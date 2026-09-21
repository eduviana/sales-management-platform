/**
 * Training material repository port.
 *
 * Application layer depends on this interface for material persistence.
 * Infrastructure implements the concrete Prisma-based repository.
 *
 * Key method: findAccessibleByLevel implements cumulative level access:
 * - levelId = null → visible to ALL levels
 * - levelId = N → visible to level N and all higher levels
 *
 * Reference: data-model.md §17, ADR-009
 */

import type { TrainingMaterial } from "./training-material";
import type { ContentStatus } from "./content-status";

export interface CreateTrainingMaterialData {
  readonly moduleId: string;
  readonly name: string;
  readonly description?: string;
  readonly type: "PDF" | "VIDEO" | "DOCUMENT" | "LINK";
  readonly url?: string;
  readonly levelId?: number;
}

export interface UpdateTrainingMaterialData {
  readonly name?: string;
  readonly description?: string;
  readonly type?: "PDF" | "VIDEO" | "DOCUMENT" | "LINK";
  readonly url?: string;
  readonly levelId?: number | null;
  readonly status?: ContentStatus;
}

export interface TrainingMaterialRepository {
  findById(id: string): Promise<TrainingMaterial | null>;
  findByModuleId(moduleId: string): Promise<readonly TrainingMaterial[]>;

  /**
   * Find materials accessible to a given level.
   * Uses cumulative access: levelId IS NULL OR levelId <= userLevelId.
   * Only returns PUBLISHED materials for non-ADMIN users.
   */
  findAccessibleByLevel(
    userLevelId: number | null,
    filters?: { moduleId?: string; status?: ContentStatus },
  ): Promise<readonly TrainingMaterial[]>;

  /**
   * Find all materials (ADMIN only, no level filtering).
   */
  findAll(filters?: { moduleId?: string; status?: ContentStatus }): Promise<readonly TrainingMaterial[]>;

  create(data: CreateTrainingMaterialData): Promise<TrainingMaterial>;
  update(id: string, data: UpdateTrainingMaterialData): Promise<TrainingMaterial>;
  delete(id: string): Promise<void>;
}
