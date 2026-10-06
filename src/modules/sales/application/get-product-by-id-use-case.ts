/**
 * Get product by id use case.
 *
 * Loads a single product for the catalog screens (product edit form). The
 * product list screen uses `ListProductsUseCase`; this one covers the detail
 * read of a product the caller already addressed by id.
 *
 * Reference: requirements.md §3.4, permissions-matrix.md §4.7
 */

import type {
  AuthorizationContext,
  AuthorizationService,
} from "@/modules/authorization/domain";
import type {
  ProductRecord,
  ProductRepository,
} from "../domain/product-repository";
import { AuthorizationError } from "@/shared/errors";

export interface GetProductByIdInput {
  readonly authContext: AuthorizationContext;
  readonly productId: string;
}

export class GetProductByIdUseCase {
  constructor(
    private readonly authorizationService: AuthorizationService,
    private readonly productRepository: ProductRepository,
  ) {}

  /** The product, or null when it does not exist. */
  async execute(input: GetProductByIdInput): Promise<ProductRecord | null> {
    const decision = await this.authorizationService.authorize(input.authContext, {
      permission: "catalog.read",
    });
    if (!decision.allowed) {
      throw new AuthorizationError(
        decision.reason ?? "Not authorized to read products.",
      );
    }

    return this.productRepository.findById(input.productId);
  }
}
