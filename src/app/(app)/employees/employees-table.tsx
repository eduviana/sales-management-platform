import Link from "next/link";
import { ArrowDown, ArrowUp, ArrowUpDown, Eye } from "lucide-react";
import type { EmployeeRecord } from "@/modules/organization/domain/organization-repository";
import type { EmployeeProgressSummary } from "@/modules/progression/application/get-employee-progression-use-case";
import { formatLevelCode } from "@/shared/presentation/format";
import { PromoteRowButton } from "./promote-row-button";

export type EmployeeSortField = "level" | "progress" | "status";
export type SortDirection = "asc" | "desc";

const STATUS_LABELS: Record<string, string> = {
  ACTIVE: "Activo",
  INACTIVE: "Inactivo",
};

const STATUS_COLORS: Record<string, string> = {
  ACTIVE: "bg-secondary/10 text-secondary border-secondary/20",
  INACTIVE: "bg-tertiary/10 text-tertiary border-tertiary/20",
};

interface EmployeesTableProps {
  employees: EmployeeRecord[];
  progressionMap: Record<string, EmployeeProgressSummary>;
  sortField: EmployeeSortField | null;
  sortDir: SortDirection;
  onSort: (field: EmployeeSortField) => void;
}

/** Sortable employee table with progression, status and promotion action. */
export function EmployeesTable({
  employees,
  progressionMap,
  sortField,
  sortDir,
  onSort,
}: EmployeesTableProps) {
  return (
    <div className="bg-surface border border-outline-variant rounded-xl overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="bg-surface-container-low border-b border-[#27272e]">
              <th className="py-3 px-4 text-xs text-on-surface-variant uppercase tracking-wider text-center">
                ID
              </th>
              <th className="py-3 px-4 text-xs text-on-surface-variant uppercase tracking-wider text-center">
                Nombre
              </th>
              <th
                className="py-3 px-4 text-xs text-on-surface-variant uppercase tracking-wider text-center cursor-pointer select-none"
                onClick={() => onSort("level")}
              >
                <span className="inline-flex items-center gap-1">
                  Nivel <SortIcon field="level" sortField={sortField} sortDir={sortDir} />
                </span>
              </th>
              <th
                className="py-3 px-4 text-xs text-on-surface-variant uppercase tracking-wider text-center cursor-pointer select-none"
                onClick={() => onSort("progress")}
              >
                <span className="inline-flex items-center gap-1">
                  Progreso <SortIcon field="progress" sortField={sortField} sortDir={sortDir} />
                </span>
              </th>
              <th
                className="py-3 px-4 text-xs text-on-surface-variant uppercase tracking-wider text-center cursor-pointer select-none"
                onClick={() => onSort("status")}
              >
                <span className="inline-flex items-center gap-1">
                  Estado <SortIcon field="status" sortField={sortField} sortDir={sortDir} />
                </span>
              </th>
              <th className="py-3 px-4 text-xs text-on-surface-variant uppercase tracking-wider text-center">
                Acciones
              </th>
            </tr>
          </thead>
          <tbody>
            {employees.length === 0 ? (
              <tr>
                <td colSpan={6} className="py-8 text-center text-on-surface-variant text-sm">
                  No se encontraron empleados.
                </td>
              </tr>
            ) : (
              employees.map((emp) => {
                const statusClass = STATUS_COLORS[emp.status] ?? "";
                const progress = emp.currentLevelId !== null ? progressionMap[emp.id] : null;
                const canPromote =
                  emp.currentLevelId !== null &&
                  emp.currentLevelId < 7 &&
                  progress !== null &&
                  progress.percentage >= 100;
                return (
                  <tr
                    key={emp.id}
                    className="border-b border-[#27272e] hover:bg-surface-container-low/50 transition-colors"
                  >
                    <td className="py-3 px-4 text-sm text-on-surface text-center font-mono">
                      {emp.employeeCode}
                    </td>
                    <td className="py-3 px-4 text-sm text-on-surface text-center">
                      {emp.firstName} {emp.lastName}
                    </td>
                    <td className="py-3 px-4 text-sm text-on-surface text-center">
                      {emp.currentLevelId ? formatLevelCode(emp.currentLevelId) : "ADMIN"}
                    </td>
                    <td className="py-3 px-4 text-center">
                      {progress ? (
                        <ProgressBar percentage={progress.percentage} />
                      ) : (
                        <span className="text-on-surface-variant text-xs">—</span>
                      )}
                    </td>
                    <td className="py-3 px-4 text-center">
                      <span className={`border px-2 py-0.5 rounded-full text-xs font-semibold ${statusClass}`}>
                        {STATUS_LABELS[emp.status]}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-center">
                      <div className="flex items-center justify-center gap-1">
                        {canPromote && emp.currentLevelId !== null && (
                          <PromoteRowButton
                            employeeId={emp.id}
                            employeeName={`${emp.firstName} ${emp.lastName}`}
                            currentLevelId={emp.currentLevelId}
                            nextLevelId={emp.currentLevelId + 1}
                          />
                        )}
                        <Link
                          href={`/employees/${emp.id}`}
                          className="inline-flex items-center justify-center w-8 h-8 rounded-lg hover:bg-surface-container-high transition-colors"
                          title="Ver detalle"
                        >
                          <Eye className="w-4 h-4 text-on-surface-variant" />
                        </Link>
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function SortIcon({
  field,
  sortField,
  sortDir,
}: {
  field: EmployeeSortField;
  sortField: EmployeeSortField | null;
  sortDir: SortDirection;
}) {
  if (sortField !== field) return <ArrowUpDown size={14} className="text-on-surface-variant" />;
  return sortDir === "asc"
    ? <ArrowUp size={14} className="text-primary" />
    : <ArrowDown size={14} className="text-primary" />;
}

function ProgressBar({ percentage }: { percentage: number }) {
  return (
    <div className="flex items-center gap-2 min-w-[120px]">
      <div className="flex-1 h-2 bg-surface-container-low rounded-full overflow-hidden">
        <div
          className="h-full bg-[#00df81] rounded-full transition-all duration-500"
          style={{ width: `${percentage}%` }}
        />
      </div>
      <span className="text-xs text-on-surface-variant whitespace-nowrap">
        {percentage}%
      </span>
    </div>
  );
}
