/**
 * Sales module composition root.
 *
 * Wires together all sales and catalog components:
 * - Prisma repositories
 * - Authorization service
 * - Use cases
 *
 * Reference: system-architecture.md §6.4
 */

import type { PrismaClient } from "@prisma/client";
import type { AuthorizationService } from "@/modules/authorization/domain";
import type { OrganizationRepository } from "@/modules/organization/domain";
import { PrismaAuditAdapter } from "@/modules/audit/infrastructure/prisma-audit-adapter";
import { PrismaSaleRepository } from "./infrastructure/prisma-sale-repository";
import { PrismaProductRepository } from "./infrastructure/prisma-product-repository";
import { PrismaProductCategoryRepository } from "./infrastructure/prisma-product-category-repository";
import { CreateSaleUseCase } from "./application/create-sale-use-case";
import { UpdateSaleUseCase } from "./application/update-sale-use-case";
import { SubmitSaleForReviewUseCase } from "./application/submit-sale-for-review-use-case";
import { ApproveSaleUseCase } from "./application/approve-sale-use-case";
import { RejectSaleUseCase } from "./application/reject-sale-use-case";
import { CancelSaleUseCase } from "./application/cancel-sale-use-case";
import { GetSaleUseCase } from "./application/get-sale-use-case";
import { ListSalesUseCase } from "./application/list-sales-use-case";
import { CreateProductUseCase } from "./application/create-product-use-case";
import { UpdateProductUseCase } from "./application/update-product-use-case";
import { ListProductsUseCase } from "./application/list-products-use-case";
import { CreateCategoryUseCase } from "./application/create-category-use-case";
import { ListCategoriesUseCase } from "./application/list-categories-use-case";
import { PrismaSaleCommissionTransaction } from "@/infrastructure/prisma/sale-commission-transaction";
import { PrismaVisitRepository } from "@/modules/visits/infrastructure/prisma-visit-repository";

/**
 * Create all sales use cases with dependencies wired.
 */
export function createSalesUseCases(
  prisma: PrismaClient,
  authorizationService: AuthorizationService,
  organizationRepository: OrganizationRepository,
) {
  const saleRepository = new PrismaSaleRepository(prisma);
  const productRepository = new PrismaProductRepository(prisma);
  const categoryRepository = new PrismaProductCategoryRepository(prisma);
  const saleCommissionTransaction = new PrismaSaleCommissionTransaction(prisma);
  const auditPort = new PrismaAuditAdapter(prisma);
  const visitRepository = new PrismaVisitRepository(prisma);

  return {
    // Sales
    createSale: new CreateSaleUseCase(authorizationService, saleRepository, auditPort, visitRepository),
    updateSale: new UpdateSaleUseCase(authorizationService, saleRepository, auditPort),
    submitSaleForReview: new SubmitSaleForReviewUseCase(authorizationService, saleRepository, auditPort),
    approveSale: new ApproveSaleUseCase(
      authorizationService,
      saleRepository,
      auditPort,
      saleCommissionTransaction,
    ),
    rejectSale: new RejectSaleUseCase(authorizationService, saleRepository, auditPort),
    cancelSale: new CancelSaleUseCase(
      authorizationService,
      saleRepository,
      auditPort,
      saleCommissionTransaction,
    ),
    getSale: new GetSaleUseCase(authorizationService, saleRepository),
    listSales: new ListSalesUseCase(authorizationService, saleRepository, organizationRepository),

    // Catalog
    createProduct: new CreateProductUseCase(authorizationService, productRepository),
    updateProduct: new UpdateProductUseCase(authorizationService, productRepository),
    listProducts: new ListProductsUseCase(authorizationService, productRepository),
    createCategory: new CreateCategoryUseCase(authorizationService, categoryRepository),
    listCategories: new ListCategoriesUseCase(authorizationService, categoryRepository),
  };
}
