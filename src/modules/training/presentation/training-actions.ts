/**
 * Server Actions for the Training module.
 *
 * Handles CRUD operations for training content.
 * Read operations require training.read permission.
 * Write operations require training.create/update/delete/publish permissions.
 *
 * Reference: system-architecture.md §10, permissions-matrix.md §4.13
 */

"use server";

import { createTrainingModule } from "@/modules/training/composition-root";
import { resolveAuthContext } from "@/modules/identity/resolve-auth-context";
import type { ContentType, ContentStatus } from "@/modules/training/domain";
import { toActionErrorMessage } from "@/shared/presentation/action-error";

// =============================================================================
// Read actions
// =============================================================================

export interface TrainingActionState {
  readonly data: unknown;
  readonly error: string | null;
  readonly loading: boolean;
}

export async function queryTrainingCategories(): Promise<TrainingActionState> {
  try {
    const authContext = await resolveAuthContext();
    const { listCategories } = createTrainingModule();

    const categories = await listCategories.execute({ authContext });

    return { data: categories, error: null, loading: false };
  } catch (error) {
    return { data: null, error: toActionErrorMessage(error), loading: false };
  }
}

export async function queryTrainingCategoryDetail(
  categoryId: string,
): Promise<TrainingActionState> {
  try {
    const authContext = await resolveAuthContext();
    const { getCategory } = createTrainingModule();

    const detail = await getCategory.execute({ authContext, categoryId });

    return { data: detail, error: null, loading: false };
  } catch (error) {
    return { data: null, error: toActionErrorMessage(error), loading: false };
  }
}

export async function queryTrainingCourseDetail(
  courseId: string,
): Promise<TrainingActionState> {
  try {
    const authContext = await resolveAuthContext();
    const { getCourse } = createTrainingModule();

    const detail = await getCourse.execute({ authContext, courseId });

    return { data: detail, error: null, loading: false };
  } catch (error) {
    return { data: null, error: toActionErrorMessage(error), loading: false };
  }
}

// =============================================================================
// Write actions (ADMIN only)
// =============================================================================

export async function createTrainingCategoryAction(
  name: string,
  description?: string,
): Promise<TrainingActionState> {
  try {
    const authContext = await resolveAuthContext();
    const { createCategory } = createTrainingModule();

    const category = await createCategory.execute({ authContext, name, description });

    return { data: category, error: null, loading: false };
  } catch (error) {
    return { data: null, error: toActionErrorMessage(error), loading: false };
  }
}

export async function updateTrainingCategoryAction(
  categoryId: string,
  name?: string,
  description?: string,
): Promise<TrainingActionState> {
  try {
    const authContext = await resolveAuthContext();
    const { updateCategory } = createTrainingModule();

    const category = await updateCategory.execute({ authContext, categoryId, name, description });

    return { data: category, error: null, loading: false };
  } catch (error) {
    return { data: null, error: toActionErrorMessage(error), loading: false };
  }
}

export async function deleteTrainingCategoryAction(
  categoryId: string,
): Promise<TrainingActionState> {
  try {
    const authContext = await resolveAuthContext();
    const { deleteCategory } = createTrainingModule();

    await deleteCategory.execute({ authContext, categoryId });

    return { data: null, error: null, loading: false };
  } catch (error) {
    return { data: null, error: toActionErrorMessage(error), loading: false };
  }
}

export async function createTrainingCourseAction(
  categoryId: string,
  name: string,
  description?: string,
): Promise<TrainingActionState> {
  try {
    const authContext = await resolveAuthContext();
    const { createCourse } = createTrainingModule();

    const course = await createCourse.execute({ authContext, categoryId, name, description });

    return { data: course, error: null, loading: false };
  } catch (error) {
    return { data: null, error: toActionErrorMessage(error), loading: false };
  }
}

export async function updateTrainingCourseAction(
  courseId: string,
  name?: string,
  description?: string,
  status?: ContentStatus,
): Promise<TrainingActionState> {
  try {
    const authContext = await resolveAuthContext();
    const { updateCourse } = createTrainingModule();

    const course = await updateCourse.execute({ authContext, courseId, name, description, status });

    return { data: course, error: null, loading: false };
  } catch (error) {
    return { data: null, error: toActionErrorMessage(error), loading: false };
  }
}

export async function deleteTrainingCourseAction(
  courseId: string,
): Promise<TrainingActionState> {
  try {
    const authContext = await resolveAuthContext();
    const { deleteCourse } = createTrainingModule();

    await deleteCourse.execute({ authContext, courseId });

    return { data: null, error: null, loading: false };
  } catch (error) {
    return { data: null, error: toActionErrorMessage(error), loading: false };
  }
}

export async function createTrainingModuleAction(
  courseId: string,
  name: string,
  description?: string,
  sortOrder?: number,
): Promise<TrainingActionState> {
  try {
    const authContext = await resolveAuthContext();
    const { createModule } = createTrainingModule();

    const module_ = await createModule.execute({ authContext, courseId, name, description, sortOrder });

    return { data: module_, error: null, loading: false };
  } catch (error) {
    return { data: null, error: toActionErrorMessage(error), loading: false };
  }
}

