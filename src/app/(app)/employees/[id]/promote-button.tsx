/**
 * PromoteButton — Allows ADMIN to promote an employee to the next level.
 *
 * Only visible when the employee has enough points for the next level.
 * Promotes exactly one level (no level skipping).
 * After promotion, the progression bar resets to 0 % for the new level
 * (points are measured from the start of the current level, REG-082).
 *
 * Reference: requirements.md §3.12.3, business-rules.md REG-082
 */

"use client";

import { useActionState } from "react";
import { startTransition, useState } from "react";
import { useRouter } from "next/navigation";
import { promoteEmployee } from "./actions";

const LEVEL_NAMES: Record<number, string> = {
  1: "N1",
  2: "N2",
  3: "N3",
  4: "N4",
  5: "N5",
  6: "N6",
  7: "N7",
};

interface PromoteButtonProps {
  employeeId: string;
  employeeName: string;
  currentLevelId: number;
  nextLevelId: number;
}

export function PromoteButton({
  employeeId,
  employeeName,
  currentLevelId,
  nextLevelId,
}: PromoteButtonProps) {
  const router = useRouter();
  const [showConfirm, setShowConfirm] = useState(false);

  const [state, formAction, isPending] = useActionState(
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    async (_prev: string | null, _formData: FormData) => {
      try {
        const fd = new FormData();
        fd.set("employeeId", employeeId);
        fd.set("targetLevel", String(nextLevelId));
        await promoteEmployee(fd);
        return null;
      } catch (e) {
        return e instanceof Error ? e.message : "Error al ascender.";
      }
    },
    null,
  );

  const handleSubmit = () => {
    const fd = new FormData();
    fd.set("employeeId", employeeId);
    fd.set("targetLevel", String(nextLevelId));
    startTransition(() => {
      formAction(fd);
    });
    setShowConfirm(false);
    router.refresh();
  };

  const currentName = LEVEL_NAMES[currentLevelId] ?? `N${currentLevelId}`;
  const nextName = LEVEL_NAMES[nextLevelId] ?? `N${nextLevelId}`;

  if (!showConfirm) {
    return (
      <button
        type="button"
        onClick={() => setShowConfirm(true)}
        className="w-full px-4 py-2.5 text-sm font-medium rounded-lg bg-[#00df81] hover:bg-[#00c873] text-[#0a1b12] transition-colors"
      >
        Ascender a {nextName}
      </button>
    );
  }

  return (
    <div className="bg-surface border border-outline-variant rounded-xl p-4 space-y-3">
      <p className="text-sm text-on-surface">
        Ascender a <strong>{employeeName}</strong> de <strong>{currentName}</strong> a <strong>{nextName}</strong>?
      </p>
      <p className="text-xs text-on-surface-variant">
        El progreso hacia el siguiente nivel se medirá desde el inicio del
        nuevo nivel (la barra volverá a 0 %).
      </p>

      {state && (
        <p className="text-sm text-tertiary">{state}</p>
      )}

      <div className="flex gap-2">
        <button
          type="button"
          onClick={handleSubmit}
          disabled={isPending}
          className="flex-1 px-4 py-2 text-sm font-medium text-[#0a1b12] bg-[#00df81] rounded-lg hover:bg-[#00c873] transition-colors disabled:opacity-50"
        >
          {isPending ? "Ascendiendo..." : "Confirmar"}
        </button>
        <button
          type="button"
          onClick={() => setShowConfirm(false)}
          className="flex-1 px-4 py-2 text-sm font-medium rounded-lg bg-[#27272a] hover:bg-[#323238] text-zinc-300 border border-[#3f3f46] transition-colors"
        >
          Cancelar
        </button>
      </div>
    </div>
  );
}
