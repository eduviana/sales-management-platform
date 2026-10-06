/**
 * View models for the progression screen.
 *
 * These types cross the Server → Client Component boundary of the progression
 * page. They are shared by the server page (which builds them) and the client
 * component (which renders them) so the contract stays in a single place.
 *
 * The definitions live in `domain/read-models.ts` because the progression use
 * cases produce them; this file only adapts the names used by the presentation
 * layer. Dates are serialized to ISO strings when the server hands them to the
 * client component.
 *
 * Reference: requirements.md §3.13
 */

import type {
  ProgressionActivityEntry,
  TeamCommissionEntry,
  TeamHistoryRow,
  TeamHistoryStatus,
  TeamMemberOverview,
  TeamSaleRow,
  TeamSaleStatus,
  TeamTargetOverview,
  TeamVisitRow,
  TeamVisitStatus,
} from "../domain/read-models";

export type ProgressionEntry = Omit<ProgressionActivityEntry, "date"> & {
  date: string;
};

export type TeamMember = Omit<TeamMemberOverview, "joinedAt"> & {
  joinedAt: string;
};

export type TeamTarget = TeamTargetOverview;

export type CommissionEntry = Omit<TeamCommissionEntry, "date"> & {
  date: string;
};

export type TeamVisit = Omit<TeamVisitRow, "date"> & { date: string };

export type TeamSale = Omit<TeamSaleRow, "date"> & { date: string };

export type TeamHistoryEntry = Omit<TeamHistoryRow, "date"> & { date: string };

export type {
  TeamHistoryStatus,
  TeamSaleStatus,
  TeamVisitStatus,
};