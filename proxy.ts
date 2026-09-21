/**
 * Route protection proxy (Next.js 16).
 *
 * Provides coarse-grained protection for authenticated routes.
 * This is NOT the only layer of authorization — real authorization
 * happens server-side in use cases and Server Components.
 *
 * Reference: authorization.md §11, system-architecture.md §11
 */

import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getIronSession, nextProxyCookies } from "iron-session";

const COOKIE_NAME = "royal-prestige-session";

/**
 * Routes that require authentication.
 * Coarse-grained protection — redirects to /login if no session.
 */
const PROTECTED_ROUTES = ["/dashboard", "/change-password"];

/**
 * Routes that should redirect authenticated users away (e.g., login page).
 */
const AUTH_ROUTES = ["/login", "/forgot-password", "/reset-password"];

function isProtectedRoute(pathname: string): boolean {
  return PROTECTED_ROUTES.some((route) => pathname.startsWith(route));
}

function isAuthRoute(pathname: string): boolean {
  return AUTH_ROUTES.some((route) => pathname.startsWith(route));
}

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Only apply proxy logic to relevant routes
  if (!isProtectedRoute(pathname) && !isAuthRoute(pathname)) {
    return NextResponse.next();
  }

  const sessionSecret = process.env.SESSION_SECRET;
  if (!sessionSecret) {
    // If session secret is not configured, allow all requests through.
    // The use cases will fail with appropriate errors.
    return NextResponse.next();
  }

  const response = NextResponse.next();

  // Check session by attempting to unseal the cookie
  try {
    const session = await getIronSession<{ userId?: string }>(
      nextProxyCookies(request, response),
      {
        cookieName: COOKIE_NAME,
        password: sessionSecret,
        ttl: 60 * 60 * 24 * 7,
      },
    );

    const isAuthenticated = Boolean(session.userId);

    // Protected routes: redirect to login if not authenticated
    if (isProtectedRoute(pathname) && !isAuthenticated) {
      const loginUrl = new URL("/login", request.url);
      loginUrl.searchParams.set("redirect", pathname);
      return NextResponse.redirect(loginUrl);
    }

    // Auth routes: redirect to dashboard if already authenticated
    if (isAuthRoute(pathname) && isAuthenticated) {
      return NextResponse.redirect(new URL("/dashboard", request.url));
    }
  } catch {
    // Session parsing failed — treat as unauthenticated
    if (isProtectedRoute(pathname)) {
      const loginUrl = new URL("/login", request.url);
      loginUrl.searchParams.set("redirect", pathname);
      return NextResponse.redirect(loginUrl);
    }
  }

  return response;
}

export const config = {
  matcher: [
    "/dashboard/:path*",
    "/change-password",
    "/login",
    "/forgot-password",
    "/reset-password",
  ],
};
