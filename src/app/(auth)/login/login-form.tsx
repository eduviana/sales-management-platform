/**
 * Login form — Client Component.
 *
 * Handles form state and submission via Server Action.
 * Visual reference: design/stitch/login-code.html (Google Stitch).
 */

"use client";

import { useActionState, useState } from "react";
import Link from "next/link";
import {
  loginAction,
  type LoginActionState,
} from "@/modules/identity/presentation/login-action";

const initialState: LoginActionState = { error: null, loading: false };

const inputClassName =
  "block w-full rounded-xl border border-outline-variant/80 bg-[#121215] py-3 pl-10 pr-4 text-sm text-white placeholder:text-zinc-500 focus:border-secondary focus:bg-[#15151a] focus:ring-2 focus:ring-secondary/25 focus:outline-none transition duration-150";

export function LoginForm() {
  const [state, formAction, isPending] = useActionState(
    loginAction,
    initialState,
  );
  const [showPassword, setShowPassword] = useState(false);

  return (
    <form action={formAction} className="space-y-5">
      {/* Field: Email */}
      <div className="space-y-2">
        <label
          htmlFor="email"
          className="block text-xs font-semibold tracking-wider text-on-surface-variant uppercase"
        >
          Email corporativo
        </label>
        <div className="relative">
          <span className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5 text-on-surface-dim">
            <svg
              aria-hidden="true"
              className="h-4 w-4"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              viewBox="0 0 24 24"
            >
              <path
                d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.207"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </span>
          <input
            id="email"
            name="email"
            type="email"
            required
            autoComplete="email"
            placeholder="ejemplo@royalprestige.com"
            className={inputClassName}
          />
        </div>
      </div>

      {/* Field: Contraseña */}
      <div className="space-y-2">
        <label
          htmlFor="password"
          className="block text-xs font-semibold tracking-wider text-on-surface-variant uppercase"
        >
          Contraseña
        </label>
        <div className="relative">
          <span className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5 text-on-surface-dim">
            <svg
              aria-hidden="true"
              className="h-4 w-4"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              viewBox="0 0 24 24"
            >
              <rect
                x="3"
                y="11"
                width="18"
                height="11"
                rx="2"
                ry="2"
              />
              <path d="M7 11V7a5 5 0 0110 0v4" />
            </svg>
          </span>
          <input
            id="password"
            name="password"
            type={showPassword ? "text" : "password"}
            required
            autoComplete="current-password"
            placeholder="••••••••••••"
            className={`${inputClassName} pr-11`}
          />
          <button
            type="button"
            onClick={() => setShowPassword((visible) => !visible)}
            aria-label={
              showPassword ? "Ocultar contraseña" : "Mostrar contraseña"
            }
            aria-pressed={showPassword}
            title={
              showPassword ? "Ocultar contraseña" : "Mostrar contraseña"
            }
            className="absolute inset-y-0 right-0 flex items-center pr-3.5 text-zinc-400 transition-colors hover:text-zinc-200 focus-visible:ring-2 focus-visible:ring-secondary/40 focus-visible:outline-none"
          >
            {showPassword ? (
              <svg
                aria-hidden="true"
                className="h-4 w-4"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                viewBox="0 0 24 24"
              >
                <path
                  d="M3.98 8.223A10.477 10.477 0 001.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.45 10.45 0 0112 4.5c4.756 0 8.773 3.162 10.065 7.498a10.523 10.523 0 01-4.293 5.774M6.228 6.228L3 3m3.228 3.228l3.65 3.65m7.894 7.894L21 21m-3.228-3.228l-3.65-3.65m0 0a3 3 0 10-4.243-4.243m4.242 4.242L9.88 9.88"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            ) : (
              <svg
                aria-hidden="true"
                className="h-4 w-4"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                viewBox="0 0 24 24"
              >
                <path
                  d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                <path
                  d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            )}
          </button>
        </div>
      </div>

      {/* Server Action error */}
      {state.error && (
        <p
          role="alert"
          className="rounded-lg border border-error/20 bg-error/10 px-3 py-2 text-sm text-error"
        >
          {state.error}
        </p>
      )}

      {/* Forgot password */}
      <div className="flex justify-end pt-1">
        <Link
          href="/forgot-password"
          className="text-xs font-medium text-secondary underline-offset-4 transition-colors hover:text-secondary/90 hover:underline"
        >
          ¿Olvidaste tu contraseña?
        </Link>
      </div>

      {/* Submit */}
      <div className="pt-2">
        <button
          type="submit"
          disabled={isPending}
          className="flex w-full cursor-pointer items-center justify-center gap-2 rounded-xl bg-secondary px-4 py-3.5 text-sm font-bold tracking-wide text-on-secondary shadow-[0_0_35px_-5px_rgba(78,222,163,0.25)] transition duration-200 ease-out hover:-translate-y-0.5 hover:bg-secondary/90 hover:shadow-[0_0_30px_rgba(78,222,163,0.4)] active:translate-y-0 focus-visible:ring-2 focus-visible:ring-secondary/50 focus-visible:outline-none disabled:translate-y-0 disabled:cursor-not-allowed disabled:opacity-60 disabled:shadow-none"
        >
          <span>{isPending ? "Iniciando sesión..." : "Iniciar sesión"}</span>
          {!isPending && (
            <svg
              aria-hidden="true"
              className="h-4 w-4 stroke-[2.5]"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          )}
        </button>
      </div>
    </form>
  );
}
