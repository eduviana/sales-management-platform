/**
 * Server Actions for the Organization module.
 *
 * Employee data updates are shared by the ADMIN management view
 * (`/employees/[id]`) and the supervisor team view (`/team/[id]`), so the action
 * lives with the module instead of a single route.
 *
 * Authorization is enforced by UpdateEmployeeUseCase with `employee.update`
 * and its scope; the action only resolves the context and maps the form data.
 *
 * Reference: system-architecture.md §10, permissions-matrix.md §4.2
 */

"use server";

import { createOrganizationModule } from "@/modules/organization/composition-root";
import { resolveAuthContext } from "@/modules/identity/resolve-auth-context";

export async function updateEmployee(
  employeeId: string,
  formData: FormData,
): Promise<void> {
  const authContext = await resolveAuthContext();

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

  const dateOfBirth = dateOfBirthValue
    ? new Date(`${dateOfBirthValue}T12:00:00.000Z`)
    : null;

  const { updateEmployeeUseCase } = createOrganizationModule();

  await updateEmployeeUseCase.execute({
    authContext,
    employeeId,
    data: {
      firstName,
      lastName,
      dni: dni || null,
      email: email || null,
      phone: phone || null,
      dateOfBirth:
        dateOfBirth && !Number.isNaN(dateOfBirth.getTime()) ? dateOfBirth : null,
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