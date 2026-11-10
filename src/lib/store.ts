import { useMemo } from "react";
import { create } from "zustand";
import { createJSONStorage, persist, type StateStorage } from "zustand/middleware";
import seedTrainees from "@/data/trainees.json";
import seedInstallments from "@/data/installments.json";
import seedTraineeFinancialDatabase from "@/data/traineeFinancialDatabase.json";

// ==========================================
// 1. تعريف الأنواع (Types)
// ==========================================

export type Trainee = { name: string; batch: string; specialty: string };
export type TraineeFinancialRecord = Record<string, string | number>;

export const INSTALLMENT_MONTHS = [
  "يناير",
  "فبراير",
  "مارس",
  "ابريل",
  "مايو",
  "يونيو",
  "يوليو",
  "اغسطس",
  "سبتمبر",
  "اكتوبر",
  "نوفمبر",
  "ديسمبر",
] as const;

// أول سنة مالية يدعمها النظام (السنة التي بدأ فيها التطبيق)
export const FIRST_FISCAL_YEAR = 2026;

export type InstallmentCustomColumn = {
  name: string;
  type: "text" | "select" | "formula";
  options?: string[];
  formula?: string;
};

export type InstallmentConditionalRule = { text: string; color: string };

export type Installment = {
  no?: number | null;
  name: string;
  batch: string;
  specialty: string;
  fees: number;
  prevDue: number;
  payments: Record<string, number>;
  totalPaid: number;
  remaining: number;
  notes: string;
  phone: string;
  customData?: Record<string, string | number>;
};

export type Hafiza = {
  id: string;
  name: string;
  batch: string;
  specialty: string;
  date: string;
  hafizaNo: string;
  description: string;
  hafizaAmount: number;
  notifyDate?: string;
  notifyNo?: string;
  notifyAmount?: number;
  income?: number;
};

export type Account = {
  id: string;
  date: string;
  hafizaNo: string;
  notifyNo: string;
  notifyDate: string;
  checkNo: string;
  checkDate: string;
  description: string;
  specialty: string;
  name: string;
  hafizaAmount: number;
  income: number;
  expense: number;
  sourceHafizaId?: string;
  sourceExpenseId?: string;
  revenueKey?: string;
};

export type Journal = {
  id: string;
  transactionId?: string;
  date: string;
  formNo: string;
  settlement?: string;
  description: string;
  debit: number;
  credit: number;
  account: string;
  debitAccount?: string;
  creditAccount?: string;
  debitCol?: string;
  creditCol?: string;
};

export type RevenueMap = Record<string, number>;

export type CustomTab = {
  id: string;
  name: string;
  columns: string[];
  rows: Record<string, string | number>[];
};

