/**
 * Logout action.
 *
 * Destroys the session and redirects to login.
 *
 * Reference: system-architecture.md §10
 */

"use server";

import { redirect } from "next/navigation";
import { createIdentityModule } from "@/modules/identity/composition-root";

export async function logoutAction(): Promise<void> {
  const { logoutUseCase, resolveIdentityUseCase } =
    await createIdentityModule();

  // Resolve current user before destroying session
  const identity = await resolveIdentityUseCase.execute();

  if (identity) {
    await logoutUseCase.execute({
      userId: identity.userAccount.id,
      userEmail: identity.userAccount.email,
    });
  } else {
    // Fallback: destroy session without audit event
    const { sessionPort } = await createIdentityModule();
    await sessionPort.destroy();
  }

  redirect("/login");
}
