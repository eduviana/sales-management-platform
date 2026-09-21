/**
 * Employee detail page — ADMIN employee management.
 *
 * Shows full employee information, progression, team, and edit capabilities.
 * Only accessible to ADMIN role.
 *
 * Reference: requirements.md §3.12
 */

import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { resolveAuthContext } from "@/modules/sales/presentation/resolve-auth-context";
import { createAuthorizationService } from "@/modules/authorization/composition-root";
import { createOrganizationModule } from "@/modules/organization/composition-root";
import { createProgressionModule } from "@/modules/progression/composition-root";
import { prisma } from "@/infrastructure/prisma/client";
import { EmployeeDetailClient } from "./employee-detail-client";
import { ProgressCard } from "@/modules/progression/presentation/components/ProgressCard";
import { TeamMembersList } from "./team-members-list";
import { PromoteButton } from "./promote-button";
import { LEVEL_THRESHOLDS } from "@/modules/progression/domain";

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

  // Only ADMIN can access this page
  if (authContext.role !== "ADMIN") {
    redirect("/dashboard");
  }

  const auth = createAuthorizationService(prisma);
  const { getEmployeeByIdUseCase, organizationRepository } = createOrganizationModule(auth);
  const { getEmployeeProgression, calculateProgression } = createProgressionModule(prisma);

  let employee;
  try {
    employee = await getEmployeeByIdUseCase.execute({
      authContext,
      employeeId: id,
    });
  } catch {
    notFound();
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

  // Get all employees for reassignment dropdown
  const allEmployees = await organizationRepository.getAllEmployees();

  const statusClass = STATUS_COLORS[employee.status] ?? "";

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Back link */}
      <Link
        href="/employees"
        className="inline-flex items-center gap-1 text-sm text-sky-400 hover:text-sky-300 transition-colors"
      >
        ← Volver a empleados
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

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main content (2/3) */}
        <div className="lg:col-span-2 space-y-6">
          {/* Edit form */}
          <EmployeeDetailClient employee={employee} />

          {/* Team members */}
          {employee.currentLevelId !== null && employee.currentLevelId >= 3 && (
            <TeamMembersList
              employeeId={employee.id}
              employeeName={`${employee.firstName} ${employee.lastName}`}
              subordinates={subordinates}
              allEmployees={allEmployees}
            />
          )}
        </div>

        {/* Sidebar (1/3) */}
        <div className="space-y-6">
          {/* Progression card */}
          {progression && (
            <ProgressCard progression={progression} />
          )}

          {/* Promote button — only shown when points are sufficient for next level */}
          {employee.currentLevelId !== null &&
            employee.currentLevelId < 7 &&
            progression &&
            (() => {
              const nextLevel = employee.currentLevelId! + 1;
              const requiredPoints = LEVEL_THRESHOLDS[employee.currentLevelId!];
              const hasEnough = requiredPoints > 0 && progression.currentPoints >= requiredPoints;
              if (!hasEnough) return null;
              return (
                <PromoteButton
                  employeeId={employee.id}
                  employeeName={`${employee.firstName} ${employee.lastName}`}
                  currentLevelId={employee.currentLevelId!}
                  nextLevelId={nextLevel}
                />
              );
            })()}
        </div>
      </div>
    </div>
  );
}
