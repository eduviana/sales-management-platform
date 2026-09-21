import { describe, it, expect, beforeEach } from "vitest";
import { BcryptPasswordAdapter } from "../bcrypt-password-adapter";

describe("BcryptPasswordAdapter", () => {
  let adapter: BcryptPasswordAdapter;

  beforeEach(() => {
    adapter = new BcryptPasswordAdapter();
  });

  it("should hash a password", async () => {
    const hash = await adapter.hash("password123");
    expect(hash).toBeDefined();
    expect(hash).not.toBe("password123");
    expect(hash.length).toBeGreaterThan(0);
  });

  it("should verify a correct password", async () => {
    const hash = await adapter.hash("password123");
    const result = await adapter.verify("password123", hash);
    expect(result).toBe(true);
  });

  it("should reject an incorrect password", async () => {
    const hash = await adapter.hash("password123");
    const result = await adapter.verify("wrongpassword", hash);
    expect(result).toBe(false);
  });

  it("should produce different hashes for the same password (salt)", async () => {
    const hash1 = await adapter.hash("password123");
    const hash2 = await adapter.hash("password123");
    // Different salts should produce different hashes
    expect(hash1).not.toBe(hash2);
    // But both should verify correctly
    expect(await adapter.verify("password123", hash1)).toBe(true);
    expect(await adapter.verify("password123", hash2)).toBe(true);
  });
});
