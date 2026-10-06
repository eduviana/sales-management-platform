/**
 * Resolve readable resource references for audit events (presentation).
 *
 * Each audit event stores `resourceType` + `resourceId` (a UUID) as its
 * source of truth. For human inspection we resolve the UUID to a readable
 * label (e.g. "VT-0042", "EMP-7", account email) at read time, without
 * altering the persisted event.
 *
 * The lookups are owned by the module that holds each resource type
 * (`Employee` → Organization, `Sale` → Sales, `UserAccount` → Identity,
 * `CommissionEntry`/`CommissionRule` → Commissions) and are injected here as
 * resolvers by the caller, which is the composition root of the audit
 * query. This file only groups the ids by resource type and merges the
 * labels; it no longer reads any table directly.
 *
 * Authorization: this runs after the `audit.read` check inside the server
 * action, and only ADMIN (global scope) reaches it, so no extra scope
 * validation is required here. The labeling services themselves declare no
 * permission of their own.
 *
 * Reference: requirements.md §3.12.1.1, system-architecture.md §6
 */

/** Readable label per event.id. */
export type ResourceLabelMap = ReadonlyMap<string, string | null>;

/** Resolves the labels of the ids of one resource type. */
export type ResourceLabelResolver = (
  ids: readonly string[],
) => Promise<ReadonlyMap<string, string>>;

/** Resolver per `resourceType`. Types without a resolver are not labeled. */
export type ResourceLabelResolvers = Readonly<Record<string, ResourceLabelResolver>>;

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
  resolvers: ResourceLabelResolvers,
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

  await Promise.all(
    Array.from(idsByType.entries()).map(async ([type, ids]) => {
      const resolve = resolvers[type];
      if (!resolve) return;
      const labels = await resolve(ids);
      for (const [resourceId, label] of labels) {
        result.set(resourceId, label);
      }
    }),
  );

  return result;
}
