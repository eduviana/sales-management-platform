"use server";

import { redirect } from "next/navigation";
import { prisma } from "@/infrastructure/prisma/client";
import { createAuthorizationService } from "@/modules/authorization/composition-root";
import { createOrganizationModule } from "@/modules/organization/composition-root";
import { createVisitsUseCases } from "@/modules/visits/composition-root";
import { resolveAuthContext } from "@/modules/sales/presentation/resolve-auth-context";

function isRedirectError(error: unknown): boolean {
  return Boolean(
    error &&
      typeof error === "object" &&
      "digest" in error &&
      typeof (error as { digest?: unknown }).digest === "string" &&
      (error as { digest: string }).digest.startsWith("NEXT_REDIRECT"),
  );
}

export async function completeVisitAndContinue(formData: FormData): Promise<void> {
  const visitId = String(formData.get("visitId") ?? "");

  try {
    const authContext = await resolveAuthContext();
    const auth = createAuthorizationService(prisma);
    const { organizationRepository } = createOrganizationModule(auth);
    const { getVisitList } = createVisitsUseCases(prisma, auth, organizationRepository);
    const visit = (await getVisitList.execute({ authContext })).find((item) => item.id === visitId);
    if (!visit || visit.status !== "assigned") {
      throw new Error("La visita no está disponible para registrar una venta.");
    }

    redirect(`/sales/new?visitId=${encodeURIComponent(visitId)}`);
  } catch (error) {
    if (isRedirectError(error)) throw error;
    throw error;
  }
}

export async function recordVisitWithoutSale(formData: FormData): Promise<void> {
  try {
    const authContext = await resolveAuthContext();
    const auth = createAuthorizationService(prisma);
    const { organizationRepository } = createOrganizationModule(auth);
    const { updateVisit } = createVisitsUseCases(prisma, auth, organizationRepository);
    const visitId = String(formData.get("visitId") ?? "");
    const notes = String(formData.get("notes") ?? "").trim();

    if (!notes) {
      throw new Error("Debes indicar el resultado de la visita.");
    }

    await updateVisit.execute({
      authContext,
      visitId,
      status: "no_sale",
      completedDate: new Date(),
      notes,
    });

    redirect("/visits");
  } catch (error) {
    if (isRedirectError(error)) throw error;
    throw error;
  }
}
