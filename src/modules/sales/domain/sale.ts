/**
 * Sale domain rules and value objects.
 *
 * Contains validation functions for sale creation, updates, and transitions.
 * No framework or persistence dependencies — pure domain logic.
 *
 * Reference: data-model.md §11, §12; business-rules.md §8
 */

import type { SaleStatus } from "./sale-status";
import { canTransitionTo } from "./sale-status";
import {
  ValidationError,
  DomainRuleError,
} from "@/shared/errors";

// =============================================================================
// Value Objects
// =============================================================================

/**
 * Represents an item within a sale.
 * Captures the price at the time of the operation.
 */
export interface SaleItemData {
  readonly productId: string;
  readonly quantity: number;
  readonly unitPrice: number;
}

/**
 * Complete data for a sale record.
 */
export interface SaleData {
  readonly id: string;
  readonly saleNumber: number;
  readonly employeeId: string;
  readonly saleDate: Date;
  readonly status: SaleStatus;
  readonly totalAmount: number;
  readonly approvedAt: Date | null;
  readonly buyerName: string | null;
  readonly clientDocumentType?: string | null;
  readonly clientDocumentNumber?: string | null;
  readonly clientPhone?: string | null;
  readonly clientEmail?: string | null;
  readonly rejectionReason: string | null;
  readonly notes: string | null;
  readonly visitId?: string | null;
  readonly clientId?: string | null;
  readonly paymentMethod?: string | null;
  readonly paymentStatus?: string | null;
  readonly installments?: number | null;
  readonly externalPaymentReference?: string | null;
  readonly cardBrand?: string | null;
  readonly cardLast4?: string | null;
  readonly discount?: number | null;
  readonly discountReason?: string | null;
  readonly deliveryAddress?: string | null;
  readonly deliveryStatus?: string | null;
  readonly deliveryEstimatedDate?: Date | null;
  readonly invoiceStatus?: string | null;
  readonly externalInvoiceReference?: string | null;
  readonly createdAt: Date;
  readonly updatedAt: Date;
}

/**
 * Input data for creating a new sale.
 */
export interface CreateSaleInput {
  readonly employeeId: string;
  readonly saleDate: Date;
  readonly items: readonly SaleItemData[];
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
}

/**
 * Input data for updating an existing sale.
 */
export interface UpdateSaleInput {
  readonly saleDate?: Date;
  readonly items?: readonly SaleItemData[];
  readonly buyerName?: string;
  readonly notes?: string;
}

/**
 * Input data for rejecting a sale.
 */
export interface RejectSaleInput {
  readonly reason: string;
}

// =============================================================================
// Validation Functions
// =============================================================================

/**
 * Calculate the total amount of a sale from its items.
 */
export function calculateSaleTotal(items: readonly SaleItemData[]): number {
  return items.reduce((sum, item) => {
    return sum + item.quantity * item.unitPrice;
  }, 0);
}

/**
 * Validate sale data for creation.
 *
 * Rules:
 * - Must have at least one item.
 * - All items must have a valid productId.
 * - All items must have quantity > 0.
 * - All items must have unitPrice > 0.
 * - Employee ID is required.
 * - Sale date is required and must be a valid Date.
 *
 * @throws {ValidationError} if any validation rule is violated.
 */
