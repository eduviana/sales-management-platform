import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/infrastructure/prisma/client";
import { createAuthorizationService } from "@/modules/authorization/composition-root";
import { createOrganizationModule } from "@/modules/organization/composition-root";
import { createVisitsUseCases } from "@/modules/visits/composition-root";
import { resolveAuthContext } from "@/modules/sales/presentation/resolve-auth-context";
import { VISIT_STATUS_COLORS, VISIT_STATUS_LABELS, formatVisitDate } from "@/modules/visits/domain";

export default async function VisitDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const authContext = await resolveAuthContext();
  const auth = createAuthorizationService(prisma);
  const { organizationRepository } = createOrganizationModule(auth);
  const { getVisitList } = createVisitsUseCases(prisma, auth, organizationRepository);
  const ownVisits = await getVisitList.execute({ authContext });
  const teamVisits = authContext.levelId !== null && authContext.levelId >= 3
    ? await getVisitList.execute({ authContext, scope: "TEAM" })
    : [];
  const visit = [...ownVisits, ...teamVisits].find((item) => item.id === id);

  if (!visit) notFound();

  const statusConfig = VISIT_STATUS_COLORS[visit.status];

  return (
    <div className="max-w-3xl mx-auto space-y-8">
      <Link href="/visits" className="inline-flex items-center text-sm font-medium text-sky-400 hover:text-sky-300 transition-colors">
        ← Volver a visitas
      </Link>

      <div className="flex items-center justify-between gap-4">
        <h1 className="text-2xl lg:text-3xl font-bold text-white tracking-tight">
          Visita VS-{String(visit.visitNumber).padStart(4, "0")}
        </h1>
        <span className={`${statusConfig.bg} ${statusConfig.text} border ${statusConfig.border} px-3 py-1 rounded-full text-xs font-semibold`}>
          {VISIT_STATUS_LABELS[visit.status]}
        </span>
      </div>

      <section className="bg-[#161618] border border-[#27272e] rounded-xl p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <p className="text-[11px] font-semibold text-zinc-400 uppercase tracking-wider mb-1.5">Cliente</p>
            <p className="text-on-surface-dim">{visit.clientName ?? "Cliente sin nombre"}</p>
          </div>
          <div>
            <p className="text-[11px] font-semibold text-zinc-400 uppercase tracking-wider mb-1.5">Fecha programada</p>
            <p className="text-on-surface-dim">{formatVisitDate(visit.scheduledDate)}</p>
          </div>
          {visit.completedDate && (
            <div>
              <p className="text-[11px] font-semibold text-zinc-400 uppercase tracking-wider mb-1.5">Fecha realizada</p>
              <p className="text-on-surface-dim">{formatVisitDate(visit.completedDate)}</p>
            </div>
          )}
          <div>
            <p className="text-[11px] font-semibold text-zinc-400 uppercase tracking-wider mb-1.5">Teléfono</p>
            <p className="text-on-surface-dim">{visit.clientPhone ?? "—"}</p>
          </div>
          <div>
            <p className="text-[11px] font-semibold text-zinc-400 uppercase tracking-wider mb-1.5">Email</p>
            <p className="text-on-surface-dim break-all">{visit.clientEmail ?? "—"}</p>
          </div>
          <div>
            <p className="text-[11px] font-semibold text-zinc-400 uppercase tracking-wider mb-1.5">DNI / Documento</p>
            <p className="text-on-surface-dim">{visit.clientDocumentNumber ?? "—"}</p>
          </div>
          <div className="md:col-span-2 border-t border-[#27272e] pt-5">
            <p className="text-[11px] font-semibold text-zinc-400 uppercase tracking-wider mb-1.5">Dirección de la visita</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div><p className="text-xs text-zinc-500 mb-1">Provincia / Estado</p><p className="text-on-surface-dim">{visit.visitProvince ?? "—"}</p></div>
              <div><p className="text-xs text-zinc-500 mb-1">Ciudad / Localidad</p><p className="text-on-surface-dim">{visit.visitCity ?? "—"}</p></div>
              <div><p className="text-xs text-zinc-500 mb-1">Código postal</p><p className="text-on-surface-dim">{visit.visitPostalCode ?? "—"}</p></div>
              <div><p className="text-xs text-zinc-500 mb-1">Calle</p><p className="text-on-surface-dim">{visit.visitStreet ?? "—"}</p></div>
              <div><p className="text-xs text-zinc-500 mb-1">Número</p><p className="text-on-surface-dim">{visit.visitStreetNumber ?? "—"}</p></div>
              <div><p className="text-xs text-zinc-500 mb-1">Piso</p><p className="text-on-surface-dim">{visit.visitFloor ?? "—"}</p></div>
              <div><p className="text-xs text-zinc-500 mb-1">Departamento</p><p className="text-on-surface-dim">{visit.visitApartment ?? "—"}</p></div>
              <div><p className="text-xs text-zinc-500 mb-1">Referencias</p><p className="text-on-surface-dim">{visit.visitAddressNotes ?? "—"}</p></div>
            </div>
          </div>
          <div className="md:col-span-2 border-t border-[#27272e] pt-5">
            <p className="text-[11px] font-semibold text-zinc-400 uppercase tracking-wider mb-1.5">Notas</p>
            <p className="text-on-surface-dim whitespace-pre-wrap">{visit.notes ?? "Sin notas registradas."}</p>
          </div>
        </div>
      </section>
    </div>
  );
}
