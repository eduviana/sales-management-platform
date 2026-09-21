/**
 * Prisma implementation of the Product repository port.
 *
 * Encapsulates all Prisma details behind the ProductRepository port.
 * Application never imports Prisma types directly.
 *
 * Reference: ADR-008, system-architecture.md §6
 */

import type { PrismaClient, Product as PrismaProduct } from "@prisma/client";
import type {
  ProductRepository,
  ProductRecord,
  ProductListFilter,
} from "@/modules/sales/domain";
import { DatabaseError } from "@/shared/errors";

// =============================================================================
// Mapping Helpers
// =============================================================================

function mapProduct(product: PrismaProduct): ProductRecord {
  return {
    id: product.id,
    code: product.code,
    name: product.name,
    description: product.description ?? null,
    price: Number(product.price),
    categoryId: product.categoryId,
    isActive: product.isActive,
    createdAt: product.createdAt,
    updatedAt: product.updatedAt,
  };
}

// =============================================================================
// Repository Implementation
// =============================================================================

export class PrismaProductRepository implements ProductRepository {
  constructor(private readonly prisma: PrismaClient) {}

  async findById(id: string): Promise<ProductRecord | null> {
    try {
      const product = await this.prisma.product.findUnique({ where: { id } });
      return product ? mapProduct(product) : null;
    } catch (error) {
      throw new DatabaseError("Failed to find product.", {
        cause: error as Error,
      });
    }
  }

  async findByCode(code: string): Promise<ProductRecord | null> {
    try {
      const product = await this.prisma.product.findUnique({
        where: { code },
      });
      return product ? mapProduct(product) : null;
    } catch (error) {
      throw new DatabaseError("Failed to find product by code.", {
        cause: error as Error,
      });
    }
  }

  async create(input: {
    readonly code: string;
    readonly name: string;
    readonly description: string | null;
    readonly price: number;
    readonly categoryId: string;
  }): Promise<ProductRecord> {
    try {
      const product = await this.prisma.product.create({
        data: {
          code: input.code,
          name: input.name,
          description: input.description,
          price: input.price,
          categoryId: input.categoryId,
        },
      });
      return mapProduct(product);
    } catch (error) {
      throw new DatabaseError("Failed to create product.", {
        cause: error as Error,
      });
    }
  }

  async update(
    id: string,
    input: {
      readonly name?: string;
      readonly description?: string;
      readonly price?: number;
      readonly categoryId?: string;
      readonly isActive?: boolean;
    },
  ): Promise<ProductRecord> {
    try {
      const product = await this.prisma.product.update({
        where: { id },
        data: {
          ...(input.name !== undefined && { name: input.name }),
          ...(input.description !== undefined && { description: input.description }),
          ...(input.price !== undefined && { price: input.price }),
          ...(input.categoryId !== undefined && { categoryId: input.categoryId }),
          ...(input.isActive !== undefined && { isActive: input.isActive }),
        },
      });
      return mapProduct(product);
    } catch (error) {
      throw new DatabaseError("Failed to update product.", {
        cause: error as Error,
      });
    }
  }

  async list(filter: ProductListFilter): Promise<readonly ProductRecord[]> {
    try {
      const where: Record<string, unknown> = {};

      if (filter.categoryId) {
        where.categoryId = filter.categoryId;
      }

      if (filter.isActive !== undefined) {
        where.isActive = filter.isActive;
      }

      if (filter.search) {
        where.OR = [
          { name: { contains: filter.search, mode: "insensitive" } },
          { code: { contains: filter.search, mode: "insensitive" } },
        ];
      }

      const products = await this.prisma.product.findMany({
        where,
        orderBy: { name: "asc" },
      });

      return products.map(mapProduct);
    } catch (error) {
      throw new DatabaseError("Failed to list products.", {
        cause: error as Error,
      });
    }
  }
}
