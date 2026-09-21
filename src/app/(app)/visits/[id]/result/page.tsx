import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/infrastructure/prisma/client";
import { createAuthorizationService } from "@/modules/authorization/composition-root";
import { createOrganizationModule } from "@/modules/organization/composition-root";
import { createVisitsUseCases } from "@/modules/visits/composition-root";
import { resolveAuthContext } from "@/modules/sales/presentation/resolve-auth-context";
import { recordVisitWithoutSale, completeVisitAndContinue } from "../../visit-actions";
import { formatVisitDate } from "@/modules/visits/domain";
import { Ban, ShoppingBag } from "lucide-react";

export default async function VisitResultPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const authContext = await resolveAuthContext();
  const auth = createAuthorizationService(prisma);
  const { organizationRepository } = createOrganizationModule(auth);
  const { getVisitList } = createVisitsUseCases(prisma, auth, organizationRepository);
  const visit = (await getVisitList.execute({ authContext })).find((item) => item.id === id);

  if (!visit || visit.status !== "assigned") {
    notFound();
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <Link href="/visits" className="inline-flex items-center text-sm font-medium text-sky-400 hover:text-sky-300 transition-colors">
        ← Volver a visitas
      </Link>

      <div>
        <h1 className="text-2xl lg:text-3xl font-bold text-white tracking-tight">
          Registrar resultado · VS-{String(visit.visitNumber).padStart(4, "0")}
        </h1>
        <p className="mt-2 text-sm text-on-surface-variant">
          Confirma qué ocurrió durante la visita realizada al cliente.
        </p>
      </div>

      <section className="bg-[#161618] border border-[#26262a] rounded-xl p-6 space-y-6 shadow-sm">
        <h2 className="text-xs font-bold text-zinc-300 uppercase tracking-wider">Información de la visita</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-sm">
          <div>
            <p className="text-[11px] font-semibold text-zinc-400 uppercase tracking-wider mb-1.5">Fecha programada</p>
            <p className="text-zinc-200">{formatVisitDate(visit.scheduledDate)}</p>
          </div>
          <div>
            <p className="text-[11px] font-semibold text-zinc-400 uppercase tracking-wider mb-1.5">Cliente</p>
            <p className="text-zinc-200">{visit.clientName ?? "Cliente sin nombre"}</p>
          </div>
          <div>
            <p className="text-[11px] font-semibold text-zinc-400 uppercase tracking-wider mb-1.5">Estado</p>
            <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-primary/10 text-primary border border-primary/20">Pendiente</span>
          </div>
        </div>
        <div className="border-t border-[#27272e] pt-5">
          <p className="text-[11px] font-semibold text-zinc-400 uppercase tracking-wider mb-3">Dirección</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 text-sm">
            <div><p className="text-xs text-zinc-500 mb-1">Provincia / Estado</p><p className="text-zinc-200">{visit.visitProvince ?? "—"}</p></div>
            <div><p className="text-xs text-zinc-500 mb-1">Ciudad / Localidad</p><p className="text-zinc-200">{visit.visitCity ?? "—"}</p></div>
            <div><p className="text-xs text-zinc-500 mb-1">Código postal</p><p className="text-zinc-200">{visit.visitPostalCode ?? "—"}</p></div>
            <div><p className="text-xs text-zinc-500 mb-1">Calle y número</p><p className="text-zinc-200">{[visit.visitStreet, visit.visitStreetNumber].filter(Boolean).join(" ") || "—"}</p></div>
            <div><p className="text-xs text-zinc-500 mb-1">Piso</p><p className="text-zinc-200">{visit.visitFloor ?? "—"}</p></div>
            <div><p className="text-xs text-zinc-500 mb-1">Departamento</p><p className="text-zinc-200">{visit.visitApartment ?? "—"}</p></div>
            <div className="sm:col-span-2"><p className="text-xs text-zinc-500 mb-1">Referencias</p><p className="text-zinc-200">{visit.visitAddressNotes ?? "—"}</p></div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
          <form action={completeVisitAndContinue} className="border border-[#27272e] rounded-xl p-5 space-y-4 bg-[#141417]">
            <input type="hidden" name="visitId" value={visit.id} />
            <div className="flex items-center gap-3">
              <ShoppingBag className="w-5 h-5 text-[#00df81]" aria-hidden="true" />
              <h2 className="text-sm font-semibold text-zinc-200">La visita terminó con una venta</h2>
            </div>
            <p className="text-sm text-zinc-500">Continúa con la carga de productos, pago, entrega y facturación.</p>
            <button type="submit" className="w-full px-5 py-3 text-sm font-semibold rounded-lg bg-[#00df81] hover:bg-[#00c873] text-black transition-colors">Registrar venta</button>
          </form>

          <form action={recordVisitWithoutSale} className="border border-[#27272e] rounded-xl p-5 space-y-4 bg-[#141417]">
            <input type="hidden" name="visitId" value={visit.id} />
            <div className="flex items-center gap-3">
              <Ban className="w-5 h-5 text-zinc-400" aria-hidden="true" />
              <h2 className="text-sm font-semibold text-zinc-200">La visita terminó sin venta</h2>
            </div>
            <div>
              <label htmlFor="visit-notes" className="block text-[11px] font-semibold text-zinc-400 uppercase tracking-wider mb-1.5">Resultado de la visita</label>
              <textarea id="visit-notes" name="notes" rows={3} required placeholder="Indica qué ocurrió durante la visita" className="w-full px-3.5 py-2.5 bg-[#1c1c1f] border border-[#2d2d32] rounded-lg text-sm text-zinc-200 placeholder:text-zinc-500 focus:border-[#00df81] focus:ring-1 focus:ring-[#00df81] outline-none transition-colors" />
            </div>
            <button type="submit" className="w-full px-5 py-3 text-sm font-medium rounded-lg bg-[#27272a] hover:bg-[#323238] text-zinc-300 hover:text-white border border-[#3f3f46] transition-colors">Registrar sin venta</button>
          </form>
        </div>
      </section>
    </div>
  );
}
