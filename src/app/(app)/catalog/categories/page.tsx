/**
 * Categories page — lists categories and allows creation.
 *
 * Server Component with a Client Component form for creation.
 * Authorization: catalog.create (ADMIN only) for creating categories.
 *
 * Visual reference: design/stitch/DESIGN.md
 * Reference: business-rules.md §16.1, permissions-matrix.md §4.5
 */

import { createAuthorizationService } from "@/modules/authorization/composition-root";
import { createSalesUseCases } from "@/modules/sales/composition-root";
import { resolveAuthContext } from "@/modules/identity/resolve-auth-context";
import { CreateCategoryForm } from "./create-category-form";

export default async function CategoriesPage() {
  const authContext = await resolveAuthContext();
  const auth = createAuthorizationService();
  const useCases = createSalesUseCases();

  const [categoriesResult, canCreate] = await Promise.all([
    useCases.listCategories.execute({ authContext }),
    auth.authorize(authContext, { permission: "catalog.create" }).then(d => d.allowed),
  ]);

  return (
    <div className="space-y-8">
      <h1 className="text-headline-lg font-semibold text-on-surface">Categorías</h1>

      {/* Create category form */}
      {canCreate && (
        <div className="surface rounded-xl p-6">
          <h2 className="text-body-lg font-semibold text-on-surface mb-4">
            Nueva Categoría
          </h2>
          <CreateCategoryForm />
        </div>
      )}

      {/* Categories list */}
      <div className="surface rounded-xl overflow-hidden">
        <div className="overflow-x-auto w-full">
          <table className="w-full border-collapse">
            <thead>
              <tr className="table-header">
                <th className="py-3 px-4 text-label-md text-on-surface-variant uppercase tracking-wider text-center">
                  Nombre
                </th>
                <th className="py-3 px-4 text-label-md text-on-surface-variant uppercase tracking-wider text-center">
                  Descripción
                </th>
              </tr>
            </thead>
            <tbody className="font-body-sm text-body-sm text-on-surface-dim">
              {categoriesResult.categories.length === 0 ? (
                <tr>
                  <td colSpan={2} className="py-8 text-center text-on-surface-variant">
                    No hay categorías registradas.
                  </td>
                </tr>
              ) : (
                categoriesResult.categories.map((category) => (
                  <tr key={category.id} className="table-row">
                    <td className="py-3 px-4 text-center font-semibold">
                      {category.name}
                    </td>
                    <td className="py-3 px-4 text-center text-on-surface-variant">
                      {category.description ?? "—"}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
