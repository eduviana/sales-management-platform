/**
 * Prisma implementation of TrainingMaterialRepository.
 *
 * Key method: findAccessibleByLevel implements cumulative level access.
 *
 * Reference: data-model.md §17, ADR-009
 */

import type { PrismaClient, ContentStatus as PrismaContentStatus, ContentType as PrismaContentType } from "@prisma/client";
import type {
  TrainingMaterialRepository,
  TrainingMaterial,
  CreateTrainingMaterialData,
  UpdateTrainingMaterialData,
  ContentStatus,
  ContentType,
} from "@/modules/training/domain";

export class PrismaTrainingMaterialRepository implements TrainingMaterialRepository {
  constructor(private readonly prisma: PrismaClient) {}

  async findById(id: string): Promise<TrainingMaterial | null> {
    const raw = await this.prisma.trainingMaterial.findUnique({ where: { id } });
    return raw ? this.mapRecord(raw) : null;
  }

  async findByModuleId(moduleId: string): Promise<readonly TrainingMaterial[]> {
    const raw = await this.prisma.trainingMaterial.findMany({
      where: { moduleId },
      orderBy: { createdAt: "asc" },
    });
    return raw.map(this.mapRecord);
  }

  async findAccessibleByLevel(
    userLevelId: number | null,
    filters?: { moduleId?: string; status?: ContentStatus },
  ): Promise<readonly TrainingMaterial[]> {
    const where: Record<string, unknown> = {};

    // Cumulative level access: levelId IS NULL OR levelId <= userLevelId
    if (userLevelId !== null) {
      where.OR = [
        { levelId: null },
        { levelId: { lte: userLevelId } },
      ];
    }
    // If userLevelId is null (ADMIN), no level filtering

    if (filters?.moduleId) {
      where.moduleId = filters.moduleId;
    }
    if (filters?.status) {
      where.status = filters.status;
    }

    const raw = await this.prisma.trainingMaterial.findMany({
      where,
      orderBy: { createdAt: "asc" },
    });
    return raw.map(this.mapRecord);
  }

  async findAll(filters?: { moduleId?: string; status?: ContentStatus }): Promise<readonly TrainingMaterial[]> {
    const where: Record<string, unknown> = {};

    if (filters?.moduleId) {
      where.moduleId = filters.moduleId;
    }
    if (filters?.status) {
      where.status = filters.status;
    }

    const raw = await this.prisma.trainingMaterial.findMany({
      where,
      orderBy: { createdAt: "asc" },
    });
    return raw.map(this.mapRecord);
  }

  async create(data: CreateTrainingMaterialData): Promise<TrainingMaterial> {
    const raw = await this.prisma.trainingMaterial.create({
      data: {
        moduleId: data.moduleId,
        name: data.name,
        description: data.description ?? null,
        type: data.type as PrismaContentType,
        url: data.url ?? null,
        levelId: data.levelId ?? null,
      },
    });
    return this.mapRecord(raw);
  }

  async update(id: string, data: UpdateTrainingMaterialData): Promise<TrainingMaterial> {
    const raw = await this.prisma.trainingMaterial.update({
      where: { id },
      data: {
        ...(data.name !== undefined && { name: data.name }),
        ...(data.description !== undefined && { description: data.description }),
        ...(data.type !== undefined && { type: data.type as PrismaContentType }),
        ...(data.url !== undefined && { url: data.url }),
        ...(data.levelId !== undefined && { levelId: data.levelId }),
        ...(data.status !== undefined && { status: data.status as PrismaContentStatus }),
      },
    });
    return this.mapRecord(raw);
  }

  async delete(id: string): Promise<void> {
    await this.prisma.trainingMaterial.delete({ where: { id } });
  }

  private mapRecord(raw: {
    id: string;
    moduleId: string;
    name: string;
    description: string | null;
    type: PrismaContentType;
    url: string | null;
    levelId: number | null;
    status: PrismaContentStatus;
    createdAt: Date;
    updatedAt: Date;
  }): TrainingMaterial {
    return {
      id: raw.id,
      moduleId: raw.moduleId,
      name: raw.name,
      description: raw.description,
      type: raw.type as ContentType,
      url: raw.url,
      levelId: raw.levelId,
      status: raw.status as ContentStatus,
      createdAt: raw.createdAt,
      updatedAt: raw.updatedAt,
    };
  }
}
