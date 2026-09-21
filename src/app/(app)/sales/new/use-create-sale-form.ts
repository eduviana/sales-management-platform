/**
 * Custom hook for the sale creation form.
 *
 * Encapsulates all form state, validation, and submission logic.
 * The component only handles rendering.
 *
 * Reference: requirements.md §3.4, data-model.md §23
 */

"use client";

import { useCallback, useEffect, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { useActionState } from "react";
import { useForm, useWatch, type FieldErrors, type Resolver } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import { createSale } from "@/modules/sales/presentation/sale-actions";
import type { ProductData } from "@/modules/sales/domain";
import type { Visit } from "@/modules/visits/domain";
import type { SaleActionState } from "@/modules/sales/presentation/sale-actions";

import {
  createSaleFormSchema,
  type CreateSaleFormValues,
  type SaleItem,
  type ReferralContact,
} from "./create-sale-form-schema";

// =============================================================================
// Types
// =============================================================================

export interface UseCreateSaleFormProps {
  readonly products: readonly ProductData[];
  readonly visits: readonly Visit[];
  readonly fixedVisit?: Visit;
}

export interface UseCreateSaleFormReturn {
  // Form methods
  register: ReturnType<typeof useForm<CreateSaleFormValues>>["register"];
  handleSubmit: ReturnType<typeof useForm<CreateSaleFormValues>>["handleSubmit"];
  control: ReturnType<typeof useForm<CreateSaleFormValues>>["control"];
  errors: ReturnType<typeof useForm<CreateSaleFormValues>>["formState"]["errors"];
  submitCount: ReturnType<typeof useForm<CreateSaleFormValues>>["formState"]["submitCount"];

  // Action state
  state: SaleActionState;
  isPending: boolean;

  // Items
  items: SaleItem[];
  selectedProductId: string;
  quantity: number;
  selectedProduct: ProductData | undefined;
  subtotal: number;
  total: number;

  // Referral contacts
  referralContacts: ReferralContact[];

  // Derived
  showInstallments: boolean;
  paymentMethod: string | undefined;

  // Form error
  formError: string | null;

  // Navigation
  goBack: () => void;

  // Actions
  onSubmit: (data: CreateSaleFormValues) => void;
  onFormValidationError: (errors: FieldErrors<CreateSaleFormValues>) => void;
  addItem: () => void;
  removeItem: (index: number) => void;
  setSelectedProductId: (id: string) => void;
  setQuantity: (qty: number) => void;
  addReferralContact: () => void;
  updateReferralContact: (
    index: number,
    field: keyof ReferralContact,
    value: string,
  ) => void;
  removeReferralContact: (index: number) => void;
}

// =============================================================================
// Helpers
// =============================================================================

function getTodayDate(): string {
  const today = new Date();
  const year = today.getFullYear();
  const month = String(today.getMonth() + 1).padStart(2, "0");
  const day = String(today.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function formatValidationErrors(
  errors: FieldErrors<CreateSaleFormValues>,
): string {
  const messages: string[] = [];

  for (const [field, error] of Object.entries(errors)) {
    if (error?.message) {
      messages.push(`${field}: ${String(error.message)}`);
    } else if (Array.isArray(error)) {
      for (let i = 0; i < error.length; i++) {
        const item = error[i];
        if (item && typeof item === "object") {
          for (const [key, nested] of Object.entries(
            item as Record<string, { message?: string }>,
          )) {
            if (nested?.message) {
              messages.push(`items[${i}].${key}: ${String(nested.message)}`);
            }
          }
        }
      }
    }
  }

  return messages.length > 0
    ? `Corregí los errores: ${messages.join("; ")}`
    : "Completá todos los campos obligatorios.";
}

// =============================================================================
// Hook
// =============================================================================

export function useCreateSaleForm({
  products,
  visits,
  fixedVisit,
}: UseCreateSaleFormProps): UseCreateSaleFormReturn {
  const router = useRouter();

  // Local state
  const [items, setItems] = useState<SaleItem[]>([]);
  const [referralContacts, setReferralContacts] = useState<ReferralContact[]>(
    [],
  );
  const [selectedProductId, setSelectedProductId] = useState("");
  const [quantity, setQuantity] = useState(1);
  const [formError, setFormError] = useState<string | null>(null);

  // Action state
  const [state, formAction, isPending] = useActionState(createSale, {
    error: null,
  });
  const [, startTransition] = useTransition();

  // Form
  const {
    register,
    handleSubmit,
    setValue,
    control,
    formState: { errors, submitCount },
  } = useForm<CreateSaleFormValues>({
    resolver: zodResolver(createSaleFormSchema) as Resolver<CreateSaleFormValues>,
    mode: "onSubmit",
    defaultValues: {
      saleDate: getTodayDate(),
      visitId: fixedVisit?.id ?? "",
      buyerName: fixedVisit?.clientName ?? "",
      clientPhone: fixedVisit?.clientPhone ?? "",
      clientEmail: fixedVisit?.clientEmail ?? "",
      clientDocumentType: undefined,
      clientDocumentNumber: "",
      paymentMethod: undefined,
      installments: undefined,
      deliveryStreet: fixedVisit?.visitStreet ?? "",
      deliveryStreetNumber: fixedVisit?.visitStreetNumber ?? "",
      deliveryFloor: fixedVisit?.visitFloor ?? "",
      deliveryApartment: fixedVisit?.visitApartment ?? "",
      deliveryCity: fixedVisit?.visitCity ?? "",
      deliveryProvince: fixedVisit?.visitProvince ?? "",
      deliveryPostalCode: fixedVisit?.visitPostalCode ?? "",
      deliveryAddressNotes: fixedVisit?.visitAddressNotes ?? "",
      notes: "",
      items: [],
      referralContacts: [],
    },
  });

  // Derived state
  const paymentMethod = useWatch({ control, name: "paymentMethod" });
  const showInstallments =
    paymentMethod === "TARJETA_CREDITO" || paymentMethod === "TARJETA_DEBITO";

  const selectedProduct = products.find(
    (product) => product.id === selectedProductId,
  );

  const subtotal = items.reduce((sum, item) => sum + item.subtotal, 0);
  const total = subtotal;

  // =============================================================================
  // Effects — sync local state with form
  // =============================================================================

  useEffect(() => {
    setValue("items", items, { shouldValidate: false, shouldDirty: true });
  }, [items, setValue]);

  useEffect(() => {
    setValue("referralContacts", referralContacts, {
      shouldValidate: false,
      shouldDirty: true,
    });
  }, [referralContacts, setValue]);

  useEffect(() => {
    if (!showInstallments) {
      setValue("installments", undefined, {
        shouldValidate: false,
        shouldDirty: false,
      });
    }
  }, [showInstallments, setValue]);

  // =============================================================================
  // Handlers — items
  // =============================================================================

  const addItem = useCallback(() => {
    if (!selectedProduct) return;
    if (!Number.isInteger(quantity) || quantity < 1) return;

    setItems((currentItems) => {
      const existingIndex = currentItems.findIndex(
        (item) => item.productId === selectedProduct.id,
      );

      if (existingIndex >= 0) {
        const updated = [...currentItems];
        const existingItem = updated[existingIndex];
        const newQuantity = existingItem.quantity + quantity;

        updated[existingIndex] = {
          ...existingItem,
          quantity: newQuantity,
          subtotal: newQuantity * existingItem.unitPrice,
        };

        return updated;
      }

      return [
        ...currentItems,
        {
          productId: selectedProduct.id,
          productName: selectedProduct.name,
          productCode: selectedProduct.code,
          quantity,
          unitPrice: selectedProduct.price,
          subtotal: quantity * selectedProduct.price,
        },
      ];
    });

    setSelectedProductId("");
    setQuantity(1);
  }, [selectedProduct, quantity]);

  const removeItem = useCallback((index: number) => {
    setItems((currentItems) =>
      currentItems.filter((_, itemIndex) => itemIndex !== index),
    );
  }, []);

  // =============================================================================
  // Handlers — referral contacts
  // =============================================================================

  const addReferralContact = useCallback(() => {
    setReferralContacts((current) => [
      ...current,
      {
        clientName: "",
        phone: "",
        email: "",
        street: "",
        streetNumber: "",
        floor: "",
        apartment: "",
        city: "",
        province: "",
        postalCode: "",
        addressNotes: "",
      },
    ]);
  }, []);

  const updateReferralContact = useCallback(
    (index: number, field: keyof ReferralContact, value: string) => {
      setReferralContacts((current) =>
        current.map((item, itemIndex) =>
          itemIndex === index ? { ...item, [field]: value } : item,
        ),
      );
    },
    [],
  );

  const removeReferralContact = useCallback((index: number) => {
    setReferralContacts((current) =>
      current.filter((_, itemIndex) => itemIndex !== index),
    );
  }, []);

  // =============================================================================
  // Submit
  // =============================================================================

  const onFormValidationError = useCallback(
    (validationErrors: FieldErrors<CreateSaleFormValues>) => {
      setFormError(formatValidationErrors(validationErrors));
    },
    [],
  );

  const onSubmit = useCallback(
    (data: CreateSaleFormValues) => {
      setFormError(null);

      try {
        const formData = new FormData();

        formData.set("saleDate", data.saleDate);
        formData.set("visitId", data.visitId);
        formData.set("buyerName", data.buyerName?.trim() ?? "");
        formData.set("clientPhone", data.clientPhone.trim());
        formData.set("clientEmail", data.clientEmail?.trim() ?? "");
        formData.set("clientDocumentType", data.clientDocumentType ?? "");
        formData.set(
          "clientDocumentNumber",
          data.clientDocumentNumber?.trim() ?? "",
        );
        formData.set("paymentMethod", data.paymentMethod);
        formData.set(
          "installments",
          data.installments === undefined ? "" : String(data.installments),
        );

        // Build deliveryAddress from individual fields
        const street = data.deliveryStreet.trim();
        const streetNumber = data.deliveryStreetNumber.trim();
        const floor = data.deliveryFloor?.trim() ?? "";
        const apartment = data.deliveryApartment?.trim() ?? "";
        const city = data.deliveryCity.trim();
        const province = data.deliveryProvince.trim();
        const postalCode = data.deliveryPostalCode?.trim() ?? "";
        const addressNotes = data.deliveryAddressNotes?.trim() ?? "";

        const addressLine = `${street} ${streetNumber}${floor ? `, Piso ${floor}` : ""}${apartment ? `, Depto. ${apartment}` : ""}`;
        const locality = [city, province, postalCode]
          .filter(Boolean)
          .join(", ");
        const deliveryAddress = [addressLine, locality, addressNotes]
          .filter(Boolean)
          .join(" — ");

        formData.set("deliveryAddress", deliveryAddress);
        formData.set("notes", data.notes?.trim() ?? "");
        formData.set("items", JSON.stringify(data.items));
        formData.set("referralContacts", JSON.stringify(data.referralContacts));

        startTransition(() => {
          formAction(formData);
        });
      } catch (error) {
        console.error("[CreateSaleForm] Error building/sending form data:", error);
        setFormError(
          "Ocurrió un error al enviar el formulario. Intentá nuevamente.",
        );
      }
    },
    [formAction],
  );

  // =============================================================================
  // Navigation
  // =============================================================================

  const goBack = useCallback(() => {
    router.back();
  }, [router]);

  // =============================================================================
  // Return
  // =============================================================================

  return {
    // Form methods
    register,
    handleSubmit,
    control,
    errors,
    submitCount,

    // Action state
    state,
    isPending,

    // Items
    items,
    selectedProductId,
    quantity,
    selectedProduct,
    subtotal,
    total,

    // Referral contacts
    referralContacts,

    // Derived
    showInstallments,
    paymentMethod,

    // Form error
    formError,

    // Navigation
    goBack,

    // Actions
    onSubmit,
    onFormValidationError,
    addItem,
    removeItem,
    setSelectedProductId,
    setQuantity,
    addReferralContact,
    updateReferralContact,
    removeReferralContact,
  };
}