export function validateSaleForCreation(
  input: CreateSaleInput,
): void {
  if (!input.employeeId) {
    throw new ValidationError("Employee ID is required.", "employeeId");
  }

  if (!input.saleDate || !(input.saleDate instanceof Date) || isNaN(input.saleDate.getTime())) {
    throw new ValidationError("A valid sale date is required.", "saleDate");
  }

  if (!input.items || input.items.length === 0) {
    throw new ValidationError("A sale must have at least one item.", "items");
  }

  const cardPayment = input.paymentMethod === "TARJETA_CREDITO" || input.paymentMethod === "TARJETA_DEBITO";
  if (cardPayment && input.cardLast4 !== undefined && !/^\d{4}$/.test(input.cardLast4)) {
    throw new ValidationError("Los datos de la tarjeta deben contener únicamente los últimos 4 dígitos.", "cardLast4");
  }

  if (input.externalPaymentReference?.length && input.externalPaymentReference.length > 150) {
    throw new ValidationError("La referencia de pago es demasiado larga.", "externalPaymentReference");
  }

  for (let i = 0; i < input.items.length; i++) {
    const item = input.items[i];
    if (!item.productId) {
      throw new ValidationError(
        `Item at index ${i} is missing a product ID.`,
        `items[${i}].productId`,
      );
    }
    if (!Number.isInteger(item.quantity) || item.quantity <= 0) {
      throw new ValidationError(
        `Item at index ${i} must have a positive integer quantity.`,
        `items[${i}].quantity`,
      );
    }
    if (typeof item.unitPrice !== "number" || item.unitPrice <= 0) {
      throw new ValidationError(
        `Item at index ${i} must have a positive unit price.`,
        `items[${i}].unitPrice`,
      );
    }
  }

  if (!input.visitId) {
    throw new ValidationError("La visita asociada es obligatoria.", "visitId");
  }

  if (!input.buyerName?.trim()) {
    throw new ValidationError("El nombre del cliente es obligatorio.", "buyerName");
  }

  if (!input.clientPhone?.trim()) {
    throw new ValidationError("El teléfono del cliente es obligatorio.", "clientPhone");
  }

  if (!input.deliveryAddress?.trim()) {
    throw new ValidationError("La dirección de entrega es obligatoria.", "deliveryAddress");
  }

  if (!input.paymentMethod) {
    throw new ValidationError("El método de pago es obligatorio.", "paymentMethod");
  }

  if (input.deliveryEstimatedDate && Number.isNaN(input.deliveryEstimatedDate.getTime())) {
    throw new ValidationError("La fecha estimada de entrega no es válida.", "deliveryEstimatedDate");
  }

  const validPaymentMethods = new Set([
    "EFECTIVO",
    "TARJETA_CREDITO",
    "TARJETA_DEBITO",
    "TRANSFERENCIA",
    "OTRO",
  ]);
  if (!validPaymentMethods.has(input.paymentMethod)) {
    throw new ValidationError("El método de pago no es válido.", "paymentMethod");
  }

  // paymentStatus, deliveryStatus e invoiceStatus son gestionados por
  // administración o integraciones externas. El servidor aplica defaults
  // cuando el vendedor no los provee (REG-068, data-model.md §23).

  if (input.paymentStatus) {
    const validPaymentStatuses = new Set(["PAID", "PENDING", "PARTIALLY_PAID"]);
    if (!validPaymentStatuses.has(input.paymentStatus)) {
      throw new ValidationError("El estado del pago no es válido.", "paymentStatus");
    }
  }

  if (input.deliveryStatus) {
    const validDeliveryStatuses = new Set(["PENDING", "SCHEDULED", "IN_TRANSIT", "DELIVERED", "CANCELLED"]);
    if (!validDeliveryStatuses.has(input.deliveryStatus)) {
      throw new ValidationError("El estado de entrega no es válido.", "deliveryStatus");
    }
  }

  if (input.invoiceStatus) {
    const validInvoiceStatuses = new Set(["PENDING", "ISSUED", "CANCELLED", "ERROR"]);
    if (!validInvoiceStatuses.has(input.invoiceStatus)) {
      throw new ValidationError("El estado de facturación no es válido.", "invoiceStatus");
    }
  }

  if (cardPayment && (input.installments === undefined || !Number.isInteger(input.installments) || input.installments < 1 || input.installments > 48)) {
    throw new ValidationError("Las cuotas deben ser un número entero entre 1 y 48.", "installments");
  }

  if (input.discount !== undefined && input.discount < 0) {
    throw new ValidationError("El descuento no puede ser negativo.", "discount");
  }

  if (input.discount !== undefined && !Number.isFinite(input.discount)) {
    throw new ValidationError("El descuento debe ser un número válido.", "discount");
  }

  if ((input.discount ?? 0) > 0 && !input.discountReason?.trim()) {
    throw new ValidationError("La razón del descuento es obligatoria.", "discountReason");
  }

  if (input.discount !== undefined && input.discount > calculateSaleTotal(input.items)) {
    throw new ValidationError("El descuento no puede superar el subtotal.", "discount");
  }
}

/**
 * Validate sale data for update.
 *
 * Rules:
 * - If items are provided, must have at least one.
 * - If items are provided, each must be valid.
 * - If saleDate is provided, must be a valid Date.
 *
 * @throws {ValidationError} if any validation rule is violated.
 */
export function validateSaleForUpdate(input: UpdateSaleInput): void {
  if (input.saleDate !== undefined) {
    if (!(input.saleDate instanceof Date) || isNaN(input.saleDate.getTime())) {
      throw new ValidationError("A valid sale date is required.", "saleDate");
    }
  }

  if (input.items !== undefined) {
    if (input.items.length === 0) {
      throw new ValidationError("A sale must have at least one item.", "items");
    }

    for (let i = 0; i < input.items.length; i++) {
      const item = input.items[i];
      if (!item.productId) {
        throw new ValidationError(
          `Item at index ${i} is missing a product ID.`,
          `items[${i}].productId`,
        );
      }
      if (!Number.isInteger(item.quantity) || item.quantity <= 0) {
        throw new ValidationError(
          `Item at index ${i} must have a positive integer quantity.`,
          `items[${i}].quantity`,
        );
      }
      if (typeof item.unitPrice !== "number" || item.unitPrice <= 0) {
        throw new ValidationError(
          `Item at index ${i} must have a positive unit price.`,
          `items[${i}].unitPrice`,
        );
      }
    }
  }
}

/**
 * Validate that a sale status transition is allowed.
 *
 * @throws {DomainRuleError} if the transition is not allowed.
 */
export function validateSaleStatusTransition(
  currentStatus: SaleStatus,
  targetStatus: SaleStatus,
): void {
  if (!canTransitionTo(currentStatus, targetStatus)) {
    throw new DomainRuleError(
      `Cannot transition sale from '${currentStatus}' to '${targetStatus}'.`,
      "INVALID_SALE_TRANSITION",
    );
  }
}

/**
 * Validate rejection reason is provided when rejecting a sale.
 *
 * @throws {ValidationError} if reason is missing or empty.
 */
export function validateRejectionReason(reason: string | undefined): void {
  if (!reason || reason.trim().length === 0) {
    throw new ValidationError(
      "A rejection reason is required.",
      "rejectionReason",
    );
  }
}
