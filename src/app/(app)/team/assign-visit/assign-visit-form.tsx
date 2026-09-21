"use client";

import { formatClientAddress } from "@/modules/visits/domain/client";
import type { Client } from "@/modules/visits/domain";
import type { TeamMember } from "@/modules/visits/application/get-team-list-use-case";
import { useMemo, useState } from "react";

export function AssignVisitForm({
  clients,
  team,
  action,
}: {
  clients: readonly Client[];
  team: readonly TeamMember[];
  action: (formData: FormData) => Promise<void>;
}) {
  const [search, setSearch] = useState("");
  const [selectedClientId, setSelectedClientId] = useState("");
  const [isClientMenuOpen, setIsClientMenuOpen] = useState(false);
  const filteredClients = useMemo(() => {
    const query = search.trim().toLowerCase();
    return clients.filter((client) =>
      !query ||
      client.name.toLowerCase().includes(query) ||
      (client.documentNumber ?? "").toLowerCase().includes(query) ||
      String(client.clientNumber).includes(query),
    );
  }, [clients, search]);

  return (
    <form action={action} className="bg-[#161618] border border-[#26262a] rounded-xl p-6 space-y-6 shadow-sm">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label htmlFor="sellerId" className="block text-[11px] font-semibold text-zinc-400 uppercase tracking-wider mb-1.5">Vendedor</label>
          <select id="sellerId" name="sellerId" required className="w-full px-3.5 py-2.5 bg-[#1c1c1f] border border-[#2d2d32] rounded-lg text-sm text-zinc-300 focus:border-[#00df81] focus:ring-1 focus:ring-[#00df81] outline-none">
            <option value="">Seleccionar vendedor</option>
            {team.filter((member) => member.status === "ACTIVE").map((member) => <option key={member.id} value={member.id}>{member.firstName} {member.lastName}</option>)}
          </select>
        </div>
        <div>
          <label htmlFor="scheduledDate" className="block text-[11px] font-semibold text-zinc-400 uppercase tracking-wider mb-1.5">Fecha programada</label>
          <input type="date" id="scheduledDate" name="scheduledDate" required className="w-full px-3.5 py-2.5 bg-[#1c1c1f] border border-[#2d2d32] rounded-lg text-sm text-zinc-200 focus:border-[#00df81] focus:ring-1 focus:ring-[#00df81] outline-none" />
        </div>
      </div>

      <div>
        <label htmlFor="clientSearch" className="block text-[11px] font-semibold text-zinc-400 uppercase tracking-wider mb-1.5">Cliente</label>
        <input type="hidden" name="clientId" value={selectedClientId} />
        <div className="relative">
          <input
            id="clientSearch"
            type="search"
            role="combobox"
            aria-expanded={isClientMenuOpen}
            aria-controls="client-options"
            autoComplete="off"
            required={!selectedClientId}
            value={search}
            onFocus={() => setIsClientMenuOpen(true)}
            onChange={(event) => {
              setSearch(event.target.value);
              setSelectedClientId("");
              setIsClientMenuOpen(true);
            }}
            placeholder="Buscar por nombre, DNI o número CL..."
            className="w-full px-3.5 py-2.5 bg-[#1c1c1f] border border-[#2d2d32] rounded-lg text-sm text-zinc-200 placeholder:text-zinc-500 focus:border-[#00df81] focus:ring-1 focus:ring-[#00df81] outline-none"
          />
          {isClientMenuOpen && (
            <div id="client-options" role="listbox" className="absolute z-10 mt-2 max-h-64 w-full overflow-y-auto rounded-lg border border-[#27272e] bg-[#1c1c1f] shadow-xl">
              {filteredClients.length > 0 ? filteredClients.map((client) => (
                <button
                  key={client.id}
                  type="button"
                  role="option"
                  aria-selected={selectedClientId === client.id}
                  onMouseDown={(event) => event.preventDefault()}
                  onClick={() => {
                    setSelectedClientId(client.id);
                    setSearch(`CL-${String(client.clientNumber).padStart(4, "0")} — ${client.name}`);
                    setIsClientMenuOpen(false);
                  }}
                  className="block w-full border-b border-[#27272e] px-4 py-3 text-left text-sm text-zinc-300 last:border-b-0 hover:bg-[#27272e]"
                >
                  <span className="block font-medium text-zinc-200">CL-{String(client.clientNumber).padStart(4, "0")} — {client.name}</span>
                  <span className="mt-1 block text-xs text-zinc-500">{client.documentNumber ?? "Sin DNI"} · {formatClientAddress(client)}</span>
                </button>
              )) : (
                <p className="px-4 py-3 text-sm text-zinc-500">No se encontraron clientes.</p>
              )}
            </div>
          )}
        </div>
        <p className="mt-1.5 text-xs text-zinc-500">Busca por nombre, DNI o número de cliente y selecciona una coincidencia.</p>
        <a href="/clients/new" className="inline-block mt-1.5 text-xs text-sky-400 hover:text-sky-300 transition-colors">Agregar un cliente nuevo</a>
      </div>

      <div><label htmlFor="notes" className="block text-[11px] font-semibold text-zinc-400 uppercase tracking-wider mb-1.5">Notas</label><textarea id="notes" name="notes" rows={3} placeholder="Información adicional de la visita" className="w-full px-3.5 py-2.5 bg-[#1c1c1f] border border-[#2d2d32] rounded-lg text-sm text-zinc-200 placeholder:text-zinc-500 focus:border-[#00df81] focus:ring-1 focus:ring-[#00df81] outline-none" /></div>
      <button type="submit" className="px-5 py-2.5 text-sm font-semibold rounded-lg bg-[#00df81] hover:bg-[#00c873] text-black transition-colors">Asignar visita</button>
    </form>
  );
}
