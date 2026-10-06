"use server";

import { createOrganizationModule } from "@/modules/organization/composition-root";
import { resolveAuthContext } from "@/modules/identity/resolve-auth-context";
import { toActionErrorMessage } from "@/shared/presentation/action-error";
import { promoteEmployee } from "./[id]/actions";

export interface PromoteResult {
  ok: boolean;
  error?: string;
}

/**
 * Promote an employee to the next level (exactly one level up).
 *
 * The target level is computed server-side from the employee's current level;
 * the client never sends it. The existing promoteEmployee action validates
 * that only the immediate next level is allowed and that the employee has
 * enough points (measured from the start of the current level).
 *
 * Reference: business-rules.md REG-082, requirements.md §3.12.3
 */
export async function promoteToNextLevel(employeeId: string): Promise<PromoteResult> {
  const authContext = await resolveAuthContext();

  // Only ADMIN can promote employees
  if (authContext.role !== "ADMIN") {
    return { ok: false, error: "No autorizado." };
  }

  const { organizationRepository } = createOrganizationModule();
  const employee = await organizationRepository.findEmployeeById(employeeId);

  if (!employee) {
    return { ok: false, error: "Empleado no encontrado." };
  }

  if (employee.currentLevelId === null) {
    return { ok: false, error: "La cuenta principal no tiene nivel de progresión." };
  }

  if (employee.currentLevelId >= 7) {
    return { ok: false, error: "El empleado ya está en el nivel máximo (N7)." };
  }

  const targetLevel = employee.currentLevelId + 1;

  const fd = new FormData();
  fd.set("employeeId", employeeId);
  fd.set("targetLevel", String(targetLevel));

  try {
    await promoteEmployee(fd);
    return { ok: true };
  } catch (e) {
    return {
      ok: false,
      error: toActionErrorMessage(e, "Error al ascender."),
    };
  }
}
