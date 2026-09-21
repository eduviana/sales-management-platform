import type { CommissionEntry as PrismaCommissionEntry, PrismaClient } from "@prisma/client";
import type {
  CommissionEntryData,
  CommissionEntryRepository,
  CreateCommissionEntryInput,
} from "@/modules/commissions/domain";

function mapEntry(entry: PrismaCommissionEntry): CommissionEntryData {
  return {
    id: entry.id,
    saleId: entry.saleId,
    employeeId: entry.employeeId,
    ruleId: entry.ruleId,
    parentId: entry.parentId,
    type: entry.type,
    percentage: Number(entry.percentage),
    baseAmount: Number(entry.baseAmount),
    amount: Number(entry.amount),
    saleDate: entry.saleDate,
    calculatedAt: entry.calculatedAt,
    createdAt: entry.createdAt,
  };
}

export class PrismaCommissionEntryRepository implements CommissionEntryRepository {
  constructor(private readonly prisma: PrismaClient) {}

  async findEarnedBySaleId(saleId: string): Promise<CommissionEntryData | null> {
    const entry = await this.prisma.commissionEntry.findFirst({
      where: { saleId, type: "EARNED" },
    });
    return entry ? mapEntry(entry) : null;
  }

  async findReversalByParentId(parentId: string): Promise<CommissionEntryData | null> {
    const entry = await this.prisma.commissionEntry.findFirst({
      where: { parentId, type: "REVERSAL" },
    });
    return entry ? mapEntry(entry) : null;
  }

  async create(input: CreateCommissionEntryInput): Promise<CommissionEntryData> {
    const entry = await this.prisma.commissionEntry.create({
      data: {
        saleId: input.saleId,
        employeeId: input.employeeId,
        ruleId: input.ruleId,
        parentId: input.parentId ?? null,
        type: input.type,
        percentage: input.percentage,
        baseAmount: input.baseAmount,
        amount: input.amount,
        saleDate: input.saleDate,
      },
    });
    return mapEntry(entry);
  }

  async findBySaleId(saleId: string): Promise<CommissionEntryData[]> {
    const entries = await this.prisma.commissionEntry.findMany({
      where: { saleId },
      orderBy: { createdAt: "asc" },
    });
    return entries.map(mapEntry);
  }
}
