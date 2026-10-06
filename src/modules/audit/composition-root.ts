/**
 * Composition root for the Audit module.
 *
 * Wires up all dependencies: repository, use cases.
 * This is the only place that knows about concrete implementations.
 *
 * Must be called from server-side code only.
 */

import { prisma } from "@/infrastructure/prisma/client";
import { PrismaAuditAdapter } from "./infrastructure/prisma-audit-adapter";
import { PrismaAuditEventRepository } from "./infrastructure/prisma-audit-event-repository";
import { GetAuditEventsUseCase } from "./application/get-audit-events-use-case";
import { createAuthorizationService } from "@/modules/authorization/composition-root";

/**
 * Create all Audit module dependencies and return use cases.
 *
 * Each call creates fresh adapter instances scoped to the current request.
 */
export function createAuditModule() {
  // Infrastructure
  const authorizationService = createAuthorizationService();
  const auditPort = new PrismaAuditAdapter(prisma);
  const auditEventRepository = new PrismaAuditEventRepository(prisma);

  // Use cases
  const getAuditEventsUseCase = new GetAuditEventsUseCase(
    authorizationService,
    auditEventRepository,
  );

  return {
    auditPort,
    auditEventRepository,
    getAuditEventsUseCase,
  };
}
