"use client";

import { useState } from "react";
import Link from "next/link";

interface Product {
  id: string;
  code: string;
  name: string;
  price: number;
  isActive: boolean;
}

interface CatalogTableProps {
  products: Product[];
  canCreate: boolean;
}

export function CatalogTable({ products, canCreate }: CatalogTableProps) {
  const [search, setSearch] = useState("");

  const filtered = products.filter(
    (p) =>
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      p.code.toLowerCase().includes(search.toLowerCase()),
  );

  return (
    <>
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold text-on-surface mb-1">Catálogo</h1>
        {canCreate && (
          <Link
            href="/catalog/products/new"
            className="px-4 py-2 text-sm font-medium text-on-primary bg-primary-container rounded-lg hover:opacity-90 transition-opacity"
          >
            Nuevo Producto
          </Link>
        )}
      </div>

      {/* Search */}
      <div className="relative max-w-sm">
        <svg
          className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-on-surface-variant pointer-events-none"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
          />
        </svg>
        <input
          type="text"
          placeholder="Buscar por nombre o código..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full bg-surface-container-low border border-outline-variant text-sm text-on-surface rounded-lg pl-9 pr-3 py-2 placeholder:text-on-surface-variant focus:outline-none focus:border-primary transition-colors"
        />
      </div>

      {/* Products table */}
      <div className="surface rounded-xl overflow-hidden">
        <div className="overflow-x-auto w-full">
          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-surface-container-low border-b border-[#27272e]">
                <th className="py-3 px-4 text-xs text-on-surface-variant uppercase tracking-wider text-center">
                  Código
                </th>
                <th className="py-3 px-4 text-xs text-on-surface-variant uppercase tracking-wider text-center">
                  Nombre
                </th>
                <th className="py-3 px-4 text-xs text-on-surface-variant uppercase tracking-wider text-center">
                  Precio
                </th>
                <th className="py-3 px-4 text-xs text-on-surface-variant uppercase tracking-wider text-center">
                  Estado
                </th>
              </tr>
            </thead>
            <tbody className="font-body-sm text-body-sm text-on-surface-dim">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={4} className="py-8 text-center text-on-surface-variant">
                    {products.length === 0
                      ? "No hay productos registrados."
                      : "No se encontraron productos."}
                  </td>
                </tr>
              ) : (
                filtered.map((product) => (
                  <tr key={product.id} className="table-row">
                    <td className="py-3 px-4 text-center font-mono-data text-on-surface-variant">
                      {product.code}
                    </td>
                    <td className="py-3 px-4 text-center font-semibold">
                      {product.name}
                    </td>
                    <td className="py-3 px-4 text-center font-mono-data">
                      ${product.price.toFixed(2)}
                    </td>
                    <td className="py-3 px-4 text-center">
                      <span
                        className={`badge ${product.isActive ? "badge-success" : "badge-error"}`}
                      >
                        {product.isActive ? "Activo" : "Inactivo"}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
}
