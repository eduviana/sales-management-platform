/**
 * Server Action for querying audit events.
 *
 * Handles paginated queries with filters for the audit trail.
 * Requires ADMIN role with audit.read permission.
 *
 * Reference: system-architecture.md §10, permissions-matrix.md §4.14
 */

"use server";

import { createAuditModule } from "@/modules/audit/composition-root";
import { createAuthorizationService } from "@/modules/authorization/composition-root";
import { prisma } from "@/infrastructure/prisma/client";
import { resolveAuthContext } from "@/modules/sales/presentation/resolve-auth-context";
import { resolveResourceLabels } from "@/modules/audit/presentation/resolve-resource-labels";
import type { AuditAction } from "@/shared/ports/audit-port";

export interface AuditEventsActionState {
  readonly events: readonly Record<string, unknown>[];
  readonly totalCount: number;
  readonly page: number;
  readonly pageSize: number;
  readonly error: string | null;
  readonly loading: boolean;
}

export interface QueryAuditEventsInput {
  readonly actorId?: string;
  readonly action?: AuditAction;
  readonly resourceType?: string;
  readonly resourceId?: string;
  readonly result?: "SUCCESS" | "FAILURE" | "DENIED";
  readonly correlationId?: string;
  readonly from?: string;
  readonly to?: string;
  readonly page?: number;
  readonly pageSize?: number;
}

export async function queryAuditEvents(
  input: QueryAuditEventsInput,
): Promise<AuditEventsActionState> {
  try {
    const authContext = await resolveAuthContext();
    const authorizationService = createAuthorizationService(prisma);
    const { getAuditEventsUseCase } = createAuditModule(authorizationService);

    const result = await getAuditEventsUseCase.execute({
      authContext,
      filters: {
        actorId: input.actorId,
        action: input.action,
        resourceType: input.resourceType,
        resourceId: input.resourceId,
        result: input.result,
        correlationId: input.correlationId,
        from: input.from ? new Date(input.from) : undefined,
        to: input.to ? new Date(input.to) : undefined,
      },
      page: input.page,
      pageSize: input.pageSize,
    });

    // Resolve readable resource references (presentation layer). The UUID
    // stays as source of truth in the persisted event; the label is derived
    // at read time for the audit table (requirements.md §3.12.1.1).
    const resourceLabels = await resolveResourceLabels(result.events);

    const events = result.events.map((event) => ({
      ...event,
      resourceLabel:
        event.resourceId !== null
          ? resourceLabels.get(event.resourceId) ?? null
          : null,
    }));

    return {
      events: events as unknown as Record<string, unknown>[],
      totalCount: result.totalCount,
      page: result.page,
      pageSize: result.pageSize,
      error: null,
      loading: false,
    };
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Unknown error occurred";
    return {
      events: [],
      totalCount: 0,
      page: 1,
      pageSize: 20,
      error: message,
      loading: false,
    };
  }
}
