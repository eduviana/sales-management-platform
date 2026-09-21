/**
 * Error hierarchy for Royal Prestige.
 *
 * Layer-specific error base classes:
 * - DomainError: business logic errors (no framework dependencies)
 * - InfrastructureError: persistence and external service errors
 *
 * Domain errors are thrown by use cases and domain services.
 * Infrastructure errors are thrown by adapters and repositories.
 * Presentation layer translates these into HTTP responses or UI messages.
 */

// =============================================================================
// Domain Errors
// =============================================================================

/**
 * Base class for all domain/business logic errors.
 * Domain errors represent violated business rules or invalid states.
 * They should never depend on framework, persistence, or infrastructure details.
 */
export class DomainError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "DomainError";
  }
}

/**
 * Thrown when a requested entity cannot be found.
 */
export class NotFoundError extends DomainError {
  readonly entity: string;
  readonly identifier?: string;

  constructor(entity: string, identifier?: string) {
    const msg = identifier
      ? `${entity} with identifier '${identifier}' not found.`
      : `${entity} not found.`;
    super(msg);
    this.name = "NotFoundError";
    this.entity = entity;
    this.identifier = identifier;
  }
}

/**
 * Thrown when input data violates validation rules.
 */
export class ValidationError extends DomainError {
  readonly field?: string;

  constructor(message: string, field?: string) {
    super(message);
    this.name = "ValidationError";
    this.field = field;
  }
}

/**
 * Thrown when a business rule is violated.
 * Example: "A seller cannot recruit at level 1."
 */
export class DomainRuleError extends DomainError {
  readonly rule?: string;

  constructor(message: string, rule?: string) {
    super(message);
    this.name = "DomainRuleError";
    this.rule = rule;
  }
}

/**
 * Thrown when an operation conflicts with the current state.
 * Example: "An open level history record already exists for this employee."
 */
export class ConflictError extends DomainError {
  constructor(message: string) {
    super(message);
    this.name = "ConflictError";
  }
}

/**
 * Thrown when the user is not authenticated.
 */
export class AuthenticationError extends DomainError {
  constructor(message: string = "Authentication required.") {
    super(message);
    this.name = "AuthenticationError";
  }
}

/**
 * Thrown when the user is authenticated but not authorized for the operation.
 */
export class AuthorizationError extends DomainError {
  constructor(message: string = "Insufficient permissions.") {
    super(message);
    this.name = "AuthorizationError";
  }
}

// =============================================================================
// Infrastructure Errors
// =============================================================================

/**
 * Base class for infrastructure errors (persistence, external services).
 * These should not leak into the domain layer.
 */
export class InfrastructureError extends Error {
  constructor(message: string, options?: { cause?: Error }) {
    super(message, options);
    this.name = "InfrastructureError";
  }
}

/**
 * Thrown when a database operation fails.
 */
export class DatabaseError extends InfrastructureError {
  constructor(message: string, options?: { cause?: Error }) {
    super(message, options);
    this.name = "DatabaseError";
  }
}
