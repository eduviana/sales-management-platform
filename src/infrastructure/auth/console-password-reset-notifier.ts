/**
 * Development password reset notifier adapter.
 *
 * Logs a ready-to-use password reset link so the recovery flow can be
 * completed locally. Email delivery is not implemented yet (the mail
 * provider is still undefined; see requirements.md §3.1).
 *
 * When a real provider is chosen, replace this adapter with an
 * implementation that sends an email (e.g., SMTP, Resend) without
 * changing the PasswordResetNotifier port.
 *
 * Reference: authorization.md §4, requirements.md §3.1
 */

import type { PasswordResetNotifier } from "@/modules/identity/domain";

export class ConsolePasswordResetNotifier implements PasswordResetNotifier {
  constructor(private readonly appUrl: string) {}

  async notify(rawToken: string, email: string): Promise<void> {
    const resetUrl = new URL("/reset-password", this.appUrl);
    resetUrl.searchParams.set("token", rawToken);

    console.info(
      `[PasswordReset] Enlace de restablecimiento para ${email}: ${resetUrl.toString()}`,
    );
  }
}
