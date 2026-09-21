/**
 * Barrel export for the Audit module.
 *
 * Domain types are re-exported from shared ports to keep
 * the import path consistent within the audit module.
 */
export { AuditAction } from "@/shared/ports/audit-port";
export type { AuditPort, AuditEvent } from "@/shared/ports/audit-port";

// Domain
export type {
  AuditEventRepository,
  AuditEventRecord,
  AuditEventQueryFilters,
  AuditEventQueryOptions,
  AuditEventQueryResult,
} from "./domain";

// Application
export { GetAuditEventsUseCase } from "./application";
export type { GetAuditEventsInput } from "./application";
