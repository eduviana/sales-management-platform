/**
 * Editable employee field groups, shared by the employee editing surfaces.
 *
 * These components only render the inputs; the surrounding card layout belongs
 * to each surface (ADMIN management view and supervisor team view), which
 * differs in structure.
 *
 * Reference: requirements.md §3.12.2
 */

import type { EmployeeRecord } from "@/modules/organization/domain/organization-repository";

/** Format a date as `YYYY-MM-DD` for `<input type="date">`. */
export function formatDateInputValue(date: Date | null): string {
  if (!date) return "";
  const d = new Date(date);
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

/** Name, DNI, email, phone and date of birth. */
export function PersonalDataFields({
  employee,
}: {
  employee: EmployeeRecord;
}) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-5">
      <Field name="firstName" label="Nombre" defaultValue={employee.firstName} required />
      <Field name="lastName" label="Apellido" defaultValue={employee.lastName} required />
      <Field name="dni" label="DNI / Identificación" defaultValue={employee.dni ?? ""} mono />
      <Field name="email" label="Email Corporativo" type="email" defaultValue={employee.email ?? ""} mono />
      <Field name="phone" label="Teléfono" type="tel" defaultValue={employee.phone ?? ""} mono />
      <Field
        name="dateOfBirth"
        label="Fecha de Nacimiento"
        type="date"
        defaultValue={formatDateInputValue(employee.dateOfBirth)}
      />
    </div>
  );
}

/** Street, number, floor, apartment, postal code, city and province. */
export function AddressFields({ employee }: { employee: EmployeeRecord }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-x-6 gap-y-5">
      <div className="sm:col-span-2">
        <Field name="street" label="Calle" defaultValue={employee.street ?? ""} />
      </div>
      <div>
        <Field name="streetNumber" label="Número" defaultValue={employee.streetNumber ?? ""} mono />
      </div>
      <div>
        <Field name="floor" label="Piso" defaultValue={employee.floor ?? ""} mono center />
      </div>
      <div>
        <Field name="apartment" label="Departamento" defaultValue={employee.apartment ?? ""} center />
      </div>
      <div>
        <Field name="postalCode" label="Código Postal" defaultValue={employee.postalCode ?? ""} mono center />
      </div>
      <div>
        <Field name="city" label="Ciudad" defaultValue={employee.city ?? ""} />
      </div>
      <div>
        <Field name="province" label="Provincia" defaultValue={employee.province ?? ""} />
      </div>
    </div>
  );
}

function Field({
  name,
  label,
  type = "text",
  defaultValue = "",
  required = false,
  mono = false,
  center = false,
}: {
  name: string;
  label: string;
  type?: string;
  defaultValue?: string;
  required?: boolean;
  mono?: boolean;
  center?: boolean;
}) {
  return (
    <div>
      <label
        htmlFor={name}
        className="block text-[11px] font-semibold text-on-surface-variant uppercase tracking-wider mb-1.5"
      >
        {label} {required && <span className="text-secondary">*</span>}
      </label>
      <input
        id={name}
        name={name}
        type={type}
        defaultValue={defaultValue}
        required={required}
        className={`w-full bg-surface-container-low border border-outline-variant text-sm text-on-surface rounded-lg px-3 py-2 placeholder:text-on-surface-variant focus:outline-none focus:border-primary transition-colors ${mono ? "font-mono" : ""} ${center ? "text-center" : ""}`}
      />
    </div>
  );
}