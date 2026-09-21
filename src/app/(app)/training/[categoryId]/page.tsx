/**
 * Training category detail page — lists courses in a category.
 *
 * Server Component that loads category details with courses.
 * ADMIN sees management controls (create, edit, delete, status toggle).
 *
 * Reference: business-rules.md REG-045, permissions-matrix.md §4.10
 */

import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/infrastructure/prisma/client";
import { createAuthorizationService } from "@/modules/authorization/composition-root";
import { createTrainingModule } from "@/modules/training/composition-root";
import { resolveAuthContext } from "@/modules/sales/presentation/resolve-auth-context";
import {
  Modal,
  CourseForm,
  DeleteButton,
  StatusToggle,
} from "@/modules/training/presentation/components";
import {
  deleteCourseFormData,
} from "@/modules/training/presentation/training-actions";

export default async function TrainingCategoryPage({
  params,
}: {
  params: Promise<{ categoryId: string }>;
}) {
  const { categoryId } = await params;
  const authContext = await resolveAuthContext();
  const authorizationService = createAuthorizationService(prisma);
  const { getCategory } = createTrainingModule(authorizationService);

  let detail;
  try {
    detail = await getCategory.execute({ authContext, categoryId });
  } catch {
    notFound();
  }

  const isAdmin = authContext.role === "ADMIN";

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <Link
            href="/training"
            className="text-sm text-on-surface-variant hover:text-on-surface transition-colors"
          >
            ← Capacitación
          </Link>
          <h1 className="text-headline-lg font-semibold text-on-surface mt-2">
            {detail.category.name}
          </h1>
          {detail.category.description && (
            <p className="text-body-md text-on-surface-variant mt-1">
              {detail.category.description}
            </p>
          )}
        </div>
        {isAdmin && (
          <Modal
            trigger={
              <button className="px-4 py-2 text-sm font-medium text-on-primary bg-primary-container rounded-lg hover:opacity-90 transition-opacity">
                Nuevo Curso
              </button>
            }
            title="Nuevo Curso"
          >
            <CourseForm mode="create" categoryId={categoryId} />
          </Modal>
        )}
      </div>

      {detail.courses.length === 0 ? (
        <div className="surface rounded-xl p-8 text-center">
          <p className="text-on-surface-variant">
            {isAdmin
              ? "No hay cursos en esta categoría. Crea el primer curso para comenzar."
              : "No hay cursos en esta categoría."}
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {detail.courses.map((course) => (
            <div
              key={course.id}
              className="surface rounded-xl p-5 flex items-center justify-between hover:bg-surface-container-highest transition-colors group"
            >
              <Link
                href={`/training/${categoryId}/${course.id}`}
                className="flex-1 min-w-0"
              >
                <h2 className="text-title-md font-semibold text-on-surface group-hover:text-primary transition-colors">
                  {course.name}
                </h2>
                {course.description && (
                  <p className="text-body-sm text-on-surface-variant mt-1 line-clamp-1">
                    {course.description}
                  </p>
                )}
              </Link>
              <div className="flex items-center gap-3 ml-4">
                {isAdmin && (
                  <>
                    <StatusToggle
                      contentType="course"
                      contentId={course.id}
                      currentStatus={course.status}
                    />
                    <Modal
                      trigger={
                        <button className="text-label-sm text-on-surface-variant hover:text-on-surface transition-colors">
                          Editar
                        </button>
                      }
                      title="Editar Curso"
                    >
                      <CourseForm
                        mode="edit"
                        categoryId={categoryId}
                        courseId={course.id}
                        initialName={course.name}
                        initialDescription={course.description ?? ""}
                        initialStatus={course.status}
                      />
                    </Modal>
                    <DeleteButton
                      label={`el curso "${course.name}"`}
                      action={deleteCourseFormData}
                      id={course.id}
                    />
                  </>
                )}
                <Link
                  href={`/training/${categoryId}/${course.id}`}
                  className="text-on-surface-variant"
                >
                  →
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
