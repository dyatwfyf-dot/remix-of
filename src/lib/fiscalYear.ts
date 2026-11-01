import { create } from "zustand";
import { persist } from "zustand/middleware";

/** First fiscal year the system tracks (current-account / custody data starts here). */
export const FIRST_FISCAL_YEAR = 2026;

/** Years shown in selectors: from 2024 up to next calendar year, plus any extra years seen in data. */
export const getAvailableYears = (extra: number[] = []): number[] => {
  const now = new Date().getFullYear();
  const set = new Set<number>(extra.filter((y) => Number.isFinite(y) && y > 1990));
  for (let y = 2024; y <= Math.max(now + 1, FIRST_FISCAL_YEAR + 1); y++) set.add(y);
  return Array.from(set).sort((a, b) => b - a);
};

export const defaultFiscalYear = () => Math.max(new Date().getFullYear(), FIRST_FISCAL_YEAR);

/** Per-year localStorage key; 2026 also falls back to the legacy un-suffixed key. */
export const readYearNumber = (baseKey: string, year: number): number => {
  if (typeof window === "undefined") return 0;
  const saved =
    localStorage.getItem(`${baseKey}_${year}`) ??
    (year === FIRST_FISCAL_YEAR ? localStorage.getItem(baseKey) : null);
  const n = Number(saved);
  return Number.isFinite(n) ? n : 0;
};
export const writeYearNumber = (baseKey: string, year: number, value: number) => {
  if (typeof window !== "undefined") localStorage.setItem(`${baseKey}_${year}`, String(value));
};

type FiscalYearState = { year: number; setYear: (y: number) => void };

export const useFiscalYear = create<FiscalYearState>()(
  persist(
    (set) => ({ year: defaultFiscalYear(), setYear: (year) => set({ year }) }),
    { name: "fiscal-year-v1" },
  ),
);
