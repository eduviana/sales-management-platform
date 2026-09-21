import type { AuthorizationContext, AuthorizationService } from "@/modules/authorization/domain";
import type { CommissionEntryData, CommissionEntryRepository } from "@/modules/commissions/domain";
import { AuthorizationError } from "@/shared/errors";

export class GetCommissionEntriesForSaleUseCase {
  constructor(
    private readonly authorizationService: AuthorizationService,
    private readonly entryRepository: CommissionEntryRepository,
  ) {}

  async execute(input: {
    authContext: AuthorizationContext;
    saleId: string;
    ownerId: string;
  }): Promise<CommissionEntryData[]> {
    const resource = { type: "commission" as const, id: input.saleId, ownerId: input.ownerId };
    const permissions = [
      "commission.readGlobal",
      "commission.readBranch",
      "commission.readTeam",
      "commission.readOwn",
    ] as const;

    let lastReason = "Not authorized to view commissions.";
    for (const permission of permissions) {
      const decision = await this.authorizationService.authorize(input.authContext, {
        permission,
        resource,
      });
      if (decision.allowed) {
        return this.entryRepository.findBySaleId(input.saleId);
      }
      if (decision.reason) lastReason = decision.reason;
    }

    throw new AuthorizationError(lastReason);
  }
}
