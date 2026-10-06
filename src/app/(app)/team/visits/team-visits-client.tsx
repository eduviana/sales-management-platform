"use client";

import Link from "next/link";
import { Eye } from "lucide-react";
import type { Visit } from "@/modules/visits/domain";
import {
  VISIT_STATUS_COLORS,
  VISIT_STATUS_LABELS,
} from "@/modules/visits/presentation/visit-status";
import { formatDateOnly } from "@/shared/presentation/format";

export function TeamVisitsClient({ visits }: { visits: readonly Visit[] }) {
  return (
    <div className="bg-surface border border-[#27272e] rounded-xl overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full border-collapse">
          <thead>
            <tr className="bg-surface-container-low border-b border-[#27272e]">
              <th className="py-3 px-4 text-xs text-on-surface-variant uppercase tracking-wider text-center">Nro.</th>
              <th className="py-3 px-4 text-xs text-on-surface-variant uppercase tracking-wider text-center">Vendedor</th>
              <th className="py-3 px-4 text-xs text-on-surface-variant uppercase tracking-wider text-center">Cliente</th>
              <th className="py-3 px-4 text-xs text-on-surface-variant uppercase tracking-wider text-center">Fecha</th>
              <th className="py-3 px-4 text-xs text-on-surface-variant uppercase tracking-wider text-center">Estado</th>
              <th className="py-3 px-4 text-xs text-on-surface-variant uppercase tracking-wider text-center">Acción</th>
            </tr>
          </thead>
          <tbody className="text-on-surface-dim">
            {visits.length === 0 ? (
              <tr><td colSpan={6} className="py-8 text-center text-on-surface-variant">No hay visitas asignadas al equipo.</td></tr>
            ) : visits.map((visit) => {
              const color = VISIT_STATUS_COLORS[visit.status];
              return (
                <tr key={visit.id} className="table-row">
                  <td className="py-3 px-4 text-center font-mono-data">VS-{String(visit.visitNumber).padStart(4, "0")}</td>
                  <td className="py-3 px-4 text-center">{visit.sellerName ?? "—"}</td>
                  <td className="py-3 px-4 text-center">{visit.clientName ?? "Cliente sin nombre"}</td>
                  <td className="py-3 px-4 text-center font-mono-data">{formatDateOnly(visit.scheduledDate)}</td>
                  <td className="py-3 px-4 text-center"><span className={`${color.bg} ${color.text} border ${color.border} px-2 py-1 rounded-full text-xs font-semibold`}>{VISIT_STATUS_LABELS[visit.status]}</span></td>
                  <td className="py-3 px-4 text-center"><Link href={`/visits/${visit.id}`} aria-label="Ver detalle" title="Ver detalle" className="inline-flex items-center justify-center w-10 h-10 rounded-md text-on-surface-variant hover:text-white hover:bg-[#1e1e22] transition-colors"><Eye className="w-5 h-5" aria-hidden="true" /></Link></td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
