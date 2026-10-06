/**
 * Get team progression overview use case.
 *
 * Builds the supervisor's "Progreso del objetivo" read model: per-member
 * progression and current-month objective, team objective, commissions and the
 * operational team history.
 *
 * Cross-module reads go through the owning modules' ports: organization owns
 * the hierarchy, visits own visit rows, sales own sale rows and monthly
 * objectives, commissions own commission entries.
 *
 * Authorization: analytics.viewTeam
 *
 * Reference: requirements.md §3.13, business-rules.md REG-055, REG-066,
 * REG-067, REG-078, REG-082, REG-083
 */

import type {
  TeamCommissionEntry,
  TeamHistoryRow,
  TeamHistoryStatus,
  TeamMemberOverview,
  TeamProgressionOverview,
  TeamSaleRow,
  TeamVisitRow,
  TeamVisitStatus,
} from "../domain";
import type { GetEmployeeProgressionUseCase } from "./get-employee-progression-use-case";
import type { AuthorizationService } from "@/modules/authorization/domain";
import type { AuthorizationContext } from "@/modules/authorization/domain";
import type { OrganizationRepository } from "@/modules/organization/domain";
import type { SaleRepository, SaleStatus } from "@/modules/sales/domain";
import type { VisitRepository, VisitStatus } from "@/modules/visits/domain";
import type { CommissionEntryRepository } from "@/modules/commissions/domain";
import { AuthorizationError } from "@/shared/errors";

/**
 * Monthly objective applied to a level with no configured MonthlyTarget row.
 * Same fallback as the analytics dashboard.
 */
const DEFAULT_MONTHLY_TARGET = 15;

/** Sale statuses that count as valid sales for objective progress. */
const VALID_SALE_STATUSES: readonly SaleStatus[] = [
  "APPROVED",
  "PENDING_REVIEW",
];

/** Visit statuses that produce a row in the operational team history. */
const HISTORY_VISIT_STATUSES: readonly VisitStatus[] = [
  "completed",
  "no_sale",
  "cancelled",
];

export interface GetTeamProgressionInput {
  readonly authContext: AuthorizationContext;
}

export class GetTeamProgressionUseCase {
  constructor(
    private readonly authorizationService: AuthorizationService,
    private readonly organizationRepository: OrganizationRepository,
    private readonly visitRepository: VisitRepository,
    private readonly saleRepository: SaleRepository,
    private readonly commissionEntryRepository: CommissionEntryRepository,
    private readonly getEmployeeProgression: GetEmployeeProgressionUseCase,
  ) {}

