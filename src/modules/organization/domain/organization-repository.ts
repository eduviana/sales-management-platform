/**
 * Organization repository port (contract).
 *
 * Application layer depends on this interface for organization-related
 * persistence operations. Infrastructure implements the concrete
 * Prisma-based repository.
 *
 * Reference: data-architecture.md §7, system-architecture.md §6.4
 */

// =============================================================================
// Record types (minimal representations, no Prisma dependency)
// =============================================================================

export interface EmployeeRecord {
  readonly id: string;
  readonly employeeCode: number;
  readonly firstName: string;
  readonly lastName: string;
  readonly dni: string | null;
  readonly email: string | null;
  readonly phone: string | null;
  readonly dateOfBirth: Date | null;
  readonly joinedAt: Date;
  readonly currentLevelId: number | null;
  readonly supervisorId: string | null;
  readonly status: "ACTIVE" | "INACTIVE";
  readonly deactivatedAt: Date | null;
  readonly deactivationReason: string | null;
  readonly street: string | null;
  readonly streetNumber: string | null;
  readonly floor: string | null;
  readonly apartment: string | null;
  readonly city: string | null;
  readonly province: string | null;
  readonly postalCode: string | null;
  readonly createdAt: Date;
  readonly updatedAt: Date;
}

export interface LevelRecord {
  readonly id: number;
  readonly code: string;
  readonly rank: number;
  readonly name: string;
}

export interface LevelHistoryRecord {
  readonly id: string;
  readonly employeeId: string;
  readonly levelId: number;
  readonly startedAt: Date;
  readonly endedAt: Date | null;
  readonly reason: string | null;
  readonly createdAt: Date;
}

export interface SupervisorHistoryRecord {
  readonly id: string;
  readonly employeeId: string;
  readonly supervisorId: string | null;
  readonly startedAt: Date;
  readonly endedAt: Date | null;
  readonly reason: string | null;
  readonly createdAt: Date;
}

export interface EmployeeCommissionContext {
  readonly employeeId: string;
  readonly levelId: number | null;
  readonly joinedAt: Date;
}

export interface EmployeeCommissionContextPort {
  getEmployeeCommissionContext(
    employeeId: string,
    at: Date,
  ): Promise<EmployeeCommissionContext | null>;
}

// =============================================================================
// Create data types
// =============================================================================

export interface CreateEmployeeData {
  readonly firstName: string;
  readonly lastName: string;
  readonly joinedAt: Date;
  readonly currentLevelId: number;
  readonly supervisorId: string | null;
  readonly dni: string;
  readonly email: string;
  readonly phone: string;
  readonly dateOfBirth: Date;
  readonly street: string;
  readonly streetNumber: string;
  readonly floor: string | null;
  readonly apartment: string | null;
  readonly city: string;
  readonly province: string;
  readonly postalCode: string;
}

export interface UpdateEmployeeData {
  readonly firstName: string;
  readonly lastName: string;
  readonly dni: string | null;
  readonly email: string | null;
  readonly phone: string | null;
  readonly dateOfBirth: Date | null;
  readonly street: string | null;
  readonly streetNumber: string | null;
  readonly floor: string | null;
  readonly apartment: string | null;
  readonly city: string | null;
  readonly province: string | null;
  readonly postalCode: string | null;
}

export interface CreateLevelHistoryData {
  readonly employeeId: string;
  readonly levelId: number;
  readonly startedAt: Date;
  readonly reason?: string | null;
}

export interface CreateSupervisorHistoryData {
  readonly employeeId: string;
  readonly supervisorId: string | null;
  readonly startedAt: Date;
  readonly reason?: string | null;
}

// =============================================================================
// Repository port
// =============================================================================

export interface OrganizationRepository {
  // -------------------------------------------------------------------------
  // Employee
  // -------------------------------------------------------------------------

  /** Find an employee by ID. Returns null if not found. */
  findEmployeeById(id: string): Promise<EmployeeRecord | null>;

  /** Create a new employee. */
  createEmployee(data: CreateEmployeeData): Promise<EmployeeRecord>;

  /** Update an employee's editable personal data. */
  updateEmployee(
    employeeId: string,
    data: UpdateEmployeeData,
  ): Promise<void>;

