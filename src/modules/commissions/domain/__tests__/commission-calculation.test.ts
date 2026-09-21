import { describe, expect, it } from "vitest";
import { calculateCommission } from "../commission-calculation";

describe("commission calculation", () => {
  it.each([
    [1, 15],
    [2, 20],
    [3, 30],
    [4, 40],
    [5, 50],
    [6, 60],
    [7, 70],
  ])("calculates the confirmed rate for N%d", (_level, percentage) => {
    expect(calculateCommission(100_000, percentage).amount).toBe(
      (100_000 * percentage) / 100,
    );
  });

  it("rounds half-up to two decimals", () => {
    expect(calculateCommission(10, 33.335).amount).toBe(3.33);
    expect(calculateCommission(10, 33.35).amount).toBe(3.34);
  });

  it("preserves the calculation base and percentage", () => {
    expect(calculateCommission(123.45, 20)).toEqual({
      baseAmount: 123.45,
      percentage: 20,
      amount: 24.69,
    });
  });
});
