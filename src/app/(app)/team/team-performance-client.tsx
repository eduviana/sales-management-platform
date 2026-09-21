/**
 * TeamPerformanceClient — Client component for team performance table with pagination.
 *
 * Shows the same TeamPerformanceTable used in the dashboard,
 * but with client-side pagination (15 records per page).
 *
 * Reference: design/stitch/code.html
 */

"use client";

import { useState } from "react";
import { TeamPerformanceTable } from "@/modules/analytics/presentation/components/TeamPerformanceTable";
import type { TeamPerformanceRow } from "@/modules/analytics/domain";

interface TeamPerformanceClientProps {
  initialData: TeamPerformanceRow[];
}

const PAGE_SIZE = 15;

export function TeamPerformanceClient({ initialData }: TeamPerformanceClientProps) {
  const [page, setPage] = useState(1);

  const totalPages = Math.ceil(initialData.length / PAGE_SIZE);
  const start = (page - 1) * PAGE_SIZE;
  const pageData = initialData.slice(start, start + PAGE_SIZE);

  if (initialData.length === 0) {
    return (
      <div className="bg-surface border border-outline-variant rounded-xl p-8 text-center">
        <p className="text-on-surface-variant">No hay miembros en el equipo para mostrar.</p>
      </div>
    );
  }

  return (
    <div className="bg-surface border border-outline-variant rounded-xl overflow-hidden flex flex-col">
      <TeamPerformanceTable data={pageData} />

      {totalPages > 1 && (
        <div className="flex items-center justify-between px-4 py-3 border-t border-outline-variant">
          <p className="text-sm text-on-surface-variant">
            Mostrando {start + 1}–{Math.min(start + PAGE_SIZE, initialData.length)} de{" "}
            {initialData.length}
          </p>
          <div className="flex gap-2">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
              className="px-3 py-1.5 text-sm font-medium rounded-lg bg-[#27272a] hover:bg-[#323238] text-zinc-300 border border-[#3f3f46] transition-colors disabled:opacity-50"
            >
              Anterior
            </button>
            <button
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
              className="px-3 py-1.5 text-sm font-medium rounded-lg bg-[#27272a] hover:bg-[#323238] text-zinc-300 border border-[#3f3f46] transition-colors disabled:opacity-50"
            >
              Siguiente
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
