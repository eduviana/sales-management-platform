/**
 * Role-based Permission Evaluator implementation.
 *
 * Evaluates permissions based on the user's role and commercial level.
 * Encodes the permissions matrix from docs/product/permissions-matrix.md.
 *
 * This is a data-driven implementation — permissions are defined as rules
 * that map (role, level) → (granted, maxScope). Adding new permissions
 * or modifying access requires only updating the rules table.
 *
 * Reference: permissions-matrix.md §5, authorization.md §7
 */

import type {
  AuthorizationContext,
  PermissionEvaluator,
  PermissionEvaluationResult,
} from "@/modules/authorization/domain";
import { ScopeType } from "@/modules/authorization/domain";
import type { Permission } from "@/modules/authorization/domain";

/**
 * A permission rule defines who can access a permission and with what scope.
 */
interface PermissionRule {
  /** The permission this rule applies to. */
  readonly permission: Permission;

  /**
   * Required role. If undefined, applies to both SELLER and ADMIN.
   */
  readonly role?: "SELLER" | "ADMIN";

  /**
   * Minimum commercial level required (inclusive).
   * Only applies when role is SELLER or undefined.
   * Level 1 = lowest, 7 = highest.
   */
  readonly minLevel?: number;

  /**
   * Maximum commercial level allowed (inclusive).
   * Only applies when role is SELLER or undefined.
   */
  readonly maxLevel?: number;

  /**
   * Maximum scope allowed for this permission.
   * The user may have a lower scope based on their level.
   */
  readonly maxScope: ScopeType;
}

/**
 * Permission rules derived from the permissions matrix.
 *
 * Rules are evaluated in order — first matching rule wins.
 * ADMIN rules come first to ensure ADMIN always gets GLOBAL scope.
 *
 * Reference: permissions-matrix.md §5, §6, §7
 */
