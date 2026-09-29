"use server";

import { prisma } from "@/infrastructure/prisma/client";
import { resolveAuthContext } from "@/modules/sales/presentation/resolve-auth-context";
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

  const employee = await prisma.employee.findUnique({
    where: { id: employeeId },
    select: { currentLevelId: true },
  });

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
      error: e instanceof Error ? e.message : "Error al ascender.",
    };
  }
}
