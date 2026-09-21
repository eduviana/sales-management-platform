/**
 * Get sale use case.
 *
 * Retrieves a single sale by ID with authorization.
 * The sale must be within the caller's scope.
 * Authorization: sale.readOwn / sale.readTeam / sale.readBranch / sale.readGlobal
 *                with resource scope check.
 *
 * Reference: business-rules.md REG-032, REG-033
 */

import type { AuthorizationService } from "@/modules/authorization/domain";
import type { AuthorizationContext } from "@/modules/authorization/domain";
import type { SaleRepository } from "@/modules/sales/domain";
import {
  AuthorizationError,
  NotFoundError,
} from "@/shared/errors";

export interface GetSaleInput {
  readonly authContext: AuthorizationContext;
  readonly saleId: string;
}

export class GetSaleUseCase {
  constructor(
    private readonly authorizationService: AuthorizationService,
    private readonly saleRepository: SaleRepository,
  ) {}

  async execute(input: GetSaleInput) {
    // 1. Find existing sale
    const sale = await this.saleRepository.findById(input.saleId);
    if (!sale) {
      throw new NotFoundError("Sale", input.saleId);
    }

    // 2. Determine appropriate read permission based on context
    const permission = this.getReadPermission(input.authContext);

    // 3. Authorize: read with resource scope check
    const decision = await this.authorizationService.authorize(
      input.authContext,
      {
        permission,
        resource: {
          type: "sale",
          id: sale.id,
          ownerId: sale.employeeId,
        },
      },
    );

    if (!decision.allowed) {
      throw new AuthorizationError(
        decision.reason ?? "Not authorized to view this sale.",
      );
    }

    return { sale };
  }

  private getReadPermission(
    context: AuthorizationContext,
  ): "sale.readOwn" | "sale.readTeam" | "sale.readBranch" | "sale.readGlobal" {
    if (context.role === "ADMIN") {
      return "sale.readGlobal";
    }
    if (context.levelId !== null) {
      if (context.levelId >= 7) return "sale.readGlobal";
      if (context.levelId >= 4) return "sale.readBranch";
      if (context.levelId >= 3) return "sale.readTeam";
    }
    return "sale.readOwn";
  }
}