  async execute(input: GetTeamProgressionInput): Promise<TeamProgressionOverview> {
    const { authContext } = input;

    // 1. Authorize — team analytics visibility (N3+)
    const decision = await this.authorizationService.authorize(authContext, {
      permission: "analytics.viewTeam",
    });
    if (!decision.allowed) {
      throw new AuthorizationError(
        decision.reason ?? "No tienes permisos para ver la progresión del equipo.",
      );
    }

    // 2. Team members (direct subordinates)
    const subordinates = await this.organizationRepository.getDirectSubordinates(
      authContext.employeeId,
    );
    const activeMembers = subordinates.filter((m) => m.status === "ACTIVE");
    const activeMemberIds = activeMembers.map((m) => m.id);
    const subordinateIds = subordinates.map((m) => m.id);

    // 3. Current month range (per-member objective progress + team target)
    const now = new Date();
    const firstDay = new Date(now.getFullYear(), now.getMonth(), 1);
    const lastDay = new Date(
      now.getFullYear(),
      now.getMonth() + 1,
      0,
      23,
      59,
      59,
      999,
    );

    // 4. Aggregates per member and monthly objectives per level
    const memberLevelIds = Array.from(
      new Set(
        activeMembers
          .map((m) => m.currentLevelId)
          .filter((id): id is number => id !== null),
      ),
    );

    // The supervisor's own level target feeds the team objective total.
    const levelIds = new Set(memberLevelIds);
    if (authContext.levelId !== null) levelIds.add(authContext.levelId);

    const [visitCounts, monthlySales, targetSalesByLevel, visits] =
      await Promise.all([
        this.visitRepository.countStatusBySellerIds(activeMemberIds),
        this.saleRepository.countInPeriodByEmployee(
          activeMemberIds,
          firstDay,
          lastDay,
          VALID_SALE_STATUSES,
        ),
        this.saleRepository.getMonthlyTargetsByLevelIds([...levelIds]),
        this.visitRepository.findBySellerIds(activeMemberIds),
      ]);

    // 5. Lifetime summaries (points to next level for the promotion badge)
    const summaries = await this.getEmployeeProgression.executeBatch(
      activeMembers.map((m) => ({
        id: m.id,
        currentLevelId: m.currentLevelId,
        joinedAt: m.joinedAt,
      })),
    );

    const members: TeamMemberOverview[] = activeMembers.map((m) => {
      const summary = summaries.get(m.id);
      const counts = visitCounts.get(m.id);
      const monthlyTarget = resolveMonthlyTarget(
        m.currentLevelId,
        targetSalesByLevel,
      );
      const memberMonthlySales = monthlySales.get(m.id) ?? 0;
      return {
        employeeId: m.id,
        firstName: m.firstName,
        lastName: m.lastName,
        currentLevelId: m.currentLevelId,
        joinedAt: m.joinedAt,
        pointsToNextLevel: summary?.pointsToNextLevel ?? 0,
        assignedVisits: counts?.total ?? 0,
        completedVisits: counts?.completed ?? 0,
        pendingVisits: counts?.pending ?? 0,
        monthlySales: memberMonthlySales,
        monthlyTarget,
        objectiveProgress:
          monthlyTarget > 0
            ? Math.min(
                Math.round((memberMonthlySales / monthlyTarget) * 100),
                100,
              )
            : 0,
      };
    });

    // 6. Operational team history (period-filtered client-side).
    //    Domain model (REG-066/REG-067/REG-078): one row per performed visit.
    //    The seller registers the visit with `completed` (con venta) or
    //    `no_sale` (sin venta). A visit that resulted in a sale creates a linked
    //    Sale that enters PENDING_REVIEW until the supervisor approves/rejects
    //    it. Visits with no sale require no supervisor action. Sales not yet sent
    //    to review (DRAFT) are not visible to the supervisor yet (REG-067).
    const salesByVisitId = new Map(
      (
        await this.saleRepository.findByVisitIds(visits.map((v) => v.id))
      ).map((sale) => [sale.visitId ?? "", sale]),
    );

    const teamHistory: TeamHistoryRow[] = visits
      .filter((v) => HISTORY_VISIT_STATUSES.includes(v.status))
      .flatMap((v) => {
        const sale = salesByVisitId.get(v.id);
        const status = resolveHistoryStatus(v.status, sale?.status);
        if (status === null) return [];

        return [
          {
            date: v.scheduledDate,
            memberName: v.sellerName ?? "",
            status,
            ...(sale ? { productCount: countItems(sale.items), total: sale.totalAmount } : {}),
          },
        ];
      })
      .sort((a, b) => b.date.getTime() - a.date.getTime());

    // 7. Team objective for the current month (same calculation as the dashboard)
    const targetPerSeller =
      authContext.levelId !== null
        ? resolveMonthlyTarget(authContext.levelId, targetSalesByLevel)
        : 0;
    const targetTotal =
      subordinates.length > 0
        ? targetPerSeller * subordinates.length
        : targetPerSeller;

    // Team objective counts only team members' sales: Maria's own sales count
    // toward her supervisor's team objective, not her own (REG-055).
    const currentSales = await this.saleRepository.countInPeriodForEmployees(
      subordinateIds,
      firstDay,
      lastDay,
      VALID_SALE_STATUSES,
    );

    // 8. Commissions and period-filtered visit/sale status rows
    const [commissionEntries, saleRows] = await Promise.all([
      this.commissionEntryRepository.findEarnedByEmployeeIds(activeMemberIds),
      this.saleRepository.findStatusRowsByEmployeeIds(activeMemberIds),
    ]);

    const commissions: TeamCommissionEntry[] = commissionEntries.map((c) => ({
      date: c.saleDate,
      amount: c.amount,
    }));

    const teamVisits: TeamVisitRow[] = visits.map((v) => ({
      date: v.scheduledDate,
      status: toTeamVisitStatus(v.status),
    }));

    const teamSales: TeamSaleRow[] = saleRows.map((s) => ({
      date: s.saleDate,
      status: s.status,
    }));

    return {
      members,
      teamTarget: {
        progress:
          targetTotal > 0
            ? Math.min(Math.round((currentSales / targetTotal) * 100), 100)
            : 0,
        currentSales,
        targetTotal,
      },
      commissions,
      teamVisits,
      teamSales,
      teamHistory,
      referenceDate: now,
    };
  }
}

function resolveMonthlyTarget(
  levelId: number | null,
  targetSalesByLevel: Map<number, number>,
): number {
  if (levelId === null) return 0;
  return targetSalesByLevel.get(levelId) ?? DEFAULT_MONTHLY_TARGET;
}

/**
 * Resolve the operational history status of a visit.
 * Returns null when the visit result is not visible to the supervisor yet.
 */
function resolveHistoryStatus(
  visitStatus: VisitStatus,
  saleStatus: SaleStatus | undefined,
): TeamHistoryStatus | null {
  // REG-067: until a sale is sent to review (status DRAFT or missing) the visit
  // result is not visible in the supervisor's table yet.
  if (visitStatus === "completed" && (!saleStatus || saleStatus === "DRAFT")) {
    return null;
  }

  if (visitStatus === "no_sale") return "NO_SALE";
  if (visitStatus === "cancelled") return "VISIT_CANCELLED";

  switch (saleStatus) {
    case "PENDING_REVIEW":
      return "SALE_PENDING";
    case "APPROVED":
      return "SALE_APPROVED";
    case "REJECTED":
      return "SALE_REJECTED";
    case "CANCELLED":
      return "SALE_CANCELLED";
    default:
      return null;
  }
}

function countItems(items: readonly { readonly quantity: number }[]): number {
  return items.reduce((sum, item) => sum + item.quantity, 0);
}

/** Domain visit status (lowercase) as shown by the UI (uppercase). */
function toTeamVisitStatus(status: VisitStatus): TeamVisitStatus {
  switch (status) {
    case "assigned":
      return "ASSIGNED";
    case "completed":
      return "COMPLETED";
    case "no_sale":
      return "NO_SALE";
    case "cancelled":
      return "CANCELLED";
  }
}
