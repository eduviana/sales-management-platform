import { formatDate } from "@/shared/presentation/format";
import type { ProgressionEntry } from "@/modules/progression/presentation/progression-view-models";
import { TYPE_CONFIG } from "./progression-display";

interface PersonalHistoryTableProps {
  entries: ProgressionEntry[];
  totalEntries: number;
  filteredTotal: number;
}

/** Personal scope: detailed progression history for the selected period. */
export function PersonalHistoryTable({
  entries,
  totalEntries,
  filteredTotal,
}: PersonalHistoryTableProps) {
  return (
    <section className="bg-surface-container border border-outline-variant rounded-2xl overflow-hidden">
      {/* Table header */}
      <div className="px-6 py-4 border-b border-outline-variant">
        <h3 className="text-sm font-semibold text-on-surface">Historial Detallado del Período</h3>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-center border-collapse">
          <thead>
            <tr className="border-b border-outline-variant bg-surface-container-low text-xs font-semibold text-on-surface-variant uppercase tracking-wider">
              <th className="py-3.5 px-6" scope="col">Fecha</th>
              <th className="py-3.5 px-6" scope="col">Tipo</th>
              <th className="py-3.5 px-6" scope="col">Descripción</th>
              <th className="py-3.5 px-6" scope="col">Puntos</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-outline-variant/60 text-sm">
            {entries.length === 0 ? (
              <tr>
                <td colSpan={4} className="py-8 text-center text-on-surface-variant">
                  {totalEntries === 0
                    ? "No hay registros de progreso."
                    : "No se encontraron registros para el período seleccionado."}
                </td>
              </tr>
            ) : (
              entries.map((entry, idx) => {
                const config = TYPE_CONFIG[entry.type];
                return (
                  <tr key={idx} className="hover:bg-surface-container-low transition-colors">
                    <td className="py-4 px-6 text-on-surface font-medium">
                      {formatDate(entry.date)}
                    </td>
                    <td className="py-4 px-6">
                      <span
                        className={`inline-flex items-center px-2 py-0.5 rounded-full text-[12px] font-semibold ${config.bg} ${config.text} border ${config.border}`}
                      >
                        {config.label}
                      </span>
                    </td>
                    <td className="py-4 px-6 text-on-surface-variant">
                      {entry.description}
                    </td>
                    <td className="py-4 px-6 font-bold text-sm text-[#00df81]">
                      +{entry.points}
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Table footer */}
      {entries.length > 0 && (
        <div className="px-6 py-4 bg-surface-container-low border-t border-outline-variant flex items-center justify-end text-sm">
          <div className="flex items-center gap-2">
            <span className="text-on-surface-variant">Total acumulado:</span>
            <span className="text-sm font-extrabold text-[#00df81] bg-[#00df81]/10 px-2 py-0.5 rounded-full text-[12px] border border-[#00df81]/25">
              +{filteredTotal} pts
            </span>
          </div>
        </div>
      )}
    </section>
  );
}
