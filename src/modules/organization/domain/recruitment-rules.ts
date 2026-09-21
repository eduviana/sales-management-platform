/**
 * Recruitment rules.
 *
 * Defines which commercial levels can recruit new employees and at what level
 * the new employee is placed. The recruitment ladder is strict:
 *
 *   N7 → N6
 *   N6 → N5
 *   N5 → N4
 *   N4 → N3
 *   N3 → N1
 *   N2 → (cannot recruit)
 *   N1 → (cannot recruit)
 *
 * Reference: organizational-model.md §12.8, business-rules.md §16.1
 */

import { isValidLevel } from "./level";

/**
 * Recruitment ladder: recruiter level → recruited employee level.
 * Levels not in this map cannot recruit.
 */
export const RECRUITMENT_LADDER: Record<number, number> = {
  7: 6,
  6: 5,
  5: 4,
  4: 3,
  3: 1,
};

/**
 * Check whether a given level has recruitment capability.
 */
export function canRecruit(level: number): boolean {
  return level in RECRUITMENT_LADDER;
}

/**
 * Get the level assigned to a newly recruited employee.
 * Returns null if the recruiter level has no recruitment capability.
 */
export function getRecruitedLevel(recruiterLevel: number): number | null {
  return RECRUITMENT_LADDER[recruiterLevel] ?? null;
}

/**
 * Validate whether a recruitment is allowed.
 * The recruiter must be at a level that can recruit, and the recruited level
 * must match the recruitment ladder.
 */
export function isValidRecruitment(
  recruiterLevel: number,
  recruitedLevel: number,
): boolean {
  if (!isValidLevel(recruiterLevel) || !isValidLevel(recruitedLevel)) {
    return false;
  }

  const expectedLevel = getRecruitedLevel(recruiterLevel);
  return expectedLevel === recruitedLevel;
}
