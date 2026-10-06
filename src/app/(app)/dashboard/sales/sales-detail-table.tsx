/**
 * SalesDetailTable — Shared table for dashboard sales drill-down.
 *
 * Displays sales with search and sort functionality.
 * Used by /dashboard/sales/all and /dashboard/sales/month.
 *
 * Reference: design/stitch/code.html, requirements.md §3.2
 */

"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { ArrowUpDown, ArrowUp, ArrowDown, ChevronLeft } from "lucide-react";
import { formatDate } from "@/shared/presentation/format";
import {
  SALE_STATUS_BADGE as STATUS_BADGE,
  SALE_STATUS_LABELS as STATUS_LABELS,
} from "@/modules/sales/presentation/sale-status";

interface SaleRow {
  id: string;
  saleNumber: number;
  saleDate: string;
  buyerName: string | null;
  totalAmount: number;
  status: string;
  commissionAmount: number | null;
}

interface SalesDetailTableProps {
  sales: SaleRow[];
  title: string;
  subtitle?: string;
}

type SortField = "saleDate" | "totalAmount" | "saleNumber";
type SortDirection = "asc" | "desc";

function SortIcon({ field, sortField, sortDir }: { field: SortField; sortField: SortField; sortDir: SortDirection }) {
  if (sortField !== field) return <ArrowUpDown size={14} className="text-on-surface-variant" />;
  return sortDir === "asc"
    ? <ArrowUp size={14} className="text-primary" />
    : <ArrowDown size={14} className="text-primary" />;
}

export function SalesDetailTable({ sales, title, subtitle }: SalesDetailTableProps) {
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
    const result = sales.filter(
      (s) =>
        `VT-${String(s.saleNumber).padStart(4, "0")}`.toLowerCase().includes(search.toLowerCase()) ||
        (s.buyerName ?? "").toLowerCase().includes(search.toLowerCase()),
    );

    result.sort((a, b) => {
      let cmp = 0;
      if (sortField === "saleDate") {
        cmp = new Date(a.saleDate).getTime() - new Date(b.saleDate).getTime();
      } else if (sortField === "totalAmount") {
        cmp = a.totalAmount - b.totalAmount;
      } else if (sortField === "saleNumber") {
        cmp = a.saleNumber - b.saleNumber;
      }
      return sortDir === "asc" ? cmp : -cmp;
    });

    return result;
  }, [sales, search, sortField, sortDir]);

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
        {subtitle && <p className="text-on-surface-variant">{subtitle}</p>}
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
          placeholder="Buscar por número o cliente..."
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
                  Nro.
                </th>
                <th
                  className="py-3 px-4 font-mono text-xs text-on-surface-variant uppercase tracking-wider text-center cursor-pointer select-none"
                  onClick={() => handleSort("saleDate")}
                >
                  <span className="inline-flex items-center gap-1">
                    Fecha <SortIcon field="saleDate" sortField={sortField} sortDir={sortDir} />
                  </span>
                </th>
                <th className="py-3 px-4 font-mono text-xs text-on-surface-variant uppercase tracking-wider text-center">
                  Cliente
                </th>
                <th
                  className="py-3 px-4 font-mono text-xs text-on-surface-variant uppercase tracking-wider text-center cursor-pointer select-none"
                  onClick={() => handleSort("totalAmount")}
                >
                  <span className="inline-flex items-center gap-1">
                    Total <SortIcon field="totalAmount" sortField={sortField} sortDir={sortDir} />
                  </span>
                </th>
                <th className="py-3 px-4 font-mono text-xs text-on-surface-variant uppercase tracking-wider text-center">
                  Comisión
                </th>
                <th className="py-3 px-4 font-mono text-xs text-on-surface-variant uppercase tracking-wider text-center">
                  Estado
                </th>
              </tr>
            </thead>
            <tbody className="text-on-surface-dim">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-on-surface-variant">
                    {sales.length === 0
                      ? "No hay ventas para mostrar."
                      : "No se encontraron ventas."}
                  </td>
                </tr>
              ) : (
                filtered.map((sale) => (
                  <tr key={sale.id} className="table-row">
                    <td className="py-3 px-4 text-center font-mono-data text-on-surface-variant">
                      VT-{String(sale.saleNumber).padStart(4, "0")}
                    </td>
                    <td className="py-3 px-4 text-center font-mono-data">
                      {formatDate(sale.saleDate)}
                    </td>
                    <td className="py-3 px-4 text-center">
                      {sale.buyerName ?? "—"}
                    </td>
                    <td className="py-3 px-4 text-center font-mono-data font-semibold">
                      ${sale.totalAmount.toFixed(2)}
                    </td>
                    <td className="py-3 px-4 text-center font-mono-data">
                      {sale.commissionAmount != null ? (
                        <span className={sale.commissionAmount >= 0 ? "text-emerald-400" : "text-rose-400"}>
                          ${Math.abs(sale.commissionAmount).toFixed(2)}
                        </span>
                      ) : "—"}
                    </td>
                    <td className="py-3 px-4 text-center">
                      <span className={`badge ${STATUS_BADGE[sale.status] ?? "badge-neutral"}`}>
                        {STATUS_LABELS[sale.status] ?? sale.status}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
