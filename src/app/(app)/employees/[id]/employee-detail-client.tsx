/**
 * EmployeeDetailClient — Client Component for ADMIN employee editing.
 *
 * Renders editable employee information with form submission.
 *
 * Reference: requirements.md §3.12.2
 */

"use client";

import { useActionState } from "react";
import { useRouter } from "next/navigation";
import { startTransition } from "react";
import type { EmployeeRecord } from "@/modules/organization/domain/organization-repository";
import { updateEmployee } from "./actions";

function formatDateValue(date: Date | null): string {
  if (!date) return "";
  const d = new Date(date);
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export function EmployeeDetailClient({ employee }: { employee: EmployeeRecord }) {
  const router = useRouter();

  const [state, formAction, isPending] = useActionState(
    async (_prev: string | null, formData: FormData) => {
      try {
        await updateEmployee(employee.id, formData);
        return null;
      } catch (e) {
        return e instanceof Error ? e.message : "Error al guardar.";
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
      {/* General info (read-only) */}
      <section className="bg-surface border border-outline-variant rounded-xl p-6">
        <h2 className="text-sm font-semibold text-on-surface-variant uppercase tracking-wider mb-4">
          Información General
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <ReadOnlyField label="ID de Empleado" value={String(employee.employeeCode)} />
          <ReadOnlyField label="Nivel" value={employee.currentLevelId ? `N${employee.currentLevelId}` : "ADMIN"} />
          <ReadOnlyField label="Fecha de Ingreso" value={formatDate(employee.joinedAt)} />
          <ReadOnlyField label="Supervisor" value={employee.supervisorId ?? "—"} />
        </div>
      </section>

      {/* Personal data (editable) */}
      <section className="bg-surface border border-outline-variant rounded-xl p-6">
        <h2 className="text-sm font-semibold text-on-surface-variant uppercase tracking-wider mb-4">
          Datos Personales
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Field name="firstName" label="Nombre" defaultValue={employee.firstName} required />
          <Field name="lastName" label="Apellido" defaultValue={employee.lastName} required />
          <Field name="dni" label="DNI" defaultValue={employee.dni ?? ""} />
          <Field name="email" label="Email" type="email" defaultValue={employee.email ?? ""} />
          <Field name="phone" label="Teléfono" type="tel" defaultValue={employee.phone ?? ""} />
          <Field name="dateOfBirth" label="Fecha de Nacimiento" type="date" defaultValue={formatDateValue(employee.dateOfBirth)} />
        </div>
      </section>

      {/* Address (editable) */}
      <section className="bg-surface border border-outline-variant rounded-xl p-6">
        <h2 className="text-sm font-semibold text-on-surface-variant uppercase tracking-wider mb-4">
          Dirección
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Field name="street" label="Calle" defaultValue={employee.street ?? ""} />
          <Field name="streetNumber" label="Número" defaultValue={employee.streetNumber ?? ""} />
          <Field name="floor" label="Piso" defaultValue={employee.floor ?? ""} />
          <Field name="apartment" label="Departamento" defaultValue={employee.apartment ?? ""} />
          <Field name="city" label="Ciudad" defaultValue={employee.city ?? ""} />
          <Field name="province" label="Provincia" defaultValue={employee.province ?? ""} />
          <Field name="postalCode" label="Código Postal" defaultValue={employee.postalCode ?? ""} />
        </div>
      </section>

      {/* Deactivation info (conditional, read-only) */}
      {employee.deactivatedAt && (
        <section className="bg-surface border border-outline-variant rounded-xl p-6">
          <h2 className="text-sm font-semibold text-on-surface-variant uppercase tracking-wider mb-4">
            Baja
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <ReadOnlyField label="Fecha de Baja" value={formatDateTime(employee.deactivatedAt)} />
            <ReadOnlyField label="Motivo" value={employee.deactivationReason ?? "—"} />
          </div>
        </section>
      )}

      {/* Timestamps (read-only) */}
      <section className="bg-surface border border-outline-variant rounded-xl p-6">
        <h2 className="text-sm font-semibold text-on-surface-variant uppercase tracking-wider mb-4">
          Metadatos
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <ReadOnlyField label="Creado" value={formatDateTime(employee.createdAt)} />
          <ReadOnlyField label="Última Actualización" value={formatDateTime(employee.updatedAt)} />
        </div>
      </section>

      {/* Error message */}
      {state && (
        <div className="bg-tertiary/10 border border-tertiary/20 rounded-lg px-4 py-3 text-sm text-tertiary">
          {state}
        </div>
      )}

      {/* Actions */}
      <div className="flex justify-end gap-3">
        <button
          type="button"
          onClick={() => router.back()}
          className="px-4 py-2 text-sm font-medium rounded-lg bg-[#27272a] hover:bg-[#323238] text-zinc-300 border border-[#3f3f46] transition-colors"
        >
          Cancelar
        </button>
        <button
          type="submit"
          disabled={isPending}
          className="px-4 py-2 text-sm font-medium text-[#0a1b12] bg-[#00df81] rounded-lg hover:bg-[#00c873] transition-colors disabled:opacity-50"
        >
          {isPending ? "Guardando..." : "Guardar cambios"}
        </button>
      </div>
    </form>
  );
}

function Field({
  name,
  label,
  type = "text",
  defaultValue = "",
  required = false,
}: {
  name: string;
  label: string;
  type?: string;
  defaultValue?: string;
  required?: boolean;
}) {
  return (
    <div>
      <label
        htmlFor={name}
        className="block text-xs font-semibold text-on-surface-variant uppercase tracking-wider mb-1.5"
      >
        {label} {required && <span className="text-tertiary">*</span>}
      </label>
      <input
        id={name}
        name={name}
        type={type}
        defaultValue={defaultValue}
        required={required}
        className="w-full bg-surface-container-low border border-outline-variant text-sm text-on-surface rounded-lg px-3 py-2 placeholder:text-on-surface-variant focus:outline-none focus:border-primary transition-colors"
      />
    </div>
  );
}

function ReadOnlyField({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt className="text-xs font-semibold text-on-surface-variant uppercase tracking-wider mb-1">
        {label}
      </dt>
      <dd className="text-on-surface text-sm">{value}</dd>
    </div>
  );
}

function formatDate(date: Date): string {
  return new Intl.DateTimeFormat("es-AR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  }).format(new Date(date));
}

function formatDateTime(date: Date): string {
  return new Intl.DateTimeFormat("es-AR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(date));
}
