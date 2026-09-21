/**
 * Prisma implementation of TransactionPort.
 *
 * Uses Prisma's interactive transactions ($transaction with a callback).
 * The transaction client is wrapped in a TransactionContext so that
 * Application code never sees Prisma types directly.
 *
 * Reference: ADR-008, data-architecture.md §10
 */

import type {
  TransactionPort,
  TransactionContext,
} from "@/shared/ports/transaction-port";
import { prisma } from "./client";

/**
 * Wraps Prisma's interactive transaction behind the TransactionPort contract.
 *
 * Usage:
 * ```ts
 * const txAdapter = new PrismaTransactionAdapter();
 * const result = await txAdapter.execute(async (ctx) => {
 *   // ctx.client is a Prisma.TransactionClient scoped to this transaction
 *   return someUseCase(ctx);
 * });
 * ```
 */
export class PrismaTransactionAdapter implements TransactionPort {
  async execute<T>(fn: (ctx: TransactionContext) => Promise<T>): Promise<T> {
    return prisma.$transaction(async (tx) => {
      return fn({ client: tx });
    });
  }
}
