/**
 * Prisma implementation of TrainingModuleRepository.
 *
 * Reference: data-model.md §17
 */

import type { PrismaClient } from "@prisma/client";
import type {
  TrainingModuleRepository,
  TrainingModule,
  CreateTrainingModuleData,
  UpdateTrainingModuleData,
} from "@/modules/training/domain";

export class PrismaTrainingModuleRepository implements TrainingModuleRepository {
  constructor(private readonly prisma: PrismaClient) {}

  async findById(id: string): Promise<TrainingModule | null> {
    const raw = await this.prisma.trainingModule.findUnique({ where: { id } });
    return raw ? this.mapRecord(raw) : null;
  }

  async findByCourseId(courseId: string): Promise<readonly TrainingModule[]> {
    const raw = await this.prisma.trainingModule.findMany({
      where: { courseId },
      orderBy: { sortOrder: "asc" },
    });
    return raw.map(this.mapRecord);
  }

  async create(data: CreateTrainingModuleData): Promise<TrainingModule> {
    const raw = await this.prisma.trainingModule.create({
      data: {
        courseId: data.courseId,
        name: data.name,
        description: data.description ?? null,
        sortOrder: data.sortOrder ?? 0,
      },
    });
    return this.mapRecord(raw);
  }

  async update(id: string, data: UpdateTrainingModuleData): Promise<TrainingModule> {
    const raw = await this.prisma.trainingModule.update({
      where: { id },
      data: {
        ...(data.name !== undefined && { name: data.name }),
        ...(data.description !== undefined && { description: data.description }),
        ...(data.sortOrder !== undefined && { sortOrder: data.sortOrder }),
      },
    });
    return this.mapRecord(raw);
  }

  async delete(id: string): Promise<void> {
    await this.prisma.trainingModule.delete({ where: { id } });
  }

  private mapRecord(raw: {
    id: string;
    courseId: string;
    name: string;
    description: string | null;
    sortOrder: number;
    createdAt: Date;
    updatedAt: Date;
  }): TrainingModule {
    return {
      id: raw.id,
      courseId: raw.courseId,
      name: raw.name,
      description: raw.description,
      sortOrder: raw.sortOrder,
      createdAt: raw.createdAt,
      updatedAt: raw.updatedAt,
    };
  }
}
