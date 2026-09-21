import Link from "next/link";
import { createClient } from "../client-actions";

export default function NewClientPage() {
  return (
    <div className="max-w-3xl mx-auto space-y-8">
      <Link href="/clients" className="inline-flex items-center text-sm font-medium text-sky-400 hover:text-sky-300 transition-colors">← Volver a clientes</Link>
      <div>
        <h1 className="text-2xl lg:text-3xl font-bold text-white tracking-tight">Nuevo Cliente</h1>
        <p className="mt-2 text-sm text-on-surface-variant">Registra un cliente para luego asignarle visitas.</p>
      </div>

      <form action={createClient} className="bg-[#161618] border border-[#26262a] rounded-xl p-6 space-y-6 shadow-sm">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label htmlFor="name" className="block text-[11px] font-semibold text-zinc-400 uppercase tracking-wider mb-1.5">Nombre completo</label>
            <input id="name" name="name" required placeholder="Nombre completo del cliente" className="w-full px-3.5 py-2.5 bg-[#1c1c1f] border border-[#2d2d32] rounded-lg text-sm text-zinc-200 placeholder:text-zinc-500 focus:border-[#00df81] focus:ring-1 focus:ring-[#00df81] outline-none" />
          </div>
          <div>
            <label htmlFor="phone" className="block text-[11px] font-semibold text-zinc-400 uppercase tracking-wider mb-1.5">Teléfono</label>
            <input id="phone" name="phone" required type="tel" placeholder="Teléfono de contacto" className="w-full px-3.5 py-2.5 bg-[#1c1c1f] border border-[#2d2d32] rounded-lg text-sm text-zinc-200 placeholder:text-zinc-500 focus:border-[#00df81] focus:ring-1 focus:ring-[#00df81] outline-none" />
          </div>
          <div>
            <label htmlFor="documentNumber" className="block text-[11px] font-semibold text-zinc-400 uppercase tracking-wider mb-1.5">DNI / Documento <span className="normal-case tracking-normal">(opcional)</span></label>
            <input id="documentNumber" name="documentNumber" placeholder="Número de documento" className="w-full px-3.5 py-2.5 bg-[#1c1c1f] border border-[#2d2d32] rounded-lg text-sm text-zinc-200 placeholder:text-zinc-500 focus:border-[#00df81] focus:ring-1 focus:ring-[#00df81] outline-none" />
          </div>
          <div>
            <label htmlFor="email" className="block text-[11px] font-semibold text-zinc-400 uppercase tracking-wider mb-1.5">Email <span className="normal-case tracking-normal">(opcional)</span></label>
            <input id="email" name="email" type="email" placeholder="cliente@ejemplo.com" className="w-full px-3.5 py-2.5 bg-[#1c1c1f] border border-[#2d2d32] rounded-lg text-sm text-zinc-200 placeholder:text-zinc-500 focus:border-[#00df81] focus:ring-1 focus:ring-[#00df81] outline-none" />
          </div>
          <div>
            <label htmlFor="province" className="block text-[11px] font-semibold text-zinc-400 uppercase tracking-wider mb-1.5">Provincia / Estado</label>
            <input id="province" name="province" required placeholder="Provincia o estado" className="w-full px-3.5 py-2.5 bg-[#1c1c1f] border border-[#2d2d32] rounded-lg text-sm text-zinc-200 placeholder:text-zinc-500 focus:border-[#00df81] focus:ring-1 focus:ring-[#00df81] outline-none" />
          </div>
          <div>
            <label htmlFor="city" className="block text-[11px] font-semibold text-zinc-400 uppercase tracking-wider mb-1.5">Ciudad / Localidad</label>
            <input id="city" name="city" required placeholder="Ciudad o localidad" className="w-full px-3.5 py-2.5 bg-[#1c1c1f] border border-[#2d2d32] rounded-lg text-sm text-zinc-200 placeholder:text-zinc-500 focus:border-[#00df81] focus:ring-1 focus:ring-[#00df81] outline-none" />
          </div>
          <div>
            <label htmlFor="postalCode" className="block text-[11px] font-semibold text-zinc-400 uppercase tracking-wider mb-1.5">Código postal <span className="normal-case tracking-normal">(opcional)</span></label>
            <input id="postalCode" name="postalCode" placeholder="Código postal" className="w-full px-3.5 py-2.5 bg-[#1c1c1f] border border-[#2d2d32] rounded-lg text-sm text-zinc-200 placeholder:text-zinc-500 focus:border-[#00df81] focus:ring-1 focus:ring-[#00df81] outline-none" />
          </div>
          <div>
            <label htmlFor="street" className="block text-[11px] font-semibold text-zinc-400 uppercase tracking-wider mb-1.5">Calle</label>
            <input id="street" name="street" required placeholder="Nombre de la calle" className="w-full px-3.5 py-2.5 bg-[#1c1c1f] border border-[#2d2d32] rounded-lg text-sm text-zinc-200 placeholder:text-zinc-500 focus:border-[#00df81] focus:ring-1 focus:ring-[#00df81] outline-none" />
          </div>
          <div>
            <label htmlFor="streetNumber" className="block text-[11px] font-semibold text-zinc-400 uppercase tracking-wider mb-1.5">Número</label>
            <input id="streetNumber" name="streetNumber" required placeholder="Altura" className="w-full px-3.5 py-2.5 bg-[#1c1c1f] border border-[#2d2d32] rounded-lg text-sm text-zinc-200 placeholder:text-zinc-500 focus:border-[#00df81] focus:ring-1 focus:ring-[#00df81] outline-none" />
          </div>
          <div>
            <label htmlFor="floor" className="block text-[11px] font-semibold text-zinc-400 uppercase tracking-wider mb-1.5">Piso <span className="normal-case tracking-normal">(opcional)</span></label>
            <input id="floor" name="floor" placeholder="Piso" className="w-full px-3.5 py-2.5 bg-[#1c1c1f] border border-[#2d2d32] rounded-lg text-sm text-zinc-200 placeholder:text-zinc-500 focus:border-[#00df81] focus:ring-1 focus:ring-[#00df81] outline-none" />
          </div>
          <div>
            <label htmlFor="apartment" className="block text-[11px] font-semibold text-zinc-400 uppercase tracking-wider mb-1.5">Departamento <span className="normal-case tracking-normal">(opcional)</span></label>
            <input id="apartment" name="apartment" placeholder="Departamento" className="w-full px-3.5 py-2.5 bg-[#1c1c1f] border border-[#2d2d32] rounded-lg text-sm text-zinc-200 placeholder:text-zinc-500 focus:border-[#00df81] focus:ring-1 focus:ring-[#00df81] outline-none" />
          </div>
          <div>
            <label htmlFor="addressNotes" className="block text-[11px] font-semibold text-zinc-400 uppercase tracking-wider mb-1.5">Referencias <span className="normal-case tracking-normal">(opcional)</span></label>
            <input id="addressNotes" name="addressNotes" placeholder="Entre calles, referencias" className="w-full px-3.5 py-2.5 bg-[#1c1c1f] border border-[#2d2d32] rounded-lg text-sm text-zinc-200 placeholder:text-zinc-500 focus:border-[#00df81] focus:ring-1 focus:ring-[#00df81] outline-none" />
          </div>
        </div>
        <button type="submit" className="px-5 py-2.5 text-sm font-semibold rounded-lg bg-[#00df81] hover:bg-[#00c873] text-black transition-colors">Guardar cliente</button>
      </form>
    </div>
  );
}
