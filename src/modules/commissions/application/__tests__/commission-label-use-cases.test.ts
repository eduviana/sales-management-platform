import { describe, it, expect, vi } from "vitest";
import { GetCommissionEntryLabelsUseCase } from "../get-commission-entry-labels-use-case";
import { GetCommissionRuleLabelsUseCase } from "../get-commission-rule-labels-use-case";
import type { CommissionEntryRepository } from "../../domain/commission-entry-repository";
import type { CommissionRuleRepository } from "../../domain/commission-rule-repository";
import type { SaleRepository } from "@/modules/sales/domain/sale-repository";

describe("GetCommissionEntryLabelsUseCase", () => {
  it("builds the label from the sale of each entry", async () => {
    const findSaleIdsByIds = vi.fn().mockResolvedValue([
      { id: "entry-1", saleId: "sale-1" },
      { id: "entry-2", saleId: "sale-2" },
    ]);
    const findSummariesByIds = vi.fn().mockResolvedValue([
      { id: "sale-1", saleNumber: 42, totalAmount: 100 },
      { id: "sale-2", saleNumber: 7, totalAmount: 200 },
    ]);
    const useCase = new GetCommissionEntryLabelsUseCase(
      { findSaleIdsByIds } as unknown as CommissionEntryRepository,
      { findSummariesByIds } as unknown as SaleRepository,
    );

    const labels = await useCase.execute({
      entryIds: ["entry-1", "entry-2"],
    });

    expect(findSaleIdsByIds).toHaveBeenCalledWith(["entry-1", "entry-2"]);
    expect(findSummariesByIds).toHaveBeenCalledWith(["sale-1", "sale-2"]);
    expect(labels.get("entry-1")).toBe("Comisión VT-0042");
    expect(labels.get("entry-2")).toBe("Comisión VT-0007");
  });

  it("omits entries whose sale is unknown", async () => {
    const useCase = new GetCommissionEntryLabelsUseCase(
      {
        findSaleIdsByIds: vi
          .fn()
          .mockResolvedValue([{ id: "entry-1", saleId: "missing" }]),
      } as unknown as CommissionEntryRepository,
      { findSummariesByIds: vi.fn().mockResolvedValue([]) } as unknown as SaleRepository,
    );

    const labels = await useCase.execute({ entryIds: ["entry-1"] });

    expect(labels.has("entry-1")).toBe(false);
  });

  it("does not query sales when there are no entries", async () => {
    const findSummariesByIds = vi.fn().mockResolvedValue([]);
    const useCase = new GetCommissionEntryLabelsUseCase(
      {
        findSaleIdsByIds: vi.fn().mockResolvedValue([]),
      } as unknown as CommissionEntryRepository,
      { findSummariesByIds } as unknown as SaleRepository,
    );

    const labels = await useCase.execute({ entryIds: [] });

    expect(labels.size).toBe(0);
    expect(findSummariesByIds).not.toHaveBeenCalled();
  });
});

describe("GetCommissionRuleLabelsUseCase", () => {
  it("returns Regla N<levelId> per rule id", async () => {
    const findLevelIdsByIds = vi
      .fn()
      .mockResolvedValue([
        { id: "rule-1", levelId: 3 },
        { id: "rule-2", levelId: 7 },
      ]);
    const useCase = new GetCommissionRuleLabelsUseCase({
      findLevelIdsByIds,
    } as unknown as CommissionRuleRepository);

    const labels = await useCase.execute({ ruleIds: ["rule-1", "rule-2"] });

    expect(labels.get("rule-1")).toBe("Regla N3");
    expect(labels.get("rule-2")).toBe("Regla N7");
  });

  it("does not query when there are no ids", async () => {
    const findLevelIdsByIds = vi.fn().mockResolvedValue([]);
    const useCase = new GetCommissionRuleLabelsUseCase({
      findLevelIdsByIds,
    } as unknown as CommissionRuleRepository);

    const labels = await useCase.execute({ ruleIds: [] });

    expect(labels.size).toBe(0);
    expect(findLevelIdsByIds).not.toHaveBeenCalled();
  });
});
