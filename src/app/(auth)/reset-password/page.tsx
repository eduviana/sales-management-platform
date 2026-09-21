/**
 * Reset password page.
 *
 * Server Component wrapper with Suspense boundary for useSearchParams.
 * Expects a `token` query parameter.
 * Phase 2 — deliberately simple UI.
 */

import { Suspense } from "react";
import { ResetPasswordForm } from "./reset-password-form";

export default function ResetPasswordPage() {
  return (
    <Suspense
      fallback={
        <div className="flex flex-col flex-1 items-center justify-center min-h-screen bg-zinc-50 font-sans dark:bg-black">
          <p className="text-sm text-zinc-600 dark:text-zinc-400">Cargando...</p>
        </div>
      }
    >
      <ResetPasswordForm />
    </Suspense>
  );
}
