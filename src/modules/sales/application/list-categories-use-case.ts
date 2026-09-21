/**
 * List categories use case.
 *
 * Lists all product categories.
 * Authorization: catalog.read.
 *
 * Reference: data-model.md §13
 */

import type { AuthorizationService } from "@/modules/authorization/domain";
import type { AuthorizationContext } from "@/modules/authorization/domain";
import type { ProductCategoryRepository } from "@/modules/sales/domain";
import { AuthorizationError } from "@/shared/errors";

export interface ListCategoriesInput {
  readonly authContext: AuthorizationContext;
}

export class ListCategoriesUseCase {
  constructor(
    private readonly authorizationService: AuthorizationService,
    private readonly categoryRepository: ProductCategoryRepository,
  ) {}

  async execute(input: ListCategoriesInput) {
    // 1. Authorize
    const decision = await this.authorizationService.authorize(
      input.authContext,
      { permission: "catalog.read" },
    );

    if (!decision.allowed) {
      throw new AuthorizationError(
        decision.reason ?? "Not authorized to read categories.",
      );
    }

    // 2. Query
    const categories = await this.categoryRepository.list();

    return { categories };
  }
}