export async function updateTrainingModuleAction(
  moduleId: string,
  name?: string,
  description?: string,
  sortOrder?: number,
): Promise<TrainingActionState> {
  try {
    const authContext = await resolveAuthContext();
    const { updateModule } = createTrainingModule();

    const module_ = await updateModule.execute({ authContext, moduleId, name, description, sortOrder });

    return { data: module_, error: null, loading: false };
  } catch (error) {
    return { data: null, error: toActionErrorMessage(error), loading: false };
  }
}

export async function deleteTrainingModuleAction(
  moduleId: string,
): Promise<TrainingActionState> {
  try {
    const authContext = await resolveAuthContext();
    const { deleteModule } = createTrainingModule();

    await deleteModule.execute({ authContext, moduleId });

    return { data: null, error: null, loading: false };
  } catch (error) {
    return { data: null, error: toActionErrorMessage(error), loading: false };
  }
}

export async function createTrainingMaterialAction(
  moduleId: string,
  name: string,
  type: ContentType,
  description?: string,
  url?: string,
  levelId?: number,
): Promise<TrainingActionState> {
  try {
    const authContext = await resolveAuthContext();
    const { createMaterial } = createTrainingModule();

    const material = await createMaterial.execute({ authContext, moduleId, name, type, description, url, levelId });

    return { data: material, error: null, loading: false };
  } catch (error) {
    return { data: null, error: toActionErrorMessage(error), loading: false };
  }
}

export async function updateTrainingMaterialAction(
  materialId: string,
  name?: string,
  description?: string,
  type?: ContentType,
  url?: string,
  levelId?: number | null,
  status?: ContentStatus,
): Promise<TrainingActionState> {
  try {
    const authContext = await resolveAuthContext();
    const { updateMaterial } = createTrainingModule();

    const material = await updateMaterial.execute({ authContext, materialId, name, description, type, url, levelId, status });

    return { data: material, error: null, loading: false };
  } catch (error) {
    return { data: null, error: toActionErrorMessage(error), loading: false };
  }
}

/**
 * Update only the target level of a training material.
 *
 * Used by the ADMIN configuration screen. Requires training.update (ADMIN only).
 */
export async function updateTrainingMaterialLevelAction(
  materialId: string,
  levelId: number | null,
): Promise<TrainingActionState> {
  try {
    const authContext = await resolveAuthContext();
    const { updateMaterial } = createTrainingModule();

    const material = await updateMaterial.execute({ authContext, materialId, levelId });

    return { data: material, error: null, loading: false };
  } catch (error) {
    return { data: null, error: toActionErrorMessage(error), loading: false };
  }
}

export async function deleteTrainingMaterialAction(
  materialId: string,
): Promise<TrainingActionState> {
  try {
    const authContext = await resolveAuthContext();
    const { deleteMaterial } = createTrainingModule();

    await deleteMaterial.execute({ authContext, materialId });

    return { data: null, error: null, loading: false };
  } catch (error) {
    return { data: null, error: toActionErrorMessage(error), loading: false };
  }
}

export async function publishTrainingContentAction(
  contentType: "course" | "material",
  contentId: string,
): Promise<TrainingActionState> {
  try {
    const authContext = await resolveAuthContext();
    const { publishContent } = createTrainingModule();

    await publishContent.execute({ authContext, contentType, contentId });

    return { data: null, error: null, loading: false };
  } catch (error) {
    return { data: null, error: toActionErrorMessage(error), loading: false };
  }
}

export async function archiveTrainingContentAction(
  contentType: "course" | "material",
  contentId: string,
): Promise<TrainingActionState> {
  try {
    const authContext = await resolveAuthContext();
    const { archiveContent } = createTrainingModule();

    await archiveContent.execute({ authContext, contentType, contentId });

    return { data: null, error: null, loading: false };
  } catch (error) {
    return { data: null, error: toActionErrorMessage(error), loading: false };
  }
}

// =============================================================================
// FormData-compatible delete actions (for DeleteButton client component)
// =============================================================================

export async function deleteCategoryFormData(
  formData: FormData,
): Promise<void> {
  const id = formData.get("id") as string;
  if (!id) return;
  const authContext = await resolveAuthContext();
  const { deleteCategory } = createTrainingModule();
  await deleteCategory.execute({ authContext, categoryId: id });
}

export async function deleteCourseFormData(
  formData: FormData,
): Promise<void> {
  const id = formData.get("id") as string;
  if (!id) return;
  const authContext = await resolveAuthContext();
  const { deleteCourse } = createTrainingModule();
  await deleteCourse.execute({ authContext, courseId: id });
}

export async function deleteModuleFormData(
  formData: FormData,
): Promise<void> {
  const id = formData.get("id") as string;
  if (!id) return;
  const authContext = await resolveAuthContext();
  const { deleteModule } = createTrainingModule();
  await deleteModule.execute({ authContext, moduleId: id });
}

export async function deleteMaterialFormData(
  formData: FormData,
): Promise<void> {
  const id = formData.get("id") as string;
  if (!id) return;
  const authContext = await resolveAuthContext();
  const { deleteMaterial } = createTrainingModule();
  await deleteMaterial.execute({ authContext, materialId: id });
}
