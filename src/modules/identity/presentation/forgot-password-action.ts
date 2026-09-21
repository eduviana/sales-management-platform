/**
 * Server Action for forgot password.
 *
 * Handles form submission for requesting a password reset.
 * Always returns success to prevent email enumeration.
 *
 * Reference: system-architecture.md §10
 */

"use server";

import { createIdentityModule } from "@/modules/identity/composition-root";

export interface ForgotPasswordActionState {
  readonly success: boolean;
  readonly error: string | null;
  readonly loading: boolean;
}

export async function forgotPasswordAction(
  _prevState: ForgotPasswordActionState,
  formData: FormData,
): Promise<ForgotPasswordActionState> {
  const email = String(formData.get("email") ?? "");

  if (!email.trim()) {
    return { success: false, error: "Email is required.", loading: false };
  }

  try {
    const { requestPasswordResetUseCase } = await createIdentityModule();
    await requestPasswordResetUseCase.execute({ email });

    // Always return success to prevent email enumeration
    return {
      success: true,
      error: null,
      loading: false,
    };
  } catch {
    // Even on error, return success to prevent email enumeration
    return {
      success: true,
      error: null,
      loading: false,
    };
  }
}
