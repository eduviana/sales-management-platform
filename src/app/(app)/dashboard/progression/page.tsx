/**
 * Dashboard — Progreso del objetivo.
 *
 * Server component that reconstructs progression detail from source tables.
 * - scope=own (default): individual seller's progression entries.
 * - scope=team: N3+ supervisor's team — aggregated entries + per-member summaries.
 *
 * Reference: requirements.md §3.13, business-rules.md REG-082, REG-083
 */

export const dynamic = "force-dynamic";

import { prisma } from "@/infrastructure/prisma/client";
import { createAuthorizationService } from "@/modules/authorization/composition-root";
import { PrismaOrganizationRepository } from "@/infrastructure/organization/prisma-organization-repository";
import { createProgressionModule } from "@/modules/progression/composition-root";
import { PrismaAnalyticsRepository } from "@/modules/analytics/infrastructure";
import { getThresholdForLevel } from "@/modules/progression/domain";
import { resolveAuthContext } from "@/modules/sales/presentation/resolve-auth-context";
import { AuthorizationError } from "@/shared/errors";
import { ProgressionClient } from "./progression-client";

interface ProgressionEntryDto {
  date: string;
  type: "SENIORITY" | "VISIT" | "SALE" | "TARGET";
  description: string;
  points: number;
}

interface TeamMemberDto {
  employeeId: string;
  firstName: string;
  lastName: string;
  currentLevelId: number | null;
  joinedAt: string;
  pointsToNextLevel: number;
  assignedVisits: number;
  completedVisits: number;
  pendingVisits: number;
  monthlySales: number;
  monthlyTarget: number;
  objectiveProgress: number;
}

interface TeamTargetDto {
  progress: number;
  currentSales: number;
  targetTotal: number;
}

interface CommissionEntryDto {
  date: string;
  amount: number;
}

type TeamVisitStatus = "ASSIGNED" | "COMPLETED" | "NO_SALE" | "CANCELLED";
type TeamSaleStatus = "DRAFT" | "PENDING_REVIEW" | "APPROVED" | "REJECTED" | "CANCELLED";

interface TeamVisitDto {
  date: string;
  status: TeamVisitStatus;
}

interface TeamSaleDto {
  date: string;
  status: TeamSaleStatus;
}

type TeamHistoryStatus =
  | "NO_SALE" // visita realizada sin venta (aprobación automática)
  | "VISIT_CANCELLED" // visita cancelada
  | "SALE_PENDING" // visita con venta pendiente de aprobación
  | "SALE_APPROVED" // visita con venta aprobada
  | "SALE_REJECTED" // visita con venta rechazada
  | "SALE_CANCELLED"; // visita con venta cancelada

/**
 * Operational history row for the team period table.
 * One row per performed visit; the status expresses the visit outcome
 * (including the state of the linked sale). No point/score data.
 */
interface TeamHistoryDto {
  date: string;
  memberName: string;
  status: TeamHistoryStatus;
  /** Total quantity of sold products (sum of item quantities). Only when the visit resulted in a sale. */
  productCount?: number;
  /** Sale total (net of discounts). Only when the visit resulted in a sale. */
  total?: number;
}

export default async function DashboardProgressionPage({
  searchParams,
}: {
  searchParams: Promise<{ scope?: string }>;
}) {
  const params = await searchParams;
  const isTeam = params.scope === "team";

  const authContext = await resolveAuthContext();

  if (isTeam) {
    return renderTeamView(authContext);
  }

  return renderPersonalView(authContext.employeeId);
}

// =============================================================================
// Personal view (existing behaviour + real threshold)
// =============================================================================

async function renderPersonalView(employeeId: string) {
  const employee = await prisma.employee.findUnique({
    where: { id: employeeId },
    select: { joinedAt: true, currentLevelId: true },
  });

  if (!employee) {
    return (
      <div className="space-y-6">
        <header>
          <h1 className="text-2xl font-semibold text-on-surface mb-1">Progreso del Objetivo</h1>
        </header>
        <div className="bg-surface border border-outline-variant rounded-xl p-8 text-center">
          <p className="text-on-surface-variant">Empleado no encontrado.</p>
        </div>
      </div>
    );
  }

  const entries = await buildEntriesForEmployee(employeeId, employee.joinedAt);
  const threshold = getThresholdForLevel(employee.currentLevelId);

  return (
    <ProgressionClient
      scope="personal"
      entries={entries}
      employeeJoinedAt={employee.joinedAt.toISOString()}
      threshold={threshold}
    />
  );
}

