/**
 * Sale repository port.
 *
 * Defines the contract for sale persistence operations.
 * Infrastructure implements this port; Application consumes it.
 *
 * Reference: system-architecture.md §6, ADR-008
 */

import type { SaleData, SaleItemData, SaleStatusRow, SaleSummary } from "./sale";
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
  /** quantity × unitPrice, as stored by the sale write use cases. */
  readonly subtotal: number;
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

  // -------------------------------------------------------------------------
  // Aggregate reads
  //
  // Consumed by the progression module to compute points, so it reads the
  // sales table through this port instead of querying it directly.
  // -------------------------------------------------------------------------

  /** Count approved sales of an employee on or after `since`. */
  countApprovedSince(employeeId: string, since: Date): Promise<number>;

  /** Count approved sales of an employee within an inclusive date range. */
  countApprovedInPeriod(
    employeeId: string,
    from: Date,
    to: Date,
  ): Promise<number>;

  /** Count approved sales per employee, each with its own lower bound. */
  countApprovedSinceByEmployee(
    entries: ReadonlyArray<{ employeeId: string; since: Date }>,
  ): Promise<Map<string, number>>;

  /** Monthly sales objective configured for a level, 0 when not configured. */
  getMonthlyTarget(levelId: number): Promise<number>;

  /**
   * Count sales in a period, grouped by employee.
   *
   * Consumes the status filter given by the caller so each read model keeps its
   * own semantics (progression counts APPROVED only; dashboards also count
   * PENDING_REVIEW). Employees without sales in the period are absent from the map.
   */
  countInPeriodByEmployee(
    employeeIds: readonly string[],
    from: Date,
    to: Date,
    statuses: readonly SaleStatus[],
  ): Promise<Map<string, number>>;

  /** Count sales in a period for several employees. */
  countInPeriodForEmployees(
    employeeIds: readonly string[],
    from: Date,
    to: Date,
    statuses: readonly SaleStatus[],
  ): Promise<number>;

  /** Approved sales of an employee, oldest first. */
  findApprovedByEmployeeId(employeeId: string): Promise<SaleRecord[]>;

  /** Sales linked to the given visits, whatever their status. */
  findByVisitIds(visitIds: readonly string[]): Promise<SaleRecord[]>;

  /** Date + status rows of several employees' sales, newest first. */
  findStatusRowsByEmployeeIds(
    employeeIds: readonly string[],
  ): Promise<SaleStatusRow[]>;

  /** Sale numbers and totals of several sales (commission labels). */
  findSummariesByIds(saleIds: readonly string[]): Promise<SaleSummary[]>;

  /**
   * Monthly sales objectives configured for the given levels.
   * Levels without a configured objective are absent from the map.
   */
  getMonthlyTargetsByLevelIds(
    levelIds: readonly number[],
  ): Promise<Map<number, number>>;
}
