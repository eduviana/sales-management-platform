/**
 * Training page — lists training categories.
 *
 * Server Component that loads categories with authorization.
 * All authenticated users can access this page.
 * ADMIN sees additional management controls.
 *
 * Reference: business-rules.md REG-045, permissions-matrix.md §4.10
 */

import Link from "next/link";
import { prisma } from "@/infrastructure/prisma/client";
import { createAuthorizationService } from "@/modules/authorization/composition-root";
import { createTrainingModule } from "@/modules/training/composition-root";
import { resolveAuthContext } from "@/modules/sales/presentation/resolve-auth-context";
import { Modal, CategoryForm } from "@/modules/training/presentation/components";

export default async function TrainingPage() {
  const authContext = await resolveAuthContext();
  const authorizationService = createAuthorizationService(prisma);
  const { listCategories } = createTrainingModule(authorizationService);

  const categories = await listCategories.execute({ authContext });
  const isAdmin = authContext.role === "ADMIN";

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <h1 className="text-headline-lg font-semibold text-on-surface">Capacitación</h1>
        {isAdmin && (
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
        )}
      </div>

      {categories.length === 0 ? (
        <div className="surface rounded-xl p-8 text-center">
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
              className="surface rounded-xl p-6 hover:bg-surface-container-highest transition-colors group"
            >
              <h2 className="text-title-lg font-semibold text-on-surface group-hover:text-primary transition-colors">
                {category.name}
              </h2>
              {category.description && (
                <p className="text-body-sm text-on-surface-variant mt-2 line-clamp-2">
                  {category.description}
                </p>
              )}
              <div className="mt-4 text-label-sm text-on-surface-variant">
                {category.courseCount} {category.courseCount === 1 ? "curso" : "cursos"}
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
