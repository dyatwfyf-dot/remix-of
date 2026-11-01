// @ts-nocheck
import { describe, expect, it } from "vitest";
import { getAvailableYears, FIRST_FISCAL_YEAR } from "./fiscalYear";

describe("fiscal years", () => {
  it("always offers 2026 and the next calendar year", () => {
    const years = getAvailableYears();
    expect(years).toContain(FIRST_FISCAL_YEAR);
    expect(years).toContain(new Date().getFullYear() + 1);
  });
  it("includes future years found in data", () => {
    expect(getAvailableYears([2031])).toContain(2031);
  });
});