// ==========================================
// 2. واجهة حالة المتجر (State Interface)
// ==========================================
type State = {
  trainees: Trainee[];
  traineeFinancialRecords: TraineeFinancialRecord[];
  traineeFinancialCustomColumns: string[];
  hafiza: Hafiza[];
  hafizas: Hafiza[];
  accounts: Account[];
  journal: Journal[];
  installments: Installment[]; // جدول أقساط عام 2026 (كما كان)
  installments2025: Installment[];
  openingBalance: number; // الرصيد الافتتاحي لعام 2026 (كما كان)
  revenue: RevenueMap;
  customTabs: CustomTab[];
  installmentCustomColumns2026: InstallmentCustomColumn[];
  installmentConditionalRules2026: InstallmentConditionalRule[];

  // ===== دعم السنوات المتعددة (جديد) =====
  selectedYear: number;
  installmentsByYear: Record<string, Installment[]>; // أقساط السنوات 2027 وما بعدها
  installmentCustomColumnsByYear: Record<string, InstallmentCustomColumn[]>;
  installmentConditionalRulesByYear: Record<string, InstallmentConditionalRule[]>;
  openingBalanceByYear: Record<string, number>;

  setSelectedYear: (year: number) => void;
  getInstallmentsForYear: (year: number) => Installment[];
  setInstallmentsForYear: (year: number, list: Installment[]) => void;
  getCustomColumnsForYear: (year: number) => InstallmentCustomColumn[];
  setCustomColumnsForYear: (year: number, columns: InstallmentCustomColumn[]) => void;
  getConditionalRulesForYear: (year: number) => InstallmentConditionalRule[];
  setConditionalRulesForYear: (year: number, rules: InstallmentConditionalRule[]) => void;
  getOpeningBalanceForYear: (year: number) => number;
  setOpeningBalanceForYear: (year: number, amount: number) => void;
  // إنشاء سنة جديدة: ينسخ المتدربين والأعمدة والقواعد من السنة السابقة ويرحّل المتبقي
  startNewYear: (year: number) => void;

  addTrainee: (t: Trainee) => void;
  updateTrainee: (index: number, t: Trainee) => void;
  deleteTrainee: (index: number) => void;
  importTrainees: (trainees: Trainee[]) => void;
  setTraineeFinancialRecords: (records: TraineeFinancialRecord[]) => void;
  setTraineeFinancialCustomColumns: (columns: string[]) => void;

  addHafiza: (h: Omit<Hafiza, "id">) => Hafiza;
  updateHafiza: (id: string, h: Partial<Hafiza>) => void;
  deleteHafiza: (id: string) => void;
  clearHafiza: () => void;

  addAccount: (a: Omit<Account, "id">) => Account;
  updateAccount: (id: string, a: Partial<Account>) => void;
  deleteAccount: (id: string) => void;
  clearAccounts: () => void;

  addJournal: (j: Omit<Journal, "id">) => Journal;
  updateJournal: (id: string, j: Partial<Journal>) => void;
  deleteJournal: (id: string) => void;
  clearJournal: () => void;

  addInstallment: (i: Omit<Installment, "totalPaid" | "remaining">, year?: "2025") => void;
  updateInstallment: (index: number, i: Partial<Installment>, year?: "2025") => void;
  updateInstallmentPayment: (index: number, month: string, amount: number, year?: "2025") => void;
  deleteInstallment: (index: number, year?: "2025") => void;
  clearInstallments: (year?: "2025") => void;
  recalcAllInstallments: () => void;
  setInstallmentCustomColumns2026: (columns: InstallmentCustomColumn[]) => void;
  setInstallmentConditionalRules2026: (rules: InstallmentConditionalRule[]) => void;

  setOpeningBalance: (n: number) => void;
  setRevenue: (year: number, month: number, itemKey: string, amount: number) => void;

  importData: (d: any) => void;
  exportAllData: () => any;
  clearAll: () => void;
  clearTab: (tab: string) => void;

  addCustomTab: (name: string) => CustomTab;
  renameCustomTab: (id: string, name: string) => void;
  deleteCustomTab: (id: string) => void;
  addCustomColumn: (id: string, col: string) => void;
  removeCustomColumn: (id: string, col: string) => void;
  addCustomRow: (id: string, row: Record<string, string | number>) => void;
  updateCustomRow: (id: string, index: number, row: Record<string, string | number>) => void;
  deleteCustomRow: (id: string, index: number) => void;

  getHafizaById: (id: string) => Hafiza | undefined;
  getAccountById: (id: string) => Account | undefined;
  getTotalIncome: () => number;
  getTotalExpenses: () => number;
  getOverdueInstallments: (year?: "2025") => Installment[];
  getInstallmentByIndex: (index: number, year?: "2025") => Installment | undefined;

  syncHafizaToAccount: (hafiza: Hafiza) => void;
  syncExpenseToAccount: (expense: {
    sourceExpenseId: string;
    date: string;
    description: string;
    amount: number;
  }) => void;
};

// ==========================================
// 3. دوال مساعدة محلية (Local Helpers)
// ==========================================
const uid = () => Math.random().toString(36).slice(2, 10) + Date.now().toString(36);
const getToday = () => new Date().toISOString().split("T")[0];

// أصغر سنة افتراضية: 2026 أو السنة الحالية إن كانت أحدث
const getDefaultYear = () => Math.max(FIRST_FISCAL_YEAR, new Date().getFullYear());

// استخراج السنة من تاريخ نصي (2027-03-15 أو 15/03/2027 ...) — يعيد null إن لم يُفهم
export const getYearFromDate = (value: string | undefined | null): number | null => {
  if (!value) return null;
  const text = String(value).trim();
  const match = text.match(/(?:^|[^0-9])(20\d{2})(?:[^0-9]|$)/);
  if (match) return Number(match[1]);
  const d = new Date(text);
  const y = d.getFullYear();
  return Number.isFinite(y) ? y : null;
};

let pendingStorageWrite: { name: string; value: string } | null = null;
let storageWriteTimer: ReturnType<typeof setTimeout> | null = null;
const STORAGE_WRITE_DELAY_MS = 1200;

const flushStorageWrite = () => {
  if (!pendingStorageWrite || typeof window === "undefined") return;
  const pending = pendingStorageWrite;
  pendingStorageWrite = null;
  storageWriteTimer = null;
  try {
    window.localStorage.setItem(pending.name, pending.value);
  } catch (error) {
    console.error("[Storage] Failed to persist application data", error);
    window.dispatchEvent(
      new CustomEvent("mizan:storage-error", {
        detail: {
          message: error instanceof Error ? error.message : String(error),
          recoverable: true,
        },
      }),
    );
  }
};

const deferredStorage: StateStorage = {
  getItem: (name) => (typeof window === "undefined" ? null : window.localStorage.getItem(name)),
  setItem: (name, value) => {
    pendingStorageWrite = { name, value };
    if (storageWriteTimer) clearTimeout(storageWriteTimer);
    storageWriteTimer = setTimeout(flushStorageWrite, STORAGE_WRITE_DELAY_MS);
  },
  removeItem: (name) => {
    if (pendingStorageWrite?.name === name) pendingStorageWrite = null;
    if (storageWriteTimer) {
      clearTimeout(storageWriteTimer);
      storageWriteTimer = null;
    }
    if (typeof window !== "undefined") window.localStorage.removeItem(name);
  },
};

