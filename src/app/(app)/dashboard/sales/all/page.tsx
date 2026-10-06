/**
 * Dashboard — Todas las ventas del vendedor.
 *
 * Server component that loads all sales for the authenticated user.
 *
 * Reference: requirements.md §3.2
 */

export const dynamic = "force-dynamic";

import { createSalesUseCases } from "@/modules/sales/composition-root";
import { createCommissionUseCases } from "@/modules/commissions/composition-root";
import { resolveAuthContext } from "@/modules/identity/resolve-auth-context";
import { SalesDetailTable } from "../sales-detail-table";

export default async function DashboardSalesAllPage({
  searchParams,
}: {
  searchParams: Promise<{ scope?: string; status?: string }>;
}) {
  const params = await searchParams;
  const isTeam = params.scope === "team";
  const statusFilter = params.status;

  const authContext = await resolveAuthContext();
  const useCases = createSalesUseCases();

  const result = await useCases.listSales.execute({
    authContext,
    scope: isTeam ? "TEAM" : "OWN",
    status: statusFilter as "PENDING_REVIEW" | "APPROVED" | "REJECTED" | "CANCELLED" | "DRAFT" | undefined,
  });

  const saleIds = result.sales.map((s) => s.id);

  const { getSaleAmounts } = createCommissionUseCases();
  const commissionMap = await getSaleAmounts.execute({ saleIds });

  const isPending = statusFilter === "PENDING_REVIEW";
  const title = isTeam
    ? isPending
      ? "Pendientes de Revisión"
      : "Ventas del Equipo"
    : "Todas las Ventas";
  const subtitle = isTeam
    ? isPending
      ? "Ventas del equipo pendientes de revisión"
      : "Historial completo de ventas del equipo"
    : "Historial completo de ventas realizadas";

  return (
    <SalesDetailTable
      title={title}
      subtitle={subtitle}
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
  );
}
