/**
 * Logout use case.
 *
 * Destroys the current session and records an audit event.
 *
 * Reference: authorization.md §4, system-architecture.md §11
 */

import type { SessionPort } from "@/modules/identity/domain";
import type { AuditPort } from "@/shared/ports/audit-port";
import { AuditAction } from "@/shared/ports/audit-port";

export interface LogoutInput {
  readonly userId: string;
  readonly userEmail: string;
}

export class LogoutUseCase {
  constructor(
    private readonly sessionPort: SessionPort,
    private readonly auditPort: AuditPort,
  ) {}

  async execute(input: LogoutInput): Promise<void> {
    await this.sessionPort.destroy();

    // Record logout audit event
    await this.auditPort.log({
      actorId: input.userId,
      actorEmail: input.userEmail,
      action: AuditAction.LOGOUT,
      resourceType: "UserAccount",
      resourceId: input.userId,
      result: "SUCCESS",
      correlationId: null,
      metadata: null,
      timestamp: new Date(),
    });
  }
}
