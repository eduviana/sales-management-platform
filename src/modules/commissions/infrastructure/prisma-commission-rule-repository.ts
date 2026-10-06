import type { CommissionRule as PrismaCommissionRule, PrismaClient } from "@prisma/client";
import {
  CommissionRuleConflictError,
  type CommissionRuleData,
  type CommissionRuleRepository,
  type CreateCommissionRuleInput,
} from "@/modules/commissions/domain";

function mapRule(rule: PrismaCommissionRule): CommissionRuleData {
  return {
    id: rule.id,
    levelId: rule.levelId,
    percentage: Number(rule.percentage),
    effectiveFrom: rule.effectiveFrom,
    effectiveTo: rule.effectiveTo,
    createdAt: rule.createdAt,
    updatedAt: rule.updatedAt,
  };
}

export class PrismaCommissionRuleRepository implements CommissionRuleRepository {
  constructor(private readonly prisma: PrismaClient) {}

  async findApplicable(levelId: number, at: Date): Promise<CommissionRuleData | null> {
    const rules = await this.prisma.commissionRule.findMany({
      where: {
        levelId,
        effectiveFrom: { lte: at },
        OR: [{ effectiveTo: null }, { effectiveTo: { gt: at } }],
      },
      orderBy: { effectiveFrom: "desc" },
    });

    if (rules.length > 1) {
      throw new CommissionRuleConflictError(
        `Multiple commission rules apply to level ${levelId} at ${at.toISOString()}.`,
      );
    }

    return rules[0] ? mapRule(rules[0]) : null;
  }

  async findOverlapping(input: CreateCommissionRuleInput): Promise<CommissionRuleData[]> {
    const rules = await this.prisma.commissionRule.findMany({
      where: {
        levelId: input.levelId,
        effectiveFrom: {
          lt: input.effectiveTo ?? new Date("9999-12-31T23:59:59.999Z"),
        },
        OR: [
          { effectiveTo: null },
          { effectiveTo: { gt: input.effectiveFrom } },
        ],
      },
      orderBy: { effectiveFrom: "asc" },
    });
    return rules.map(mapRule);
  }

  async findLevelIdsByIds(
    ruleIds: readonly string[],
  ): Promise<Array<{ readonly id: string; readonly levelId: number }>> {
    if (ruleIds.length === 0) return [];
    const rows = await this.prisma.commissionRule.findMany({
      where: { id: { in: [...ruleIds] } },
      select: { id: true, levelId: true },
    });
    return rows.map((row) => ({ id: row.id, levelId: row.levelId }));
  }

  async create(input: CreateCommissionRuleInput): Promise<CommissionRuleData> {
    const rule = await this.prisma.commissionRule.create({
      data: {
        levelId: input.levelId,
        percentage: input.percentage,
        effectiveFrom: input.effectiveFrom,
        effectiveTo: input.effectiveTo ?? null,
      },
    });
    return mapRule(rule);
  }

  async closeAt(levelId: number, effectiveTo: Date): Promise<void> {
    await this.prisma.commissionRule.updateMany({
      where: {
        levelId,
        effectiveFrom: { lt: effectiveTo },
        OR: [{ effectiveTo: null }, { effectiveTo: { gt: effectiveTo } }],
      },
      data: { effectiveTo },
    });
  }
}
