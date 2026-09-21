/**
 * Password service port (contract).
 *
 * Application layer depends on this interface for password hashing
 * and verification. Infrastructure implements the concrete strategy.
 *
 * Reference: authorization.md §4, system-architecture.md §12
 */

export interface PasswordService {
  /**
   * Hash a plaintext password.
   * Must never log the plaintext or the resulting hash.
   */
  hash(password: string): Promise<string>;

  /**
   * Verify a plaintext password against a stored hash.
   * Returns true if the password matches.
   * Must use a constant-time comparison internally.
   */
  verify(password: string, hash: string): Promise<boolean>;
}
