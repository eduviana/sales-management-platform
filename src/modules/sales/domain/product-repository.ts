/**
 * Product repository port.
 *
 * Defines the contract for product persistence operations.
 * Infrastructure implements this port; Application consumes it.
 *
 * Reference: system-architecture.md §6, ADR-008
 */

import type { ProductData } from "./catalog";

// =============================================================================
// Record Types
// =============================================================================

/**
 * A product record as stored in the repository.
 */
export type ProductRecord = ProductData;

// =============================================================================
// Query Types
// =============================================================================

/**
 * Filter options for listing products.
 */
export interface ProductListFilter {
  /** Filter by category ID. */
  readonly categoryId?: string;

  /** Filter by active status. */
  readonly isActive?: boolean;

  /** Free text search on name or code. */
  readonly search?: string;
}

// =============================================================================
// Repository Port
// =============================================================================

/**
 * Port for product persistence operations.
 */
export interface ProductRepository {
  /**
   * Find a product by ID.
   */
  findById(id: string): Promise<ProductRecord | null>;

  /**
   * Find a product by code.
   */
  findByCode(code: string): Promise<ProductRecord | null>;

  /**
   * Create a new product.
   */
  create(input: {
    readonly code: string;
    readonly name: string;
    readonly description: string | null;
    readonly price: number;
    readonly categoryId: string;
  }): Promise<ProductRecord>;

  /**
   * Update an existing product.
   */
  update(
    id: string,
    input: {
      readonly name?: string;
      readonly description?: string;
      readonly price?: number;
      readonly categoryId?: string;
      readonly isActive?: boolean;
    },
  ): Promise<ProductRecord>;

  /**
   * List products with optional filtering.
   */
  list(filter: ProductListFilter): Promise<readonly ProductRecord[]>;
}
