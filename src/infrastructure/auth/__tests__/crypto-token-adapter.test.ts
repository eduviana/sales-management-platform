import { describe, it, expect, beforeEach } from "vitest";
import { CryptoTokenAdapter } from "../crypto-token-adapter";

describe("CryptoTokenAdapter", () => {
  let adapter: CryptoTokenAdapter;

  beforeEach(() => {
    adapter = new CryptoTokenAdapter();
  });

  it("should generate a token with raw and hash", async () => {
    const { raw, hash } = await adapter.generate();
    expect(raw).toBeDefined();
    expect(hash).toBeDefined();
    expect(raw.length).toBeGreaterThan(0);
    expect(hash.length).toBeGreaterThan(0);
  });

  it("should produce different tokens on each call", async () => {
    const token1 = await adapter.generate();
    const token2 = await adapter.generate();
    expect(token1.raw).not.toBe(token2.raw);
    expect(token1.hash).not.toBe(token2.hash);
  });

  it("should hash a raw token consistently", async () => {
    const hash1 = await adapter.hash("test-token");
    const hash2 = await adapter.hash("test-token");
    expect(hash1).toBe(hash2);
  });

  it("should produce different hashes for different inputs", async () => {
    const hash1 = await adapter.hash("token-1");
    const hash2 = await adapter.hash("token-2");
    expect(hash1).not.toBe(hash2);
  });

  it("should produce base64url-encoded raw tokens", async () => {
    const { raw } = await adapter.generate();
    // base64url uses A-Z, a-z, 0-9, -, _
    expect(raw).toMatch(/^[A-Za-z0-9_-]+$/);
  });
});
