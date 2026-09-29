/**
 * EmployeesClient — Client Component for ADMIN employee management.
 *
 * Renders a searchable, filterable table of all employees with progression.
 *
 * Reference: requirements.md §3.12
 */

"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import type { ReactNode } from "react";
import { ArrowDown, ArrowUp, ArrowUpDown, Eye, Search } from "lucide-react";
import type { EmployeeRecord } from "@/modules/organization/domain/organization-repository";
import type { EmployeeProgressSummary } from "@/modules/progression/application/get-employee-progression-use-case";
import { promoteToNextLevel } from "./actions";

const STATUS_LABELS: Record<string, string> = {
  ACTIVE: "Activo",
  INACTIVE: "Inactivo",
};

const STATUS_COLORS: Record<string, string> = {
  ACTIVE: "bg-secondary/10 text-secondary border-secondary/20",
  INACTIVE: "bg-tertiary/10 text-tertiary border-tertiary/20",
};

const LEVEL_LABELS: Record<number, string> = {
  1: "N1",
  2: "N2",
  3: "N3",
  4: "N4",
  5: "N5",
  6: "N6",
  7: "N7",
};

type SortField = "level" | "progress" | "status";
type SortDirection = "asc" | "desc";

function SortIcon({ field, sortField, sortDir }: { field: SortField; sortField: SortField | null; sortDir: SortDirection }) {
  if (sortField !== field) return <ArrowUpDown size={14} className="text-on-surface-variant" />;
  return sortDir === "asc"
    ? <ArrowUp size={14} className="text-primary" />
    : <ArrowDown size={14} className="text-primary" />;
}

interface EmployeesClientProps {
  employees: EmployeeRecord[];
  progressionMap: Record<string, EmployeeProgressSummary>;
}

