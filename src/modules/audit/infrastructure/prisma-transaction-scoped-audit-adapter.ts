/**
 * Transaction-scoped implementation of AuditPort.
 *
 * Receives the same Prisma transaction client as business repositories,
 * ensuring atomicity: audit events and business operations commit or
 * rollback together.
 *
 * Used within SaleCommissionTransactionPort and OrganizationRepository
 * executeInTransaction when audit events must be transactional.
 *
 * Reference: ADR-009, data-architecture.md §13
 */

import type { AuditPort, AuditEvent } from "@/shared/ports/audit-port";
import type { PrismaClient, Prisma } from "@prisma/client";

export class PrismaTransactionScopedAuditAdapter implements AuditPort {
  constructor(private readonly prisma: PrismaClient) {}

  async log(event: AuditEvent): Promise<void> {
    try {
      await this.prisma.auditEvent.create({
        data: {
          actorId: event.actorId,
          actorEmail: event.actorEmail,
          action: event.action,
          resourceType: event.resourceType,
          resourceId: event.resourceId,
          result: event.result,
          correlationId: event.correlationId,
          metadata: (event.metadata as Prisma.InputJsonValue) ?? undefined,
          createdAt: event.timestamp,
        },
      });
    } catch {
      // Best-effort: audit failures must never propagate.
      // Within a transaction, if this fails the entire transaction will
      // rollback (which is correct for business failures).
      // For audit-only failures within a transaction, we still don't propagate.
    }
  }
}
