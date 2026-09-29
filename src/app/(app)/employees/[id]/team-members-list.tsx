/**
 * TeamMembersList — Shows subordinates and allows reassignment.
 *
 * Used in employee detail page for N3+ employees.
 *
 * Visual reference: design/stitch/DESIGN.md
 * Reference: requirements.md §3.12.3
 */

import { Users } from "lucide-react";
import type { EmployeeRecord } from "@/modules/organization/domain/organization-repository";
import { ReassignButton } from "./reassign-button";

interface TeamMembersListProps {
  className?: string;
  employeeId: string;
  subordinates: EmployeeRecord[];
  allEmployees: EmployeeRecord[];
}

const LEVEL_LABELS: Record<number, string> = {
  1: "N1",
  2: "N2",
  3: "N3",
  4: "N4",
  5: "N5",
  6: "N6",
  7: "N7",
};

function initials(firstName: string, lastName: string): string {
  return `${firstName[0] ?? ""}${lastName[0] ?? ""}`.toUpperCase();
}

export function TeamMembersList({
  className = "",
  employeeId,
  subordinates,
  allEmployees,
}: TeamMembersListProps) {
  // Filter potential new supervisors (N3+ and not the employee themselves, not inactive)
  const potentialSupervisors = allEmployees.filter(
    (e) => e.id !== employeeId && e.currentLevelId !== null && e.currentLevelId >= 3 && e.status === "ACTIVE",
  );

  return (
    <section className={`bg-surface-container border border-outline-variant rounded-2xl overflow-hidden shadow-sm ${className}`}>
      <div className="px-5 py-4 border-b border-outline-variant flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="p-1.5 rounded-md bg-zinc-800 text-zinc-300">
            <Users className="w-4 h-4" aria-hidden="true" />
          </div>
          <h2 className="text-xs font-bold text-on-surface uppercase tracking-wider">
            Equipo a Cargo
          </h2>
        </div>
        <span className="text-[10px] font-semibold text-on-surface-variant bg-surface-container-low px-2 py-0.5 rounded">
          {subordinates.length} {subordinates.length === 1 ? "Integrante" : "Integrantes"}
        </span>
      </div>

      <div className="p-5">
        {subordinates.length === 0 ? (
          <p className="text-on-surface-variant text-sm">
            Este empleado no tiene subordinados directos.
          </p>
        ) : (
          <div className="space-y-3">
            {subordinates.map((sub) => (
              <div
                key={sub.id}
                className="flex items-center justify-between p-3 rounded-lg bg-surface-container-low border border-outline-variant"
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-surface-container-high border border-outline-variant flex items-center justify-center font-bold text-xs text-on-surface shrink-0">
                    {initials(sub.firstName, sub.lastName)}
                  </div>
                  <div>
                    <div className="text-xs font-bold text-on-surface">
                      {sub.firstName} {sub.lastName}
                    </div>
                    <div className="text-[10px] text-on-surface-variant flex items-center gap-1.5">
                      <span className="font-mono text-on-surface font-semibold">
                        {sub.currentLevelId ? LEVEL_LABELS[sub.currentLevelId] ?? `N${sub.currentLevelId}` : "—"}
                      </span>
                      <span className="text-on-surface-variant">•</span>
                      <span className={sub.status === "ACTIVE" ? "text-secondary" : "text-tertiary"}>
                        {sub.status === "ACTIVE" ? "Activo" : "Inactivo"}
                      </span>
                    </div>
                  </div>
                </div>
                <ReassignButton
                  employeeId={sub.id}
                  employeeName={`${sub.firstName} ${sub.lastName}`}
                  potentialSupervisors={potentialSupervisors}
                />
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}