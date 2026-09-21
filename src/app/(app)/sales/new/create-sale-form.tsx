"use client";

import { useCreateSaleForm } from "./use-create-sale-form";
import { formatVisitDate } from "@/modules/visits/domain";
import type { ProductData } from "@/modules/sales/domain";
import type { Visit } from "@/modules/visits/domain";

import { SaleDateSection } from "./sections/sale-date-section";
import { ClientInfoSection } from "./sections/client-info-section";
import { ProductsSection } from "./sections/products-section";
import { PaymentSection } from "./sections/payment-section";
import { ReferralSection } from "./sections/referral-section";
import { DeliverySection } from "./sections/delivery-section";
import { NotesSection } from "./sections/notes-section";

interface CreateSaleFormProps {
  products: readonly ProductData[];
  visits: readonly Visit[];
  fixedVisit?: Visit;
}

/**
 * Formulario de creación de venta.
 *
 * Orquestador que compone las secciones del formulario.
 * Toda la lógica de estado y validación vive en useCreateSaleForm.
 *
 * Orden de secciones:
 * 1. Fecha de venta
 * 2. Información del cliente (datos de la visita)
 * 3. Productos vendidos
 * 4. Método de pago
 * 5. Programa de referidos
 * 6. Entrega
 * 7. Notas de la venta
 *
 * Reference: requirements.md §3.4, data-model.md §23
 */
export function CreateSaleForm({
  products,
  visits,
  fixedVisit,
}: CreateSaleFormProps) {
  const form = useCreateSaleForm({ products, visits, fixedVisit });

  return (
    <form
      onSubmit={form.handleSubmit(form.onSubmit, form.onFormValidationError)}
      noValidate
      className="flex flex-col gap-8"
    >
      {(form.state.error || form.formError) && (
        <div className="p-3 bg-rose-500/10 border border-rose-500/20 rounded-lg text-sm text-rose-400">
          {form.formError ?? form.state.error}
        </div>
      )}

      {/* 1. Fecha de venta */}
      <SaleDateSection
        register={form.register}
        errors={form.errors}
      />

      {/* 2. Información del cliente */}
      <ClientInfoSection
        register={form.register}
        errors={form.errors}
        fixedVisit={fixedVisit}
      />

      {/* Visita asociada (solo si no hay fixedVisit) */}
      {!fixedVisit && (
        <section className="bg-[#161618] border border-[#26262a] rounded-xl p-6 space-y-6 shadow-sm">
          <h3 className="text-xs font-bold text-zinc-300 uppercase tracking-wider">
            Visita asociada
          </h3>
          <div className="max-w-xl">
            <label htmlFor="visitId" className="block text-[11px] font-semibold text-zinc-400 uppercase tracking-wider mb-1.5">
              Visita realizada
            </label>
            <select
              id="visitId"
              className="w-full px-3.5 py-2.5 bg-[#1c1c1f] border border-[#2d2d32] rounded-lg text-sm text-zinc-300 focus:border-[#00df81] focus:ring-1 focus:ring-[#00df81] outline-none transition-colors"
              disabled={visits.length === 0}
              {...form.register("visitId")}
            >
              <option value="">Seleccionar visita completada</option>
              {visits.map((visit) => (
                <option key={visit.id} value={visit.id}>
                  {formatVisitDate(visit.scheduledDate)} — {visit.id.slice(0, 8)}
                </option>
              ))}
            </select>
            {form.errors.visitId && (
              <p className="mt-1 text-xs text-rose-400">{form.errors.visitId.message}</p>
            )}
            {visits.length === 0 && (
              <p className="mt-1.5 text-xs text-zinc-500">
                No hay visitas completadas disponibles para asociar.
              </p>
            )}
          </div>
        </section>
      )}

      {/* 3. Productos vendidos */}
      <ProductsSection
        register={form.register}
        errors={form.errors}
        submitCount={form.submitCount}
        products={products}
        items={form.items}
        selectedProductId={form.selectedProductId}
        quantity={form.quantity}
        selectedProduct={form.selectedProduct}
        subtotal={form.subtotal}
        total={form.total}
        onSelectProduct={form.setSelectedProductId}
        onSetQuantity={form.setQuantity}
        onAddItem={form.addItem}
        onRemoveItem={form.removeItem}
      />

      {/* 4. Método de pago */}
      <PaymentSection
        register={form.register}
        errors={form.errors}
        showInstallments={form.showInstallments}
      />

      {/* 5. Programa de referidos */}
      <ReferralSection
        referralContacts={form.referralContacts}
        onAdd={form.addReferralContact}
        onUpdate={form.updateReferralContact}
        onRemove={form.removeReferralContact}
      />

      {/* 6. Entrega */}
      <DeliverySection
        register={form.register}
        errors={form.errors}
      />

      {/* 7. Notas de la venta */}
      <NotesSection
        register={form.register}
        errors={form.errors}
      />

      {/* Submit */}
      <div className="flex gap-3 pt-2 pb-8">
        <button
          type="submit"
          disabled={form.isPending}
          className="px-5 py-2.5 text-sm font-semibold rounded-lg bg-[#00df81] hover:bg-[#00c873] text-black transition-colors shadow-sm disabled:opacity-50"
        >
          {form.isPending ? "Guardando..." : "Guardar Borrador"}
        </button>

        <button
          type="button"
          onClick={form.goBack}
          className="px-5 py-2.5 text-sm font-medium rounded-lg bg-[#27272a] hover:bg-[#323238] text-zinc-300 hover:text-white border border-[#3f3f46] transition-colors"
        >
          Cancelar
        </button>
      </div>
    </form>
  );
}
