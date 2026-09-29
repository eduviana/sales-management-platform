"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { updateTrainingMaterialLevelAction } from "../training-actions";

interface MaterialLevelSelectProps {
  materialId: string;
  currentLevelId: number | null;
}

const LEVEL_OPTIONS = [
  { value: "", label: "Todos los niveles" },
  { value: "1", label: "Nivel 1" },
  { value: "2", label: "Nivel 2" },
  { value: "3", label: "Nivel 3" },
  { value: "4", label: "Nivel 4" },
  { value: "5", label: "Nivel 5" },
  { value: "6", label: "Nivel 6" },
  { value: "7", label: "Nivel 7" },
];

export function MaterialLevelSelect({
  materialId,
  currentLevelId,
}: MaterialLevelSelectProps) {
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  function handleChange(e: React.ChangeEvent<HTMLSelectElement>) {
    const value = e.target.value;
    const parsedLevelId = value === "" ? null : Number(value);

    setError(null);
    startTransition(async () => {
      try {
        const result = await updateTrainingMaterialLevelAction(materialId, parsedLevelId);
        if (result.error) {
          setError(result.error);
        } else {
          router.refresh();
        }
      } catch {
        setError("Error inesperado");
      }
    });
  }

  return (
    <div>
      <select
        value={currentLevelId?.toString() ?? ""}
        onChange={handleChange}
        disabled={isPending}
        className="px-2.5 py-1.5 text-xs bg-surface-container-high border border-outline-variant rounded-lg text-on-surface focus:outline-none focus:border-primary transition-colors disabled:opacity-50"
        title="Cambiar el nivel objetivo de este material"
      >
        {LEVEL_OPTIONS.map((opt) => (
          <option key={opt.value} value={opt.value}>{opt.label}</option>
        ))}
      </select>
      {error && <p className="mt-1 text-xs text-error">{error}</p>}
    </div>
  );
}