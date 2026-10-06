/**
 * PrismaVisitRepository — Prisma implementation of VisitRepository.
 *
 * Reference: docs/database/data-model.md §21
 */

import type { PrismaClient, VisitStatus as PrismaVisitStatus } from "@prisma/client";
import type { Visit, VisitStatus, VisitStatusCounts, CreateVisitData, UpdateVisitData } from "../domain/visit";
import type { VisitRepository } from "../domain/visit-repository";

type ClientAddressFields = {
  street: string | null;
  streetNumber: string | null;
  floor: string | null;
  apartment: string | null;
  city: string | null;
  province: string | null;
  postalCode: string | null;
  addressNotes: string | null;
} | null;

function mapPrismaVisitToDomain(visit: { id: string; visitNumber: number; sellerId: string; seller?: { firstName: string; lastName: string } | null; clientId: string; client?: ({ name: string; phone: string | null; email: string | null; documentNumber: string | null } & ClientAddressFields) | null; assignedById: string; scheduledDate: Date; completedDate: Date | null; status: string; notes: string | null; visitStreet: string | null; visitStreetNumber: string | null; visitFloor: string | null; visitApartment: string | null; visitCity: string | null; visitProvince: string | null; visitPostalCode: string | null; visitAddressNotes: string | null; createdAt: Date; updatedAt: Date }): Visit {
  return {
    id: visit.id,
    visitNumber: visit.visitNumber,
    sellerId: visit.sellerId,
    sellerName: visit.seller ? `${visit.seller.firstName} ${visit.seller.lastName}` : null,
    clientId: visit.clientId,
    clientName: visit.client?.name ?? null,
    clientPhone: visit.client?.phone ?? null,
    clientEmail: visit.client?.email ?? null,
    clientDocumentNumber: visit.client?.documentNumber ?? null,
    visitStreet: visit.visitStreet ?? visit.client?.street ?? null,
    visitStreetNumber: visit.visitStreetNumber ?? visit.client?.streetNumber ?? null,
    visitFloor: visit.visitFloor ?? visit.client?.floor ?? null,
    visitApartment: visit.visitApartment ?? visit.client?.apartment ?? null,
    visitCity: visit.visitCity ?? visit.client?.city ?? null,
    visitProvince: visit.visitProvince ?? visit.client?.province ?? null,
    visitPostalCode: visit.visitPostalCode ?? visit.client?.postalCode ?? null,
    visitAddressNotes: visit.visitAddressNotes ?? visit.client?.addressNotes ?? null,
    assignedById: visit.assignedById,
    scheduledDate: visit.scheduledDate,
    completedDate: visit.completedDate,
    status: visit.status.toLowerCase() as VisitStatus,
    notes: visit.notes,
    createdAt: visit.createdAt,
    updatedAt: visit.updatedAt,
  };
}

function mapDomainStatusToPrisma(status: VisitStatus): PrismaVisitStatus {
  const map: Record<VisitStatus, PrismaVisitStatus> = {
    assigned: "ASSIGNED",
    completed: "COMPLETED",
    no_sale: "NO_SALE",
    cancelled: "CANCELLED",
  };
  return map[status];
}

/** Visit statuses that count as a completed visit. */
const COMPLETED_STATUSES: PrismaVisitStatus[] = ["COMPLETED", "NO_SALE"];

export class PrismaVisitRepository implements VisitRepository {
  constructor(private readonly prisma: PrismaClient) {}

  async findById(id: string): Promise<Visit | null> {
    const visit = await this.prisma.visit.findUnique({ where: { id }, include: { client: { select: { name: true, phone: true, email: true, documentNumber: true, street: true, streetNumber: true, floor: true, apartment: true, city: true, province: true, postalCode: true, addressNotes: true } } } });
    return visit ? mapPrismaVisitToDomain(visit) : null;
  }

  async findBySellerId(sellerId: string): Promise<Visit[]> {
    const visits = await this.prisma.visit.findMany({
      where: { sellerId },
      include: { client: { select: { name: true, phone: true, email: true, documentNumber: true, street: true, streetNumber: true, floor: true, apartment: true, city: true, province: true, postalCode: true, addressNotes: true } }, seller: { select: { firstName: true, lastName: true } } },
      orderBy: [{ scheduledDate: "asc" }, { visitNumber: "asc" }],
    });
    return visits.map(mapPrismaVisitToDomain);
  }

  async findBySellerIds(sellerIds: readonly string[]): Promise<Visit[]> {
    if (sellerIds.length === 0) return [];
    const visits = await this.prisma.visit.findMany({
      where: { sellerId: { in: [...sellerIds] } },
      include: { client: { select: { name: true, phone: true, email: true, documentNumber: true, street: true, streetNumber: true, floor: true, apartment: true, city: true, province: true, postalCode: true, addressNotes: true } }, seller: { select: { firstName: true, lastName: true } } },
      orderBy: [{ scheduledDate: "asc" }, { visitNumber: "asc" }],
    });
    return visits.map(mapPrismaVisitToDomain);
  }

