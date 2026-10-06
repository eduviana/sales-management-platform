/**
 * Create sale use case.
 *
 * Allows a seller to create a new sale in DRAFT status.
 * The sale is associated with the authenticated seller's employee ID.
 * Authorization: sale.create with OWN scope.
 *
 * Reference: business-rules.md REG-024, REG-027
 */

import type { AuthorizationService } from "@/modules/authorization/domain";
import type { AuthorizationContext } from "@/modules/authorization/domain";
import type { SaleRepository } from "@/modules/sales/domain";
import type { AuditPort } from "@/shared/ports/audit-port";
import type { VisitRepository } from "@/modules/visits/domain/visit-repository";
import { AuditAction } from "@/shared/ports/audit-port";
import { calculateSaleTotal, validateSaleForCreation } from "@/modules/sales/domain";
import { AuthorizationError, ValidationError } from "@/shared/errors";

export interface CreateSaleUseCaseInput {
  readonly authContext: AuthorizationContext;
  readonly saleDate: Date;
  readonly items: readonly {
    readonly productId: string;
    readonly quantity: number;
    readonly unitPrice: number;
  }[];
  readonly buyerName?: string;
  readonly clientDocumentType?: string;
  readonly clientDocumentNumber?: string;
  readonly clientPhone?: string;
  readonly clientEmail?: string;
  readonly notes?: string;
  readonly visitId?: string;
  readonly paymentMethod?: string;
  readonly paymentStatus?: string;
  readonly installments?: number;
  readonly externalPaymentReference?: string;
  readonly cardBrand?: string;
  readonly cardLast4?: string;
  readonly discount?: number;
  readonly discountReason?: string;
  readonly deliveryAddress?: string;
  readonly deliveryStatus?: string;
  readonly deliveryEstimatedDate?: Date;
  readonly invoiceStatus?: string;
  readonly externalInvoiceReference?: string;
  readonly referralContacts?: readonly {
    readonly clientName: string;
    readonly phone: string;
    readonly email?: string;
    readonly street?: string;
    readonly streetNumber?: string;
    readonly floor?: string;
    readonly apartment?: string;
    readonly city?: string;
    readonly province?: string;
    readonly postalCode?: string;
    readonly addressNotes?: string;
  }[];
}

export class CreateSaleUseCase {
  constructor(
    private readonly authorizationService: AuthorizationService,
    private readonly saleRepository: SaleRepository,
    private readonly auditPort: AuditPort,
    private readonly visitRepository?: VisitRepository,
  ) {}

  async execute(input: CreateSaleUseCaseInput) {
    // 1. Authorize: sale.create with OWN scope
    const decision = await this.authorizationService.authorize(
      input.authContext,
      { permission: "sale.create" },
    );

    if (!decision.allowed) {
      throw new AuthorizationError(
        decision.reason ?? "Not authorized to create sales.",
      );
    }

    // 2. Validate sale data
    const items = input.items.map((item) => ({
      ...item,
      unitPrice: item.unitPrice,
    }));

    // Preserve the basic domain validation order before resolving visit data.
    if (items.length === 0) {
      validateSaleForCreation({
        employeeId: input.authContext.employeeId,
        saleDate: input.saleDate,
        items,
      });
    }

    if (!this.visitRepository) {
      throw new Error("Visit repository is required to create a sale.");
    }

    const visitId = input.visitId;
    const deliveryAddress = input.deliveryAddress;
    if (!visitId || !deliveryAddress) {
      throw new ValidationError("La visita y la dirección de entrega son obligatorias.", "visitId");
    }

    const visit = await this.visitRepository.findById(visitId);
    if (!visit || visit.sellerId !== input.authContext.employeeId) {
      throw new AuthorizationError("La visita no pertenece al vendedor autenticado.");
    }
    if (visit.status !== "assigned" && visit.status !== "completed") {
      throw new ValidationError("La visita no está disponible para registrar una venta.", "visitId");
    }

    // The visit is the server-side source of truth for client identity data.
    const buyerName = visit.clientName ?? input.buyerName;
    const clientPhone = visit.clientPhone ?? input.clientPhone;
    const clientEmail = visit.clientEmail ?? input.clientEmail;
    const clientDocumentNumber = visit.clientDocumentNumber ?? input.clientDocumentNumber;

    validateSaleForCreation({
      employeeId: input.authContext.employeeId,
      saleDate: input.saleDate,
      items,
      buyerName,
      clientPhone,
      clientEmail,
      clientDocumentType: input.clientDocumentType,
      clientDocumentNumber,
      visitId,
      deliveryAddress: input.deliveryAddress,
      notes: input.notes,
      paymentMethod: input.paymentMethod,
      paymentStatus: input.paymentStatus,
      installments: input.installments,
      externalPaymentReference: input.externalPaymentReference,
      cardLast4: input.cardLast4,
      discount: input.discount,
      deliveryStatus: input.deliveryStatus,
      deliveryEstimatedDate: input.deliveryEstimatedDate,
      invoiceStatus: input.invoiceStatus,
    });

    // 3. Calculate total
    const subtotal = calculateSaleTotal(items);
    const totalAmount = subtotal - (input.discount ?? 0);

    // 4. Create sale
    // paymentStatus, deliveryStatus e invoiceStatus son gestionados por
    // administración o integraciones externas (H&Y Cite). El servidor
    // aplica PENDING como valor inicial cuando el vendedor no los provee.
    const sale = await this.saleRepository.create({
      employeeId: input.authContext.employeeId,
      saleDate: input.saleDate,
      status: "DRAFT",
      totalAmount,
      buyerName: buyerName ?? null,
      clientId: visit.clientId,
      visitId,
      clientDocumentType: input.clientDocumentType ?? null,
      clientDocumentNumber: clientDocumentNumber ?? null,
      clientPhone: clientPhone ?? null,
      clientEmail: clientEmail ?? null,
      notes: input.notes ?? null,
      paymentMethod: input.paymentMethod ?? null,
      paymentStatus: input.paymentStatus ?? "PENDING",
      installments: input.installments ?? null,
      externalPaymentReference: input.externalPaymentReference ?? null,
      cardBrand: input.cardBrand ?? null,
      cardLast4: input.cardLast4 ?? null,
      discount: input.discount ?? null,
      discountReason: input.discountReason ?? null,
      deliveryAddress,
      deliveryStatus: input.deliveryStatus ?? "PENDING",
      deliveryEstimatedDate: input.deliveryEstimatedDate ?? null,
      invoiceStatus: input.invoiceStatus ?? "PENDING",
      externalInvoiceReference: input.externalInvoiceReference ?? null,
      items: items.map((item) => ({
        productId: item.productId,
        quantity: item.quantity,
        unitPrice: item.unitPrice,
        subtotal: item.quantity * item.unitPrice,
      })),
      referralContacts: input.referralContacts,
    });

    // 5. Record audit event
    await this.auditPort.log({
      actorId: input.authContext.userId,
      actorEmail: input.authContext.userEmail,
      action: AuditAction.SALE_CREATED,
      resourceType: "Sale",
      resourceId: sale.id,
      result: "SUCCESS",
      correlationId: null,
      metadata: {
        saleDate: input.saleDate,
        totalAmount,
        itemCount: items.length,
        buyerName: input.buyerName,
      },
      timestamp: new Date(),
    });

    return { sale };
  }
}
