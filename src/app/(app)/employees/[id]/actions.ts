"use server";

import { prisma } from "@/infrastructure/prisma/client";
import { createAuthorizationService } from "@/modules/authorization/composition-root";
import { createOrganizationModule } from "@/modules/organization/composition-root";
import { createProgressionModule } from "@/modules/progression/composition-root";
import { resolveAuthContext } from "@/modules/sales/presentation/resolve-auth-context";

export async function updateEmployee(
  employeeId: string,
  formData: FormData,
): Promise<void> {
  const authContext = await resolveAuthContext();

  // Only ADMIN can update employees
  if (authContext.role !== "ADMIN") {
    throw new Error("No autorizado.");
  }

  const firstName = String(formData.get("firstName") ?? "").trim();
  const lastName = String(formData.get("lastName") ?? "").trim();
  const dni = String(formData.get("dni") ?? "").trim();
  const email = String(formData.get("email") ?? "").trim();
  const phone = String(formData.get("phone") ?? "").trim();
  const dateOfBirthValue = String(formData.get("dateOfBirth") ?? "");
  const street = String(formData.get("street") ?? "").trim();
  const streetNumber = String(formData.get("streetNumber") ?? "").trim();
  const floor = String(formData.get("floor") ?? "").trim() || null;
  const apartment = String(formData.get("apartment") ?? "").trim() || null;
  const city = String(formData.get("city") ?? "").trim();
  const province = String(formData.get("province") ?? "").trim();
  const postalCode = String(formData.get("postalCode") ?? "").trim();

  if (!firstName || !lastName) {
    throw new Error("Nombre y apellido son obligatorios.");
  }

  const dateOfBirth = dateOfBirthValue
    ? new Date(`${dateOfBirthValue}T12:00:00.000Z`)
    : null;

  await prisma.employee.update({
    where: { id: employeeId },
    data: {
      firstName,
      lastName,
      dni: dni || null,
      email: email || null,
      phone: phone || null,
      dateOfBirth: dateOfBirth && !Number.isNaN(dateOfBirth.getTime()) ? dateOfBirth : null,
      street: street || null,
      streetNumber: streetNumber || null,
      floor,
      apartment,
      city: city || null,
      province: province || null,
      postalCode: postalCode || null,
    },
  });
}

export async function reassignEmployee(formData: FormData): Promise<void> {
  const authContext = await resolveAuthContext();

  // Only ADMIN can reassign employees
  if (authContext.role !== "ADMIN") {
    throw new Error("No autorizado.");
  }

  const employeeId = String(formData.get("employeeId") ?? "");
  const newSupervisorId = String(formData.get("newSupervisorId") ?? "");

  if (!employeeId || !newSupervisorId) {
    throw new Error("Se requiere un empleado y un supervisor.");
  }

  const auth = createAuthorizationService(prisma);
  const { changeSupervisorUseCase } = createOrganizationModule(auth);

  await changeSupervisorUseCase.execute({
    employeeId,
    newSupervisorId,
    reason: "Reasignación por ADMIN",
    actorId: authContext.employeeId,
    actorEmail: authContext.userEmail,
  });
}

export async function promoteEmployee(formData: FormData): Promise<void> {
  const authContext = await resolveAuthContext();

  // Only ADMIN can promote employees
  if (authContext.role !== "ADMIN") {
    throw new Error("No autorizado.");
  }

  const employeeId = String(formData.get("employeeId") ?? "");
  const targetLevelValue = String(formData.get("targetLevel") ?? "");

  if (!employeeId || !targetLevelValue) {
    throw new Error("Se requiere un empleado y un nivel destino.");
  }

  const targetLevel = parseInt(targetLevelValue, 10);
  if (Number.isNaN(targetLevel) || targetLevel < 1 || targetLevel > 7) {
    throw new Error("El nivel debe ser entre 1 y 7.");
  }

  // Get employee to validate points and level
  const employee = await prisma.employee.findUnique({
    where: { id: employeeId },
    select: { currentLevelId: true, joinedAt: true },
  });

  if (!employee) {
    throw new Error("Empleado no encontrado.");
  }

  // Validate: can only promote to next level (not skip levels)
  if (employee.currentLevelId !== null && targetLevel > employee.currentLevelId) {
    const expectedNextLevel = employee.currentLevelId + 1;
    if (targetLevel !== expectedNextLevel) {
      throw new Error(
        `Solo se puede ascender al nivel siguiente. ` +
        `El empleado está en N${employee.currentLevelId} y se intentó ascender a N${targetLevel}.`,
      );
    }

    const { LEVEL_THRESHOLDS } = await import("@/modules/progression/domain");
    const { getEmployeeProgression } = createProgressionModule(prisma);

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
      throw new Error(
        `No hay suficientes puntos para ascender a N${targetLevel}. ` +
        `Se necesitan ${requiredPoints} puntos y el empleado tiene ${totalPoints}.`,
      );
    }
  }

  const auth = createAuthorizationService(prisma);
  const { changeLevelUseCase } = createOrganizationModule(auth);

  await changeLevelUseCase.execute({
    employeeId,
    targetLevelId: targetLevel,
    reason: `Promoción/descenso por ADMIN a N${targetLevel}`,
    actorId: authContext.employeeId,
    actorEmail: authContext.userEmail,
  });
}
