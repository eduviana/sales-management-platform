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

import { prisma } from "@/infrastructure/prisma/client";
import { createAuthorizationService } from "@/modules/authorization/composition-root";
import { PrismaOrganizationRepository } from "@/infrastructure/organization/prisma-organization-repository";
import { createSalesUseCases } from "@/modules/sales/composition-root";
import { resolveAuthContext } from "@/modules/sales/presentation/resolve-auth-context";
import { SalesTable } from "./sales-table";

export default async function SalesPage() {
  const authContext = await resolveAuthContext();
  const auth = createAuthorizationService(prisma);
  const orgRepo = new PrismaOrganizationRepository(prisma);
  const useCases = createSalesUseCases(prisma, auth, orgRepo);

  // ADMIN has GLOBAL scope (see permissions-matrix.md §4.4); non-admin
  // roles list their own sales. The authorization service validates the
  // permission server-side for each scope.
  const scope = authContext.role === "ADMIN" ? "GLOBAL" : "OWN";

  const result = await useCases.listSales.execute({ authContext, scope });

  // Fetch commission entries for all sales in a single query
  const saleIds = result.sales.map((s) => s.id);
  const commissionEntries = await prisma.commissionEntry.findMany({
    where: { saleId: { in: saleIds }, type: "EARNED" },
    select: { saleId: true, amount: true },
  });
  const commissionMap = new Map(commissionEntries.map((e) => [e.saleId, Number(e.amount)]));

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
