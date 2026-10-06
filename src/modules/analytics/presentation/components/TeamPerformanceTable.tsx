/**
 * TeamPerformanceTable — Data table for team performance.
 *
 * Displays per-employee metrics with target status badges.
 * Each row has a "Ver más" link to the employee detail page.
 *
 * Reference: design/stitch/code.html
 */

import Link from "next/link";
import { CheckCircle, AlertTriangle, Eye } from "lucide-react";
import { formatCurrency } from "@/shared/presentation/format";
import type { TeamPerformanceRow } from "../../domain";

interface TeamPerformanceTableProps {
  data: TeamPerformanceRow[];
}

const STATUS_CONFIG = {
  exceeding: {
    label: "Superando",
    bg: "bg-secondary/10",
    text: "text-secondary",
    border: "border-secondary/20",
    Icon: CheckCircle,
  },
  on_track: {
    label: "En marcha",
    bg: "bg-primary/10",
    text: "text-primary",
    border: "border-primary/20",
    Icon: CheckCircle,
  },
  at_risk: {
    label: "En riesgo",
    bg: "bg-tertiary/10",
    text: "text-tertiary",
    border: "border-tertiary/20",
    Icon: AlertTriangle,
  },
} as const;

export function TeamPerformanceTable({ data }: TeamPerformanceTableProps) {
  if (data.length === 0) {
    return (
      <div className="p-4 text-center text-on-surface-variant text-sm">
        No hay miembros en el equipo para mostrar.
      </div>
    );
  }

  return (
    <div className="overflow-x-auto w-full">
      <table className="w-full border-collapse">
        <thead>
          <tr className="bg-surface-container-low border-b border-[#27272e]">
            <th className="py-3 px-4 text-xs text-on-surface-variant uppercase tracking-wider text-center">
              ID
            </th>
            <th className="py-3 px-4 text-xs text-on-surface-variant uppercase tracking-wider text-center">
              Vendedor
            </th>
            <th className="py-3 px-4 text-xs text-on-surface-variant uppercase tracking-wider text-center">
              Nivel
            </th>
            <th className="py-3 px-4 text-xs text-on-surface-variant uppercase tracking-wider text-center">
              Visitas
            </th>
            <th className="py-3 px-4 text-xs text-on-surface-variant uppercase tracking-wider text-center">
              Ventas
            </th>
            <th className="py-3 px-4 text-xs text-on-surface-variant uppercase tracking-wider text-center">
              Volumen de Ventas ($)
            </th>
            <th className="py-3 px-4 text-xs text-on-surface-variant uppercase tracking-wider text-center">
              Estado de Objetivo
            </th>
            <th className="py-3 px-4 text-xs text-on-surface-variant uppercase tracking-wider text-center">
              Acciones
            </th>
          </tr>
        </thead>
        <tbody className="text-on-surface-dim">
          {data.map((row) => {
            const status = STATUS_CONFIG[row.targetStatus];
            return (
              <tr key={row.employeeId} className="table-row">
                <td className="py-3 px-4 text-center text-sm text-on-surface-variant">
                  {row.employeeCode}
                </td>
                <td className="py-3 px-4 text-center font-medium">
                  {row.firstName} {row.lastName}
                </td>
                <td className="py-3 px-4 text-center">
                  <span className="badge badge-neutral">{row.levelCode}</span>
                </td>
                <td className="py-3 px-4 text-center">{row.visitCount}</td>
                <td className="py-3 px-4 text-center">{row.saleCount}</td>
                <td className="py-3 px-4 text-center">
                  {formatCurrency(row.totalAmount)}
                </td>
                <td className="py-3 px-4 text-center">
                  <span className={`${status.bg} ${status.text} border ${status.border} px-2 py-1 rounded-full text-xs font-semibold inline-flex items-center gap-1`}>
                    <status.Icon size={14} strokeWidth={2} />
                    {status.label}
                  </span>
                </td>
                <td className="py-3 px-4 text-center">
                  <Link
                    href={`/team/${row.employeeId}`}
                    className="text-on-surface-variant hover:text-on-surface transition-colors"
                    title="Ver detalle"
                  >
                    <Eye className="w-5 h-5 inline" aria-hidden="true" />
                  </Link>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
