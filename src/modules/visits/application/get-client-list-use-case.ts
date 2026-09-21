/**
 * GetClientListUseCase — Get clients for a supervisor.
 *
 * N3+ supervisors can see their clients.
 * Authorization: client.view with TEAM/BRANCH scope.
 *
 * Reference: business-rules.md REG-069, permissions-matrix.md §4.6
 */

import type { AuthorizationService } from "@/modules/authorization/domain";
import type { AuthorizationContext } from "@/modules/authorization/domain";
import type { ClientRepository } from "../domain/client-repository";
import type { Client } from "../domain/client";
import { AuthorizationError } from "@/shared/errors";

export interface GetClientListUseCaseInput {
  readonly authContext: AuthorizationContext;
}

export class GetClientListUseCase {
  constructor(
    private readonly authorizationService: AuthorizationService,
    private readonly clientRepository: ClientRepository,
  ) {}

  async execute(input: GetClientListUseCaseInput): Promise<Client[]> {
    // 1. Authorize: client.view
    const decision = await this.authorizationService.authorize(
      input.authContext,
      { permission: "client.view" },
    );

    if (!decision.allowed) {
      throw new AuthorizationError(
        decision.reason ?? "Not authorized to view clients.",
      );
    }

    // 2. Resolve scope — for now, return clients owned by the user
    const clientId = input.authContext.employeeId;
    return this.clientRepository.findByOwnerId(clientId);
  }
}
