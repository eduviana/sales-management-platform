/**
 * Edit product page — form to update a product.
 *
 * Server Component that loads the product and categories.
 * Authorization: catalog.update (ADMIN only).
 *
 * Reference: business-rules.md §16.1, permissions-matrix.md §4.5
 */

import { notFound, redirect } from "next/navigation";
import { prisma } from "@/infrastructure/prisma/client";
import { createAuthorizationService } from "@/modules/authorization/composition-root";
import { PrismaOrganizationRepository } from "@/infrastructure/organization/prisma-organization-repository";
import { createSalesUseCases } from "@/modules/sales/composition-root";
import { resolveAuthContext } from "@/modules/sales/presentation/resolve-auth-context";
import { UpdateProductForm } from "./update-product-form";

export default async function EditProductPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const authContext = await resolveAuthContext();
  const auth = createAuthorizationService(prisma);
  const orgRepo = new PrismaOrganizationRepository(prisma);
  const useCases = createSalesUseCases(prisma, auth, orgRepo);

  // Authorization check: catalog.update required
  const decision = await auth.authorize(authContext, { permission: "catalog.update" });
  if (!decision.allowed) {
    redirect("/catalog");
  }

  // Load product directly from Prisma (product detail)
  const product = await prisma.product.findUnique({ where: { id } });
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
