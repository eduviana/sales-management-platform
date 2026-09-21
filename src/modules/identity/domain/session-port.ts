/**
 * Session port (contract).
 *
 * Application layer depends on this interface for session management.
 * The concrete implementation (e.g., iron-session encrypted cookies)
 * lives in Infrastructure. The domain never knows how sessions are
 * stored or transported.
 *
 * Reference: authorization.md §4, system-architecture.md §12
 */

/**
 * Data stored in the session.
 * Currently just the UserAccount ID — the full identity is resolved
 * server-side by loading from the database.
 */
export interface SessionData {
  readonly userId: string;
}

export interface SessionPort {
  /**
   * Create a new session for the given user.
   * Stores the UserAccount ID in an encrypted cookie.
   */
  create(userId: string): Promise<void>;

  /**
   * Destroy the current session (logout).
   */
  destroy(): Promise<void>;

  /**
   * Resolve the current session.
   * Returns the session data if a valid session exists, null otherwise.
   */
  resolve(): Promise<SessionData | null>;
}
