/**
 * Error boundary for the authenticated app.
 *
 * Unexpected failures (including infrastructure errors re-thrown by pages)
 * land here instead of being rendered as a 404. In production Next.js
 * sanitizes the error message, so only a generic message is shown.
 *
 * Reference: system-architecture.md §7, ADR-020
 */

"use client";

import { useEffect } from "react";

export default function AppError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("[app-error]", error);
  }, [error]);

  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center gap-4 text-center">
      <h1 className="text-lg font-semibold text-on-surface">
        Algo salió mal
      </h1>
      <p className="max-w-md text-sm text-on-surface-variant">
        No pudimos cargar esta sección. Intentá nuevamente en unos instantes.
      </p>
      <button
        type="button"
        onClick={reset}
        className="px-5 py-2.5 text-xs font-bold text-[#0a1b12] bg-[#00df81] rounded-lg hover:bg-[#00c873] transition-colors"
      >
        Reintentar
      </button>
    </div>
  );
}
