/**
 * Approve sale use case.
 *
 * Transitions a PENDING_REVIEW sale to APPROVED status.
 * Only supervisors or users with sale.approve permission can approve.
 * Authorization: sale.approve with TEAM/BRANCH/GLOBAL scope.
 *
 * Registers two audit events: SALE_APPROVED and COMMISSION_GENERATED
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
import { GenerateCommissionForApprovedSaleUseCase } from "@/modules/commissions/application";
import {
  AuthorizationError,
  ConflictError,
  NotFoundError,
} from "@/shared/errors";
import { randomUUID } from "crypto";

export interface ApproveSaleInput {
  readonly authContext: AuthorizationContext;
  readonly saleId: string;
}

export class ApproveSaleUseCase {
  constructor(
    private readonly authorizationService: AuthorizationService,
    private readonly saleRepository: SaleRepository,
    private readonly auditPort: AuditPort,
    private readonly transactionPort?: SaleCommissionTransactionPort,
  ) {}

  async execute(input: ApproveSaleInput) {
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
            permission: "sale.approve",
            resource: {
              type: "sale",
              id: sale.id,
              ownerId: sale.employeeId,
            },
          },
        );
        if (!decision.allowed) {
          throw new AuthorizationError(decision.reason ?? "Not authorized to approve sales.");
        }

        validateSaleStatusTransition(sale.status, "APPROVED");
        const approvedAt = new Date();
        const updatedSale = await context.saleRepository.updateStatusIfCurrent(
          input.saleId,
          "PENDING_REVIEW",
          "APPROVED",
          undefined,
          approvedAt,
        );
        if (!updatedSale) {
          throw new ConflictError("The sale was already approved or changed by another operation.");
        }

        const commission = await new GenerateCommissionForApprovedSaleUseCase(
          context.organizationRepository,
          context.commissionRuleRepository,
          context.commissionEntryRepository,
        ).execute({
          saleId: sale.id,
          employeeId: sale.employeeId,
          saleDate: sale.saleDate,
          approvedAt,
          baseAmount: sale.totalAmount,
        });

        // Record SALE_APPROVED audit event
        await this.auditPort.log({
          actorId: input.authContext.employeeId,
          actorEmail: input.authContext.userEmail,
          action: AuditAction.SALE_APPROVED,
          resourceType: "Sale",
          resourceId: sale.id,
          result: "SUCCESS",
          correlationId,
          metadata: {
            previousStatus: sale.status,
            newStatus: "APPROVED",
            totalAmount: sale.totalAmount,
            commissionId: commission.id,
          },
          timestamp: approvedAt,
        });

        // Record COMMISSION_GENERATED audit event (same correlationId)
        await this.auditPort.log({
          actorId: input.authContext.employeeId,
          actorEmail: input.authContext.userEmail,
          action: AuditAction.COMMISSION_GENERATED,
          resourceType: "CommissionEntry",
          resourceId: commission.id,
          result: "SUCCESS",
          correlationId,
          metadata: {
            saleId: sale.id,
            employeeId: sale.employeeId,
            baseAmount: sale.totalAmount,
            amount: commission.amount,
            percentage: commission.percentage,
          },
          timestamp: approvedAt,
        });

        return { sale: updatedSale, commission };
      });
    }

    // 1. Find existing sale
    const sale = await this.saleRepository.findById(input.saleId);
    if (!sale) {
      throw new NotFoundError("Sale", input.saleId);
    }

    // 2. Authorize: sale.approve with resource scope check
    const decision = await this.authorizationService.authorize(
      input.authContext,
      {
        permission: "sale.approve",
        resource: {
          type: "sale",
          id: sale.id,
          ownerId: sale.employeeId,
        },
      },
    );

    if (!decision.allowed) {
      throw new AuthorizationError(
        decision.reason ?? "Not authorized to approve sales.",
      );
    }

    // 3. Validate transition
    validateSaleStatusTransition(sale.status, "APPROVED");

    // 4. Execute transition
    const updatedSale = await this.saleRepository.updateStatus(
      input.saleId,
      "APPROVED",
    );

    const now = new Date();

    // 5. Record SALE_APPROVED audit event
    await this.auditPort.log({
      actorId: input.authContext.employeeId,
      actorEmail: input.authContext.userEmail,
      action: AuditAction.SALE_APPROVED,
      resourceType: "Sale",
      resourceId: input.saleId,
      result: "SUCCESS",
      correlationId,
      metadata: {
        previousStatus: sale.status,
        newStatus: "APPROVED",
        totalAmount: sale.totalAmount,
      },
      timestamp: now,
    });

    return { sale: updatedSale };
  }
}