// =============================================================================
// Team view (N3+ supervisor)
// =============================================================================

async function renderTeamView(authContext: Awaited<ReturnType<typeof resolveAuthContext>>) {
  // 1. Authorize — team analytics visibility (N3+)
  const auth = createAuthorizationService(prisma);
  const decision = await auth.authorize(authContext, { permission: "analytics.viewTeam" });
  if (!decision.allowed) {
    throw new AuthorizationError(
      decision.reason ?? "No tienes permisos para ver la progresión del equipo.",
    );
  }

  // 2. Resolve team members (direct subordinates)
  const orgRepo = new PrismaOrganizationRepository(prisma);
  const subordinates = await orgRepo.getDirectSubordinates(authContext.employeeId);
  const activeMembers = subordinates.filter((m) => m.status === "ACTIVE");
  const memberIds = activeMembers.map((m) => m.id);

  // 2.1 Current month range (per-member objective progress + team target)
  const now = new Date();
  const firstDay = new Date(now.getFullYear(), now.getMonth(), 1);
  const lastDay = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999);

  // 2.2 Per-member visits (assigned = all; completed = COMPLETED + NO_SALE; pending = ASSIGNED)
  //     and current-month sales. Same semantics as VisitsModule (countBySellerId /
  //     countPendingBySellerId) and analytics countSales (APPROVED + PENDING_REVIEW).
  const memberLevelIds = Array.from(
    new Set(
      activeMembers
        .map((m) => m.currentLevelId)
        .filter((id): id is number => id !== null),
    ),
  );

  const [assignedRows, completedRows, pendingRows, monthlySalesRows, targetRows] = await Promise.all([
    prisma.visit.groupBy({
      by: ["sellerId"],
      where: { sellerId: { in: memberIds } },
      _count: { _all: true },
    }),
    prisma.visit.groupBy({
      by: ["sellerId"],
      where: {
        sellerId: { in: memberIds },
        status: { in: ["COMPLETED", "NO_SALE"] as const },
      },
      _count: { _all: true },
    }),
    prisma.visit.groupBy({
      by: ["sellerId"],
      where: { sellerId: { in: memberIds }, status: "ASSIGNED" },
      _count: { _all: true },
    }),
    prisma.sale.groupBy({
      by: ["employeeId"],
      where: {
        employeeId: { in: memberIds },
        saleDate: { gte: firstDay, lte: lastDay },
        status: { in: ["APPROVED", "PENDING_REVIEW"] as const },
      },
      _count: { _all: true },
    }),
    prisma.monthlyTarget.findMany({
      where: { levelId: { in: memberLevelIds } },
      select: { levelId: true, targetSales: true },
    }),
  ]);

  const assignedVisitsByMember = new Map(
    assignedRows.map((r) => [r.sellerId, r._count._all ?? 0]),
  );
  const completedVisitsByMember = new Map(
    completedRows.map((r) => [r.sellerId, r._count._all ?? 0]),
  );
  const pendingVisitsByMember = new Map(
    pendingRows.map((r) => [r.sellerId, r._count._all ?? 0]),
  );
  const monthlySalesByMember = new Map(
    monthlySalesRows.map((r) => [r.employeeId, r._count._all ?? 0]),
  );
  // Same fallback as PrismaAnalyticsRepository.getMonthlyTarget (default 15)
  const targetSalesByLevel = new Map(targetRows.map((t) => [t.levelId, t.targetSales]));

  const resolveMonthlyTarget = (levelId: number | null): number => {
    if (levelId === null) return 0;
    return targetSalesByLevel.get(levelId) ?? 15;
  };

  // 3. Per-member lifetime summaries (points to next level for promotion badge)
  const progression = createProgressionModule(prisma);
  const summaries = await progression.getEmployeeProgression.executeBatch(
    activeMembers.map((m) => ({
      id: m.id,
      currentLevelId: m.currentLevelId,
      joinedAt: m.joinedAt,
    })),
  );

  const members: TeamMemberDto[] = activeMembers.map((m) => {
    const s = summaries.get(m.id);
    const monthlyTarget = resolveMonthlyTarget(m.currentLevelId);
    const monthlySales = monthlySalesByMember.get(m.id) ?? 0;
    const objectiveProgress = monthlyTarget > 0
      ? Math.min(Math.round((monthlySales / monthlyTarget) * 100), 100)
      : 0;
    return {
      employeeId: m.id,
      firstName: m.firstName,
      lastName: m.lastName,
      currentLevelId: m.currentLevelId,
      joinedAt: m.joinedAt.toISOString(),
      pointsToNextLevel: s?.pointsToNextLevel ?? 0,
      assignedVisits: assignedVisitsByMember.get(m.id) ?? 0,
      completedVisits: completedVisitsByMember.get(m.id) ?? 0,
      pendingVisits: pendingVisitsByMember.get(m.id) ?? 0,
      monthlySales,
      monthlyTarget,
      objectiveProgress,
    };
  });

  // 4. Operational team history (period-filtered client-side).
  //     Domain model (REG-066/REG-067/REG-078): one row per performed visit.
  //     The seller registers the visit with `completed` (con venta) or `no_sale`
  //     (sin venta). A visit that resulted in a sale creates a linked Sale that
  //     enters PENDING_REVIEW until the supervisor approves/rejects it. Visits
  //     with no sale require no supervisor action. Sales not yet sent to review
  //     (DRAFT) are not visible to the supervisor yet (REG-067). Every sale must
  //     be linked to a completed visit (REG-078), so there are no standalone
  //     sale rows in this table.
  const [historyVisits] = await Promise.all([
    prisma.visit.findMany({
      where: {
        sellerId: { in: memberIds },
        status: { in: ["COMPLETED", "NO_SALE", "CANCELLED"] as const },
      },
      select: {
        scheduledDate: true,
        status: true,
        client: { select: { name: true } },
        seller: { select: { firstName: true, lastName: true } },
        sale: {
          select: {
            id: true,
            status: true,
            saleNumber: true,
            buyerName: true,
            totalAmount: true,
            items: { select: { quantity: true } },
          },
        },
      },
      orderBy: { scheduledDate: "desc" },
    }),
  ]);

  const teamHistory: TeamHistoryDto[] = historyVisits.flatMap((v) => {
    const sale = v.sale;
    // REG-067: until a sale is sent to review (status DRAFT or missing) the
    // visit result is not visible in the supervisor's table yet.
    if (v.status === "COMPLETED" && (!sale || sale.status === "DRAFT")) return [];

    let status: TeamHistoryStatus;
    if (v.status === "NO_SALE") status = "NO_SALE";
    else if (v.status === "CANCELLED") status = "VISIT_CANCELLED";
    else {
      switch (sale!.status) {
        case "PENDING_REVIEW": status = "SALE_PENDING"; break;
        case "APPROVED": status = "SALE_APPROVED"; break;
        case "REJECTED": status = "SALE_REJECTED"; break;
        case "CANCELLED": status = "SALE_CANCELLED"; break;
        default: return [];
      }
    }

    const productCount = sale ? sale.items.reduce((sum, item) => sum + item.quantity, 0) : undefined;
    const total = sale ? Number(sale.totalAmount) : undefined;

    return [
      {
        date: v.scheduledDate.toISOString(),
        memberName: `${v.seller.firstName} ${v.seller.lastName}`,
        status,
        ...(productCount !== undefined ? { productCount } : {}),
        ...(total !== undefined ? { total } : {}),
      },
    ];
  }).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  // 5. Team sales target for the current month (same calculation as dashboard)
  const analyticsRepo = new PrismaAnalyticsRepository(prisma);
  const targetPerSeller = authContext.levelId !== null
    ? await analyticsRepo.getMonthlyTarget(authContext.levelId)
    : 0;
  // Dashboard: employeeIds = [self, ...subordinates]; target = perSeller × subordinates.length
  const targetTotal = subordinates.length > 0
    ? targetPerSeller * subordinates.length
    : targetPerSeller;

  // Team objective counts only team members' sales: Maria's own sales count toward
  // her supervisor's team objective, not her own (REG-055).
  const teamMemberIds = subordinates.map((m) => m.id);
  const currentSales = await analyticsRepo.countSales(teamMemberIds, {
    from: firstDay,
    to: lastDay,
  });
  const targetProgress = targetTotal > 0
    ? Math.min(Math.round((currentSales / targetTotal) * 100), 100)
    : 0;

  const teamTarget: TeamTargetDto = {
    progress: targetProgress,
    currentSales,
    targetTotal,
  };

  // 6. Team commission entries (for period-filtered Commissions card)
  const commissionRows = await prisma.commissionEntry.findMany({
    where: {
      employeeId: { in: activeMembers.map((m) => m.id) },
      type: "EARNED",
    },
    select: { saleDate: true, amount: true },
    orderBy: { saleDate: "desc" },
  });
  const commissions: CommissionEntryDto[] = commissionRows.map((r) => ({
    date: r.saleDate.toISOString(),
    amount: Number(r.amount),
  }));

  // 7. Team visit/sale status rows (period-filtered breakdown for the cards).
  //     Sent to the client so the selected period filter applies the same way as commissions.
  const [teamVisitRows, teamSaleRows] = await Promise.all([
    prisma.visit.findMany({
      where: { sellerId: { in: memberIds } },
      select: { scheduledDate: true, status: true },
      orderBy: { scheduledDate: "desc" },
    }),
    prisma.sale.findMany({
      where: { employeeId: { in: memberIds } },
      select: { saleDate: true, status: true },
      orderBy: { saleDate: "desc" },
    }),
  ]);

  const teamVisits: TeamVisitDto[] = teamVisitRows.map((r) => ({
    date: r.scheduledDate.toISOString(),
    status: r.status,
  }));
  const teamSales: TeamSaleDto[] = teamSaleRows.map((r) => ({
    date: r.saleDate.toISOString(),
    status: r.status,
  }));

  return (
    <ProgressionClient
      scope="team"
      entries={[]}
      members={members}
      teamTarget={teamTarget}
      commissions={commissions}
      teamVisits={teamVisits}
      teamSales={teamSales}
      teamHistory={teamHistory}
      employeeJoinedAt={new Date().toISOString()}
      threshold={0}
    />
  );
}

