/**
 * EmployeesClient — Client Component for ADMIN employee management.
 *
 * Keeps the search/filter/sort state and renders the header, filter controls
 * and <EmployeesTable>. The table, its sort indicators and the promotion
 * action live in their own files.
 *
 * Reference: requirements.md §3.12
 */

"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import type { ReactNode } from "react";
import { Search } from "lucide-react";
import type { EmployeeRecord } from "@/modules/organization/domain/organization-repository";
import type { EmployeeProgressSummary } from "@/modules/progression/application/get-employee-progression-use-case";
import { formatLevelCode } from "@/shared/presentation/format";
import {
  EmployeesTable,
  type EmployeeSortField,
  type SortDirection,
} from "./employees-table";

interface EmployeesClientProps {
  employees: EmployeeRecord[];
  progressionMap: Record<string, EmployeeProgressSummary>;
}

export function EmployeesClient({ employees, progressionMap }: EmployeesClientProps) {
  const [search, setSearch] = useState("");
  const [levelFilter, setLevelFilter] = useState<string>("ALL");
  const [hideInactive, setHideInactive] = useState(true);
  const [showPromotable, setShowPromotable] = useState(false);
  const [sortField, setSortField] = useState<EmployeeSortField | null>(null);
  const [sortDir, setSortDir] = useState<SortDirection>("asc");

  const handleSort = (field: EmployeeSortField) => {
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
              {formatLevelCode(level)}
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
      <EmployeesTable
        employees={filtered}
        progressionMap={progressionMap}
        sortField={sortField}
        sortDir={sortDir}
        onSort={handleSort}
      />
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
