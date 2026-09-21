/**
 * Delivery address section — Section 6 of the sale creation form.
 *
 * Pre-populated from the visit's client address.
 * Seller can modify all fields if the client wants delivery at a different address.
 */

"use client";

import type { UseFormRegister, FieldErrors } from "react-hook-form";
import type { CreateSaleFormValues } from "../create-sale-form-schema";
import { inputClass, labelClass, errorClass } from "../form-styles";

interface DeliverySectionProps {
  register: UseFormRegister<CreateSaleFormValues>;
  errors: FieldErrors<CreateSaleFormValues>;
}

export function DeliverySection({ register, errors }: DeliverySectionProps) {
  return (
    <div className="bg-[#161618] border border-[#26262a] rounded-xl p-6 space-y-6 shadow-sm">
      <div>
        <h3 className="text-xs font-bold text-zinc-300 uppercase tracking-wider">
          Entrega
        </h3>
        <p className="mt-1.5 text-xs text-on-surface-variant">
          Dirección donde se entregará el pedido. Los datos se completan
          automáticamente desde la visita.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label htmlFor="deliveryProvince" className={labelClass}>
            Provincia / Estado
          </label>
          <input
            id="deliveryProvince"
            placeholder="Provincia o estado"
            className={inputClass}
            {...register("deliveryProvince")}
          />
          {errors.deliveryProvince && (
            <p className={errorClass}>{errors.deliveryProvince.message}</p>
          )}
        </div>
        <div>
          <label htmlFor="deliveryCity" className={labelClass}>
            Ciudad / Localidad
          </label>
          <input
            id="deliveryCity"
            placeholder="Ciudad o localidad"
            className={inputClass}
            {...register("deliveryCity")}
          />
          {errors.deliveryCity && (
            <p className={errorClass}>{errors.deliveryCity.message}</p>
          )}
        </div>
        <div>
          <label htmlFor="deliveryPostalCode" className={labelClass}>
            Código postal{" "}
            <span className="normal-case tracking-normal">(opcional)</span>
          </label>
          <input
            id="deliveryPostalCode"
            placeholder="Código postal"
            className={inputClass}
            {...register("deliveryPostalCode")}
          />
          {errors.deliveryPostalCode && (
            <p className={errorClass}>{errors.deliveryPostalCode.message}</p>
          )}
        </div>
        <div>
          <label htmlFor="deliveryStreet" className={labelClass}>
            Calle
          </label>
          <input
            id="deliveryStreet"
            placeholder="Nombre de la calle"
            className={inputClass}
            {...register("deliveryStreet")}
          />
          {errors.deliveryStreet && (
            <p className={errorClass}>{errors.deliveryStreet.message}</p>
          )}
        </div>
        <div>
          <label htmlFor="deliveryStreetNumber" className={labelClass}>
            Número
          </label>
          <input
            id="deliveryStreetNumber"
            placeholder="Altura"
            className={inputClass}
            {...register("deliveryStreetNumber")}
          />
          {errors.deliveryStreetNumber && (
            <p className={errorClass}>{errors.deliveryStreetNumber.message}</p>
          )}
        </div>
        <div>
          <label htmlFor="deliveryFloor" className={labelClass}>
            Piso{" "}
            <span className="normal-case tracking-normal">(opcional)</span>
          </label>
          <input
            id="deliveryFloor"
            placeholder="Piso"
            className={inputClass}
            {...register("deliveryFloor")}
          />
          {errors.deliveryFloor && (
            <p className={errorClass}>{errors.deliveryFloor.message}</p>
          )}
        </div>
        <div>
          <label htmlFor="deliveryApartment" className={labelClass}>
            Departamento{" "}
            <span className="normal-case tracking-normal">(opcional)</span>
          </label>
          <input
            id="deliveryApartment"
            placeholder="Departamento"
            className={inputClass}
            {...register("deliveryApartment")}
          />
          {errors.deliveryApartment && (
            <p className={errorClass}>{errors.deliveryApartment.message}</p>
          )}
        </div>
        <div>
          <label htmlFor="deliveryAddressNotes" className={labelClass}>
            Referencias{" "}
            <span className="normal-case tracking-normal">(opcional)</span>
          </label>
          <input
            id="deliveryAddressNotes"
            placeholder="Entre calles, referencias"
            className={inputClass}
            {...register("deliveryAddressNotes")}
          />
          {errors.deliveryAddressNotes && (
            <p className={errorClass}>
              {errors.deliveryAddressNotes.message}
            </p>
          )}
        </div>
      </div>

      <p className="text-xs text-zinc-500">
        El estado y la fecha de entrega son gestionados por la empresa.
      </p>
    </div>
  );
}
