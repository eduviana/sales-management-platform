import { createOrganizationModule } from "@/modules/organization/composition-root";
import { createSalesUseCases } from "@/modules/sales/composition-root";
import { createCommissionUseCases } from "@/modules/commissions/composition-root";
import { resolveAuthContext } from "@/modules/identity/resolve-auth-context";
import { SalesTable } from "@/app/(app)/sales/sales-table";

export const dynamic = "force-dynamic";

export default async function TeamSalesPage() {
  const authContext = await resolveAuthContext();
  const useCases = createSalesUseCases();
  const result = await useCases.listSales.execute({ authContext, scope: "TEAM" });

  // Resolve employee names for the seller column (organization module)
  const employeeIds = [...new Set(result.sales.map((s) => s.employeeId))];
  const { getEmployeeNames } = createOrganizationModule();
  const employeeMap = await getEmployeeNames.execute({ employeeIds });

  const saleIds = result.sales.map((s) => s.id);

  const { getSaleAmounts } = createCommissionUseCases();
  const commissionMap = await getSaleAmounts.execute({ saleIds });

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
