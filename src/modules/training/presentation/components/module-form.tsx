"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import {
  createTrainingModuleAction,
  updateTrainingModuleAction,
} from "../training-actions";

interface ModuleFormProps {
  mode: "create" | "edit";
  courseId: string;
  moduleId?: string;
  initialName?: string;
  initialDescription?: string;
  initialSortOrder?: number;
  onSuccess?: () => void;
}

export function ModuleForm({
  mode,
  courseId,
  moduleId,
  initialName = "",
  initialDescription = "",
  initialSortOrder = 0,
  onSuccess,
}: ModuleFormProps) {
  const [name, setName] = useState(initialName);
  const [description, setDescription] = useState(initialDescription);
  const [sortOrder, setSortOrder] = useState(initialSortOrder);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    startTransition(async () => {
      try {
        const result = mode === "create"
          ? await createTrainingModuleAction(courseId, name, description || undefined, sortOrder)
          : await updateTrainingModuleAction(moduleId!, name, description || undefined, sortOrder);

        if (result.error) {
          setError(result.error);
        } else {
          onSuccess?.();
          router.refresh();
        }
      } catch {
        setError("Error inesperado");
      }
    });
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-label-sm text-on-surface-variant mb-1">
          Nombre *
        </label>
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
          className="w-full px-3 py-2 bg-surface-container-high border border-outline-variant rounded-lg text-body-md text-on-surface focus:outline-none focus:border-primary"
        />
      </div>
      <div>
        <label className="block text-label-sm text-on-surface-variant mb-1">
          Descripción
        </label>
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          rows={3}
          className="w-full px-3 py-2 bg-surface-container-high border border-outline-variant rounded-lg text-body-md text-on-surface focus:outline-none focus:border-primary"
        />
      </div>
      <div>
        <label className="block text-label-sm text-on-surface-variant mb-1">
          Orden
        </label>
        <input
          type="number"
          value={sortOrder}
          onChange={(e) => setSortOrder(Number(e.target.value))}
          min={0}
          className="w-full px-3 py-2 bg-surface-container-high border border-outline-variant rounded-lg text-body-md text-on-surface focus:outline-none focus:border-primary"
        />
      </div>
      {error && (
        <p className="text-body-sm text-error">{error}</p>
      )}
      <div className="flex justify-end gap-2">
        <button
          type="submit"
          disabled={isPending || !name.trim()}
          className="px-4 py-2 text-sm font-medium text-on-primary bg-primary-container rounded-lg hover:opacity-90 transition-opacity disabled:opacity-50"
        >
          {isPending ? "Guardando..." : mode === "create" ? "Crear" : "Guardar"}
        </button>
      </div>
    </form>
  );
}
