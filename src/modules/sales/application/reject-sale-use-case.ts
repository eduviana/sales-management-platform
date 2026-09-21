/**
 * Reject sale use case.
 *
 * Transitions a PENDING_REVIEW sale to REJECTED status.
 * Requires a rejection reason.
 * Authorization: sale.reject with TEAM/BRANCH/GLOBAL scope.
 *
 * Reference: business-rules.md §16.1
 */

import type { AuthorizationService } from "@/modules/authorization/domain";
import type { AuthorizationContext } from "@/modules/authorization/domain";
import type { SaleRepository } from "@/modules/sales/domain";
import type { AuditPort } from "@/shared/ports/audit-port";
import { AuditAction } from "@/shared/ports/audit-port";
import {
  validateSaleStatusTransition,
  validateRejectionReason,
} from "@/modules/sales/domain";
import {
  AuthorizationError,
  NotFoundError,
} from "@/shared/errors";

export interface RejectSaleInput {
  readonly authContext: AuthorizationContext;
  readonly saleId: string;
  readonly reason: string;
}

export class RejectSaleUseCase {
  constructor(
    private readonly authorizationService: AuthorizationService,
    private readonly saleRepository: SaleRepository,
    private readonly auditPort: AuditPort,
  ) {}

  async execute(input: RejectSaleInput) {
    // 1. Find existing sale
    const sale = await this.saleRepository.findById(input.saleId);
    if (!sale) {
      throw new NotFoundError("Sale", input.saleId);
    }

    // 2. Authorize: sale.reject with resource scope check
    const decision = await this.authorizationService.authorize(
      input.authContext,
      {
        permission: "sale.reject",
        resource: {
          type: "sale",
          id: sale.id,
          ownerId: sale.employeeId,
        },
      },
    );

    if (!decision.allowed) {
      throw new AuthorizationError(
        decision.reason ?? "Not authorized to reject sales.",
      );
    }

    // 3. Validate transition
    validateSaleStatusTransition(sale.status, "REJECTED");

    // 4. Validate rejection reason
    validateRejectionReason(input.reason);

    // 5. Execute transition
    const updatedSale = await this.saleRepository.updateStatus(
      input.saleId,
      "REJECTED",
      input.reason,
    );

    // 6. Record audit event
    await this.auditPort.log({
      actorId: input.authContext.employeeId,
      actorEmail: input.authContext.userEmail,
      action: AuditAction.SALE_REJECTED,
      resourceType: "Sale",
      resourceId: input.saleId,
      result: "SUCCESS",
      correlationId: null,
      metadata: {
        previousStatus: sale.status,
        newStatus: "REJECTED",
        reason: input.reason,
      },
      timestamp: new Date(),
    });

    return { sale: updatedSale };
  }
}
