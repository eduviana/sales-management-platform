/**
 * Get user account labels use case.
 *
 * Resolves the readable reference (account email) of several user accounts.
 * Used by the audit trail, which persists `resourceType` + `resourceId` and
 * only derives the label at read time (requirements.md §3.12.1.1).
 *
 * The Identity module owns `userAccount.email`, so the lookup lives here
 * instead of in the audit module.
 *
 * This is a labeling query: it declares no permission of its own. The caller
 * runs the `audit.read` check before resolving labels.
 *
 * Reference: data-architecture.md §7, system-architecture.md §6.4
 */

import type { IdentityRepository } from "../domain/identity-repository";

export interface GetAccountLabelsInput {
  readonly userIds: readonly string[];
}

export class GetAccountLabelsUseCase {
  constructor(private readonly identityRepository: IdentityRepository) {}

  /** Label per user account id. Unknown ids are absent from the map. */
  async execute(
    input: GetAccountLabelsInput,
  ): Promise<ReadonlyMap<string, string>> {
    if (input.userIds.length === 0) return new Map();

    const rows = await this.identityRepository.findAccountEmailsByIds(
      input.userIds,
    );

    return new Map(rows.map((row) => [row.id, row.email ?? "Cuenta"]));
  }
}
