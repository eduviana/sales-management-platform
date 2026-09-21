/**
 * Referral contacts section — Section 5 of the sale creation form.
 *
 * Allows adding up to 5 referral contacts with contact info and address.
 */

"use client";

import type { ReferralContact } from "../create-sale-form-schema";
import { inputClass, labelClass } from "../form-styles";

interface ReferralSectionProps {
  referralContacts: ReferralContact[];
  onAdd: () => void;
  onUpdate: (
    index: number,
    field: keyof ReferralContact,
    value: string,
  ) => void;
  onRemove: (index: number) => void;
}

export function ReferralSection({
  referralContacts,
  onAdd,
  onUpdate,
  onRemove,
}: ReferralSectionProps) {
  return (
    <div className="bg-[#161618] border border-[#26262a] rounded-xl p-6 space-y-6 shadow-sm">
      <div>
        <h3 className="text-xs font-bold text-zinc-300 uppercase tracking-wider">
          Programa de referidos
        </h3>
        <p className="mt-2 text-sm text-zinc-500">
          Si el cliente completa 5 referidos válidos, su supervisor aplicará un
          20% de descuento sobre la compra. Los referidos se guardan como
          borrador y son revisados por la supervisora antes de aprobar la venta.
        </p>
      </div>

      {referralContacts.map((contact, index) => (
        <div
          key={index}
          className="border border-[#27272e] rounded-lg p-4 space-y-4"
        >
          <div className="flex items-center justify-between">
            <h4 className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">
              Referido {index + 1}
            </h4>
            <button
              type="button"
              onClick={() => onRemove(index)}
              className="px-3 py-1.5 text-sm text-rose-400 hover:text-rose-300 transition-colors"
            >
              Quitar
            </button>
          </div>

          {/* Contact info */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className={labelClass}>Nombre completo *</label>
              <input
                value={contact.clientName}
                onChange={(e) => onUpdate(index, "clientName", e.target.value)}
                placeholder="Nombre completo"
                className={inputClass}
              />
            </div>
            <div>
              <label className={labelClass}>Teléfono *</label>
              <input
                value={contact.phone}
                onChange={(e) => onUpdate(index, "phone", e.target.value)}
                placeholder="Teléfono"
                className={inputClass}
              />
            </div>
            <div>
              <label className={labelClass}>
                Email{" "}
                <span className="normal-case tracking-normal">(opcional)</span>
              </label>
              <input
                type="email"
                value={contact.email}
                onChange={(e) => onUpdate(index, "email", e.target.value)}
                placeholder="Email"
                className={inputClass}
              />
            </div>
          </div>

          {/* Address info */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className={labelClass}>Calle</label>
              <input
                value={contact.street}
                onChange={(e) => onUpdate(index, "street", e.target.value)}
                placeholder="Nombre de la calle"
                className={inputClass}
              />
            </div>
            <div>
              <label className={labelClass}>Número</label>
              <input
                value={contact.streetNumber}
                onChange={(e) =>
                  onUpdate(index, "streetNumber", e.target.value)
                }
                placeholder="Altura"
                className={inputClass}
              />
            </div>
            <div>
              <label className={labelClass}>
                Piso{" "}
                <span className="normal-case tracking-normal">(opcional)</span>
              </label>
              <input
                value={contact.floor}
                onChange={(e) => onUpdate(index, "floor", e.target.value)}
                placeholder="Piso"
                className={inputClass}
              />
            </div>
            <div>
              <label className={labelClass}>
                Departamento{" "}
                <span className="normal-case tracking-normal">(opcional)</span>
              </label>
              <input
                value={contact.apartment}
                onChange={(e) =>
                  onUpdate(index, "apartment", e.target.value)
                }
                placeholder="Departamento"
                className={inputClass}
              />
            </div>
            <div>
              <label className={labelClass}>Ciudad / Localidad</label>
              <input
                value={contact.city}
                onChange={(e) => onUpdate(index, "city", e.target.value)}
                placeholder="Ciudad o localidad"
                className={inputClass}
              />
            </div>
            <div>
              <label className={labelClass}>Provincia / Estado</label>
              <input
                value={contact.province}
                onChange={(e) => onUpdate(index, "province", e.target.value)}
                placeholder="Provincia o estado"
                className={inputClass}
              />
            </div>
            <div>
              <label className={labelClass}>
                Código postal{" "}
                <span className="normal-case tracking-normal">(opcional)</span>
              </label>
              <input
                value={contact.postalCode}
                onChange={(e) =>
                  onUpdate(index, "postalCode", e.target.value)
                }
                placeholder="Código postal"
                className={inputClass}
              />
            </div>
            <div>
              <label className={labelClass}>
                Referencias{" "}
                <span className="normal-case tracking-normal">(opcional)</span>
              </label>
              <input
                value={contact.addressNotes}
                onChange={(e) =>
                  onUpdate(index, "addressNotes", e.target.value)
                }
                placeholder="Entre calles, referencias"
                className={inputClass}
              />
            </div>
          </div>
        </div>
      ))}

      {referralContacts.length < 5 && (
        <button
          type="button"
          onClick={onAdd}
          className="px-4 py-2 text-sm font-medium rounded-lg bg-[#27272a] hover:bg-[#323238] text-zinc-300 border border-[#3f3f46] transition-colors"
        >
          Agregar referido ({referralContacts.length}/5)
        </button>
      )}

      {referralContacts.length > 0 && referralContacts.length < 5 && (
        <p className="text-xs text-zinc-500">
          Faltan {5 - referralContacts.length} referidos para que la
          supervisora pueda evaluar el descuento del 20%.
        </p>
      )}

      {referralContacts.length === 5 && (
        <p className="text-sm text-zinc-400">
          5 referidos cargados. La supervisora validará que no existan en su
          base de datos y aplicará el descuento del 20% si corresponde.
        </p>
      )}
    </div>
  );
}
