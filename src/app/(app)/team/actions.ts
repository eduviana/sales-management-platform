"use server";

import { redirect } from "next/navigation";
import { createOrganizationModule } from "@/modules/organization/composition-root";
import { resolveAuthContext } from "@/modules/identity/resolve-auth-context";

export async function recruitEmployee(formData: FormData): Promise<void> {
  const authContext = await resolveAuthContext();
  const { recruitEmployeeUseCase } = createOrganizationModule();

  const recruiterId = authContext.employeeId;

  const firstName = String(formData.get("firstName") ?? "").trim();
  const lastName = String(formData.get("lastName") ?? "").trim();
  const dni = String(formData.get("dni") ?? "").trim();
  const email = String(formData.get("email") ?? "").trim();
  const phone = String(formData.get("phone") ?? "").trim();
  const dateOfBirthValue = String(formData.get("dateOfBirth") ?? "");
  const joinedAtValue = String(formData.get("joinedAt") ?? "");
  const street = String(formData.get("street") ?? "").trim();
  const streetNumber = String(formData.get("streetNumber") ?? "").trim();
  const floor = String(formData.get("floor") ?? "").trim() || null;
  const apartment = String(formData.get("apartment") ?? "").trim() || null;
  const city = String(formData.get("city") ?? "").trim();
  const province = String(formData.get("province") ?? "").trim();
  const postalCode = String(formData.get("postalCode") ?? "").trim();

  if (!firstName || !lastName || !dni || !email || !phone || !dateOfBirthValue || !joinedAtValue || !street || !streetNumber || !city || !province || !postalCode) {
    throw new Error("Todos los campos obligatorios deben ser completados.");
  }

  const dateOfBirth = new Date(`${dateOfBirthValue}T12:00:00.000Z`);
  const joinedAt = new Date(`${joinedAtValue}T12:00:00.000Z`);

  if (Number.isNaN(dateOfBirth.getTime()) || Number.isNaN(joinedAt.getTime())) {
    throw new Error("Las fechas ingresadas no son válidas.");
  }

  await recruitEmployeeUseCase.execute({
    recruiterId,
    firstName,
    lastName,
    joinedAt,
    actorEmail: authContext.userEmail,
    actorId: authContext.userId,
    dni,
    email,
    phone,
    dateOfBirth,
    street,
    streetNumber,
    floor,
    apartment,
    city,
    province,
    postalCode,
  });

  redirect("/team");
}
