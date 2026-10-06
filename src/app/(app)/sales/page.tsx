/**
 * Sales list page — lists accessible sales.
 *
 * Server Component that loads sales with scope-based filtering.
 * Scope is resolved by role: ADMIN queries globally (sale.readGlobal);
 * sellers/team-leaders query their own sales (sale.readOwn).
 *
 * Visual reference: design/stitch/DESIGN.md
 * Reference: business-rules.md §8, §16.1, permissions-matrix.md §4.4
 */

export const dynamic = "force-dynamic";

import { createSalesUseCases } from "@/modules/sales/composition-root";
import { createCommissionUseCases } from "@/modules/commissions/composition-root";
import { resolveAuthContext } from "@/modules/identity/resolve-auth-context";
import { SalesTable } from "./sales-table";

export default async function SalesPage() {
  const authContext = await resolveAuthContext();
  const useCases = createSalesUseCases();

  // ADMIN has GLOBAL scope (see permissions-matrix.md §4.4); non-admin
  // roles list their own sales. The authorization service validates the
  // permission server-side for each scope.
  const scope = authContext.role === "ADMIN" ? "GLOBAL" : "OWN";

  const result = await useCases.listSales.execute({ authContext, scope });

  const saleIds = result.sales.map((s) => s.id);

  const { getSaleAmounts } = createCommissionUseCases();
  const commissionMap = await getSaleAmounts.execute({ saleIds });

  return (
    <div className="space-y-6">
      <SalesTable
        sales={result.sales.map((s) => ({
          id: s.id,
          saleNumber: s.saleNumber,
          saleDate: s.saleDate.toISOString(),
          buyerName: s.buyerName,
          totalAmount: s.totalAmount,
          status: s.status,
          commissionAmount: commissionMap.get(s.id) ?? null,
        }))}
      />
    </div>
  );
}
