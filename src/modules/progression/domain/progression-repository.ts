/**
 * Progression repository port (contract).
 *
 * Defines persistence operations for employee progression data.
 *
 * Reference: data-architecture.md
 */

import type { ProgressEntry } from "./index";

export interface ProgressionRepository {
  /** Get all progress entries for an employee, ordered by date. */
  getEntriesByEmployee(employeeId: string): Promise<ProgressEntry[]>;

  /** Get progress entries for a specific period. */
  getEntriesByPeriod(employeeId: string, period: string): Promise<ProgressEntry[]>;

  /** Record a new progress entry. */
  recordEntry(entry: Omit<ProgressEntry, "id" | "createdAt">): Promise<ProgressEntry>;

  /** Bulk record multiple entries. */
  recordEntries(entries: Array<Omit<ProgressEntry, "id" | "createdAt">>): Promise<void>;

  /** Check if a target bonus was already recorded for the period. */
  hasTargetBonus(employeeId: string, period: string): Promise<boolean>;

  /** Get sum of points by type for multiple employees (batch). */
  getPointsSummaryByEmployees(employeeIds: string[]): Promise<Map<string, { total: number; seniority: number; visits: number; sales: number; targets: number }>>;
}
