/**
 * Server Action for login.
 *
 * Handles form submission for the login page.
 * Server-only — no client-side secrets are exposed.
 *
 * Reference: system-architecture.md §10
 */

"use server";

import { redirect } from "next/navigation";
import { createIdentityModule } from "@/modules/identity/composition-root";
import { AuthenticationError, ValidationError } from "@/shared/errors";

export interface LoginActionState {
  readonly error: string | null;
  readonly loading: boolean;
}

export async function loginAction(
  _prevState: LoginActionState,
  formData: FormData,
): Promise<LoginActionState> {
  const email = String(formData.get("email") ?? "");
  const password = String(formData.get("password") ?? "");

  try {
    const { loginUseCase } = await createIdentityModule();
    const result = await loginUseCase.execute({ email, password });

    if (result.mustChangePassword) {
      redirect("/change-password");
    }

    redirect("/dashboard");
  } catch (error) {
    if (error instanceof ValidationError || error instanceof AuthenticationError) {
      return { error: error.message, loading: false };
    }
    // Re-throw redirects and unexpected errors
    throw error;
  }
}
