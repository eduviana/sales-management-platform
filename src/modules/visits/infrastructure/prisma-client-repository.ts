/**
 * PrismaClientRepository — Prisma implementation of ClientRepository.
 *
 * Reference: docs/database/data-model.md §20
 */

import type { PrismaClient } from "@prisma/client";
import type { Client, CreateClientData, UpdateClientData } from "../domain/client";
import type { ClientRepository } from "../domain/client-repository";

function mapPrismaClientToDomain(prismaClient: { id: string; clientNumber: number; name: string; documentNumber: string | null; phone: string | null; email: string | null; address: string; street: string | null; streetNumber: string | null; floor: string | null; apartment: string | null; city: string | null; province: string | null; postalCode: string | null; addressNotes: string | null; referredBySaleId: string | null; ownerEmployeeId: string; createdAt: Date; updatedAt: Date }): Client {
  return {
    id: prismaClient.id,
    clientNumber: prismaClient.clientNumber,
    name: prismaClient.name,
    documentNumber: prismaClient.documentNumber,
    street: prismaClient.street,
    streetNumber: prismaClient.streetNumber,
    floor: prismaClient.floor,
    apartment: prismaClient.apartment,
    city: prismaClient.city,
    province: prismaClient.province,
    postalCode: prismaClient.postalCode,
    addressNotes: prismaClient.addressNotes,
    phone: prismaClient.phone,
    email: prismaClient.email,
    address: prismaClient.address,
    referredBySaleId: prismaClient.referredBySaleId,
    ownerEmployeeId: prismaClient.ownerEmployeeId,
    createdAt: prismaClient.createdAt,
    updatedAt: prismaClient.updatedAt,
  };
}

export class PrismaClientRepository implements ClientRepository {
  constructor(private readonly prisma: PrismaClient) {}

  async findById(id: string): Promise<Client | null> {
    const client = await this.prisma.client.findUnique({ where: { id } });
    return client ? mapPrismaClientToDomain(client) : null;
  }

  async findByOwnerId(ownerEmployeeId: string): Promise<Client[]> {
    const clients = await this.prisma.client.findMany({
      where: { ownerEmployeeId },
      orderBy: { createdAt: "desc" },
    });
    return clients.map(mapPrismaClientToDomain);
  }

  async create(data: CreateClientData): Promise<Client> {
    const client = await this.prisma.client.create({ data });
    return mapPrismaClientToDomain(client);
  }

  async update(id: string, data: UpdateClientData): Promise<Client> {
    const client = await this.prisma.client.update({ where: { id }, data });
    return mapPrismaClientToDomain(client);
  }

  async countByOwnerId(ownerEmployeeId: string): Promise<number> {
    return this.prisma.client.count({ where: { ownerEmployeeId } });
  }
}
