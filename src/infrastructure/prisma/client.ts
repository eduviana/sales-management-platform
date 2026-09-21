/**
 * Singleton Prisma client.
 *
 * In development, Next.js hot-reloads modules on every request.
 * Without a singleton, each reload creates a new PrismaClient instance
 * and exhausts database connections. The global reference prevents this.
 *
 * Prisma 7 requires a driver adapter (PrismaPg) to connect to PostgreSQL.
 *
 * Reference: ADR-008 (Prisma encapsulated in Infrastructure)
 */

import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { env } from "@/infrastructure/config/env";

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

function createPrismaClient(): PrismaClient {
  const adapter = new PrismaPg({ connectionString: env.DATABASE_URL });
  return new PrismaClient({ adapter });
}

/**
 * Shared Prisma client instance.
 * Only import this from Infrastructure layer code (adapters, repositories).
 * Never import directly from Domain, Application, or Presentation layers.
 */
export const prisma = globalForPrisma.prisma ?? createPrismaClient();

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}
