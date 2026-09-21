/**
 * Shared mock for AuditPort used across all tests.
 */

import { vi } from "vitest";
import type { AuditPort } from "@/shared/ports/audit-port";

export function createMockAuditPort(): AuditPort {
  return {
    log: vi.fn().mockResolvedValue(undefined),
  };
}
