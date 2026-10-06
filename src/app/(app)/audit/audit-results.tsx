import { ChevronLeft, ChevronRight } from "lucide-react";
import {
  ACTION_LABELS,
  RESULT_BADGE,
  RESULT_LABELS,
  RESOURCE_TYPE_LABELS,
  formatAuditDateTime,
} from "@/modules/audit/presentation/audit-labels";

export interface AuditRow {
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

interface AuditResultsProps {
  events: AuditRow[];
  totalCount: number;
  page: number;
  totalPages: number;
  loading: boolean;
  error: string | null;
  onPrev: () => void;
  onNext: () => void;
}

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

/** Audit results panel: event count, pagination, error and table. */
export function AuditResults({
  events,
  totalCount,
  page,
  totalPages,
  loading,
  error,
  onPrev,
  onNext,
}: AuditResultsProps) {
  return (
    <div className="bg-surface border border-outline-variant rounded-2xl overflow-hidden flex flex-col">
      <div className="px-6 py-4 border-b border-outline-variant bg-surface-container-lowest flex items-center justify-between">
        <h2 className="text-sm font-medium text-on-surface-variant">
          {loading ? "Cargando..." : `${totalCount.toLocaleString("es-AR")} eventos`}
        </h2>
        <div className="flex items-center gap-2 text-sm text-on-surface-variant">
          <button
            onClick={onPrev}
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
            onClick={onNext}
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

      {events.length === 0 ? (
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
              {events.map((event) => (
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
          Mostrando {events.length} de {totalCount.toLocaleString("es-AR")}
        </span>
        <div className="flex items-center gap-2 text-sm text-on-surface-variant">
          <button
            onClick={onPrev}
            disabled={page <= 1 || loading}
            className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg border border-outline-variant hover:border-primary disabled:opacity-40 transition-colors"
          >
            <ChevronLeft className="w-4 h-4" aria-hidden="true" /> Anterior
          </button>
          <button
            onClick={onNext}
            disabled={page >= totalPages || loading}
            className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg border border-outline-variant hover:border-primary disabled:opacity-40 transition-colors"
          >
            Siguiente <ChevronRight className="w-4 h-4" aria-hidden="true" />
          </button>
        </div>
      </div>
    </div>
  );
}
