/**
 * Update product use case.
 *
 * Allows updating an existing product in the catalog.
 * Authorization: catalog.update (ADMIN only).
 *
 * Reference: data-model.md §13
 */

import type { AuthorizationService } from "@/modules/authorization/domain";
import type { AuthorizationContext } from "@/modules/authorization/domain";
import type { ProductRepository } from "@/modules/sales/domain";
import { validateProductForUpdate } from "@/modules/sales/domain";
import {
  AuthorizationError,
  NotFoundError,
} from "@/shared/errors";

export interface UpdateProductUseCaseInput {
  readonly authContext: AuthorizationContext;
  readonly productId: string;
  readonly name?: string;
  readonly description?: string;
  readonly price?: number;
  readonly categoryId?: string;
  readonly isActive?: boolean;
}

export class UpdateProductUseCase {
  constructor(
    private readonly authorizationService: AuthorizationService,
    private readonly productRepository: ProductRepository,
  ) {}

  async execute(input: UpdateProductUseCaseInput) {
    // 1. Authorize
    const decision = await this.authorizationService.authorize(
      input.authContext,
      { permission: "catalog.update" },
    );

    if (!decision.allowed) {
      throw new AuthorizationError(
        decision.reason ?? "Not authorized to update products.",
      );
    }

    // 2. Check product exists
    const product = await this.productRepository.findById(input.productId);
    if (!product) {
      throw new NotFoundError("Product", input.productId);
    }

    // 3. Validate
    validateProductForUpdate({
      name: input.name,
      description: input.description,
      price: input.price,
    });

    // 4. Update
    const updated = await this.productRepository.update(input.productId, {
      name: input.name,
      description: input.description,
      price: input.price,
      categoryId: input.categoryId,
      isActive: input.isActive,
    });

    return { product: updated };
  }
}
