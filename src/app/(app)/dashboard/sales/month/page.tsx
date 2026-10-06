/**
 * Dashboard — Ventas del mes actual.
 *
 * Server component that loads sales for the current calendar month.
 *
 * Reference: requirements.md §3.2
 */

export const dynamic = "force-dynamic";

import { createSalesUseCases } from "@/modules/sales/composition-root";
import { createCommissionUseCases } from "@/modules/commissions/composition-root";
import { resolveAuthContext } from "@/modules/identity/resolve-auth-context";
import { formatMonthYear } from "@/shared/presentation/format";
import { SalesDetailTable } from "../sales-detail-table";

export default async function DashboardSalesMonthPage({
  searchParams,
}: {
  searchParams: Promise<{ scope?: string }>;
}) {
  const params = await searchParams;
  const isTeam = params.scope === "team";

  const authContext = await resolveAuthContext();
  const useCases = createSalesUseCases();

  // Current month range
  const now = new Date();
  const firstDay = new Date(now.getFullYear(), now.getMonth(), 1);
  const lastDay = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999);

  const result = await useCases.listSales.execute({
    authContext,
    scope: isTeam ? "TEAM" : "OWN",
  });

  // Filter sales to current month
  const monthSales = result.sales.filter((s) => {
    const d = new Date(s.saleDate);
    return d >= firstDay && d <= lastDay;
  });

  const saleIds = monthSales.map((s) => s.id);

  const { getSaleAmounts } = createCommissionUseCases();
  const commissionMap = await getSaleAmounts.execute({ saleIds });

  const monthName = formatMonthYear(now);
  const title = isTeam ? "Ventas del Mes del Equipo" : "Ventas del Mes";
  const subtitle = isTeam
    ? `Ventas del equipo realizadas en ${monthName}`
    : `Ventas realizadas en ${monthName}`;

  return (
    <SalesDetailTable
      title={title}
      subtitle={subtitle}
      sales={monthSales.map((s) => ({
        id: s.id,
        saleNumber: s.saleNumber,
        saleDate: s.saleDate.toISOString(),
        buyerName: s.buyerName,
        totalAmount: s.totalAmount,
        status: s.status,
        commissionAmount: commissionMap.get(s.id) ?? null,
      }))}
    />
  );
}
