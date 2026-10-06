/**
 * CommissionsClient — Client component for commissions detail view.
 *
 * Displays commission entries with search and sort.
 *
 * Reference: design/stitch/code.html, requirements.md §3.2
 */

"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { ChevronLeft, ArrowUpDown, ArrowUp, ArrowDown } from "lucide-react";
import { formatDate } from "@/shared/presentation/format";

interface CommissionEntry {
  id: string;
  saleNumber: number;
  saleDate: string;
  baseAmount: number;
  percentage: number;
  amount: number;
  employeeName?: string;
}

interface CommissionsClientProps {
  entries: CommissionEntry[];
  totalCommissions: number;
  title: string;
  subtitle: string;
  showEmployee?: boolean;
}

type SortField = "saleDate" | "baseAmount" | "amount" | "percentage";
type SortDirection = "asc" | "desc";

function SortIcon({ field, sortField, sortDir }: { field: SortField; sortField: SortField; sortDir: SortDirection }) {
  if (sortField !== field) return <ArrowUpDown size={14} className="text-on-surface-variant" />;
  return sortDir === "asc"
    ? <ArrowUp size={14} className="text-primary" />
    : <ArrowDown size={14} className="text-primary" />;
}

export function CommissionsClient({
  entries,
  totalCommissions,
  title,
  subtitle,
  showEmployee = false,
}: CommissionsClientProps) {
  const [search, setSearch] = useState("");
  const [sortField, setSortField] = useState<SortField>("saleDate");
  const [sortDir, setSortDir] = useState<SortDirection>("desc");

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDir(sortDir === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortDir(field === "saleDate" ? "desc" : "desc");
    }
  };

  const filtered = useMemo(() => {
    const result = entries.filter(
      (e) =>
        `VT-${String(e.saleNumber).padStart(4, "0")}`.toLowerCase().includes(search.toLowerCase()),
    );

    result.sort((a, b) => {
      let cmp = 0;
      if (sortField === "saleDate") {
        cmp = new Date(a.saleDate).getTime() - new Date(b.saleDate).getTime();
      } else if (sortField === "baseAmount") {
        cmp = a.baseAmount - b.baseAmount;
      } else if (sortField === "amount") {
        cmp = a.amount - b.amount;
      } else if (sortField === "percentage") {
        cmp = a.percentage - b.percentage;
      }
      return sortDir === "asc" ? cmp : -cmp;
    });

    return result;
  }, [entries, search, sortField, sortDir]);

  return (
    <div className="space-y-6">
      {/* Back link */}
      <Link
        href="/dashboard"
        className="inline-flex items-center gap-1 text-sm text-sky-400 hover:text-sky-300 transition-colors"
      >
        <ChevronLeft size={16} />
        Volver al panel
      </Link>

      {/* Header */}
      <header>
        <h1 className="text-2xl font-semibold text-on-surface mb-1">{title}</h1>
        <p className="text-on-surface-variant">{subtitle}</p>
      </header>

      {/* Search */}
      <div className="relative max-w-sm">
        <svg
          className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-on-surface-variant pointer-events-none"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
          />
        </svg>
        <input
          type="text"
          placeholder="Buscar por número de venta..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full bg-surface-container-low border border-outline-variant text-sm text-on-surface rounded-lg pl-9 pr-3 py-2 placeholder:text-on-surface-variant focus:outline-none focus:border-primary transition-colors"
        />
      </div>

      {/* Table */}
      <div className="bg-surface border border-outline-variant rounded-xl overflow-hidden">
        <div className="overflow-x-auto w-full">
          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-surface-container-low border-b border-outline-variant">
                <th className="py-3 px-4 font-mono text-xs text-on-surface-variant uppercase tracking-wider text-center">
                  Venta
                </th>
                {showEmployee && (
                  <th className="py-3 px-4 font-mono text-xs text-on-surface-variant uppercase tracking-wider text-center">
                    Empleado
                  </th>
                )}
                <th
                  className="py-3 px-4 font-mono text-xs text-on-surface-variant uppercase tracking-wider text-center cursor-pointer select-none"
                  onClick={() => handleSort("saleDate")}
                >
                  <span className="inline-flex items-center gap-1">
                    Fecha <SortIcon field="saleDate" sortField={sortField} sortDir={sortDir} />
                  </span>
                </th>
                <th
                  className="py-3 px-4 font-mono text-xs text-on-surface-variant uppercase tracking-wider text-center cursor-pointer select-none"
                  onClick={() => handleSort("baseAmount")}
                >
                  <span className="inline-flex items-center gap-1">
                    Monto Venta <SortIcon field="baseAmount" sortField={sortField} sortDir={sortDir} />
                  </span>
                </th>
                <th
                  className="py-3 px-4 font-mono text-xs text-on-surface-variant uppercase tracking-wider text-center cursor-pointer select-none"
                  onClick={() => handleSort("percentage")}
                >
                  <span className="inline-flex items-center gap-1">
                    % Comisión <SortIcon field="percentage" sortField={sortField} sortDir={sortDir} />
                  </span>
                </th>
                <th
                  className="py-3 px-4 font-mono text-xs text-on-surface-variant uppercase tracking-wider text-center cursor-pointer select-none"
                  onClick={() => handleSort("amount")}
                >
                  <span className="inline-flex items-center gap-1">
                    Comisión <SortIcon field="amount" sortField={sortField} sortDir={sortDir} />
                  </span>
                </th>
              </tr>
            </thead>
            <tbody className="text-on-surface-dim">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={showEmployee ? 6 : 5} className="py-8 text-center text-on-surface-variant">
                    {entries.length === 0
                      ? "No hay comisiones generadas en este período."
                      : "No se encontraron comisiones."}
                  </td>
                </tr>
              ) : (
                filtered.map((entry) => (
                  <tr key={entry.id} className="table-row">
                    <td className="py-3 px-4 text-center font-mono-data text-on-surface-variant">
                      VT-{String(entry.saleNumber).padStart(4, "0")}
                    </td>
                    {showEmployee && (
                      <td className="py-3 px-4 text-center">
                        {entry.employeeName ?? "—"}
                      </td>
                    )}
                    <td className="py-3 px-4 text-center font-mono-data">
                      {formatDate(entry.saleDate)}
                    </td>
                    <td className="py-3 px-4 text-center font-mono-data">
                      ${entry.baseAmount.toFixed(2)}
                    </td>
                    <td className="py-3 px-4 text-center font-mono-data">
                      {entry.percentage.toFixed(1)}%
                    </td>
                    <td className="py-3 px-4 text-center font-mono-data font-semibold text-emerald-400">
                      ${entry.amount.toFixed(2)}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Total row */}
        {entries.length > 0 && (
          <div className="bg-surface-container-low border-t border-outline-variant px-4 py-3 flex justify-end">
            <span className="text-sm text-on-surface-variant">
              Total:{" "}
              <span className="font-mono-data font-semibold text-secondary">
                ${totalCommissions.toFixed(2)}
              </span>
            </span>
          </div>
        )}
      </div>
    </div>
  );
}
