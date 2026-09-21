/**
 * New employee page — Form for N3+ supervisors to recruit new team members.
 *
 * Server Component that renders the recruitment form.
 * The form action calls the recruitEmployee server action.
 *
 * Reference: business-rules.md REG-019, REG-020
 */

import Link from "next/link";
import { recruitEmployee } from "../actions";

export default async function NewEmployeePage() {
  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Back link */}
      <Link
        href="/team"
        className="inline-flex items-center gap-1 text-sm text-sky-400 hover:text-sky-300 transition-colors"
      >
        ← Volver al equipo
      </Link>

      {/* Header */}
      <header>
        <h1 className="text-2xl font-semibold text-on-surface mb-1">
          Nuevo empleado
        </h1>
        <p className="text-on-surface-variant">
          Complete los datos del nuevo integrante de su equipo.
        </p>
      </header>

      {/* Form */}
      <form action={recruitEmployee} className="space-y-6">
        {/* Personal data */}
        <section className="bg-surface border border-outline-variant rounded-xl p-6 space-y-4">
          <h2 className="text-sm font-semibold text-on-surface-variant uppercase tracking-wider">
            Datos personales
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Field name="firstName" label="Nombre" required />
            <Field name="lastName" label="Apellido" required />
            <Field name="dni" label="DNI" required />
            <Field name="email" label="Email" type="email" required />
            <Field name="phone" label="Teléfono" type="tel" required />
            <Field name="dateOfBirth" label="Fecha de nacimiento" type="date" required />
          </div>
        </section>

        {/* Address */}
        <section className="bg-surface border border-outline-variant rounded-xl p-6 space-y-4">
          <h2 className="text-sm font-semibold text-on-surface-variant uppercase tracking-wider">
            Dirección
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Field name="street" label="Calle" required />
            <Field name="streetNumber" label="Número" required />
            <Field name="floor" label="Piso" />
            <Field name="apartment" label="Departamento" />
            <Field name="city" label="Ciudad" required />
            <Field name="province" label="Provincia" required />
            <Field name="postalCode" label="Código Postal" required />
          </div>
        </section>

        {/* Employment data */}
        <section className="bg-surface border border-outline-variant rounded-xl p-6 space-y-4">
          <h2 className="text-sm font-semibold text-on-surface-variant uppercase tracking-wider">
            Datos laborales
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Field name="joinedAt" label="Fecha de ingreso" type="date" required />
          </div>
          <p className="text-xs text-on-surface-variant">
            El nivel y el supervisor se asignarán automáticamente según las reglas de reclutamiento.
          </p>
        </section>

        {/* Submit */}
        <div className="flex justify-end gap-3">
          <Link
            href="/team"
            className="px-4 py-2 text-sm font-medium rounded-lg bg-[#27272a] hover:bg-[#323238] text-zinc-300 border border-[#3f3f46] transition-colors"
          >
            Cancelar
          </Link>
          <button
            type="submit"
            className="px-4 py-2 text-sm font-medium text-[#0a1b12] bg-[#00df81] rounded-lg hover:bg-[#00c873] transition-colors"
          >
            Crear empleado
          </button>
        </div>
      </form>
    </div>
  );
}

function Field({
  name,
  label,
  type = "text",
  required = false,
}: {
  name: string;
  label: string;
  type?: string;
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
        required={required}
        className="w-full bg-surface-container-low border border-outline-variant text-sm text-on-surface rounded-lg px-3 py-2 placeholder:text-on-surface-variant focus:outline-none focus:border-primary transition-colors"
      />
    </div>
  );
}
