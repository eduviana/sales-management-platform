/**
 * Visits module composition root.
 *
 * Wires domain, infrastructure, and application layers.
 */

import { prisma } from "@/infrastructure/prisma/client";
import { createAuthorizationService } from "@/modules/authorization/composition-root";
import { PrismaOrganizationRepository } from "@/infrastructure/organization/prisma-organization-repository";
import { PrismaClientRepository } from "./infrastructure/prisma-client-repository";
import { PrismaVisitRepository } from "./infrastructure/prisma-visit-repository";
import { GetClientListUseCase } from "./application/get-client-list-use-case";
import { CreateClientUseCase } from "./application/create-client-use-case";
import { GetVisitListUseCase } from "./application/get-visit-list-use-case";
import { CreateVisitUseCase } from "./application/create-visit-use-case";
import { UpdateVisitUseCase } from "./application/update-visit-use-case";
import { GetTeamListUseCase } from "./application/get-team-list-use-case";

export interface VisitsUseCases {
  readonly getClientList: GetClientListUseCase;
  readonly createClient: CreateClientUseCase;
  readonly getVisitList: GetVisitListUseCase;
  readonly createVisit: CreateVisitUseCase;
  readonly updateVisit: UpdateVisitUseCase;
  readonly getTeamList: GetTeamListUseCase;
}

export function createVisitsUseCases(): VisitsUseCases {
  const authorizationService = createAuthorizationService();
  const organizationRepository = new PrismaOrganizationRepository(prisma);
  const clientRepository = new PrismaClientRepository(prisma);
  const visitRepository = new PrismaVisitRepository(prisma);

  return {
    getClientList: new GetClientListUseCase(authorizationService, clientRepository),
    createClient: new CreateClientUseCase(authorizationService, clientRepository),
    getVisitList: new GetVisitListUseCase(authorizationService, visitRepository, organizationRepository),
    createVisit: new CreateVisitUseCase(authorizationService, visitRepository, organizationRepository, clientRepository),
    updateVisit: new UpdateVisitUseCase(authorizationService, visitRepository),
    getTeamList: new GetTeamListUseCase(authorizationService, organizationRepository),
  };
}
