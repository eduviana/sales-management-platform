/**
 * Forgot password page.
 *
 * Minimal Server Component with a Client Component form.
 * Phase 2 — deliberately simple UI.
 */

"use client";

import { useActionState } from "react";
import {
  forgotPasswordAction,
  type ForgotPasswordActionState,
} from "@/modules/identity/presentation/forgot-password-action";

const initialState: ForgotPasswordActionState = {
  success: false,
  error: null,
  loading: false,
};

export default function ForgotPasswordPage() {
  const [state, formAction, isPending] = useActionState(
    forgotPasswordAction,
    initialState,
  );

  return (
    <div className="flex flex-col flex-1 items-center justify-center min-h-screen bg-zinc-50 font-sans dark:bg-black">
      <main className="flex flex-col w-full max-w-sm gap-6 px-6 py-16">
        <div className="text-center">
          <h1 className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50">
            Recuperar contraseña
          </h1>
          <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">
            Ingresa tu email para recibir un enlace de recuperación
          </p>
        </div>

        {state.success ? (
          <div className="rounded-md bg-green-50 p-4 dark:bg-green-900/20">
            <p className="text-sm text-green-700 dark:text-green-300">
              Si el email existe en nuestro sistema, recibirás un enlace para
              recuperar tu contraseña.
            </p>
          </div>
        ) : (
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
              {isPending ? "Enviando..." : "Enviar enlace"}
            </button>
          </form>
        )}

        <div className="text-center">
          <a
            href="/login"
            className="text-sm text-blue-600 hover:text-blue-500 dark:text-blue-400"
          >
            Volver al inicio de sesión
          </a>
        </div>
      </main>
    </div>
  );
}