const PERMISSION_RULES: readonly PermissionRule[] = [
  // =========================================================================
  // ADMIN rules — ADMIN gets GLOBAL scope for everything
  // =========================================================================

  // Dashboard
  { permission: "dashboard.view", role: "ADMIN", maxScope: ScopeType.GLOBAL },
  { permission: "dashboard.viewOwnMetrics", role: "ADMIN", maxScope: ScopeType.GLOBAL },
  { permission: "dashboard.viewTeamMetrics", role: "ADMIN", maxScope: ScopeType.GLOBAL },
  { permission: "dashboard.viewBranchMetrics", role: "ADMIN", maxScope: ScopeType.GLOBAL },
  { permission: "dashboard.viewGlobalMetrics", role: "ADMIN", maxScope: ScopeType.GLOBAL },

  // Employee
  { permission: "employee.read", role: "ADMIN", maxScope: ScopeType.GLOBAL },
  { permission: "employee.create", role: "ADMIN", maxScope: ScopeType.GLOBAL },
  { permission: "employee.update", role: "ADMIN", maxScope: ScopeType.GLOBAL },
  { permission: "employee.deactivate", role: "ADMIN", maxScope: ScopeType.GLOBAL },
  { permission: "employee.assignSupervisor", role: "ADMIN", maxScope: ScopeType.GLOBAL },
  { permission: "employee.assignLevel", role: "ADMIN", maxScope: ScopeType.GLOBAL },
  { permission: "employee.assignTeam", role: "ADMIN", maxScope: ScopeType.GLOBAL },

  // Team
  { permission: "team.read", role: "ADMIN", maxScope: ScopeType.GLOBAL },
  { permission: "team.create", role: "ADMIN", maxScope: ScopeType.GLOBAL },
  { permission: "team.update", role: "ADMIN", maxScope: ScopeType.GLOBAL },
  { permission: "team.manageMembers", role: "ADMIN", maxScope: ScopeType.GLOBAL },
  { permission: "team.viewMetrics", role: "ADMIN", maxScope: ScopeType.GLOBAL },
  { permission: "team.viewSubteams", role: "ADMIN", maxScope: ScopeType.GLOBAL },

  // Sale
  { permission: "sale.readOwn", role: "ADMIN", maxScope: ScopeType.GLOBAL },
  { permission: "sale.readTeam", role: "ADMIN", maxScope: ScopeType.GLOBAL },
  { permission: "sale.readBranch", role: "ADMIN", maxScope: ScopeType.GLOBAL },
  { permission: "sale.readGlobal", role: "ADMIN", maxScope: ScopeType.GLOBAL },
  { permission: "sale.create", role: "ADMIN", maxScope: ScopeType.GLOBAL },
  { permission: "sale.update", role: "ADMIN", maxScope: ScopeType.GLOBAL },
  { permission: "sale.cancel", role: "ADMIN", maxScope: ScopeType.GLOBAL },
  { permission: "sale.approve", role: "ADMIN", maxScope: ScopeType.GLOBAL },
  { permission: "sale.reject", role: "ADMIN", maxScope: ScopeType.GLOBAL },

  // Catalog (ADMIN manages catalog)
  { permission: "catalog.read", role: "ADMIN", maxScope: ScopeType.GLOBAL },
  { permission: "catalog.create", role: "ADMIN", maxScope: ScopeType.GLOBAL },
  { permission: "catalog.update", role: "ADMIN", maxScope: ScopeType.GLOBAL },

  // Analytics
  { permission: "analytics.viewOwn", role: "ADMIN", maxScope: ScopeType.GLOBAL },
  { permission: "analytics.viewTeam", role: "ADMIN", maxScope: ScopeType.GLOBAL },
  { permission: "analytics.viewBranch", role: "ADMIN", maxScope: ScopeType.GLOBAL },
  { permission: "analytics.viewGlobal", role: "ADMIN", maxScope: ScopeType.GLOBAL },
  { permission: "analytics.comparePeriods", role: "ADMIN", maxScope: ScopeType.GLOBAL },
  { permission: "analytics.compareEmployees", role: "ADMIN", maxScope: ScopeType.GLOBAL },
  { permission: "analytics.viewRanking", role: "ADMIN", maxScope: ScopeType.GLOBAL },

  // Report
  { permission: "report.generate", role: "ADMIN", maxScope: ScopeType.GLOBAL },
  { permission: "report.export", role: "ADMIN", maxScope: ScopeType.GLOBAL },

  // Goal
  { permission: "goal.readOwn", role: "ADMIN", maxScope: ScopeType.GLOBAL },
  { permission: "goal.readTeam", role: "ADMIN", maxScope: ScopeType.GLOBAL },
  { permission: "goal.readBranch", role: "ADMIN", maxScope: ScopeType.GLOBAL },
  { permission: "goal.create", role: "ADMIN", maxScope: ScopeType.GLOBAL },
  { permission: "goal.update", role: "ADMIN", maxScope: ScopeType.GLOBAL },
  { permission: "goal.delete", role: "ADMIN", maxScope: ScopeType.GLOBAL },

  // Hierarchy
  { permission: "hierarchy.readOwn", role: "ADMIN", maxScope: ScopeType.GLOBAL },
  { permission: "hierarchy.readTeam", role: "ADMIN", maxScope: ScopeType.GLOBAL },
  { permission: "hierarchy.readBranch", role: "ADMIN", maxScope: ScopeType.GLOBAL },
  { permission: "hierarchy.readGlobal", role: "ADMIN", maxScope: ScopeType.GLOBAL },
  { permission: "hierarchy.update", role: "ADMIN", maxScope: ScopeType.GLOBAL },
  { permission: "level.read", role: "ADMIN", maxScope: ScopeType.GLOBAL },
  { permission: "level.update", role: "ADMIN", maxScope: ScopeType.GLOBAL },

  // Commission
  { permission: "commission.readOwn", role: "ADMIN", maxScope: ScopeType.GLOBAL },
  { permission: "commission.readTeam", role: "ADMIN", maxScope: ScopeType.GLOBAL },
  { permission: "commission.readBranch", role: "ADMIN", maxScope: ScopeType.GLOBAL },
  { permission: "commission.readGlobal", role: "ADMIN", maxScope: ScopeType.GLOBAL },
  { permission: "commission.viewRules", role: "ADMIN", maxScope: ScopeType.GLOBAL },
  { permission: "commission.manageRules", role: "ADMIN", maxScope: ScopeType.GLOBAL },
  { permission: "commission.recalculate", role: "ADMIN", maxScope: ScopeType.GLOBAL },
  { permission: "commission.export", role: "ADMIN", maxScope: ScopeType.GLOBAL },

  // Training (ADMIN gets GLOBAL for all training permissions)
  { permission: "training.read", role: "ADMIN", maxScope: ScopeType.GLOBAL },
  { permission: "training.download", role: "ADMIN", maxScope: ScopeType.GLOBAL },
  { permission: "training.manage", role: "ADMIN", maxScope: ScopeType.GLOBAL },
  { permission: "training.create", role: "ADMIN", maxScope: ScopeType.GLOBAL },
  { permission: "training.update", role: "ADMIN", maxScope: ScopeType.GLOBAL },
  { permission: "training.delete", role: "ADMIN", maxScope: ScopeType.GLOBAL },
  { permission: "training.publish", role: "ADMIN", maxScope: ScopeType.GLOBAL },
  { permission: "training.viewProgress", role: "ADMIN", maxScope: ScopeType.GLOBAL },
  { permission: "training.updateProgress", role: "ADMIN", maxScope: ScopeType.GLOBAL },
  { permission: "training.manageCourses", role: "ADMIN", maxScope: ScopeType.GLOBAL },

  // Audit
  { permission: "audit.read", role: "ADMIN", maxScope: ScopeType.GLOBAL },
  { permission: "audit.export", role: "ADMIN", maxScope: ScopeType.GLOBAL },

  // Client (Phase 10)
  { permission: "client.view", role: "ADMIN", maxScope: ScopeType.GLOBAL },
  { permission: "client.create", role: "ADMIN", maxScope: ScopeType.GLOBAL },
  { permission: "client.update", role: "ADMIN", maxScope: ScopeType.GLOBAL },
  { permission: "client.assign", role: "ADMIN", maxScope: ScopeType.GLOBAL },

  // Visit (Phase 10)
  { permission: "visit.view", role: "ADMIN", maxScope: ScopeType.GLOBAL },
  { permission: "visit.create", role: "ADMIN", maxScope: ScopeType.GLOBAL },
  { permission: "visit.update", role: "ADMIN", maxScope: ScopeType.GLOBAL },

  // Referral (Phase 10)
  { permission: "referral.view", role: "ADMIN", maxScope: ScopeType.GLOBAL },
  { permission: "referral.create", role: "ADMIN", maxScope: ScopeType.GLOBAL },

  // =========================================================================
  // SELLER rules — level-based scope progression
  // =========================================================================

  // --- Dashboard ---
  // All levels: own scope
  { permission: "dashboard.view", maxScope: ScopeType.OWN },
  { permission: "dashboard.viewOwnMetrics", maxScope: ScopeType.OWN },

  // Level 3+: team scope
  { permission: "dashboard.viewTeamMetrics", minLevel: 3, maxScope: ScopeType.TEAM },

  // Level 4-6: branch scope
  { permission: "dashboard.viewBranchMetrics", minLevel: 4, maxLevel: 6, maxScope: ScopeType.BRANCH },

  // Level 7: global scope
  { permission: "dashboard.viewGlobalMetrics", minLevel: 7, maxScope: ScopeType.GLOBAL },

  // --- Employee ---
  // Level 3+: team scope for read
  { permission: "employee.read", minLevel: 3, maxScope: ScopeType.TEAM },

  // Level 4-6: branch scope for read
  // ( covered by minLevel: 3 rule above, but we override with more specific rules below )

  // Level 3+: create employees in own team
  { permission: "employee.create", minLevel: 3, maxScope: ScopeType.TEAM },

  // Level 3: update employees in own team
  { permission: "employee.update", minLevel: 3, maxLevel: 3, maxScope: ScopeType.TEAM },

  // Level 4-6: update employees in branch
  { permission: "employee.update", minLevel: 4, maxLevel: 6, maxScope: ScopeType.BRANCH },

  // Level 7: update all employees
  { permission: "employee.update", minLevel: 7, maxScope: ScopeType.GLOBAL },

  // Level 3: deactivate in own team (pending confirmation)
  { permission: "employee.deactivate", minLevel: 3, maxLevel: 3, maxScope: ScopeType.TEAM },

  // Level 4-6: deactivate in branch
  { permission: "employee.deactivate", minLevel: 4, maxLevel: 6, maxScope: ScopeType.BRANCH },

  // Level 7: deactivate all
  { permission: "employee.deactivate", minLevel: 7, maxScope: ScopeType.GLOBAL },

  // Level 3: assign supervisor in own team
  { permission: "employee.assignSupervisor", minLevel: 3, maxScope: ScopeType.TEAM },

  // Level 7: assign supervisor globally
  { permission: "employee.assignSupervisor", minLevel: 7, maxScope: ScopeType.GLOBAL },

  // Level 7 only: assign level
  { permission: "employee.assignLevel", minLevel: 7, maxScope: ScopeType.GLOBAL },

  // Level 3: assign team in own team
  { permission: "employee.assignTeam", minLevel: 3, maxScope: ScopeType.TEAM },

  // --- Team ---
  // Level 3+: team scope
  { permission: "team.read", minLevel: 3, maxScope: ScopeType.TEAM },
  { permission: "team.viewMetrics", minLevel: 3, maxScope: ScopeType.TEAM },

  // Level 4-6: branch scope
  { permission: "team.read", minLevel: 4, maxLevel: 6, maxScope: ScopeType.BRANCH },
  { permission: "team.viewMetrics", minLevel: 4, maxLevel: 6, maxScope: ScopeType.BRANCH },

  // Level 7: global scope
  { permission: "team.read", minLevel: 7, maxScope: ScopeType.GLOBAL },
  { permission: "team.viewMetrics", minLevel: 7, maxScope: ScopeType.GLOBAL },

  // Level 7: create teams (design decision)
  { permission: "team.create", minLevel: 7, maxScope: ScopeType.GLOBAL },

  // Level 7: manage teams
  { permission: "team.update", minLevel: 7, maxScope: ScopeType.GLOBAL },
  { permission: "team.manageMembers", minLevel: 7, maxScope: ScopeType.GLOBAL },
  { permission: "team.viewSubteams", minLevel: 7, maxScope: ScopeType.GLOBAL },

  // --- Sale ---
  // All levels: own sales
  { permission: "sale.readOwn", maxScope: ScopeType.OWN },
  { permission: "sale.create", maxScope: ScopeType.OWN },

  // Level 3+: team sales
  { permission: "sale.readTeam", minLevel: 3, maxScope: ScopeType.TEAM },

  // Level 4-6: branch sales
  { permission: "sale.readBranch", minLevel: 4, maxScope: ScopeType.BRANCH },

  // Level 7: global sales
  { permission: "sale.readGlobal", minLevel: 7, maxScope: ScopeType.GLOBAL },

  // Level 3+: update own sales (scope: OWN)
  { permission: "sale.update", maxScope: ScopeType.OWN },

  // Level 3+: cancel own sales (scope: OWN)
  { permission: "sale.cancel", maxScope: ScopeType.OWN },

  // Level 3+: approve/reject sales (supervisory capability)
  { permission: "sale.approve", minLevel: 3, maxScope: ScopeType.TEAM },
  { permission: "sale.reject", minLevel: 3, maxScope: ScopeType.TEAM },

  // --- Client (Phase 10) ---
  // Level 3+: view own clients
  { permission: "client.view", minLevel: 3, maxScope: ScopeType.TEAM },

  // Level 3+: create clients
  { permission: "client.create", minLevel: 3, maxScope: ScopeType.TEAM },

  // Level 3+: update clients
  { permission: "client.update", minLevel: 3, maxScope: ScopeType.TEAM },

  // Level 3+: assign clients to team members
  { permission: "client.assign", minLevel: 3, maxScope: ScopeType.TEAM },

  // --- Visit (Phase 10) ---
  // All levels: view own visits
  { permission: "visit.view", maxScope: ScopeType.OWN },

  // Level 3+: view team visits
  { permission: "visit.view", minLevel: 3, maxScope: ScopeType.TEAM },

  // All levels: create visits
  { permission: "visit.create", maxScope: ScopeType.OWN },

  // All levels: update own visits
  { permission: "visit.update", maxScope: ScopeType.OWN },

  // --- Referral (Phase 10) ---
  // All levels: view referrals
  { permission: "referral.view", maxScope: ScopeType.OWN },

  // All levels: create referrals
  { permission: "referral.create", maxScope: ScopeType.OWN },

  // --- Catalog ---
  // All levels: read catalog (needed for product selection during sale creation)
  { permission: "catalog.read", maxScope: ScopeType.GLOBAL },

  // --- Analytics ---
  // All levels: own analytics
  { permission: "analytics.viewOwn", maxScope: ScopeType.OWN },

  // Level 3+: team analytics
  { permission: "analytics.viewTeam", minLevel: 3, maxScope: ScopeType.TEAM },

  // Level 4-6: branch analytics
  { permission: "analytics.viewBranch", minLevel: 4, maxScope: ScopeType.BRANCH },

  // Level 7: global analytics
  { permission: "analytics.viewGlobal", minLevel: 7, maxScope: ScopeType.GLOBAL },

  // Level 4+: compare periods
  { permission: "analytics.comparePeriods", minLevel: 4, maxScope: ScopeType.BRANCH },

  // Level 4+: compare employees
  { permission: "analytics.compareEmployees", minLevel: 4, maxScope: ScopeType.BRANCH },

  // Level 3+: view ranking
  { permission: "analytics.viewRanking", minLevel: 3, maxScope: ScopeType.TEAM },

  // --- Report ---
  // Level 4+: generate reports
  { permission: "report.generate", minLevel: 4, maxScope: ScopeType.BRANCH },

  // Level 5+: export reports
  { permission: "report.export", minLevel: 5, maxScope: ScopeType.BRANCH },

  // --- Goal ---
  // Level 3+: own goals
  { permission: "goal.readOwn", minLevel: 3, maxScope: ScopeType.OWN },

  // Level 3+: team goals
  { permission: "goal.readTeam", minLevel: 3, maxScope: ScopeType.TEAM },

  // Level 4-6: branch goals
  { permission: "goal.readBranch", minLevel: 4, maxScope: ScopeType.BRANCH },

  // Level 7: create/manage goals
  { permission: "goal.create", minLevel: 7, maxScope: ScopeType.GLOBAL },
  { permission: "goal.update", minLevel: 7, maxScope: ScopeType.GLOBAL },
  { permission: "goal.delete", minLevel: 7, maxScope: ScopeType.GLOBAL },

  // --- Hierarchy ---
  // All levels: own position
  { permission: "hierarchy.readOwn", maxScope: ScopeType.OWN },

  // Level 3+: team structure
  { permission: "hierarchy.readTeam", minLevel: 3, maxScope: ScopeType.TEAM },

  // Level 4-6: branch structure
  { permission: "hierarchy.readBranch", minLevel: 4, maxScope: ScopeType.BRANCH },

  // Level 7: global structure
  { permission: "hierarchy.readGlobal", minLevel: 7, maxScope: ScopeType.GLOBAL },

  // Level 7: update hierarchy
  { permission: "hierarchy.update", minLevel: 7, maxScope: ScopeType.GLOBAL },

  // All levels: read levels
  { permission: "level.read", maxScope: ScopeType.OWN },

  // Level 7: update levels
  { permission: "level.update", minLevel: 7, maxScope: ScopeType.GLOBAL },

  // --- Commission ---
  // All levels: own commission
  { permission: "commission.readOwn", maxScope: ScopeType.OWN },

  // Level 3+: team commission
  { permission: "commission.readTeam", minLevel: 3, maxScope: ScopeType.TEAM },

  // Level 4-6: branch commission
  { permission: "commission.readBranch", minLevel: 4, maxScope: ScopeType.BRANCH },

  // Level 7: global commission
  { permission: "commission.readGlobal", minLevel: 7, maxScope: ScopeType.GLOBAL },

  // Level 3+: view commission rules
  { permission: "commission.viewRules", minLevel: 3, maxScope: ScopeType.OWN },

  // Level 7: manage commission rules
  { permission: "commission.manageRules", minLevel: 7, maxScope: ScopeType.GLOBAL },

  // Level 7: recalculate commissions
  { permission: "commission.recalculate", minLevel: 7, maxScope: ScopeType.GLOBAL },

  // Level 5+: export commissions
  { permission: "commission.export", minLevel: 5, maxScope: ScopeType.BRANCH },

  // --- Training ---
  // All levels: read and download training
  { permission: "training.read", maxScope: ScopeType.GLOBAL },
  { permission: "training.download", maxScope: ScopeType.GLOBAL },

  // Training management: ADMIN only (already covered above)

  // --- Audit ---
  // Audit: ADMIN only (already covered above)
] as const;

