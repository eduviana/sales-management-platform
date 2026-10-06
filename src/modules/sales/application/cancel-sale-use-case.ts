/**
 * Cancel sale use case.
 *
 * Transitions an APPROVED sale to CANCELLED status.
 * Only APPROVED sales can be cancelled.
 * Authorization: sale.cancel with resource ownership or supervisor scope.
 *
 * Registers two audit events: SALE_CANCELLED and COMMISSION_REVERSED
 * with the same correlationId for traceability.
 *
 * Reference: business-rules.md §16.1
 */

import type { AuthorizationService } from "@/modules/authorization/domain";
import type { AuthorizationContext } from "@/modules/authorization/domain";
import type { SaleRepository } from "@/modules/sales/domain";
import type { AuditPort } from "@/shared/ports/audit-port";
import { AuditAction } from "@/shared/ports/audit-port";
import { validateSaleStatusTransition } from "@/modules/sales/domain";
import type { SaleCommissionTransactionPort } from "./sale-commission-transaction-port";
import { ReverseCommissionForCancelledSaleUseCase } from "@/modules/commissions/application";
import {
  AuthorizationError,
  ConflictError,
  NotFoundError,
} from "@/shared/errors";
import { randomUUID } from "crypto";

export interface CancelSaleInput {
  readonly authContext: AuthorizationContext;
  readonly saleId: string;
}

export class CancelSaleUseCase {
  constructor(
    private readonly authorizationService: AuthorizationService,
    private readonly saleRepository: SaleRepository,
    private readonly auditPort: AuditPort,
    private readonly transactionPort?: SaleCommissionTransactionPort,
  ) {}

  async execute(input: CancelSaleInput) {
    const correlationId = randomUUID();

    if (this.transactionPort) {
      return this.transactionPort.execute(async (context) => {
        const sale = await context.saleRepository.findById(input.saleId);
        if (!sale) {
          throw new NotFoundError("Sale", input.saleId);
        }

        const decision = await this.authorizationService.authorize(
          input.authContext,
          {
            permission: "sale.cancel",
            resource: {
              type: "sale",
              id: sale.id,
              ownerId: sale.employeeId,
            },
          },
        );
        if (!decision.allowed) {
          throw new AuthorizationError(decision.reason ?? "Not authorized to cancel this sale.");
        }

        validateSaleStatusTransition(sale.status, "CANCELLED");
        const updatedSale = await context.saleRepository.updateStatusIfCurrent(
          input.saleId,
          "APPROVED",
          "CANCELLED",
        );
        if (!updatedSale) {
          throw new ConflictError("The sale was already cancelled or changed by another operation.");
        }

        const reversal = await new ReverseCommissionForCancelledSaleUseCase(
          context.commissionEntryRepository,
        ).execute({
          saleId: sale.id,
          employeeId: sale.employeeId,
          saleDate: sale.saleDate,
        });

        const now = new Date();

        // Record SALE_CANCELLED audit event
        await this.auditPort.log({
          actorId: input.authContext.userId,
          actorEmail: input.authContext.userEmail,
          action: AuditAction.SALE_CANCELLED,
          resourceType: "Sale",
          resourceId: sale.id,
          result: "SUCCESS",
          correlationId,
          metadata: {
            previousStatus: sale.status,
            newStatus: "CANCELLED",
            totalAmount: sale.totalAmount,
            reversalId: reversal.id,
            reversedAmount: reversal.amount,
          },
          timestamp: now,
        });

        // Record COMMISSION_REVERSED audit event (same correlationId)
        await this.auditPort.log({
          actorId: input.authContext.userId,
          actorEmail: input.authContext.userEmail,
          action: AuditAction.COMMISSION_REVERSED,
          resourceType: "CommissionEntry",
          resourceId: reversal.id,
          result: "SUCCESS",
          correlationId,
          metadata: {
            saleId: sale.id,
            employeeId: sale.employeeId,
            earnedId: reversal.parentId,
            reversedAmount: reversal.amount,
          },
          timestamp: now,
        });

        return { sale: updatedSale, reversal };
      });
    }

    // 1. Find existing sale
    const sale = await this.saleRepository.findById(input.saleId);
    if (!sale) {
      throw new NotFoundError("Sale", input.saleId);
    }

    // 2. Authorize: sale.cancel with resource scope check
    const decision = await this.authorizationService.authorize(
      input.authContext,
      {
        permission: "sale.cancel",
        resource: {
          type: "sale",
          id: sale.id,
          ownerId: sale.employeeId,
        },
      },
    );

    if (!decision.allowed) {
      throw new AuthorizationError(
        decision.reason ?? "Not authorized to cancel this sale.",
      );
    }

    // 3. Validate transition
    validateSaleStatusTransition(sale.status, "CANCELLED");

    // 4. Execute transition
    const updatedSale = await this.saleRepository.updateStatus(
      input.saleId,
      "CANCELLED",
    );

    // 5. Record audit event
    await this.auditPort.log({
      actorId: input.authContext.userId,
      actorEmail: input.authContext.userEmail,
      action: AuditAction.SALE_CANCELLED,
      resourceType: "Sale",
      resourceId: input.saleId,
      result: "SUCCESS",
      correlationId,
      metadata: {
        previousStatus: sale.status,
        newStatus: "CANCELLED",
        totalAmount: sale.totalAmount,
      },
      timestamp: new Date(),
    });

    return { sale: updatedSale };
  }
}
