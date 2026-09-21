/**
 * No-op password reset notifier adapter.
 *
 * Satisfies the PasswordResetNotifier port during Phase 2 when
 * email delivery is not yet implemented. Logs the raw token for
 * development purposes only.
 *
 * When email integration is added, replace this with a real
 * implementation (e.g., Resend, SMTP, etc.).
 *
 * Reference: authorization.md §4
 */

import type { PasswordResetNotifier } from "@/modules/identity/domain";

export class NoopPasswordResetNotifier implements PasswordResetNotifier {
  async notify(rawToken: string, email: string): Promise<void> {
    // Phase 2: email not yet implemented. Log for development.
    console.log(
      `[PasswordReset] Token for ${email}: ${rawToken} (delivery not implemented)`,
    );
  }
}
