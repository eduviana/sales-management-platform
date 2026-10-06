"use server";

import { createCommissionUseCases } from "@/modules/commissions/composition-root";
import { resolveAuthContext } from "@/modules/identity/resolve-auth-context";

export async function createCommissionRuleVersion(input: {
  levelId: number;
  percentage: number;
  effectiveFrom: Date;
  effectiveTo?: Date | null;
}) {
  const authContext = await resolveAuthContext();
  const useCases = createCommissionUseCases();

  return useCases.createRuleVersion.execute({
    ...input,
    authContext,
  });
}
