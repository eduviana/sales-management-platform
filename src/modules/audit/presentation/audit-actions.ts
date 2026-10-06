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
import { createCommissionUseCases } from "@/modules/commissions/composition-root";
import { createIdentityModule } from "@/modules/identity/composition-root";
import { createOrganizationModule } from "@/modules/organization/composition-root";
import { createSalesUseCases } from "@/modules/sales/composition-root";
import { resolveAuthContext } from "@/modules/identity/resolve-auth-context";
import { resolveResourceLabels } from "./resolve-resource-labels";
import type { AuditAction } from "@/shared/ports/audit-port";
import { toActionErrorMessage } from "@/shared/presentation/action-error";

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
    const { getAuditEventsUseCase } = createAuditModule();

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
    // Each resource type is resolved by a labeling service of the module
    // that owns the data; this action only wires them (composition root).
    const { getEmployeeLabels } = createOrganizationModule();
    const { getSaleLabels } = createSalesUseCases();
    const { getEntryLabels, getRuleLabels } = createCommissionUseCases();
    const { getAccountLabels } = await createIdentityModule();

    const resourceLabels = await resolveResourceLabels(result.events, {
      Employee: (ids) => getEmployeeLabels.execute({ employeeIds: ids }),
      Sale: (ids) => getSaleLabels.execute({ saleIds: ids }),
      UserAccount: (ids) => getAccountLabels.execute({ userIds: ids }),
      CommissionEntry: (ids) => getEntryLabels.execute({ entryIds: ids }),
      CommissionRule: (ids) => getRuleLabels.execute({ ruleIds: ids }),
    });

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
    return {
      events: [],
      totalCount: 0,
      page: 1,
      pageSize: 20,
      error: toActionErrorMessage(error),
      loading: false,
    };
  }
}
