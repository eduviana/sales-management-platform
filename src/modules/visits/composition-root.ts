/**
 * Visits module composition root.
 *
 * Wires domain, infrastructure, and application layers.
 */

import type { PrismaClient } from "@prisma/client";
import type { AuthorizationService } from "@/modules/authorization/domain";
import type { OrganizationRepository } from "@/modules/organization/domain";
import { PrismaClientRepository } from "./infrastructure/prisma-client-repository";
import { PrismaVisitRepository } from "./infrastructure/prisma-visit-repository";
import { PrismaReferralContactRepository } from "./infrastructure/prisma-referral-contact-repository";
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

export function createVisitsUseCases(
  prisma: PrismaClient,
  authorizationService: AuthorizationService,
  organizationRepository: OrganizationRepository,
): VisitsUseCases {
  const clientRepository = new PrismaClientRepository(prisma);
  const visitRepository = new PrismaVisitRepository(prisma);
  // referralContactRepository will be used when referral use cases are implemented
  void new PrismaReferralContactRepository(prisma);

  return {
    getClientList: new GetClientListUseCase(authorizationService, clientRepository),
    createClient: new CreateClientUseCase(authorizationService, clientRepository),
    getVisitList: new GetVisitListUseCase(authorizationService, visitRepository, organizationRepository),
    createVisit: new CreateVisitUseCase(authorizationService, visitRepository, organizationRepository, clientRepository),
    updateVisit: new UpdateVisitUseCase(authorizationService, visitRepository),
    getTeamList: new GetTeamListUseCase(authorizationService, organizationRepository),
  };
}
