/**
 * Employees page — ADMIN employee management.
 *
 * Shows all employees with their info, progression, and actions.
 * Only accessible to ADMIN role.
 *
 * Reference: requirements.md §3.12
 */

import { resolveAuthContext } from "@/modules/identity/resolve-auth-context";
import { createOrganizationModule } from "@/modules/organization/composition-root";
import { createProgressionModule } from "@/modules/progression/composition-root";
import { redirect } from "next/navigation";
import { EmployeesClient } from "./employees-client";

export default async function EmployeesPage() {
  const authContext = await resolveAuthContext();

  // Only ADMIN can access this page
  if (authContext.role !== "ADMIN") {
    redirect("/dashboard");
  }

  const { getAllEmployeesUseCase } = createOrganizationModule();
  const { getEmployeeProgression, calculateProgression } = createProgressionModule();

  const { employees: allEmployees } = await getAllEmployeesUseCase.execute();

  // The system ADMIN account (currentLevelId === null) is a platform-level
  // account, not a sales employee: exclude it from the employee table.
  // Only ADMIN can access this page, so this is a display rule, not auth.
  const employees = allEmployees.filter((emp) => emp.currentLevelId !== null);

  // Calculate and record progression for all active employees
  for (const emp of employees) {
    if (emp.currentLevelId !== null && emp.status === "ACTIVE") {
      await calculateProgression.execute({
        employeeId: emp.id,
        currentLevelId: emp.currentLevelId,
        joinedAt: emp.joinedAt,
      });
    }
  }

  // Get progression summaries for all employees
  const progressionMap = await getEmployeeProgression.executeBatch(
    employees
      .filter((e) => e.currentLevelId !== null)
      .map((e) => ({ id: e.id, currentLevelId: e.currentLevelId, joinedAt: e.joinedAt })),
  );

  return (
    <EmployeesClient
      employees={employees}
      progressionMap={Object.fromEntries(progressionMap)}
    />
  );
}
