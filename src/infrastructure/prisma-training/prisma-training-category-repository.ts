/**
 * Prisma implementation of TrainingCategoryRepository.
 *
 * Reference: data-model.md §17
 */

import type { PrismaClient } from "@prisma/client";
import type {
  TrainingCategoryRepository,
  TrainingCategory,
  CreateTrainingCategoryData,
  UpdateTrainingCategoryData,
} from "@/modules/training/domain";

export class PrismaTrainingCategoryRepository implements TrainingCategoryRepository {
  constructor(private readonly prisma: PrismaClient) {}

  async findById(id: string): Promise<TrainingCategory | null> {
    const raw = await this.prisma.trainingCategory.findUnique({ where: { id } });
    return raw ? this.mapRecord(raw) : null;
  }

  async findAll(): Promise<readonly TrainingCategory[]> {
    const raw = await this.prisma.trainingCategory.findMany({
      orderBy: { name: "asc" },
    });
    return raw.map(this.mapRecord);
  }

  async create(data: CreateTrainingCategoryData): Promise<TrainingCategory> {
    const raw = await this.prisma.trainingCategory.create({
      data: {
        name: data.name,
        description: data.description ?? null,
      },
    });
    return this.mapRecord(raw);
  }

  async update(id: string, data: UpdateTrainingCategoryData): Promise<TrainingCategory> {
    const raw = await this.prisma.trainingCategory.update({
      where: { id },
      data: {
        ...(data.name !== undefined && { name: data.name }),
        ...(data.description !== undefined && { description: data.description }),
      },
    });
    return this.mapRecord(raw);
  }

  async delete(id: string): Promise<void> {
    await this.prisma.trainingCategory.delete({ where: { id } });
  }

  private mapRecord(raw: {
    id: string;
    name: string;
    description: string | null;
    createdAt: Date;
    updatedAt: Date;
  }): TrainingCategory {
    return {
      id: raw.id,
      name: raw.name,
      description: raw.description,
      createdAt: raw.createdAt,
      updatedAt: raw.updatedAt,
    };
  }
}
