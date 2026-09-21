/**
 * Training course detail page — shows modules and materials.
 *
 * Server Component that loads course details with modules and materials.
 * Materials are filtered by user level (cumulative access).
 * ADMIN sees management controls for modules and materials.
 *
 * Reference: business-rules.md REG-045, REG-047, REG-048, permissions-matrix.md §4.10
 */

import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/infrastructure/prisma/client";
import { createAuthorizationService } from "@/modules/authorization/composition-root";
import { createTrainingModule } from "@/modules/training/composition-root";
import { resolveAuthContext } from "@/modules/sales/presentation/resolve-auth-context";
import {
  Modal,
  ModuleForm,
  MaterialForm,
  DeleteButton,
  StatusToggle,
} from "@/modules/training/presentation/components";
import {
  deleteModuleFormData,
  deleteMaterialFormData,
} from "@/modules/training/presentation/training-actions";

const TYPE_ICONS: Record<string, string> = {
  PDF: "📄",
  VIDEO: "🎬",
  DOCUMENT: "📄",
  LINK: "🔗",
};

const TYPE_LABELS: Record<string, string> = {
  PDF: "PDF",
  VIDEO: "Video",
  DOCUMENT: "Documento",
  LINK: "Enlace",
};

const LEVEL_LABELS: Record<number, string> = {
  1: "Nivel 1",
  2: "Nivel 2",
  3: "Nivel 3",
  4: "Nivel 4",
  5: "Nivel 5",
  6: "Nivel 6",
  7: "Nivel 7",
};

export default async function TrainingCoursePage({
  params,
}: {
  params: Promise<{ categoryId: string; courseId: string }>;
}) {
  const { categoryId, courseId } = await params;
  const authContext = await resolveAuthContext();
  const authorizationService = createAuthorizationService(prisma);
  const { getCourse } = createTrainingModule(authorizationService);

  let detail;
  try {
    detail = await getCourse.execute({ authContext, courseId });
  } catch {
    notFound();
  }

  const isAdmin = authContext.role === "ADMIN";

  return (
    <div className="space-y-8">
      <div>
        <Link
          href={`/training/${categoryId}`}
          className="text-sm text-on-surface-variant hover:text-on-surface transition-colors"
        >
          ← Volver a la categoría
        </Link>
        <div className="flex items-center justify-between mt-2">
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
        <div className="surface rounded-xl p-8 text-center">
          <p className="text-on-surface-variant">
            {isAdmin
              ? "No hay módulos en este curso. Crea el primer módulo para comenzar."
              : "No hay módulos en este curso."}
          </p>
        </div>
      ) : (
        <div className="space-y-6">
          {detail.modules.map((mod, index) => (
            <div key={mod.module.id} className="surface rounded-xl overflow-hidden">
              <div className="px-6 py-4 border-b border-outline-variant flex items-center justify-between">
                <div>
                  <h2 className="text-title-md font-semibold text-on-surface">
                    <span className="text-on-surface-variant mr-2">{index + 1}.</span>
                    {mod.module.name}
                  </h2>
                  {mod.module.description && (
                    <p className="text-body-sm text-on-surface-variant mt-1">
                      {mod.module.description}
                    </p>
                  )}
                </div>
                {isAdmin && (
                  <div className="flex items-center gap-2">
                    <Modal
                      trigger={
                        <button className="px-3 py-1.5 text-label-sm font-medium text-on-primary bg-primary-container rounded-lg hover:opacity-90 transition-opacity">
                          Nuevo Material
                        </button>
                      }
                      title="Nuevo Material"
                    >
                      <MaterialForm mode="create" moduleId={mod.module.id} />
                    </Modal>
                    <Modal
                      trigger={
                        <button className="text-label-sm text-on-surface-variant hover:text-on-surface transition-colors">
                          Editar
                        </button>
                      }
                      title="Editar Módulo"
                    >
                      <ModuleForm
                        mode="edit"
                        courseId={courseId}
                        moduleId={mod.module.id}
                        initialName={mod.module.name}
                        initialDescription={mod.module.description ?? ""}
                        initialSortOrder={mod.module.sortOrder}
                      />
                    </Modal>
                    <DeleteButton
                      label={`el módulo "${mod.module.name}"`}
                      action={deleteModuleFormData}
                      id={mod.module.id}
                    />
                  </div>
                )}
              </div>

              {mod.materials.length === 0 ? (
                <div className="px-6 py-4 text-body-sm text-on-surface-variant">
                  No hay materiales en este módulo.
                </div>
              ) : (
                <div className="divide-y divide-outline-variant">
                  {mod.materials.map((material) => (
                    <div
                      key={material.id}
                      className="px-6 py-4 flex items-center justify-between"
                    >
                      <div className="flex items-center gap-3">
                        <span className="text-lg">{TYPE_ICONS[material.type] ?? "📄"}</span>
                        <div>
                          <div className="text-body-md font-medium text-on-surface">
                            {material.name}
                          </div>
                          <div className="flex items-center gap-2 mt-0.5">
                            <span className="text-label-xs text-on-surface-variant">
                              {TYPE_LABELS[material.type] ?? material.type}
                            </span>
                            {material.levelId !== null && (
                              <span className="text-label-xs text-on-surface-variant">
                                • {LEVEL_LABELS[material.levelId] ?? `Nivel ${material.levelId}`}
                              </span>
                            )}
                            {isAdmin && material.status && (
                              <StatusToggle
                                contentType="material"
                                contentId={material.id}
                                currentStatus={material.status}
                              />
                            )}
                          </div>
                          {material.description && (
                            <p className="text-body-xs text-on-surface-variant mt-1 line-clamp-1">
                              {material.description}
                            </p>
                          )}
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        {isAdmin && (
                          <>
                            <Modal
                              trigger={
                                <button className="text-label-sm text-on-surface-variant hover:text-on-surface transition-colors">
                                  Editar
                                </button>
                              }
                              title="Editar Material"
                            >
                              <MaterialForm
                                mode="edit"
                                moduleId={mod.module.id}
                                materialId={material.id}
                                initialName={material.name}
                                initialDescription={material.description ?? ""}
                                initialType={material.type}
                                initialUrl={material.url ?? ""}
                                initialLevelId={material.levelId}
                                initialStatus={material.status}
                              />
                            </Modal>
                            <DeleteButton
                              label={`el material "${material.name}"`}
                              action={deleteMaterialFormData}
                              id={material.id}
                            />
                          </>
                        )}
                        {material.url ? (
                          <a
                            href={material.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="px-3 py-1.5 text-label-sm font-medium text-on-primary bg-primary-container rounded-lg hover:opacity-90 transition-opacity"
                          >
                            {material.type === "PDF"
                              ? "Descargar"
                              : material.type === "VIDEO"
                                ? "Ver"
                                : "Abrir"}
                          </a>
                        ) : (
                          <span className="text-label-sm text-on-surface-variant">
                            Sin enlace
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