export function EmployeesClient({ employees, progressionMap }: EmployeesClientProps) {
  const [search, setSearch] = useState("");
  const [levelFilter, setLevelFilter] = useState<string>("ALL");
  const [hideInactive, setHideInactive] = useState(true);
  const [showPromotable, setShowPromotable] = useState(false);
  const [sortField, setSortField] = useState<SortField | null>(null);
  const [sortDir, setSortDir] = useState<SortDirection>("asc");

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDir((prev) => (prev === "asc" ? "desc" : "asc"));
    } else {
      setSortField(field);
      setSortDir(field === "progress" ? "desc" : "asc");
    }
  };

  const filtered = useMemo(() => {
    const result = employees.filter((emp) => {
      const matchesSearch =
        search === "" ||
        emp.firstName.toLowerCase().includes(search.toLowerCase()) ||
        emp.lastName.toLowerCase().includes(search.toLowerCase()) ||
        emp.dni?.toLowerCase().includes(search.toLowerCase()) ||
        emp.email?.toLowerCase().includes(search.toLowerCase()) ||
        String(emp.employeeCode).includes(search);

      const matchesLevel =
        levelFilter === "ALL" || emp.currentLevelId === Number(levelFilter);

      const matchesStatus = !hideInactive || emp.status === "ACTIVE";

      const progress = emp.currentLevelId !== null ? progressionMap[emp.id] : null;
      const matchesPromotable =
        !showPromotable ||
        (emp.currentLevelId !== null &&
          emp.currentLevelId < 7 &&
          progress !== null &&
          progress.percentage >= 100);

      return matchesSearch && matchesLevel && matchesStatus && matchesPromotable;
    });

    if (sortField) {
      result.sort((a, b) => {
        let cmp = 0;
        if (sortField === "level") {
          const levelA = a.currentLevelId ?? 0;
          const levelB = b.currentLevelId ?? 0;
          cmp = levelA - levelB;
        } else if (sortField === "status") {
          cmp = a.status.localeCompare(b.status);
        } else if (sortField === "progress") {
          const progressA = a.currentLevelId !== null ? progressionMap[a.id]?.percentage ?? 0 : -1;
          const progressB = b.currentLevelId !== null ? progressionMap[b.id]?.percentage ?? 0 : -1;
          cmp = progressA - progressB;
        }
        return sortDir === "asc" ? cmp : -cmp;
      });
    }

    return result;
  }, [employees, progressionMap, search, levelFilter, hideInactive, showPromotable, sortField, sortDir]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <header className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-on-surface mb-1">
            Empleados
          </h1>
          <p className="text-on-surface-variant">
            {employees.length} empleados en el sistema
          </p>
        </div>
        <Link
          href="/team/new"
          className="px-4 py-2 text-sm font-medium text-[#0a1b12] bg-[#00df81] rounded-lg hover:bg-[#00c873] transition-colors"
        >
          Nuevo empleado
        </Link>
      </header>

      {/* Filters */}
      <div className="flex flex-col lg:flex-row gap-3">
        <div className="relative w-full lg:w-[34rem]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-on-surface-variant" />
          <input
            type="text"
            placeholder="Buscar por nombre, DNI, email o código..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-surface-container-low border border-outline-variant text-sm text-on-surface rounded-lg pl-10 pr-3 py-2 placeholder:text-on-surface-variant focus:outline-none focus:border-primary transition-colors"
          />
        </div>
        <select
          value={levelFilter}
          onChange={(e) => setLevelFilter(e.target.value)}
          className="ml-auto bg-surface-container-low border border-outline-variant text-sm text-on-surface rounded-lg px-3 py-2 focus:outline-none focus:border-primary transition-colors"
        >
          <option value="ALL">Todos los niveles</option>
          {[1, 2, 3, 4, 5, 6, 7].map((level) => (
            <option key={level} value={level}>
              {LEVEL_LABELS[level]}
            </option>
          ))}
        </select>
        <div className="flex items-center gap-2">
          <FilterPill active={showPromotable} onClick={() => setShowPromotable((v) => !v)}>
            Solo listos para ascender
          </FilterPill>
          <FilterPill active={!hideInactive} onClick={() => setHideInactive((v) => !v)}>
            Incluir inactivos
          </FilterPill>
        </div>
      </div>

      {/* Table */}
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
                  onClick={() => handleSort("level")}
                >
                  <span className="inline-flex items-center gap-1">
                    Nivel <SortIcon field="level" sortField={sortField} sortDir={sortDir} />
                  </span>
                </th>
                <th
                  className="py-3 px-4 text-xs text-on-surface-variant uppercase tracking-wider text-center cursor-pointer select-none"
                  onClick={() => handleSort("progress")}
                >
                  <span className="inline-flex items-center gap-1">
                    Progreso <SortIcon field="progress" sortField={sortField} sortDir={sortDir} />
                  </span>
                </th>
                <th
                  className="py-3 px-4 text-xs text-on-surface-variant uppercase tracking-wider text-center cursor-pointer select-none"
                  onClick={() => handleSort("status")}
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
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-on-surface-variant text-sm">
                    No se encontraron empleados.
                  </td>
                </tr>
              ) : (
                filtered.map((emp) => {
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
                        {emp.currentLevelId ? LEVEL_LABELS[emp.currentLevelId] ?? `N${emp.currentLevelId}` : "ADMIN"}
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
    </div>
  );
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

function FilterPill({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={`inline-flex items-center gap-1.5 px-3 py-2 text-sm font-medium rounded-lg border transition-colors select-none ${
        active
          ? "bg-primary/10 text-primary border-primary/30"
          : "bg-surface-container-low text-on-surface-variant border-outline-variant hover:border-primary/40"
      }`}
    >
      {children}
    </button>
  );
}

/**
 * PromoteRowButton — Promotes an employee to the next level from the table.
 *
 * Only rendered when the progression bar is at 100% and the employee is below
 * the maximum level. Promotes exactly one level; the server recomputes the
 * target level and rejects any non-consecutive change.
 *
 * Reference: requirements.md §3.12.3, business-rules.md REG-082
 */
function PromoteRowButton({
  employeeId,
  employeeName,
  currentLevelId,
  nextLevelId,
}: {
  employeeId: string;
  employeeName: string;
  currentLevelId: number;
  nextLevelId: number;
}) {
  const router = useRouter();
  const [confirming, setConfirming] = useState(false);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const currentLabel = LEVEL_LABELS[currentLevelId] ?? `N${currentLevelId}`;
  const nextLabel = LEVEL_LABELS[nextLevelId] ?? `N${nextLevelId}`;

  const handleConfirm = async () => {
    setPending(true);
    setError(null);
    const result = await promoteToNextLevel(employeeId);
    setPending(false);
    if (result.ok) {
      setConfirming(false);
      router.refresh();
    } else {
      setError(result.error ?? "Error al ascender.");
    }
  };

  if (!confirming) {
    return (
      <button
        type="button"
        onClick={() => setConfirming(true)}
        className="inline-flex items-center justify-center w-8 h-8 rounded-lg hover:bg-surface-container-high transition-colors"
        title={`Ascender a ${nextLabel}`}
      >
        <ArrowUp className="w-4 h-4 text-secondary" />
      </button>
    );
  }

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={`Confirmar ascenso de ${employeeName}`}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50"
    >
      <div className="bg-surface border border-outline-variant rounded-xl p-6 w-full max-w-md">
        <h3 className="text-lg font-semibold text-on-surface mb-2">
          Ascender a {employeeName}
        </h3>
        <p className="text-sm text-on-surface-variant mb-1">
          El empleado pasará de <strong>{currentLabel}</strong> a{" "}
          <strong>{nextLabel}</strong>.
        </p>
        <p className="text-sm text-on-surface-variant mb-4">
          El progreso hacia el siguiente nivel se medirá desde el inicio del
          nuevo nivel (la barra volverá a 0 %).
        </p>

        {error && (
          <p className="text-sm text-tertiary mb-4">{error}</p>
        )}

        <div className="flex justify-end gap-3">
          <button
            type="button"
            onClick={() => {
              setConfirming(false);
              setError(null);
            }}
            className="px-4 py-2 text-sm font-medium rounded-lg bg-[#27272a] hover:bg-[#323238] text-zinc-300 border border-[#3f3f46] transition-colors"
          >
            Cancelar
          </button>
          <button
            type="button"
            onClick={handleConfirm}
            disabled={pending}
            className="px-4 py-2 text-sm font-medium text-[#0a1b12] bg-[#00df81] rounded-lg hover:bg-[#00c873] transition-colors disabled:opacity-50"
          >
            {pending ? "Ascendiendo..." : "Ascender"}
          </button>
        </div>
      </div>
    </div>
  );
}
