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

import { prisma } from "@/infrastructure/prisma/client";
import { createAuthorizationService } from "@/modules/authorization/composition-root";
import { PrismaOrganizationRepository } from "@/infrastructure/organization/prisma-organization-repository";
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
import { GetSaleDetailUseCase } from "./application/get-sale-detail-use-case";
import { GetSaleLabelsUseCase } from "./application/get-sale-labels-use-case";
import { GetProductByIdUseCase } from "./application/get-product-by-id-use-case";
import { ListSalesUseCase } from "./application/list-sales-use-case";
import { CreateProductUseCase } from "./application/create-product-use-case";
import { UpdateProductUseCase } from "./application/update-product-use-case";
import { ListProductsUseCase } from "./application/list-products-use-case";
import { CreateCategoryUseCase } from "./application/create-category-use-case";
import { ListCategoriesUseCase } from "./application/list-categories-use-case";
import { PrismaSaleCommissionTransaction } from "@/infrastructure/prisma/sale-commission-transaction";
import { PrismaVisitRepository } from "@/modules/visits/infrastructure/prisma-visit-repository";
import { PrismaReferralContactRepository } from "@/modules/visits/infrastructure/prisma-referral-contact-repository";
import { PrismaCommissionEntryRepository } from "@/modules/commissions/infrastructure/prisma-commission-entry-repository";

/**
 * Create all sales use cases with dependencies wired.
 */
export function createSalesUseCases() {
  const authorizationService = createAuthorizationService();
  const organizationRepository = new PrismaOrganizationRepository(prisma);
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
    getSaleDetail: new GetSaleDetailUseCase(
      new GetSaleUseCase(authorizationService, saleRepository),
      productRepository,
      new PrismaReferralContactRepository(prisma),
      new PrismaCommissionEntryRepository(prisma),
    ),
    listSales: new ListSalesUseCase(authorizationService, saleRepository, organizationRepository),
    getSaleLabels: new GetSaleLabelsUseCase(saleRepository),
    getProductById: new GetProductByIdUseCase(authorizationService, productRepository),

    // Catalog
    createProduct: new CreateProductUseCase(authorizationService, productRepository),
    updateProduct: new UpdateProductUseCase(authorizationService, productRepository),
    listProducts: new ListProductsUseCase(authorizationService, productRepository),
    createCategory: new CreateCategoryUseCase(authorizationService, categoryRepository),
    listCategories: new ListCategoriesUseCase(authorizationService, categoryRepository),
  };
}
