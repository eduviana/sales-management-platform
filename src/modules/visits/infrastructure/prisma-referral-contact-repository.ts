/**
 * PrismaReferralContactRepository — Prisma implementation of ReferralContactRepository.
 *
 * Reference: docs/database/data-model.md §22
 */

import type { PrismaClient } from "@prisma/client";
import type { ReferralContact, CreateReferralContactData } from "../domain/referral-contact";
import type { ReferralContactRepository } from "../domain/referral-contact-repository";

function mapPrismaReferralContactToDomain(contact: {
  id: string;
  saleId: string;
  clientName: string;
  phone: string;
  email: string | null;
  street: string | null;
  streetNumber: string | null;
  floor: string | null;
  apartment: string | null;
  city: string | null;
  province: string | null;
  postalCode: string | null;
  addressNotes: string | null;
  createdAt: Date;
}): ReferralContact {
  return {
    id: contact.id,
    saleId: contact.saleId,
    clientName: contact.clientName,
    phone: contact.phone,
    email: contact.email,
    street: contact.street,
    streetNumber: contact.streetNumber,
    floor: contact.floor,
    apartment: contact.apartment,
    city: contact.city,
    province: contact.province,
    postalCode: contact.postalCode,
    addressNotes: contact.addressNotes,
    createdAt: contact.createdAt,
  };
}

export class PrismaReferralContactRepository implements ReferralContactRepository {
  constructor(private readonly prisma: PrismaClient) {}

  async findBySaleId(saleId: string): Promise<ReferralContact[]> {
    const contacts = await this.prisma.referralContact.findMany({
      where: { saleId },
      orderBy: { createdAt: "asc" },
    });
    return contacts.map(mapPrismaReferralContactToDomain);
  }

  async create(data: CreateReferralContactData): Promise<ReferralContact> {
    const contact = await this.prisma.referralContact.create({ data });
    return mapPrismaReferralContactToDomain(contact);
  }

  async countBySaleId(saleId: string): Promise<number> {
    return this.prisma.referralContact.count({ where: { saleId } });
  }
}
