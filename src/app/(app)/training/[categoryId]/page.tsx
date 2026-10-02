/**
 * Training category detail page — lists courses in a category.
 *
 * Server Component that loads category details with courses.
 * ADMIN sees management controls (create, edit, delete, status toggle).
 *
 * Visual reference: design/stitch/DESIGN.md
 * Reference: business-rules.md REG-045, permissions-matrix.md §4.13
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
import { BookOpen, FolderOpen } from "lucide-react";

const STATUS_COLORS: Record<string, { label: string; className: string }> = {
  PUBLISHED: {
    label: "Publicado",
    className: "bg-[#00df81]/10 text-[#00df81] border border-[#00df81]/20",
  },
  DRAFT: {
    label: "Borrador",
    className: "bg-amber-400/10 text-amber-400 border border-amber-400/20",
  },
  ARCHIVED: {
    label: "Archivado",
    className: "bg-surface-container-high text-zinc-400 border border-outline-variant",
  },
};

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
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <Link
            href="/training"
            className="text-sm text-on-surface-variant hover:text-on-surface transition-colors"
          >
            ← Capacitación
          </Link>
          <div className="flex items-center gap-3 mt-2">
            <div className="p-2 rounded-lg bg-sky-400/10 text-sky-400">
              <FolderOpen className="w-5 h-5" aria-hidden="true" />
            </div>
            <div>
              <h1 className="text-headline-lg font-semibold text-on-surface">
                {detail.category.name}
              </h1>
              {detail.category.description && (
                <p className="text-body-md text-on-surface-variant mt-1">
                  {detail.category.description}
                </p>
              )}
            </div>
          </div>
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
        <div className="bg-surface-container border border-outline-variant rounded-2xl p-12 text-center">
          <BookOpen className="w-10 h-10 mx-auto text-on-surface-variant mb-4" aria-hidden="true" />
          <p className="text-on-surface-variant">
            {isAdmin
              ? "No hay cursos en esta categoría. Crea el primer curso para comenzar."
              : "No hay cursos en esta categoría."}
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {detail.courses.map((course) => {
            const statusConfig = STATUS_COLORS[course.status] ?? STATUS_COLORS.DRAFT;
            return (
              <div
                key={course.id}
                className="group bg-surface-container border border-outline-variant rounded-2xl p-5 flex items-center justify-between hover:border-primary/30 hover:bg-surface-container-high transition-colors"
              >
                <Link
                  href={`/training/${categoryId}/${course.id}`}
                  className="flex-1 min-w-0"
                >
                  <div className="flex items-center gap-3">
                    <BookOpen className="w-4 h-4 text-on-surface-variant shrink-0" aria-hidden="true" />
                    <h2 className="text-title-md font-semibold text-on-surface group-hover:text-primary transition-colors truncate">
                      {course.name}
                    </h2>
                    {isAdmin && (
                      <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${statusConfig.className}`}>
                        {statusConfig.label}
                      </span>
                    )}
                  </div>
                  {course.description && (
                    <p className="text-body-sm text-on-surface-variant mt-1 line-clamp-1">
                      {course.description}
                    </p>
                  )}
                </Link>
                <div className="flex items-center gap-3 ml-4 shrink-0">
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
                    className="text-on-surface-variant group-hover:text-primary transition-colors"
                    aria-label={`Abrir curso ${course.name}`}
                  >
                    →
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}