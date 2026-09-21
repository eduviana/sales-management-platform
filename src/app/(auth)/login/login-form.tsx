/**
 * Login form — Client Component.
 *
 * Handles form state and submission via Server Action.
 * Phase 2 — deliberately simple UI.
 */

"use client";

import { useActionState } from "react";
import { loginAction, type LoginActionState } from "@/modules/identity/presentation/login-action";

const initialState: LoginActionState = { error: null, loading: false };

export function LoginForm() {
  const [state, formAction, isPending] = useActionState(
    loginAction,
    initialState,
  );

  return (
    <form action={formAction} className="flex flex-col gap-4">
      <div>
        <label
          htmlFor="email"
          className="block text-sm font-medium text-zinc-700 dark:text-zinc-300"
        >
          Email
        </label>
        <input
          id="email"
          name="email"
          type="email"
          required
          autoComplete="email"
          className="mt-1 block w-full rounded-md border border-zinc-300 px-3 py-2 text-sm shadow-sm
                     focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500
                     dark:border-zinc-600 dark:bg-zinc-800 dark:text-zinc-100"
        />
      </div>
      <div>
        <label
          htmlFor="password"
          className="block text-sm font-medium text-zinc-700 dark:text-zinc-300"
        >
          Contraseña
        </label>
        <input
          id="password"
          name="password"
          type="password"
          required
          autoComplete="current-password"
          className="mt-1 block w-full rounded-md border border-zinc-300 px-3 py-2 text-sm shadow-sm
                     focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500
                     dark:border-zinc-600 dark:bg-zinc-800 dark:text-zinc-100"
        />
      </div>
      {state.error && (
        <p className="text-sm text-red-600 dark:text-red-400">{state.error}</p>
      )}
      <button
        type="submit"
        disabled={isPending}
        className="w-full rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white
                   hover:bg-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2
                   disabled:opacity-50 disabled:cursor-not-allowed
                   dark:bg-blue-500 dark:hover:bg-blue-400"
      >
        {isPending ? "Iniciando sesión..." : "Iniciar sesión"}
      </button>
    </form>
  );
}
