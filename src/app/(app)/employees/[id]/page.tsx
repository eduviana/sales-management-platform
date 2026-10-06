/**
 * Employee detail page — ADMIN employee management.
 *
 * Shows full employee information, progression, team, and edit capabilities.
 * Only accessible to ADMIN role.
 *
 * Visual reference: design/stitch/DESIGN.md
 * Reference: requirements.md §3.12
 */

import Link from "next/link";
import { redirect } from "next/navigation";
import { handlePageLoadError } from "../../_lib/handle-page-load-error";
import { resolveAuthContext } from "@/modules/identity/resolve-auth-context";
import { createOrganizationModule } from "@/modules/organization/composition-root";
import { createProgressionModule } from "@/modules/progression/composition-root";
import { getLevelName } from "@/modules/organization/domain/level";
import { EmployeeDetailClient } from "./employee-detail-client";
import { ProgressCard } from "@/modules/progression/presentation/components/ProgressCard";
import { TeamMembersList } from "./team-members-list";
import { PromoteButton } from "./promote-button";
import { LEVEL_THRESHOLDS } from "@/modules/progression/domain";
import { CheckCircle2, Crown, Pencil, User } from "lucide-react";
import {
  formatDate,
  formatDateTime,
  formatEmployeeCode,
  formatLevelCode,
} from "@/shared/presentation/format";

const STATUS_LABELS: Record<string, string> = {
  ACTIVE: "Activo",
  INACTIVE: "Inactivo",
};

const STATUS_COLORS: Record<string, string> = {
  ACTIVE: "bg-secondary/10 text-secondary border-secondary/20",
  INACTIVE: "bg-tertiary/10 text-tertiary border-tertiary/20",
};

function StatusPill({ status }: { status: "ACTIVE" | "INACTIVE" }) {
  const classes = STATUS_COLORS[status] ?? "";
  const isActive = status === "ACTIVE";
  return (
    <span
      className={`inline-flex items-center gap-1.5 ${classes} border px-3.5 py-1.5 rounded-full text-sm font-semibold`}
    >
      {isActive ? <CheckCircle2 className="w-4 h-4" aria-hidden="true" /> : null}
      {STATUS_LABELS[status]}
    </span>
  );
}

function RibbonCard({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="bg-surface-container border border-outline-variant rounded-xl p-4">
      <p className="text-[10px] font-semibold text-on-surface-variant uppercase tracking-wider">
        {label}
      </p>
      <div className="mt-1.5">{children}</div>
    </div>
  );
}

/** Human-readable tenure since the hire date, e.g. "3 años" / "2 meses". */
function formatTenure(joinedAt: Date): string {
  const now = new Date();
  let years = now.getFullYear() - joinedAt.getFullYear();
  let months = now.getMonth() - joinedAt.getMonth();
  if (months < 0) {
    years -= 1;
    months += 12;
  }
  if (years > 0) {
    return years === 1 ? "1 año" : `${years} años`;
  }
  if (months > 0) {
    return months === 1 ? "1 mes" : `${months} meses`;
  }
  return "Recién ingresado";
}

