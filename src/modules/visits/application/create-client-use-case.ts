/**
 * CreateClientUseCase — Create a new client.
 *
 * Supervisors (N3+) can create clients.
 * Authorization: client.create with OWN scope.
 *
 * Reference: business-rules.md REG-069, permissions-matrix.md §4.6
 */

import type { AuthorizationService } from "@/modules/authorization/domain";
import type { AuthorizationContext } from "@/modules/authorization/domain";
import type { ClientRepository } from "../domain/client-repository";
import { formatClientAddress } from "../domain/client";
import type { Client, CreateClientData } from "../domain/client";
import { AuthorizationError } from "@/shared/errors";

export interface CreateClientUseCaseInput {
  readonly authContext: AuthorizationContext;
  readonly name: string;
  readonly documentNumber?: string;
  readonly phone?: string;
  readonly email?: string;
  readonly address: string;
  readonly street: string;
  readonly streetNumber: string;
  readonly floor?: string;
  readonly apartment?: string;
  readonly city: string;
  readonly province: string;
  readonly postalCode?: string;
  readonly addressNotes?: string;
}

export class CreateClientUseCase {
  constructor(
    private readonly authorizationService: AuthorizationService,
    private readonly clientRepository: ClientRepository,
  ) {}

  async execute(input: CreateClientUseCaseInput): Promise<Client> {
    // 1. Authorize: client.create
    const decision = await this.authorizationService.authorize(
      input.authContext,
      { permission: "client.create" },
    );

    if (!decision.allowed) {
      throw new AuthorizationError(
        decision.reason ?? "Not authorized to create clients.",
      );
    }

    // 2. Create client
    const data: CreateClientData = {
      name: input.name,
      documentNumber: input.documentNumber,
      phone: input.phone,
      email: input.email,
      address: formatClientAddress(input),
      street: input.street,
      streetNumber: input.streetNumber,
      floor: input.floor,
      apartment: input.apartment,
      city: input.city,
      province: input.province,
      postalCode: input.postalCode,
      addressNotes: input.addressNotes,
      ownerEmployeeId: input.authContext.employeeId,
    };

    return this.clientRepository.create(data);
  }
}
