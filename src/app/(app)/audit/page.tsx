/**
 * Audit page — ADMIN audit trail explorer.
 *
 * Server Component that gates access to the ADMIN role and renders
 * the client-side explorer (filters, search, pagination).
 *
 * Reference: requirements.md §3.12, permissions-matrix.md §4.14, ADR-009
 */

import { resolveAuthContext } from "@/modules/sales/presentation/resolve-auth-context";
import { redirect } from "next/navigation";
import { AuditClient } from "./audit-client";

export const metadata = {
  title: "Auditoría — Royal Prestige",
};

export default async function AuditPage() {
  const authContext = await resolveAuthContext();

  // Only ADMIN can access this page
  if (authContext.role !== "ADMIN") {
    redirect("/dashboard");
  }

  return (
    <AuditClient
      headerTitle="Auditoría del Sistema"
      headerSubtitle="Registro de eventos de auditoría con filtros, búsqueda y paginación."
    />
  );
}