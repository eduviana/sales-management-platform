/**
 * Create category use case.
 *
 * Allows creating a new product category.
 * Authorization: catalog.create (ADMIN only).
 *
 * Reference: data-model.md §13
 */

import type { AuthorizationService } from "@/modules/authorization/domain";
import type { AuthorizationContext } from "@/modules/authorization/domain";
import type { ProductCategoryRepository, CreateCategoryInput } from "@/modules/sales/domain";
import { validateCategoryForCreation } from "@/modules/sales/domain";
import { AuthorizationError } from "@/shared/errors";

export interface CreateCategoryUseCaseInput {
  readonly authContext: AuthorizationContext;
  readonly name: string;
  readonly description?: string;
}

export class CreateCategoryUseCase {
  constructor(
    private readonly authorizationService: AuthorizationService,
    private readonly categoryRepository: ProductCategoryRepository,
  ) {}

  async execute(input: CreateCategoryUseCaseInput) {
    // 1. Authorize
    const decision = await this.authorizationService.authorize(
      input.authContext,
      { permission: "catalog.create" },
    );

    if (!decision.allowed) {
      throw new AuthorizationError(
        decision.reason ?? "Not authorized to create categories.",
      );
    }

    // 2. Validate
    const createInput: CreateCategoryInput = {
      name: input.name,
      description: input.description,
    };
    validateCategoryForCreation(createInput);

    // 3. Create
    const category = await this.categoryRepository.create({
      name: input.name,
      description: input.description ?? null,
    });

    return { category };
  }
}