if (typeof window !== "undefined") {
  window.addEventListener("pagehide", flushStorageWrite);
  window.addEventListener("visibilitychange", () => {
    if (document.visibilityState === "hidden") flushStorageWrite();
  });
}

const recalcInstallment = (i: Installment): Installment => {
  const totalPaid = Object.values(i.payments || {}).reduce((s, v) => s + (Number(v) || 0), 0);
  const fees = Number(i.fees) || 0;
  const prevDue = Number(i.prevDue) || 0;
  return { ...i, fees, prevDue, totalPaid, remaining: prevDue - totalPaid };
};

const recalculateRevenueMap = (accounts: Account[]): RevenueMap => {
  const newRevenue: RevenueMap = {};
  accounts.forEach((acc) => {
    if (acc.revenueKey && acc.income > 0) {
      const dateStr = acc.notifyDate || acc.date;
      const d = new Date(dateStr);
      const year = isNaN(d.getFullYear()) ? getDefaultYear() : d.getFullYear();
      const month = isNaN(d.getMonth()) ? 1 : d.getMonth() + 1;
      const compositeKey = `${year}-${month}-${acc.revenueKey}`;
      newRevenue[compositeKey] = (newRevenue[compositeKey] || 0) + acc.income;
    }
  });
  return newRevenue;
};

// حساب قائمة السنوات المتاحة من البيانات المحفوظة + السنة الحالية + السنة المختارة
export const computeAvailableYears = (src: {
  accounts?: Account[];
  journal?: Journal[];
  hafiza?: Hafiza[];
  installmentsByYear?: Record<string, Installment[]>;
  selectedYear?: number;
}): number[] => {
  const years = new Set<number>([FIRST_FISCAL_YEAR, getDefaultYear()]);
  if (src.selectedYear) years.add(src.selectedYear);
  (src.accounts || []).forEach((a) => {
    const y = getYearFromDate(a.date) ?? getYearFromDate(a.notifyDate);
    if (y && y >= 2000 && y <= 2100) years.add(y);
  });
  (src.journal || []).forEach((j) => {
    const y = getYearFromDate(j.date);
    if (y && y >= 2000 && y <= 2100) years.add(y);
  });
  (src.hafiza || []).forEach((h) => {
    const y = getYearFromDate(h.date);
    if (y && y >= 2000 && y <= 2100) years.add(y);
  });
  Object.keys(src.installmentsByYear || {}).forEach((k) => {
    const y = Number(k);
    if (Number.isFinite(y)) years.add(y);
  });
  return Array.from(years).sort((a, b) => a - b);
};

