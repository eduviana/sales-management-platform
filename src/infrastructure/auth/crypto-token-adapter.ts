/**
 * Crypto-based implementation of TokenService.
 *
 * Generates cryptographically secure random tokens for password reset.
 * Uses Node.js crypto module — server-only.
 *
 * Reference: authorization.md §4, data-model.md §10.1
 */

import { randomBytes, createHash } from "crypto";
import type { TokenService } from "@/modules/identity/domain";

const TOKEN_BYTES = 32; // 256 bits of entropy
const HASH_ALGORITHM = "sha256";

export class CryptoTokenAdapter implements TokenService {
  async generate(): Promise<{ readonly raw: string; readonly hash: string }> {
    const raw = randomBytes(TOKEN_BYTES).toString("base64url");
    const hash = await this.hash(raw);
    return { raw, hash };
  }

  async hash(raw: string): Promise<string> {
    return createHash(HASH_ALGORITHM).update(raw).digest("hex");
  }
}
