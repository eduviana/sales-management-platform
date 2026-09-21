/**
 * Resolve identity use case.
 *
 * Resolves the full authenticated identity from the current session.
 * This is the primary entry point for determining "who is the current user?"
 *
 * Reference: authorization.md §4, system-architecture.md §11
 */

import type {
  SessionPort,
  IdentityRepository,
} from "@/modules/identity/domain";
import { AuthenticatedIdentity } from "@/modules/identity/domain";

export class ResolveIdentityUseCase {
  constructor(
    private readonly sessionPort: SessionPort,
    private readonly identityRepository: IdentityRepository,
  ) {}

  /**
   * Resolve the current authenticated identity from the session.
   *
   * @returns The resolved identity, or null if no valid session exists.
   * @throws AuthenticationError if the session exists but the account is invalid.
   */
  async execute(): Promise<AuthenticatedIdentity | null> {
    // 1. Resolve session
    const session = await this.sessionPort.resolve();
    if (!session) {
      return null;
    }

    // 2. Load full identity from database
    const record = await this.identityRepository.findById(session.userId);
    if (!record) {
      // Session references a deleted user — destroy invalid session
      await this.sessionPort.destroy();
      return null;
    }

    // 3. Build identity
    const identity = new AuthenticatedIdentity(
      record.userAccount,
      record.employee,
    );

    // 4. Check if identity is valid
    if (!identity.isValid) {
      // Account or employee is inactive — destroy session
      await this.sessionPort.destroy();
      return null;
    }

    return identity;
  }
}
