/**
 * ClientsClient — Client component for clients list.
 *
 * Reference: design/stitch/code.html
 */

"use client";

import type { Client } from "@/modules/visits/domain";
import Link from "next/link";
import { useMemo, useState } from "react";

interface ClientsClientProps {
  initialClients: Client[];
}

export function ClientsClient({ initialClients }: ClientsClientProps) {
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const pageSize = 15;

  const filteredClients = useMemo(() => {
    const query = search.trim().toLowerCase();
    return initialClients.filter((client) =>
      !query ||
      client.name.toLowerCase().includes(query) ||
      (client.phone ?? "").toLowerCase().includes(query) ||
      (client.email ?? "").toLowerCase().includes(query),
    );
  }, [initialClients, search]);

  const totalPages = Math.max(1, Math.ceil(filteredClients.length / pageSize));
  const currentPage = Math.min(page, totalPages);
  const visibleClients = filteredClients.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize,
  );

  if (initialClients.length === 0) {
    return (
      <div className="space-y-6">
        <div className="flex justify-end">
          <Link href="/clients/new" className="px-5 py-2.5 text-sm font-semibold rounded-lg bg-[#00df81] hover:bg-[#00c873] text-black transition-colors">
            Nuevo Cliente
          </Link>
        </div>
        <div className="bg-surface border border-outline-variant rounded-xl p-8 text-center">
          <p className="text-on-surface-variant">No hay clientes registrados.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="relative w-full max-w-sm">
          <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-on-surface-variant pointer-events-none" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="m21 21-4.35-4.35m2.35-5.65a8 8 0 1 1-16 0 8 8 0 0 1 16 0Z" />
          </svg>
          <input
            type="search"
            value={search}
            onChange={(event) => { setSearch(event.target.value); setPage(1); }}
            placeholder="Buscar por nombre, teléfono o email..."
            className="w-full bg-surface-container-low border border-outline-variant text-sm text-on-surface rounded-lg pl-9 pr-3 py-2 placeholder:text-on-surface-variant focus:outline-none focus:border-primary transition-colors"
          />
        </div>
        <Link href="/clients/new" className="px-5 py-2.5 text-sm font-semibold rounded-lg bg-[#00df81] hover:bg-[#00c873] text-black transition-colors text-center">
          Nuevo Cliente
        </Link>
      </div>

      <div className="bg-surface border border-outline-variant rounded-xl overflow-hidden">
      <div className="overflow-x-auto">
      <table className="w-full border-collapse">
        <thead>
          <tr className="bg-surface-container-low border-b border-outline-variant">
            <th className="py-3 px-4 font-mono text-xs text-on-surface-variant uppercase tracking-wider text-center">
              Nombre
            </th>
            <th className="py-3 px-4 font-mono text-xs text-on-surface-variant uppercase tracking-wider text-center">
              Nro.
            </th>
            <th className="py-3 px-4 font-mono text-xs text-on-surface-variant uppercase tracking-wider text-center">
              DNI
            </th>
            <th className="py-3 px-4 font-mono text-xs text-on-surface-variant uppercase tracking-wider text-center">
              Teléfono
            </th>
            <th className="py-3 px-4 font-mono text-xs text-on-surface-variant uppercase tracking-wider text-center">
              Email
            </th>
            <th className="py-3 px-4 font-mono text-xs text-on-surface-variant uppercase tracking-wider text-center">
              Dirección
            </th>
            <th className="py-3 px-4 font-mono text-xs text-on-surface-variant uppercase tracking-wider text-center">
              Fecha de Creación
            </th>
          </tr>
        </thead>
        <tbody className="text-on-surface-dim">
          {visibleClients.map((client) => (
            <tr key={client.id} className="table-row">
              <td className="py-3 px-4 text-center font-medium">{client.name}</td>
              <td className="py-3 px-4 text-center font-mono-data">CL-{String(client.clientNumber).padStart(4, "0")}</td>
              <td className="py-3 px-4 text-center">{client.documentNumber ?? "—"}</td>
              <td className="py-3 px-4 text-center">{client.phone ?? "—"}</td>
              <td className="py-3 px-4 text-center">{client.email ?? "—"}</td>
              <td className="py-3 px-4 text-center">{client.address ?? "—"}</td>
              <td className="py-3 px-4 text-center">
                {new Date(client.createdAt).toLocaleDateString("es-AR")}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      </div>
      {filteredClients.length === 0 && <p className="p-8 text-center text-on-surface-variant">No se encontraron clientes.</p>}
      <div className="flex items-center justify-between border-t border-outline-variant px-4 py-3 text-sm">
        <span className="text-on-surface-variant">{filteredClients.length} cliente{filteredClients.length === 1 ? "" : "s"}</span>
        <div className="flex items-center gap-2">
          <button type="button" onClick={() => setPage((value) => Math.max(1, value - 1))} disabled={currentPage === 1} className="px-3 py-1.5 rounded-md border border-outline-variant text-on-surface-variant hover:text-on-surface disabled:opacity-40">Anterior</button>
          <span className="text-on-surface-variant">Página {currentPage} de {totalPages}</span>
          <button type="button" onClick={() => setPage((value) => Math.min(totalPages, value + 1))} disabled={currentPage === totalPages} className="px-3 py-1.5 rounded-md border border-outline-variant text-on-surface-variant hover:text-on-surface disabled:opacity-40">Siguiente</button>
        </div>
      </div>
      </div>
    </div>
  );
}
