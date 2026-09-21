/**
 * EmployeesClient — Client Component for ADMIN employee management.
 *
 * Renders a searchable, filterable table of all employees with progression.
 *
 * Reference: requirements.md §3.12
 */

"use client";

import Link from "next/link";
import { useState } from "react";
import { Eye, Search } from "lucide-react";
import type { EmployeeRecord } from "@/modules/organization/domain/organization-repository";
import type { EmployeeProgressSummary } from "@/modules/progression/application/get-employee-progression-use-case";

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

interface EmployeesClientProps {
  employees: EmployeeRecord[];
  progressionMap: Record<string, EmployeeProgressSummary>;
}

export function EmployeesClient({ employees, progressionMap }: EmployeesClientProps) {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("ALL");

  const filtered = employees.filter((emp) => {
    const matchesSearch =
      search === "" ||
      emp.firstName.toLowerCase().includes(search.toLowerCase()) ||
      emp.lastName.toLowerCase().includes(search.toLowerCase()) ||
      emp.dni?.toLowerCase().includes(search.toLowerCase()) ||
      emp.email?.toLowerCase().includes(search.toLowerCase()) ||
      String(emp.employeeCode).includes(search);

    const matchesStatus =
      statusFilter === "ALL" || emp.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

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
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
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
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="bg-surface-container-low border border-outline-variant text-sm text-on-surface rounded-lg px-3 py-2 focus:outline-none focus:border-primary transition-colors"
        >
          <option value="ALL">Todos los estados</option>
          <option value="ACTIVE">Activos</option>
          <option value="INACTIVE">Inactivos</option>
        </select>
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
                <th className="py-3 px-4 text-xs text-on-surface-variant uppercase tracking-wider text-center">
                  Nivel
                </th>
                <th className="py-3 px-4 text-xs text-on-surface-variant uppercase tracking-wider text-center">
                  Progreso
                </th>
                <th className="py-3 px-4 text-xs text-on-surface-variant uppercase tracking-wider text-center">
                  Estado
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
                          <ProgressBar percentage={progress.percentage} points={progress.currentPoints} />
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
                        <Link
                          href={`/employees/${emp.id}`}
                          className="inline-flex items-center justify-center w-8 h-8 rounded-lg hover:bg-surface-container-high transition-colors"
                          title="Ver detalle"
                        >
                          <Eye className="w-4 h-4 text-on-surface-variant" />
                        </Link>
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

function ProgressBar({ percentage, points }: { percentage: number; points: number }) {
  return (
    <div className="flex items-center gap-2 min-w-[120px]">
      <div className="flex-1 h-2 bg-surface-container-low rounded-full overflow-hidden">
        <div
          className="h-full bg-[#00df81] rounded-full transition-all duration-500"
          style={{ width: `${percentage}%` }}
        />
      </div>
      <span className="text-xs text-on-surface-variant whitespace-nowrap">
        {points}pts
      </span>
    </div>
  );
}
