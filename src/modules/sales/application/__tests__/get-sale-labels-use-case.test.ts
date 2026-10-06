import { describe, it, expect, vi } from "vitest";
import { GetSaleLabelsUseCase } from "../get-sale-labels-use-case";
import type { SaleRepository } from "../../domain/sale-repository";

function makeSaleRepository(
  findSummariesByIds: ReturnType<typeof vi.fn>,
): SaleRepository {
  return {
    findSummariesByIds,
  } as unknown as SaleRepository;
}

describe("GetSaleLabelsUseCase", () => {
  it("returns VT-<saleNumber> padded to four digits", async () => {
    const findSummariesByIds = vi.fn().mockResolvedValue([
      { id: "sale-1", saleNumber: 42, totalAmount: 100 },
      { id: "sale-2", saleNumber: 1234, totalAmount: 200 },
    ]);
    const useCase = new GetSaleLabelsUseCase(
      makeSaleRepository(findSummariesByIds),
    );

    const labels = await useCase.execute({ saleIds: ["sale-1", "sale-2"] });

    expect(findSummariesByIds).toHaveBeenCalledWith(["sale-1", "sale-2"]);
    expect(labels.get("sale-1")).toBe("VT-0042");
    expect(labels.get("sale-2")).toBe("VT-1234");
  });

  it("omits sales that the repository does not return", async () => {
    const useCase = new GetSaleLabelsUseCase(
      makeSaleRepository(
        vi.fn().mockResolvedValue([
          { id: "sale-1", saleNumber: 42, totalAmount: 100 },
        ]),
      ),
    );

    const labels = await useCase.execute({
      saleIds: ["sale-1", "missing"],
    });

    expect(labels.has("sale-1")).toBe(true);
    expect(labels.has("missing")).toBe(false);
  });

  it("does not query when there are no ids", async () => {
    const findSummariesByIds = vi.fn().mockResolvedValue([]);
    const useCase = new GetSaleLabelsUseCase(
      makeSaleRepository(findSummariesByIds),
    );

    const labels = await useCase.execute({ saleIds: [] });

    expect(labels.size).toBe(0);
    expect(findSummariesByIds).not.toHaveBeenCalled();
  });
});
