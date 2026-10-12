/**
 * GetClientUseCase — Get a single client with authorization.
 *
 * Returns the client detail for the client detail screen. The client must be
 * within the caller's scope (ownership is checked through the resource scope).
 * Mirrors GetSaleUseCase's authorize-with-resource pattern.
 *
 * Authorization: client.view with resource scope check.
 *
 * Reference: business-rules.md REG-069, permissions-matrix.md §4.6
 */

import type {
  AuthorizationContext,
  AuthorizationService,
} from "@/modules/authorization/domain";
import type { ClientRepository } from "../domain/client-repository";
import type { Client } from "../domain/client";
import { AuthorizationError, NotFoundError } from "@/shared/errors";

export interface GetClientUseCaseInput {
  readonly authContext: AuthorizationContext;
  readonly clientId: string;
}

export class GetClientUseCase {
  constructor(
    private readonly authorizationService: AuthorizationService,
    private readonly clientRepository: ClientRepository,
  ) {}

  async execute(input: GetClientUseCaseInput): Promise<Client> {
    // 1. Find existing client
    const client = await this.clientRepository.findById(input.clientId);
    if (!client) {
      throw new NotFoundError("Client", input.clientId);
    }

    // 2. Authorize: client.view with resource scope check
    const decision = await this.authorizationService.authorize(
      input.authContext,
      {
        permission: "client.view",
        resource: {
          type: "client",
          id: client.id,
          ownerId: client.ownerEmployeeId,
        },
      },
    );

    if (!decision.allowed) {
      throw new AuthorizationError(
        decision.reason ?? "Not authorized to view this client.",
      );
    }

    return client;
  }
}
