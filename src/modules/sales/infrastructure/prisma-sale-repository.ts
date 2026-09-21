/**
 * Prisma implementation of the Sale repository port.
 *
 * Encapsulates all Prisma and SQL details behind the SaleRepository port.
 * Application never imports Prisma types directly.
 *
 * Reference: ADR-008, system-architecture.md §6
 */

import type { PrismaClient, Sale as PrismaSale, SaleItem as PrismaSaleItem } from "@prisma/client";
import type {
  SaleRepository,
  SaleRecord,
  SaleListFilter,
  PaginationOptions,
  SaleListResult,
} from "@/modules/sales/domain";
import type { SaleStatus } from "@/modules/sales/domain";
import { DatabaseError } from "@/shared/errors";

// =============================================================================
// Mapping Helpers
// =============================================================================

function mapSaleItem(item: PrismaSaleItem) {
  return {
    id: item.id,
    saleId: item.saleId,
    productId: item.productId,
    quantity: item.quantity,
    unitPrice: Number(item.unitPrice),
    subtotal: Number(item.subtotal),
    createdAt: item.createdAt,
    updatedAt: item.updatedAt,
  };
}

function mapSale(sale: PrismaSale & { items?: PrismaSaleItem[] }): SaleRecord {
  return {
    id: sale.id,
    saleNumber: Number(sale.saleNumber),
    employeeId: sale.employeeId,
    saleDate: sale.saleDate,
    status: sale.status as SaleStatus,
    totalAmount: Number(sale.totalAmount),
    approvedAt: sale.approvedAt,
    buyerName: sale.buyerName ?? null,
    clientDocumentType: sale.clientDocumentType ?? null,
    clientDocumentNumber: sale.clientDocumentNumber ?? null,
    clientPhone: sale.clientPhone ?? null,
    clientEmail: sale.clientEmail ?? null,
    rejectionReason: sale.rejectionReason ?? null,
    notes: sale.notes ?? null,
    visitId: sale.visitId ?? null,
    clientId: sale.clientId ?? null,
    paymentMethod: sale.paymentMethod ?? null,
    paymentStatus: sale.paymentStatus ?? null,
    installments: sale.installments ?? null,
    externalPaymentReference: sale.externalPaymentReference ?? null,
    cardBrand: sale.cardBrand ?? null,
    cardLast4: sale.cardLast4 ?? null,
    discount: sale.discount === null ? null : Number(sale.discount),
    discountReason: sale.discountReason ?? null,
    deliveryAddress: sale.deliveryAddress ?? null,
    deliveryStatus: sale.deliveryStatus ?? null,
    deliveryEstimatedDate: sale.deliveryEstimatedDate ?? null,
    invoiceStatus: sale.invoiceStatus ?? null,
    externalInvoiceReference: sale.externalInvoiceReference ?? null,
    createdAt: sale.createdAt,
    updatedAt: sale.updatedAt,
    items: (sale.items ?? []).map(mapSaleItem),
  };
}

// =============================================================================
// Repository Implementation
// =============================================================================

export class PrismaSaleRepository implements SaleRepository {
  constructor(private readonly prisma: PrismaClient) {}

  async findById(id: string): Promise<SaleRecord | null> {
    try {
      const sale = await this.prisma.sale.findUnique({
        where: { id },
        include: { items: true },
      });
      return sale ? mapSale(sale) : null;
    } catch (error) {
      throw new DatabaseError("Failed to find sale.", { cause: error as Error });
    }
  }

