/**
 * Resolve readable resource references for audit events (presentation).
 *
 * Each audit event stores `resourceType` + `resourceId` (a UUID) as its
 * source of truth. For human inspection we resolve the UUID to a readable
 * label (e.g. "VT-0042", "EMP-7", account email) at read time, without
 * altering the persisted event.
 *
 * Authorization: this runs after the `audit.read` check inside the server
 * action, and only ADMIN (global scope) reaches it, so no extra scope
 * validation is required.
 *
 * Reference: requirements.md §3.12.1.1
 */

import { prisma } from "@/infrastructure/prisma/client";

/** Readable label per event.id. */
export type ResourceLabelMap = ReadonlyMap<string, string | null>;

/**
 * Given audit events, resolve a readable label for each resource.
 * Events whose resource is not resolvable (or has no id) get `null`.
 */
export async function resolveResourceLabels(
  events: ReadonlyArray<{
    readonly id: string;
    readonly resourceType: string;
    readonly resourceId: string | null;
  }>,
): Promise<ResourceLabelMap> {
  const result = new Map<string, string | null>();

  if (events.length === 0) return result;

  // Group ids by resource type to batch queries.
  const idsByType = new Map<string, string[]>();
  for (const event of events) {
    if (!event.resourceId) continue;
    const list = idsByType.get(event.resourceType) ?? [];
    list.push(event.resourceId);
    idsByType.set(event.resourceType, list);
  }

  async function resolveEmployees(ids: string[]): Promise<void> {
    const rows = await prisma.employee.findMany({
      where: { id: { in: ids } },
      select: { id: true, employeeCode: true },
    });
    for (const row of rows) {
      result.set(row.id, `EMP-${String(row.employeeCode)}`);
    }
  }

  async function resolveSales(ids: string[]): Promise<void> {
    const rows = await prisma.sale.findMany({
      where: { id: { in: ids } },
      select: { id: true, saleNumber: true },
    });
    for (const row of rows) {
      result.set(row.id, `VT-${String(row.saleNumber).padStart(4, "0")}`);
    }
  }

  async function resolveUserAccounts(ids: string[]): Promise<void> {
    const rows = await prisma.userAccount.findMany({
      where: { id: { in: ids } },
      select: { id: true, email: true },
    });
    for (const row of rows) {
      result.set(row.id, row.email ?? "Cuenta");
    }
  }

  async function resolveCommissionEntries(ids: string[]): Promise<void> {
    const rows = await prisma.commissionEntry.findMany({
      where: { id: { in: ids } },
      select: { id: true, sale: { select: { saleNumber: true } } },
    });
    for (const row of rows) {
      const saleNumber = row.sale.saleNumber;
      result.set(row.id, `Comisión VT-${String(saleNumber).padStart(4, "0")}`);
    }
  }

  async function resolveCommissionRules(ids: string[]): Promise<void> {
    const rows = await prisma.commissionRule.findMany({
      where: { id: { in: ids } },
      select: { id: true, levelId: true },
    });
    for (const row of rows) {
      result.set(row.id, `Regla N${row.levelId}`);
    }
  }

  const resolvers: Record<string, (ids: string[]) => Promise<void>> = {
    Employee: resolveEmployees,
    Sale: resolveSales,
    UserAccount: resolveUserAccounts,
    CommissionEntry: resolveCommissionEntries,
    CommissionRule: resolveCommissionRules,
  };

  await Promise.all(
    Array.from(idsByType.entries()).map(async ([type, ids]) => {
      const resolve = resolvers[type];
      if (resolve) await resolve(ids);
    }),
  );

  return result;
}