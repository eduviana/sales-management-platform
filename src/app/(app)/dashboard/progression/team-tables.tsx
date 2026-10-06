import { Users } from "lucide-react";
import { formatCurrency, formatDate, formatLevelCode } from "@/shared/presentation/format";
import type {
  TeamHistoryEntry,
  TeamMember,
} from "@/modules/progression/presentation/progression-view-models";
import { HISTORY_STATUS } from "./progression-display";

interface TeamMembersTableProps {
  members: TeamMember[];
  readyForPromotion: number;
}

/** Team scope: per-member progression table. */
export function TeamMembersTable({
  members,
  readyForPromotion,
}: TeamMembersTableProps) {
  return (
    <section className="bg-surface-container border border-outline-variant rounded-2xl overflow-hidden">
      <div className="px-6 py-4 border-b border-outline-variant flex items-center justify-between">
        <h3 className="text-sm font-semibold text-on-surface flex items-center gap-2">
          <Users size={16} className="text-on-surface-variant" />
          Progresión por Miembro
        </h3>
        {readyForPromotion > 0 && (
          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[12px] font-semibold bg-[#00df81]/10 text-[#00df81] border border-[#00df81]/20">
            {readyForPromotion} listo{readyForPromotion !== 1 ? "s" : ""} para ascenso
          </span>
        )}
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-center border-collapse">
          <thead>
            <tr className="border-b border-outline-variant bg-surface-container-low text-xs font-semibold text-on-surface-variant uppercase tracking-wider">
              <th className="py-3.5 px-6" scope="col">Empleado</th>
              <th className="py-3.5 px-6" scope="col">Nivel</th>
              <th className="py-3.5 px-6" scope="col">Visitas asignadas</th>
              <th className="py-3.5 px-6" scope="col">Visitas completadas</th>
              <th className="py-3.5 px-6" scope="col">Visitas pendientes</th>
              <th className="py-3.5 px-6" scope="col">Progreso del objetivo</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-outline-variant/60 text-sm">
            {members.length === 0 ? (
              <tr>
                <td colSpan={6} className="py-8 text-center text-on-surface-variant">
                  No hay miembros activos en el equipo.
                </td>
              </tr>
            ) : (
              members.map((member) => {
                const levelCode = member.currentLevelId !== null
                  ? formatLevelCode(member.currentLevelId)
                  : "—";
                return (
                  <tr key={member.employeeId} className="hover:bg-surface-container-low transition-colors">
                    <td className="py-4 px-6 text-on-surface font-medium">
                      {member.firstName} {member.lastName}
                    </td>
                    <td className="py-4 px-6">
                      <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[12px] font-semibold bg-surface-container-high text-on-surface-variant border border-outline-variant">
                        {levelCode}
                      </span>
                    </td>
                    <td className="py-4 px-6 text-on-surface font-semibold">
                      {member.assignedVisits}
                    </td>
                    <td className="py-4 px-6 text-[#00df81] font-semibold">
                      {member.completedVisits}
                    </td>
                    <td className="py-4 px-6 font-semibold">
                      <span className={member.pendingVisits > 0 ? "text-amber-400" : "text-on-surface-variant"}>
                        {member.pendingVisits}
                      </span>
                    </td>
                    <td className="py-4 px-6">
                      <div className="flex items-center justify-center gap-2">
                        <div className="w-24 h-1.5 bg-surface-container-high rounded-full overflow-hidden">
                          <div
                            className="h-full bg-gradient-to-r from-primary to-sky-400 rounded-full transition-all duration-500"
                            style={{ width: `${member.objectiveProgress}%` }}
                          />
                        </div>
                        <span className="text-xs font-semibold text-on-surface min-w-[36px]">
                          {member.objectiveProgress}%
                        </span>
                      </div>
                      <div className="text-[11px] text-on-surface-variant mt-1">
                        {member.monthlySales} / {member.monthlyTarget} ventas
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </section>
  );
}

interface TeamHistoryTableProps {
  history: TeamHistoryEntry[];
  totalCount: number;
}

/** Team scope: detailed operational history for the selected period. */
export function TeamHistoryTable({ history, totalCount }: TeamHistoryTableProps) {
  return (
    <section className="bg-surface-container border border-outline-variant rounded-2xl overflow-hidden">
      <div className="px-6 py-4 border-b border-outline-variant">
        <h3 className="text-sm font-semibold text-on-surface">Historial Detallado del Período</h3>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-center border-collapse">
          <thead>
            <tr className="border-b border-outline-variant bg-surface-container-low text-xs font-semibold text-on-surface-variant uppercase tracking-wider">
              <th className="py-3.5 px-6" scope="col">Empleado</th>
              <th className="py-3.5 px-6" scope="col">Fecha</th>
              <th className="py-3.5 px-6" scope="col">Estado</th>
              <th className="py-3.5 px-6" scope="col">Cant. productos</th>
              <th className="py-3.5 px-6" scope="col">Total</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-outline-variant/60 text-sm">
            {history.length === 0 ? (
              <tr>
                <td colSpan={5} className="py-8 text-center text-on-surface-variant">
                  {totalCount === 0
                    ? "No hay actividad registrada."
                    : "No se encontraron registros para el período seleccionado."}
                </td>
              </tr>
            ) : (
              history.map((entry, idx) => {
                const estado = HISTORY_STATUS[entry.status];
                return (
                  <tr key={idx} className="hover:bg-surface-container-low transition-colors">
                    <td className="py-4 px-6 text-on-surface font-medium">
                      {entry.memberName}
                    </td>
                    <td className="py-4 px-6 text-on-surface-variant">
                      {formatDate(entry.date)}
                    </td>
                    <td className={`py-4 px-6 font-semibold ${estado.text}`}>
                      {estado.label}
                    </td>
                    <td className="py-4 px-6 text-center font-semibold text-on-surface">
                      {entry.productCount !== undefined ? entry.productCount : "—"}
                    </td>
                    <td className="py-4 px-6 text-on-surface-variant">
                      {entry.total !== undefined ? formatCurrency(entry.total) : "—"}
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {history.length > 0 && (
        <div className="px-6 py-4 bg-surface-container-low border-t border-outline-variant flex items-center justify-end text-sm">
          <div className="flex items-center gap-2">
            <span className="text-on-surface-variant">Actividad del período:</span>
            <span className="text-sm font-extrabold text-on-surface bg-surface-container-high px-2 py-0.5 rounded-full text-[12px] border border-outline-variant">
              {history.length} registro{history.length !== 1 ? "s" : ""}
            </span>
          </div>
        </div>
      )}
    </section>
  );
}
