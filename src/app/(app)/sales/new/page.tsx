/**
 * New sale page — form to create a sale.
 *
 * Server Component that loads products for selection.
 * Client Component handles item management and total calculation.
 *
 * Reference: business-rules.md §8, §16.1, permissions-matrix.md §4.4
 */

import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { createSalesUseCases } from "@/modules/sales/composition-root";
import { createVisitsUseCases } from "@/modules/visits/composition-root";
import { resolveAuthContext } from "@/modules/identity/resolve-auth-context";
import { CreateSaleForm } from "./create-sale-form";

export default async function NewSalePage({
  searchParams,
}: {
  searchParams?: Promise<{ visitId?: string }>;
}) {
  const { visitId: requestedVisitId } = (await searchParams) ?? {};

  if (!requestedVisitId) {
    redirect("/visits");
  }
  const authContext = await resolveAuthContext();
  const useCases = createSalesUseCases();
  const visitsUseCases = createVisitsUseCases();

  const productsResult = await useCases.listProducts.execute({ authContext });

  // Only show active products
  const activeProducts = productsResult.products.filter((p) => p.isActive);
  const allVisits = await visitsUseCases.getVisitList.execute({ authContext });
  const fixedVisit = requestedVisitId
    ? allVisits.find((visit) => visit.id === requestedVisitId)
    : undefined;

  if (requestedVisitId && (!fixedVisit || (fixedVisit.status !== "assigned" && fixedVisit.status !== "completed"))) {
    notFound();
  }

  const visits = allVisits.filter((visit) => visit.status === "completed");

  return (
    <div className="max-w-5xl mx-auto space-y-8">
      {/* Back link */}
      <div className="mb-2">
        <Link
          href="/sales"
          className="inline-flex items-center text-sm font-medium text-sky-400 hover:text-sky-300 transition-colors"
        >
          <svg className="w-4 h-4 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          Volver a ventas
        </Link>
      </div>

      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl lg:text-3xl font-bold text-white tracking-tight">
          Nueva Venta
        </h1>
      </div>

      <CreateSaleForm
        products={activeProducts}
        visits={fixedVisit ? [] : visits}
        fixedVisit={fixedVisit}
      />
    </div>
  );
}