  async create(input: {
    readonly employeeId: string;
    readonly saleDate: Date;
    readonly status: SaleStatus;
    readonly totalAmount: number;
    readonly buyerName: string | null;
    readonly clientId: string;
    readonly visitId: string;
    readonly clientDocumentType: string | null;
    readonly clientDocumentNumber: string | null;
    readonly clientPhone: string | null;
    readonly clientEmail: string | null;
    readonly notes: string | null;
    readonly paymentMethod: string | null;
    readonly paymentStatus: string | null;
    readonly installments: number | null;
    readonly externalPaymentReference: string | null;
    readonly cardBrand: string | null;
    readonly cardLast4: string | null;
    readonly discount: number | null;
    readonly discountReason: string | null;
    readonly deliveryAddress: string;
    readonly deliveryStatus: string | null;
    readonly deliveryEstimatedDate: Date | null;
    readonly invoiceStatus: string | null;
    readonly externalInvoiceReference: string | null;
    readonly items: readonly {
      readonly productId: string;
      readonly quantity: number;
      readonly unitPrice: number;
      readonly subtotal: number;
    }[];
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
  }): Promise<SaleRecord> {
    try {
      // Generate next sale number atomically using a transaction
      const sale = await this.prisma.$transaction(async (tx) => {
        await tx.visit.update({
          where: { id: input.visitId },
          data: {
            status: "COMPLETED",
            completedDate: new Date(),
          },
        });

        // Get the next sale number using a row-level lock
        const result = await tx.$queryRaw<{ next_number: bigint }[]>`
          SELECT nextval('sale_number_seq') AS next_number
        `;
        const saleNumber = Number(result[0].next_number);

        const sale = await tx.sale.create({
          data: {
            saleNumber,
            employeeId: input.employeeId,
            saleDate: input.saleDate,
            status: input.status,
            totalAmount: input.totalAmount,
            buyerName: input.buyerName,
            clientId: input.clientId,
            visitId: input.visitId,
            clientDocumentType: input.clientDocumentType,
            clientDocumentNumber: input.clientDocumentNumber,
            clientPhone: input.clientPhone,
            clientEmail: input.clientEmail,
            notes: input.notes,
            paymentMethod: input.paymentMethod,
            paymentStatus: input.paymentStatus,
            installments: input.installments,
            externalPaymentReference: input.externalPaymentReference,
            cardBrand: input.cardBrand,
            cardLast4: input.cardLast4,
            discount: input.discount,
            discountReason: input.discountReason,
            deliveryAddress: input.deliveryAddress,
            deliveryStatus: input.deliveryStatus,
            deliveryEstimatedDate: input.deliveryEstimatedDate,
            invoiceStatus: input.invoiceStatus,
            externalInvoiceReference: input.externalInvoiceReference,
            items: {
              create: input.items.map((item) => ({
                productId: item.productId,
                quantity: item.quantity,
                unitPrice: item.unitPrice,
                subtotal: item.subtotal,
              })),
            },
          },
          include: { items: true },
        });

        // Persist referral contacts within the same transaction
        if (input.referralContacts && input.referralContacts.length > 0) {
          await tx.referralContact.createMany({
            data: input.referralContacts.map((contact) => ({
              saleId: sale.id,
              clientName: contact.clientName,
              phone: contact.phone,
              email: contact.email ?? null,
              street: contact.street ?? null,
              streetNumber: contact.streetNumber ?? null,
              floor: contact.floor ?? null,
              apartment: contact.apartment ?? null,
              city: contact.city ?? null,
              province: contact.province ?? null,
              postalCode: contact.postalCode ?? null,
              addressNotes: contact.addressNotes ?? null,
            })),
          });
        }

        return sale;
      });
      return mapSale(sale);
    } catch (error) {
      throw new DatabaseError("Failed to create sale.", { cause: error as Error });
    }
  }

  async update(
    id: string,
    input: {
      readonly saleDate?: Date;
      readonly buyerName?: string;
      readonly notes?: string;
    },
  ): Promise<SaleRecord> {
    try {
      const sale = await this.prisma.sale.update({
        where: { id },
        data: {
          ...(input.saleDate !== undefined && { saleDate: input.saleDate }),
          ...(input.buyerName !== undefined && { buyerName: input.buyerName }),
          ...(input.notes !== undefined && { notes: input.notes }),
        },
        include: { items: true },
      });
      return mapSale(sale);
    } catch (error) {
      throw new DatabaseError("Failed to update sale.", { cause: error as Error });
    }
  }

