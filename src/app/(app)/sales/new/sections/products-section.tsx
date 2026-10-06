/**
 * Products section — Section 3 of the sale creation form.
 *
 * Product selection, items table, and totals.
 */

"use client";

import type { FieldErrors } from "react-hook-form";
import type { ProductData } from "@/modules/sales/domain";
import type { CreateSaleFormValues, SaleItem } from "../create-sale-form-schema";
import {
  inputClass,
  selectClass,
  labelClass,
  errorClass,
} from "../form-styles";

interface ProductsSectionProps {
  errors: FieldErrors<CreateSaleFormValues>;
  submitCount: number;
  products: readonly ProductData[];
  items: SaleItem[];
  selectedProductId: string;
  quantity: number;
  selectedProduct: ProductData | undefined;
  subtotal: number;
  total: number;
  onSelectProduct: (id: string) => void;
  onSetQuantity: (qty: number) => void;
  onAddItem: () => void;
  onRemoveItem: (index: number) => void;
}

export function ProductsSection({
  errors,
  submitCount,
  products,
  items,
  selectedProductId,
  quantity,
  subtotal,
  total,
  onSelectProduct,
  onSetQuantity,
  onAddItem,
  onRemoveItem,
}: ProductsSectionProps) {
  return (
    <>
      {/* Product selector */}
      <div className="bg-[#161618] border border-[#26262a] rounded-xl p-6 space-y-6 shadow-sm">
        <h3 className="text-xs font-bold text-zinc-300 uppercase tracking-wider">
          Productos vendidos
        </h3>

        <div className="flex flex-col sm:flex-row gap-4 items-end">
          <div className="flex-1">
            <label htmlFor="product" className={labelClass}>
              Producto
            </label>
            <select
              id="product"
              value={selectedProductId}
              onChange={(e) => onSelectProduct(e.target.value)}
              className={selectClass}
            >
              <option value="">Seleccionar producto</option>
              {products.map((product) => (
                <option key={product.id} value={product.id}>
                  {product.code} — {product.name} ($
                  {product.price.toFixed(2)})
                </option>
              ))}
            </select>
          </div>

          <div className="w-full sm:w-28">
            <label htmlFor="quantity" className={labelClass}>
              Cantidad
            </label>
            <input
              type="number"
              id="quantity"
              min="1"
              step="1"
              value={quantity}
              onChange={(e) => {
                const value = Number(e.target.value);
                onSetQuantity(
                  Number.isInteger(value) && value >= 1 ? value : 1,
                );
              }}
              className={inputClass}
            />
          </div>

          <button
            type="button"
            onClick={onAddItem}
            disabled={!selectedProductId}
            className="w-full sm:w-auto px-5 py-2.5 text-sm font-semibold rounded-lg bg-[#00df81] hover:bg-[#00c873] text-black transition-colors shadow-sm disabled:opacity-50"
          >
            Agregar
          </button>
        </div>

        {submitCount > 0 && errors.items && (
          <p className={errorClass}>{errors.items.message}</p>
        )}
      </div>

      {/* Items table */}
      {items.length > 0 && (
        <div className="bg-surface border border-[#27272e] rounded-xl overflow-hidden">
          <div className="overflow-x-auto w-full">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-[#27272e] bg-[#141417]">
                  <th className="py-3.5 px-6 text-xs font-semibold text-on-surface-variant uppercase tracking-wider">
                    Producto
                  </th>
                  <th className="py-3.5 px-6 text-xs font-semibold text-on-surface-variant uppercase tracking-wider text-right">
                    Precio
                  </th>
                  <th className="py-3.5 px-6 text-xs font-semibold text-on-surface-variant uppercase tracking-wider text-center">
                    Cantidad
                  </th>
                  <th className="py-3.5 px-6 text-xs font-semibold text-on-surface-variant uppercase tracking-wider text-right">
                    Subtotal
                  </th>
                  <th className="py-3.5 px-6" />
                </tr>
              </thead>

              <tbody className="text-on-surface-dim">
                {items.map((item, index) => (
                  <tr
                    key={item.productId}
                    className="hover:bg-surface-container transition-colors"
                  >
                    <td className="py-4 px-6 text-sm font-medium text-on-surface-dim">
                      <span className="text-on-surface-variant">
                        {item.productCode}
                      </span>{" "}
                      {item.productName}
                    </td>
                    <td className="py-4 px-6 text-sm text-on-surface-dim text-right font-mono">
                      ${item.unitPrice.toFixed(2)}
                    </td>
                    <td className="py-4 px-6 text-sm text-on-surface-dim text-center">
                      {item.quantity}
                    </td>
                    <td className="py-4 px-6 text-sm text-on-surface-dim font-semibold text-right font-mono">
                      ${item.subtotal.toFixed(2)}
                    </td>
                    <td className="py-4 px-6 text-center">
                      <button
                        type="button"
                        onClick={() => onRemoveItem(index)}
                        className="text-sm text-rose-400 hover:text-rose-300 transition-colors"
                      >
                        Quitar
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>

              <tfoot>
                <tr className="border-t border-[#27272e] bg-[#141417]/70">
                  <td
                    colSpan={3}
                    className="py-4 px-6 text-sm font-semibold text-on-surface text-right"
                  >
                    Subtotal:
                  </td>
                  <td className="py-4 px-6 text-sm font-mono text-right">
                    ${subtotal.toFixed(2)}
                  </td>
                  <td />
                </tr>
                <tr className="border-t border-[#27272e] bg-[#141417]/70">
                  <td
                    colSpan={3}
                    className="py-4 px-6 text-sm font-bold text-on-surface text-right"
                  >
                    Total:
                  </td>
                  <td className="py-4 px-6 text-base font-bold text-white text-right font-mono">
                    ${total.toFixed(2)}
                  </td>
                  <td />
                </tr>
              </tfoot>
            </table>
          </div>
        </div>
      )}
    </>
  );
}
