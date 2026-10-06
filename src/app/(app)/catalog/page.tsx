/**
 * Catalog page — lists products and categories.
 *
 * Server Component that loads catalog data with authorization.
 * Only ADMIN users can create/edit products (catalog.create, catalog.update).
 * Other users can only view the catalog (catalog.read).
 *
 * Visual reference: design/stitch/DESIGN.md
 * Reference: business-rules.md §16.1, permissions-matrix.md §4.5
 */

export const dynamic = "force-dynamic";

import { createAuthorizationService } from "@/modules/authorization/composition-root";
import { createSalesUseCases } from "@/modules/sales/composition-root";
import { resolveAuthContext } from "@/modules/identity/resolve-auth-context";
import { CatalogTable } from "./catalog-table";

export default async function CatalogPage() {
  const authContext = await resolveAuthContext();
  const auth = createAuthorizationService();
  const useCases = createSalesUseCases();

  const [productsResult, canCreate] = await Promise.all([
    useCases.listProducts.execute({ authContext }),
    auth.authorize(authContext, { permission: "catalog.create" }).then(d => d.allowed),
  ]);

  return (
    <div className="space-y-6">
      <CatalogTable
        products={productsResult.products.map((p) => ({
          id: p.id,
          code: p.code,
          name: p.name,
          price: p.price,
          isActive: p.isActive,
        }))}
        canCreate={canCreate}
      />
    </div>
  );
}
