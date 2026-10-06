"use server";

import { redirect } from "next/navigation";
import { createVisitsUseCases } from "@/modules/visits/composition-root";
import { resolveAuthContext } from "@/modules/identity/resolve-auth-context";

export async function assignVisit(formData: FormData): Promise<void> {
  const authContext = await resolveAuthContext();
  const useCases = createVisitsUseCases();

  const sellerId = String(formData.get("sellerId") ?? "");
  const clientId = String(formData.get("clientId") ?? "");
  const scheduledDateValue = String(formData.get("scheduledDate") ?? "");
  // Date inputs are calendar dates, not instants. Noon UTC prevents the
  // browser's local timezone from displaying the previous calendar day.
  const scheduledDate = scheduledDateValue
    ? new Date(`${scheduledDateValue}T12:00:00.000Z`)
    : new Date("invalid");
  const notes = String(formData.get("notes") ?? "").trim();

  if (!sellerId || !clientId || Number.isNaN(scheduledDate.getTime())) {
    throw new Error("Debes seleccionar un vendedor, un cliente y una fecha válida.");
  }

  await useCases.createVisit.execute({
    authContext,
    sellerId,
    clientId,
    scheduledDate,
    notes: notes || undefined,
  });

  redirect("/team");
}
