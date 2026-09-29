/**
 * AuditClient — ADMIN audit trail explorer (client).
 *
 * Queries audit events via the `queryAuditEvents` server action and
 * offers:
 * - Filters: result, action, date range
 * - Free-text search over actor email / resource / correlation id
 * - Pagination
 *
 * All authorization happens server-side (audit.read, ADMIN only).
 *
 * Reference: requirements.md §3.12, permissions-matrix.md §4.11
 */

"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { Search, ChevronLeft, ChevronRight, RefreshCw } from "lucide-react";
import {
  queryAuditEvents,
  type AuditEventsActionState,
  type QueryAuditEventsInput,
} from "@/modules/audit/presentation/audit-actions";
import {
  ACTION_LABELS,
  RESULT_BADGE,
  RESULT_LABELS,
  RESOURCE_TYPE_LABELS,
  formatAuditDateTime,
} from "@/modules/audit/presentation/audit-labels";
import { AuditAction } from "@/shared/ports/audit-port";

interface AuditRow {
  id: string;
  actorId: string | null;
  actorEmail: string | null;
  action: string;
  resourceType: string;
  resourceId: string | null;
  resourceLabel: string | null;
  result: "SUCCESS" | "FAILURE" | "DENIED";
  correlationId: string | null;
  createdAt: Date;
}

const PAGE_SIZE = 20;

const SELECT_CLASS =
  "bg-surface-container-low border border-outline-variant text-sm text-on-surface rounded-lg px-3 py-2 focus:outline-none focus:border-primary transition-colors";

/**
 * Resource cell for the audit table.
 *
 * When the readable resource reference equals the actor email (self-acting
 * events such as LOGIN/LOGOUT on one's own account), the reference is
 * redundant with the Actor column, so only the resource type is shown and
 * the UUID stays as a tooltip. For other resources (e.g. VT-0042, EMP-7)
 * the readable reference is shown as usual.
 */
