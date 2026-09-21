/**
 * Zod schemas for the sale creation form.
 *
 * These validate form input (strings from HTML inputs), NOT domain data.
 * Domain validation lives in src/modules/sales/domain/sale.ts.
 *
 * Reference: requirements.md §3.4, data-model.md §23
 */

import { z } from "zod";

// =============================================================================
// Sub-schemas
// =============================================================================

export const paymentMethodSchema = z.enum(
  ["EFECTIVO", "TARJETA_CREDITO", "TARJETA_DEBITO", "TRANSFERENCIA", "OTRO"],
  { error: "Debe seleccionar un método de pago" },
);

export const documentTypeSchema = z.enum(
  ["DNI", "CUIT", "CUIL", "PASSPORT", "OTHER"],
  { error: "El tipo de documento no es válido" },
);

export const saleItemSchema = z.object({
  productId: z
    .string({ error: "El producto es obligatorio" })
    .uuid("Producto inválido"),
  productName: z
    .string({ error: "El nombre del producto es obligatorio" })
    .min(1, "El nombre del producto es obligatorio"),
  productCode: z
    .string({ error: "El código del producto es obligatorio" })
    .min(1, "El código del producto es obligatorio"),
  quantity: z
    .number({ error: "La cantidad debe ser un número válido" })
    .int("La cantidad debe ser un número entero")
    .min(1, "La cantidad debe ser al menos 1"),
  unitPrice: z
    .number({ error: "El precio debe ser un número válido" })
    .nonnegative("El precio no puede ser negativo"),
  subtotal: z
    .number({ error: "El subtotal debe ser un número válido" })
    .nonnegative("El subtotal no puede ser negativo"),
});

export const referralContactSchema = z.object({
  clientName: z
    .string({ error: "El nombre del referido es obligatorio" })
    .trim()
    .min(1, "El nombre del referido es obligatorio")
    .max(200, "El nombre del referido es demasiado largo"),
  phone: z
    .string({ error: "El teléfono del referido es obligatorio" })
    .trim()
    .min(1, "El teléfono del referido es obligatorio")
    .max(50, "El teléfono del referido es demasiado largo"),
  email: z
    .string()
    .trim()
    .email("El email del referido no es válido")
    .optional()
    .or(z.literal("")),
  street: z
    .string()
    .trim()
    .max(200, "La calle es demasiado larga")
    .optional()
    .or(z.literal("")),
  streetNumber: z
    .string()
    .trim()
    .max(20, "El número es demasiado largo")
    .optional()
    .or(z.literal("")),
  floor: z
    .string()
    .trim()
    .max(20, "El piso es demasiado largo")
    .optional()
    .or(z.literal("")),
  apartment: z
    .string()
    .trim()
    .max(20, "El departamento es demasiado largo")
    .optional()
    .or(z.literal("")),
  city: z
    .string()
    .trim()
    .max(100, "La ciudad es demasiado larga")
    .optional()
    .or(z.literal("")),
  province: z
    .string()
    .trim()
    .max(100, "La provincia es demasiado larga")
    .optional()
    .or(z.literal("")),
  postalCode: z
    .string()
    .trim()
    .max(20, "El código postal es demasiado largo")
    .optional()
    .or(z.literal("")),
  addressNotes: z
    .string()
    .trim()
    .max(500, "Las referencias son demasiado largas")
    .optional()
    .or(z.literal("")),
});

// =============================================================================
// Main form schema
// =============================================================================

export const createSaleFormSchema = z
  .object({
    saleDate: z
      .string()
      .min(1, "La fecha de venta es obligatoria")
      .refine(
        (value) => !Number.isNaN(new Date(`${value}T00:00:00`).getTime()),
        "La fecha de venta no es válida",
      ),

    visitId: z.string().uuid("Debe seleccionar una visita válida"),

    buyerName: z
      .string()
      .trim()
      .min(1, "El nombre del cliente es obligatorio")
      .max(255, "El nombre del cliente es demasiado largo"),

    clientPhone: z
      .string()
      .trim()
      .min(1, "El teléfono del cliente es obligatorio")
      .max(50, "El teléfono del cliente es demasiado largo"),

    clientEmail: z
      .string()
      .trim()
      .max(255, "El email del cliente es demasiado largo")
      .email("El email del cliente no es válido")
      .optional()
      .or(z.literal("")),

    clientDocumentType: documentTypeSchema.optional().or(z.literal("")),

    clientDocumentNumber: z
      .string()
      .trim()
      .max(50, "El número de documento es demasiado largo")
      .optional(),

    paymentMethod: paymentMethodSchema,

    installments: z.preprocess(
      (value) => {
        if (value === "" || value === null || value === undefined) {
          return undefined;
        }

        if (typeof value === "string") {
          const trimmed = value.trim();
          return trimmed === "" ? undefined : Number(trimmed);
        }

        return value;
      },
      z
        .number({ error: "Las cuotas deben ser un número válido" })
        .int("Las cuotas deben ser un número entero")
        .min(1, "Debe existir al menos una cuota")
        .max(48, "El máximo es de 48 cuotas")
        .optional(),
    ),

    deliveryStreet: z
      .string()
      .trim()
      .min(1, "La calle es obligatoria")
      .max(200, "La calle es demasiado larga"),

    deliveryStreetNumber: z
      .string()
      .trim()
      .min(1, "El número es obligatorio")
      .max(20, "El número es demasiado largo"),

    deliveryFloor: z
      .string()
      .trim()
      .max(20, "El piso es demasiado largo")
      .optional()
      .or(z.literal("")),

    deliveryApartment: z
      .string()
      .trim()
      .max(20, "El departamento es demasiado largo")
      .optional()
      .or(z.literal("")),

    deliveryCity: z
      .string()
      .trim()
      .min(1, "La ciudad es obligatoria")
      .max(100, "La ciudad es demasiado larga"),

    deliveryProvince: z
      .string()
      .trim()
      .min(1, "La provincia es obligatoria")
      .max(100, "La provincia es demasiado larga"),

    deliveryPostalCode: z
      .string()
      .trim()
      .max(20, "El código postal es demasiado largo")
      .optional()
      .or(z.literal("")),

    deliveryAddressNotes: z
      .string()
      .trim()
      .max(500, "Las referencias son demasiado largas")
      .optional()
      .or(z.literal("")),

    notes: z
      .string()
      .trim()
      .max(2000, "Las notas son demasiado largas")
      .optional(),

    items: z
      .array(saleItemSchema)
      .min(1, "Debe agregar al menos un producto"),

    referralContacts: z
      .array(referralContactSchema)
      .max(5, "El máximo es de 5 referidos"),
  })
  .superRefine((data, ctx) => {
    const requiresInstallments =
      data.paymentMethod === "TARJETA_CREDITO" ||
      data.paymentMethod === "TARJETA_DEBITO";

    if (requiresInstallments) {
      if (data.installments === undefined) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["installments"],
          message: "Debe indicar la cantidad de cuotas",
        });
      }
    }
  });

// =============================================================================
// Derived types
// =============================================================================

export type CreateSaleFormValues = z.infer<typeof createSaleFormSchema>;
export type SaleItem = z.infer<typeof saleItemSchema>;
export type ReferralContact = z.infer<typeof referralContactSchema>;
