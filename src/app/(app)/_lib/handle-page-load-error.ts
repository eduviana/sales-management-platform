/**
 * Error handling for page-level data loading.
 *
 * Pages must not turn unexpected failures into a 404. Only missing or
 * forbidden resources are rendered as "not found" (anti-enumeration);
 * any other error is re-thrown so the nearest `error.tsx` boundary handles it.
 *
 * Reference: system-architecture.md §7, ADR-020
 */

import { notFound } from "next/navigation";
import {
  AuthenticationError,
  AuthorizationError,
  NotFoundError,
} from "@/shared/errors";

export function handlePageLoadError(error: unknown): never {
  if (
    error instanceof NotFoundError ||
    error instanceof AuthorizationError ||
    error instanceof AuthenticationError
  ) {
    notFound();
  }

  throw error;
}
