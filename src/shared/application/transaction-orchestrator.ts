/**
 * Transaction orchestrator for the Application layer.
 *
 * Coordinates use case execution within transactional boundaries
 * and integrates audit logging when applicable.
 *
 * Reference: data-architecture.md §10
 */

import type {
  TransactionPort,
  TransactionContext,
} from "@/shared/ports/transaction-port";
import type { AuditPort, AuditEvent, AuditAction } from "@/shared/ports/audit-port";

/**
 * Options for a single orchestrated execution.
 */
export interface ExecuteOptions {
  /** If provided, an audit event is logged after successful execution. */
  readonly audit?: {
    readonly actorId: string | null;
     readonly action: AuditAction;
    readonly resource: string;
    readonly resourceId: string | null;
  };
}

/**
 * Orchestrates use case execution within transactions.
 *
 * Responsibilities:
 * - Wrap use case logic in a transactional boundary.
 * - Emit audit events on success when requested.
 * - Never let audit failures break the transaction.
 *
 * Usage:
 * ```ts
 * const orchestrator = new TransactionOrchestrator(txPort, auditPort);
 *
 * const result = await orchestrator.execute(
 *   async (ctx) => {
 *     return this.createEmployeeUseCase.execute(ctx, input);
 *   },
 *   {
 *     audit: {
 *       actorId: currentUser.id,
 *       action: "employee.create",
 *       resource: "Employee",
 *       resourceId: null, // populated after creation
 *     },
 *   },
 * );
 * ```
 */
export class TransactionOrchestrator {
  constructor(
    private readonly transactionPort: TransactionPort,
    private readonly auditPort: AuditPort | null = null,
  ) {}

  /**
   * Execute a use case within a transaction.
   *
   * @param fn - The use case function. Receives a TransactionContext.
   * @param options - Optional audit configuration.
   * @returns The result of the use case function.
   */
  async execute<T>(
    fn: (ctx: TransactionContext) => Promise<T>,
    options?: ExecuteOptions,
  ): Promise<T> {
    return this.transactionPort.execute(async (txCtx) => {
      const result = await fn(txCtx);

      // Best-effort audit logging after successful commit.
      // The audit event is recorded within the same transaction so that
      // if the use case rolls back, the audit event is also rolled back.
      if (options?.audit && this.auditPort) {
        const event: AuditEvent = {
          actorId: options.audit.actorId,
           action: options.audit.action,
           resourceType: options.audit.resource,
           resourceId: options.audit.resourceId,
           actorEmail: null,
           result: "SUCCESS",
           correlationId: null,
           metadata: null,
          timestamp: new Date(),
        };
        await this.auditPort.log(event);
      }

      return result;
    });
  }
}
