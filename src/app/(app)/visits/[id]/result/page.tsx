import Link from "next/link";
import { notFound } from "next/navigation";
import { createVisitsUseCases } from "@/modules/visits/composition-root";
import { resolveAuthContext } from "@/modules/identity/resolve-auth-context";
import { recordVisitWithoutSale, completeVisitAndContinue } from "../../visit-actions";
import { formatDateOnly } from "@/shared/presentation/format";
import { Ban, MapPin, ShoppingBag } from "lucide-react";
import {
  DisplayField as Field,
  SectionCard,
} from "@/shared/presentation/components";

/**
 * Visit result page.
 *
 * Lets the seller register the outcome of a performed visit: with sale
 * (continues to sale flow) or without sale (stores notes).
 *
 * Visual reference: design/stitch/DESIGN.md
 * Reference: business-rules.md REG-066, REG-067
 */

export default async function VisitResultPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const authContext = await resolveAuthContext();
  const { getVisitList } = createVisitsUseCases();
  const visit = (await getVisitList.execute({ authContext })).find((item) => item.id === id);

  if (!visit || visit.status !== "assigned") {
    notFound();
  }

  return (
    <div className="w-full space-y-6">
      <Link
        href="/visits"
        className="inline-flex items-center text-sm font-medium text-sky-400 hover:text-sky-300 transition-colors"
      >
        ← Volver a visitas
      </Link>

      {/* Header */}
      <div className="flex flex-wrap items-center gap-4">
        <div className="bg-primary/10 text-sky-400 w-12 h-12 rounded-xl flex items-center justify-center">
          <ShoppingBag className="w-6 h-6" aria-hidden="true" />
        </div>
        <div>
          <h1 className="text-2xl lg:text-3xl font-bold text-white tracking-tight">
            Registrar resultado · VS-{String(visit.visitNumber).padStart(4, "0")}
          </h1>
          <p className="text-sm text-on-surface-variant mt-0.5">
            Confirma qué ocurrió durante la visita realizada al cliente.
          </p>
        </div>
      </div>

      {/* Overview strip */}
      <section className="bg-surface-container border border-outline-variant rounded-2xl p-7 relative overflow-hidden">
        <div className="absolute -right-10 -bottom-10 w-44 h-44 bg-sky-400/5 rounded-full blur-3xl pointer-events-none" />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-x-10 gap-y-6">
          <Field label="Fecha programada" value={formatDateOnly(visit.scheduledDate)} />
          <Field label="Cliente" value={visit.clientName ?? "Cliente sin nombre"} />
          <div>
            <p className="text-[11px] font-semibold text-on-surface-variant uppercase tracking-wider mb-1">
              Estado
            </p>
            <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-primary/10 text-primary border border-primary/20">
              Pendiente
            </span>
          </div>
        </div>
      </section>

      {/* Address */}
      <SectionCard
        icon={<MapPin className="w-4 h-4 text-on-surface" aria-hidden="true" />}
        accent="bg-tertiary/10 text-tertiary"
        title="Dirección de la visita"
      >
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-x-10 gap-y-6">
          <Field label="Provincia / Estado" value={visit.visitProvince ?? "—"} />
          <Field label="Ciudad / Localidad" value={visit.visitCity ?? "—"} />
          <Field label="Código postal" value={visit.visitPostalCode ?? "—"} />
          <Field label="Calle y número" value={[visit.visitStreet, visit.visitStreetNumber].filter(Boolean).join(" ") || "—"} />
          <Field label="Piso" value={visit.visitFloor ?? "—"} />
          <Field label="Departamento" value={visit.visitApartment ?? "—"} />
          <div className="sm:col-span-2">
            <Field label="Referencias" value={visit.visitAddressNotes ?? "—"} />
          </div>
        </div>
      </SectionCard>

      {/* Outcome actions */}
      <SectionCard
        icon={<ShoppingBag className="w-4 h-4 text-on-surface" aria-hidden="true" />}
        accent="bg-[#00df81]/10 text-[#00df81]"
        title="Resultado de la visita"
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <form action={completeVisitAndContinue} className="border border-outline-variant rounded-xl p-5 space-y-4 bg-surface-container-low">
            <input type="hidden" name="visitId" value={visit.id} />
            <div className="flex items-center gap-3">
              <ShoppingBag className="w-5 h-5 text-[#00df81]" aria-hidden="true" />
              <h2 className="text-sm font-semibold text-on-surface">La visita terminó con una venta</h2>
            </div>
            <p className="text-sm text-on-surface-variant">
              Continúa con la carga de productos, pago, entrega y facturación.
            </p>
            <button
              type="submit"
              className="w-full px-5 py-3 text-sm font-semibold rounded-lg bg-[#00df81] hover:bg-[#00c873] text-black transition-colors"
            >
              Registrar venta
            </button>
          </form>

          <form action={recordVisitWithoutSale} className="border border-outline-variant rounded-xl p-5 space-y-4 bg-surface-container-low">
            <input type="hidden" name="visitId" value={visit.id} />
            <div className="flex items-center gap-3">
              <Ban className="w-5 h-5 text-on-surface-variant" aria-hidden="true" />
              <h2 className="text-sm font-semibold text-on-surface">La visita terminó sin venta</h2>
            </div>
            <div>
              <label htmlFor="visit-notes" className="block text-[11px] font-semibold text-on-surface-variant uppercase tracking-wider mb-1.5">
                Resultado de la visita
              </label>
              <textarea
                id="visit-notes"
                name="notes"
                rows={3}
                required
                placeholder="Indica qué ocurrió durante la visita"
                className="w-full px-3.5 py-2.5 bg-surface-container-low border border-outline-variant rounded-lg text-sm text-on-surface placeholder:text-on-surface-variant focus:border-[#00df81] focus:ring-1 focus:ring-[#00df81] outline-none transition-colors"
              />
            </div>
            <button
              type="submit"
              className="w-full px-5 py-3 text-sm font-medium rounded-lg bg-surface-container-high hover:bg-surface-container-highest text-on-surface border border-outline-variant transition-colors"
            >
              Registrar sin venta
            </button>
          </form>
        </div>
      </SectionCard>
    </div>
  );
}