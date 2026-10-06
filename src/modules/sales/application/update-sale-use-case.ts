/**
 * Update sale use case.
 *
 * Allows the seller to update their own DRAFT sale.
 * Only DRAFT sales can be modified.
 * Authorization: sale.update with OWN scope + ownership check.
 *
 * Reference: business-rules.md REG-026
 */

import type { AuthorizationService } from "@/modules/authorization/domain";
import type { AuthorizationContext } from "@/modules/authorization/domain";
import type { SaleRepository } from "@/modules/sales/domain";
import type { AuditPort } from "@/shared/ports/audit-port";
import { AuditAction } from "@/shared/ports/audit-port";
import {
  validateSaleForUpdate,
  calculateSaleTotal,
} from "@/modules/sales/domain";
import {
  AuthorizationError,
  NotFoundError,
  DomainRuleError,
} from "@/shared/errors";

export interface UpdateSaleUseCaseInput {
  readonly authContext: AuthorizationContext;
  readonly saleId: string;
  readonly saleDate?: Date;
  readonly items?: readonly {
    readonly productId: string;
    readonly quantity: number;
    readonly unitPrice: number;
  }[];
  readonly buyerName?: string;
  readonly notes?: string;
}

export class UpdateSaleUseCase {
  constructor(
    private readonly authorizationService: AuthorizationService,
    private readonly saleRepository: SaleRepository,
    private readonly auditPort: AuditPort,
  ) {}

  async execute(input: UpdateSaleUseCaseInput) {
    // 1. Find existing sale
    const sale = await this.saleRepository.findById(input.saleId);
    if (!sale) {
      throw new NotFoundError("Sale", input.saleId);
    }

    // 2. Only DRAFT sales can be modified
    if (sale.status !== "DRAFT") {
      throw new DomainRuleError(
        `Cannot modify a sale in '${sale.status}' status. Only DRAFT sales can be modified.`,
        "SALE_NOT_MODIFIABLE",
      );
    }

    // 3. Authorize: sale.update with resource ownership check
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
        decision.reason ?? "Not authorized to update this sale.",
      );
    }

    // 4. Validate update data
    validateSaleForUpdate({
      ...(input.saleDate !== undefined && { saleDate: input.saleDate }),
      ...(input.buyerName !== undefined && { buyerName: input.buyerName }),
      ...(input.notes !== undefined && { notes: input.notes }),
      ...(input.items !== undefined && { items: input.items }),
    });

    // 5. Update sale metadata if changed
    let updatedSale = sale;
    if (input.saleDate !== undefined || input.buyerName !== undefined || input.notes !== undefined) {
      updatedSale = await this.saleRepository.update(input.saleId, {
        saleDate: input.saleDate,
        buyerName: input.buyerName,
        notes: input.notes,
      });
    }

    // 6. Replace items if changed
    if (input.items !== undefined) {
      const items = input.items.map((item) => ({
        productId: item.productId,
        quantity: item.quantity,
        unitPrice: item.unitPrice,
        subtotal: item.quantity * item.unitPrice,
      }));
      const totalAmount = calculateSaleTotal(items);
      updatedSale = await this.saleRepository.replaceItems(
        input.saleId,
        items,
        totalAmount,
      );
    }

    // 7. Record audit event
    await this.auditPort.log({
      actorId: input.authContext.userId,
      actorEmail: input.authContext.userEmail,
      action: AuditAction.SALE_UPDATED,
      resourceType: "Sale",
      resourceId: input.saleId,
      result: "SUCCESS",
      correlationId: null,
      metadata: {
        saleDate: input.saleDate,
        buyerName: input.buyerName,
        notes: input.notes,
        itemCount: input.items?.length,
      },
      timestamp: new Date(),
    });

    return { sale: updatedSale };
  }
}
