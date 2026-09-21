/**
 * Client info section — Section 2 of the sale creation form.
 *
 * Shows client details from the visit (read-only) or editable fields
 * when no fixed visit is associated.
 */

"use client";

import type { UseFormRegister, FieldErrors } from "react-hook-form";
import type { Visit } from "@/modules/visits/domain";
import { DOCUMENT_TYPES } from "@/modules/sales/domain/constants";
import type { CreateSaleFormValues } from "../create-sale-form-schema";
import {
  inputClass,
  selectClass,
  labelClass,
  errorClass,
} from "../form-styles";

interface ClientInfoSectionProps {
  register: UseFormRegister<CreateSaleFormValues>;
  errors: FieldErrors<CreateSaleFormValues>;
  fixedVisit?: Visit;
}

export function ClientInfoSection({
  register,
  errors,
  fixedVisit,
}: ClientInfoSectionProps) {
  return (
    <div className="bg-[#161618] border border-[#26262a] rounded-xl p-6 space-y-6 shadow-sm">
      <h3 className="text-xs font-bold text-zinc-300 uppercase tracking-wider">
        Información del cliente
      </h3>

      {fixedVisit && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 rounded-lg border border-[#27272e] bg-[#141417] p-5">
          <div>
            <p className={labelClass}>Nombre</p>
            <p className="text-sm text-on-surface-dim">
              {fixedVisit.clientName ?? "—"}
            </p>
          </div>
          <div>
            <p className={labelClass}>Teléfono</p>
            <p className="text-sm text-on-surface-dim">
              {fixedVisit.clientPhone ?? "—"}
            </p>
          </div>
          <div>
            <p className={labelClass}>Email</p>
            <p className="text-sm text-on-surface-dim break-all">
              {fixedVisit.clientEmail ?? "—"}
            </p>
          </div>
          <div>
            <p className={labelClass}>Documento</p>
            <p className="text-sm text-on-surface-dim">
              {fixedVisit.clientDocumentNumber ?? "—"}
            </p>
          </div>
          <div className="md:col-span-2">
            <p className={labelClass}>Dirección de la visita</p>
            <p className="text-sm text-on-surface-dim">
              {[
                fixedVisit.visitStreet &&
                  `${fixedVisit.visitStreet} ${fixedVisit.visitStreetNumber ?? ""}`,
                fixedVisit.visitCity,
                fixedVisit.visitProvince,
              ]
                .filter(Boolean)
                .join(", ") || "—"}
            </p>
          </div>
        </div>
      )}

      <div
        className={
          fixedVisit ? "hidden" : "grid grid-cols-1 md:grid-cols-2 gap-6"
        }
      >
        <div>
          <label htmlFor="buyerName" className={labelClass}>
            Nombre del cliente
          </label>
          <input
            type="text"
            id="buyerName"
            placeholder="Nombre completo del cliente"
            className={inputClass}
            {...register("buyerName")}
          />
          {errors.buyerName && (
            <p className={errorClass}>{errors.buyerName.message}</p>
          )}
        </div>

        <div>
          <label htmlFor="clientPhone" className={labelClass}>
            Teléfono del cliente
          </label>
          <input
            type="tel"
            id="clientPhone"
            placeholder="Teléfono de contacto"
            className={inputClass}
            {...register("clientPhone")}
          />
          {errors.clientPhone && (
            <p className={errorClass}>{errors.clientPhone.message}</p>
          )}
        </div>
      </div>

      <div
        className={
          fixedVisit ? "hidden" : "grid grid-cols-1 md:grid-cols-2 gap-6"
        }
      >
        <div>
          <label htmlFor="clientEmail" className={labelClass}>
            Email del cliente{" "}
            <span className="normal-case tracking-normal">(opcional)</span>
          </label>
          <input
            type="email"
            id="clientEmail"
            placeholder="cliente@ejemplo.com"
            className={inputClass}
            {...register("clientEmail")}
          />
          {errors.clientEmail && (
            <p className={errorClass}>{errors.clientEmail.message}</p>
          )}
        </div>

        <div>
          <label htmlFor="clientDocumentType" className={labelClass}>
            Tipo de documento{" "}
            <span className="normal-case tracking-normal">(opcional)</span>
          </label>
          <select
            id="clientDocumentType"
            className={selectClass}
            {...register("clientDocumentType")}
          >
            <option value="">Seleccionar tipo</option>
            {DOCUMENT_TYPES.map((type) => (
              <option key={type.value} value={type.value}>
                {type.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div
        className={
          fixedVisit ? "hidden" : "grid grid-cols-1 md:grid-cols-2 gap-6"
        }
      >
        <div>
          <label htmlFor="clientDocumentNumber" className={labelClass}>
            Número de documento{" "}
            <span className="normal-case tracking-normal">(opcional)</span>
          </label>
          <input
            type="text"
            id="clientDocumentNumber"
            placeholder="Número de documento"
            className={inputClass}
            {...register("clientDocumentNumber")}
          />
          {errors.clientDocumentNumber && (
            <p className={errorClass}>{errors.clientDocumentNumber.message}</p>
          )}
        </div>
      </div>
    </div>
  );
}
