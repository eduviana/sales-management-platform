/**
 * Prisma implementation of TrainingCourseRepository.
 *
 * Reference: data-model.md §17
 */

import type { PrismaClient, ContentStatus as PrismaContentStatus } from "@prisma/client";
import type {
  TrainingCourseRepository,
  TrainingCourse,
  CreateTrainingCourseData,
  UpdateTrainingCourseData,
  ContentStatus,
} from "@/modules/training/domain";

export class PrismaTrainingCourseRepository implements TrainingCourseRepository {
  constructor(private readonly prisma: PrismaClient) {}

  async findById(id: string): Promise<TrainingCourse | null> {
    const raw = await this.prisma.trainingCourse.findUnique({ where: { id } });
    return raw ? this.mapRecord(raw) : null;
  }

  async findByCategoryId(categoryId: string): Promise<readonly TrainingCourse[]> {
    const raw = await this.prisma.trainingCourse.findMany({
      where: { categoryId },
      orderBy: { createdAt: "asc" },
    });
    return raw.map(this.mapRecord);
  }

  async findByCategoryIdAndStatus(categoryId: string, status: ContentStatus): Promise<readonly TrainingCourse[]> {
    const raw = await this.prisma.trainingCourse.findMany({
      where: { categoryId, status: status as PrismaContentStatus },
      orderBy: { createdAt: "asc" },
    });
    return raw.map(this.mapRecord);
  }

  async create(data: CreateTrainingCourseData): Promise<TrainingCourse> {
    const raw = await this.prisma.trainingCourse.create({
      data: {
        categoryId: data.categoryId,
        name: data.name,
        description: data.description ?? null,
      },
    });
    return this.mapRecord(raw);
  }

  async update(id: string, data: UpdateTrainingCourseData): Promise<TrainingCourse> {
    const raw = await this.prisma.trainingCourse.update({
      where: { id },
      data: {
        ...(data.name !== undefined && { name: data.name }),
        ...(data.description !== undefined && { description: data.description }),
        ...(data.status !== undefined && { status: data.status as PrismaContentStatus }),
      },
    });
    return this.mapRecord(raw);
  }

  async delete(id: string): Promise<void> {
    await this.prisma.trainingCourse.delete({ where: { id } });
  }

  private mapRecord(raw: {
    id: string;
    categoryId: string;
    name: string;
    description: string | null;
    status: PrismaContentStatus;
    createdAt: Date;
    updatedAt: Date;
  }): TrainingCourse {
    return {
      id: raw.id,
      categoryId: raw.categoryId,
      name: raw.name,
      description: raw.description,
      status: raw.status as ContentStatus,
      createdAt: raw.createdAt,
      updatedAt: raw.updatedAt,
    };
  }
}
