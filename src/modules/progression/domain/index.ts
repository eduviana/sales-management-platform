/**
 * Progression domain types.
 *
 * Defines the points system for employee level progression.
 * Points are accumulated from seniority, visits, sales, and monthly targets.
 *
 * Reference: business-rules.md (progression rules)
 */

// =============================================================================
// Point Types
// =============================================================================

/** Types of points that can be earned. */
export type ProgressType = "SENIORITY" | "VISIT" | "SALE" | "TARGET_ACHIEVED";

/** Points earned from a specific activity. */
export interface ProgressEntry {
  readonly id: string;
  readonly employeeId: string;
  readonly type: ProgressType;
  readonly points: number;
  readonly description: string | null;
  readonly period: string | null;
  readonly createdAt: Date;
}

// =============================================================================
// Progression Summary
// =============================================================================

/** Summary of an employee's progression toward the next level. */
export interface EmployeeProgression {
  readonly employeeId: string;
  readonly currentLevelId: number | null;
  readonly currentPoints: number;
  readonly pointsToNextLevel: number;
  readonly percentage: number;
  readonly breakdown: ProgressionBreakdown;
}

/** Detailed breakdown of points by source. */
export interface ProgressionBreakdown {
  readonly seniorityPoints: number;
  readonly visitPoints: number;
  readonly salePoints: number;
  readonly targetPoints: number;
}

// =============================================================================
// Level Thresholds
// =============================================================================

/** Points required to advance from one level to the next. */
export const LEVEL_THRESHOLDS: Record<number, number> = {
  1: 100,  // N1 → N2
  2: 200,  // N2 → N3
  3: 350,  // N3 → N4
  4: 500,  // N4 → N5
  5: 700,  // N5 → N6
  6: 1000, // N6 → N7
  7: 0,    // N7: maximum level, no progression
};

/** Points per unit for each activity type. */
export const POINT_VALUES: Record<ProgressType, number> = {
  SENIORITY: 1,        // 1 point per month in current level
  VISIT: 2,            // 2 points per completed visit
  SALE: 5,             // 5 points per approved sale
  TARGET_ACHIEVED: 10, // 10 points bonus per monthly target achieved
};

/**
 * Returns the threshold for advancing from the given level.
 * Returns 0 if the employee is already at the maximum level.
 */
export function getThresholdForLevel(levelId: number | null): number {
  if (levelId === null || levelId >= 7) return 0;
  return LEVEL_THRESHOLDS[levelId] ?? 0;
}

/**
 * Returns the maximum level an employee can reach.
 */
export function getMaxLevel(): number {
  return 7;
}

// =============================================================================
// Read models
// =============================================================================

export * from "./read-models";
