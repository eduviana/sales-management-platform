/**
 * Server Actions for the Training module.
 *
 * Handles CRUD operations for training content.
 * Read operations require training.read permission.
 * Write operations require training.create/update/delete/publish permissions.
 *
 * Reference: system-architecture.md §10, permissions-matrix.md §4.10
 */

"use server";

import { createAuthorizationService } from "@/modules/authorization/composition-root";
import { createTrainingModule } from "@/modules/training/composition-root";
import { prisma } from "@/infrastructure/prisma/client";
import { resolveAuthContext } from "@/modules/sales/presentation/resolve-auth-context";
import type { ContentType, ContentStatus } from "@/modules/training/domain";

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
    const authorizationService = createAuthorizationService(prisma);
    const { listCategories } = createTrainingModule(authorizationService);

    const categories = await listCategories.execute({ authContext });

    return { data: categories, error: null, loading: false };
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return { data: null, error: message, loading: false };
  }
}

export async function queryTrainingCategoryDetail(
  categoryId: string,
): Promise<TrainingActionState> {
  try {
    const authContext = await resolveAuthContext();
    const authorizationService = createAuthorizationService(prisma);
    const { getCategory } = createTrainingModule(authorizationService);

    const detail = await getCategory.execute({ authContext, categoryId });

    return { data: detail, error: null, loading: false };
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return { data: null, error: message, loading: false };
  }
}

export async function queryTrainingCourseDetail(
  courseId: string,
): Promise<TrainingActionState> {
  try {
    const authContext = await resolveAuthContext();
    const authorizationService = createAuthorizationService(prisma);
    const { getCourse } = createTrainingModule(authorizationService);

    const detail = await getCourse.execute({ authContext, courseId });

    return { data: detail, error: null, loading: false };
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return { data: null, error: message, loading: false };
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
    const authorizationService = createAuthorizationService(prisma);
    const { createCategory } = createTrainingModule(authorizationService);

    const category = await createCategory.execute({ authContext, name, description });

    return { data: category, error: null, loading: false };
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return { data: null, error: message, loading: false };
  }
}

export async function updateTrainingCategoryAction(
  categoryId: string,
  name?: string,
  description?: string,
): Promise<TrainingActionState> {
  try {
    const authContext = await resolveAuthContext();
    const authorizationService = createAuthorizationService(prisma);
    const { updateCategory } = createTrainingModule(authorizationService);

    const category = await updateCategory.execute({ authContext, categoryId, name, description });

    return { data: category, error: null, loading: false };
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return { data: null, error: message, loading: false };
  }
}

export async function deleteTrainingCategoryAction(
  categoryId: string,
): Promise<TrainingActionState> {
  try {
    const authContext = await resolveAuthContext();
    const authorizationService = createAuthorizationService(prisma);
    const { deleteCategory } = createTrainingModule(authorizationService);

    await deleteCategory.execute({ authContext, categoryId });

    return { data: null, error: null, loading: false };
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return { data: null, error: message, loading: false };
  }
}

export async function createTrainingCourseAction(
  categoryId: string,
  name: string,
  description?: string,
): Promise<TrainingActionState> {
  try {
    const authContext = await resolveAuthContext();
    const authorizationService = createAuthorizationService(prisma);
    const { createCourse } = createTrainingModule(authorizationService);

    const course = await createCourse.execute({ authContext, categoryId, name, description });

    return { data: course, error: null, loading: false };
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return { data: null, error: message, loading: false };
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
    const authorizationService = createAuthorizationService(prisma);
    const { updateCourse } = createTrainingModule(authorizationService);

    const course = await updateCourse.execute({ authContext, courseId, name, description, status });

    return { data: course, error: null, loading: false };
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return { data: null, error: message, loading: false };
  }
}

