/**
 * Notes section — Section 7 of the sale creation form.
 */

"use client";

import type { UseFormRegister, FieldErrors } from "react-hook-form";
import type { CreateSaleFormValues } from "../create-sale-form-schema";
import { inputClass, labelClass, errorClass } from "../form-styles";

interface NotesSectionProps {
  register: UseFormRegister<CreateSaleFormValues>;
  errors: FieldErrors<CreateSaleFormValues>;
}

export function NotesSection({ register, errors }: NotesSectionProps) {
  return (
    <div className="bg-[#161618] border border-[#26262a] rounded-xl p-6 shadow-sm space-y-1.5">
      <label htmlFor="notes" className={labelClass}>
        Notas de la venta
      </label>

      <textarea
        id="notes"
        rows={2}
        placeholder="Observaciones adicionales"
        className={inputClass}
        {...register("notes")}
      />

      {errors.notes && <p className={errorClass}>{errors.notes.message}</p>}
    </div>
  );
}
