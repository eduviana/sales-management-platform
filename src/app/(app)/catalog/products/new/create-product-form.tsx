"use client";

import { useEffect, useActionState } from "react";
import { useRouter } from "next/navigation";
import { createProduct } from "@/modules/sales/presentation/catalog-actions";
import type { ProductCategoryData } from "@/modules/sales/domain";

interface CreateProductFormProps {
  categories: readonly ProductCategoryData[];
}

export function CreateProductForm({ categories }: CreateProductFormProps) {
  const router = useRouter();
  const [state, formAction, isPending] = useActionState(createProduct, {
    error: null,
    success: false,
  });

  useEffect(() => {
    if (state.success) {
      router.push("/catalog");
    }
  }, [state.success, router]);

  if (state.success) {
    return null;
  }

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
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label htmlFor="code" className={labelClass}>
            Código *
          </label>
          <input
            type="text"
            id="code"
            name="code"
            required
            maxLength={50}
            className={inputClass}
          />
        </div>
        <div>
          <label htmlFor="name" className={labelClass}>
            Nombre *
          </label>
          <input
            type="text"
            id="name"
            name="name"
            required
            maxLength={200}
            className={inputClass}
          />
        </div>
      </div>
      <div>
        <label htmlFor="description" className={labelClass}>
          Descripción
        </label>
        <textarea
          id="description"
          name="description"
          rows={3}
          className={inputClass}
        />
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label htmlFor="price" className={labelClass}>
            Precio *
          </label>
          <input
            type="number"
            id="price"
            name="price"
            required
            min="0.01"
            step="0.01"
            className={inputClass}
          />
        </div>
        <div>
          <label htmlFor="categoryId" className={labelClass}>
            Categoría *
          </label>
          <select
            id="categoryId"
            name="categoryId"
            required
            className={inputClass}
          >
            <option value="">Seleccionar categoría</option>
            {categories.map((cat) => (
              <option key={cat.id} value={cat.id}>
                {cat.name}
              </option>
            ))}
          </select>
        </div>
      </div>
      <div className="flex gap-3 pt-4">
        <button
          type="submit"
          disabled={isPending}
          className="px-4 py-2 text-sm font-medium text-on-primary bg-primary-container rounded-lg hover:opacity-90 transition-opacity disabled:opacity-50"
        >
          {isPending ? "Creando..." : "Crear Producto"}
        </button>
        <button
          type="button"
          onClick={() => router.back()}
          className="px-4 py-2 text-sm font-medium text-on-surface border border-outline-variant rounded-lg hover:bg-surface-container-highest transition-colors"
        >
          Cancelar
        </button>
      </div>
    </form>
  );
}
