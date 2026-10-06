"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowUp } from "lucide-react";
import { formatLevelCode } from "@/shared/presentation/format";
import { promoteToNextLevel } from "./actions";

interface PromoteRowButtonProps {
  employeeId: string;
  employeeName: string;
  currentLevelId: number;
  nextLevelId: number;
}

/**
 * PromoteRowButton — Promotes an employee to the next level from the table.
 *
 * Only rendered when the progression bar is at 100% and the employee is below
 * the maximum level. Promotes exactly one level; the server recomputes the
 * target level and rejects any non-consecutive change.
 *
 * Reference: requirements.md §3.12.3, business-rules.md REG-082
 */
export function PromoteRowButton({
  employeeId,
  employeeName,
  currentLevelId,
  nextLevelId,
}: PromoteRowButtonProps) {
  const router = useRouter();
  const [confirming, setConfirming] = useState(false);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const currentLabel = formatLevelCode(currentLevelId);
  const nextLabel = formatLevelCode(nextLevelId);

  const handleConfirm = async () => {
    setPending(true);
    setError(null);
    const result = await promoteToNextLevel(employeeId);
    setPending(false);
    if (result.ok) {
      setConfirming(false);
      router.refresh();
    } else {
      setError(result.error ?? "Error al ascender.");
    }
  };

  if (!confirming) {
    return (
      <button
        type="button"
        onClick={() => setConfirming(true)}
        className="inline-flex items-center justify-center w-8 h-8 rounded-lg hover:bg-surface-container-high transition-colors"
        title={`Ascender a ${nextLabel}`}
      >
        <ArrowUp className="w-4 h-4 text-secondary" />
      </button>
    );
  }

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={`Confirmar ascenso de ${employeeName}`}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50"
    >
      <div className="bg-surface border border-outline-variant rounded-xl p-6 w-full max-w-md">
        <h3 className="text-lg font-semibold text-on-surface mb-2">
          Ascender a {employeeName}
        </h3>
        <p className="text-sm text-on-surface-variant mb-1">
          El empleado pasará de <strong>{currentLabel}</strong> a{" "}
          <strong>{nextLabel}</strong>.
        </p>
        <p className="text-sm text-on-surface-variant mb-4">
          El progreso hacia el siguiente nivel se medirá desde el inicio del
          nuevo nivel (la barra volverá a 0 %).
        </p>

        {error && (
          <p className="text-sm text-tertiary mb-4">{error}</p>
        )}

        <div className="flex justify-end gap-3">
          <button
            type="button"
            onClick={() => {
              setConfirming(false);
              setError(null);
            }}
            className="px-4 py-2 text-sm font-medium rounded-lg bg-[#27272a] hover:bg-[#323238] text-zinc-300 border border-[#3f3f46] transition-colors"
          >
            Cancelar
          </button>
          <button
            type="button"
            onClick={handleConfirm}
            disabled={pending}
            className="px-4 py-2 text-sm font-medium text-[#0a1b12] bg-[#00df81] rounded-lg hover:bg-[#00c873] transition-colors disabled:opacity-50"
          >
            {pending ? "Ascendiendo..." : "Ascender"}
          </button>
        </div>
      </div>
    </div>
  );
}
