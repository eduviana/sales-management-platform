/**
 * Typed environment configuration.
 *
 * Centralizes access to environment variables with runtime validation.
 * Only import from server-side code (Infrastructure, Application, Server Components).
 *
 * Reference: system-architecture.md (server-only boundaries)
 */

import "dotenv/config";

function requireEnv(name: string): string {
  const value = process.env[name];
  if (!value) {
    throw new Error(
      `Required environment variable '${name}' is not set. ` +
        "Check your .env file or environment configuration.",
    );
  }
  return value;
}

function optionalEnv(name: string, defaultValue: string): string {
  return process.env[name] ?? defaultValue;
}

/**
 * Application environment configuration.
 * All values are validated at startup.
 */
export const env = {
  /** Full PostgreSQL connection URL (includes credentials). */
  DATABASE_URL: requireEnv("DATABASE_URL"),

  /** Application environment. */
  NODE_ENV: optionalEnv("NODE_ENV", "development"),

  /** Secret for iron-session encrypted cookies (minimum 32 characters). */
  SESSION_SECRET: requireEnv("SESSION_SECRET"),

  /** Base URL used to build links delivered to users (e.g., password reset). */
  APP_URL: optionalEnv("APP_URL", "http://localhost:3000"),
} as const;