  async findByClientId(clientId: string): Promise<Visit[]> {
    const visits = await this.prisma.visit.findMany({
      where: { clientId },
      include: { client: { select: { name: true, phone: true, email: true, documentNumber: true, street: true, streetNumber: true, floor: true, apartment: true, city: true, province: true, postalCode: true, addressNotes: true } } },
      orderBy: { scheduledDate: "desc" },
    });
    return visits.map(mapPrismaVisitToDomain);
  }

  async findByStatus(status: VisitStatus): Promise<Visit[]> {
    const visits = await this.prisma.visit.findMany({
      where: { status: mapDomainStatusToPrisma(status) },
      include: { client: { select: { name: true, phone: true, email: true, documentNumber: true, street: true, streetNumber: true, floor: true, apartment: true, city: true, province: true, postalCode: true, addressNotes: true } } },
      orderBy: { scheduledDate: "desc" },
    });
    return visits.map(mapPrismaVisitToDomain);
  }

  async create(data: CreateVisitData): Promise<Visit> {
    const visit = await this.prisma.visit.create({
      data: {
        sellerId: data.sellerId,
        clientId: data.clientId,
        assignedById: data.assignedById,
        scheduledDate: data.scheduledDate,
        notes: data.notes,
        visitStreet: data.visitStreet,
        visitStreetNumber: data.visitStreetNumber,
        visitFloor: data.visitFloor,
        visitApartment: data.visitApartment,
        visitCity: data.visitCity,
        visitProvince: data.visitProvince,
        visitPostalCode: data.visitPostalCode,
        visitAddressNotes: data.visitAddressNotes,
      },
      include: { client: { select: { name: true, phone: true, email: true, documentNumber: true, street: true, streetNumber: true, floor: true, apartment: true, city: true, province: true, postalCode: true, addressNotes: true } } },
    });
    return mapPrismaVisitToDomain(visit);
  }

  async update(id: string, data: UpdateVisitData): Promise<Visit> {
    const updateData: { completedDate?: Date; status?: PrismaVisitStatus; notes?: string } = {};
    if (data.completedDate !== undefined) updateData.completedDate = data.completedDate;
    if (data.status !== undefined) updateData.status = mapDomainStatusToPrisma(data.status);
    if (data.notes !== undefined) updateData.notes = data.notes;

    const visit = await this.prisma.visit.update({ where: { id }, data: updateData, include: { client: { select: { name: true, phone: true, email: true, documentNumber: true, street: true, streetNumber: true, floor: true, apartment: true, city: true, province: true, postalCode: true, addressNotes: true } } } });
    return mapPrismaVisitToDomain(visit);
  }

  async countBySellerId(sellerId: string): Promise<number> {
    return this.prisma.visit.count({ where: { sellerId } });
  }

  async countPendingBySellerId(sellerId: string): Promise<number> {
    return this.prisma.visit.count({
      where: { sellerId, status: "ASSIGNED" },
    });
  }

  async countCompletedBySellerIdSince(
    sellerId: string,
    since: Date,
  ): Promise<number> {
    return this.prisma.visit.count({
      where: {
        sellerId,
        status: { in: COMPLETED_STATUSES },
        scheduledDate: { gte: since },
      },
    });
  }

  async countCompletedBySellerIdSinceBatch(
    entries: ReadonlyArray<{ sellerId: string; since: Date }>,
  ): Promise<Map<string, number>> {
    const counts = new Map<string, number>();
    for (const entry of entries) {
      counts.set(
        entry.sellerId,
        await this.countCompletedBySellerIdSince(entry.sellerId, entry.since),
      );
    }
    return counts;
  }

  async countStatusBySellerIds(
    sellerIds: readonly string[],
  ): Promise<Map<string, VisitStatusCounts>> {
    const counts = new Map<string, VisitStatusCounts>();
    if (sellerIds.length === 0) return counts;

    const rows = await this.prisma.visit.groupBy({
      by: ["sellerId", "status"],
      where: { sellerId: { in: [...sellerIds] } },
      _count: { _all: true },
    });

    for (const row of rows) {
      const current = counts.get(row.sellerId) ?? {
        total: 0,
        completed: 0,
        pending: 0,
      };
      const value = row._count._all ?? 0;
      counts.set(row.sellerId, {
        total: current.total + value,
        completed:
          current.completed +
          (COMPLETED_STATUSES.includes(row.status) ? value : 0),
        pending: current.pending + (row.status === "ASSIGNED" ? value : 0),
      });
    }

    return counts;
  }
}
