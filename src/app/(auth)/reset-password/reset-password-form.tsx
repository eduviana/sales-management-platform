/**
 * Reset password form — Client Component.
 *
 * Handles form state and submission via Server Action.
 * Phase 2 — deliberately simple UI.
 */

"use client";

import { useActionState } from "react";
import { useSearchParams } from "next/navigation";
import {
  resetPasswordAction,
  type ResetPasswordActionState,
} from "@/modules/identity/presentation/reset-password-action";

const initialState: ResetPasswordActionState = { error: null, loading: false };

export function ResetPasswordForm() {
  const searchParams = useSearchParams();
  const token = searchParams.get("token") ?? "";

  const [state, formAction, isPending] = useActionState(
    resetPasswordAction,
    initialState,
  );

  if (!token) {
    return (
      <div className="flex flex-col flex-1 items-center justify-center min-h-screen bg-zinc-50 font-sans dark:bg-black">
        <main className="flex flex-col w-full max-w-sm gap-6 px-6 py-16">
          <div className="text-center">
            <h1 className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50">
              Token inválido
            </h1>
            <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">
              El enlace de recuperación no es válido o está incompleto.
            </p>
          </div>
          <div className="text-center">
            <a
              href="/forgot-password"
              className="text-sm text-blue-600 hover:text-blue-500 dark:text-blue-400"
            >
              Solicitar un nuevo enlace
            </a>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="flex flex-col flex-1 items-center justify-center min-h-screen bg-zinc-50 font-sans dark:bg-black">
      <main className="flex flex-col w-full max-w-sm gap-6 px-6 py-16">
        <div className="text-center">
          <h1 className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50">
            Nueva contraseña
          </h1>
          <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">
            Ingresa tu nueva contraseña
          </p>
        </div>
        <form action={formAction} className="flex flex-col gap-4">
          <input type="hidden" name="token" value={token} />
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
