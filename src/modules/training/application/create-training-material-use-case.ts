/**
 * Create training material use case.
 *
 * Requires training.create permission (ADMIN only).
 */

import type { AuthorizationService, AuthorizationContext } from "@/modules/authorization/domain";
import type { TrainingMaterialRepository, TrainingMaterial, ContentType } from "../domain";
import { AuthorizationError } from "@/shared/errors";

export interface CreateTrainingMaterialInput {
  readonly authContext: AuthorizationContext;
  readonly moduleId: string;
  readonly name: string;
  readonly description?: string;
  readonly type: ContentType;
  readonly url?: string;
  readonly levelId?: number;
}

export class CreateTrainingMaterialUseCase {
  constructor(
    private readonly authorizationService: AuthorizationService,
    private readonly materialRepo: TrainingMaterialRepository,
  ) {}

  async execute(input: CreateTrainingMaterialInput): Promise<TrainingMaterial> {
    const decision = await this.authorizationService.authorize(
      input.authContext,
      { permission: "training.create" },
    );

    if (!decision.allowed) {
      throw new AuthorizationError(decision.reason ?? "Not authorized to create training materials.");
    }

    return this.materialRepo.create({
      moduleId: input.moduleId,
      name: input.name,
      description: input.description,
      type: input.type,
      url: input.url,
      levelId: input.levelId,
    });
  }
}
