/**
 * Bcrypt implementation of PasswordService.
 *
 * Uses bcryptjs (pure JavaScript) for password hashing and verification.
 * This is a server-only module — never import from Client Components.
 *
 * Reference: authorization.md §4, system-architecture.md §12
 */

import bcrypt from "bcryptjs";
import type { PasswordService } from "@/modules/identity/domain";

const SALT_ROUNDS = 12;

export class BcryptPasswordAdapter implements PasswordService {
  async hash(password: string): Promise<string> {
    return bcrypt.hash(password, SALT_ROUNDS);
  }

  async verify(password: string, hash: string): Promise<boolean> {
    return bcrypt.compare(password, hash);
  }
}
