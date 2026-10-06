/**
 * Sale detail page — shows sale details and action buttons.
 *
 * Server Component that loads the sale and determines available actions.
 * Client Components handle state transitions (approve, reject, cancel).
 *
 * Visual reference: design/stitch/DESIGN.md
 * Reference: business-rules.md §8, §16.1, permissions-matrix.md §4.4
 */

import Link from "next/link";
import { handlePageLoadError } from "../../_lib/handle-page-load-error";
import { createSalesUseCases } from "@/modules/sales/composition-root";
import { resolveAuthContext } from "@/modules/identity/resolve-auth-context";
import { formatDate } from "@/shared/presentation/format";
import {
  DisplayField as Field,
  SectionCard,
} from "@/shared/presentation/components";
import { SALE_STATUS_LABELS as STATUS_LABELS } from "@/modules/sales/presentation/sale-status";
import { SaleActions } from "./sale-actions";
import {
  CreditCard,
  MessageSquareWarning,
  Phone,
  ShoppingBag,
  StickyNote,
  User,
  Users,
} from "lucide-react";

const STATUS_COLORS: Record<string, { bg: string; text: string; border: string }> = {
  APPROVED: { bg: "bg-[#00df81]/10", text: "text-[#00df81]", border: "border-[#00df81]/20" },
  PENDING_REVIEW: { bg: "bg-amber-400/10", text: "text-amber-400", border: "border-amber-400/20" },
  REJECTED: { bg: "bg-red-400/10", text: "text-red-400", border: "border-red-400/20" },
  CANCELLED: { bg: "bg-surface-container-high", text: "text-zinc-400", border: "border-outline-variant" },
  DRAFT: { bg: "bg-surface-container-high", text: "text-zinc-400", border: "border-outline-variant" },
};

function StatusPill({ status }: { status: string }) {
  const config = STATUS_COLORS[status] ?? STATUS_COLORS.DRAFT;
  return (
    <span
      className={`inline-flex items-center gap-1.5 ${config.bg} ${config.text} border ${config.border} px-3.5 py-1.5 rounded-full text-sm font-semibold`}
    >
      {STATUS_LABELS[status] ?? status}
    </span>
  );
}