/**
 * Role-based Permission Evaluator.
 *
 * Evaluates permissions by matching the user's role and level against
 * the permission rules table. The first matching rule determines the
 * maximum scope allowed.
 *
 * Reference: permissions-matrix.md §5
 */
export class RoleBasedPermissionEvaluator implements PermissionEvaluator {
  evaluate(
    context: AuthorizationContext,
    permission: Permission,
  ): PermissionEvaluationResult {
    // Find the first matching rule for this permission
    for (const rule of PERMISSION_RULES) {
      if (rule.permission !== permission) continue;

      // Check role constraint
      if (rule.role !== undefined && rule.role !== context.role) {
        continue;
      }

      // Check level constraints (only for SELLER role)
      if (context.role === "SELLER" && context.levelId !== null) {
        if (rule.minLevel !== undefined && context.levelId < rule.minLevel) {
          continue;
        }
        if (rule.maxLevel !== undefined && context.levelId > rule.maxLevel) {
          continue;
        }
      }

      // If role is SELLER but level is null (shouldn't happen), skip
      if (context.role === "SELLER" && context.levelId === null) {
        continue;
      }

      // Rule matches
      return {
        granted: true,
        maxScope: rule.maxScope,
      };
    }

    // No matching rule found — permission denied
    return {
      granted: false,
    };
  }
}
