/**
 * Dashboard — Comisiones generadas del mes actual.
 *
 * Server component that loads commission entries for the authenticated user.
 *
 * Reference: requirements.md §3.2
 */

export const dynamic = "force-dynamic";

import { prisma } from "@/infrastructure/prisma/client";
import { createAuthorizationService } from "@/modules/authorization/composition-root";
import { PrismaOrganizationRepository } from "@/infrastructure/organization/prisma-organization-repository";
import { resolveAuthContext } from "@/modules/sales/presentation/resolve-auth-context";
import { AuthorizationError } from "@/shared/errors";
import { CommissionsClient } from "./commissions-client";

export default async function DashboardCommissionsPage({
  searchParams,
}: {
  searchParams: Promise<{ scope?: string }>;
}) {
  const params = await searchParams;
  const isTeam = params.scope === "team";

  const authContext = await resolveAuthContext();
  const auth = createAuthorizationService(prisma);
  const orgRepo = new PrismaOrganizationRepository(prisma);

  // Determine employee IDs based on scope — authorize first
  let employeeIds: string[];
  if (isTeam) {
    const decision = await auth.authorize(authContext, { permission: "sale.readTeam" });
    if (!decision.allowed) {
      throw new AuthorizationError(decision.reason ?? "No tienes permisos para ver comisiones del equipo.");
    }
    const subordinates = await orgRepo.getDirectSubordinates(authContext.employeeId);
    employeeIds = [authContext.employeeId, ...subordinates.map((e) => e.id)];
  } else {
    employeeIds = [authContext.employeeId];
  }

  // Current month range
  const now = new Date();
  const firstDay = new Date(now.getFullYear(), now.getMonth(), 1);
  const lastDay = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999);

  // Fetch commission entries with sale data
  const entries = await prisma.commissionEntry.findMany({
    where: {
      employeeId: { in: employeeIds },
      type: "EARNED",
      saleDate: { gte: firstDay, lte: lastDay },
    },
    include: {
      sale: {
        select: {
          saleNumber: true,
          totalAmount: true,
        },
      },
      employee: {
        select: {
          firstName: true,
          lastName: true,
        },
      },
    },
    orderBy: { saleDate: "desc" },
  });

  const monthName = now.toLocaleDateString("es-AR", { month: "long", year: "numeric" });
  const totalCommissions = entries.reduce((sum, e) => sum + Number(e.amount), 0);
  const title = isTeam ? "Comisiones del Equipo" : "Comisiones Generadas";
  const subtitle = isTeam
    ? `Comisiones del equipo generadas en ${monthName}`
    : `Comisiones generadas en ${monthName}`;

  return (
    <CommissionsClient
      entries={entries.map((e) => ({
        id: e.id,
        saleNumber: e.sale.saleNumber,
        saleDate: e.saleDate.toISOString(),
        baseAmount: Number(e.baseAmount),
        percentage: Number(e.percentage),
        amount: Number(e.amount),
        employeeName: isTeam ? `${e.employee.firstName} ${e.employee.lastName}` : undefined,
      }))}
      totalCommissions={totalCommissions}
      title={title}
      subtitle={subtitle}
      showEmployee={isTeam}
    />
  );
}
