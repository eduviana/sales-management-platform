/**
 * Dashboard — Ventas del mes actual.
 *
 * Server component that loads sales for the current calendar month.
 *
 * Reference: requirements.md §3.2
 */

export const dynamic = "force-dynamic";

import { prisma } from "@/infrastructure/prisma/client";
import { createAuthorizationService } from "@/modules/authorization/composition-root";
import { createSalesUseCases } from "@/modules/sales/composition-root";
import { PrismaOrganizationRepository } from "@/infrastructure/organization/prisma-organization-repository";
import { resolveAuthContext } from "@/modules/sales/presentation/resolve-auth-context";
import { SalesDetailTable } from "../sales-detail-table";

export default async function DashboardSalesMonthPage({
  searchParams,
}: {
  searchParams: Promise<{ scope?: string }>;
}) {
  const params = await searchParams;
  const isTeam = params.scope === "team";

  const authContext = await resolveAuthContext();
  const auth = createAuthorizationService(prisma);
  const orgRepo = new PrismaOrganizationRepository(prisma);
  const useCases = createSalesUseCases(prisma, auth, orgRepo);

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

  // Fetch commission entries for filtered sales
  const saleIds = monthSales.map((s) => s.id);
  const commissionEntries = await prisma.commissionEntry.findMany({
    where: { saleId: { in: saleIds }, type: "EARNED" },
    select: { saleId: true, amount: true },
  });
  const commissionMap = new Map(commissionEntries.map((e) => [e.saleId, Number(e.amount)]));

  const monthName = now.toLocaleDateString("es-AR", { month: "long", year: "numeric" });
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
