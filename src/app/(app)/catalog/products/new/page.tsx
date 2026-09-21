/**
 * New product page — form to create a product.
 *
 * Server Component that loads categories for the dropdown.
 * Authorization: catalog.create (ADMIN only).
 *
 * Visual reference: design/stitch/DESIGN.md
 * Reference: business-rules.md §16.1, permissions-matrix.md §4.5
 */

import { redirect } from "next/navigation";
import { prisma } from "@/infrastructure/prisma/client";
import { createAuthorizationService } from "@/modules/authorization/composition-root";
import { PrismaOrganizationRepository } from "@/infrastructure/organization/prisma-organization-repository";
import { createSalesUseCases } from "@/modules/sales/composition-root";
import { resolveAuthContext } from "@/modules/sales/presentation/resolve-auth-context";
import { CreateProductForm } from "./create-product-form";

export default async function NewProductPage() {
  const authContext = await resolveAuthContext();
  const auth = createAuthorizationService(prisma);
  const orgRepo = new PrismaOrganizationRepository(prisma);
  const useCases = createSalesUseCases(prisma, auth, orgRepo);

  // Authorization check: catalog.create required
  const decision = await auth.authorize(authContext, { permission: "catalog.create" });
  if (!decision.allowed) {
    redirect("/catalog");
  }

  const categoriesResult = await useCases.listCategories.execute({
    authContext,
  });

  return (
    <div className="max-w-2xl">
      <h1 className="text-headline-lg font-semibold text-on-surface mb-6">
        Nuevo Producto
      </h1>
      <div className="surface rounded-xl p-6">
        <CreateProductForm categories={categoriesResult.categories} />
      </div>
    </div>
  );
}
