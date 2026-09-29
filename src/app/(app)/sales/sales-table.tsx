"use client";

import { useState } from "react";
import Link from "next/link";
import { Eye } from "lucide-react";

interface Sale {
  id: string;
  saleNumber: number;
  saleDate: string;
  buyerName: string | null;
  totalAmount: number;
  status: string;
  sellerName?: string;
  commissionAmount?: number | null;
}

interface SalesTableProps {
  sales: Sale[];
  title?: string;
  showCreateAction?: boolean;
  /** Extra classes for the <h1> title. Used when embedding the table in another page. */
  titleClassName?: string;
  /** When true (default), renders the page header (title + create action). */
  showHeader?: boolean;
  /** When true (default), renders the search input. */
  showSearch?: boolean;
}

const STATUS_LABELS: Record<string, string> = {
  DRAFT: "Borrador",
  PENDING_REVIEW: "Pend. revisión",
  APPROVED: "Aprobada",
  REJECTED: "Rechazada",
  CANCELLED: "Cancelada",
};

const STATUS_BADGE: Record<string, string> = {
  DRAFT: "badge-neutral",
  PENDING_REVIEW: "badge-warning",
  APPROVED: "badge-success",
  REJECTED: "badge-error",
  CANCELLED: "badge-error",
};

export type { Sale as SalesTableSale };

export function SalesTable({
  sales,
  title = "Mis Ventas",
  showCreateAction = true,
  titleClassName = "text-2xl font-semibold text-on-surface mb-1",
  showHeader = true,
  showSearch = true,
}: SalesTableProps) {
  const [search, setSearch] = useState("");
  const hasSeller = sales.some((s) => s.sellerName);

  const filtered = sales.filter(
    (s) =>
      `VT-${String(s.saleNumber).padStart(4, "0")}`.toLowerCase().includes(search.toLowerCase()) ||
      (s.buyerName ?? "").toLowerCase().includes(search.toLowerCase()) ||
      (s.sellerName ?? "").toLowerCase().includes(search.toLowerCase()),
  );

  return (
    <>
      {/* Header */}
      {showHeader && (
        <div className="flex items-center justify-between">
          <h1 className={titleClassName}>{title}</h1>
          {showCreateAction && <Link
            href="/visits"
            className="px-4 py-2 text-sm font-medium text-[#0a1b12] bg-[#00df81] rounded-lg hover:bg-[#00c873] transition-colors"
          >
            Registrar visita
          </Link>}
        </div>
      )}

      {/* Search */}
      {showSearch && (
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
            placeholder={hasSeller ? "Buscar por número, vendedor..." : "Buscar por número..."}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-surface-container-low border border-outline-variant text-sm text-on-surface rounded-lg pl-9 pr-3 py-2 placeholder:text-on-surface-variant focus:outline-none focus:border-primary transition-colors"
          />
        </div>
      )}

      {/* Sales table */}
      <div className="surface rounded-xl overflow-hidden">
        <div className="overflow-x-auto w-full">
          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-surface-container-low border-b border-[#27272e]">
                <th className="py-3 px-4 text-xs text-on-surface-variant uppercase tracking-wider text-center">
                  Nro.
                </th>
                {sales.some((s) => s.sellerName) && (
                  <th className="py-3 px-4 text-xs text-on-surface-variant uppercase tracking-wider text-center">
                    Vendedor
                  </th>
                )}
                <th className="py-3 px-4 text-xs text-on-surface-variant uppercase tracking-wider text-center">
                  Total
                </th>
                <th className="py-3 px-4 text-xs text-on-surface-variant uppercase tracking-wider text-center">
                  Comisión
                </th>
                <th className="py-3 px-4 text-xs text-on-surface-variant uppercase tracking-wider text-center">
                  Estado
                </th>
                <th className="py-3 px-4 text-xs text-on-surface-variant uppercase tracking-wider text-center">
                  Fecha
                </th>
                <th className="py-3 px-4 text-xs text-on-surface-variant uppercase tracking-wider text-center">
                  Acciones
                </th>
              </tr>
            </thead>
            <tbody className="font-body-sm text-body-sm text-on-surface-dim">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-on-surface-variant">
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
                    {sale.sellerName !== undefined && (
                      <td className="py-3 px-4 text-center">
                        {sale.sellerName}
                      </td>
                    )}
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
                    <td className="py-3 px-4 text-center font-mono-data">
                      {new Date(sale.saleDate).toLocaleDateString("es-AR")}
                    </td>
                    <td className="py-3 px-4 text-center">
                      <Link
                        href={`/sales/${sale.id}`}
                        className="text-on-surface-variant hover:text-on-surface transition-colors"
                        title="Ver detalle"
                      >
                        <Eye className="w-5 h-5 inline" aria-hidden="true" />
                      </Link>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
}
