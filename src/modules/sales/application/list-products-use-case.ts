/**
 * List products use case.
 *
 * Lists products from the catalog with optional filtering.
 * Authorization: catalog.read.
 *
 * Reference: data-model.md §13
 */

import type { AuthorizationService } from "@/modules/authorization/domain";
import type { AuthorizationContext } from "@/modules/authorization/domain";
import type { ProductRepository, ProductListFilter } from "@/modules/sales/domain";
import { AuthorizationError } from "@/shared/errors";

export interface ListProductsInput {
  readonly authContext: AuthorizationContext;
  readonly categoryId?: string;
  readonly isActive?: boolean;
  readonly search?: string;
}

export class ListProductsUseCase {
  constructor(
    private readonly authorizationService: AuthorizationService,
    private readonly productRepository: ProductRepository,
  ) {}

  async execute(input: ListProductsInput) {
    // 1. Authorize
    const decision = await this.authorizationService.authorize(
      input.authContext,
      { permission: "catalog.read" },
    );

    if (!decision.allowed) {
      throw new AuthorizationError(
        decision.reason ?? "Not authorized to read products.",
      );
    }

    // 2. Build filter
    const filter: ProductListFilter = {
      ...(input.categoryId && { categoryId: input.categoryId }),
      ...(input.isActive !== undefined && { isActive: input.isActive }),
      ...(input.search && { search: input.search }),
    };

    // 3. Query
    const products = await this.productRepository.list(filter);

    return { products };
  }
}