// =============================================================================
// Entry builders (same logic as before, extracted for reuse)
// =============================================================================

async function buildEntriesForEmployee(
  employeeId: string,
  joinedAt: Date,
): Promise<ProgressionEntryDto[]> {
  const now = new Date();

  // 1. Seniority: one entry per month since joinedAt
  const seniorityMonths = monthsBetween(joinedAt, now);
  const seniorityEntries: ProgressionEntryDto[] = [];
  for (let i = 0; i < seniorityMonths; i++) {
    const monthDate = new Date(joinedAt);
    monthDate.setMonth(monthDate.getMonth() + i);
    seniorityEntries.push({
      date: monthDate.toISOString(),
      type: "SENIORITY",
      description: `Mes ${i + 1} en la empresa`,
      points: 1,
    });
  }

  // 2. Visits: completed/no_sale visits
  const visits = await prisma.visit.findMany({
    where: {
      sellerId: employeeId,
      status: { in: ["COMPLETED", "NO_SALE"] },
    },
    select: {
      scheduledDate: true,
      status: true,
      client: { select: { name: true } },
    },
    orderBy: { scheduledDate: "asc" },
  });

  const visitEntries = visits.map((v) => ({
    date: v.scheduledDate.toISOString(),
    type: "VISIT" as const,
    description: `Visita ${v.status === "COMPLETED" ? "completada" : "sin venta"} — ${v.client.name}`,
    points: 2,
  }));

  // 3. Sales: approved sales
  const sales = await prisma.sale.findMany({
    where: {
      employeeId,
      status: "APPROVED",
    },
    select: {
      saleDate: true,
      saleNumber: true,
      buyerName: true,
    },
    orderBy: { saleDate: "asc" },
  });

  const saleEntries = sales.map((s) => ({
    date: s.saleDate.toISOString(),
    type: "SALE" as const,
    description: `Venta aprobada VT-${String(s.saleNumber).padStart(4, "0")}${s.buyerName ? ` — ${s.buyerName}` : ""}`,
    points: 5,
  }));

  // 4. Target bonuses: EmployeeProgress records
  const targetRecords = await prisma.employeeProgress.findMany({
    where: {
      employeeId,
      type: "TARGET_ACHIEVED",
    },
    select: {
      createdAt: true,
      points: true,
      period: true,
    },
    orderBy: { createdAt: "asc" },
  });

  const targetEntries = targetRecords.map((r) => ({
    date: r.createdAt.toISOString(),
    type: "TARGET" as const,
    description: `Objetivo mensual alcanzado — ${r.period ?? "sin período"}`,
    points: r.points,
  }));

  return [...seniorityEntries, ...visitEntries, ...saleEntries, ...targetEntries];
}

function monthsBetween(from: Date, to: Date): number {
  const fromD = new Date(from);
  const toD = new Date(to);
  return (toD.getFullYear() - fromD.getFullYear()) * 12 + (toD.getMonth() - fromD.getMonth());
}
