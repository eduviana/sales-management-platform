/**
 * Token service port (contract).
 *
 * Application layer depends on this interface for generating and
 * verifying password reset tokens. Infrastructure implements the
 * concrete strategy using cryptographically secure random generation.
 *
 * Reference: authorization.md §4, data-model.md §10.1
 */

export interface TokenService {
  /**
   * Generate a cryptographically secure random token.
   * Returns the raw token (to be sent to the user via email)
   * and its hash (to be stored in the database).
   */
  generate(): Promise<{ readonly raw: string; readonly hash: string }>;

  /**
   * Hash a raw token for lookup in the database.
   * Uses the same hashing strategy as generate().
   */
  hash(raw: string): Promise<string>;
}
