/**
 * Audit UI labels — human-readable presentation constants for audit events.
 *
 * Shared by the ADMIN dashboard overview and the /audit explorer so that
 * action names, result badges and resource labels stay consistent.
 *
 * Reference: ADR-009, requirements.md §3.12
 */

import {
  formatDate,
  formatDateTimeWithSeconds,
  formatTime,
} from "@/shared/presentation/format";

export const ACTION_LABELS: Record<string, string> = {
  LOGIN_SUCCESS: "Inicio de sesión",
  LOGIN_FAILURE: "Login fallido",
  LOGOUT: "Cierre de sesión",
  PASSWORD_CHANGED: "Cambio de contraseña",
  PASSWORD_RESET_REQUESTED: "Reset solicitado",
  PASSWORD_RESET_COMPLETED: "Reset completado",
  EMPLOYEE_CREATED: "Empleado creado",
  EMPLOYEE_UPDATED: "Empleado actualizado",
  EMPLOYEE_DEACTIVATED: "Empleado desactivado",
  EMPLOYEE_LEVEL_CHANGED: "Nivel cambiado",
  EMPLOYEE_SUPERVISOR_CHANGED: "Supervisor cambiado",
  SALE_CREATED: "Venta creada",
  SALE_UPDATED: "Venta actualizada",
  SALE_SUBMITTED: "Venta enviada",
  SALE_APPROVED: "Venta aprobada",
  SALE_REJECTED: "Venta rechazada",
  SALE_CANCELLED: "Venta cancelada",
  COMMISSION_RULE_CREATED: "Regla de comisión creada",
  COMMISSION_GENERATED: "Comisión generada",
  COMMISSION_REVERSED: "Comisión revertida",
  AUTHORIZATION_DENIED: "Denegación de autorización",
};

export const RESULT_BADGE: Record<string, string> = {
  SUCCESS: "badge-success",
  FAILURE: "badge-error",
  DENIED: "badge-warning",
};

export const RESULT_LABELS: Record<string, string> = {
  SUCCESS: "Éxito",
  FAILURE: "Fallo",
  DENIED: "Denegado",
};

export const RESOURCE_TYPE_LABELS: Record<string, string> = {
  Employee: "Empleado",
  Sale: "Venta",
  UserAccount: "Cuenta",
  CommissionRule: "Regla de comisión",
  CommissionEntry: "Comisión",
  Auth: "Autenticación",
  Authorization: "Autorización",
  System: "Sistema",
};

export function formatAuditDateTime(date: Date): string {
  return formatDateTimeWithSeconds(date);
}

export function formatAuditDateShort(date: Date): string {
  return formatDate(date);
}

export function formatAuditTimeShort(date: Date): string {
  return formatTime(date);
}