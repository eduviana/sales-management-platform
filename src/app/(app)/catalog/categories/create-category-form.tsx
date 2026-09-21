"use client";

import { useActionState } from "react";
import { createCategory } from "@/modules/sales/presentation/catalog-actions";

export function CreateCategoryForm() {
  const [state, formAction, isPending] = useActionState(createCategory, {
    error: null,
    success: false,
  });

  const inputClass =
    "w-full px-3 py-2 bg-surface-container-low border border-outline-variant rounded-lg text-body-sm text-on-surface placeholder:text-on-surface-variant focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all";
  const labelClass = "block text-body-sm font-medium text-on-surface-variant mb-1";

  return (
    <form action={formAction} className="space-y-4">
      {state.error && (
        <div className="p-3 bg-error-container/10 border border-error/20 rounded-lg text-body-sm text-on-error-container">
          {state.error}
        </div>
      )}
      {state.success && (
        <div className="p-3 bg-secondary-container/10 border border-secondary/20 rounded-lg text-body-sm text-secondary">
          Categoría creada correctamente.
        </div>
      )}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label htmlFor="name" className={labelClass}>
            Nombre *
          </label>
          <input
            type="text"
            id="name"
            name="name"
            required
            className={inputClass}
          />
        </div>
        <div>
          <label htmlFor="description" className={labelClass}>
            Descripción
          </label>
          <input
            type="text"
            id="description"
            name="description"
            className={inputClass}
          />
        </div>
      </div>
      <button
        type="submit"
        disabled={isPending}
        className="px-4 py-2 text-sm font-medium text-on-primary bg-primary-container rounded-lg hover:opacity-90 transition-opacity disabled:opacity-50"
      >
        {isPending ? "Creando..." : "Crear Categoría"}
      </button>
    </form>
  );
}
