/**
 * Product category repository port.
 *
 * Defines the contract for product category persistence operations.
 * Infrastructure implements this port; Application consumes it.
 *
 * Reference: system-architecture.md §6, ADR-008
 */

import type { ProductCategoryData } from "./catalog";

// =============================================================================
// Record Types
// =============================================================================

/**
 * A product category record as stored in the repository.
 */
export type ProductCategoryRecord = ProductCategoryData;

// =============================================================================
// Repository Port
// =============================================================================

/**
 * Port for product category persistence operations.
 */
export interface ProductCategoryRepository {
  /**
   * Find a category by ID.
   */
  findById(id: string): Promise<ProductCategoryRecord | null>;

  /**
   * Create a new category.
   */
  create(input: {
    readonly name: string;
    readonly description: string | null;
  }): Promise<ProductCategoryRecord>;

  /**
   * Update an existing category.
   */
  update(
    id: string,
    input: {
      readonly name?: string;
      readonly description?: string;
    },
  ): Promise<ProductCategoryRecord>;

  /**
   * List all categories.
   */
  list(): Promise<readonly ProductCategoryRecord[]>;
}
