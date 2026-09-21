/**
 * TeamClient — Client component for team members list.
 *
 * Reference: design/stitch/code.html
 */

"use client";

import type { TeamMember } from "@/modules/visits/application/get-team-list-use-case";

interface TeamClientProps {
  initialTeam: TeamMember[];
}

export function TeamClient({ initialTeam }: TeamClientProps) {
  if (initialTeam.length === 0) {
    return (
      <div className="bg-surface border border-outline-variant rounded-xl p-8 text-center">
        <p className="text-on-surface-variant">No hay miembros en el equipo.</p>
      </div>
    );
  }

  return (
    <div className="bg-surface border border-outline-variant rounded-xl overflow-hidden">
      <table className="w-full border-collapse">
        <thead>
          <tr className="bg-surface-container-low border-b border-outline-variant">
            <th className="py-3 px-4 font-mono text-xs text-on-surface-variant uppercase tracking-wider text-center">
              Nombre
            </th>
            <th className="py-3 px-4 font-mono text-xs text-on-surface-variant uppercase tracking-wider text-center">
              Nivel
            </th>
            <th className="py-3 px-4 font-mono text-xs text-on-surface-variant uppercase tracking-wider text-center">
              Estado
            </th>
          </tr>
        </thead>
        <tbody className="text-on-surface-dim">
          {initialTeam.map((member) => (
            <tr key={member.id} className="table-row">
              <td className="py-3 px-4 text-center font-medium">
                {member.firstName} {member.lastName}
              </td>
              <td className="py-3 px-4 text-center">
                <span className="badge badge-neutral">
                  {member.currentLevelId ? `N${member.currentLevelId}` : "—"}
                </span>
              </td>
              <td className="py-3 px-4 text-center">
                <span className={member.status === "ACTIVE" ? "badge badge-success" : "badge badge-neutral"}>
                  {member.status === "ACTIVE" ? "Activo" : "Inactivo"}
                </span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
