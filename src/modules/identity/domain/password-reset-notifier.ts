/**
 * Password reset notifier port (contract).
 *
 * Delivers the raw password reset token to the user via an external
 * channel (email, SMS, etc.). The use case calls this port with the
 * raw token instead of returning it.
 *
 * This prevents the raw token from being exposed to the client browser.
 *
 * Reference: authorization.md §4
 */

export interface PasswordResetNotifier {
  /**
   * Deliver a raw password reset token to the user.
   *
   * @param rawToken - The raw token to deliver (never stored in DB).
   * @param email - The user's email address.
   */
  notify(rawToken: string, email: string): Promise<void>;
}
