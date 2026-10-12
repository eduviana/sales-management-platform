/**
 * Client detail page — shows the full client record (including the fields
 * that the list table omits for width reasons: DNI and full address).
 *
 * Server Component that loads the client with server-side authorization.
 *
 * Reference: business-rules.md REG-069, permissions-matrix.md §4.6
 */

import Link from "next/link";
import { handlePageLoadError } from "../../_lib/handle-page-load-error";
import { createVisitsUseCases } from "@/modules/visits/composition-root";
import { resolveAuthContext } from "@/modules/identity/resolve-auth-context";
import { formatDate } from "@/shared/presentation/format";
import {
  DisplayField as Field,
  SectionCard,
} from "@/shared/presentation/components";
import { formatClientAddress } from "@/modules/visits/domain/client";
import { CalendarClock, MapPin, ShoppingBag, User } from "lucide-react";

export default async function ClientDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const authContext = await resolveAuthContext();
  const { getClient } = createVisitsUseCases();

  let client;
  try {
    client = await getClient.execute({
      authContext,
      clientId: id,
    });
  } catch (error) {
    handlePageLoadError(error);
  }

  return (
    <div className="w-full space-y-6">
      {/* Back link */}
      <Link
        href="/clients"
        className="inline-flex items-center text-sm font-medium text-sky-400 hover:text-sky-300 transition-colors"
      >
        ← Volver a clientes
      </Link>

      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="bg-primary/10 text-sky-400 w-12 h-12 rounded-xl flex items-center justify-center">
            <User className="w-6 h-6" aria-hidden="true" />
          </div>
          <div>
            <h1 className="text-2xl lg:text-3xl font-bold text-white tracking-tight">
              Cliente CL-{String(client.clientNumber).padStart(4, "0")}
            </h1>
            <p className="text-sm text-on-surface-variant mt-0.5">
              {client.name}
            </p>
          </div>
        </div>
      </div>

      {/* Overview strip */}
      <section className="bg-surface-container border border-outline-variant rounded-2xl p-7">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-x-10 gap-y-6">
          <Field label="DNI / Documento" value={client.documentNumber ?? "—"} mono />
          <Field label="Teléfono" value={client.phone ?? "—"} mono />
          <Field label="Email" value={client.email ?? "—"} />
          <Field label="Cliente desde" value={formatDate(client.createdAt)} />
        </div>
      </section>

      {/* Address */}
      <SectionCard
        icon={<MapPin className="w-4 h-4 text-on-surface" aria-hidden="true" />}
        accent="bg-secondary/10 text-secondary"
        title="Dirección"
      >
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-10 gap-y-6">
          <Field label="Dirección completa" value={formatClientAddress(client)} />
          <Field label="Notas de dirección" value={client.addressNotes ?? "—"} />
        </div>
      </SectionCard>

      {/* Record dates */}
      <SectionCard
        icon={<CalendarClock className="w-4 h-4 text-on-surface" aria-hidden="true" />}
        accent="bg-primary/10 text-sky-400"
        title="Registro"
      >
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-10 gap-y-6">
          <Field label="Última actualización" value={formatDate(client.updatedAt)} />
        </div>
        {client.referredBySaleId && (
          <div className="mt-6 pt-5 border-t border-outline-variant flex items-center gap-3 text-sm">
            <ShoppingBag className="w-4 h-4 text-on-surface-variant" aria-hidden="true" />
            <span className="text-on-surface-variant">Cliente originado por una venta:</span>
            <Link
              href={`/sales/${client.referredBySaleId}`}
              className="text-sky-400 hover:text-sky-300 font-medium transition-colors"
            >
              Ver venta
            </Link>
          </div>
        )}
      </SectionCard>
    </div>
  );
}