export default async function EmployeeDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const authContext = await resolveAuthContext();

  // Only ADMIN can access this page
  if (authContext.role !== "ADMIN") {
    redirect("/dashboard");
  }

  const { getEmployeeByIdUseCase, organizationRepository } = createOrganizationModule();
  const { getEmployeeProgression, calculateProgression } = createProgressionModule();

  let employee;
  try {
    employee = await getEmployeeByIdUseCase.execute({
      authContext,
      employeeId: id,
    });
  } catch (error) {
    handlePageLoadError(error);
  }

  // Calculate and record progression (only target bonuses are persisted)
  if (employee.currentLevelId !== null && employee.status === "ACTIVE") {
    await calculateProgression.execute({
      employeeId: employee.id,
      currentLevelId: employee.currentLevelId,
      joinedAt: employee.joinedAt,
    });
  }

  // Get progression details
  const progression = employee.currentLevelId !== null
    ? await getEmployeeProgression.execute({
        employeeId: employee.id,
        currentLevelId: employee.currentLevelId,
        joinedAt: employee.joinedAt,
      })
    : null;

  // Get direct subordinates (team members)
  const subordinates = await organizationRepository.getDirectSubordinates(employee.id);

  // Get all employees for reassignment dropdown + supervisor name resolution
  const allEmployees = await organizationRepository.getAllEmployees();

  const isAdmin = employee.currentLevelId === null;
  const levelCode = isAdmin
    ? "ADMIN"
    : formatLevelCode(employee.currentLevelId!);
  const levelName = isAdmin
    ? "Administrador"
    : getLevelName(employee.currentLevelId!);

  const supervisor = employee.supervisorId
    ? allEmployees.find((e) => e.id === employee.supervisorId) ?? null
    : null;

  // Promote button — only shown when points are sufficient for next level.
  const canPromote =
    employee.currentLevelId !== null &&
    employee.currentLevelId < 7 &&
    progression !== null &&
    LEVEL_THRESHOLDS[employee.currentLevelId] > 0 &&
    progression.currentPoints >= LEVEL_THRESHOLDS[employee.currentLevelId];

  const hasTeam = employee.currentLevelId !== null && employee.currentLevelId >= 3;

  return (
    <div className="w-full space-y-6">
      {/* Back link */}
      <Link
        href="/employees"
        className="inline-flex items-center gap-1 text-sm text-sky-400 hover:text-sky-300 transition-colors"
      >
        ← Volver a empleados
      </Link>

      {/* Header profile banner */}
      <section className="bg-surface-container border border-outline-variant rounded-2xl p-5 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-xl bg-sky-400/10 border border-sky-400/30 flex items-center justify-center text-sky-400 shrink-0">
            {isAdmin ? (
              <Crown className="w-7 h-7" aria-hidden="true" />
            ) : (
              <User className="w-7 h-7" aria-hidden="true" />
            )}
          </div>
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-bold text-on-surface tracking-tight">
                {employee.firstName} {employee.lastName}
              </h1>
              <StatusPill status={employee.status} />
            </div>
            <p className="text-xs text-on-surface-variant mt-1 flex flex-wrap items-center gap-2">
              <span>Creado: {formatDateTime(employee.createdAt)}</span>
              <span className="text-on-surface-variant">·</span>
              <span>Última actualización: {formatDateTime(employee.updatedAt)}</span>
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3 self-end md:self-center">
          <a
            href="#edit-form"
            className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-medium text-on-surface bg-surface-container-low hover:bg-surface-container-high border border-outline-variant rounded-lg transition"
          >
            <Pencil className="w-3.5 h-3.5 text-sky-400" aria-hidden="true" />
            Editar Perfil
          </a>
        </div>
      </section>

      {/* Summary ribbon */}
      <section className="grid grid-cols-2 md:grid-cols-5 gap-3">
        <RibbonCard label="Estado">
          <div className="flex items-center gap-1.5">
            <span
              className={`w-2 h-2 rounded-full ${employee.status === "ACTIVE" ? "bg-secondary" : "bg-tertiary"}`}
            />
            <span className="text-sm font-semibold text-on-surface">
              {STATUS_LABELS[employee.status]}
            </span>
          </div>
        </RibbonCard>
        <RibbonCard label="Nivel Jerárquico">
          <div className="flex items-center gap-2">
            <span className="text-sm font-bold text-on-surface">{levelCode}</span>
            <span className="text-[10px] text-on-surface-variant bg-surface-container-low px-1.5 py-0.5 rounded">
              {levelName}
            </span>
          </div>
        </RibbonCard>
        <RibbonCard label="Código Empleado">
          <div className="text-sm font-mono font-bold text-on-surface">
            {formatEmployeeCode(employee.employeeCode)}
          </div>
        </RibbonCard>
        <RibbonCard label="Supervisor">
          <div className="text-sm font-medium text-on-surface-variant italic">
            {supervisor
              ? `${supervisor.firstName} ${supervisor.lastName}`
              : "— Sin asignar"}
          </div>
        </RibbonCard>
        <RibbonCard label="Fecha de Ingreso">
          <div className="flex items-center justify-between gap-2">
            <span className="text-sm font-semibold text-on-surface">
              {formatDate(employee.joinedAt)}
            </span>
            <span className="text-[10px] text-secondary font-mono">
              {formatTenure(employee.joinedAt)}
            </span>
          </div>
        </RibbonCard>
      </section>

      {/* Main grid — paired rows share height:
          row 1: Datos Personales (7) + Progreso (5)
          row 2: Dirección y Residencia (7) + Equipo a Cargo (5)
          The employee form uses display: contents so its sections become
          direct grid items and line up with the right-side cards. */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <EmployeeDetailClient employee={employee} />

        {progression && (
          <ProgressCard
            progression={progression}
            className="lg:col-span-5 lg:row-start-1"
          />
        )}

        {canPromote && employee.currentLevelId !== null && (
          <div className="lg:col-span-5 lg:col-start-8">
            <PromoteButton
              employeeId={employee.id}
              employeeName={`${employee.firstName} ${employee.lastName}`}
              currentLevelId={employee.currentLevelId}
              nextLevelId={employee.currentLevelId + 1}
            />
          </div>
        )}

        {hasTeam && (
          <TeamMembersList
            className="lg:col-span-5 lg:row-start-2"
            employeeId={employee.id}
            subordinates={subordinates}
            allEmployees={allEmployees}
          />
        )}
      </div>
    </div>
  );
}