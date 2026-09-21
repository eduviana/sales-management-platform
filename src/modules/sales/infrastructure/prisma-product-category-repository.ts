/**
 * Prisma implementation of the Product Category repository port.
 *
 * Encapsulates all Prisma details behind the ProductCategoryRepository port.
 * Application never imports Prisma types directly.
 *
 * Reference: ADR-008, system-architecture.md §6
 */

import type { PrismaClient, ProductCategory as PrismaCategory } from "@prisma/client";
import type {
  ProductCategoryRepository,
  ProductCategoryRecord,
} from "@/modules/sales/domain";
import { DatabaseError } from "@/shared/errors";

// =============================================================================
// Mapping Helpers
// =============================================================================

function mapCategory(category: PrismaCategory): ProductCategoryRecord {
  return {
    id: category.id,
    name: category.name,
    description: category.description ?? null,
    createdAt: category.createdAt,
    updatedAt: category.updatedAt,
  };
}

// =============================================================================
// Repository Implementation
// =============================================================================

export class PrismaProductCategoryRepository implements ProductCategoryRepository {
  constructor(private readonly prisma: PrismaClient) {}

  async findById(id: string): Promise<ProductCategoryRecord | null> {
    try {
      const category = await this.prisma.productCategory.findUnique({
        where: { id },
      });
      return category ? mapCategory(category) : null;
    } catch (error) {
      throw new DatabaseError("Failed to find category.", {
        cause: error as Error,
      });
    }
  }

  async create(input: {
    readonly name: string;
    readonly description: string | null;
  }): Promise<ProductCategoryRecord> {
    try {
      const category = await this.prisma.productCategory.create({
        data: {
          name: input.name,
          description: input.description,
        },
      });
      return mapCategory(category);
    } catch (error) {
      throw new DatabaseError("Failed to create category.", {
        cause: error as Error,
      });
    }
  }

  async update(
    id: string,
    input: {
      readonly name?: string;
      readonly description?: string;
    },
  ): Promise<ProductCategoryRecord> {
    try {
      const category = await this.prisma.productCategory.update({
        where: { id },
        data: {
          ...(input.name !== undefined && { name: input.name }),
          ...(input.description !== undefined && { description: input.description }),
        },
      });
      return mapCategory(category);
    } catch (error) {
      throw new DatabaseError("Failed to update category.", {
        cause: error as Error,
      });
    }
  }

  async list(): Promise<readonly ProductCategoryRecord[]> {
    try {
      const categories = await this.prisma.productCategory.findMany({
        orderBy: { name: "asc" },
      });
      return categories.map(mapCategory);
    } catch (error) {
      throw new DatabaseError("Failed to list categories.", {
        cause: error as Error,
      });
    }
  }
}
