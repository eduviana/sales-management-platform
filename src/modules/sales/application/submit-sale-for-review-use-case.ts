/**
 * Submit sale for review use case.
 *
 * Transitions a DRAFT sale to PENDING_REVIEW status.
 * Only the seller who owns the sale can submit it.
 * Authorization: sale.update with OWN scope + ownership check.
 *
 * Reference: business-rules.md §16.1
 */

import type { AuthorizationService } from "@/modules/authorization/domain";
import type { AuthorizationContext } from "@/modules/authorization/domain";
import type { SaleRepository } from "@/modules/sales/domain";
import type { AuditPort } from "@/shared/ports/audit-port";
import { AuditAction } from "@/shared/ports/audit-port";
import { validateSaleStatusTransition } from "@/modules/sales/domain";
import {
  AuthorizationError,
  NotFoundError,
} from "@/shared/errors";

export interface SubmitSaleForReviewInput {
  readonly authContext: AuthorizationContext;
  readonly saleId: string;
}

export class SubmitSaleForReviewUseCase {
  constructor(
    private readonly authorizationService: AuthorizationService,
    private readonly saleRepository: SaleRepository,
    private readonly auditPort: AuditPort,
  ) {}

  async execute(input: SubmitSaleForReviewInput) {
    // 1. Find existing sale
    const sale = await this.saleRepository.findById(input.saleId);
    if (!sale) {
      throw new NotFoundError("Sale", input.saleId);
    }

    // 2. Authorize: sale.update with resource ownership check
    const decision = await this.authorizationService.authorize(
      input.authContext,
      {
        permission: "sale.update",
        resource: {
          type: "sale",
          id: sale.id,
          ownerId: sale.employeeId,
        },
      },
    );

    if (!decision.allowed) {
      throw new AuthorizationError(
        decision.reason ?? "Not authorized to submit this sale for review.",
      );
    }

    // 3. Validate transition
    validateSaleStatusTransition(sale.status, "PENDING_REVIEW");

    // 4. Execute transition
    const updatedSale = await this.saleRepository.updateStatus(
      input.saleId,
      "PENDING_REVIEW",
    );

    // 5. Record audit event
    await this.auditPort.log({
      actorId: input.authContext.userId,
      actorEmail: input.authContext.userEmail,
      action: AuditAction.SALE_SUBMITTED,
      resourceType: "Sale",
      resourceId: input.saleId,
      result: "SUCCESS",
      correlationId: null,
      metadata: {
        previousStatus: sale.status,
        newStatus: "PENDING_REVIEW",
      },
      timestamp: new Date(),
    });

    return { sale: updatedSale };
  }
}
