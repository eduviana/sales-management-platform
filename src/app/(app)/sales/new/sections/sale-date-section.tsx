/**
 * Sale date section — Section 1 of the sale creation form.
 */

"use client";

import type { UseFormRegister, FieldErrors } from "react-hook-form";
import type { CreateSaleFormValues } from "../create-sale-form-schema";
import { inputClass, labelClass, errorClass } from "../form-styles";

interface SaleDateSectionProps {
  register: UseFormRegister<CreateSaleFormValues>;
  errors: FieldErrors<CreateSaleFormValues>;
}

export function SaleDateSection({ register, errors }: SaleDateSectionProps) {
  return (
    <section className="bg-[#161618] border border-[#26262a] rounded-xl p-6 shadow-sm">
      <div className="max-w-xl space-y-1.5">
        <div>
          <label htmlFor="saleDate" className={labelClass}>
            Fecha de venta
          </label>

          <input
            type="date"
            id="saleDate"
            className={inputClass}
            {...register("saleDate")}
          />

          {errors.saleDate && (
            <p className={errorClass}>{errors.saleDate.message}</p>
          )}
        </div>
      </div>
    </section>
  );
}
