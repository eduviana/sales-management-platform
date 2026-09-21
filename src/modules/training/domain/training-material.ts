/**
 * Training material entity.
 *
 * A material belongs to a module and represents a single piece of training content
 * (PDF, video, document, or link).
 *
 * The levelId field defines the target level. Access is cumulative upward:
 * - levelId = null → visible to ALL levels (global material)
 * - levelId = N → visible to level N and all higher levels
 *
 * Reference: data-model.md §17, business-rules.md §13
 */

import type { ContentType } from "./content-type";
import type { ContentStatus } from "./content-status";

export interface TrainingMaterial {
  readonly id: string;
  readonly moduleId: string;
  readonly name: string;
  readonly description: string | null;
  readonly type: ContentType;
  readonly url: string | null;
  readonly levelId: number | null;
  readonly status: ContentStatus;
  readonly createdAt: Date;
  readonly updatedAt: Date;
}
