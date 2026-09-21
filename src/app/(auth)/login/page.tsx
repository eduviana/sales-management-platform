/**
 * Login page.
 *
 * Minimal Server Component with a Client Component form.
 * Phase 2 — deliberately simple UI.
 *
 * Reference: system-architecture.md §8, §9
 */

import { LoginForm } from "./login-form";

export default function LoginPage() {
  return (
    <div className="flex flex-col flex-1 items-center justify-center min-h-screen bg-zinc-50 font-sans dark:bg-black">
      <main className="flex flex-col w-full max-w-sm gap-6 px-6 py-16">
        <div className="text-center">
          <h1 className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50">
            Royal Prestige
          </h1>
          <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">
            Inicia sesión para continuar
          </p>
        </div>
        <LoginForm />
        <div className="text-center">
          <a
            href="/forgot-password"
            className="text-sm text-blue-600 hover:text-blue-500 dark:text-blue-400"
          >
            ¿Olvidaste tu contraseña?
          </a>
        </div>
      </main>
    </div>
  );
}