  async replaceItems(
    id: string,
    items: readonly {
      readonly productId: string;
      readonly quantity: number;
      readonly unitPrice: number;
      readonly subtotal: number;
    }[],
    totalAmount: number,
  ): Promise<SaleRecord> {
    try {
      return await this.prisma.$transaction(async (tx) => {
        // Delete existing items
        await tx.saleItem.deleteMany({ where: { saleId: id } });

        // Create new items
        await tx.saleItem.createMany({
          data: items.map((item) => ({
            saleId: id,
            productId: item.productId,
            quantity: item.quantity,
            unitPrice: item.unitPrice,
            subtotal: item.subtotal,
          })),
        });

        // Update total amount
        const sale = await tx.sale.update({
          where: { id },
          data: { totalAmount },
          include: { items: true },
        });

        return mapSale(sale);
      });
    } catch (error) {
      throw new DatabaseError("Failed to replace sale items.", {
        cause: error as Error,
      });
    }
  }

  async updateStatus(
    id: string,
    status: SaleStatus,
    rejectionReason?: string,
    approvedAt?: Date,
  ): Promise<SaleRecord> {
    try {
      const sale = await this.prisma.sale.update({
        where: { id },
        data: {
          status,
          ...(rejectionReason !== undefined && { rejectionReason }),
          ...(approvedAt !== undefined && { approvedAt }),
        },
        include: { items: true },
      });
      return mapSale(sale);
    } catch (error) {
      throw new DatabaseError("Failed to update sale status.", {
        cause: error as Error,
      });
    }
  }

  async updateStatusIfCurrent(
    id: string,
    expectedCurrentStatus: SaleStatus,
    status: SaleStatus,
    rejectionReason?: string,
    approvedAt?: Date,
  ): Promise<SaleRecord | null> {
    try {
      const result = await this.prisma.sale.updateMany({
        where: { id, status: expectedCurrentStatus },
        data: {
          status,
          ...(rejectionReason !== undefined && { rejectionReason }),
          ...(approvedAt !== undefined && { approvedAt }),
        },
      });
      if (result.count !== 1) return null;
      const sale = await this.prisma.sale.findUnique({
        where: { id },
        include: { items: true },
      });
      return sale ? mapSale(sale) : null;
    } catch (error) {
      throw new DatabaseError("Failed to update sale status conditionally.", {
        cause: error as Error,
      });
    }
  }

  async list(
    filter: SaleListFilter,
    pagination: PaginationOptions,
  ): Promise<SaleListResult> {
    try {
      const where: Record<string, unknown> = {};

      if (filter.statuses && filter.statuses.length > 0) {
        where.status = { in: filter.statuses };
      } else if (filter.status) {
        where.status = filter.status;
      }

      if (filter.employeeId) {
        where.employeeId = filter.employeeId;
      }

      if (filter.employeeIds && filter.employeeIds.length > 0) {
        where.employeeId = { in: filter.employeeIds };
      }

      if (filter.saleDateFrom || filter.saleDateTo) {
        where.saleDate = {};
        if (filter.saleDateFrom) {
          (where.saleDate as Record<string, Date>).gte = filter.saleDateFrom;
        }
        if (filter.saleDateTo) {
          (where.saleDate as Record<string, Date>).lte = filter.saleDateTo;
        }
      }

      const [sales, totalCount] = await Promise.all([
        this.prisma.sale.findMany({
          where,
          include: { items: true },
          orderBy: { saleDate: "desc" },
          skip: (pagination.page - 1) * pagination.pageSize,
          take: pagination.pageSize,
        }),
        this.prisma.sale.count({ where }),
      ]);

      return {
        sales: sales.map(mapSale),
        totalCount,
        page: pagination.page,
        pageSize: pagination.pageSize,
      };
    } catch (error) {
      throw new DatabaseError("Failed to list sales.", {
        cause: error as Error,
      });
    }
  }
}
