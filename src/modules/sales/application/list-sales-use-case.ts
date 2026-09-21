/**
 * List sales use case.
 *
 * Lists sales with filtering and pagination.
 * Applies scope-based restrictions to the query.
 * Authorization: sale.readOwn / sale.readTeam / sale.readBranch / sale.readGlobal
 *
 * Reference: business-rules.md REG-032, REG-033, authorization.md §10
 */

import type { AuthorizationService } from "@/modules/authorization/domain";
import type { AuthorizationContext } from "@/modules/authorization/domain";
import type { OrganizationRepository } from "@/modules/organization/domain";
import type { SaleRepository, PaginationOptions } from "@/modules/sales/domain";
import type { SaleStatus } from "@/modules/sales/domain";
import { AuthorizationError } from "@/shared/errors";

/**
 * Statuses visible to supervisors for other people's sales.
 * DRAFT is private to the seller; REJECTED is feedback for the seller.
 */
const SUPERVISOR_VISIBLE_STATUSES: readonly SaleStatus[] = [
  "PENDING_REVIEW",
  "APPROVED",
  "CANCELLED",
];

export interface ListSalesInput {
  readonly authContext: AuthorizationContext;
  readonly scope?: "OWN" | "TEAM" | "BRANCH" | "GLOBAL";
  readonly status?: SaleStatus;
  readonly saleDateFrom?: Date;
  readonly saleDateTo?: Date;
  readonly page?: number;
  readonly pageSize?: number;
}

export class ListSalesUseCase {
  constructor(
    private readonly authorizationService: AuthorizationService,
    private readonly saleRepository: SaleRepository,
    private readonly organizationRepository: OrganizationRepository,
  ) {}

  async execute(input: ListSalesInput) {
    // 1. Determine read permission
    const permission = this.getReadPermission(input.authContext, input.scope ?? "OWN");

    // 2. Authorize
    const decision = await this.authorizationService.authorize(
      input.authContext,
      { permission },
    );

    if (!decision.allowed) {
      throw new AuthorizationError(
        decision.reason ?? "Not authorized to list sales.",
      );
    }

    // 3. Resolve scope → employee filter
    const employeeIds = await this.resolveEmployeeIds(
      input.authContext,
      permission,
    );

    // 4. Determine status filter
    // When no explicit status filter is provided and the scope is not OWN,
    // only show statuses visible to supervisors (exclude DRAFT and REJECTED).
    const scope = input.scope ?? "OWN";
    const statuses = input.status
      ? [input.status]
      : scope === "OWN"
        ? undefined
        : [...SUPERVISOR_VISIBLE_STATUSES];

    // 5. Build filter
    const pagination: PaginationOptions = {
      page: input.page ?? 1,
      pageSize: input.pageSize ?? 20,
    };

    const result = await this.saleRepository.list(
      {
        statuses,
        employeeIds,
        saleDateFrom: input.saleDateFrom,
        saleDateTo: input.saleDateTo,
      },
      pagination,
    );

    return result;
  }

  private getReadPermission(
    context: AuthorizationContext,
    requestedScope: "OWN" | "TEAM" | "BRANCH" | "GLOBAL",
  ): "sale.readOwn" | "sale.readTeam" | "sale.readBranch" | "sale.readGlobal" {
    if (requestedScope === "OWN") return "sale.readOwn";
    if (context.role === "ADMIN" || requestedScope === "GLOBAL") {
      return "sale.readGlobal";
    }
    if (requestedScope === "BRANCH" && context.levelId !== null && context.levelId >= 4) {
      return "sale.readBranch";
    }
    if (requestedScope === "TEAM" && context.levelId !== null && context.levelId >= 3) {
      return "sale.readTeam";
    }
    throw new AuthorizationError("No tienes permisos para consultar ese alcance de ventas.");
  }

  private async resolveEmployeeIds(
    context: AuthorizationContext,
    permission: string,
  ): Promise<string[] | undefined> {
    // OWN scope — restrict to the user's own employee ID
    if (permission === "sale.readOwn") {
      return [context.employeeId];
    }

    // TEAM scope — direct subordinates
    if (permission === "sale.readTeam") {
      const subordinates =
        await this.organizationRepository.getDirectSubordinates(
          context.employeeId,
        );
      return [context.employeeId, ...subordinates.map((e) => e.id)];
    }

    // BRANCH scope — all descendants
    if (permission === "sale.readBranch") {
      const descendants =
        await this.organizationRepository.getDescendantIds(
          context.employeeId,
        );
      return [context.employeeId, ...descendants];
    }

    // GLOBAL scope — no restriction
    return undefined;
  }
}
