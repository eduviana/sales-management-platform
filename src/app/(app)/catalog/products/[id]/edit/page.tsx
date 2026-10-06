/**
 * Edit product page — form to update a product.
 *
 * Server Component that loads the product and categories.
 * Authorization: catalog.update (ADMIN only).
 *
 * Reference: business-rules.md §16.1, permissions-matrix.md §4.5
 */

import { notFound, redirect } from "next/navigation";
import { createAuthorizationService } from "@/modules/authorization/composition-root";
import { createSalesUseCases } from "@/modules/sales/composition-root";
import { resolveAuthContext } from "@/modules/identity/resolve-auth-context";
import { UpdateProductForm } from "./update-product-form";

export default async function EditProductPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const authContext = await resolveAuthContext();
  const auth = createAuthorizationService();
  const useCases = createSalesUseCases();

  // Authorization check: catalog.update required
  const decision = await auth.authorize(authContext, { permission: "catalog.update" });
  if (!decision.allowed) {
    redirect("/catalog");
  }

  // Load product through the catalog query service
  const product = await useCases.getProductById.execute({
    authContext,
    productId: id,
  });
  if (!product) {
    notFound();
  }

  const categoriesResult = await useCases.listCategories.execute({
    authContext,
  });

  return (
    <div className="max-w-2xl">
      <h1 className="text-headline-lg font-semibold text-on-surface mb-6">
        Editar Producto
      </h1>
      <div className="surface rounded-xl p-6">
        <UpdateProductForm
          product={{
            id: product.id,
            code: product.code,
            name: product.name,
            description: product.description,
            price: Number(product.price),
            categoryId: product.categoryId,
            isActive: product.isActive,
          }}
          categories={categoriesResult.categories}
        />
      </div>
    </div>
  );
}
