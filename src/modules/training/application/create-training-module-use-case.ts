/**
 * Create training module use case.
 *
 * Requires training.create permission (ADMIN only).
 */

import type { AuthorizationService, AuthorizationContext } from "@/modules/authorization/domain";
import type { TrainingModuleRepository, TrainingModule } from "../domain";
import { AuthorizationError } from "@/shared/errors";

export interface CreateTrainingModuleInput {
  readonly authContext: AuthorizationContext;
  readonly courseId: string;
  readonly name: string;
  readonly description?: string;
  readonly sortOrder?: number;
}

export class CreateTrainingModuleUseCase {
  constructor(
    private readonly authorizationService: AuthorizationService,
    private readonly moduleRepo: TrainingModuleRepository,
  ) {}

  async execute(input: CreateTrainingModuleInput): Promise<TrainingModule> {
    const decision = await this.authorizationService.authorize(
      input.authContext,
      { permission: "training.create" },
    );

    if (!decision.allowed) {
      throw new AuthorizationError(decision.reason ?? "Not authorized to create training modules.");
    }

    return this.moduleRepo.create({
      courseId: input.courseId,
      name: input.name,
      description: input.description,
      sortOrder: input.sortOrder,
    });
  }
}
