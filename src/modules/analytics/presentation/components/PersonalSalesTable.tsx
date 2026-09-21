/**
 * PersonalSalesTable — Data table for personal sales history (N1/N2).
 *
 * Displays the user's own sales with date, client, amount, and status.
 * Follows the Stitch design system, same visual style as TeamPerformanceTable.
 *
 * Reference: design/stitch/code.html
 */

import { CheckCircle, XCircle, Clock, Ban } from "lucide-react";
import type { PersonalSalesRow, SaleStatusDisplay } from "../../domain";

interface PersonalSalesTableProps {
  data: PersonalSalesRow[];
}

const STATUS_CONFIG: Record<SaleStatusDisplay, {
  label: string;
  bg: string;
  text: string;
  border: string;
  Icon: typeof CheckCircle;
}> = {
  APPROVED: {
    label: "Aprobada",
    bg: "bg-secondary/10",
    text: "text-secondary",
    border: "border-secondary/20",
    Icon: CheckCircle,
  },
  PENDING_REVIEW: {
    label: "Pendiente",
    bg: "bg-primary/10",
    text: "text-primary",
    border: "border-primary/20",
    Icon: Clock,
  },
  REJECTED: {
    label: "Rechazada",
    bg: "bg-tertiary/10",
    text: "text-tertiary",
    border: "border-tertiary/20",
    Icon: XCircle,
  },
  CANCELLED: {
    label: "Cancelada",
    bg: "bg-outline/10",
    text: "text-outline",
    border: "border-outline/20",
    Icon: Ban,
  },
} as const;

function formatSaleDate(isoDate: string): string {
  const [year, month, day] = isoDate.split("-");
  return `${day}/${month}/${year}`;
}

export function PersonalSalesTable({ data }: PersonalSalesTableProps) {
  if (data.length === 0) {
    return (
      <div className="p-4 text-center text-on-surface-variant text-sm">
        No hay ventas registradas en este período.
      </div>
    );
  }

  return (
    <div className="overflow-x-auto w-full">
      <table className="w-full border-collapse">
        <thead>
          <tr className="bg-surface-container-low border-b border-outline-variant">
            <th className="py-3 px-4 font-mono text-xs text-on-surface-variant uppercase tracking-wider text-center">
              Fecha
            </th>
            <th className="py-3 px-4 font-mono text-xs text-on-surface-variant uppercase tracking-wider text-center">
              Cliente
            </th>
            <th className="py-3 px-4 font-mono text-xs text-on-surface-variant uppercase tracking-wider text-center">
              Monto
            </th>
            <th className="py-3 px-4 font-mono text-xs text-on-surface-variant uppercase tracking-wider text-center">
              Estado
            </th>
          </tr>
        </thead>
        <tbody className="text-on-surface-dim">
          {data.map((row) => {
            const status = STATUS_CONFIG[row.status];
            return (
              <tr key={row.saleId} className="table-row">
                <td className="py-3 px-4 text-center font-mono-data text-on-surface-variant">
                  {formatSaleDate(row.saleDate)}
                </td>
                <td className="py-3 px-4 text-center font-medium">
                  {row.buyerName}
                </td>
                <td className="py-3 px-4 text-center font-mono-data">
                  ${row.totalAmount.toLocaleString("es-AR")}
                </td>
                <td className="py-3 px-4 text-center">
                  <span className={`${status.bg} ${status.text} border ${status.border} px-2 py-1 rounded-full text-xs font-semibold inline-flex items-center gap-1`}>
                    <status.Icon size={14} strokeWidth={2} />
                    {status.label}
                  </span>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
