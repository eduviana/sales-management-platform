import { prisma } from "@/infrastructure/prisma/client";
import { createAuthorizationService } from "@/modules/authorization/composition-root";
import { PrismaOrganizationRepository } from "@/infrastructure/organization/prisma-organization-repository";
import { createSalesUseCases } from "@/modules/sales/composition-root";
import { resolveAuthContext } from "@/modules/sales/presentation/resolve-auth-context";
import { SalesTable } from "@/app/(app)/sales/sales-table";

export const dynamic = "force-dynamic";

export default async function TeamSalesPage() {
  const authContext = await resolveAuthContext();
  const auth = createAuthorizationService(prisma);
  const orgRepo = new PrismaOrganizationRepository(prisma);
  const useCases = createSalesUseCases(prisma, auth, orgRepo);
  const result = await useCases.listSales.execute({ authContext, scope: "TEAM" });

  // Resolve employee names for the seller column
  const employeeIds = [...new Set(result.sales.map((s) => s.employeeId))];
  const employees = await prisma.employee.findMany({
    where: { id: { in: employeeIds } },
    select: { id: true, firstName: true, lastName: true },
  });
  const employeeMap = new Map(employees.map((e) => [e.id, `${e.firstName} ${e.lastName}`]));

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
        title="Ventas de mi equipo"
        showCreateAction={false}
        sales={result.sales.map((sale) => ({
          id: sale.id,
          saleNumber: sale.saleNumber,
          saleDate: sale.saleDate.toISOString(),
          buyerName: sale.buyerName,
          totalAmount: sale.totalAmount,
          status: sale.status,
          sellerName: employeeMap.get(sale.employeeId) ?? "—",
          commissionAmount: commissionMap.get(sale.id) ?? null,
        }))}
      />
    </div>
  );
}
