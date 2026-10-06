/**
 * Audit port (contract) for the Application layer.
 *
 * Application layer emits audit events through this interface.
 * Infrastructure implements the actual persistence of audit events.
 *
 * Reference: ADR-009, data-architecture.md §13, REG-052..REG-054
 */

/**
 * Enumeration of all auditable actions.
 * Each value corresponds to a specific business event.
 */
export enum AuditAction {
  // Identity
  LOGIN_SUCCESS = "LOGIN_SUCCESS",
  LOGIN_FAILURE = "LOGIN_FAILURE",
  LOGOUT = "LOGOUT",
  PASSWORD_CHANGED = "PASSWORD_CHANGED",
  PASSWORD_RESET_REQUESTED = "PASSWORD_RESET_REQUESTED",
  PASSWORD_RESET_COMPLETED = "PASSWORD_RESET_COMPLETED",

  // Organization
  EMPLOYEE_CREATED = "EMPLOYEE_CREATED",
  EMPLOYEE_UPDATED = "EMPLOYEE_UPDATED",
  EMPLOYEE_DEACTIVATED = "EMPLOYEE_DEACTIVATED",
  EMPLOYEE_LEVEL_CHANGED = "EMPLOYEE_LEVEL_CHANGED",
  EMPLOYEE_SUPERVISOR_CHANGED = "EMPLOYEE_SUPERVISOR_CHANGED",

  // Sales
  SALE_CREATED = "SALE_CREATED",
  SALE_UPDATED = "SALE_UPDATED",
  SALE_SUBMITTED = "SALE_SUBMITTED",
  SALE_APPROVED = "SALE_APPROVED",
  SALE_REJECTED = "SALE_REJECTED",
  SALE_CANCELLED = "SALE_CANCELLED",

  // Commissions
  COMMISSION_RULE_CREATED = "COMMISSION_RULE_CREATED",
  COMMISSION_GENERATED = "COMMISSION_GENERATED",
  COMMISSION_REVERSED = "COMMISSION_REVERSED",

  // Authorization
  AUTHORIZATION_DENIED = "AUTHORIZATION_DENIED",
}

/**
 * Represents a single auditable event.
 */
export interface AuditEvent {
  /** ID of the user who performed the action (null for system actions). */
  readonly actorId: string | null;

  /** Historical snapshot of the actor's email at event time (null for system actions). */
  readonly actorEmail: string | null;

  /** Action performed. */
  readonly action: AuditAction;

  /** Resource type affected (e.g., "Employee", "Sale"). */
  readonly resourceType: string;

  /** ID of the specific resource affected (null for collection operations). */
  readonly resourceId: string | null;

  /** Outcome of the operation. */
  readonly result: "SUCCESS" | "FAILURE" | "DENIED";

  /** Optional correlation ID for tracing related events. */
  readonly correlationId: string | null;

  /** Optional structured metadata (change context, request metadata, etc.). */
  readonly metadata: Record<string, unknown> | null;

  /** When the event occurred. */
  readonly timestamp: Date;
}

/**
 * Port for persisting audit events.
 *
 * Implementations should be best-effort: audit logging must never
 * cause a business operation to fail. If persistence fails, the
 * error should be logged internally (e.g., to monitoring) but not
 * propagated to the caller.
 */
export interface AuditPort {
  /**
   * Record an audit event.
   * Must be idempotent and must never throw.
   */
  log(event: AuditEvent): Promise<void>;
}
