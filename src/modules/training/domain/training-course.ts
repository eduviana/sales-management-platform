/**
 * Training course entity.
 *
 * A course belongs to a category and contains modules.
 * Courses have a publication status (DRAFT, PUBLISHED, ARCHIVED).
 *
 * Reference: data-model.md §17, business-rules.md §13
 */

import type { ContentStatus } from "./content-status";

export interface TrainingCourse {
  readonly id: string;
  readonly categoryId: string;
  readonly name: string;
  readonly description: string | null;
  readonly status: ContentStatus;
  readonly createdAt: Date;
  readonly updatedAt: Date;
}
