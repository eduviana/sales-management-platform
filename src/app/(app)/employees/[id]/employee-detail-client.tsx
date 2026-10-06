/**
 * EmployeeDetailClient — Client Component for ADMIN employee editing.
 *
 * Renders editable employee information with form submission.
 * The field groups are shared with the supervisor team view; only the card
 * layout belongs to this surface.
 *
 * Visual reference: design/stitch/DESIGN.md
 * Reference: requirements.md §3.12.2
 */

"use client";

import { useActionState } from "react";
import { useRouter } from "next/navigation";
import { startTransition } from "react";
import {
  MapPin,
  UserX,
  Users,
} from "lucide-react";
import type { EmployeeRecord } from "@/modules/organization/domain/organization-repository";
import {
  AddressFields,
  PersonalDataFields,
} from "@/modules/organization/presentation/components/employee-profile-fields";
import { updateEmployee } from "@/modules/organization/presentation/employee-actions";
import { formatDateTime } from "@/shared/presentation/format";
import { toActionErrorMessage } from "@/shared/presentation/action-error";

export function EmployeeDetailClient({ employee }: { employee: EmployeeRecord }) {
  const router = useRouter();

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
    <form onSubmit={handleSubmit} className="contents">
      {/* Personal data (editable) — paired with Progreso card on the right */}
      <SectionCard
        id="edit-form"
        className="lg:col-span-7 lg:row-start-1 scroll-mt-6"
        icon={<Users className="w-4 h-4 text-on-surface" aria-hidden="true" />}
        accent="bg-secondary/10 text-secondary"
        title="Datos Personales"
        hint="* Campos requeridos"
      >
        <PersonalDataFields employee={employee} />
      </SectionCard>

      {/* Address (editable) — paired with Equipo a Cargo card on the right */}
      <SectionCard
        className="lg:col-span-7 lg:row-start-2"
        icon={<MapPin className="w-4 h-4 text-on-surface" aria-hidden="true" />}
        accent="bg-sky-400/10 text-sky-400"
        title="Dirección y Residencia"
      >
        <AddressFields employee={employee} />
      </SectionCard>

      {/* Deactivation info (conditional, read-only) */}
      {employee.deactivatedAt && (
        <SectionCard
          className="lg:col-span-7"
          icon={<UserX className="w-4 h-4 text-on-surface" aria-hidden="true" />}
          accent="bg-tertiary/10 text-tertiary"
          title="Baja"
        >
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-5">
            <ReadOnlyField label="Fecha de Baja" value={formatDateTime(employee.deactivatedAt)} />
            <ReadOnlyField label="Motivo" value={employee.deactivationReason ?? "—"} />
          </div>
        </SectionCard>
      )}

      {/* Error message */}
      {state && (
        <div className="lg:col-span-7 bg-tertiary/10 border border-tertiary/20 rounded-lg px-4 py-3 text-sm text-tertiary">
          {state}
        </div>
      )}

      {/* Actions */}
      <div className="lg:col-span-7 flex items-center justify-end gap-3 pt-2">
        <button
          type="button"
          onClick={() => router.back()}
          className="px-5 py-2.5 text-xs font-medium rounded-lg bg-[#27272a] hover:bg-[#323238] text-zinc-300 border border-[#3f3f46] transition-colors"
        >
          Cancelar
        </button>
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

function SectionCard({
  id,
  icon,
  accent,
  title,
  hint,
  className = "",
  children,
}: {
  id?: string;
  icon: React.ReactNode;
  accent: string;
  title: string;
  hint?: string;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <section
      id={id}
      className={`bg-surface-container border border-outline-variant rounded-2xl overflow-hidden shadow-sm ${className}`}
    >
      <div className="px-5 py-4 border-b border-outline-variant flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className={`p-1.5 rounded-md ${accent}`}>{icon}</div>
          <h2 className="text-xs font-bold text-on-surface uppercase tracking-wider">{title}</h2>
        </div>
        {hint && <span className="text-[11px] text-on-surface-variant">{hint}</span>}
      </div>
      <div className="p-5">{children}</div>
    </section>
  );
}

function ReadOnlyField({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt className="text-[11px] font-semibold text-on-surface-variant uppercase tracking-wider mb-1">
        {label}
      </dt>
      <dd className="text-on-surface text-base font-medium">{value}</dd>
    </div>
  );
}