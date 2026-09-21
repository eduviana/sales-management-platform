/**
 * CreateVisitUseCase — Assign a visit to a seller.
 *
 * Supervisors (N3+) can assign visits to sellers in their team.
 * Authorization: visit.create with TEAM scope.
 *
 * Reference: business-rules.md REG-069, permissions-matrix.md §4.7
 */

import type { AuthorizationService } from "@/modules/authorization/domain";
import type { AuthorizationContext } from "@/modules/authorization/domain";
import type { VisitRepository } from "../domain/visit-repository";
import type { OrganizationRepository } from "@/modules/organization/domain";
import type { ClientRepository } from "../domain/client-repository";
import type { Visit, CreateVisitData } from "../domain/visit";
import { AuthorizationError } from "@/shared/errors";

export interface CreateVisitUseCaseInput {
  readonly authContext: AuthorizationContext;
  readonly sellerId: string;
  readonly clientId: string;
  readonly scheduledDate: Date;
  readonly notes?: string;
}

export class CreateVisitUseCase {
  constructor(
    private readonly authorizationService: AuthorizationService,
    private readonly visitRepository: VisitRepository,
    private readonly organizationRepository?: OrganizationRepository,
    private readonly clientRepository?: ClientRepository,
  ) {}

  async execute(input: CreateVisitUseCaseInput): Promise<Visit> {
    // 1. Authorize: visit.create
    const decision = await this.authorizationService.authorize(
      input.authContext,
      { permission: "visit.create" },
    );

    if (!decision.allowed) {
      throw new AuthorizationError(
        decision.reason ?? "Not authorized to create visits.",
      );
    }

    if (this.organizationRepository) {
      const team = await this.organizationRepository.getDirectSubordinates(input.authContext.employeeId);
      if (!team.some((employee) => employee.id === input.sellerId)) {
        throw new AuthorizationError("Solo puedes asignar visitas a vendedores de tu equipo.");
      }
    }

    if (!this.clientRepository) {
      throw new Error("Client repository is required to create a visit.");
    }
    const client = await this.clientRepository.findById(input.clientId);
    if (!client || !client.street || !client.streetNumber || !client.city || !client.province) {
      throw new Error("El cliente debe tener una dirección completa para asignar una visita.");
    }

    // 2. Create visit
    const data: CreateVisitData = {
      sellerId: input.sellerId,
      clientId: input.clientId,
      assignedById: input.authContext.employeeId,
      scheduledDate: input.scheduledDate,
      notes: input.notes,
      visitStreet: client.street,
      visitStreetNumber: client.streetNumber,
      visitFloor: client.floor ?? undefined,
      visitApartment: client.apartment ?? undefined,
      visitCity: client.city,
      visitProvince: client.province,
      visitPostalCode: client.postalCode ?? undefined,
      visitAddressNotes: client.addressNotes ?? undefined,
    };

    return this.visitRepository.create(data);
  }
}