export default async function SaleDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const authContext = await resolveAuthContext();
  const useCases = createSalesUseCases();

  let detail;
  try {
    detail = await useCases.getSaleDetail.execute({
      authContext,
      saleId: id,
    });
  } catch (error) {
    handlePageLoadError(error);
  }

  const { sale, items, referralContacts, commissionEntries } = detail;

  // Determine if user is the owner (for edit/submit actions)
  const isOwner = sale.employeeId === authContext.employeeId;

  // Determine if user can review (for approve/reject actions)
  // Presentation-only optimization — actual authorization happens server-side
  // in the Server Action via AuthorizationService.
  const canReview =
    authContext.role === "ADMIN" ||
    (authContext.levelId !== null && authContext.levelId >= 3);

  return (
    <div className="w-full space-y-6">
      {/* Back link */}
      <Link
        href="/sales"
        className="inline-flex items-center text-sm font-medium text-sky-400 hover:text-sky-300 transition-colors"
      >
        ← Volver a ventas
      </Link>

      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="bg-primary/10 text-sky-400 w-12 h-12 rounded-xl flex items-center justify-center">
            <ShoppingBag className="w-6 h-6" aria-hidden="true" />
          </div>
          <div>
            <h1 className="text-2xl lg:text-3xl font-bold text-white tracking-tight">
              Venta VT-{String(sale.saleNumber).padStart(4, "0")}
            </h1>
            <p className="text-sm text-on-surface-variant mt-0.5">
              {sale.buyerName ?? "Cliente sin nombre"}
            </p>
          </div>
        </div>
        <StatusPill status={sale.status} />
      </div>

      {/* Overview strip */}
      <section className="bg-surface-container border border-outline-variant rounded-2xl p-7 relative overflow-hidden">
        <div className="absolute -right-10 -bottom-10 w-44 h-44 bg-sky-400/5 rounded-full blur-3xl pointer-events-none" />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-x-10 gap-y-6">
          <Field label="Fecha de venta" value={formatDate(sale.saleDate)} />
          <Field label="Total" value={`$${sale.totalAmount.toFixed(2)}`} mono />
          <Field label="Estado" value={STATUS_LABELS[sale.status] ?? sale.status} />
          <Field label="Creada" value={formatDate(sale.createdAt)} />
        </div>
      </section>

      {/* Client + payment */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <SectionCard
          icon={<User className="w-4 h-4 text-on-surface" aria-hidden="true" />}
          accent="bg-primary/10 text-sky-400"
          title="Cliente"
          className="lg:col-span-4"
        >
          <div className="space-y-5">
            <Field label="Nombre" value={sale.buyerName ?? "—"} />
            <Field label="Documento" value={sale.clientDocumentType && sale.clientDocumentNumber
              ? `${sale.clientDocumentType}: ${sale.clientDocumentNumber}`
              : "—"} mono />
          </div>
        </SectionCard>

        <SectionCard
          icon={<Phone className="w-4 h-4 text-on-surface" aria-hidden="true" />}
          accent="bg-secondary/10 text-secondary"
          title="Contacto"
          className="lg:col-span-8"
        >
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-10 gap-y-6">
            <Field label="Teléfono" value={sale.clientPhone ?? "—"} mono />
            <Field label="Email" value={sale.clientEmail ?? "—"} />
          </div>
        </SectionCard>
      </div>

      {/* Payment & delivery */}
      <SectionCard
        icon={<CreditCard className="w-4 h-4 text-on-surface" aria-hidden="true" />}
        accent="bg-tertiary/10 text-tertiary"
        title="Pago y entrega"
      >
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-x-10 gap-y-6">
          <Field label="Pago" value={sale.paymentStatus ?? "—"} />
          <Field label="Método" value={
            sale.paymentMethod
              ? `${sale.paymentMethod}${sale.installments ? ` · ${sale.installments} cuotas` : ""}`
              : "—"
          } />
          <Field label="Entrega" value={sale.deliveryStatus ?? "—"} />
          <Field label="Dirección de entrega" value={sale.deliveryAddress ?? "—"} />
        </div>
      </SectionCard>

      {/* Notes */}
      {sale.notes && (
        <SectionCard
          icon={<StickyNote className="w-4 h-4 text-on-surface" aria-hidden="true" />}
          accent="bg-[#00df81]/10 text-[#00df81]"
          title="Notas"
        >
          <p className="text-on-surface text-base whitespace-pre-wrap leading-relaxed">
            {sale.notes}
          </p>
        </SectionCard>
      )}

      {/* Rejection reason */}
      {sale.rejectionReason && (
        <SectionCard
          icon={<MessageSquareWarning className="w-4 h-4 text-on-surface" aria-hidden="true" />}
          accent="bg-red-400/10 text-red-400"
          title="Motivo de rechazo"
        >
          <p className="text-on-surface text-base leading-relaxed">{sale.rejectionReason}</p>
        </SectionCard>
      )}

      {/* Products table */}
      <SectionCard
        icon={<ShoppingBag className="w-4 h-4 text-on-surface" aria-hidden="true" />}
        accent="bg-primary/10 text-primary"
        title="Productos"
        className="p-0 overflow-hidden"
      >
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-outline-variant bg-surface-container-low">
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
                <tr key={item.id} className="hover:bg-surface-container-low transition-colors">
                  <td className="py-4 px-6 text-sm font-medium text-on-surface">
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
              <tr className="border-t border-outline-variant bg-surface-container-low/70">
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
      </SectionCard>

      {/* Referral contacts — shown when there are any */}
      {referralContacts.length > 0 && (
        <SectionCard
          icon={<Users className="w-4 h-4 text-on-surface" aria-hidden="true" />}
          accent="bg-[#00df81]/10 text-[#00df81]"
          title="Programa de referidos"
        >
          <div className="flex items-center justify-between mb-5">
            <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-semibold ${
              referralContacts.length === 5
                ? "bg-[#00df81]/10 text-[#00df81] border border-[#00df81]/20"
                : "bg-amber-400/10 text-amber-400 border border-amber-400/20"
            }`}>
              {referralContacts.length}/5 referidos
            </span>
          </div>

          <div className="space-y-3">
            {referralContacts.map((contact, index) => (
              <div key={contact.id} className="border border-outline-variant rounded-xl p-5">
                <h3 className="text-xs font-semibold text-on-surface-variant uppercase tracking-wider mb-3">
                  Referido {index + 1}
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-x-10 gap-y-4 text-sm">
                  <Field label="Nombre" value={contact.clientName} />
                  <Field label="Teléfono" value={contact.phone} />
                  <Field label="Email" value={contact.email ?? "—"} />
                </div>
                {(contact.street || contact.city || contact.province) && (
                  <div className="mt-4">
                    <Field
                      label="Dirección"
                      value={[
                        contact.street && contact.streetNumber ? `${contact.street} ${contact.streetNumber}` : null,
                        contact.floor ? `Piso ${contact.floor}` : null,
                        contact.apartment ? `Depto. ${contact.apartment}` : null,
                        [contact.city, contact.province, contact.postalCode].filter(Boolean).join(", "),
                        contact.addressNotes,
                      ].filter(Boolean).join(" · ")}
                    />
                  </div>
                )}
              </div>
            ))}
          </div>

          {canReview && sale.status === "PENDING_REVIEW" && referralContacts.length === 5 && (
            <p className="text-sm text-on-surface-variant border-t border-outline-variant pt-4 mt-5">
              Verifique que estos 5 referidos no existan en su base de datos de clientes. Si son válidos, el descuento del 20% se aplicará al aprobar la venta.
            </p>
          )}
        </SectionCard>
      )}

      {/* Commission entries — shown when sale has been processed */}
      {commissionEntries.length > 0 && (
        <SectionCard
          icon={<CreditCard className="w-4 h-4 text-on-surface" aria-hidden="true" />}
          accent="bg-primary/10 text-primary"
          title="Comisión"
        >
          <div className="space-y-3">
            {commissionEntries.map((entry) => {
              const isEarned = entry.type === "EARNED";
              return (
                <div key={entry.id} className="border border-outline-variant rounded-xl p-5">
                  <div className="flex items-center justify-between mb-4">
                    <span className={`inline-flex items-center px-3 py-0.5 rounded-full text-xs font-semibold ${
                      isEarned
                        ? "bg-[#00df81]/10 text-[#00df81] border border-[#00df81]/20"
                        : "bg-red-400/10 text-red-400 border border-red-400/20"
                    }`}>
                      {isEarned ? "Comisión generada" : "Comisión revertida"}
                    </span>
                    <span className="text-sm text-on-surface-variant">
                      {formatDate(entry.calculatedAt)}
                    </span>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-x-10 gap-y-4">
                    <Field label="Porcentaje" value={`${Number(entry.percentage)}%`} mono />
                    <Field label="Base" value={`$${Number(entry.baseAmount).toFixed(2)}`} mono />
                    <Field label={isEarned ? "Monto" : "Reversión"} value={`${isEarned ? "+" : ""}$${Number(entry.amount).toFixed(2)}`} mono />
                  </div>
                </div>
              );
            })}
          </div>
        </SectionCard>
      )}

      {/* Actions — only show when there are available actions */}
      {((isOwner && (sale.status === "DRAFT" || sale.status === "REJECTED")) ||
        (canReview && (sale.status === "PENDING_REVIEW" || sale.status === "APPROVED"))) && (
        <section className="bg-surface-container border border-outline-variant rounded-2xl p-7">
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