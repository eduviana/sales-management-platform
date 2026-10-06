/**
 * Get monthly commission overview use case.
 *
 * Read model behind the commissions dashboard: earned entries of the current
 * month with their sale summary and, in team scope, the employee name.
 *
 * Cross-module reads go through the owning modules' ports: organization owns
 * the hierarchy, sales own the sale summary.
 *
 * Authorization: sale.readTeam (team scope only; own commissions need no
 * additional permission, matching the existing screen).
 *
 * Reference: requirements.md §3.2
 */

import type { AuthorizationContext, AuthorizationService } from "@/modules/authorization/domain";
import type { OrganizationRepository } from "@/modules/organization/domain";
import type { SaleRepository } from "@/modules/sales/domain";
import type { CommissionEntryRepository } from "../domain/commission-entry-repository";
import { AuthorizationError } from "@/shared/errors";

/** Who the commissions belong to: the authenticated employee or their team. */
export type CommissionScope = "OWN" | "TEAM";

export interface GetMonthlyCommissionOverviewInput {
  readonly authContext: AuthorizationContext;
  readonly scope: CommissionScope;
}

/** One row of the commissions table. */
export interface CommissionOverviewEntry {
  readonly id: string;
  readonly saleNumber: number;
  readonly saleDate: Date;
  readonly baseAmount: number;
  readonly percentage: number;
  readonly amount: number;
  /** Shown only in team scope. */
  readonly employeeName?: string;
}

/** Commissions of the current month for the requested scope. */
export interface MonthlyCommissionOverview {
  /** First day of the month the entries belong to. */
  readonly referenceDate: Date;
  readonly entries: readonly CommissionOverviewEntry[];
  readonly totalAmount: number;
}

export class GetMonthlyCommissionOverviewUseCase {
  constructor(
    private readonly authorizationService: AuthorizationService,
    private readonly organizationRepository: OrganizationRepository,
    private readonly saleRepository: SaleRepository,
    private readonly commissionEntryRepository: CommissionEntryRepository,
  ) {}

  async execute(
    input: GetMonthlyCommissionOverviewInput,
  ): Promise<MonthlyCommissionOverview> {
    const { authContext, scope } = input;
    const isTeam = scope === "TEAM";

    // 1. Resolve the employees whose commissions are shown
    let employeeIds: string[];
    const names = new Map<string, string>();

    if (isTeam) {
      const decision = await this.authorizationService.authorize(authContext, {
        permission: "sale.readTeam",
      });
      if (!decision.allowed) {
        throw new AuthorizationError(
          decision.reason ??
            "No tienes permisos para ver comisiones del equipo.",
        );
      }

      const subordinates = await this.organizationRepository.getDirectSubordinates(
        authContext.employeeId,
      );
      employeeIds = [
        authContext.employeeId,
        ...subordinates.map((e) => e.id),
      ];

      const self = await this.organizationRepository.findEmployeeById(
        authContext.employeeId,
      );
      if (self) {
        names.set(self.id, `${self.firstName} ${self.lastName}`);
      }
      for (const subordinate of subordinates) {
        names.set(subordinate.id, `${subordinate.firstName} ${subordinate.lastName}`);
      }
    } else {
      employeeIds = [authContext.employeeId];
    }

    // 2. Current month range
    const now = new Date();
    const period = {
      from: new Date(now.getFullYear(), now.getMonth(), 1),
      to: new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999),
    };

    // 3. Entries with their sale summary
    const entries =
      await this.commissionEntryRepository.findEarnedByEmployeeIds(
        employeeIds,
        period,
      );
    const saleSummaries = await this.saleRepository.findSummariesByIds(
      entriesSaleIds(entries),
    );

    const salesById = new Map(saleSummaries.map((sale) => [sale.id, sale]));

    const overviewEntries: CommissionOverviewEntry[] = entries.map((entry) => {
      const sale = salesById.get(entry.saleId);
      return {
        id: entry.id,
        saleNumber: sale?.saleNumber ?? 0,
        saleDate: entry.saleDate,
        baseAmount: entry.baseAmount,
        percentage: entry.percentage,
        amount: entry.amount,
        ...(isTeam && names.has(entry.employeeId)
          ? { employeeName: names.get(entry.employeeId) }
          : {}),
      };
    });

    return {
      referenceDate: now,
      entries: overviewEntries,
      totalAmount: overviewEntries.reduce((sum, entry) => sum + entry.amount, 0),
    };
  }
}

function entriesSaleIds(
  entries: readonly { readonly saleId: string }[],
): string[] {
  return [...new Set(entries.map((entry) => entry.saleId))];
}