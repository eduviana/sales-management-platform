"use server";

import { redirect } from "next/navigation";
import { prisma } from "@/infrastructure/prisma/client";
import { createAuthorizationService } from "@/modules/authorization/composition-root";
import { createOrganizationModule } from "@/modules/organization/composition-root";
import { createVisitsUseCases } from "@/modules/visits/composition-root";
import { resolveAuthContext } from "@/modules/sales/presentation/resolve-auth-context";
import { formatClientAddress } from "@/modules/visits/domain/client";

export async function createClient(formData: FormData): Promise<void> {
  const authContext = await resolveAuthContext();
  const auth = createAuthorizationService(prisma);
  const { organizationRepository } = createOrganizationModule(auth);
  const { createClient: createClientUseCase } = createVisitsUseCases(prisma, auth, organizationRepository);

  const name = String(formData.get("name") ?? "").trim();
  const documentNumber = String(formData.get("documentNumber") ?? "").trim();
  const phone = String(formData.get("phone") ?? "").trim();
  const email = String(formData.get("email") ?? "").trim();
  const street = String(formData.get("street") ?? "").trim();
  const streetNumber = String(formData.get("streetNumber") ?? "").trim();
  const floor = String(formData.get("floor") ?? "").trim();
  const apartment = String(formData.get("apartment") ?? "").trim();
  const city = String(formData.get("city") ?? "").trim();
  const province = String(formData.get("province") ?? "").trim();
  const postalCode = String(formData.get("postalCode") ?? "").trim();
  const addressNotes = String(formData.get("addressNotes") ?? "").trim();
  const address = formatClientAddress({ street, streetNumber, floor, apartment, city, province, postalCode, addressNotes });

  if (!name || !phone || !street || !streetNumber || !city || !province) {
    throw new Error("El nombre, el teléfono, la calle, el número, la ciudad y la provincia son obligatorios.");
  }

  await createClientUseCase.execute({
    authContext,
    name,
    documentNumber: documentNumber || undefined,
    phone,
    email: email || undefined,
    address,
    street,
    streetNumber,
    floor: floor || undefined,
    apartment: apartment || undefined,
    city,
    province,
    postalCode: postalCode || undefined,
    addressNotes: addressNotes || undefined,
  });

  redirect("/clients");
}
