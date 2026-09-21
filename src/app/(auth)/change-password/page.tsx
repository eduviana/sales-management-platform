/**
 * Change password page.
 *
 * Minimal Server Component with a Client Component form.
 * Used when mustChangePassword is true after first login.
 * Phase 2 — deliberately simple UI.
 */

"use client";

import { useActionState } from "react";
import {
  changePasswordAction,
  type ChangePasswordActionState,
} from "@/modules/identity/presentation/change-password-action";

const initialState: ChangePasswordActionState = { error: null, loading: false };

export default function ChangePasswordPage() {
  const [state, formAction, isPending] = useActionState(
    changePasswordAction,
    initialState,
  );

  return (
    <div className="flex flex-col flex-1 items-center justify-center min-h-screen bg-zinc-50 font-sans dark:bg-black">
      <main className="flex flex-col w-full max-w-sm gap-6 px-6 py-16">
        <div className="text-center">
          <h1 className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50">
            Cambiar contraseña
          </h1>
          <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">
            Debes cambiar tu contraseña para continuar
          </p>
        </div>
        <form action={formAction} className="flex flex-col gap-4">
          <div>
            <label
              htmlFor="currentPassword"
              className="block text-sm font-medium text-zinc-700 dark:text-zinc-300"
            >
              Contraseña actual
            </label>
            <input
              id="currentPassword"
              name="currentPassword"
              type="password"
              required
              autoComplete="current-password"
              className="mt-1 block w-full rounded-md border border-zinc-300 px-3 py-2 text-sm shadow-sm
                         focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500
                         dark:border-zinc-600 dark:bg-zinc-800 dark:text-zinc-100"
            />
          </div>
          <div>
            <label
              htmlFor="newPassword"
              className="block text-sm font-medium text-zinc-700 dark:text-zinc-300"
            >
              Nueva contraseña
            </label>
            <input
              id="newPassword"
              name="newPassword"
              type="password"
              required
              minLength={8}
              autoComplete="new-password"
              className="mt-1 block w-full rounded-md border border-zinc-300 px-3 py-2 text-sm shadow-sm
                         focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500
                         dark:border-zinc-600 dark:bg-zinc-800 dark:text-zinc-100"
            />
          </div>
          <div>
            <label
              htmlFor="confirmPassword"
              className="block text-sm font-medium text-zinc-700 dark:text-zinc-300"
            >
              Confirmar contraseña
            </label>
            <input
              id="confirmPassword"
              name="confirmPassword"
              type="password"
              required
              minLength={8}
              autoComplete="new-password"
              className="mt-1 block w-full rounded-md border border-zinc-300 px-3 py-2 text-sm shadow-sm
                         focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500
                         dark:border-zinc-600 dark:bg-zinc-800 dark:text-zinc-100"
            />
          </div>
          {state.error && (
            <p className="text-sm text-red-600 dark:text-red-400">
              {state.error}
            </p>
          )}
          <button
            type="submit"
            disabled={isPending}
            className="w-full rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white
                       hover:bg-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2
                       disabled:opacity-50 disabled:cursor-not-allowed
                       dark:bg-blue-500 dark:hover:bg-blue-400"
          >
            {isPending ? "Actualizando..." : "Actualizar contraseña"}
          </button>
        </form>
      </main>
    </div>
  );
}
