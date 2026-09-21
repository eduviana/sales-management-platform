/**
 * Server Actions for catalog management.
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
  if (error instanceof ValidationError) {
    return { error: error.message };
  }
  if (error instanceof DomainError) {
    return { error: error.message };
  }
  console.error("Unexpected error in catalog action:", error);
  return { error: "Ocurrió un error inesperado. Intenta nuevamente." };
}

// =============================================================================
// Actions
// =============================================================================

export interface CreateCategoryState {
  readonly error: string | null;
  readonly success: boolean;
}

export async function createCategory(
  _prevState: CreateCategoryState,
  formData: FormData,
): Promise<CreateCategoryState> {
  try {
    const authContext = await resolveAuthContext();
    const useCases = getUseCases();

    const name = String(formData.get("name") ?? "").trim();
    const description = String(formData.get("description") ?? "").trim() || undefined;

    await useCases.createCategory.execute({
      authContext,
      name,
      description,
    });

    return { error: null, success: true };
  } catch (error) {
    return { ...handleActionError(error), success: false };
  }
}

export interface CreateProductState {
  readonly error: string | null;
  readonly success: boolean;
}

export async function createProduct(
  _prevState: CreateProductState,
  formData: FormData,
): Promise<CreateProductState> {
  try {
    const authContext = await resolveAuthContext();
    const useCases = getUseCases();

    const code = String(formData.get("code") ?? "").trim();
    const name = String(formData.get("name") ?? "").trim();
    const description = String(formData.get("description") ?? "").trim() || undefined;
    const price = parseFloat(String(formData.get("price") ?? "0"));
    const categoryId = String(formData.get("categoryId") ?? "");

    await useCases.createProduct.execute({
      authContext,
      code,
      name,
      description,
      price,
      categoryId,
    });

    return { error: null, success: true };
  } catch (error) {
    return { ...handleActionError(error), success: false };
  }
}

export interface UpdateProductState {
  readonly error: string | null;
  readonly success: boolean;
}

export async function updateProduct(
  productId: string,
  _prevState: UpdateProductState,
  formData: FormData,
): Promise<UpdateProductState> {
  try {
    const authContext = await resolveAuthContext();
    const useCases = getUseCases();

    const name = String(formData.get("name") ?? "").trim() || undefined;
    const description = String(formData.get("description") ?? "").trim() || undefined;
    const priceStr = String(formData.get("price") ?? "");
    const price = priceStr ? parseFloat(priceStr) : undefined;
    const categoryId = String(formData.get("categoryId") ?? "") || undefined;
    const isActive = formData.get("isActive") === "on";

    await useCases.updateProduct.execute({
      authContext,
      productId,
      name,
      description,
      price,
      categoryId,
      isActive,
    });

    return { error: null, success: true };
  } catch (error) {
    return { ...handleActionError(error), success: false };
  }
}
