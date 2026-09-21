/**
 * Server Action for reset password.
 *
 * Handles form submission for resetting a password with a token.
 *
 * Reference: system-architecture.md §10
 */

"use server";

import { redirect } from "next/navigation";
import { createIdentityModule } from "@/modules/identity/composition-root";
import { ValidationError, DomainRuleError } from "@/shared/errors";

export interface ResetPasswordActionState {
  readonly error: string | null;
  readonly loading: boolean;
}

export async function resetPasswordAction(
  _prevState: ResetPasswordActionState,
  formData: FormData,
): Promise<ResetPasswordActionState> {
  const token = String(formData.get("token") ?? "");
  const newPassword = String(formData.get("newPassword") ?? "");
  const confirmPassword = String(formData.get("confirmPassword") ?? "");

  try {
    const { resetPasswordUseCase } = await createIdentityModule();
    await resetPasswordUseCase.execute({ token, newPassword, confirmPassword });
    redirect("/login?reset=success");
  } catch (error) {
    if (
      error instanceof ValidationError ||
      error instanceof DomainRuleError
    ) {
      return { error: error.message, loading: false };
    }
    throw error;
  }
}
