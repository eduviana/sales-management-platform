/**
 * Update training module use case.
 *
 * Requires training.update permission (ADMIN only).
 */

import type { AuthorizationService, AuthorizationContext } from "@/modules/authorization/domain";
import type { TrainingModuleRepository, TrainingModule } from "../domain";
import { AuthorizationError, NotFoundError } from "@/shared/errors";

export interface UpdateTrainingModuleInput {
  readonly authContext: AuthorizationContext;
  readonly moduleId: string;
  readonly name?: string;
  readonly description?: string;
  readonly sortOrder?: number;
}

export class UpdateTrainingModuleUseCase {
  constructor(
    private readonly authorizationService: AuthorizationService,
    private readonly moduleRepo: TrainingModuleRepository,
  ) {}

  async execute(input: UpdateTrainingModuleInput): Promise<TrainingModule> {
    const decision = await this.authorizationService.authorize(
      input.authContext,
      { permission: "training.update" },
    );

    if (!decision.allowed) {
      throw new AuthorizationError(decision.reason ?? "Not authorized to update training modules.");
    }

    const existing = await this.moduleRepo.findById(input.moduleId);
    if (!existing) {
      throw new NotFoundError("Training module not found.");
    }

    return this.moduleRepo.update(input.moduleId, {
      name: input.name,
      description: input.description,
      sortOrder: input.sortOrder,
    });
  }
}
