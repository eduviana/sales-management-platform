/**
 * Level value object and constants.
 *
 * Represents the seven commercial levels of the organization.
 * Levels are positions within the commercial hierarchy, not technical roles.
 *
 * Reference: organizational-model.md §2.3, business-rules.md REG-005
 */

/** Minimum valid level number. */
export const LEVEL_MIN = 1;

/** Maximum valid level number. */
export const LEVEL_MAX = 7;

/**
 * Commercial level names (observed during initial discovery).
 * These are informational only; the system identifies levels by numeric ID.
 */
export const LEVEL_NAMES: Record<number, string> = {
  1: "Vendedor",
  2: "Vendedor Junior",
  3: "Distribuidor",
  4: "Blue",
  5: "Royal",
  6: "Premier",
  7: "Max",
};

/**
 * Validate whether a number is a valid commercial level.
 */
export function isValidLevel(level: number): boolean {
  return Number.isInteger(level) && level >= LEVEL_MIN && level <= LEVEL_MAX;
}

/**
 * Get the display name for a level.
 * Returns the code if the level is not in the known map.
 */
export function getLevelName(level: number): string {
  return LEVEL_NAMES[level] ?? `Nivel ${level}`;
}

/**
 * Validate a promotion: target level must be exactly one above current level.
 * Valid promotions: N1→N2, N2→N3, N3→N4, N4→N5, N5→N6, N6→N7
 */
export function isValidPromotion(
  fromLevel: number,
  toLevel: number,
): boolean {
  return (
    isValidLevel(fromLevel) &&
    isValidLevel(toLevel) &&
    toLevel === fromLevel + 1
  );
}

/**
 * Validate a demotion: target level must be below current level.
 * Any explicit demotion is allowed as long as the target level is valid.
 */
export function isValidDemotion(
  fromLevel: number,
  toLevel: number,
): boolean {
  return (
    isValidLevel(fromLevel) &&
    isValidLevel(toLevel) &&
    toLevel < fromLevel
  );
}

/**
 * Validate a level change: must be either a valid promotion, valid demotion,
 * or the same level (no change).
 */
export function isValidLevelChange(
  fromLevel: number,
  toLevel: number,
): boolean {
  return (
    fromLevel === toLevel ||
    isValidPromotion(fromLevel, toLevel) ||
    isValidDemotion(fromLevel, toLevel)
  );
}
