/**
 * Sale repository port.
 *
 * Defines the contract for sale persistence operations.
 * Infrastructure implements this port; Application consumes it.
 *
 * Reference: system-architecture.md §6, ADR-008
 */

import type { SaleData, SaleItemData } from "./sale";
import type { SaleStatus } from "./sale-status";

// =============================================================================
// Record Types
// =============================================================================

/**
 * A sale record as stored in the repository.
 */
export interface SaleRecord extends SaleData {
  readonly items: readonly SaleItemRecord[];
}

/**
 * A sale item record.
 */
export interface SaleItemRecord extends SaleItemData {
  readonly id: string;
  readonly saleId: string;
  readonly createdAt: Date;
  readonly updatedAt: Date;
}

// =============================================================================
// Query Types
// =============================================================================

/**
 * Filter options for listing sales.
 */
export interface SaleListFilter {
  /** Filter by single status. */
  readonly status?: SaleStatus;

  /** Filter by multiple statuses (overrides status if both provided). */
  readonly statuses?: readonly SaleStatus[];

  /** Filter by employee ID (for OWN scope). */
  readonly employeeId?: string;

  /** Filter by a set of employee IDs (for TEAM/BRANCH scope). */
  readonly employeeIds?: readonly string[];

  /** Filter by sale date range — start (inclusive). */
  readonly saleDateFrom?: Date;

  /** Filter by sale date range — end (inclusive). */
  readonly saleDateTo?: Date;
}

/**
 * Pagination options.
 */
export interface PaginationOptions {
  readonly page: number;
  readonly pageSize: number;
}

/**
 * Paginated result of sales.
 */
export interface SaleListResult {
  readonly sales: readonly SaleRecord[];
  readonly totalCount: number;
  readonly page: number;
  readonly pageSize: number;
}

// =============================================================================
// Repository Port
// =============================================================================

/**
 * Port for sale persistence operations.
 *
 * All methods that accept employeeId or employeeIds are expected to receive
 * the already-authorized set of IDs — the repository does NOT perform
 * authorization checks itself.
 *
 * Reference: authorization.md §10
 */
export interface SaleRepository {
  /**
   * Find a sale by ID with its items.
   */
  findById(id: string): Promise<SaleRecord | null>;

  /**
   * Create a new sale with items in a single transaction.
   */
  create(input: {
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
  }): Promise<SaleRecord>;

  /**
   * Update a sale's metadata (date, buyerName, notes).
   */
  update(
    id: string,
    input: {
      readonly saleDate?: Date;
      readonly buyerName?: string;
      readonly notes?: string;
    },
  ): Promise<SaleRecord>;

  /**
   * Replace all items of a sale with new items.
   * Recalculates totalAmount.
   */
  replaceItems(
    id: string,
    items: readonly {
      readonly productId: string;
      readonly quantity: number;
      readonly unitPrice: number;
      readonly subtotal: number;
    }[],
    totalAmount: number,
  ): Promise<SaleRecord>;

  /**
   * Update a sale's status.
   * For REJECTED status, also stores the rejection reason.
   */
  updateStatus(
    id: string,
    status: SaleStatus,
    rejectionReason?: string,
    approvedAt?: Date,
  ): Promise<SaleRecord>;

  /** Update status only when the current status matches expectedCurrentStatus. */
  updateStatusIfCurrent(
    id: string,
    expectedCurrentStatus: SaleStatus,
    status: SaleStatus,
    rejectionReason?: string,
    approvedAt?: Date,
  ): Promise<SaleRecord | null>;

  /**
   * List sales with filtering and pagination.
   */
  list(
    filter: SaleListFilter,
    pagination: PaginationOptions,
  ): Promise<SaleListResult>;
}
