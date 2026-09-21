/**
 * Prisma implementation of AuditPort.
 *
 * Persists audit events to the `audit_event` table.
 * Failures are silently swallowed — audit logging must never break
 * a business operation.
 *
 * Reference: data-architecture.md §13, ADR-008
 */

import type { AuditPort, AuditEvent } from "@/shared/ports/audit-port";
import type { PrismaClient, Prisma } from "@prisma/client";

export class PrismaAuditAdapter implements AuditPort {
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
      // In production, forward to monitoring/alerting.
    }
  }
}
