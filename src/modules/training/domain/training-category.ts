/**
 * Training category entity.
 *
 * Top-level grouping for training content.
 * Categories contain courses, which contain modules, which contain materials.
 *
 * Reference: data-model.md §17, business-rules.md §13
 */

export interface TrainingCategory {
  readonly id: string;
  readonly name: string;
  readonly description: string | null;
  readonly createdAt: Date;
  readonly updatedAt: Date;
}
