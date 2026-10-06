import { Search } from "lucide-react";
import { ACTION_LABELS } from "@/modules/audit/presentation/audit-labels";
import { AuditAction } from "@/shared/ports/audit-port";

const SELECT_CLASS =
  "bg-surface-container-low border border-outline-variant text-sm text-on-surface rounded-lg px-3 py-2 focus:outline-none focus:border-primary transition-colors";

interface AuditFiltersProps {
  search: string;
  filterResult: string;
  filterAction: string;
  filterFrom: string;
  filterTo: string;
  onSearchChange: (value: string) => void;
  onResultChange: (value: string) => void;
  onActionChange: (value: string) => void;
  onFromChange: (value: string) => void;
  onToChange: (value: string) => void;
  onReset: () => void;
}

/** Filter bar for the audit trail explorer (result, action, date range, search). */
export function AuditFilters({
  search,
  filterResult,
  filterAction,
  filterFrom,
  filterTo,
  onSearchChange,
  onResultChange,
  onActionChange,
  onFromChange,
  onToChange,
  onReset,
}: AuditFiltersProps) {
  const hasFilters = Boolean(
    filterResult || filterAction || filterFrom || filterTo || search,
  );

  return (
    <div className="bg-surface border border-outline-variant rounded-2xl p-4 flex flex-wrap items-end gap-3">
      <div className="flex flex-col gap-1 w-96">
        <label className="text-xs text-on-surface-variant">Buscar</label>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-on-surface-variant" aria-hidden="true" />
          <input
            type="text"
            value={search}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Email, recurso o correlación..."
            className="w-full bg-surface-container-low border border-outline-variant text-sm text-on-surface rounded-lg pl-10 pr-3 py-2 placeholder:text-on-surface-variant focus:outline-none focus:border-primary transition-colors"
          />
        </div>
      </div>

      <div className="flex flex-col gap-1 ml-auto">
        <label className="text-xs text-on-surface-variant">Resultado</label>
        <select
          value={filterResult}
          onChange={(e) => onResultChange(e.target.value)}
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
          onChange={(e) => onActionChange(e.target.value)}
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
          onChange={(e) => onFromChange(e.target.value)}
          className={SELECT_CLASS}
        />
      </div>

      <div className="flex flex-col gap-1">
        <label className="text-xs text-on-surface-variant">Hasta</label>
        <input
          type="date"
          value={filterTo}
          onChange={(e) => onToChange(e.target.value)}
          className={SELECT_CLASS}
        />
      </div>

      {hasFilters && (
        <button
          onClick={onReset}
          className="px-3 py-2 text-sm font-medium text-on-surface-variant hover:text-on-surface transition-colors"
        >
          Limpiar
        </button>
      )}
    </div>
  );
}
