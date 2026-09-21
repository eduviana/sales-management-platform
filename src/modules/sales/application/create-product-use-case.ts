/**
 * Create product use case.
 *
 * Allows creating a new product in the catalog.
 * Authorization: catalog.create (ADMIN only).
 *
 * Reference: data-model.md §13, business-rules.md §16.1
 */

import type { AuthorizationService } from "@/modules/authorization/domain";
import type { AuthorizationContext } from "@/modules/authorization/domain";
import type { ProductRepository, CreateProductInput } from "@/modules/sales/domain";
import { validateProductForCreation } from "@/modules/sales/domain";
import { AuthorizationError, ConflictError } from "@/shared/errors";

export interface CreateProductUseCaseInput {
  readonly authContext: AuthorizationContext;
  readonly code: string;
  readonly name: string;
  readonly description?: string;
  readonly price: number;
  readonly categoryId: string;
}

export class CreateProductUseCase {
  constructor(
    private readonly authorizationService: AuthorizationService,
    private readonly productRepository: ProductRepository,
  ) {}

  async execute(input: CreateProductUseCaseInput) {
    // 1. Authorize
    const decision = await this.authorizationService.authorize(
      input.authContext,
      { permission: "catalog.create" },
    );

    if (!decision.allowed) {
      throw new AuthorizationError(
        decision.reason ?? "Not authorized to create products.",
      );
    }

    // 2. Validate
    const createInput: CreateProductInput = {
      code: input.code,
      name: input.name,
      description: input.description,
      price: input.price,
      categoryId: input.categoryId,
    };
    validateProductForCreation(createInput);

    // 3. Check uniqueness of code
    const existing = await this.productRepository.findByCode(input.code);
    if (existing) {
      throw new ConflictError(
        `A product with code '${input.code}' already exists.`,
      );
    }

    // 4. Create
    const product = await this.productRepository.create({
      code: input.code,
      name: input.name,
      description: input.description ?? null,
      price: input.price,
      categoryId: input.categoryId,
    });

    return { product };
  }
}
