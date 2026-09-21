/**
 * Get audit events use case.
 *
 * Queries audit events with filters and pagination.
 * Requires `audit.read` permission (ADMIN only).
 *
 * Reference: permissions-matrix.md §4.11, ADR-009
 */

import type { AuthorizationService, AuthorizationContext } from "@/modules/authorization/domain";
import type { AuditAction } from "@/shared/ports/audit-port";
import type {
  AuditEventRepository,
  AuditEventQueryResult,
} from "../domain/audit-event-repository";
import { AuthorizationError } from "@/shared/errors";

export interface GetAuditEventsInput {
  readonly authContext: AuthorizationContext;
  readonly filters?: {
    readonly actorId?: string;
    readonly action?: AuditAction;
    readonly resourceType?: string;
    readonly resourceId?: string;
    readonly result?: "SUCCESS" | "FAILURE" | "DENIED";
    readonly correlationId?: string;
    readonly from?: Date;
    readonly to?: Date;
  };
  readonly page?: number;
  readonly pageSize?: number;
}

export class GetAuditEventsUseCase {
  constructor(
    private readonly authorizationService: AuthorizationService,
    private readonly auditEventRepository: AuditEventRepository,
  ) {}

  async execute(input: GetAuditEventsInput): Promise<AuditEventQueryResult> {
    // 1. Authorize: audit.read permission (ADMIN only)
    const decision = await this.authorizationService.authorize(
      input.authContext,
      { permission: "audit.read" },
    );

    if (!decision.allowed) {
      throw new AuthorizationError(
        decision.reason ?? "Not authorized to read audit events.",
      );
    }

    // 2. Query audit events
    const result = await this.auditEventRepository.findMany(
      input.filters ?? {},
      {
        page: input.page,
        pageSize: input.pageSize,
      },
    );

    return result;
  }
}
