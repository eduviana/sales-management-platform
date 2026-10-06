"use server";

import { createOrganizationModule } from "@/modules/organization/composition-root";
import { createProgressionModule } from "@/modules/progression/composition-root";
import { resolveAuthContext } from "@/modules/identity/resolve-auth-context";
import {
  AuthorizationError,
  DomainRuleError,
  NotFoundError,
  ValidationError,
} from "@/shared/errors";

export async function reassignEmployee(formData: FormData): Promise<void> {
  const authContext = await resolveAuthContext();

  // Only ADMIN can reassign employees
  if (authContext.role !== "ADMIN") {
    throw new AuthorizationError("No autorizado.");
  }

  const employeeId = String(formData.get("employeeId") ?? "");
  const newSupervisorId = String(formData.get("newSupervisorId") ?? "");

  if (!employeeId || !newSupervisorId) {
    throw new ValidationError("Se requiere un empleado y un supervisor.");
  }

  const { changeSupervisorUseCase } = createOrganizationModule();

  await changeSupervisorUseCase.execute({
    employeeId,
    newSupervisorId,
    reason: "Reasignación por ADMIN",
    actorId: authContext.userId,
    actorEmail: authContext.userEmail,
  });
}

export async function promoteEmployee(formData: FormData): Promise<void> {
  const authContext = await resolveAuthContext();

  // Only ADMIN can promote employees
  if (authContext.role !== "ADMIN") {
    throw new AuthorizationError("No autorizado.");
  }

  const employeeId = String(formData.get("employeeId") ?? "");
  const targetLevelValue = String(formData.get("targetLevel") ?? "");

  if (!employeeId || !targetLevelValue) {
    throw new ValidationError("Se requiere un empleado y un nivel destino.");
  }

  const targetLevel = parseInt(targetLevelValue, 10);
  if (Number.isNaN(targetLevel) || targetLevel < 1 || targetLevel > 7) {
    throw new ValidationError("El nivel debe ser entre 1 y 7.");
  }

  const { changeLevelUseCase, organizationRepository } =
    createOrganizationModule();

  // Get employee to validate points and level
  const employee = await organizationRepository.findEmployeeById(employeeId);

  if (!employee) {
    throw new NotFoundError("Employee", employeeId);
  }

  // Validate: can only promote to next level (not skip levels)
  if (employee.currentLevelId !== null && targetLevel > employee.currentLevelId) {
    const expectedNextLevel = employee.currentLevelId + 1;
    if (targetLevel !== expectedNextLevel) {
      throw new DomainRuleError(
        `Solo se puede ascender al nivel siguiente. ` +
        `El empleado está en N${employee.currentLevelId} y se intentó ascender a N${targetLevel}.`,
      );
    }

    const { LEVEL_THRESHOLDS } = await import("@/modules/progression/domain");
    const { getEmployeeProgression } = createProgressionModule();

    // Points are measured from the start of the current level (same metric
    // shown in the progression bar), so the server validation matches the UI.
    const progression = await getEmployeeProgression.execute({
      employeeId,
      currentLevelId: employee.currentLevelId,
      joinedAt: employee.joinedAt,
    });
    const totalPoints = progression.currentPoints;

    // Check if enough points for the next level
    const requiredPoints = LEVEL_THRESHOLDS[employee.currentLevelId] ?? 0;
    if (requiredPoints > 0 && totalPoints < requiredPoints) {
      throw new DomainRuleError(
        `No hay suficientes puntos para ascender a N${targetLevel}. ` +
        `Se necesitan ${requiredPoints} puntos y el empleado tiene ${totalPoints}.`,
      );
    }
  }

  await changeLevelUseCase.execute({
    employeeId,
    targetLevelId: targetLevel,
    reason: `Promoción/descenso por ADMIN a N${targetLevel}`,
    actorId: authContext.userId,
    actorEmail: authContext.userEmail,
  });
}
