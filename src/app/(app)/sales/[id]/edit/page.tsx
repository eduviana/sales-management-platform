/**
 * Edit sale page — form to update a DRAFT or REJECTED sale.
 *
 * Server Component that loads the sale and products.
 *
 * Reference: business-rules.md §8, §16.1, permissions-matrix.md §4.4
 */

import { notFound } from "next/navigation";
import Link from "next/link";
import { prisma } from "@/infrastructure/prisma/client";
import { createAuthorizationService } from "@/modules/authorization/composition-root";
import { PrismaOrganizationRepository } from "@/infrastructure/organization/prisma-organization-repository";
import { createSalesUseCases } from "@/modules/sales/composition-root";
import { resolveAuthContext } from "@/modules/sales/presentation/resolve-auth-context";
import { EditSaleForm } from "./edit-sale-form";

export default async function EditSalePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const authContext = await resolveAuthContext();
  const auth = createAuthorizationService(prisma);
  const orgRepo = new PrismaOrganizationRepository(prisma);
  const useCases = createSalesUseCases(prisma, auth, orgRepo);

  let saleResult;
  try {
    saleResult = await useCases.getSale.execute({
      authContext,
      saleId: id,
    });
  } catch {
    notFound();
  }

  const { sale } = saleResult;

  // Only DRAFT and REJECTED sales can be edited
  if (sale.status !== "DRAFT" && sale.status !== "REJECTED") {
    notFound();
  }

  // Load items with product details
  const items = await prisma.saleItem.findMany({
    where: { saleId: sale.id },
    include: { product: true },
  });

  // Load active products
  const productsResult = await useCases.listProducts.execute({ authContext });
  const activeProducts = productsResult.products.filter((p) => p.isActive);

  return (
    <div className="max-w-3xl">
      <div className="mb-6">
        <Link
          href={`/sales/${sale.id}`}
          className="text-sm text-primary hover:text-primary-container mb-2 inline-block transition-colors"
        >
          ← Volver a la venta
        </Link>
        <h1 className="text-headline-lg font-semibold text-on-surface">
          {sale.status === "REJECTED" ? "Corregir Venta" : "Editar Venta"}
        </h1>
      </div>
      <div className="surface rounded-xl p-6">
        <EditSaleForm
          saleId={sale.id}
          sale={{
            saleDate: sale.saleDate.toISOString().split("T")[0],
            buyerName: sale.buyerName ?? "",
            notes: sale.notes ?? "",
          }}
          items={items.map((item) => ({
            productId: item.productId,
            productName: item.product.name,
            productCode: item.product.code,
            quantity: item.quantity,
            unitPrice: Number(item.unitPrice),
            subtotal: Number(item.subtotal),
          }))}
          products={activeProducts}
        />
      </div>
    </div>
  );
}
