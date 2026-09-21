/**
 * Payment method section — Section 4 of the sale creation form.
 */

"use client";

import type { UseFormRegister, FieldErrors } from "react-hook-form";
import { PAYMENT_METHODS } from "@/modules/sales/domain/constants";
import type { CreateSaleFormValues } from "../create-sale-form-schema";
import {
  inputClass,
  selectClass,
  labelClass,
  errorClass,
} from "../form-styles";

interface PaymentSectionProps {
  register: UseFormRegister<CreateSaleFormValues>;
  errors: FieldErrors<CreateSaleFormValues>;
  showInstallments: boolean;
}

export function PaymentSection({
  register,
  errors,
  showInstallments,
}: PaymentSectionProps) {
  return (
    <section className="bg-[#161618] border border-[#26262a] rounded-xl p-6 space-y-6 shadow-sm">
      <h3 className="text-xs font-bold text-zinc-300 uppercase tracking-wider">
        Método de pago
      </h3>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label htmlFor="paymentMethod" className={labelClass}>
            Método de pago
          </label>
          <select
            id="paymentMethod"
            className={selectClass}
            {...register("paymentMethod")}
          >
            <option value="">Seleccionar método</option>
            {PAYMENT_METHODS.map((method) => (
              <option key={method.value} value={method.value}>
                {method.label}
              </option>
            ))}
          </select>
          {errors.paymentMethod && (
            <p className={errorClass}>{errors.paymentMethod.message}</p>
          )}
        </div>

        {showInstallments && (
          <div>
            <label htmlFor="installments" className={labelClass}>
              Cuotas
            </label>
            <input
              type="number"
              id="installments"
              min="1"
              max="48"
              step="1"
              inputMode="numeric"
              className={inputClass}
              {...register("installments")}
            />
            {errors.installments && (
              <p className={errorClass}>{errors.installments.message}</p>
            )}
          </div>
        )}
      </div>

      <p className="text-xs text-zinc-500">
        El estado del pago, la referencia externa y los datos de tarjeta son
        gestionados por administración.
      </p>
    </section>
  );
}
