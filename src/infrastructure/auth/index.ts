/**
 * Barrel export for Infrastructure auth adapters.
 *
 * These adapters implement the ports defined in the Identity domain.
 * Only import from server-side code.
 */

export { BcryptPasswordAdapter } from "./bcrypt-password-adapter";
export { CryptoTokenAdapter } from "./crypto-token-adapter";
export { createSessionAdapter } from "./iron-session-adapter";
export { NoopPasswordResetNotifier } from "./noop-password-reset-notifier";
export { PrismaIdentityRepository } from "./prisma-identity-repository";
