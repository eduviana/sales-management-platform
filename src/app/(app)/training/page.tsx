/**
 * Training page — lists training categories.
 *
 * Server Component that loads categories with authorization.
 * All authenticated users can access this page.
 * ADMIN sees additional management controls and the level configuration screen.
 *
 * Visual reference: design/stitch/DESIGN.md
 * Reference: business-rules.md REG-045, permissions-matrix.md §4.10
 */

import Link from "next/link";
import { prisma } from "@/infrastructure/prisma/client";
import { createAuthorizationService } from "@/modules/authorization/composition-root";
import { createTrainingModule } from "@/modules/training/composition-root";
import { resolveAuthContext } from "@/modules/sales/presentation/resolve-auth-context";
import { Modal, CategoryForm } from "@/modules/training/presentation/components";
import { BookOpen } from "lucide-react";

export default async function TrainingPage() {
  const authContext = await resolveAuthContext();
  const authorizationService = createAuthorizationService(prisma);
  const { listCategories } = createTrainingModule(authorizationService);

  const categories = await listCategories.execute({ authContext });
  const isAdmin = authContext.role === "ADMIN";

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-headline-lg font-semibold text-on-surface">Capacitación</h1>
          <p className="text-body-md text-on-surface-variant mt-1">
            Material de formación organizado por categorías.
          </p>
        </div>
        <div className="flex items-center gap-3">
          {isAdmin && (
            <>
              <Link
                href="/training/configuracion"
                className="px-4 py-2 text-sm font-medium text-on-surface-variant hover:text-on-surface border border-outline-variant rounded-lg hover:border-on-surface-variant transition-colors"
              >
                Configurar niveles
              </Link>
              <Modal
                trigger={
                  <button className="px-4 py-2 text-sm font-medium text-on-primary bg-primary-container rounded-lg hover:opacity-90 transition-opacity">
                    Nueva Categoría
                  </button>
                }
                title="Nueva Categoría"
              >
                <CategoryForm mode="create" />
              </Modal>
            </>
          )}
        </div>
      </div>

      {categories.length === 0 ? (
        <div className="bg-surface-container border border-outline-variant rounded-2xl p-12 text-center">
          <BookOpen className="w-10 h-10 mx-auto text-on-surface-variant mb-4" aria-hidden="true" />
          <p className="text-on-surface-variant">
            {isAdmin
              ? "No hay categorías de capacitación. Crea la primera categoría para comenzar."
              : "No hay categorías de capacitación disponibles."}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {categories.map((category) => (
            <Link
              key={category.id}
              href={`/training/${category.id}`}
              className="group bg-surface-container border border-outline-variant rounded-2xl p-6 hover:border-primary/30 hover:bg-surface-container-high transition-colors"
            >
              <div className="p-2 rounded-lg bg-sky-400/10 text-sky-400 w-fit mb-4">
                <BookOpen className="w-5 h-5" aria-hidden="true" />
              </div>
              <h2 className="text-title-lg font-semibold text-on-surface group-hover:text-primary transition-colors">
                {category.name}
              </h2>
              {category.description && (
                <p className="text-body-sm text-on-surface-variant mt-2 line-clamp-2">
                  {category.description}
                </p>
              )}
              <div className="mt-4 flex items-center justify-between">
                <span className="text-label-sm text-on-surface-variant">
                  {category.courseCount} {category.courseCount === 1 ? "curso" : "cursos"}
                </span>
                <span className="text-on-surface-variant group-hover:text-primary transition-colors">
                  →
                </span>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}