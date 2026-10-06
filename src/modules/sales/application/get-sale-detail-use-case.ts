/**
 * Get sale detail use case.
 *
 * Returns the full read model of the sale detail screen: the authorized sale
 * (delegated to `GetSaleUseCase`), its items with product labels, its referral
 * contacts and, once processed, its commission entries.
 *
 * Cross-module reads go through the owning modules' ports: visits owns the
 * referral contacts and commissions owns the commission entries.
 *
 * Reference: business-rules.md §8, §16.1, REG-067 (referral discount)
 */

import type { AuthorizationContext } from "@/modules/authorization/domain";
import type { GetSaleUseCase } from "./get-sale-use-case";
import type { SaleDetail, SaleDetailItem } from "./read-models";
import type { ProductRepository } from "@/modules/sales/domain";
import type { ReferralContactRepository } from "@/modules/visits/domain";
import type { CommissionEntryRepository } from "@/modules/commissions/domain";

export interface GetSaleDetailInput {
  readonly authContext: AuthorizationContext;
  readonly saleId: string;
}

/** Sale states that already have commission entries (and are worth loading). */
const COMMISSIONED_STATUSES = new Set(["APPROVED", "CANCELLED"]);

export class GetSaleDetailUseCase {
  constructor(
    private readonly getSale: GetSaleUseCase,
    private readonly productRepository: ProductRepository,
    private readonly referralContactRepository: ReferralContactRepository,
    private readonly commissionEntryRepository: CommissionEntryRepository,
  ) {}

  async execute(input: GetSaleDetailInput): Promise<SaleDetail> {
    const { sale } = await this.getSale.execute({
      authContext: input.authContext,
      saleId: input.saleId,
    });

    const loadCommissions = COMMISSIONED_STATUSES.has(sale.status);

    const [products, referralContacts, commissionEntries] = await Promise.all([
      this.productRepository.findByIds(sale.items.map((item) => item.productId)),
      this.referralContactRepository.findBySaleId(sale.id),
      loadCommissions
        ? this.commissionEntryRepository.findBySaleId(sale.id)
        : Promise.resolve([]),
    ]);

    const productsById = new Map(products.map((product) => [product.id, product]));

    const items: SaleDetailItem[] = sale.items.map((item) => ({
      id: item.id,
      productId: item.productId,
      product: {
        code: productsById.get(item.productId)?.code ?? "",
        name: productsById.get(item.productId)?.name ?? "",
      },
      unitPrice: item.unitPrice,
      quantity: item.quantity,
      subtotal: item.subtotal,
    }));

    return {
      sale,
      items,
      referralContacts,
      // The port returns entries by creation time; the screen shows them by
      // calculation time (the same instant in practice).
      commissionEntries: [...commissionEntries].sort(
        (a, b) => a.calculatedAt.getTime() - b.calculatedAt.getTime(),
      ),
    };
  }
}