export async function deleteTrainingCourseAction(
  courseId: string,
): Promise<TrainingActionState> {
  try {
    const authContext = await resolveAuthContext();
    const authorizationService = createAuthorizationService(prisma);
    const { deleteCourse } = createTrainingModule(authorizationService);

    await deleteCourse.execute({ authContext, courseId });

    return { data: null, error: null, loading: false };
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return { data: null, error: message, loading: false };
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
    const authorizationService = createAuthorizationService(prisma);
    const { createModule } = createTrainingModule(authorizationService);

    const module_ = await createModule.execute({ authContext, courseId, name, description, sortOrder });

    return { data: module_, error: null, loading: false };
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return { data: null, error: message, loading: false };
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
    const authorizationService = createAuthorizationService(prisma);
    const { updateModule } = createTrainingModule(authorizationService);

    const module_ = await updateModule.execute({ authContext, moduleId, name, description, sortOrder });

    return { data: module_, error: null, loading: false };
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return { data: null, error: message, loading: false };
  }
}

export async function deleteTrainingModuleAction(
  moduleId: string,
): Promise<TrainingActionState> {
  try {
    const authContext = await resolveAuthContext();
    const authorizationService = createAuthorizationService(prisma);
    const { deleteModule } = createTrainingModule(authorizationService);

    await deleteModule.execute({ authContext, moduleId });

    return { data: null, error: null, loading: false };
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return { data: null, error: message, loading: false };
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
    const authorizationService = createAuthorizationService(prisma);
    const { createMaterial } = createTrainingModule(authorizationService);

    const material = await createMaterial.execute({ authContext, moduleId, name, type, description, url, levelId });

    return { data: material, error: null, loading: false };
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return { data: null, error: message, loading: false };
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
    const authorizationService = createAuthorizationService(prisma);
    const { updateMaterial } = createTrainingModule(authorizationService);

    const material = await updateMaterial.execute({ authContext, materialId, name, description, type, url, levelId, status });

    return { data: material, error: null, loading: false };
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return { data: null, error: message, loading: false };
  }
}

export async function deleteTrainingMaterialAction(
  materialId: string,
): Promise<TrainingActionState> {
  try {
    const authContext = await resolveAuthContext();
    const authorizationService = createAuthorizationService(prisma);
    const { deleteMaterial } = createTrainingModule(authorizationService);

    await deleteMaterial.execute({ authContext, materialId });

    return { data: null, error: null, loading: false };
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return { data: null, error: message, loading: false };
  }
}

export async function publishTrainingContentAction(
  contentType: "course" | "material",
  contentId: string,
): Promise<TrainingActionState> {
  try {
    const authContext = await resolveAuthContext();
    const authorizationService = createAuthorizationService(prisma);
    const { publishContent } = createTrainingModule(authorizationService);

    await publishContent.execute({ authContext, contentType, contentId });

    return { data: null, error: null, loading: false };
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return { data: null, error: message, loading: false };
  }
}

export async function archiveTrainingContentAction(
  contentType: "course" | "material",
  contentId: string,
): Promise<TrainingActionState> {
  try {
    const authContext = await resolveAuthContext();
    const authorizationService = createAuthorizationService(prisma);
    const { archiveContent } = createTrainingModule(authorizationService);

    await archiveContent.execute({ authContext, contentType, contentId });

    return { data: null, error: null, loading: false };
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return { data: null, error: message, loading: false };
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
  const authorizationService = createAuthorizationService(prisma);
  const { deleteCategory } = createTrainingModule(authorizationService);
  await deleteCategory.execute({ authContext, categoryId: id });
}

export async function deleteCourseFormData(
  formData: FormData,
): Promise<void> {
  const id = formData.get("id") as string;
  if (!id) return;
  const authContext = await resolveAuthContext();
  const authorizationService = createAuthorizationService(prisma);
  const { deleteCourse } = createTrainingModule(authorizationService);
  await deleteCourse.execute({ authContext, courseId: id });
}

export async function deleteModuleFormData(
  formData: FormData,
): Promise<void> {
  const id = formData.get("id") as string;
  if (!id) return;
  const authContext = await resolveAuthContext();
  const authorizationService = createAuthorizationService(prisma);
  const { deleteModule } = createTrainingModule(authorizationService);
  await deleteModule.execute({ authContext, moduleId: id });
}

export async function deleteMaterialFormData(
  formData: FormData,
): Promise<void> {
  const id = formData.get("id") as string;
  if (!id) return;
  const authContext = await resolveAuthContext();
  const authorizationService = createAuthorizationService(prisma);
  const { deleteMaterial } = createTrainingModule(authorizationService);
  await deleteMaterial.execute({ authContext, materialId: id });
}
