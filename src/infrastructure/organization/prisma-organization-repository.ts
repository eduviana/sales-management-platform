/**
 * Prisma-based implementation of the OrganizationRepository port.
 *
 * Encapsulates all Prisma and SQL details within the Infrastructure layer.
 * The Application layer never sees Prisma types or queries.
 *
 * Reference: ADR-008, data-architecture.md §5..§8
 */

import type { PrismaClient } from "@prisma/client";
import type {
  OrganizationRepository,
  EmployeeRecord,
  LevelRecord,
  LevelHistoryRecord,
  SupervisorHistoryRecord,
  EmployeeCommissionContext,
  CreateEmployeeData,
  CreateLevelHistoryData,
  CreateSupervisorHistoryData,
} from "@/modules/organization/domain";

export class PrismaOrganizationRepository implements OrganizationRepository {
  constructor(private readonly prisma: PrismaClient) {}

  // =========================================================================
  // Employee
  // =========================================================================

  async findEmployeeById(id: string): Promise<EmployeeRecord | null> {
    const employee = await this.prisma.employee.findUnique({ where: { id } });
    return employee ? this.mapEmployee(employee) : null;
  }

  async getEmployeeCommissionContext(
    employeeId: string,
    at: Date,
  ): Promise<EmployeeCommissionContext | null> {
    const employee = await this.prisma.employee.findUnique({
      where: { id: employeeId },
      include: {
        employeeLevelHistory: {
          where: {
            startedAt: { lte: at },
            OR: [{ endedAt: null }, { endedAt: { gt: at } }],
          },
          orderBy: { startedAt: "desc" },
          take: 1,
        },
      },
    });

    if (!employee) return null;

    return {
      employeeId: employee.id,
      levelId: employee.employeeLevelHistory[0]?.levelId ?? null,
      joinedAt: employee.joinedAt,
    };
  }

  async createEmployee(data: CreateEmployeeData): Promise<EmployeeRecord> {
    const employee = await this.prisma.employee.create({
      data: {
        firstName: data.firstName,
        lastName: data.lastName,
        joinedAt: data.joinedAt,
        currentLevelId: data.currentLevelId,
        supervisorId: data.supervisorId,
        dni: data.dni,
        email: data.email,
        phone: data.phone,
        dateOfBirth: data.dateOfBirth,
        street: data.street,
        streetNumber: data.streetNumber,
        floor: data.floor,
        apartment: data.apartment,
        city: data.city,
        province: data.province,
        postalCode: data.postalCode,
      },
    });
    return this.mapEmployee(employee);
  }

  async updateEmployeeLevel(
    employeeId: string,
    levelId: number,
  ): Promise<void> {
    await this.prisma.employee.update({
      where: { id: employeeId },
      data: { currentLevelId: levelId },
    });
  }

  async updateEmployeeSupervisor(
    employeeId: string,
    supervisorId: string | null,
  ): Promise<void> {
    await this.prisma.employee.update({
      where: { id: employeeId },
      data: { supervisorId },
    });
  }

  async updateEmployeeStatus(
    employeeId: string,
    status: "ACTIVE" | "INACTIVE",
  ): Promise<void> {
    await this.prisma.employee.update({
      where: { id: employeeId },
      data: { status },
    });
  }

  // =========================================================================
  // Level
  // =========================================================================

  async findLevelById(id: number): Promise<LevelRecord | null> {
    const level = await this.prisma.level.findUnique({ where: { id } });
    return level ? this.mapLevel(level) : null;
  }

  // =========================================================================
  // Level History
  // =========================================================================

  async findOpenLevelHistory(
    employeeId: string,
  ): Promise<LevelHistoryRecord | null> {
    const record = await this.prisma.employeeLevelHistory.findFirst({
      where: { employeeId, endedAt: null },
      orderBy: { startedAt: "desc" },
    });
    return record ? this.mapLevelHistory(record) : null;
  }

  async closeLevelHistory(
    historyId: string,
    endedAt: Date,
  ): Promise<void> {
    await this.prisma.employeeLevelHistory.update({
      where: { id: historyId },
      data: { endedAt },
    });
  }

  async createLevelHistory(
    data: CreateLevelHistoryData,
  ): Promise<LevelHistoryRecord> {
    const record = await this.prisma.employeeLevelHistory.create({
      data: {
        employeeId: data.employeeId,
        levelId: data.levelId,
        startedAt: data.startedAt,
        reason: data.reason ?? null,
      },
    });
    return this.mapLevelHistory(record);
  }

  // =========================================================================
  // Supervisor History
  // =========================================================================

  async findOpenSupervisorHistory(
    employeeId: string,
  ): Promise<SupervisorHistoryRecord | null> {
    const record =
      await this.prisma.employeeSupervisorHistory.findFirst({
        where: { employeeId, endedAt: null },
        orderBy: { startedAt: "desc" },
      });
    return record ? this.mapSupervisorHistory(record) : null;
  }

  async closeSupervisorHistory(
    historyId: string,
    endedAt: Date,
  ): Promise<void> {
    await this.prisma.employeeSupervisorHistory.update({
      where: { id: historyId },
      data: { endedAt },
    });
  }

  async createSupervisorHistory(
    data: CreateSupervisorHistoryData,
  ): Promise<SupervisorHistoryRecord> {
    const record = await this.prisma.employeeSupervisorHistory.create({
      data: {
        employeeId: data.employeeId,
        supervisorId: data.supervisorId ?? null,
        startedAt: data.startedAt,
        reason: data.reason ?? null,
      },
    });
    return this.mapSupervisorHistory(record);
  }

