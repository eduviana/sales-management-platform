/**
 * Training course detail page — shows modules and materials.
 *
 * Server Component that loads course details with modules and materials.
 * Materials are filtered by user level (cumulative access).
 * ADMIN sees management controls for modules and materials.
 *
 * Each module is rendered by <TrainingModuleCard>.
 *
 * Visual reference: design/stitch/DESIGN.md
 * Reference: business-rules.md REG-045, REG-047, REG-048, permissions-matrix.md §4.13
 */

import Link from "next/link";
import { handlePageLoadError } from "../../../_lib/handle-page-load-error";
import { createTrainingModule } from "@/modules/training/composition-root";
import { resolveAuthContext } from "@/modules/identity/resolve-auth-context";
import {
  Modal,
  ModuleForm,
  StatusToggle,
} from "@/modules/training/presentation/components";
import { BookOpen, LayoutList } from "lucide-react";
import { TrainingModuleCard } from "./training-module-card";

export default async function TrainingCoursePage({
  params,
}: {
  params: Promise<{ categoryId: string; courseId: string }>;
}) {
  const { categoryId, courseId } = await params;
  const authContext = await resolveAuthContext();
  const { getCourse } = createTrainingModule();

  let detail;
  try {
    detail = await getCourse.execute({ authContext, courseId });
  } catch (error) {
    handlePageLoadError(error);
  }

  const isAdmin = authContext.role === "ADMIN";

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <Link
          href={`/training/${categoryId}`}
          className="text-sm text-on-surface-variant hover:text-on-surface transition-colors"
        >
          ← Volver a la categoría
        </Link>
        <div className="flex flex-wrap items-center justify-between gap-4 mt-3">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-sky-400/10 text-sky-400">
              <BookOpen className="w-5 h-5" aria-hidden="true" />
            </div>
            <div>
              <h1 className="text-headline-lg font-semibold text-on-surface">
                {detail.course.name}
              </h1>
              {detail.course.description && (
                <p className="text-body-md text-on-surface-variant mt-1">
                  {detail.course.description}
                </p>
              )}
            </div>
          </div>
          {isAdmin && (
            <div className="flex items-center gap-3">
              <StatusToggle
                contentType="course"
                contentId={detail.course.id}
                currentStatus={detail.course.status}
              />
              <Modal
                trigger={
                  <button className="px-4 py-2 text-sm font-medium text-on-primary bg-primary-container rounded-lg hover:opacity-90 transition-opacity">
                    Nuevo Módulo
                  </button>
                }
                title="Nuevo Módulo"
              >
                <ModuleForm mode="create" courseId={courseId} />
              </Modal>
            </div>
          )}
        </div>
      </div>

      {detail.modules.length === 0 ? (
        <div className="bg-surface-container border border-outline-variant rounded-2xl p-12 text-center">
          <LayoutList className="w-10 h-10 mx-auto text-on-surface-variant mb-4" aria-hidden="true" />
          <p className="text-on-surface-variant">
            {isAdmin
              ? "No hay módulos en este curso. Crea el primer módulo para comenzar."
              : "No hay módulos en este curso."}
          </p>
        </div>
      ) : (
        <div className="space-y-6">
          {detail.modules.map((mod, index) => (
            <TrainingModuleCard
              key={mod.module.id}
              mod={mod}
              index={index}
              courseId={courseId}
              isAdmin={isAdmin}
            />
          ))}
        </div>
      )}
    </div>
  );
}
