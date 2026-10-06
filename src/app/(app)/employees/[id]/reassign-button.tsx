/**
 * ReassignButton — Allows reassigning an employee to a different supervisor.
 *
 * Shows a dropdown with potential supervisors and a confirm button.
 *
 * Reference: requirements.md §3.12.3
 */

"use client";

import { useActionState } from "react";
import { startTransition, useState } from "react";
import { useRouter } from "next/navigation";
import type { EmployeeRecord } from "@/modules/organization/domain/organization-repository";
import { formatLevelCode } from "@/shared/presentation/format";
import { toActionErrorMessage } from "@/shared/presentation/action-error";
import { reassignEmployee } from "./actions";

interface ReassignButtonProps {
  employeeId: string;
  employeeName: string;
  potentialSupervisors: EmployeeRecord[];
}

export function ReassignButton({
  employeeId,
  employeeName,
  potentialSupervisors,
}: ReassignButtonProps) {
  const router = useRouter();
  const [showDialog, setShowDialog] = useState(false);
  const [selectedSupervisor, setSelectedSupervisor] = useState("");

  const [state, formAction, isPending] = useActionState(
    async (_prev: string | null, formData: FormData) => {
      try {
        await reassignEmployee(formData);
        return null;
      } catch (e) {
        return toActionErrorMessage(e, "Error al reasignar.");
      }
    },
    null,
  );

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    startTransition(() => {
      const formData = new FormData();
      formData.set("employeeId", employeeId);
      formData.set("newSupervisorId", selectedSupervisor);
      formAction(formData);
    });
    setShowDialog(false);
    router.refresh();
  };

  return (
    <>
      <button
        type="button"
        onClick={() => setShowDialog(true)}
        className="px-3 py-1.5 text-xs font-medium rounded-lg bg-[#27272a] hover:bg-[#323238] text-zinc-300 border border-[#3f3f46] transition-colors"
      >
        Reasignar
      </button>

      {showDialog && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="bg-surface border border-outline-variant rounded-xl p-6 w-full max-w-md">
            <h3 className="text-lg font-semibold text-on-surface mb-2">
              Reasignar a {employeeName}
            </h3>
            <p className="text-sm text-on-surface-variant mb-4">
              Seleccioná el nuevo supervisor:
            </p>

            <form onSubmit={handleSubmit} className="space-y-4">
              <select
                value={selectedSupervisor}
                onChange={(e) => setSelectedSupervisor(e.target.value)}
                required
                className="w-full bg-surface-container-low border border-outline-variant text-sm text-on-surface rounded-lg px-3 py-2 focus:outline-none focus:border-primary transition-colors"
              >
                <option value="">Seleccionar supervisor...</option>
                {potentialSupervisors.map((sup) => (
                  <option key={sup.id} value={sup.id}>
                    {sup.firstName} {sup.lastName} ({sup.currentLevelId ? formatLevelCode(sup.currentLevelId) : "—"})
                  </option>
                ))}
              </select>

              {state && (
                <p className="text-sm text-tertiary">{state}</p>
              )}

              <div className="flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setShowDialog(false)}
                  className="px-4 py-2 text-sm font-medium rounded-lg bg-[#27272a] hover:bg-[#323238] text-zinc-300 border border-[#3f3f46] transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={isPending || !selectedSupervisor}
                  className="px-4 py-2 text-sm font-medium text-[#0a1b12] bg-[#00df81] rounded-lg hover:bg-[#00c873] transition-colors disabled:opacity-50"
                >
                  {isPending ? "Reasignando..." : "Reasignar"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
