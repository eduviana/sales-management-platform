/**
 * Server Actions for sales management.
 *
 * Each action:
 * 1. Resolves auth context server-side
 * 2. Validates input
 * 3. Executes the corresponding use case
 * 4. Returns result or error
 *
 * Reference: authorization.md §12, system-architecture.md §10
 */

"use server";

import { redirect } from "next/navigation";
import { prisma } from "@/infrastructure/prisma/client";
import { createAuthorizationService } from "@/modules/authorization/composition-root";
import { PrismaOrganizationRepository } from "@/infrastructure/organization/prisma-organization-repository";
import { createSalesUseCases } from "@/modules/sales/composition-root";
import { resolveAuthContext } from "./resolve-auth-context";
import {
  AuthenticationError,
  AuthorizationError,
  ValidationError,
  DomainError,
  NotFoundError,
} from "@/shared/errors";

// =============================================================================
// Shared setup
// =============================================================================

function getUseCases() {
  const auth = createAuthorizationService(prisma);
  const orgRepo = new PrismaOrganizationRepository(prisma);
  return createSalesUseCases(prisma, auth, orgRepo);
}

function handleActionError(error: unknown): { error: string } {
  if (error instanceof AuthenticationError) {
    return { error: "Debes iniciar sesión para realizar esta operación." };
  }
  if (error instanceof AuthorizationError) {
    return { error: "No tienes permisos para realizar esta operación." };
  }
  if (error instanceof NotFoundError) {
    if (error.entity === "ApplicableCommissionRule") {
      return { error: "No existe una regla de comisión aplicable para esta venta." };
    }
    return { error: "La venta solicitada no existe." };
  }
  if (error instanceof ValidationError) {
    return { error: error.message };
  }
  if (error instanceof DomainError) {
    return { error: error.message };
  }
  console.error("Unexpected error in sales action:", error);
  return { error: "Ocurrió un error inesperado. Intenta nuevamente." };
}

// =============================================================================
// Actions
// =============================================================================

export interface SaleActionState {
  readonly error: string | null;
  readonly saleId?: string;
}

export async function createSale(
  _prevState: SaleActionState,
  formData: FormData,
): Promise<SaleActionState> {
  try {
    const authContext = await resolveAuthContext();
    const useCases = getUseCases();

    const saleDateStr = String(formData.get("saleDate") ?? "");
    const saleDate = saleDateStr ? new Date(saleDateStr) : new Date();
    const visitId = String(formData.get("visitId") ?? "").trim();
    const buyerName = String(formData.get("buyerName") ?? "").trim() || undefined;
    const clientPhone = String(formData.get("clientPhone") ?? "").trim() || undefined;
    const clientEmail = String(formData.get("clientEmail") ?? "").trim() || undefined;
    const clientDocumentType = String(formData.get("clientDocumentType") ?? "").trim() || undefined;
    const clientDocumentNumber = String(formData.get("clientDocumentNumber") ?? "").trim() || undefined;
    const notes = String(formData.get("notes") ?? "").trim() || undefined;
    const paymentMethod = String(formData.get("paymentMethod") ?? "").trim() || undefined;
    const installmentsStr = String(formData.get("installments") ?? "");
    const installments = installmentsStr ? parseInt(installmentsStr) : undefined;
    const cardBrand = String(formData.get("cardBrand") ?? "").trim() || undefined;
    const cardLast4 = String(formData.get("cardLast4") ?? "").trim() || undefined;
    const deliveryAddress = String(formData.get("deliveryAddress") ?? "").trim();

    // Referral contacts (JSON array from form)
    const referralContactsJson = String(formData.get("referralContacts") ?? "[]");
    const referralContacts = JSON.parse(referralContactsJson) as Array<{
      clientName: string;
      phone: string;
      email?: string;
      street?: string;
      streetNumber?: string;
      floor?: string;
      apartment?: string;
      city?: string;
      province?: string;
      postalCode?: string;
      addressNotes?: string;
    }>;

    // Parse items for total calculation
    const itemsJson = String(formData.get("items") ?? "[]");
    const items = JSON.parse(itemsJson) as Array<{
      productId: string;
      quantity: number;
      unitPrice: number;
    }>;

    // No discount at creation time — discount is applied by supervisor
    // after validating referral contacts (REG-068).
    const discount = 0;
    const discountReason = undefined;

    const result = await useCases.createSale.execute({
      authContext,
      saleDate,
      visitId,
      items,
      buyerName,
      clientPhone,
      clientEmail,
      clientDocumentType,
      clientDocumentNumber,
      notes,
      paymentMethod,
      installments,
      cardBrand,
      cardLast4,
      discount,
      discountReason,
      deliveryAddress,
      referralContacts,
    });

    redirect(`/sales/${result.sale.id}`);
  } catch (error) {
    // Re-throw redirects
    if (
      error &&
      typeof error === "object" &&
      "digest" in error &&
      typeof (error as { digest: string }).digest === "string" &&
      (error as { digest: string }).digest.startsWith("NEXT_REDIRECT")
    ) {
      throw error;
    }
    return handleActionError(error);
  }
}

