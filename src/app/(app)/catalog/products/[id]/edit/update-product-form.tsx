"use client";

import { useEffect, useActionState } from "react";
import { useRouter } from "next/navigation";
import { updateProduct } from "@/modules/sales/presentation/catalog-actions";
import type { ProductCategoryData } from "@/modules/sales/domain";

interface ProductData {
  id: string;
  code: string;
  name: string;
  description: string | null;
  price: number;
  categoryId: string;
  isActive: boolean;
}

interface UpdateProductFormProps {
  product: ProductData;
  categories: readonly ProductCategoryData[];
}

export function UpdateProductForm({
  product,
  categories,
}: UpdateProductFormProps) {
  const router = useRouter();
  const updateWithId = updateProduct.bind(null, product.id);
  const [state, formAction, isPending] = useActionState(updateWithId, {
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
      <div>
        <label className={labelClass}>
          Código
        </label>
        <p className="text-body-sm font-mono-data text-on-surface-variant">{product.code}</p>
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
          defaultValue={product.name}
          className={inputClass}
        />
      </div>
      <div>
        <label htmlFor="description" className={labelClass}>
          Descripción
        </label>
        <textarea
          id="description"
          name="description"
          rows={3}
          defaultValue={product.description ?? ""}
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
            defaultValue={product.price}
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
            defaultValue={product.categoryId}
            className={inputClass}
          >
            {categories.map((cat) => (
              <option key={cat.id} value={cat.id}>
                {cat.name}
              </option>
            ))}
          </select>
        </div>
      </div>
      <div className="flex items-center gap-2">
        <input
          type="checkbox"
          id="isActive"
          name="isActive"
          defaultChecked={product.isActive}
          className="h-4 w-4 text-primary border-outline-variant rounded bg-surface-container-low"
        />
        <label htmlFor="isActive" className="text-body-sm font-medium text-on-surface-variant">
          Activo
        </label>
      </div>
      <div className="flex gap-3 pt-4">
        <button
          type="submit"
          disabled={isPending}
          className="px-4 py-2 text-sm font-medium text-on-primary bg-primary-container rounded-lg hover:opacity-90 transition-opacity disabled:opacity-50"
        >
          {isPending ? "Guardando..." : "Guardar Cambios"}
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
