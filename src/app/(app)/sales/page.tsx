/**
 * Sales list page — lists accessible sales.
 *
 * Server Component that loads sales with scope-based filtering.
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

  const result = await useCases.listSales.execute({ authContext, scope: "OWN" });

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
