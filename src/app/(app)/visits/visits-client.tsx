/**
 * VisitsClient — Client component for visits list.
 *
 * Reference: design/stitch/code.html
 */

"use client";

import type { Visit } from "@/modules/visits/domain";
import {
  VISIT_STATUS_COLORS,
  VISIT_STATUS_LABELS,
} from "@/modules/visits/presentation/visit-status";
import { formatDateOnly } from "@/shared/presentation/format";
import Link from "next/link";
import { ClipboardEdit, Eye } from "lucide-react";

interface VisitsClientProps {
  initialVisits: Visit[];
}

export function VisitsClient({ initialVisits }: VisitsClientProps) {
  if (initialVisits.length === 0) {
    return (
      <div className="bg-surface border border-outline-variant rounded-xl p-8 text-center">
        <p className="text-on-surface-variant">No hay visitas asignadas.</p>
      </div>
    );
  }

  return (
    <div className="bg-surface border border-outline-variant rounded-xl overflow-hidden">
      <table className="w-full border-collapse">
        <thead>
          <tr className="bg-surface-container-low border-b border-outline-variant">
            <th className="py-3 px-4 font-mono text-xs text-on-surface-variant uppercase tracking-wider text-center">
              Nro.
            </th>
            <th className="py-3 px-4 font-mono text-xs text-on-surface-variant uppercase tracking-wider text-center">
              Cliente
            </th>
            <th className="py-3 px-4 font-mono text-xs text-on-surface-variant uppercase tracking-wider text-center">
              Fecha Programada
            </th>
            <th className="py-3 px-4 font-mono text-xs text-on-surface-variant uppercase tracking-wider text-center">
              Estado
            </th>
            <th className="py-3 px-4 font-mono text-xs text-on-surface-variant uppercase tracking-wider text-center">
              Acción
            </th>
          </tr>
        </thead>
        <tbody className="text-on-surface-dim">
          {initialVisits.map((visit) => {
            const statusConfig = VISIT_STATUS_COLORS[visit.status];
            return (
              <tr key={visit.id} className="table-row">
                <td className="py-3 px-4 text-center font-mono-data">VS-{String(visit.visitNumber).padStart(4, "0")}</td>
                <td className="py-3 px-4 text-center">{visit.clientName ?? "Cliente sin nombre"}</td>
                <td className="py-3 px-4 text-center">
                  {formatDateOnly(visit.scheduledDate)}
                </td>
                <td className="py-3 px-4 text-center">
                  <span className={`${statusConfig.bg} ${statusConfig.text} border ${statusConfig.border} px-2 py-1 rounded-full text-xs font-semibold`}>
                    {VISIT_STATUS_LABELS[visit.status]}
                  </span>
                </td>
                <td className="py-3 px-4 text-center">
                  <div className="inline-flex items-center gap-2">
                    <Link
                      href={`/visits/${visit.id}`}
                      aria-label={`Ver visita VS-${String(visit.visitNumber).padStart(4, "0")}`}
                      title="Ver detalle"
                      className="inline-flex items-center justify-center w-10 h-10 rounded-md text-on-surface-variant hover:text-white hover:bg-[#1e1e22] transition-colors"
                    >
                      <Eye className="w-5 h-5" aria-hidden="true" />
                    </Link>
                    {visit.status === "assigned" && (
                      <Link
                        href={`/visits/${visit.id}/result`}
                        aria-label={`Registrar resultado de visita VS-${String(visit.visitNumber).padStart(4, "0")}`}
                        title="Registrar resultado"
                        className="inline-flex items-center justify-center w-10 h-10 rounded-md text-sky-400 hover:text-sky-300 hover:bg-[#1e1e22] transition-colors"
                      >
                        <ClipboardEdit className="w-5 h-5" aria-hidden="true" />
                      </Link>
                    )}
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