  // =========================================================================
  // Hierarchy queries
  // =========================================================================

  async getDirectSubordinates(
    employeeId: string,
  ): Promise<EmployeeRecord[]> {
    const subordinates = await this.prisma.employee.findMany({
      where: { supervisorId: employeeId },
      orderBy: { firstName: "asc" },
    });
    return subordinates.map(this.mapEmployee);
  }

  async getDescendantIds(employeeId: string): Promise<string[]> {
    // Recursive CTE to find all descendants
    const results: Array<{ id: string }> = await this.prisma.$queryRaw`
      WITH RECURSIVE descendants AS (
        SELECT id FROM employee WHERE "supervisorId" = ${employeeId}::uuid
        UNION ALL
        SELECT e.id FROM employee e
        INNER JOIN descendants d ON e."supervisorId" = d.id
      )
      SELECT id::text FROM descendants
    `;
    return results.map((r) => r.id);
  }

  async getAncestorIds(employeeId: string): Promise<string[]> {
    // Recursive CTE to find all ancestors (from parent to root)
    const results: Array<{ id: string }> = await this.prisma.$queryRaw`
      WITH RECURSIVE ancestors AS (
        SELECT "supervisorId" AS id FROM employee WHERE id = ${employeeId}::uuid AND "supervisorId" IS NOT NULL
        UNION ALL
        SELECT e."supervisorId" AS id FROM employee e
        INNER JOIN ancestors a ON e.id = a.id
        WHERE e."supervisorId" IS NOT NULL
      )
      SELECT DISTINCT id::text FROM ancestors WHERE id IS NOT NULL
    `;
    return results.map((r) => r.id);
  }

  async countDirectSubordinates(employeeId: string): Promise<number> {
    const count = await this.prisma.employee.count({
      where: { supervisorId: employeeId },
    });
    return count;
  }

  // =========================================================================
  // Global queries (for authorization scope resolution)
  // =========================================================================

  async getActiveEmployeeIds(): Promise<string[]> {
    const employees = await this.prisma.employee.findMany({
      where: { status: "ACTIVE" },
      select: { id: true },
    });
    return employees.map((e) => e.id);
  }

  async getAllEmployees(): Promise<EmployeeRecord[]> {
    const employees = await this.prisma.employee.findMany({
      orderBy: { employeeCode: "asc" },
    });
    return employees.map((e) => this.mapEmployee(e));
  }

  // =========================================================================
  // Transaction support
  // =========================================================================

  async executeInTransaction<T>(
    fn: (repo: OrganizationRepository) => Promise<T>,
  ): Promise<T> {
    return this.prisma.$transaction(async () => {
      return fn(this);
    });
  }

  // =========================================================================
  // Mapping helpers (Prisma models → domain records)
  // =========================================================================

  private mapEmployee(raw: {
    id: string;
    employeeCode: number;
    firstName: string;
    lastName: string;
    dni: string | null;
    email: string | null;
    phone: string | null;
    dateOfBirth: Date | null;
    joinedAt: Date;
    currentLevelId: number | null;
    supervisorId: string | null;
    status: string;
    deactivatedAt: Date | null;
    deactivationReason: string | null;
    street: string | null;
    streetNumber: string | null;
    floor: string | null;
    apartment: string | null;
    city: string | null;
    province: string | null;
    postalCode: string | null;
    createdAt: Date;
    updatedAt: Date;
  }): EmployeeRecord {
    return {
      id: raw.id,
      employeeCode: raw.employeeCode,
      firstName: raw.firstName,
      lastName: raw.lastName,
      dni: raw.dni,
      email: raw.email,
      phone: raw.phone,
      dateOfBirth: raw.dateOfBirth,
      joinedAt: raw.joinedAt,
      currentLevelId: raw.currentLevelId,
      supervisorId: raw.supervisorId,
      status: raw.status as "ACTIVE" | "INACTIVE",
      deactivatedAt: raw.deactivatedAt,
      deactivationReason: raw.deactivationReason,
      street: raw.street,
      streetNumber: raw.streetNumber,
      floor: raw.floor,
      apartment: raw.apartment,
      city: raw.city,
      province: raw.province,
      postalCode: raw.postalCode,
      createdAt: raw.createdAt,
      updatedAt: raw.updatedAt,
    };
  }

  private mapLevel(raw: {
    id: number;
    code: string;
    rank: number;
    name: string;
  }): LevelRecord {
    return {
      id: raw.id,
      code: raw.code,
      rank: raw.rank,
      name: raw.name,
    };
  }

  private mapLevelHistory(raw: {
    id: string;
    employeeId: string;
    levelId: number;
    startedAt: Date;
    endedAt: Date | null;
    reason: string | null;
    createdAt: Date;
  }): LevelHistoryRecord {
    return {
      id: raw.id,
      employeeId: raw.employeeId,
      levelId: raw.levelId,
      startedAt: raw.startedAt,
      endedAt: raw.endedAt,
      reason: raw.reason,
      createdAt: raw.createdAt,
    };
  }

  private mapSupervisorHistory(raw: {
    id: string;
    employeeId: string;
    supervisorId: string | null;
    startedAt: Date;
    endedAt: Date | null;
    reason: string | null;
    createdAt: Date;
  }): SupervisorHistoryRecord {
    return {
      id: raw.id,
      employeeId: raw.employeeId,
      supervisorId: raw.supervisorId,
      startedAt: raw.startedAt,
      endedAt: raw.endedAt,
      reason: raw.reason,
      createdAt: raw.createdAt,
    };
  }
}
