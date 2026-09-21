/**
 * Catalog domain rules and value objects.
 *
 * Contains validation functions for product and category management.
 * No framework or persistence dependencies — pure domain logic.
 *
 * Reference: data-model.md §13, business-rules.md §16.1
 */

import { ValidationError } from "@/shared/errors";

// =============================================================================
// Value Objects
// =============================================================================

/**
 * Complete data for a product record.
 */
export interface ProductData {
  readonly id: string;
  readonly code: string;
  readonly name: string;
  readonly description: string | null;
  readonly price: number;
  readonly categoryId: string;
  readonly isActive: boolean;
  readonly createdAt: Date;
  readonly updatedAt: Date;
}

/**
 * Complete data for a product category record.
 */
export interface ProductCategoryData {
  readonly id: string;
  readonly name: string;
  readonly description: string | null;
  readonly createdAt: Date;
  readonly updatedAt: Date;
}

/**
 * Input data for creating a new product.
 */
export interface CreateProductInput {
  readonly code: string;
  readonly name: string;
  readonly description?: string;
  readonly price: number;
  readonly categoryId: string;
}

/**
 * Input data for updating an existing product.
 */
export interface UpdateProductInput {
  readonly name?: string;
  readonly description?: string;
  readonly price?: number;
  readonly categoryId?: string;
  readonly isActive?: boolean;
}

/**
 * Input data for creating a new category.
 */
export interface CreateCategoryInput {
  readonly name: string;
  readonly description?: string;
}

/**
 * Input data for updating an existing category.
 */
export interface UpdateCategoryInput {
  readonly name?: string;
  readonly description?: string;
}

// =============================================================================
// Validation Functions
// =============================================================================

/**
 * Validate product data for creation.
 *
 * Rules:
 * - Code is required and must be non-empty.
 * - Name is required and must be non-empty.
 * - Price must be positive.
 * - Category ID is required.
 *
 * @throws {ValidationError} if any validation rule is violated.
 */
export function validateProductForCreation(
  input: CreateProductInput,
): void {
  if (!input.code || input.code.trim().length === 0) {
    throw new ValidationError("Product code is required.", "code");
  }

  if (input.code.length > 50) {
    throw new ValidationError(
      "Product code must not exceed 50 characters.",
      "code",
    );
  }

  if (!input.name || input.name.trim().length === 0) {
    throw new ValidationError("Product name is required.", "name");
  }

  if (input.name.length > 200) {
    throw new ValidationError(
      "Product name must not exceed 200 characters.",
      "name",
    );
  }

  if (typeof input.price !== "number" || input.price <= 0) {
    throw new ValidationError("Product price must be positive.", "price");
  }

  if (!input.categoryId) {
    throw new ValidationError("Category ID is required.", "categoryId");
  }
}

/**
 * Validate product data for update.
 *
 * Rules:
 * - If name is provided, must be non-empty and ≤ 200 chars.
 * - If price is provided, must be positive.
 *
 * @throws {ValidationError} if any validation rule is violated.
 */
export function validateProductForUpdate(input: UpdateProductInput): void {
  if (input.name !== undefined) {
    if (input.name.trim().length === 0) {
      throw new ValidationError("Product name cannot be empty.", "name");
    }
    if (input.name.length > 200) {
      throw new ValidationError(
        "Product name must not exceed 200 characters.",
        "name",
      );
    }
  }

  if (input.price !== undefined) {
    if (typeof input.price !== "number" || input.price <= 0) {
      throw new ValidationError("Product price must be positive.", "price");
    }
  }
}

/**
 * Validate category data for creation.
 *
 * Rules:
 * - Name is required and must be non-empty.
 *
 * @throws {ValidationError} if any validation rule is violated.
 */
export function validateCategoryForCreation(
  input: CreateCategoryInput,
): void {
  if (!input.name || input.name.trim().length === 0) {
    throw new ValidationError("Category name is required.", "name");
  }

  if (input.name.length > 150) {
    throw new ValidationError(
      "Category name must not exceed 150 characters.",
      "name",
    );
  }
}

/**
 * Validate category data for update.
 *
 * @throws {ValidationError} if any validation rule is violated.
 */
export function validateCategoryForUpdate(input: UpdateCategoryInput): void {
  if (input.name !== undefined) {
    if (input.name.trim().length === 0) {
      throw new ValidationError("Category name cannot be empty.", "name");
    }
    if (input.name.length > 150) {
      throw new ValidationError(
        "Category name must not exceed 150 characters.",
        "name",
      );
    }
  }
}