  /** Update an employee's current level. */
  updateEmployeeLevel(
    employeeId: string,
    levelId: number,
  ): Promise<void>;

  /** Update an employee's supervisor. */
  updateEmployeeSupervisor(
    employeeId: string,
    supervisorId: string | null,
  ): Promise<void>;

  /** Update an employee's status. */
  updateEmployeeStatus(
    employeeId: string,
    status: "ACTIVE" | "INACTIVE",
  ): Promise<void>;

  // -------------------------------------------------------------------------
  // Level
  // -------------------------------------------------------------------------

  /** Find a level by its numeric ID. Returns null if not found. */
  findLevelById(id: number): Promise<LevelRecord | null>;

  // -------------------------------------------------------------------------
  // Level History
  // -------------------------------------------------------------------------

  /**
   * Display names of several employees (seller column on sales lists).
   */
  findNamesByIds(
    employeeIds: readonly string[],
  ): Promise<Array<{
    readonly id: string;
    readonly firstName: string;
    readonly lastName: string;
  }>>;

  /**
   * Employee codes of several employees (label lookup for audit events).
   */
  findEmployeeCodesByIds(
    employeeIds: readonly string[],
  ): Promise<Array<{ readonly id: string; readonly employeeCode: number }>>;

  /** Find the open (current) level history record for an employee. */
  findOpenLevelHistory(
    employeeId: string,
  ): Promise<LevelHistoryRecord | null>;

  /**
   * Find the open level history records for several employees.
   *
   * Consumed by the progression module to compute points, so it reads the
   * level history table through this port instead of querying it directly.
   */
  findOpenLevelHistories(
    employeeIds: readonly string[],
  ): Promise<LevelHistoryRecord[]>;

  /** Close a level history record by setting endedAt. */
  closeLevelHistory(
    historyId: string,
    endedAt: Date,
  ): Promise<void>;

  /** Create a new level history record. */
  createLevelHistory(
    data: CreateLevelHistoryData,
  ): Promise<LevelHistoryRecord>;

  // -------------------------------------------------------------------------
  // Supervisor History
  // -------------------------------------------------------------------------

  /** Find the open (current) supervisor history record for an employee. */
  findOpenSupervisorHistory(
    employeeId: string,
  ): Promise<SupervisorHistoryRecord | null>;

  /** Close a supervisor history record by setting endedAt. */
  closeSupervisorHistory(
    historyId: string,
    endedAt: Date,
  ): Promise<void>;

  /** Create a new supervisor history record. */
  createSupervisorHistory(
    data: CreateSupervisorHistoryData,
  ): Promise<SupervisorHistoryRecord>;

  // -------------------------------------------------------------------------
  // Hierarchy queries
  // -------------------------------------------------------------------------

  /** Get direct subordinates of an employee. */
  getDirectSubordinates(
    employeeId: string,
  ): Promise<EmployeeRecord[]>;

  /**
   * Get all descendant IDs of an employee (recursive).
   * Used for cycle detection before supervisor reassignment.
   */
  getDescendantIds(employeeId: string): Promise<string[]>;

  /** Get all ancestor IDs of an employee (from parent to root). */
  getAncestorIds(employeeId: string): Promise<string[]>;

  // -------------------------------------------------------------------------
  // Recruitment support
  // -------------------------------------------------------------------------

  /** Count direct subordinates of an employee. */
  countDirectSubordinates(employeeId: string): Promise<number>;

  // -------------------------------------------------------------------------
  // Global queries (for authorization scope resolution)
  // -------------------------------------------------------------------------

  /** Get all active employee IDs. Used for GLOBAL scope resolution. */
  getActiveEmployeeIds(): Promise<string[]>;

  /** Get all employees (for ADMIN management). */
  getAllEmployees(): Promise<EmployeeRecord[]>;

  // -------------------------------------------------------------------------
  // Transaction support
  // -------------------------------------------------------------------------

  /**
   * Execute a function within a database transaction.
   * The repository passed to the function shares the same transaction context.
   */
  executeInTransaction<T>(
    fn: (repo: OrganizationRepository) => Promise<T>,
  ): Promise<T>;
}
