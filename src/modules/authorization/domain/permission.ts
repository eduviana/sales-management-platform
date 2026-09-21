/**
 * Permission type for Royal Prestige.
 *
 * Permissions are string identifiers derived from the permissions matrix
 * (docs/product/permissions-matrix.md). They represent abstract operations
 * that a user may or may not be authorized to perform.
 *
 * Permissions are independent of scope — the same permission may apply
 * to different scopes depending on the user's level and role.
 *
 * Reference: authorization.md §5, permissions-matrix.md §4
 */

/**
 * All defined permissions in the system.
 *
 * Naming convention: `resource.action` or `resource.actionScope`.
 *
 * This type is a union of string literals. When the permissions matrix
 * evolves, add new literals here — no DB migration required.
 */
export type Permission =
  // Dashboard
  | "dashboard.view"
  | "dashboard.viewOwnMetrics"
  | "dashboard.viewTeamMetrics"
  | "dashboard.viewBranchMetrics"
  | "dashboard.viewGlobalMetrics"
  // Employee
  | "employee.read"
  | "employee.create"
  | "employee.update"
  | "employee.deactivate"
  | "employee.assignSupervisor"
  | "employee.assignLevel"
  | "employee.assignTeam"
  // Team
  | "team.read"
  | "team.create"
  | "team.update"
  | "team.manageMembers"
  | "team.viewMetrics"
  | "team.viewSubteams"
  // Sale
  | "sale.readOwn"
  | "sale.readTeam"
  | "sale.readBranch"
  | "sale.readGlobal"
  | "sale.create"
  | "sale.update"
  | "sale.cancel"
  | "sale.approve"
  | "sale.reject"
  // Catalog
  | "catalog.read"
  | "catalog.create"
  | "catalog.update"
  // Analytics
  | "analytics.viewOwn"
  | "analytics.viewTeam"
  | "analytics.viewBranch"
  | "analytics.viewGlobal"
  | "analytics.comparePeriods"
  | "analytics.compareEmployees"
  | "analytics.viewRanking"
  // Report
  | "report.generate"
  | "report.export"
  // Goal
  | "goal.readOwn"
  | "goal.readTeam"
  | "goal.readBranch"
  | "goal.create"
  | "goal.update"
  | "goal.delete"
  // Hierarchy
  | "hierarchy.readOwn"
  | "hierarchy.readTeam"
  | "hierarchy.readBranch"
  | "hierarchy.readGlobal"
  | "hierarchy.update"
  | "level.read"
  | "level.update"
  // Commission
  | "commission.readOwn"
  | "commission.readTeam"
  | "commission.readBranch"
  | "commission.readGlobal"
  | "commission.viewRules"
  | "commission.manageRules"
  | "commission.recalculate"
  | "commission.export"
  // Training
  | "training.read"
  | "training.download"
  | "training.manage"
  | "training.create"
  | "training.update"
  | "training.delete"
  | "training.publish"
  | "training.viewProgress"
  | "training.updateProgress"
  | "training.manageCourses"
  // Audit
  | "audit.read"
  | "audit.export"
  // Client (Phase 10)
  | "client.view"
  | "client.create"
  | "client.update"
  | "client.assign"
  // Visit (Phase 10)
  | "visit.view"
  | "visit.create"
  | "visit.update"
  // Referral (Phase 10)
  | "referral.view"
  | "referral.create";

/**
 * Well-known permission groups for convenience.
 * These are NOT separate permissions — they are subsets of the Permission union.
 */
export const PERMISSION_GROUPS = {
  DASHBOARD_READ: [
    "dashboard.view",
    "dashboard.viewOwnMetrics",
    "dashboard.viewTeamMetrics",
    "dashboard.viewBranchMetrics",
    "dashboard.viewGlobalMetrics",
  ] as const,

  EMPLOYEE_READ: ["employee.read"] as const,
  EMPLOYEE_WRITE: [
    "employee.create",
    "employee.update",
    "employee.deactivate",
    "employee.assignSupervisor",
    "employee.assignLevel",
    "employee.assignTeam",
  ] as const,

  SALE_READ: [
    "sale.readOwn",
    "sale.readTeam",
    "sale.readBranch",
    "sale.readGlobal",
  ] as const,
  SALE_WRITE: ["sale.create", "sale.update", "sale.cancel"] as const,
  SALE_REVIEW: ["sale.approve", "sale.reject"] as const,

  CATALOG_READ: ["catalog.read"] as const,
  CATALOG_WRITE: ["catalog.create", "catalog.update"] as const,

  TRAINING_READ: ["training.read", "training.download"] as const,
  TRAINING_WRITE: [
    "training.manage",
    "training.create",
    "training.update",
    "training.delete",
    "training.publish",
    "training.manageCourses",
  ] as const,

  AUDIT_READ: ["audit.read", "audit.export"] as const,

  CLIENT_READ: ["client.view"] as const,
  CLIENT_WRITE: ["client.create", "client.update", "client.assign"] as const,

  VISIT_READ: ["visit.view"] as const,
  VISIT_WRITE: ["visit.create", "visit.update"] as const,

  REFERRAL_READ: ["referral.view"] as const,
  REFERRAL_WRITE: ["referral.create"] as const,
} as const;
