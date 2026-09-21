"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import {
  createTrainingCourseAction,
  updateTrainingCourseAction,
} from "../training-actions";
import type { ContentStatus } from "../../domain";

interface CourseFormProps {
  mode: "create" | "edit";
  categoryId: string;
  courseId?: string;
  initialName?: string;
  initialDescription?: string;
  initialStatus?: ContentStatus;
  onSuccess?: () => void;
}

export function CourseForm({
  mode,
  categoryId,
  courseId,
  initialName = "",
  initialDescription = "",
  initialStatus = "DRAFT",
  onSuccess,
}: CourseFormProps) {
  const [name, setName] = useState(initialName);
  const [description, setDescription] = useState(initialDescription);
  const [status, setStatus] = useState<ContentStatus>(initialStatus);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    startTransition(async () => {
      try {
        const result = mode === "create"
          ? await createTrainingCourseAction(categoryId, name, description || undefined)
          : await updateTrainingCourseAction(courseId!, name, description || undefined, status);

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
      {mode === "edit" && (
        <div>
          <label className="block text-label-sm text-on-surface-variant mb-1">
            Estado
          </label>
          <select
            value={status}
            onChange={(e) => setStatus(e.target.value as ContentStatus)}
            className="w-full px-3 py-2 bg-surface-container-high border border-outline-variant rounded-lg text-body-md text-on-surface focus:outline-none focus:border-primary"
          >
            <option value="DRAFT">Borrador</option>
            <option value="PUBLISHED">Publicado</option>
            <option value="ARCHIVED">Archivado</option>
          </select>
        </div>
      )}
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
