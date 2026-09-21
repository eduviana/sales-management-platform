/**
 * Home page — redirects to dashboard or login.
 *
 * Server Component that resolves the current identity and redirects
 * accordingly. Phase 2 — identity-aware routing.
 */

import { redirect } from "next/navigation";
import { createIdentityModule } from "@/modules/identity/composition-root";

export default async function Home() {
  const { resolveIdentityUseCase } = await createIdentityModule();
  const identity = await resolveIdentityUseCase.execute();

  if (identity) {
    redirect("/dashboard");
  } else {
    redirect("/login");
  }
}
