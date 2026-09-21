/**
 * Server Action for change password.
 *
 * Handles form submission for changing password.
 * Used for the mustChangePassword flow and voluntary changes.
 *
 * Reference: system-architecture.md §10
 */

"use server";

import { redirect } from "next/navigation";
import { createIdentityModule } from "@/modules/identity/composition-root";
import {
  AuthenticationError,
  ValidationError,
  DomainRuleError,
} from "@/shared/errors";

export interface ChangePasswordActionState {
  readonly error: string | null;
  readonly loading: boolean;
}

export async function changePasswordAction(
  _prevState: ChangePasswordActionState,
  formData: FormData,
): Promise<ChangePasswordActionState> {
  const currentPassword = String(formData.get("currentPassword") ?? "");
  const newPassword = String(formData.get("newPassword") ?? "");
  const confirmPassword = String(formData.get("confirmPassword") ?? "");

  try {
    const { resolveIdentityUseCase, changePasswordUseCase } =
      await createIdentityModule();

    // Resolve current user from session
    const identity = await resolveIdentityUseCase.execute();
    if (!identity) {
      redirect("/login");
    }

    await changePasswordUseCase.execute({
      userId: identity.userAccount.id,
      userEmail: identity.userAccount.email,
      currentPassword,
      newPassword,
      confirmPassword,
    });

    redirect("/dashboard");
  } catch (error) {
    if (
      error instanceof ValidationError ||
      error instanceof DomainRuleError ||
      error instanceof AuthenticationError
    ) {
      return { error: error.message, loading: false };
    }
    throw error;
  }
}
