/**
 * Transaction port (contract) for the Application layer.
 *
 * Application layer depends on this interface, not on Prisma or any
 * concrete persistence technology. Infrastructure implements this port.
 *
 * Reference: ADR-008, data-architecture.md §10
 */

/**
 * Opaque transaction context provided to use cases.
 * The concrete type (e.g., Prisma.TransactionClient) is hidden behind
 * this interface so the domain and application layers never import Prisma.
 */
export interface TransactionContext {
  /**
   * The underlying persistence client scoped to this transaction.
   * Application code should pass this to repository methods, never
   * interact with it directly.
   */
  readonly client: unknown;
}

/**
 * Port for executing operations within a database transaction.
 *
 * Usage example in a use case:
 * ```ts
 * const result = await this.transactionPort.execute(async (ctx) => {
 *   await this.employeeRepo.updateLevel(ctx, employeeId, newLevelId);
 *   await this.levelHistoryRepo.closeCurrent(ctx, employeeId);
 *   await this.levelHistoryRepo.openNew(ctx, employeeId, newLevelId);
 *   return { success: true };
 * });
 * ```
 */
export interface TransactionPort {
  /**
   * Execute `fn` within a transactional boundary.
   * If `fn` completes successfully, the transaction is committed.
   * If `fn` throws, the transaction is rolled back and the error propagates.
   */
  execute<T>(fn: (ctx: TransactionContext) => Promise<T>): Promise<T>;
}
