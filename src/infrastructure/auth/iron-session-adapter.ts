/**
 * iron-session implementation of SessionPort.
 *
 * Uses encrypted cookies to transport session data.
 * The session contains only the UserAccount ID; the full identity
 * is resolved server-side by loading from the database.
 *
 * This adapter is designed for Next.js App Router and uses the
 * cookie store from `next/headers`.
 *
 * Reference: authorization.md §4, system-architecture.md §12
 */

import { getIronSession } from "iron-session";
import type { SessionPort, SessionData } from "@/modules/identity/domain";
import { env } from "@/infrastructure/config/env";

const COOKIE_NAME = "royal-prestige-session";
const SESSION_TTL = 60 * 60 * 24 * 7; // 7 days in seconds

/**
 * Session shape stored in the encrypted cookie.
 * Only contains the UserAccount ID — minimal data.
 */
interface IronSessionData {
  userId?: string;
}

/**
 * Creates a SessionPort backed by iron-session encrypted cookies.
 *
 * Must be called from server-side code (Server Components, Server Actions,
 * Route Handlers, middleware). The cookieStore is obtained from `await cookies()`.
 */
export function createSessionAdapter(
  cookieStore: {
    get: (name: string) => { name: string; value: string } | undefined;
    set: (
      name: string,
      value: string,
      options: Record<string, unknown>,
    ) => unknown;
  },
): SessionPort {
  const sessionOptions = {
    cookieName: COOKIE_NAME,
    password: env.SESSION_SECRET,
    ttl: SESSION_TTL,
    cookieOptions: {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax" as const,
      path: "/",
    },
  };

  async function getSession() {
    return getIronSession<IronSessionData>(cookieStore, sessionOptions);
  }

  return {
    async create(userId: string): Promise<void> {
      const session = await getSession();
      session.userId = userId;
      await session.save();
    },

    async destroy(): Promise<void> {
      const session = await getSession();
      session.destroy();
    },

    async resolve(): Promise<SessionData | null> {
      const session = await getSession();
      if (!session.userId) {
        return null;
      }
      return { userId: session.userId };
    },
  };
}
