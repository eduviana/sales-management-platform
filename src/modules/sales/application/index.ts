/**
 * Sales module — application layer barrel exports.
 *
 * Reference: system-architecture.md §6
 */

export { CreateSaleUseCase } from "./create-sale-use-case";
export { UpdateSaleUseCase } from "./update-sale-use-case";
export { SubmitSaleForReviewUseCase } from "./submit-sale-for-review-use-case";
export { ApproveSaleUseCase } from "./approve-sale-use-case";
export { RejectSaleUseCase } from "./reject-sale-use-case";
export { CancelSaleUseCase } from "./cancel-sale-use-case";
export { GetSaleUseCase } from "./get-sale-use-case";
export { GetSaleDetailUseCase } from "./get-sale-detail-use-case";
export { GetSaleLabelsUseCase } from "./get-sale-labels-use-case";
export { GetProductByIdUseCase } from "./get-product-by-id-use-case";
export type { GetProductByIdInput } from "./get-product-by-id-use-case";
export { ListSalesUseCase } from "./list-sales-use-case";
export { CreateProductUseCase } from "./create-product-use-case";
export { UpdateProductUseCase } from "./update-product-use-case";
export { ListProductsUseCase } from "./list-products-use-case";
export { CreateCategoryUseCase } from "./create-category-use-case";
export { ListCategoriesUseCase } from "./list-categories-use-case";
export type { SaleDetail, SaleDetailItem } from "./read-models";
export type { GetSaleDetailInput } from "./get-sale-detail-use-case";
