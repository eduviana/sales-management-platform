/**
 * Training configuration page (ADMIN only).
 *
 * Shows the whole content hierarchy with the target level of every material,
 * so the ADMIN can configure what content each level can see.
 * Access is authorized server-side via training.manage (ADMIN only).
 *
 * Reference: permissions-matrix.md §4.13, requirements.md §2.8
 */

import Link from "next/link";
import { handlePageLoadError } from "../../_lib/handle-page-load-error";
import { createTrainingModule } from "@/modules/training/composition-root";
import { resolveAuthContext } from "@/modules/identity/resolve-auth-context";
import { MaterialLevelSelect } from "@/modules/training/presentation/components";

const TYPE_LABELS: Record<string, string> = {
  PDF: "PDF",
  VIDEO: "Video",
  DOCUMENT: "Documento",
  LINK: "Enlace",
};

const STATUS_LABELS: Record<string, string> = {
  DRAFT: "Borrador",
  PUBLISHED: "Publicado",
  ARCHIVED: "Archivado",
};

const STATUS_COLORS: Record<string, { bg: string; text: string; border: string }> = {
  PUBLISHED: { bg: "bg-[#00df81]/10", text: "text-[#00df81]", border: "border-[#00df81]/20" },
  DRAFT: { bg: "bg-amber-400/10", text: "text-amber-400", border: "border-amber-400/20" },
  ARCHIVED: { bg: "bg-surface-container-high", text: "text-zinc-400", border: "border-outline-variant" },
};

export default async function TrainingConfigPage() {
  const authContext = await resolveAuthContext();
  const { getTrainingTree } = createTrainingModule();

  let tree;
  try {
    tree = await getTrainingTree.execute({ authContext });
  } catch (error) {
    handlePageLoadError(error);
  }

  const totalMaterials = tree.categories.reduce(
    (acc, cat) =>
      acc + cat.courses.reduce(
        (a, course) =>
          a + course.modules.reduce(
            (m, mod) => m + mod.materials.length,
            0,
          ),
        0,
      ),
    0,
  );

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <Link
            href="/training"
            className="text-sm text-on-surface-variant hover:text-on-surface transition-colors"
          >
            ← Capacitación
          </Link>
          <h1 className="text-headline-lg font-semibold text-on-surface mt-2">
            Configuración de contenido
          </h1>
          <p className="text-body-md text-on-surface-variant mt-1">
            Define qué nivel ve cada material. El acceso es acumulativo: un
            usuario de nivel N ve los materiales de su nivel y todos los inferiores.
          </p>
        </div>
        <div className="text-right">
          <div className="text-2xl font-mono-data font-semibold text-on-surface">
            {totalMaterials}
          </div>
          <div className="text-xs text-on-surface-variant uppercase tracking-wider">
            materiales
          </div>
        </div>
      </div>

      {tree.categories.length === 0 ? (
        <div className="bg-surface-container border border-outline-variant rounded-2xl p-12 text-center">
          <p className="text-on-surface-variant">
            No hay contenido de capacitación. Crea una categoría para comenzar.
          </p>
        </div>
      ) : (
        <div className="space-y-6">
          {tree.categories.map((category) => (
            <section
              key={category.category.id}
              className="bg-surface-container border border-outline-variant rounded-2xl overflow-hidden"
            >
              <div className="px-6 py-4 border-b border-outline-variant bg-surface-container-lowest">
                <h2 className="text-lg font-semibold text-on-surface">
                  {category.category.name}
                </h2>
                {category.category.description && (
                  <p className="text-body-sm text-on-surface-variant mt-1">
                    {category.category.description}
                  </p>
                )}
              </div>

              {category.courses.length === 0 ? (
                <div className="px-6 py-4 text-body-sm text-on-surface-variant">
                  Sin cursos.
                </div>
              ) : (
                <div className="divide-y divide-outline-variant">
                  {category.courses.map((course) => (
                    <div key={course.course.id} className="px-6 py-5">
                      <div className="flex items-center gap-3 mb-4">
                        <h3 className="text-base font-semibold text-on-surface">
                          {course.course.name}
                        </h3>
                        <span
                          className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium border ${STATUS_COLORS[course.course.status]?.bg} ${STATUS_COLORS[course.course.status]?.text} ${STATUS_COLORS[course.course.status]?.border}`}
                        >
                          {STATUS_LABELS[course.course.status] ?? course.course.status}
                        </span>
                      </div>

                      {course.modules.length === 0 ? (
                        <p className="text-body-sm text-on-surface-variant pl-1">
                          Sin módulos.
                        </p>
                      ) : (
                        <div className="space-y-3">
                          {course.modules.map((mod) => (
                            <div
                              key={mod.module.id}
                              className="bg-surface-container-high/50 border border-outline-variant rounded-xl p-4"
                            >
                              <h4 className="text-sm font-semibold text-on-surface mb-3">
                                {mod.module.name}
                              </h4>

                              {mod.materials.length === 0 ? (
                                <p className="text-body-sm text-on-surface-variant">
                                  Sin materiales.
                                </p>
                              ) : (
                                <div className="divide-y divide-outline-variant rounded-lg overflow-hidden border border-outline-variant bg-surface">
                                  {mod.materials.map(({ material }) => (
                                    <div
                                      key={material.id}
                                      className="px-4 py-3 flex flex-wrap items-center gap-3"
                                    >
                                      <div className="min-w-0 flex-1">
                                        <div className="text-body-md font-medium text-on-surface truncate">
                                          {material.name}
                                        </div>
                                        <div className="text-label-xs text-on-surface-variant">
                                          {TYPE_LABELS[material.type] ?? material.type}
                                          {material.status === "PUBLISHED" ? " · Publicado" : ""}
                                        </div>
                                      </div>
                                      <MaterialLevelSelect
                                        materialId={material.id}
                                        currentLevelId={material.levelId}
                                      />
                                    </div>
                                  ))}
                                </div>
                              )}
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </section>
          ))}
        </div>
      )}
    </div>
  );
}