function ResourceCell({ event }: { event: AuditRow }) {
  const typeLabel = RESOURCE_TYPE_LABELS[event.resourceType] ?? event.resourceType;

  const isSelfAccount =
    event.resourceLabel !== null && event.resourceLabel === event.actorEmail;

  const primary = isSelfAccount ? typeLabel : event.resourceLabel ?? typeLabel;
  const secondary = isSelfAccount
    ? null
    : event.resourceLabel
      ? typeLabel
      : event.resourceId;

  return (
    <td className="py-3 px-4 text-center whitespace-nowrap">
      <span title={event.resourceId ?? undefined} className="cursor-help">
        {primary}
      </span>
      {secondary && (
        <span className="block text-xs text-on-surface-dim font-mono">
          {secondary}
        </span>
      )}
    </td>
  );
}

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

      {/* Filters */}
      <div className="bg-surface border border-outline-variant rounded-2xl p-4 flex flex-wrap items-end gap-3">
        <div className="flex flex-col gap-1 w-96">
          <label className="text-xs text-on-surface-variant">Buscar</label>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-on-surface-variant" aria-hidden="true" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Email, recurso o correlación..."
              className="w-full bg-surface-container-low border border-outline-variant text-sm text-on-surface rounded-lg pl-10 pr-3 py-2 placeholder:text-on-surface-variant focus:outline-none focus:border-primary transition-colors"
            />
          </div>
        </div>

        <div className="flex flex-col gap-1 ml-auto">
          <label className="text-xs text-on-surface-variant">Resultado</label>
          <select
            value={filterResult}
            onChange={(e) => {
              setFilterResult(e.target.value);
              setPage(1);
            }}
            className={SELECT_CLASS}
          >
            <option value="">Todos</option>
            <option value="SUCCESS">Éxito</option>
            <option value="FAILURE">Fallo</option>
            <option value="DENIED">Denegado</option>
          </select>
        </div>

        <div className="flex flex-col gap-1">
          <label className="text-xs text-on-surface-variant">Acción</label>
          <select
            value={filterAction}
            onChange={(e) => {
              setFilterAction(e.target.value);
              setPage(1);
            }}
            className={SELECT_CLASS}
          >
            <option value="">Todas</option>
            {(Object.keys(AuditAction) as Array<keyof typeof AuditAction>).map((key) => {
              const action = AuditAction[key];
              return (
                <option key={action} value={action}>
                  {ACTION_LABELS[action] ?? action}
                </option>
              );
            })}
          </select>
        </div>

        <div className="flex flex-col gap-1">
          <label className="text-xs text-on-surface-variant">Desde</label>
          <input
            type="date"
            value={filterFrom}
            onChange={(e) => {
              setFilterFrom(e.target.value);
              setPage(1);
            }}
            className={SELECT_CLASS}
          />
        </div>

        <div className="flex flex-col gap-1">
          <label className="text-xs text-on-surface-variant">Hasta</label>
          <input
            type="date"
            value={filterTo}
            onChange={(e) => {
              setFilterTo(e.target.value);
              setPage(1);
            }}
            className={SELECT_CLASS}
          />
        </div>

        {(filterResult || filterAction || filterFrom || filterTo || search) && (
          <button
            onClick={handleReset}
            className="px-3 py-2 text-sm font-medium text-on-surface-variant hover:text-on-surface transition-colors"
          >
            Limpiar
          </button>
        )}
      </div>

      {/* Results */}
      <div className="bg-surface border border-outline-variant rounded-2xl overflow-hidden flex flex-col">
        <div className="px-6 py-4 border-b border-outline-variant bg-surface-container-lowest flex items-center justify-between">
          <h2 className="text-sm font-medium text-on-surface-variant">
            {loading ? "Cargando..." : `${totalCount.toLocaleString("es-AR")} eventos`}
          </h2>
          <div className="flex items-center gap-2 text-sm text-on-surface-variant">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page <= 1 || loading}
              className="p-1.5 rounded-lg border border-outline-variant hover:border-primary disabled:opacity-40 transition-colors"
              aria-label="Página anterior"
            >
              <ChevronLeft className="w-4 h-4" aria-hidden="true" />
            </button>
            <span>
              Página {page} de {totalPages}
            </span>
            <button
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page >= totalPages || loading}
              className="p-1.5 rounded-lg border border-outline-variant hover:border-primary disabled:opacity-40 transition-colors"
              aria-label="Página siguiente"
            >
              <ChevronRight className="w-4 h-4" aria-hidden="true" />
            </button>
          </div>
        </div>

        {error && (
          <div className="px-6 py-3 text-sm text-[#ffb4ab] bg-[#93000a]/10 border-b border-outline-variant">
            {error}
          </div>
        )}

        {filtered.length === 0 ? (
          <div className="p-10 text-center text-sm text-on-surface-variant">
            {loading ? "Cargando eventos..." : "Sin eventos que coincidan con los filtros."}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="bg-surface-container-low border-b border-outline-variant">
                  <th className="py-3 px-4 font-mono text-xs text-on-surface-variant uppercase tracking-wider text-center">
                    Actor
                  </th>
                  <th className="py-3 px-4 font-mono text-xs text-on-surface-variant uppercase tracking-wider text-center">
                    Acción
                  </th>
                  <th className="py-3 px-4 font-mono text-xs text-on-surface-variant uppercase tracking-wider text-center">
                    Resultado
                  </th>
                  <th className="py-3 px-4 font-mono text-xs text-on-surface-variant uppercase tracking-wider text-center">
                    Recurso
                  </th>
                  <th className="py-3 px-4 font-mono text-xs text-on-surface-variant uppercase tracking-wider text-center">
                    Fecha
                  </th>
                </tr>
              </thead>
              <tbody className="text-on-surface-dim">
                {filtered.map((event) => (
                  <tr key={event.id} className="table-row">
                    <td className="py-3 px-4 text-center whitespace-nowrap">
                      {event.actorEmail ?? "—"}
                    </td>
                    <td className="py-3 px-4 text-center whitespace-nowrap">
                      {ACTION_LABELS[event.action] ?? event.action}
                      <span className="block text-xs text-on-surface-dim font-mono">
                        {event.action}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-center whitespace-nowrap">
                      <span className={`badge ${RESULT_BADGE[event.result] ?? "badge-neutral"}`}>
                        {RESULT_LABELS[event.result] ?? event.result}
                      </span>
                    </td>
                    <ResourceCell event={event} />
                    <td className="py-3 px-4 text-center font-mono">
                      {formatAuditDateTime(event.createdAt)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Bottom pagination */}
        <div className="px-6 py-4 border-t border-outline-variant bg-surface-container-lowest flex items-center justify-between">
          <span className="text-sm text-on-surface-variant">
            Mostrando {filtered.length} de {totalCount.toLocaleString("es-AR")}
          </span>
          <div className="flex items-center gap-2 text-sm text-on-surface-variant">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page <= 1 || loading}
              className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg border border-outline-variant hover:border-primary disabled:opacity-40 transition-colors"
            >
              <ChevronLeft className="w-4 h-4" aria-hidden="true" /> Anterior
            </button>
            <button
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page >= totalPages || loading}
              className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg border border-outline-variant hover:border-primary disabled:opacity-40 transition-colors"
            >
              Siguiente <ChevronRight className="w-4 h-4" aria-hidden="true" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}