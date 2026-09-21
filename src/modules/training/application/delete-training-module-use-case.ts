/**
 * Delete training module use case.
 *
 * Requires training.delete permission (ADMIN only).
 */

import type { AuthorizationService, AuthorizationContext } from "@/modules/authorization/domain";
import type { TrainingModuleRepository } from "../domain";
import { AuthorizationError, NotFoundError } from "@/shared/errors";

export interface DeleteTrainingModuleInput {
  readonly authContext: AuthorizationContext;
  readonly moduleId: string;
}

export class DeleteTrainingModuleUseCase {
  constructor(
    private readonly authorizationService: AuthorizationService,
    private readonly moduleRepo: TrainingModuleRepository,
  ) {}

  async execute(input: DeleteTrainingModuleInput): Promise<void> {
    const decision = await this.authorizationService.authorize(
      input.authContext,
      { permission: "training.delete" },
    );

    if (!decision.allowed) {
      throw new AuthorizationError(decision.reason ?? "Not authorized to delete training modules.");
    }

    const existing = await this.moduleRepo.findById(input.moduleId);
    if (!existing) {
      throw new NotFoundError("Training module not found.");
    }

    await this.moduleRepo.delete(input.moduleId);
  }
}
