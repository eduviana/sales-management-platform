/**
 * EmployeeEditForm — Client Component for supervisor employee editing.
 *
 * Shown on `/team/[id]` when the actor holds `employee.update` over the
 * employee. The server re-validates the permission and its scope; hiding the
 * form is only a usability measure (PERM-PRINCIPLE-005).
 *
 * Reference: permissions-matrix.md §4.2
 */

"use client";

import { useActionState, startTransition } from "react";
import type { EmployeeRecord } from "@/modules/organization/domain/organization-repository";
import {
  AddressFields,
  PersonalDataFields,
} from "@/modules/organization/presentation/components/employee-profile-fields";
import { updateEmployee } from "@/modules/organization/presentation/employee-actions";
import { toActionErrorMessage } from "@/shared/presentation/action-error";

export function EmployeeEditForm({ employee }: { employee: EmployeeRecord }) {
  const [state, formAction, isPending] = useActionState(
    async (_prev: string | null, formData: FormData) => {
      try {
        await updateEmployee(employee.id, formData);
        return null;
      } catch (e) {
        return toActionErrorMessage(e, "Error al guardar.");
      }
    },
    null,
  );

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    startTransition(() => {
      formAction(new FormData(e.currentTarget));
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <section className="bg-surface border border-outline-variant rounded-xl p-6">
        <h2 className="text-sm font-semibold text-on-surface-variant uppercase tracking-wider mb-4">
          Datos Personales
        </h2>
        <PersonalDataFields employee={employee} />
      </section>

      <section className="bg-surface border border-outline-variant rounded-xl p-6">
        <h2 className="text-sm font-semibold text-on-surface-variant uppercase tracking-wider mb-4">
          Dirección
        </h2>
        <AddressFields employee={employee} />
      </section>

      {state && (
        <div className="bg-tertiary/10 border border-tertiary/20 rounded-lg px-4 py-3 text-sm text-tertiary">
          {state}
        </div>
      )}

      <div className="flex items-center justify-end">
        <button
          type="submit"
          disabled={isPending}
          className="inline-flex items-center gap-2 px-6 py-2.5 text-xs font-bold text-[#0a1b12] bg-[#00df81] rounded-lg hover:bg-[#00c873] transition-colors disabled:opacity-50"
        >
          {isPending ? "Guardando..." : "Guardar cambios"}
        </button>
      </div>
    </form>
  );
}