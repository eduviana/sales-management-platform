/**
 * Sales module — domain layer barrel exports.
 *
 * Reference: system-architecture.md §6
 */

// Sale status and transitions
export type { SaleStatus } from "./sale-status";
export {
  canTransitionTo,
  getValidTransitions,
  isTerminalStatus,
} from "./sale-status";

// Sale domain rules and value objects
export type {
  SaleData,
  SaleItemData,
  CreateSaleInput,
  UpdateSaleInput,
  RejectSaleInput,
} from "./sale";
export {
  calculateSaleTotal,
  validateSaleForCreation,
  validateSaleForUpdate,
  validateSaleStatusTransition,
  validateRejectionReason,
} from "./sale";

// Catalog domain rules and value objects
export type {
  ProductData,
  ProductCategoryData,
  CreateProductInput,
  UpdateProductInput,
  CreateCategoryInput,
  UpdateCategoryInput,
} from "./catalog";
export {
  validateProductForCreation,
  validateProductForUpdate,
  validateCategoryForCreation,
  validateCategoryForUpdate,
} from "./catalog";

// Repository ports
export type { SaleRepository, SaleRecord, SaleItemRecord, SaleListFilter, PaginationOptions, SaleListResult } from "./sale-repository";
export type { ProductRepository, ProductRecord, ProductListFilter } from "./product-repository";
export type { ProductCategoryRepository, ProductCategoryRecord } from "./product-category-repository";
