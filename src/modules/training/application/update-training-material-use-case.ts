/**
 * Update training material use case.
 *
 * Requires training.update permission (ADMIN only).
 */

import type { AuthorizationService, AuthorizationContext } from "@/modules/authorization/domain";
import type { TrainingMaterialRepository, TrainingMaterial, ContentType, ContentStatus } from "../domain";
import { AuthorizationError, NotFoundError } from "@/shared/errors";

export interface UpdateTrainingMaterialInput {
  readonly authContext: AuthorizationContext;
  readonly materialId: string;
  readonly name?: string;
  readonly description?: string;
  readonly type?: ContentType;
  readonly url?: string;
  readonly levelId?: number | null;
  readonly status?: ContentStatus;
}

export class UpdateTrainingMaterialUseCase {
  constructor(
    private readonly authorizationService: AuthorizationService,
    private readonly materialRepo: TrainingMaterialRepository,
  ) {}

  async execute(input: UpdateTrainingMaterialInput): Promise<TrainingMaterial> {
    const decision = await this.authorizationService.authorize(
      input.authContext,
      { permission: "training.update" },
    );

    if (!decision.allowed) {
      throw new AuthorizationError(decision.reason ?? "Not authorized to update training materials.");
    }

    const existing = await this.materialRepo.findById(input.materialId);
    if (!existing) {
      throw new NotFoundError("Training material not found.");
    }

    return this.materialRepo.update(input.materialId, {
      name: input.name,
      description: input.description,
      type: input.type,
      url: input.url,
      levelId: input.levelId,
      status: input.status,
    });
  }
}
