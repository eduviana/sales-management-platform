/**
 * Training module entity.
 *
 * A module belongs to a course and contains materials.
 * Modules are ordered by sortOrder within a course.
 *
 * Reference: data-model.md §17, business-rules.md §13
 */

export interface TrainingModule {
  readonly id: string;
  readonly courseId: string;
  readonly name: string;
  readonly description: string | null;
  readonly sortOrder: number;
  readonly createdAt: Date;
  readonly updatedAt: Date;
}