// ==========================================
// 4. إنشاء المتجر (Store Creation)
// ==========================================
export const useStore = create<State>()(
  persist(
    (set, get) => ({
      trainees: seedTrainees as Trainee[],
      traineeFinancialRecords: (seedTraineeFinancialDatabase as { rows: TraineeFinancialRecord[] })
        .rows,
      traineeFinancialCustomColumns: ["الحالة الأكاديمية"],
      hafiza: [],
      hafizas: [],
      accounts: [],
      journal: [],
      installments: (seedInstallments as Installment[]).map(recalcInstallment),
      installments2025: [],
      openingBalance: 811664,
      revenue: {},
      customTabs: [],
      installmentCustomColumns2026: [],
      installmentConditionalRules2026: [],

      selectedYear: getDefaultYear(),
      installmentsByYear: {},
      installmentCustomColumnsByYear: {},
      installmentConditionalRulesByYear: {},
      openingBalanceByYear: {},

      setSelectedYear: (year) => {
        if (!Number.isFinite(year)) return;
        set({ selectedYear: year });
      },

      getInstallmentsForYear: (year) => {
        if (year === 2025) return get().installments2025;
        if (year === 2026) return get().installments;
        return get().installmentsByYear[String(year)] || [];
      },
      setInstallmentsForYear: (year, list) => {
        if (year === 2025) set({ installments2025: list });
        else if (year === 2026) set({ installments: list });
        else
          set((s) => ({
            installmentsByYear: { ...s.installmentsByYear, [String(year)]: list },
          }));
      },

      getCustomColumnsForYear: (year) => {
        if (year === 2026) return get().installmentCustomColumns2026 || [];
        return get().installmentCustomColumnsByYear[String(year)] || [];
      },
      setCustomColumnsForYear: (year, columns) => {
        if (year === 2026) set({ installmentCustomColumns2026: columns });
        else
          set((s) => ({
            installmentCustomColumnsByYear: {
              ...s.installmentCustomColumnsByYear,
              [String(year)]: columns,
            },
          }));
      },

      getConditionalRulesForYear: (year) => {
        if (year === 2026) return get().installmentConditionalRules2026 || [];
        return get().installmentConditionalRulesByYear[String(year)] || [];
      },
      setConditionalRulesForYear: (year, rules) => {
        if (year === 2026) set({ installmentConditionalRules2026: rules });
        else
          set((s) => ({
            installmentConditionalRulesByYear: {
              ...s.installmentConditionalRulesByYear,
              [String(year)]: rules,
            },
          }));
      },

      getOpeningBalanceForYear: (year) => {
        if (year === 2026) return get().openingBalance;
        return Number(get().openingBalanceByYear[String(year)]) || 0;
      },
      setOpeningBalanceForYear: (year, amount) => {
        const value = Number(amount) || 0;
        if (year === 2026) set({ openingBalance: value });
        else
          set((s) => ({
            openingBalanceByYear: { ...s.openingBalanceByYear, [String(year)]: value },
          }));
      },

      startNewYear: (year) => {
        if (!Number.isFinite(year) || year <= FIRST_FISCAL_YEAR) {
          set({ selectedYear: Number.isFinite(year) ? year : get().selectedYear });
          return;
        }
        const state = get();
        const prev = year - 1;

        // 1) جدول الأقساط: ينسخ المتدربين ويرحّل المتبقي كمدور (إن لم تكن السنة موجودة)
        if (!state.installmentsByYear[String(year)]) {
          const prevRows = state.getInstallmentsForYear(prev);
          const newRows: Installment[] = prevRows.map((row) => {
            const carried = Math.max(0, Number(row.remaining) || 0);
            const fees = Number(row.fees) || 0;
            return {
              no: row.no ?? null,
              name: row.name,
              batch: row.batch,
              specialty: row.specialty,
              fees,
              prevDue: carried,
              payments: {},
              totalPaid: 0,
              remaining: carried + fees,
              notes: "",
              phone: row.phone || "",
              customData: {},
            };
          });
          set((s) => ({
            installmentsByYear: { ...s.installmentsByYear, [String(year)]: newRows },
          }));
        }

        // 2) الأعمدة المخصصة والقواعد الشرطية تُنسخ من السنة السابقة (إن لم تكن موجودة)
        if (!get().installmentCustomColumnsByYear[String(year)]) {
          const cols = state.getCustomColumnsForYear(prev);
          set((s) => ({
            installmentCustomColumnsByYear: {
              ...s.installmentCustomColumnsByYear,
              [String(year)]: cols.map((c) => ({ ...c })),
            },
          }));
        }
        if (!get().installmentConditionalRulesByYear[String(year)]) {
          const rules = state.getConditionalRulesForYear(prev);
          set((s) => ({
            installmentConditionalRulesByYear: {
              ...s.installmentConditionalRulesByYear,
              [String(year)]: rules.map((r) => ({ ...r })),
            },
          }));
        }

        set({ selectedYear: year });
      },

      syncHafizaToAccount: (hafiza: Hafiza) => {
        const year = Number(hafiza.date?.split("-")[0]);
        if (!Number.isFinite(year) || year < FIRST_FISCAL_YEAR) return;

        let existingAccount = get().accounts.find((acc) => acc.sourceHafizaId === hafiza.id);
        if (!existingAccount && hafiza.hafizaNo) {
          existingAccount = get().accounts.find((acc) => acc.hafizaNo === hafiza.hafizaNo);
          if (existingAccount) {
            set((state) => ({
              accounts: state.accounts.map((acc) =>
                acc.id === existingAccount!.id ? { ...acc, sourceHafizaId: hafiza.id } : acc,
              ),
            }));
          }
        }

        const getNotifyAmount = (h: any): number => {
          const val = h.notifyAmount ?? h.supplyAmount ?? h.tawreedAmount ?? 0;
          const num = Number(val);
          return isNaN(num) ? 0 : num;
        };

        const mappedData = {
          date: hafiza.date,
          hafizaNo: hafiza.hafizaNo || "",
          notifyNo: hafiza.notifyNo || "",
          notifyDate: hafiza.notifyDate || "",
          description: hafiza.description,
          specialty: hafiza.specialty,
          name: hafiza.name,
          hafizaAmount: Number(hafiza.hafizaAmount) || 0,
          income: getNotifyAmount(hafiza),
          sourceHafizaId: hafiza.id,
        };

        if (!existingAccount) {
          const newAccount: Account = {
            id: uid(),
            ...mappedData,
            checkNo: "",
            checkDate: "",
            expense: 0,
            revenueKey: undefined,
          };
          set((state) => {
            const updatedAccounts = [...state.accounts, newAccount];
            return { accounts: updatedAccounts, revenue: recalculateRevenueMap(updatedAccounts) };
          });
        } else {
          const hasDiff =
            existingAccount.date !== mappedData.date ||
            existingAccount.hafizaNo !== mappedData.hafizaNo ||
            existingAccount.notifyNo !== mappedData.notifyNo ||
            existingAccount.notifyDate !== mappedData.notifyDate ||
            existingAccount.description !== mappedData.description ||
            existingAccount.specialty !== mappedData.specialty ||
            existingAccount.name !== mappedData.name ||
            existingAccount.hafizaAmount !== mappedData.hafizaAmount ||
            existingAccount.income !== mappedData.income;
          if (hasDiff) {
            set((state) => {
              const updatedAccounts = state.accounts.map((acc) =>
                acc.id === existingAccount!.id
                  ? {
                      ...acc,
                      ...mappedData,
                      revenueKey: acc.revenueKey,
                      expense: acc.expense,
                      checkNo: acc.checkNo,
                      checkDate: acc.checkDate,
                    }
                  : acc,
              );
              return { accounts: updatedAccounts, revenue: recalculateRevenueMap(updatedAccounts) };
            });
          }
        }
      },

      syncExpenseToAccount: (expense) => {
        const amount = Number(expense.amount) || 0;
        const existingAccount = get().accounts.find(
          (account) => account.sourceExpenseId === expense.sourceExpenseId,
        );

        if (amount <= 0) {
          if (!existingAccount) return;
          set((state) => {
            const updatedAccounts = state.accounts.filter(
              (account) => account.id !== existingAccount.id,
            );
            return { accounts: updatedAccounts, revenue: recalculateRevenueMap(updatedAccounts) };
          });
          return;
        }

        const mappedData = {
          sourceExpenseId: expense.sourceExpenseId,
          date: expense.date,
          description: expense.description,
          hafizaNo: "",
          notifyNo: "",
          notifyDate: "",
          checkNo: "",
          checkDate: "",
          specialty: "",
          name: "",
          hafizaAmount: 0,
          income: 0,
          expense: amount,
          revenueKey: undefined,
        };

        if (!existingAccount) {
          const newAccount: Account = { id: uid(), ...mappedData };
          set((state) => {
            const updatedAccounts = [...state.accounts, newAccount];
            return { accounts: updatedAccounts, revenue: recalculateRevenueMap(updatedAccounts) };
          });
          return;
        }

        const hasDiff =
          existingAccount.date !== mappedData.date ||
          existingAccount.description !== mappedData.description ||
          existingAccount.expense !== mappedData.expense;
        if (!hasDiff) return;

        set((state) => {
          const updatedAccounts = state.accounts.map((account) =>
            account.id === existingAccount.id
              ? {
                  ...account,
                  ...mappedData,
                  checkNo: account.checkNo,
                  checkDate: account.checkDate,
                }
              : account,
          );
          return { accounts: updatedAccounts, revenue: recalculateRevenueMap(updatedAccounts) };
        });
      },

      addTrainee: (t) => set((s) => ({ trainees: [...s.trainees, t] })),
      updateTrainee: (index, t) =>
        set((s) => ({ trainees: s.trainees.map((tr, i) => (i === index ? t : tr)) })),
      deleteTrainee: (index) =>
        set((s) => ({ trainees: s.trainees.filter((_, i) => i !== index) })),
      importTrainees: (trainees) => set((s) => ({ trainees: [...s.trainees, ...trainees] })),
      setTraineeFinancialRecords: (records) => set({ traineeFinancialRecords: records }),
      setTraineeFinancialCustomColumns: (columns) =>
        set({ traineeFinancialCustomColumns: columns }),

      addHafiza: (h) => {
        const item: Hafiza = {
          ...h,
          id: uid(),
          date: h.date || getToday(),
          hafizaAmount: Number(h.hafizaAmount) || 0,
          notifyAmount: Number(h.notifyAmount) || 0,
        };
        set((s) => {
          const updated = [...s.hafiza, item];
          return { hafiza: updated, hafizas: updated };
        });
        get().syncHafizaToAccount(item);
        return item;
      },
      updateHafiza: (id, h) =>
        set((s) => {
          const updated = s.hafiza.map((x) => (x.id === id ? { ...x, ...h } : x));
          const updatedHafiza = updated.find((x) => x.id === id);
          if (updatedHafiza) {
            setTimeout(() => get().syncHafizaToAccount(updatedHafiza), 0);
          }
          return { hafiza: updated, hafizas: updated };
        }),
      deleteHafiza: (id) => {
        set((state) => {
          const updatedHafiza = state.hafiza.filter((x) => x.id !== id);
          const linkedAccount = state.accounts.find((acc) => acc.sourceHafizaId === id);
          if (linkedAccount) {
            const updatedAccounts = state.accounts.filter((acc) => acc.id !== linkedAccount.id);
            return {
              hafiza: updatedHafiza,
              hafizas: updatedHafiza,
              accounts: updatedAccounts,
              revenue: recalculateRevenueMap(updatedAccounts),
            };
          }
          return { hafiza: updatedHafiza, hafizas: updatedHafiza };
        });
      },
      clearHafiza: () => {
        set((state) => {
          const hafizaIds = state.hafiza.map((h) => h.id);
          const updatedAccounts = state.accounts.filter(
            (acc) => !acc.sourceHafizaId || !hafizaIds.includes(acc.sourceHafizaId),
          );
          return {
            hafiza: [],
            hafizas: [],
            accounts: updatedAccounts,
            revenue: recalculateRevenueMap(updatedAccounts),
          };
        });
      },

      addAccount: (a) => {
        const item: Account = {
          ...a,
          id: uid(),
          date: a.date || getToday(),
          hafizaAmount: Number(a.hafizaAmount) || 0,
          income: Number(a.income) || 0,
          expense: Number(a.expense) || 0,
        };
        set((s) => {
          const newAccounts = [...s.accounts, item];
          return { accounts: newAccounts, revenue: recalculateRevenueMap(newAccounts) };
        });
        return item;
      },
      updateAccount: (id, a) =>
        set((s) => {
          const newAccounts = s.accounts.map((x) => (x.id === id ? { ...x, ...a } : x));
          return { accounts: newAccounts, revenue: recalculateRevenueMap(newAccounts) };
        }),
      deleteAccount: (id) =>
        set((s) => {
          const newAccounts = s.accounts.filter((x) => x.id !== id);
          return { accounts: newAccounts, revenue: recalculateRevenueMap(newAccounts) };
        }),
      clearAccounts: () => set({ accounts: [], revenue: {} }),

      addJournal: (j) => {
        const item: Journal = {
          ...j,
          id: uid(),
          transactionId: j.transactionId || uid(),
          date: j.date || getToday(),
          debit: Number(j.debit) || 0,
          credit: Number(j.credit) || 0,
        };
        set((s) => ({ journal: [...s.journal, item] }));
        return item;
      },
      updateJournal: (id, j) =>
        set((s) => ({
          journal: s.journal.map((x) => (x.id === id ? { ...x, ...j } : x)),
        })),
      deleteJournal: (id) =>
        set((s) => {
          const target = s.journal.find((x) => x.id === id);
          if (target && target.transactionId) {
            return { journal: s.journal.filter((x) => x.transactionId !== target.transactionId) };
          }
          return { journal: s.journal.filter((x) => x.id !== id) };
        }),
      clearJournal: () => set({ journal: [] }),

      addInstallment: (i, year) => {
        const newInst = recalcInstallment({
          ...i,
          payments: {},
          totalPaid: 0,
          remaining: Number(i.prevDue) || 0,
        } as Installment);
        set((s) => {
          const key = year === "2025" ? "installments2025" : "installments";
          return { [key]: [...s[key], newInst] };
        });
      },
      updateInstallment: (index, i, year) =>
        set((s) => {
          const key = year === "2025" ? "installments2025" : "installments";
          return {
            [key]: s[key].map((inst, idx) =>
              idx === index ? recalcInstallment({ ...inst, ...i }) : inst,
            ),
          };
        }),
      updateInstallmentPayment: (index, month, amount, year) =>
        set((s) => {
          const key = year === "2025" ? "installments2025" : "installments";
          return {
            [key]: s[key].map((inst, idx) =>
              idx === index
                ? recalcInstallment({ ...inst, payments: { ...inst.payments, [month]: amount } })
                : inst,
            ),
          };
        }),
      deleteInstallment: (index, year) =>
        set((s) => {
          const key = year === "2025" ? "installments2025" : "installments";
          return { [key]: s[key].filter((_, i) => i !== index) };
        }),
      clearInstallments: (year) => {
        if (year === "2025") set({ installments2025: [] });
        else set({ installments: [], installments2025: [] });
      },
      recalcAllInstallments: () =>
        set((s) => ({
          installments: s.installments.map(recalcInstallment),
          installments2025: s.installments2025.map(recalcInstallment),
        })),
      setInstallmentCustomColumns2026: (columns) => set({ installmentCustomColumns2026: columns }),
      setInstallmentConditionalRules2026: (rules) =>
        set({ installmentConditionalRules2026: rules }),

      setOpeningBalance: (n) => set({ openingBalance: n }),
      setRevenue: (year, month, itemKey, amount) =>
        set((s) => ({ revenue: { ...s.revenue, [`${year}-${month}-${itemKey}`]: amount } })),

      importData: (d) =>
        set((s) => {
          const importedAccounts = d.accounts
            ? [
                ...s.accounts,
                ...d.accounts.map((a: any) => ({
                  ...a,
                  id: a.id || uid(),
                  hafizaAmount: Number(a.hafizaAmount) || 0,
                  income: Number(a.income) || 0,
                  expense: Number(a.expense) || 0,
                })),
              ]
            : s.accounts;

          const rawHafiza = d.hafiza || d.hafizas || [];
          const importedHafiza = [
            ...s.hafiza,
            ...rawHafiza.map((h: any) => ({
              ...h,
              id: h.id || uid(),
              hafizaAmount: Number(h.hafizaAmount) || 0,
              notifyAmount: Number(h.notifyAmount) || 0,
            })),
          ];

          return {
            trainees: d.trainees ? [...s.trainees, ...d.trainees] : s.trainees,
            traineeFinancialRecords: (d.traineeFinancialRecords ?? s.traineeFinancialRecords).map((record: TraineeFinancialRecord) => {
              const name = String(record["اسم المتدرب حسب الشهادة"] ?? "")
                .trim()
                .replace(/[ًٌٍَُِّْـ]/g, "")
                .replace(/[إأآ]/g, "ا")
                .replace(/\s+/g, " ");
              const batch = String(record["رقم الدفعة"] ?? "").trim();
              const unclearNames = [
                "امجد امين غانم الشويع",
                "ابتسام قراص علي ناصر القهالي",
                "معين محمد محمد مجمل",
                "مهيب احمد قاسم الحكيمي",
                "نجيب محمد علي مقبل",
              ];
              if (unclearNames.includes(name) && (!batch || batch === "غير محدد")) {
                return { ...record, "المستوى الحالي": "" };
              }
              return record;
            }),
            traineeFinancialCustomColumns: Array.from(new Set([
              ...(d.traineeFinancialCustomColumns ?? s.traineeFinancialCustomColumns),
              "الحالة الأكاديمية",
            ])),
            journal: d.journal
              ? [
                  ...s.journal,
                  ...d.journal.map((j: any) => ({
                    ...j,
                    id: j.id || uid(),
                    transactionId: j.transactionId || uid(),
                    debit: Number(j.debit) || 0,
                    credit: Number(j.credit) || 0,
                  })),
                ]
              : s.journal,
            hafiza: importedHafiza,
            hafizas: importedHafiza,
            accounts: importedAccounts,
            revenue: d.accounts
              ? recalculateRevenueMap(importedAccounts)
              : d.revenue
                ? { ...s.revenue, ...d.revenue }
                : s.revenue,
            installments: d.installments
              ? [...s.installments, ...d.installments.map(recalcInstallment)]
              : s.installments,
            installments2025: d.installments2025
              ? [...s.installments2025, ...d.installments2025.map(recalcInstallment)]
              : s.installments2025,
            openingBalance: d.openingBalance ?? s.openingBalance,
            installmentCustomColumns2026:
              d.installmentCustomColumns2026 ?? s.installmentCustomColumns2026,
            installmentConditionalRules2026:
              d.installmentConditionalRules2026 ?? s.installmentConditionalRules2026,
            installmentsByYear: d.installmentsByYear
              ? { ...s.installmentsByYear, ...d.installmentsByYear }
              : s.installmentsByYear,
            installmentCustomColumnsByYear: d.installmentCustomColumnsByYear
              ? { ...s.installmentCustomColumnsByYear, ...d.installmentCustomColumnsByYear }
              : s.installmentCustomColumnsByYear,
            installmentConditionalRulesByYear: d.installmentConditionalRulesByYear
              ? { ...s.installmentConditionalRulesByYear, ...d.installmentConditionalRulesByYear }
              : s.installmentConditionalRulesByYear,
            openingBalanceByYear: d.openingBalanceByYear
              ? { ...s.openingBalanceByYear, ...d.openingBalanceByYear }
              : s.openingBalanceByYear,
          };
        }),

      exportAllData: () => ({
        trainees: get().trainees,
        traineeFinancialRecords: get().traineeFinancialRecords,
        traineeFinancialCustomColumns: get().traineeFinancialCustomColumns,
        hafiza: get().hafiza,
        hafizas: get().hafizas,
        accounts: get().accounts,
        journal: get().journal,
        installments: get().installments,
        installments2025: get().installments2025,
        openingBalance: get().openingBalance,
        revenue: get().revenue,
        customTabs: get().customTabs,
        installmentCustomColumns2026: get().installmentCustomColumns2026,
        installmentConditionalRules2026: get().installmentConditionalRules2026,
        installmentsByYear: get().installmentsByYear,
        installmentCustomColumnsByYear: get().installmentCustomColumnsByYear,
        installmentConditionalRulesByYear: get().installmentConditionalRulesByYear,
        openingBalanceByYear: get().openingBalanceByYear,
      }),
      clearAll: () =>
        set({
          hafiza: [],
          hafizas: [],
          accounts: [],
          journal: [],
          traineeFinancialRecords: [],
          traineeFinancialCustomColumns: [],
          installments: [],
          installments2025: [],
          installmentsByYear: {},
          revenue: {},
        }),
      clearTab: (tab) =>
        set((s) => {
          if (tab === "hafiza" || tab === "hafizas") return { ...s, hafiza: [], hafizas: [] };
          if (tab === "traineeFinancialRecords" || tab === "trainee-data")
            return { ...s, traineeFinancialRecords: [], traineeFinancialCustomColumns: [] };
          return { ...s, [tab]: [] };
        }),

      addCustomTab: (name) => {
        const tab: CustomTab = { id: uid(), name, columns: [], rows: [] };
        set((s) => ({ customTabs: [...s.customTabs, tab] }));
        return tab;
      },
      renameCustomTab: (id, name) =>
        set((s) => ({ customTabs: s.customTabs.map((t) => (t.id === id ? { ...t, name } : t)) })),
      deleteCustomTab: (id) =>
        set((s) => ({ customTabs: s.customTabs.filter((t) => t.id !== id) })),
      addCustomColumn: (id, col) =>
        set((s) => ({
          customTabs: s.customTabs.map((t) =>
            t.id === id && !t.columns.includes(col) ? { ...t, columns: [...t.columns, col] } : t,
          ),
        })),
      removeCustomColumn: (id, col) =>
        set((s) => ({
          customTabs: s.customTabs.map((t) =>
            t.id === id ? { ...t, columns: t.columns.filter((c) => c !== col) } : t,
          ),
        })),
      addCustomRow: (id, row) =>
        set((s) => ({
          customTabs: s.customTabs.map((t) => (t.id === id ? { ...t, rows: [...t.rows, row] } : t)),
        })),
      updateCustomRow: (id, index, row) =>
        set((s) => ({
          customTabs: s.customTabs.map((t) =>
            t.id === id ? { ...t, rows: t.rows.map((r, i) => (i === index ? row : r)) } : t,
          ),
        })),
      deleteCustomRow: (id, index) =>
        set((s) => ({
          customTabs: s.customTabs.map((t) =>
            t.id === id ? { ...t, rows: t.rows.filter((_, i) => i !== index) } : t,
          ),
        })),

      getHafizaById: (id) => get().hafiza.find((h) => h.id === id),
      getAccountById: (id) => get().accounts.find((a) => a.id === id),
      getTotalIncome: () => get().journal.reduce((sum, j) => sum + (j.credit || 0), 0),
      getTotalExpenses: () => get().journal.reduce((sum, j) => sum + (j.debit || 0), 0),
      getOverdueInstallments: (year) => {
        const key = year === "2025" ? "installments2025" : "installments";
        return get()[key].filter((i: Installment) => i.remaining > 0);
      },
      getInstallmentByIndex: (index, year) => {
        const key = year === "2025" ? "installments2025" : "installments";
        return get()[key][index];
      },
    }),
    {
      name: "majlis-yemen-v1",
      // مهم: يبقى الإصدار 2 حتى لا تُمسح بيانات المستخدم المحفوظة.
      // الحقول الجديدة تأخذ قيمها الافتراضية تلقائياً إذا لم تكن موجودة في التخزين القديم.
      version: 2,
      storage: createJSONStorage(() => deferredStorage),
      partialize: (state) => ({
        trainees: state.trainees,
        traineeFinancialRecords: state.traineeFinancialRecords,
        traineeFinancialCustomColumns: state.traineeFinancialCustomColumns,
        hafiza: state.hafiza,
        hafizas: state.hafizas,
        accounts: state.accounts,
        journal: state.journal,
        installments: state.installments,
        installments2025: state.installments2025,
        openingBalance: state.openingBalance,
        revenue: state.revenue,
        customTabs: state.customTabs,
        installmentCustomColumns2026: state.installmentCustomColumns2026,
        installmentConditionalRules2026: state.installmentConditionalRules2026,
        selectedYear: state.selectedYear,
        installmentsByYear: state.installmentsByYear,
        installmentCustomColumnsByYear: state.installmentCustomColumnsByYear,
        installmentConditionalRulesByYear: state.installmentConditionalRulesByYear,
        openingBalanceByYear: state.openingBalanceByYear,
      }),
    },
  ),
);

