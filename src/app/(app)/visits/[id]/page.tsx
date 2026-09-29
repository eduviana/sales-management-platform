import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/infrastructure/prisma/client";
import { createAuthorizationService } from "@/modules/authorization/composition-root";
import { createOrganizationModule } from "@/modules/organization/composition-root";
import { createVisitsUseCases } from "@/modules/visits/composition-root";
import { resolveAuthContext } from "@/modules/sales/presentation/resolve-auth-context";
import { VISIT_STATUS_COLORS, VISIT_STATUS_LABELS, formatVisitDate } from "@/modules/visits/domain";
import type { VisitStatus } from "@/modules/visits/domain";
import {
  CalendarDays,
  CheckCircle2,
  MapPin,
  Phone,
  StickyNote,
  User,
  XCircle,
} from "lucide-react";

/**
 * Visit detail page.
 *
 * Shows all the information of a single visit in separated tonal cards so the
 * content breathes and the status stands out.
 *
 * Visual reference: design/stitch/DESIGN.md
 * Reference: business-rules.md REG-066, REG-067
 */

function Field({ label, value, mono = false }: { label: string; value: string; mono?: boolean }) {
  return (
    <div>
      <p className="text-[11px] font-semibold text-on-surface-variant uppercase tracking-wider mb-1">
        {label}
      </p>
      <p className={`text-on-surface text-base ${mono ? "font-mono" : "font-medium"}`}>{value}</p>
    </div>
  );
}

function StatusPill({ status }: { status: VisitStatus }) {
  const config = VISIT_STATUS_COLORS[status];
  const isCompleted = status === "completed";
  return (
    <span
      className={`inline-flex items-center gap-1.5 ${config.bg} ${config.text} border ${config.border} px-3.5 py-1.5 rounded-full text-sm font-semibold`}
    >
      {isCompleted ? <CheckCircle2 className="w-4 h-4" aria-hidden="true" /> : null}
      {VISIT_STATUS_LABELS[status]}
    </span>
  );
}

function SectionCard({
  icon,
  accent,
  title,
  children,
  className = "",
}: {
  icon: React.ReactNode;
  accent: string;
  title: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <section
      className={`bg-surface-container border border-outline-variant rounded-2xl p-7 ${className}`}
    >
      <div className="flex items-center gap-2.5 mb-6">
        <div className={`p-2 rounded-lg ${accent}`}>{icon}</div>
        <h2 className="text-sm font-semibold text-on-surface uppercase tracking-wider">{title}</h2>
      </div>
      {children}
    </section>
  );
}

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

  const isCancelled = visit.status === "cancelled";

  return (
    <div className="w-full space-y-6">
      <Link
        href="/visits"
        className="inline-flex items-center text-sm font-medium text-sky-400 hover:text-sky-300 transition-colors"
      >
        ← Volver a visitas
      </Link>

      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
            isCancelled ? "bg-surface-container-high text-on-surface-variant" : "bg-primary/10 text-sky-400"
          }`}>
            {isCancelled ? <XCircle className="w-6 h-6" aria-hidden="true" /> : <CalendarDays className="w-6 h-6" aria-hidden="true" />}
          </div>
          <div>
            <h1 className="text-2xl lg:text-3xl font-bold text-white tracking-tight">
              Visita VS-{String(visit.visitNumber).padStart(4, "0")}
            </h1>
            <p className="text-sm text-on-surface-variant mt-0.5">
              {visit.clientName ?? "Cliente sin nombre"} · Programada el {formatVisitDate(visit.scheduledDate)}
            </p>
          </div>
        </div>
        <StatusPill status={visit.status} />
      </div>

      {/* Overview strip — dates and state */}
      <section className="bg-surface-container border border-outline-variant rounded-2xl p-7 relative overflow-hidden">
        <div className="absolute -right-10 -bottom-10 w-44 h-44 bg-sky-400/5 rounded-full blur-3xl pointer-events-none" />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-10 gap-y-6">
          <Field label="Estado" value={VISIT_STATUS_LABELS[visit.status]} />
          <Field label="Fecha programada" value={formatVisitDate(visit.scheduledDate)} />
          <Field label="Fecha realizada" value={visit.completedDate ? formatVisitDate(visit.completedDate) : "Pendiente"} />
        </div>
      </section>

      {/* Client + contact */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <SectionCard
          icon={<User className="w-4 h-4 text-on-surface" aria-hidden="true" />}
          accent="bg-primary/10 text-sky-400"
          title="Cliente"
          className="lg:col-span-4"
        >
          <div className="space-y-5">
            <Field label="Nombre" value={visit.clientName ?? "Cliente sin nombre"} />
            <Field label="DNI / Documento" value={visit.clientDocumentNumber ?? "—"} mono />
          </div>
        </SectionCard>

        <SectionCard
          icon={<Phone className="w-4 h-4 text-on-surface" aria-hidden="true" />}
          accent="bg-secondary/10 text-secondary"
          title="Contacto"
          className="lg:col-span-8"
        >
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-10 gap-y-6">
            <Field label="Teléfono" value={visit.clientPhone ?? "—"} mono />
            <Field label="Email" value={visit.clientEmail ?? "—"} />
          </div>
        </SectionCard>
      </div>

      {/* Address */}
      <SectionCard
        icon={<MapPin className="w-4 h-4 text-on-surface" aria-hidden="true" />}
        accent="bg-tertiary/10 text-tertiary"
        title="Dirección de la visita"
      >
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-x-10 gap-y-6">
          <Field label="Calle" value={visit.visitStreet ?? "—"} />
          <Field label="Número" value={visit.visitStreetNumber ?? "—"} mono />
          <Field label="Piso" value={visit.visitFloor ?? "—"} mono />
          <Field label="Departamento" value={visit.visitApartment ?? "—"} mono />
          <Field label="Ciudad / Localidad" value={visit.visitCity ?? "—"} />
          <Field label="Provincia / Estado" value={visit.visitProvince ?? "—"} />
          <Field label="Código postal" value={visit.visitPostalCode ?? "—"} mono />
          <Field label="Referencias" value={visit.visitAddressNotes ?? "—"} />
        </div>
      </SectionCard>

      {/* Notes */}
      <SectionCard
        icon={<StickyNote className="w-4 h-4 text-on-surface" aria-hidden="true" />}
        accent="bg-[#00df81]/10 text-[#00df81]"
        title="Notas"
      >
        <p className="text-on-surface text-base whitespace-pre-wrap leading-relaxed">
          {visit.notes ?? "Sin notas registradas."}
        </p>
      </SectionCard>
    </div>
  );
}