export async function updateSale(
  saleId: string,
  _prevState: SaleActionState,
  formData: FormData,
): Promise<SaleActionState> {
  try {
    const authContext = await resolveAuthContext();
    const useCases = getUseCases();

    const saleDateStr = String(formData.get("saleDate") ?? "");
    const saleDate = saleDateStr ? new Date(saleDateStr) : undefined;
    const buyerName = String(formData.get("buyerName") ?? "").trim() || undefined;
    const notes = String(formData.get("notes") ?? "").trim() || undefined;

    // Parse items from form data
    const itemsJson = String(formData.get("items") ?? "");
    const items = itemsJson
      ? (JSON.parse(itemsJson) as Array<{
          productId: string;
          quantity: number;
          unitPrice: number;
        }>)
      : undefined;

    await useCases.updateSale.execute({
      authContext,
      saleId,
      saleDate,
      items,
      buyerName,
      notes,
    });

    return { error: null, saleId };
  } catch (error) {
    return handleActionError(error);
  }
}

export async function submitSaleForReview(
  saleId: string,
): Promise<{ error: string | null }> {
  try {
    const authContext = await resolveAuthContext();
    const useCases = getUseCases();

    await useCases.submitSaleForReview.execute({
      authContext,
      saleId,
    });

    return { error: null };
  } catch (error) {
    return handleActionError(error);
  }
}

export async function approveSale(
  saleId: string,
): Promise<{ error: string | null }> {
  try {
    const authContext = await resolveAuthContext();
    const useCases = getUseCases();

    await useCases.approveSale.execute({
      authContext,
      saleId,
    });

    return { error: null };
  } catch (error) {
    return handleActionError(error);
  }
}

export async function rejectSale(
  saleId: string,
  _prevState: { error: string | null },
  formData: FormData,
): Promise<{ error: string | null }> {
  try {
    const authContext = await resolveAuthContext();
    const useCases = getUseCases();

    const reason = String(formData.get("reason") ?? "").trim();

    await useCases.rejectSale.execute({
      authContext,
      saleId,
      reason,
    });

    return { error: null };
  } catch (error) {
    return handleActionError(error);
  }
}

/**
 * Reject a sale with a reason string (not FormData).
 * Used by client components that construct the reason programmatically.
 */
export async function rejectSaleWithReason(
  saleId: string,
  reason: string,
): Promise<{ error: string | null }> {
  try {
    const authContext = await resolveAuthContext();
    const useCases = getUseCases();

    await useCases.rejectSale.execute({
      authContext,
      saleId,
      reason: reason.trim(),
    });

    return { error: null };
  } catch (error) {
    return handleActionError(error);
  }
}

export async function cancelSale(
  saleId: string,
): Promise<{ error: string | null }> {
  try {
    const authContext = await resolveAuthContext();
    const useCases = getUseCases();

    await useCases.cancelSale.execute({
      authContext,
      saleId,
    });

    return { error: null };
  } catch (error) {
    return handleActionError(error);
  }
}
