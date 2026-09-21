/**
 * Sale detail page — shows sale details and action buttons.
 *
 * Server Component that loads the sale and determines available actions.
 * Client Components handle state transitions (approve, reject, cancel).
 *
 * Visual reference: design/stitch/DESIGN.md
 * Reference: business-rules.md §8, §16.1, permissions-matrix.md §4.4
 */

import { notFound } from "next/navigation";
import Link from "next/link";
import { prisma } from "@/infrastructure/prisma/client";
import { createAuthorizationService } from "@/modules/authorization/composition-root";
import { PrismaOrganizationRepository } from "@/infrastructure/organization/prisma-organization-repository";
import { createSalesUseCases } from "@/modules/sales/composition-root";
import { resolveAuthContext } from "@/modules/sales/presentation/resolve-auth-context";
import { SaleActions } from "./sale-actions";

const STATUS_LABELS: Record<string, string> = {
  DRAFT: "Borrador",
  PENDING_REVIEW: "Pend. revisión",
  APPROVED: "Aprobada",
  REJECTED: "Rechazada",
  CANCELLED: "Cancelada",
};

export default async function SaleDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const authContext = await resolveAuthContext();
  const auth = createAuthorizationService(prisma);
  const orgRepo = new PrismaOrganizationRepository(prisma);
  const useCases = createSalesUseCases(prisma, auth, orgRepo);

  let saleResult;
  try {
    saleResult = await useCases.getSale.execute({
      authContext,
      saleId: id,
    });
  } catch {
    notFound();
  }

  const { sale } = saleResult;

  // Load items directly from Prisma
  const items = await prisma.saleItem.findMany({
    where: { saleId: sale.id },
    include: { product: true },
  });

  // Load referral contacts
  const referralContacts = await prisma.referralContact.findMany({
    where: { saleId: sale.id },
    orderBy: { createdAt: "asc" },
  });

  // Load commission entries (only for sales that have been processed)
  const commissionEntries = sale.status === "APPROVED" || sale.status === "CANCELLED"
    ? await prisma.commissionEntry.findMany({
        where: { saleId: sale.id },
        orderBy: { calculatedAt: "asc" },
      })
    : [];

  // Determine if user is the owner (for edit/submit actions)
  const isOwner = sale.employeeId === authContext.employeeId;

  // Determine if user can review (for approve/reject actions)
  // Presentation-only optimization — actual authorization happens server-side
  // in the Server Action via AuthorizationService.
  const canReview =
    authContext.role === "ADMIN" ||
    (authContext.levelId !== null && authContext.levelId >= 3);

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Back link */}
      <div className="mb-2">
        <Link
          href="/sales"
          className="inline-flex items-center text-sm font-medium text-sky-400 hover:text-sky-300 transition-colors"
        >
          <svg className="w-4 h-4 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          Volver a ventas
        </Link>
      </div>

      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl lg:text-3xl font-bold text-white tracking-tight">
          Venta VT-{String(sale.saleNumber).padStart(4, "0")}
        </h1>
        <span className={`inline-flex items-center px-3.5 py-1 rounded-full text-xs font-semibold ${
          sale.status === "APPROVED"
            ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/30"
            : sale.status === "PENDING_REVIEW"
              ? "bg-amber-500/10 text-amber-400 border border-amber-500/30"
              : sale.status === "REJECTED" || sale.status === "CANCELLED"
                ? "bg-rose-500/10 text-rose-400 border border-rose-500/30"
                : "bg-gray-500/10 text-gray-400 border border-gray-500/30"
        }`}>
          {STATUS_LABELS[sale.status] ?? sale.status}
        </span>
      </div>

      {/* General info card */}
      <section className="bg-[#161618] border border-[#27272e] rounded-xl p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-y-6 gap-x-12">
          <div>
            <p className="text-xs font-medium text-on-surface-variant uppercase tracking-wider mb-1">Fecha de venta</p>
            <p className="text-white text-base font-medium">
              {new Date(sale.saleDate).toLocaleDateString("es-AR")}
            </p>
          </div>
          <div>
            <p className="text-xs font-medium text-on-surface-variant uppercase tracking-wider mb-1">Cliente</p>
            <p className="text-white text-base font-medium">
              {sale.buyerName ?? "—"}
            </p>
          </div>
          <div>
            <p className="text-xs font-medium text-on-surface-variant uppercase tracking-wider mb-1">Total</p>
            <p className="text-white text-lg font-semibold tracking-tight font-mono">
              ${sale.totalAmount.toFixed(2)}
            </p>
          </div>
          <div>
            <p className="text-xs font-medium text-on-surface-variant uppercase tracking-wider mb-1">Creada</p>
            <p className="text-white text-base font-medium">
              {new Date(sale.createdAt).toLocaleDateString("es-AR")}
            </p>
          </div>

          <div className="md:col-span-2 pt-2 border-t border-[#27272e]">
            <p className="text-xs font-medium text-on-surface-variant uppercase tracking-wider mb-3">Datos del cliente</p>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <p className="text-xs text-on-surface-variant mb-1">Teléfono</p>
                <p className="text-sm text-white">{sale.clientPhone ?? "—"}</p>
              </div>
              <div>
                <p className="text-xs text-on-surface-variant mb-1">Email</p>
                <p className="text-sm text-white break-all">{sale.clientEmail ?? "—"}</p>
              </div>
              <div>
                <p className="text-xs text-on-surface-variant mb-1">Documento</p>
                <p className="text-sm text-white">{sale.clientDocumentType && sale.clientDocumentNumber
                  ? `${sale.clientDocumentType}: ${sale.clientDocumentNumber}`
                  : "—"}</p>
              </div>
            </div>
          </div>

          <div className="md:col-span-2 pt-2 border-t border-[#27272e]">
            <p className="text-xs font-medium text-on-surface-variant uppercase tracking-wider mb-3">Pago y entrega</p>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <p className="text-xs text-on-surface-variant mb-1">Pago</p>
                <p className="text-sm text-white">{sale.paymentStatus ?? "—"}</p>
              </div>
              <div>
                <p className="text-xs text-on-surface-variant mb-1">Método</p>
                <p className="text-sm text-white">{sale.paymentMethod ?? "—"}{sale.installments ? ` · ${sale.installments} cuotas` : ""}</p>
              </div>
              <div>
                <p className="text-xs text-on-surface-variant mb-1">Entrega</p>
                <p className="text-sm text-white">{sale.deliveryStatus ?? "—"}</p>
              </div>
            </div>
            {sale.deliveryAddress && (
              <p className="mt-3 text-sm text-on-surface">Dirección: {sale.deliveryAddress}</p>
            )}
          </div>

          {sale.notes && (
            <div className="md:col-span-2 pt-2 border-t border-[#27272e]">
              <p className="text-xs font-medium text-on-surface-variant uppercase tracking-wider mb-1">Notas</p>
              <p className="text-on-surface text-sm break-all font-mono">{sale.notes}</p>
            </div>
          )}

          {sale.rejectionReason && (
            <div className="md:col-span-2 pt-2 border-t border-[#27272e]">
              <p className="text-xs font-medium text-rose-400 uppercase tracking-wider mb-1">Motivo de rechazo</p>
              <p className="text-on-surface text-sm">{sale.rejectionReason}</p>
            </div>
          )}
        </div>
      </section>

      {/* Products table */}
      <section className="bg-surface border border-[#27272e] rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-[#27272e] bg-[#141417]">
                <th className="py-3.5 px-6 text-xs font-semibold text-on-surface-variant uppercase tracking-wider" scope="col">
                  Producto
                </th>
                <th className="py-3.5 px-6 text-xs font-semibold text-on-surface-variant uppercase tracking-wider text-right" scope="col">
                  Precio
                </th>
                <th className="py-3.5 px-6 text-xs font-semibold text-on-surface-variant uppercase tracking-wider text-center" scope="col">
                  Cantidad
                </th>
                <th className="py-3.5 px-6 text-xs font-semibold text-on-surface-variant uppercase tracking-wider text-right" scope="col">
                  Subtotal
                </th>
              </tr>
            </thead>
            <tbody className="text-on-surface-dim">
              {items.map((item) => (
                <tr key={item.id} className="hover:bg-surface-container transition-colors">
                  <td className="py-4 px-6 text-sm font-medium text-on-surface-dim">
                    <span className="text-on-surface-variant">{item.product.code}</span>{" "}
                    {item.product.name}
                  </td>
                  <td className="py-4 px-6 text-sm text-on-surface-dim text-right font-medium font-mono">
                    ${Number(item.unitPrice).toFixed(2)}
                  </td>
                  <td className="py-4 px-6 text-sm text-on-surface-dim text-center font-medium">
                    {item.quantity}
                  </td>
                  <td className="py-4 px-6 text-sm text-on-surface-dim font-semibold text-right font-mono">
                    ${Number(item.subtotal).toFixed(2)}
                  </td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr className="border-t border-[#27272e] bg-[#141417]/70">
                <td colSpan={3} className="py-4 px-6 text-sm font-semibold text-on-surface text-right">
                  Total:
                </td>
                <td className="py-4 px-6 text-base font-bold text-white text-right font-mono">
                  ${sale.totalAmount.toFixed(2)}
                </td>
              </tr>
            </tfoot>
          </table>
        </div>
      </section>

      {/* Referral contacts — shown when there are any */}
      {referralContacts.length > 0 && (
        <section className="bg-[#161618] border border-[#27272e] rounded-xl p-6 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-semibold text-white uppercase tracking-wider">
              Programa de referidos
            </h2>
            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold ${
              referralContacts.length === 5
                ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/30"
                : "bg-amber-500/10 text-amber-400 border border-amber-500/30"
            }`}>
              {referralContacts.length}/5 referidos
            </span>
          </div>

          <div className="space-y-3">
            {referralContacts.map((contact, index) => (
              <div key={contact.id} className="border border-[#27272e] rounded-lg p-4 space-y-2">
                <div className="flex items-center justify-between">
                  <h3 className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">
                    Referido {index + 1}
                  </h3>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-sm">
                  <div>
                    <p className="text-xs text-on-surface-variant mb-0.5">Nombre</p>
                    <p className="text-white">{contact.clientName}</p>
                  </div>
                  <div>
                    <p className="text-xs text-on-surface-variant mb-0.5">Teléfono</p>
                    <p className="text-white">{contact.phone}</p>
                  </div>
                  <div>
                    <p className="text-xs text-on-surface-variant mb-0.5">Email</p>
                    <p className="text-white">{contact.email ?? "—"}</p>
                  </div>
                </div>
                {(contact.street || contact.city || contact.province) && (
                  <div className="text-sm">
                    <p className="text-xs text-on-surface-variant mb-0.5">Dirección</p>
                    <p className="text-white">
                      {[contact.street && contact.streetNumber ? `${contact.street} ${contact.streetNumber}` : null, contact.floor ? `Piso ${contact.floor}` : null, contact.apartment ? `Depto. ${contact.apartment}` : null].filter(Boolean).join(", ")}
                      {(contact.city || contact.province) && (
                        <span className="text-zinc-400"> — {[contact.city, contact.province, contact.postalCode].filter(Boolean).join(", ")}</span>
                      )}
                      {contact.addressNotes && (
                        <span className="text-zinc-500"> — {contact.addressNotes}</span>
                      )}
                    </p>
                  </div>
                )}
              </div>
            ))}
          </div>

          {canReview && sale.status === "PENDING_REVIEW" && referralContacts.length === 5 && (
            <p className="text-xs text-zinc-500 border-t border-[#27272e] pt-3">
              Verifique que estos 5 referidos no existan en su base de datos de clientes. Si son válidos, el descuento del 20% se aplicará al aprobar la venta.
            </p>
          )}
        </section>
      )}

      {/* Commission entries — shown when sale has been processed */}
      {commissionEntries.length > 0 && (
        <section className="bg-[#161618] border border-[#27272e] rounded-xl p-6 space-y-4">
          <h2 className="text-sm font-semibold text-white uppercase tracking-wider">
            Comisión
          </h2>

          <div className="space-y-3">
            {commissionEntries.map((entry) => {
              const isEarned = entry.type === "EARNED";
              return (
                <div key={entry.id} className="border border-[#27272e] rounded-lg p-4">
                  <div className="flex items-center justify-between mb-3">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                      isEarned
                        ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/30"
                        : "bg-rose-500/10 text-rose-400 border border-rose-500/30"
                    }`}>
                      {isEarned ? "Comisión generada" : "Comisión revertida"}
                    </span>
                    <span className="text-xs text-on-surface-variant">
                      {new Date(entry.calculatedAt).toLocaleDateString("es-AR")}
                    </span>
                  </div>
                  <div className="grid grid-cols-3 gap-4 text-sm">
                    <div>
                      <p className="text-xs text-on-surface-variant mb-1">Porcentaje</p>
                      <p className="text-white font-medium">{Number(entry.percentage)}%</p>
                    </div>
                    <div>
                      <p className="text-xs text-on-surface-variant mb-1">Base</p>
                      <p className="text-white font-medium font-mono">
                        ${Number(entry.baseAmount).toFixed(2)}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-on-surface-variant mb-1">
                        {isEarned ? "Monto" : "Reversión"}
                      </p>
                      <p className={`font-semibold font-mono ${isEarned ? "text-emerald-400" : "text-rose-400"}`}>
                        {isEarned ? "+" : ""}{Number(entry.amount).toFixed(2)}
                      </p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      )}

      {/* Actions — only show when there are available actions */}
      {((isOwner && (sale.status === "DRAFT" || sale.status === "REJECTED")) ||
        (canReview && (sale.status === "PENDING_REVIEW" || sale.status === "APPROVED"))) && (
        <section className="bg-[#161618] border border-[#27272e] rounded-xl p-6">
          <SaleActions
            saleId={sale.id}
            status={sale.status}
            isOwner={isOwner}
            canReview={canReview}
          />
        </section>
      )}
    </div>
  );
}
