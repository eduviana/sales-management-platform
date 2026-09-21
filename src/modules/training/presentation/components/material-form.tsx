"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import {
  createTrainingMaterialAction,
  updateTrainingMaterialAction,
} from "../training-actions";
import type { ContentType, ContentStatus } from "../../domain";

interface MaterialFormProps {
  mode: "create" | "edit";
  moduleId: string;
  materialId?: string;
  initialName?: string;
  initialDescription?: string;
  initialType?: ContentType;
  initialUrl?: string;
  initialLevelId?: number | null;
  initialStatus?: ContentStatus;
  onSuccess?: () => void;
}

const CONTENT_TYPES: { value: ContentType; label: string }[] = [
  { value: "PDF", label: "PDF" },
  { value: "VIDEO", label: "Video" },
  { value: "DOCUMENT", label: "Documento" },
  { value: "LINK", label: "Enlace" },
];

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

export function MaterialForm({
  mode,
  moduleId,
  materialId,
  initialName = "",
  initialDescription = "",
  initialType = "PDF",
  initialUrl = "",
  initialLevelId = null,
  initialStatus = "DRAFT",
}: MaterialFormProps) {
  const [name, setName] = useState(initialName);
  const [description, setDescription] = useState(initialDescription);
  const [type, setType] = useState<ContentType>(initialType);
  const [url, setUrl] = useState(initialUrl);
  const [levelId, setLevelId] = useState<string>(initialLevelId?.toString() ?? "");
  const [status, setStatus] = useState<ContentStatus>(initialStatus);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    const parsedLevelId = levelId === "" ? undefined : Number(levelId);

    startTransition(async () => {
      try {
        const result = mode === "create"
          ? await createTrainingMaterialAction(
              moduleId,
              name,
              type,
              description || undefined,
              url || undefined,
              parsedLevelId,
            )
          : await updateTrainingMaterialAction(
              materialId!,
              name,
              description || undefined,
              type,
              url || undefined,
              parsedLevelId ?? null,
              status,
            );

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
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-label-sm text-on-surface-variant mb-1">
            Tipo *
          </label>
          <select
            value={type}
            onChange={(e) => setType(e.target.value as ContentType)}
            className="w-full px-3 py-2 bg-surface-container-high border border-outline-variant rounded-lg text-body-md text-on-surface focus:outline-none focus:border-primary"
          >
            {CONTENT_TYPES.map((ct) => (
              <option key={ct.value} value={ct.value}>{ct.label}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-label-sm text-on-surface-variant mb-1">
            Nivel objetivo
          </label>
          <select
            value={levelId}
            onChange={(e) => setLevelId(e.target.value)}
            className="w-full px-3 py-2 bg-surface-container-high border border-outline-variant rounded-lg text-body-md text-on-surface focus:outline-none focus:border-primary"
          >
            {LEVEL_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>{opt.label}</option>
            ))}
          </select>
        </div>
      </div>
      <div>
        <label className="block text-label-sm text-on-surface-variant mb-1">
          URL del contenido
        </label>
        <input
          type="url"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          placeholder="https://..."
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
