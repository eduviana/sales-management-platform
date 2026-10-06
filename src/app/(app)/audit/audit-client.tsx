/**
 * AuditClient — ADMIN audit trail explorer (client).
 *
 * Queries audit events via the `queryAuditEvents` server action and
 * offers:
 * - Filters: result, action, date range
 * - Free-text search over actor email / resource / correlation id
 * - Pagination
 *
 * The filter bar lives in <AuditFilters> and the results panel (table +
 * pagination) in <AuditResults>. This component owns the query state.
 *
 * All authorization happens server-side (audit.read, ADMIN only).
 *
 * Reference: requirements.md §3.12, permissions-matrix.md §4.14
 */

"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { RefreshCw } from "lucide-react";
import {
  queryAuditEvents,
  type AuditEventsActionState,
  type QueryAuditEventsInput,
} from "@/modules/audit/presentation/audit-actions";
import { ACTION_LABELS } from "@/modules/audit/presentation/audit-labels";
import { AuditAction } from "@/shared/ports/audit-port";
import { AuditFilters } from "./audit-filters";
import { AuditResults, type AuditRow } from "./audit-results";

const PAGE_SIZE = 20;

export function AuditClient({
  headerTitle,
  headerSubtitle,
}: {
  headerTitle: string;
  headerSubtitle: string;
}) {
  const [filterResult, setFilterResult] = useState<string>("");
  const [filterAction, setFilterAction] = useState<string>("");
  const [filterFrom, setFilterFrom] = useState("");
  const [filterTo, setFilterTo] = useState("");
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);

  const [events, setEvents] = useState<AuditRow[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const totalPages = Math.max(1, Math.ceil(totalCount / PAGE_SIZE));

  // Shared query input (filters + pagination). Only includes defined filters
  // so the server action log stays clean (no `undefined` values).
  const queryInput = useMemo<QueryAuditEventsInput>(
    () => ({
      page,
      pageSize: PAGE_SIZE,
      ...(filterResult ? { result: filterResult as "SUCCESS" | "FAILURE" | "DENIED" } : {}),
      ...(filterAction ? { action: filterAction as AuditAction } : {}),
      ...(filterFrom ? { from: filterFrom } : {}),
      ...(filterTo ? { to: filterTo } : {}),
    }),
    [filterResult, filterAction, filterFrom, filterTo, page],
  );

  // Applies the server result to local state (called after await).
  const applyResult = useCallback((result: AuditEventsActionState) => {
    setError(result.error);
    setEvents(
      (result.events as unknown as AuditRow[]).map((event) => ({
        ...event,
        createdAt: new Date(event.createdAt),
      })),
    );
    setTotalCount(result.totalCount);
    setLoading(false);
  }, []);

  // Initial load + reload on filter/pagination changes.
  useEffect(() => {
    let cancelled = false;
    (async () => {
      const result = await queryAuditEvents(queryInput);
      if (!cancelled) applyResult(result);
    })();
    return () => {
      cancelled = true;
    };
  }, [queryInput, applyResult]);

  // Refresh from the header button (shows the loading spinner).
  const refresh = useCallback(async () => {
    setLoading(true);
    setError(null);
    const result = await queryAuditEvents(queryInput);
    applyResult(result);
  }, [queryInput, applyResult]);

  // Free-text search applies over the current page results
  const query = search.trim().toLowerCase();
  const filtered = query
    ? events.filter((e) =>
        [e.actorEmail ?? "", e.resourceLabel ?? "", e.resourceId ?? "", e.correlationId ?? "", ACTION_LABELS[e.action] ?? e.action]
          .some((field) => field.toLowerCase().includes(query)),
      )
    : events;

  const handleReset = () => {
    setFilterResult("");
    setFilterAction("");
    setFilterFrom("");
    setFilterTo("");
    setSearch("");
    setPage(1);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <header className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-on-surface mb-1">
            {headerTitle}
          </h1>
          <p className="text-on-surface-variant">{headerSubtitle}</p>
        </div>
        <button
          onClick={() => void refresh()}
          className="inline-flex items-center gap-2 px-3 py-2 text-sm font-medium rounded-lg bg-surface-container-low border border-outline-variant text-on-surface-variant hover:text-on-surface hover:border-primary transition-colors"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} aria-hidden="true" />
          Actualizar
        </button>
      </header>

      <AuditFilters
        search={search}
        filterResult={filterResult}
        filterAction={filterAction}
        filterFrom={filterFrom}
        filterTo={filterTo}
        onSearchChange={setSearch}
        onResultChange={(value) => {
          setFilterResult(value);
          setPage(1);
        }}
        onActionChange={(value) => {
          setFilterAction(value);
          setPage(1);
        }}
        onFromChange={(value) => {
          setFilterFrom(value);
          setPage(1);
        }}
        onToChange={(value) => {
          setFilterTo(value);
          setPage(1);
        }}
        onReset={handleReset}
      />

      <AuditResults
        events={filtered}
        totalCount={totalCount}
        page={page}
        totalPages={totalPages}
        loading={loading}
        error={error}
        onPrev={() => setPage((p) => Math.max(1, p - 1))}
        onNext={() => setPage((p) => Math.min(totalPages, p + 1))}
      />
    </div>
  );
}