// تصدير الـ Hooks المخصصة
export const useTrainees = () => useStore((s) => s.trainees);
export const useHafiza = () => useStore((s) => s.hafiza);
export const useHafizas = () => useStore((s) => s.hafizas);
export const useAccounts = () => useStore((s) => s.accounts);
export const useJournal = () => useStore((s) => s.journal);
export const useInstallments = () => useStore((s) => s.installments);
export const useInstallments2025 = () => useStore((s) => s.installments2025);
export const useCustomTabs = () => useStore((s) => s.customTabs);
export const useRevenue = () => useStore((s) => s.revenue);
export const useOpeningBalance = () => useStore((s) => s.openingBalance);

// ===== Hooks السنوات المتعددة =====
export const useSelectedYear = () => useStore((s) => s.selectedYear);

export const useAvailableYears = (): number[] => {
  const accounts = useStore((s) => s.accounts);
  const journal = useStore((s) => s.journal);
  const hafiza = useStore((s) => s.hafiza);
  const installmentsByYear = useStore((s) => s.installmentsByYear);
  const selectedYear = useStore((s) => s.selectedYear);
  return useMemo(
    () => computeAvailableYears({ accounts, journal, hafiza, installmentsByYear, selectedYear }),
    [accounts, journal, hafiza, installmentsByYear, selectedYear],
  );
};
