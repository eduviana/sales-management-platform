/**
 * Employee detail page — Shows full employee information for N3+ supervisors.
 *
 * Supervisors can edit the personal data of the employees within their scope
 * (`employee.update`), so the read-only sections become an editable form when
 * the permission resolves for this employee.
 *
 * Follows the same pattern as sales/[id] and visits/[id] detail pages.
 *
 * Reference: permissions-matrix.md §4.2, business-rules.md REG-069, REG-071
 */

import Link from "next/link";
import { handlePageLoadError } from "../../_lib/handle-page-load-error";
import { resolveAuthContext } from "@/modules/identity/resolve-auth-context";
import { createAuthorizationService } from "@/modules/authorization/composition-root";
import { createOrganizationModule } from "@/modules/organization/composition-root";
import { grantsResourceAccess } from "@/modules/authorization/domain";
import { formatDate, formatDateTime } from "@/shared/presentation/format";
import { EmployeeEditForm } from "./employee-edit-form";

const STATUS_LABELS: Record<string, string> = {
  ACTIVE: "Activo",
  INACTIVE: "Inactivo",
};

const STATUS_COLORS: Record<string, string> = {
  ACTIVE: "bg-secondary/10 text-secondary border-secondary/20",
  INACTIVE: "bg-tertiary/10 text-tertiary border-tertiary/20",
};

export default async function EmployeeDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const authContext = await resolveAuthContext();
  const auth = createAuthorizationService();
  const { getEmployeeByIdUseCase } = createOrganizationModule();

  let employee;
  try {
    employee = await getEmployeeByIdUseCase.execute({
      authContext,
      employeeId: id,
    });
  } catch (error) {
    handlePageLoadError(error);
  }

  const statusClass = STATUS_COLORS[employee.status] ?? "";

  // The same rule the server applies on update: `employee.update` within the
  // actor's scope. Reading the record is already restricted by
  // GetEmployeeByIdUseCase; this only decides between form and read-only view.
  const updateDecision = await auth.authorize(authContext, {
    permission: "employee.update",
    resource: { type: "employee", id: employee.id, ownerId: employee.id },
  });
  const canEdit = grantsResourceAccess(updateDecision);

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
      <header className="flex items-center gap-3">
        <h1 className="text-2xl lg:text-3xl font-bold text-on-surface tracking-tight">
          {employee.firstName} {employee.lastName}
        </h1>
        <span className={`border px-2 py-0.5 rounded-full text-xs font-semibold ${statusClass}`}>
          {STATUS_LABELS[employee.status]}
        </span>
      </header>

      {/* General info */}
      <section className="bg-surface border border-outline-variant rounded-xl p-6">
        <h2 className="text-sm font-semibold text-on-surface-variant uppercase tracking-wider mb-4">
          Información General
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Field label="ID de Empleado" value={String(employee.employeeCode)} />
          <Field label="Nivel" value={employee.currentLevelId ? `N${employee.currentLevelId}` : "—"} />
          <Field label="Fecha de Ingreso" value={formatDate(employee.joinedAt)} />
          <Field label="Supervisor ID" value={employee.supervisorId ?? "—"} />
        </div>
      </section>

      {/* Personal data and address: editable when the actor may update it */}
      {canEdit ? (
        <EmployeeEditForm employee={employee} />
      ) : (
        <>
          <section className="bg-surface border border-outline-variant rounded-xl p-6">
            <h2 className="text-sm font-semibold text-on-surface-variant uppercase tracking-wider mb-4">
              Datos Personales
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Field label="DNI" value={employee.dni ?? "—"} />
              <Field label="Fecha de Nacimiento" value={employee.dateOfBirth ? formatDate(employee.dateOfBirth) : "—"} />
              <Field label="Email" value={employee.email ?? "—"} />
              <Field label="Teléfono" value={employee.phone ?? "—"} />
            </div>
          </section>

          <section className="bg-surface border border-outline-variant rounded-xl p-6">
            <h2 className="text-sm font-semibold text-on-surface-variant uppercase tracking-wider mb-4">
              Dirección
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Field label="Calle" value={employee.street ?? "—"} />
              <Field label="Número" value={employee.streetNumber ?? "—"} />
              <Field label="Piso" value={employee.floor ?? "—"} />
              <Field label="Departamento" value={employee.apartment ?? "—"} />
              <Field label="Ciudad" value={employee.city ?? "—"} />
              <Field label="Provincia" value={employee.province ?? "—"} />
              <Field label="Código Postal" value={employee.postalCode ?? "—"} />
            </div>
          </section>
        </>
      )}

      {/* Deactivation info (conditional) */}
      {employee.deactivatedAt && (
        <section className="bg-surface border border-outline-variant rounded-xl p-6">
          <h2 className="text-sm font-semibold text-on-surface-variant uppercase tracking-wider mb-4">
            Baja
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Field label="Fecha de Baja" value={formatDateTime(employee.deactivatedAt)} />
            <Field label="Motivo" value={employee.deactivationReason ?? "—"} />
          </div>
        </section>
      )}

      {/* Timestamps */}
      <section className="bg-surface border border-outline-variant rounded-xl p-6">
        <h2 className="text-sm font-semibold text-on-surface-variant uppercase tracking-wider mb-4">
          Metadatos
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Field label="Creado" value={formatDateTime(employee.createdAt)} />
          <Field label="Última Actualización" value={formatDateTime(employee.updatedAt)} />
        </div>
      </section>
    </div>
  );
}

function Field({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt className="text-xs font-semibold text-on-surface-variant uppercase tracking-wider mb-1">
        {label}
      </dt>
      <dd className="text-on-surface text-sm">{value}</dd>
    </div>
  );
}

