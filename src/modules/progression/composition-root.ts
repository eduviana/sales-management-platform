/**
 * Progression module composition root.
 *
 * Wires up all progression components.
 *
 * Reference: system-architecture.md §6.4
 */

import type { PrismaClient } from "@prisma/client";
import { PrismaProgressionRepository } from "./infrastructure/prisma-progression-repository";
import { GetEmployeeProgressionUseCase } from "./application/get-employee-progression-use-case";
import { CalculateProgressionUseCase } from "./application/calculate-progression-use-case";

export function createProgressionModule(prisma: PrismaClient) {
  const progressionRepository = new PrismaProgressionRepository(prisma);

  return {
    getEmployeeProgression: new GetEmployeeProgressionUseCase(
      prisma,
      progressionRepository,
    ),
    calculateProgression: new CalculateProgressionUseCase(
      prisma,
      progressionRepository,
    ),
  };
}
