"use client";

import { useState, useEffect, useActionState } from "react";
import { useRouter } from "next/navigation";
import { updateSale } from "@/modules/sales/presentation/sale-actions";
import type { ProductData } from "@/modules/sales/domain";

interface ExistingItem {
  productId: string;
  productName: string;
  productCode: string;
  quantity: number;
  unitPrice: number;
  subtotal: number;
}

interface SaleMetadata {
  saleDate: string;
  buyerName: string;
  notes: string;
}

interface EditSaleFormProps {
  saleId: string;
  sale: SaleMetadata;
  items: ExistingItem[];
  products: readonly ProductData[];
}

export function EditSaleForm({
  saleId,
  sale,
  items: initialItems,
  products,
}: EditSaleFormProps) {
  const router = useRouter();
  const [items, setItems] = useState<ExistingItem[]>(initialItems);
  const [selectedProductId, setSelectedProductId] = useState("");
  const [quantity, setQuantity] = useState(1);

  const updateWithId = updateSale.bind(null, saleId);
  const [state, formAction, isPending] = useActionState(updateWithId, {
    error: null,
    saleId: undefined,
  });

  const selectedProduct = products.find((p) => p.id === selectedProductId);

  const addItem = () => {
    if (!selectedProduct) return;

    const existingIndex = items.findIndex(
      (i) => i.productId === selectedProductId,
    );

    if (existingIndex >= 0) {
      const updated = [...items];
      const newQty = updated[existingIndex].quantity + quantity;
      updated[existingIndex] = {
        ...updated[existingIndex],
        quantity: newQty,
        subtotal: newQty * updated[existingIndex].unitPrice,
      };
      setItems(updated);
    } else {
      setItems([
        ...items,
        {
          productId: selectedProduct.id,
          productName: selectedProduct.name,
          productCode: selectedProduct.code,
          quantity,
          unitPrice: selectedProduct.price,
          subtotal: quantity * selectedProduct.price,
        },
      ]);
    }

    setSelectedProductId("");
    setQuantity(1);
  };

  const removeItem = (index: number) => {
    setItems(items.filter((_, i) => i !== index));
  };

  const total = items.reduce((sum, item) => sum + item.subtotal, 0);

  useEffect(() => {
    if (state.saleId) {
      router.push(`/sales/${state.saleId}`);
    }
  }, [state.saleId, router]);

  if (state.saleId) {
    return null;
  }

  const inputClass =
    "w-full px-3 py-2 bg-surface-container-low border border-outline-variant rounded-lg text-body-sm text-on-surface placeholder:text-on-surface-variant focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all";
  const labelClass = "block text-body-sm font-medium text-on-surface-variant mb-1";

  return (
    <form action={formAction} className="space-y-6">
      {state.error && (
        <div className="p-3 bg-error-container/10 border border-error/20 rounded-lg text-body-sm text-on-error-container">
          {state.error}
        </div>
      )}

      {/* Sale metadata */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label htmlFor="saleDate" className={labelClass}>
            Fecha de venta
          </label>
          <input
            type="date"
            id="saleDate"
            name="saleDate"
            defaultValue={sale.saleDate}
            className={inputClass}
          />
        </div>
        <div>
          <label htmlFor="buyerName" className={labelClass}>
            Nombre del cliente
          </label>
          <input
            type="text"
            id="buyerName"
            name="buyerName"
            defaultValue={sale.buyerName}
            className={inputClass}
          />
        </div>
      </div>

      <div>
        <label htmlFor="notes" className={labelClass}>
          Notas
        </label>
        <textarea
          id="notes"
          name="notes"
          rows={2}
          defaultValue={sale.notes}
          className={inputClass}
        />
      </div>

      {/* Add items */}
      <div className="surface-container rounded-lg p-4 space-y-4">
        <h3 className="text-body-sm font-semibold text-on-surface">Agregar productos</h3>
        <div className="flex gap-3 items-end">
          <div className="flex-1">
            <label htmlFor="product" className={labelClass}>
              Producto
            </label>
            <select
              id="product"
              value={selectedProductId}
              onChange={(e) => setSelectedProductId(e.target.value)}
              className={inputClass}
            >
              <option value="">Seleccionar producto</option>
              {products.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.code} — {p.name} (${p.price.toFixed(2)})
                </option>
              ))}
            </select>
          </div>
          <div className="w-24">
            <label htmlFor="quantity" className={labelClass}>
              Cantidad
            </label>
            <input
              type="number"
              id="quantity"
              value={quantity}
              onChange={(e) => setQuantity(parseInt(e.target.value) || 1)}
              min="1"
              className={inputClass}
            />
          </div>
          <button
            type="button"
            onClick={addItem}
            disabled={!selectedProductId}
            className="px-4 py-2 text-sm font-medium text-on-secondary bg-secondary-container rounded-lg hover:opacity-90 transition-opacity disabled:opacity-50"
          >
            Agregar
          </button>
        </div>
      </div>

      {/* Items table */}
      {items.length > 0 && (
        <div className="surface rounded-xl overflow-hidden">
          <div className="overflow-x-auto w-full">
            <table className="w-full border-collapse">
              <thead>
                <tr className="table-header">
                  <th className="py-3 px-4 text-label-md text-on-surface-variant uppercase tracking-wider text-center">
                    Producto
                  </th>
                  <th className="py-3 px-4 text-label-md text-on-surface-variant uppercase tracking-wider text-center">
                    Precio
                  </th>
                  <th className="py-3 px-4 text-label-md text-on-surface-variant uppercase tracking-wider text-center">
                    Cantidad
                  </th>
                  <th className="py-3 px-4 text-label-md text-on-surface-variant uppercase tracking-wider text-center">
                    Subtotal
                  </th>
                  <th className="py-3 px-4" />
                </tr>
              </thead>
              <tbody className="font-body-sm text-body-sm text-on-surface-dim">
                {items.map((item, index) => (
                  <tr key={item.productId} className="table-row">
                    <td className="py-3 px-4 text-center">
                      <span className="font-mono-data text-on-surface-variant">{item.productCode}</span>{" "}
                      {item.productName}
                    </td>
                    <td className="py-3 px-4 text-center font-mono-data">
                      ${item.unitPrice.toFixed(2)}
                    </td>
                    <td className="py-3 px-4 text-center">
                      {item.quantity}
                    </td>
                    <td className="py-3 px-4 text-center font-semibold font-mono-data">
                      ${item.subtotal.toFixed(2)}
                    </td>
                    <td className="py-3 px-4 text-center">
                      <button
                        type="button"
                        onClick={() => removeItem(index)}
                        className="text-error hover:text-on-error text-sm transition-colors"
                      >
                        Quitar
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
              <tfoot className="table-header">
                <tr>
                  <td colSpan={3} className="py-3 px-4 text-body-sm font-semibold text-on-surface text-right">
                    Total:
                  </td>
                  <td className="py-3 px-4 text-body-sm font-bold text-on-surface text-right font-mono-data">
                    ${total.toFixed(2)}
                  </td>
                  <td />
                </tr>
              </tfoot>
            </table>
          </div>
          <input type="hidden" name="items" value={JSON.stringify(items)} />
        </div>
      )}

      <div className="flex gap-3 pt-4">
        <button
          type="submit"
          disabled={isPending || items.length === 0}
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
