import { describe, expect, it, vi } from "vitest";
import {
  GenerateCommissionForApprovedSaleUseCase,
} from "../generate-commission-use-case";
import { ReverseCommissionForCancelledSaleUseCase } from "../reverse-commission-use-case";
import type {
  CommissionEntryData,
  CommissionEntryRepository,
  CommissionRuleData,
  CommissionRuleRepository,
} from "@/modules/commissions/domain";
import type { EmployeeCommissionContextPort } from "@/modules/organization/domain";

const now = new Date("2026-09-07T12:00:00.000Z");

function makeRule(overrides?: Partial<CommissionRuleData>): CommissionRuleData {
  return {
    id: "rule-1",
    levelId: 3,
    percentage: 30,
    effectiveFrom: new Date("2026-01-01T00:00:00.000Z"),
    effectiveTo: null,
    createdAt: now,
    updatedAt: now,
    ...overrides,
  };
}

function makeEntry(overrides?: Partial<CommissionEntryData>): CommissionEntryData {
  return {
    id: "entry-1",
    saleId: "sale-1",
    employeeId: "employee-1",
    ruleId: "rule-1",
    parentId: null,
    type: "EARNED",
    percentage: 30,
    baseAmount: 100_000,
    amount: 30_000,
    saleDate: new Date("2026-09-01"),
    calculatedAt: now,
    createdAt: now,
    ...overrides,
  };
}

function makeOrganization(levelId = 3): EmployeeCommissionContextPort {
  return {
    getEmployeeCommissionContext: vi.fn().mockResolvedValue({
      employeeId: "employee-1",
      levelId,
      joinedAt: new Date("2024-01-01"),
    }),
  };
}

function makeRuleRepository(rule = makeRule()): CommissionRuleRepository {
  return {
    findApplicable: vi.fn().mockResolvedValue(rule),
    findOverlapping: vi.fn().mockResolvedValue([]),
    create: vi.fn(),
    closeAt: vi.fn(),
  };
}

function makeEntryRepository(overrides?: Partial<CommissionEntryRepository>): CommissionEntryRepository {
  return {
    findEarnedBySaleId: vi.fn().mockResolvedValue(null),
    findReversalByParentId: vi.fn().mockResolvedValue(null),
    create: vi.fn().mockImplementation(async (input) => ({
      ...makeEntry(),
      ...input,
      id: "created-entry",
      parentId: input.parentId ?? null,
      calculatedAt: now,
      createdAt: now,
    })),
    findBySaleId: vi.fn().mockResolvedValue([]),
    ...overrides,
  };
}

describe("commission application use cases", () => {
  it("generates an earned entry with the rule and percentage snapshot", async () => {
    const entries = makeEntryRepository();
    const result = await new GenerateCommissionForApprovedSaleUseCase(
      makeOrganization(3),
      makeRuleRepository(makeRule({ percentage: 30 })),
      entries,
    ).execute({
      saleId: "sale-1",
      employeeId: "employee-1",
      saleDate: new Date("2026-09-01"),
      approvedAt: now,
      baseAmount: 100_000,
    });

    expect(result.type).toBe("EARNED");
    expect(result.percentage).toBe(30);
    expect(result.baseAmount).toBe(100_000);
    expect(result.amount).toBe(30_000);
    expect(entries.create).toHaveBeenCalledOnce();
  });

  it("does not fallback to another percentage when no rule exists", async () => {
    const rules = makeRuleRepository();
    rules.findApplicable = vi.fn().mockResolvedValue(null);

    await expect(
      new GenerateCommissionForApprovedSaleUseCase(
        makeOrganization(6),
        rules,
        makeEntryRepository(),
      ).execute({
        saleId: "sale-1",
        employeeId: "employee-1",
        saleDate: new Date("2026-09-01"),
        approvedAt: now,
        baseAmount: 100,
      }),
    ).rejects.toThrow("ApplicableCommissionRule");
  });

  it("rejects duplicate earned generation", async () => {
    const entries = makeEntryRepository({
      findEarnedBySaleId: vi.fn().mockResolvedValue(makeEntry()),
    });

    await expect(
      new GenerateCommissionForApprovedSaleUseCase(
        makeOrganization(),
        makeRuleRepository(),
        entries,
      ).execute({
        saleId: "sale-1",
        employeeId: "employee-1",
        saleDate: new Date("2026-09-01"),
        approvedAt: now,
        baseAmount: 100,
      }),
    ).rejects.toThrow("already exists");
  });

  it("creates a negative reversal without changing the original entry", async () => {
    const original = makeEntry();
    const entries = makeEntryRepository({
      findEarnedBySaleId: vi.fn().mockResolvedValue(original),
    });

    const result = await new ReverseCommissionForCancelledSaleUseCase(entries).execute({
      saleId: "sale-1",
      employeeId: "employee-1",
      saleDate: new Date("2026-09-01"),
    });

    expect(result.type).toBe("REVERSAL");
    expect(result.parentId).toBe(original.id);
    expect(result.amount).toBe(-original.amount);
    expect(result.percentage).toBe(original.percentage);
  });

  it("rejects a second reversal", async () => {
    const entries = makeEntryRepository({
      findEarnedBySaleId: vi.fn().mockResolvedValue(makeEntry()),
      findReversalByParentId: vi.fn().mockResolvedValue(makeEntry({
        id: "reversal-1",
        type: "REVERSAL",
        parentId: "entry-1",
        amount: -30_000,
      })),
    });

    await expect(
      new ReverseCommissionForCancelledSaleUseCase(entries).execute({
        saleId: "sale-1",
        employeeId: "employee-1",
        saleDate: new Date("2026-09-01"),
      }),
    ).rejects.toThrow("already exists");
  });
});
