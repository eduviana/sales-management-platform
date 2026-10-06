import { describe, expect, it } from "vitest";
import {
  formatCurrency,
  formatDate,
  formatDateTime,
  formatDateTimeWithSeconds,
  formatEmployeeCode,
  formatLevelCode,
  formatMonthKey,
  formatMonthYear,
  formatTime,
} from "../index";

describe("formatDate", () => {
  it("formats a date as dd/mm/aaaa", () => {
    expect(formatDate(new Date(2026, 8, 12))).toBe("12/09/2026");
  });

  it("accepts an ISO-compatible string", () => {
    expect(formatDate("2026-09-12T12:00:00.000Z")).toMatch(
      /^\d{2}\/\d{2}\/\d{4}$/,
    );
  });
});

describe("formatDateTime", () => {
  it("uses 24-hour format", () => {
    expect(formatDateTime(new Date(2026, 8, 12, 15, 30))).toContain("15:30");
  });

  it("includes the date", () => {
    expect(formatDateTime(new Date(2026, 8, 12, 15, 30))).toContain(
      "12/09/2026",
    );
  });
});

describe("formatDateTimeWithSeconds", () => {
  it("includes seconds", () => {
    expect(
      formatDateTimeWithSeconds(new Date(2026, 8, 12, 15, 30, 45)),
    ).toContain("15:30:45");
  });
});

describe("formatTime", () => {
  it("formats only the time in 24-hour format", () => {
    expect(formatTime(new Date(2026, 8, 12, 9, 5))).toContain("09:05");
  });
});

describe("formatMonthYear", () => {
  it("formats a month and year in Spanish", () => {
    const result = formatMonthYear(new Date(2026, 8, 1));
    expect(result).toContain("septiembre");
    expect(result).toContain("2026");
  });
});

describe("formatMonthKey", () => {
  it("formats a YYYY-MM key", () => {
    const result = formatMonthKey("2026-09");
    expect(result).toContain("septiembre");
    expect(result).toContain("2026");
  });

  it("returns the input when the key is invalid", () => {
    expect(formatMonthKey("bogus")).toBe("bogus");
    expect(formatMonthKey("2026-13")).toBe("2026-13");
  });
});

describe("formatCurrency", () => {
  it("prepends the dollar sign and uses es-AR grouping", () => {
    expect(formatCurrency(1000)).toBe("$1.000");
  });
});

describe("formatEmployeeCode", () => {
  it("pads the code to four digits", () => {
    expect(formatEmployeeCode(2)).toBe("#0002");
    expect(formatEmployeeCode(1234)).toBe("#1234");
  });
});

describe("formatLevelCode", () => {
  it("formats a level as its short code", () => {
    expect(formatLevelCode(1)).toBe("N1");
    expect(formatLevelCode(7)).toBe("N7");
  });
});
