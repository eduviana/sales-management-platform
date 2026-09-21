/**
 * TeamMembersList — Shows subordinates and allows reassignment.
 *
 * Used in employee detail page for N3+ employees.
 *
 * Reference: requirements.md §3.12.3
 */

import type { EmployeeRecord } from "@/modules/organization/domain/organization-repository";
import { ReassignButton } from "./reassign-button";

interface TeamMembersListProps {
  employeeId: string;
  employeeName: string;
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

export function TeamMembersList({
  employeeId,
  employeeName,
  subordinates,
  allEmployees,
}: TeamMembersListProps) {
  // Filter potential new supervisors (N3+ and not the employee themselves, not inactive)
  const potentialSupervisors = allEmployees.filter(
    (e) => e.id !== employeeId && e.currentLevelId !== null && e.currentLevelId >= 3 && e.status === "ACTIVE",
  );

  return (
    <section className="bg-surface border border-outline-variant rounded-xl p-6">
      <h2 className="text-sm font-semibold text-on-surface-variant uppercase tracking-wider mb-4">
        Equipo de {employeeName}
      </h2>

      {subordinates.length === 0 ? (
        <p className="text-on-surface-variant text-sm">
          Este empleado no tiene subordinados directos.
        </p>
      ) : (
        <div className="space-y-3">
          {subordinates.map((sub) => (
            <div
              key={sub.id}
              className="flex items-center justify-between p-3 bg-surface-container-low rounded-lg"
            >
              <div>
                <div className="text-sm font-medium text-on-surface">
                  {sub.firstName} {sub.lastName}
                </div>
                <div className="text-xs text-on-surface-variant">
                  {sub.currentLevelId ? LEVEL_LABELS[sub.currentLevelId] ?? `N${sub.currentLevelId}` : "—"}
                  {" · "}
                  {sub.status === "ACTIVE" ? "Activo" : "Inactivo"}
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
    </section>
  );
}
