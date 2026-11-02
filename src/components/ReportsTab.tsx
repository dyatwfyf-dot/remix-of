import React, { useEffect, useMemo, useState } from "react";
import {
  BarChart3,
  CalendarDays,
  ChevronDown,
  ChevronUp,
  DollarSign,
  FileText,
  Trash2,
  TrendingUp,
  UserRound,
  Wallet,
} from "lucide-react";
import { useStore, type Account } from "@/lib/store";
import { useFiscalYear } from "@/lib/fiscalYear";
import TabActions, { type TabCol } from "./TabActions";
import revenueSchema from "@/data/revenueTemplate.json";

type ReportSource =
  | "youssefLoan"
  | "tawfiqCustody"
  | "account"
  | "hafiza"
  | "expenses"
  | "revenue"
  | "combined"
  | "trainee"
  | "feeTotals";

type PeriodType = "all" | "month" | "quarter" | "half" | "year";
type TraineeGrouping = "month" | "year";
type TraineeDisplayMode = "detail" | "summary" | "both";

export interface ReportRow {
  id?: string;
  date?: string;
  description?: string;
  trainee?: string;
  name?: string;
  specialty?: string;
  year?: string | number;
  amount?: number;
  income?: number;
  expense?: number;
  hafizaAmount?: number;
  hafizaNo?: string;
  notifyNo?: string;
  notifyDate?: string;
  checkNo?: string;
  category?: string;
  period?: string;
  source?: string;
  displayType?: string;
  notes?: string;
  settlementNo?: string;
  item?: string;
  summaryLevel?: "opening" | "total" | "fee" | "trainee-name-total" | "period" | "signature" | "detail";
  total?: string;
  [key: string]: any;
}

interface SignaturesMeta {
  sig1Dept: string;
  sig1Name: string;
  sig2Dept: string;
  sig2Name: string;
  sig3Dept: string;
  sig3Name: string;
}

const MONTHS: string[] = [
  "يناير", "فبراير", "مارس", "أبريل", "مايو", "يونيو",
  "يوليو", "أغسطس", "سبتمبر", "أكتوبر", "نوفمبر", "ديسمبر",
];

const TRAINEE_REPORT_START_YEAR = 2021;

const PERIODS: Array<{ value: PeriodType; label: string }> = [
  { value: "all", label: "كامل المدة (من 2026)" },
  { value: "year", label: "سنوي" },
  { value: "half", label: "نصف سنوي" },
  { value: "quarter", label: "ربع سنوي" },
  { value: "month", label: "شهري" },
];

const SOURCES: Array<{ value: ReportSource; label: string }> = [
  { value: "youssefLoan", label: "سلفة د/يوسف" },
  { value: "tawfiqCustody", label: "عهدة توفيق الداعي" },
  { value: "account", label: "الحساب الجاري" },
  { value: "hafiza", label: "حوافظ التوريد" },
  { value: "expenses", label: "المصروفات" },
  { value: "revenue", label: "الإيرادات" },
  { value: "combined", label: "تقرير مجمّع لكل التبويبات" },
  { value: "trainee", label: "كشف مدفوعات المتدربين" },
  { value: "feeTotals", label: "إجماليات الرسوم حسب النوع" },
];

const normalizeDate = (value: unknown): Date | null => {
  if (!value) return null;
  const date = new Date(String(value));
  return Number.isNaN(date.getTime()) ? null : date;
};

const periodMonths = (period: PeriodType, month: number) => {
  if (period === "all" || period === "year") return Array.from({ length: 12 }, (_, i) => i);
  if (period === "quarter") return [Math.floor(month / 3) * 3, Math.floor(month / 3) * 3 + 1, Math.floor(month / 3) * 3 + 2];
  if (period === "half") return month < 6 ? [0, 1, 2, 3, 4, 5] : [6, 7, 8, 9, 10, 11];
  return [month];
};

const periodLabel = (period: PeriodType, month: number, year: number) => {
  if (period === "all") return `من عام 2026 حتى تاريخه`;
  if (period === "year") return `السنة المالية ${year}`;
  if (period === "half") return `${month < 6 ? "النصف الأول" : "النصف الثاني"} لعام ${year}`;
  if (period === "quarter") return `الربع ${Math.floor(month / 3) + 1} لعام ${year}`;
  return `شهر ${MONTHS[month]} ${year}`;
};

const getYearOptions = (values: unknown[]) => {
  const years = new Set<number>([2024, 2025, 2026]);
  values.forEach((value) => {
    const date = normalizeDate(value);
    if (date) years.add(date.getFullYear());
  });
  return Array.from(years).sort((a, b) => b - a);
};

const revenueItemNames = (() => {
  const names = new Map<string, string>();
  const schema = revenueSchema as any;
  (schema.chapters || []).forEach((chapter: any) =>
    (chapter.sections || []).forEach((section: any) =>
      (section.items || []).forEach((item: any) =>
        (item.types || []).forEach((type: any) => {
          names.set(`${chapter.no}-${section.no}-${item.no}-${type.no}`, type.title);
          names.set(String(type.no), type.title);
        })
      )
    )
  );
  return names;
})();

const revenueName = (key: string) => {
  const itemKey = key.split("-").slice(2).join("-");
  return revenueItemNames.get(itemKey) || revenueItemNames.get(itemKey.split("-").at(-1) || "") || itemKey || "—";
};

const amountValue = (value: unknown): number => {
  if (typeof value === "number") return Number.isFinite(value) ? value : 0;
  if (!value) return 0;
  const num = Number(value);
  return Number.isFinite(num) ? num : 0;
};

const formatCurrency = (val?: number | string | null): string => {
  return (Number(val) || 0).toLocaleString("en-US");
};

const canonicalFeeCategory = (value: unknown) => {
  const text = String(value || "")
    .trim()
    .replace(/[ًٌٍَُِّْـ]/g, "")
    .replace(/[إأآ]/g, "ا")
    .replace(/\s+/g, " ");
  if (!text) return "رسوم أخرى";
  if (/(امتحان|اختبار)/.test(text)) return "رسوم الامتحانات";
  if (/(تسجيل|قيد|دراس|دراسه|قسط)/.test(text)) return "أقساط الدراسة والتسجيل";
  return String(value).trim() || "رسوم أخرى";
};

const classifyCustodyRecord = (description: unknown): "youssef" | "tawfiq" | "other" => {
  const text = String(description || "").trim();
  if (!text) return "other";
  if (/(عهدة\s*الداعي|توفيق\s*الداعي)/.test(text)) return "tawfiq";
  if (/(عهدة\s*د\s*\/?\s*يوسف|العهدة|عهدة)/.test(text)) return "youssef";
  return "other";
};

const reportsTabPrintCss = `
  @media print {
    @page { size: A4 landscape; margin: 8mm; }
    body { font-family: 'Cairo', Arial, sans-serif !important; color: #000000 !important; background: #ffffff !important; }
    .report-page-header { border: 2px solid #000 !important; margin-bottom: 8px !important; }
    table { width: 100% !important; border-collapse: collapse !important; border: 2px solid #000 !important; }
    thead th { background: #FFD700 !important; color: #000000 !important; font-weight: 900 !important; border: 1px solid #000 !important; }
    tbody td { background: #ffffff !important; border: 1px solid #000 !important; color: #000000 !important; font-weight: 800 !important; }
    .total-row td, tr.total-row td { background: #0437bb !important; color: #ffffff !important; font-weight: 900 !important; }
    .signature-block-row td { background: #ffffff !important; }
    .print\\:hidden, button, select, input { display: none !important; }
    .print-only-text { display: block !important; }
  }
`;

export default function ReportsTab() {
  const { year: fiscalYear } = useFiscalYear();
  const hafiza = useStore((state) => state.hafiza);
  const accounts = useStore((state) => state.accounts);
  const revenue = useStore((state) => state.revenue);

  const [source, setSource] = useState<ReportSource>("youssefLoan");
  const [period, setPeriod] = useState<PeriodType>("all");
  const [year, setYear] = useState<number>(fiscalYear);
  const [month, setMonth] = useState<number>(new Date().getMonth());

  const [selectedTrainee, setSelectedTrainee] = useState<string>("all");
  const [selectedFee, setSelectedFee] = useState<string>("all");
  const [traineeGrouping, setTraineeGrouping] = useState<TraineeGrouping>("month");
  const [traineeDisplayMode, setTraineeDisplayMode] = useState<TraineeDisplayMode>("both");

  const [sortColumn, setSortColumn] = useState<string>("date");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc");
  const [traineeSortColumn, setTraineeSortColumn] = useState<string>("notifyDate");
  const [traineeSortDirection, setTraineeSortDirection] = useState<"asc" | "desc">("asc");

  const [columnFilters, setColumnFilters] = useState<Record<string, string>>({});
  const [deletedRows, setDeletedRows] = useState<Set<ReportRow>>(new Set());

  const [youssefOpeningBalance, setYoussefOpeningBalance] = useState<number>(() => {
    try {
      const saved = localStorage.getItem("youssef-loan-opening-balance");
      return saved ? Number(saved) || 0 : 0;
    } catch {
      return 0;
    }
  });

  const [tawfiqOpeningBalance, setTawfiqOpeningBalance] = useState<number>(() => {
    try {
      const saved = localStorage.getItem("tawfiq-custody-opening-balance");
      return saved ? Number(saved) || 0 : 0;
    } catch {
      return 0;
    }
  });

  const [loanManualData, setLoanManualData] = useState<
    Record<string, { settlementNo?: string; notes?: string; amount?: number }>
  >(() => {
    try {
      const saved = localStorage.getItem("reports-loan-manual-data-v1");
      return saved ? JSON.parse(saved) : {};
    } catch {
      return {};
    }
  });

  const [signaturesMeta, setSignaturesMeta] = useState<SignaturesMeta>(() => {
    try {
      const saved = localStorage.getItem("reports-custody-signatures-meta-v1");
      if (saved) return JSON.parse(saved);
    } catch {}
    return {
      sig1Dept: "الشؤون المالية",
      sig1Name: "أ/ محمد الدباغ",
      sig2Dept: "نائب رئيس المجلس",
      sig2Name: "أ.د/ فضل علي حزام",
      sig3Dept: "رئيس المجلس اليمني للاختصاصات الطبية",
      sig3Name: "أ.د/ أثمار حسين علي",
    };
  });

  useEffect(() => {
    try {
      localStorage.setItem("reports-custody-signatures-meta-v1", JSON.stringify(signaturesMeta));
    } catch (error) {
      console.error("تعذر حفظ التوقيعات محلياً:", error);
    }
  }, [signaturesMeta]);

  const handleYoussefOpeningChange = (val: number) => {
    setYoussefOpeningBalance(val);
    try {
      localStorage.setItem("youssef-loan-opening-balance", String(val));
    } catch {}
  };

  const handleTawfiqOpeningChange = (val: number) => {
    setTawfiqOpeningBalance(val);
    try {
      localStorage.setItem("tawfiq-custody-opening-balance", String(val));
    } catch {}
  };

  const handleManualFieldChange = (
    rowKey: string,
    field: "settlementNo" | "notes" | "amount",
    value: string | number
  ) => {
    setLoanManualData((prev) => {
      const current = prev[rowKey] || {};
      const updated = {
        ...prev,
        [rowKey]: {
          ...current,
          [field]: field === "amount" ? (value === "" ? 0 : Number(value) || 0) : value,
        },
      };
      try {
        localStorage.setItem("reports-loan-manual-data-v1", JSON.stringify(updated));
      } catch {}
      return updated;
    });
  };

  const yearOptions = useMemo(
    () => getYearOptions([...hafiza.map((row) => row.date), ...accounts.map((row) => row.date)]),
    [hafiza, accounts]
  );

  const selectedMonthSet = useMemo(() => new Set(periodMonths(period, month)), [period, month]);

  const inPeriod = (dateVal: unknown) => {
    const d = normalizeDate(dateVal);
    if (!d) return false;
    if (period === "all") return d.getFullYear() >= 2026;
    return d.getFullYear() === year && selectedMonthSet.has(d.getMonth());
  };

  const youssefRows = useMemo<ReportRow[]>(() => {
    const matched = accounts
      .filter((row) => {
        const d = normalizeDate(row.date);
        if (!d) return false;
        const inTime = period === "all" ? d.getFullYear() >= 2026 : d.getFullYear() === year && selectedMonthSet.has(d.getMonth());
        if (!inTime) return false;
        return classifyCustodyRecord(row.description) === "youssef";
      })
      .sort((a, b) => String(a.date).localeCompare(String(b.date)));

    const result: ReportRow[] = [];
    let sumAmount = 0;

    result.push({
      id: "y-opening",
      date: "—",
      docNo: "—",
      description: "الرصيد الافتتاحي (سلفة د/يوسف)",
      name: "د/ يوسف",
      settlementNo: "—",
      notes: "رصيد مرحل",
      amount: youssefOpeningBalance,
      summaryLevel: "opening",
    });

    matched.forEach((row, index) => {
      const rowKey = `youssef-${index}-${row.date}`;
      const defaultAmt = amountValue(row.income || row.hafizaAmount || row.expense);
      const manual = loanManualData[rowKey];
      const amt = manual?.amount ?? defaultAmt;
      sumAmount += amt;

      const docNo = row.checkNo
        ? `شيك: ${row.checkNo}`
        : row.notifyNo
        ? `إشعار: ${row.notifyNo}`
        : row.hafizaNo
        ? `حافظة: ${row.hafizaNo}`
        : "—";

      result.push({
        id: rowKey,
        date: row.date || "—",
        docNo,
        description: row.description || "سلفة د/يوسف",
        name: row.name || "د/ يوسف",
        settlementNo: manual?.settlementNo ?? "",
        notes: manual?.notes ?? "",
        amount: amt,
      });
    });

    result.push({
      id: "y-total",
      date: "—",
      docNo: "—",
      description: "الإجمالي الكلي",
      name: "—",
      settlementNo: "—",
      notes: "—",
      amount: sumAmount,
      summaryLevel: "total",
    });

    result.push({ id: "sig-1", description: signaturesMeta.sig1Dept, name: signaturesMeta.sig1Name, summaryLevel: "signature" });
    result.push({ id: "sig-2", description: signaturesMeta.sig2Dept, name: signaturesMeta.sig2Name, summaryLevel: "signature" });
    result.push({ id: "sig-3", description: signaturesMeta.sig3Dept, name: signaturesMeta.sig3Name, summaryLevel: "signature" });

    return result;
  }, [accounts, youssefOpeningBalance, period, year, selectedMonthSet, loanManualData, signaturesMeta]);

  const tawfiqRows = useMemo<ReportRow[]>(() => {
    const matched = accounts
      .filter((row) => {
        const d = normalizeDate(row.date);
        if (!d) return false;
        const inTime = period === "all" ? d.getFullYear() >= 2026 : d.getFullYear() === year && selectedMonthSet.has(d.getMonth());
        if (!inTime) return false;
        return classifyCustodyRecord(row.description) === "tawfiq";
      })
      .sort((a, b) => String(a.date).localeCompare(String(b.date)));

    const result: ReportRow[] = [];
    let sumAmount = 0;

    result.push({
      id: "t-opening",
      date: "—",
      docNo: "—",
      description: "الرصيد الافتتاحي (عهدة توفيق الداعي)",
      name: "توفيق الداعي",
      settlementNo: "—",
      notes: "رصيد مرحل",
      amount: tawfiqOpeningBalance,
      summaryLevel: "opening",
    });

    matched.forEach((row, index) => {
      const rowKey = `tawfiq-${index}-${row.date}`;
      const defaultAmt = amountValue(row.income || row.hafizaAmount || row.expense);
      const manual = loanManualData[rowKey];
      const amt = manual?.amount ?? defaultAmt;
      sumAmount += amt;

      const docNo = row.checkNo
        ? `شيك: ${row.checkNo}`
        : row.notifyNo
        ? `إشعار: ${row.notifyNo}`
        : row.hafizaNo
        ? `حافظة: ${row.hafizaNo}`
        : "—";

      result.push({
        id: rowKey,
        date: row.date || "—",
        docNo,
        description: row.description || "عهدة توفيق الداعي",
        name: row.name || "توفيق الداعي",
        settlementNo: manual?.settlementNo ?? "",
        notes: manual?.notes ?? "",
        amount: amt,
      });
    });

    result.push({
      id: "t-total",
      date: "—",
      docNo: "—",
      description: "الإجمالي الكلي",
      name: "—",
      settlementNo: "—",
      notes: "—",
      amount: sumAmount,
      summaryLevel: "total",
    });

    result.push({ id: "sig-1", description: signaturesMeta.sig1Dept, name: signaturesMeta.sig1Name, summaryLevel: "signature" });
    result.push({ id: "sig-2", description: signaturesMeta.sig2Dept, name: signaturesMeta.sig2Name, summaryLevel: "signature" });
    result.push({ id: "sig-3", description: signaturesMeta.sig3Dept, name: signaturesMeta.sig3Name, summaryLevel: "signature" });

    return result;
  }, [accounts, tawfiqOpeningBalance, period, year, selectedMonthSet, loanManualData, signaturesMeta]);

  const hafizaRows = useMemo<ReportRow[]>(
    () =>
      hafiza
        .filter((row) => inPeriod(row.date))
        .map((row) => ({
          date: row.date,
          description: row.description || "—",
          name: row.name || "—",
          hafizaNo: row.hafizaNo || "—",
          amount: amountValue(row.hafizaAmount),
          income: amountValue(row.income ?? row.notifyAmount),
        })),
    [hafiza, year, selectedMonthSet, period]
  );

  const accountRows = useMemo<ReportRow[]>(
    () =>
      accounts
        .filter((row) => inPeriod(row.date))
        .sort((a, b) => String(a.date).localeCompare(String(b.date)))
        .map((row) => ({
          date: row.date,
          description: row.description || "—",
          name: row.name || "—",
          income: amountValue(row.income),
          expense: amountValue(row.expense),
          docNo: row.checkNo ? `شيك: ${row.checkNo}` : row.notifyNo ? `إشعار: ${row.notifyNo}` : row.hafizaNo ? `حافظة: ${row.hafizaNo}` : "—",
        })),
    [accounts, year, selectedMonthSet, period]
  );

  const expenseRows = useMemo<ReportRow[]>(
    () =>
      accountRows
        .filter((row) => Number(row.expense) > 0)
        .map((row) => ({
          date: row.date,
          item: row.description,
          name: row.name,
          expense: amountValue(row.expense),
        })),
    [accountRows]
  );

  const revenueRows = useMemo<ReportRow[]>(
    () =>
      Object.entries(revenue)
        .map(([key, amount]) => {
          const parts = key.split("-");
          const rowYear = Number(parts[0]);
          const rowMonth = Number(parts[1]) - 1;
          return {
            date: `${MONTHS[rowMonth] || parts[1]} ${rowYear}`,
            item: revenueName(key),
            amount: amountValue(amount),
            _year: rowYear,
            _month: rowMonth,
          };
        })
        .filter((row) => (period === "all" ? row._year >= 2026 : row._year === year && selectedMonthSet.has(row._month as number)))
        .map(({ _year, _month, ...row }) => row),
    [revenue, year, selectedMonthSet, period]
  );

  const traineeOptions = useMemo(
    () =>
      Array.from(
        new Set(
          hafiza
            .map((row) => String(row.name || "").trim())
            .filter(Boolean)
        )
      ).sort((a, b) => a.localeCompare(b, "ar")),
    [hafiza]
  );

  const feeCategoryOptions = useMemo(
    () =>
      Array.from(
        new Set(
          hafiza
            .map((row) => canonicalFeeCategory(row.description))
            .filter(Boolean)
        )
      ).sort((a, b) => a.localeCompare(b, "ar")),
    [hafiza]
  );

  const traineeRows = useMemo<ReportRow[]>(() => {
    const payments = hafiza.flatMap((row) => {
      const date = normalizeDate(row.notifyDate);
      const trainee = String(row.name || "").trim();
      const category = canonicalFeeCategory(row.description);
      const amount = amountValue(row.notifyAmount);
      if (
        !date ||
        date.getFullYear() < TRAINEE_REPORT_START_YEAR ||
        !trainee ||
        amount <= 0 ||
        (selectedTrainee !== "all" && trainee !== selectedTrainee) ||
        (selectedFee !== "all" && category !== selectedFee)
      ) {
        return [];
      }
      const p = traineeGrouping === "year" ? String(date.getFullYear()) : `${MONTHS[date.getMonth()]} ${date.getFullYear()}`;
      return [
        {
          notifyDate: row.notifyDate,
          hafizaNo: row.hafizaNo || "",
          notifyNo: row.notifyNo || "",
          year: date.getFullYear(),
          period: p,
          trainee,
          category,
          description: String(row.description || "رسوم أخرى").trim(),
          source: "حوافظ التوريد",
          amount,
        },
      ];
    });

    const categories = Array.from(new Set(payments.map((row) => String(row.category)))).sort((a, b) => a.localeCompare(b, "ar"));
    const result: ReportRow[] = [];

    categories.forEach((category) => {
      const categoryPayments = payments.filter((row) => row.category === category).sort((a, b) => String(a.notifyDate).localeCompare(String(b.notifyDate)));
      if (traineeDisplayMode === "detail" || traineeDisplayMode === "both") {
        result.push(...categoryPayments.map((row) => ({ ...row, displayType: "تفصيلي", summaryLevel: "detail" })));
      }
      if (traineeDisplayMode === "summary" || traineeDisplayMode === "both") {
        const grouped = new Map<string, ReportRow>();
        categoryPayments.forEach((row) => {
          const key = `${row.year}|${row.period}`;
          const current = grouped.get(key);
          if (current) {
            current.amount = amountValue(current.amount) + amountValue(row.amount);
          } else {
            grouped.set(key, {
              year: row.year,
              period: row.period,
              trainee: row.trainee,
              category,
              description: "إجمالي الفترة",
              source: "حوافظ التوريد",
              amount: row.amount,
              displayType: "إجمالي الفترة",
              notes: "إجمالي الفترة",
              summaryLevel: "period",
            });
          }
        });
        result.push(...Array.from(grouped.values()));
      }
      result.push({
        period: `إجمالي ${category}`,
        trainee: selectedTrainee === "all" ? "جميع المتدربين" : selectedTrainee,
        category,
        description: "إجمالي الرسم",
        source: "حوافظ التوريد",
        amount: categoryPayments.reduce((sum, row) => sum + amountValue(row.amount), 0),
        displayType: "إجمالي الرسم",
        notes: "إجمالي الرسم",
        summaryLevel: "fee",
      });
    });

    if (traineeDisplayMode === "summary" || traineeDisplayMode === "both") {
      const nameYearMap = new Map<string, { trainee: string; year: number; amount: number }>();
      payments.forEach((row) => {
        const key = `${row.trainee}|${row.year}`;
        const existing = nameYearMap.get(key);
        if (existing) {
          existing.amount += amountValue(row.amount);
        } else {
          nameYearMap.set(key, { trainee: row.trainee, year: row.year, amount: amountValue(row.amount) });
        }
      });
      const nameYearRows: ReportRow[] = Array.from(nameYearMap.values())
        .sort((a, b) => {
          const cmp = a.trainee.localeCompare(b.trainee, "ar");
          return cmp !== 0 ? cmp : a.year - b.year;
        })
        .map(({ trainee, year, amount }) => ({
          year,
          trainee,
          category: "—",
          description: `إجمالي ${trainee} لعام ${year}`,
          source: "حوافظ التوريد",
          amount,
          displayType: "إجمالي المتدرب / السنة",
          notes: "إجمالي المتدرب / السنة",
          summaryLevel: "trainee-name-total",
        }));
      result.push(...nameYearRows);
    }

    return result;
  }, [hafiza, selectedTrainee, selectedFee, traineeGrouping, traineeDisplayMode]);

  const feeTotalsRows = useMemo<ReportRow[]>(() => {
    const totals = new Map<string, number>();
    hafiza.forEach((row) => {
      const name = String(row.name || "").trim();
      const amount = amountValue(row.notifyAmount);
      const date = normalizeDate(row.notifyDate);
      if (amount <= 0 || !date || date.getFullYear() < TRAINEE_REPORT_START_YEAR) return;
      if (selectedTrainee !== "all" && name !== selectedTrainee) return;
      const category = canonicalFeeCategory(row.description);
      totals.set(category, (totals.get(category) || 0) + amount);
    });
    const rows = Array.from(totals.entries())
      .sort((a, b) => b[1] - a[1])
      .map(([category, amount]) => ({ category, source: "حوافظ التوريد", amount }));
    const grandTotal = rows.reduce((sum, row) => sum + amountValue(row.amount), 0);
    return grandTotal > 0 ? [...rows, { category: "الإجمالي الكلي لجميع الرسوم", source: "حوافظ التوريد", amount: grandTotal, total: "نعم" }] : rows;
  }, [hafiza, selectedTrainee]);

  const sourceConfig = useMemo(() => {
    if (source === "youssefLoan") {
      return {
        title: "كشف سلفة د/ يوسف",
        columns: [
          { key: "date", label: "التاريخ" },
          { key: "docNo", label: "رقم المستند / الشيك" },
          { key: "description", label: "البيان" },
          { key: "name", label: "الاسم" },
          { key: "settlementNo", label: "رقم كشف التسوية" },
          { key: "notes", label: "الملاحظات" },
          { key: "amount", label: "المبلغ" },
        ] satisfies TabCol[],
      };
    }
    if (source === "tawfiqCustody") {
      return {
        title: "كشف عهدة توفيق الداعي",
        columns: [
          { key: "date", label: "التاريخ" },
          { key: "docNo", label: "رقم المستند / الشيك" },
          { key: "description", label: "البيان" },
          { key: "name", label: "الاسم" },
          { key: "settlementNo", label: "رقم كشف التسوية" },
          { key: "notes", label: "الملاحظات" },
          { key: "amount", label: "المبلغ" },
        ] satisfies TabCol[],
      };
    }
    if (source === "trainee") {
      return {
        title: "كشف مدفوعات المتدربين من حوافظ التوريد",
        columns: [
          { key: "year", label: "السنة" },
          { key: "notifyDate", label: "تاريخ التوريد" },
          { key: "period", label: "الشهر / السنة" },
          { key: "trainee", label: "اسم المتدرب" },
          { key: "hafizaNo", label: "رقم الحافظة" },
          { key: "notifyNo", label: "رقم الإشعار" },
          { key: "description", label: "البيان الأصلي" },
          { key: "category", label: "التصنيف الموحد" },
          { key: "displayType", label: "نوع السجل" },
          { key: "source", label: "المصدر" },
          { key: "amount", label: "مبلغ التوريد" },
        ] satisfies TabCol[],
      };
    }
    if (source === "feeTotals") {
      return {
        title: "إجماليات الرسوم حسب النوع",
        columns: [
          { key: "category", label: "نوع الرسم" },
          { key: "source", label: "المصدر" },
          { key: "amount", label: "الإجمالي" },
        ] satisfies TabCol[],
      };
    }
    if (source === "hafiza") {
      return {
        title: "تقرير حوافظ التوريد",
        columns: [
          { key: "date", label: "التاريخ" },
          { key: "hafizaNo", label: "رقم الحافظة" },
          { key: "description", label: "البيان" },
          { key: "name", label: "الاسم" },
          { key: "amount", label: "المبلغ" },
          { key: "income", label: "الإيرادات" },
        ] satisfies TabCol[],
      };
    }
    if (source === "account") {
      return {
        title: "تقرير الحساب الجاري",
        columns: [
          { key: "date", label: "التاريخ" },
          { key: "docNo", label: "رقم المستند" },
          { key: "description", label: "البيان" },
          { key: "name", label: "الاسم" },
          { key: "income", label: "الإيرادات" },
          { key: "expense", label: "المصروفات" },
        ] satisfies TabCol[],
      };
    }
    if (source === "expenses") {
      return {
        title: "تقرير المصروفات",
        columns: [
          { key: "date", label: "التاريخ" },
          { key: "item", label: "بند المصروف" },
          { key: "name", label: "الاسم" },
          { key: "expense", label: "المبلغ" },
        ] satisfies TabCol[],
      };
    }
    if (source === "revenue") {
      return {
        title: "تقرير الإيرادات",
        columns: [
          { key: "date", label: "الشهر" },
          { key: "item", label: "اسم بند الإيراد" },
          { key: "amount", label: "المبلغ" },
        ] satisfies TabCol[],
      };
    }
    return {
      title: "تقرير مالي مجمّع",
      columns: [
        { key: "source", label: "المصدر" },
        { key: "date", label: "التاريخ / الفترة" },
        { key: "description", label: "البيان / البند" },
        { key: "income", label: "الإيرادات" },
        { key: "expense", label: "المصروفات" },
        { key: "amount", label: "المبلغ" },
      ] satisfies TabCol[],
    };
  }, [source]);

  const reportRows = useMemo<ReportRow[]>(() => {
    if (source === "youssefLoan") return youssefRows;
    if (source === "tawfiqCustody") return tawfiqRows;
    if (source === "trainee") return traineeRows;
    if (source === "feeTotals") return feeTotalsRows;
    if (source === "hafiza") return hafizaRows;
    if (source === "account") return accountRows;
    if (source === "expenses") return expenseRows;
    if (source === "revenue") return revenueRows;
    return [
      ...hafizaRows.map((row) => ({ source: "حوافظ التوريد", date: row.date, description: row.description, income: row.income, amount: row.amount })),
      ...accountRows.map((row) => ({ source: "الحساب الجاري", date: row.date, description: row.description, income: row.income, expense: row.expense })),
      ...expenseRows.map((row) => ({ source: "المصروفات", date: row.date, description: row.item, expense: row.expense })),
      ...revenueRows.map((row) => ({ source: "الإيرادات", date: row.date, description: row.item, amount: row.amount })),
    ];
  }, [source, youssefRows, tawfiqRows, traineeRows, feeTotalsRows, hafizaRows, accountRows, expenseRows, revenueRows]);

  const isPreservedFromColumnFilter = (row: ReportRow): boolean => {
    return row.summaryLevel === "opening" || row.summaryLevel === "total" || row.summaryLevel === "signature";
  };

  const processedRows = useMemo<ReportRow[]>(() => {
    const activeSortCol = source === "trainee" ? traineeSortColumn : sortColumn;
    const activeSortDir = source === "trainee" ? traineeSortDirection : sortDirection;

    const filtered = reportRows.filter((row) => {
      if (deletedRows.has(row)) return false;
      if (isPreservedFromColumnFilter(row)) return true;
      for (const [key, filterVal] of Object.entries(columnFilters)) {
        const fv = String(filterVal || "").trim();
        if (!fv) continue;
        const cellValue = row[key];
        if (cellValue === undefined || cellValue === null) return false;
        if (typeof cellValue === "number") {
          const numFilter = Number(fv);
          if (!isNaN(numFilter)) {
            if (cellValue !== numFilter) return false;
          } else if (!String(cellValue).includes(fv)) {
            return false;
          }
        } else if (!String(cellValue).toLowerCase().includes(fv.toLowerCase())) {
          return false;
        }
      }
      return true;
    });

    const isCustodySource = source === "youssefLoan" || source === "tawfiqCustody";
    if (isCustodySource) return filtered;

    return [...filtered].sort((a, b) => {
      const aVal = a[activeSortCol];
      const bVal = b[activeSortCol];
      if (aVal === undefined || aVal === null) return 1;
      if (bVal === undefined || bVal === null) return -1;
      const numA = Number(aVal);
      const numB = Number(bVal);
      if (!isNaN(numA) && !isNaN(numB)) {
        return activeSortDir === "asc" ? numA - numB : numB - numA;
      }
      const strA = String(aVal);
      const strB = String(bVal);
      return activeSortDir === "asc" ? strA.localeCompare(strB, "ar") : strB.localeCompare(strA, "ar");
    });
  }, [reportRows, columnFilters, sortColumn, sortDirection, source, traineeSortColumn, traineeSortDirection, deletedRows]);

  const reportIssuedAt = new Date();
  const reportYearStart = new Date(reportIssuedAt.getFullYear(), 0, 1);
  const formatReportDate = (date: Date) =>
    date.toLocaleDateString("ar-EG-u-nu-latn", { day: "2-digit", month: "2-digit", year: "numeric" });
  const custodyDateRange = `من ${formatReportDate(reportYearStart)} إلى ${formatReportDate(reportIssuedAt)}`;

  const title =
    source === "trainee"
      ? `كشف مدفوعات ${selectedTrainee === "all" ? "جميع المتدربين" : selectedTrainee} — ${selectedFee === "all" ? "كل الرسوم" : selectedFee} — ${traineeDisplayMode === "detail" ? "تفصيلي" : traineeDisplayMode === "summary" ? "إجمالي" : "تفصيلي وإجمالي"} — تجميع ${traineeGrouping === "month" ? "شهري" : "سنوي"}`
      : source === "feeTotals"
      ? `إجماليات الرسوم حسب النوع — ${selectedTrainee === "all" ? "جميع المتدربين" : selectedTrainee} — من ${TRAINEE_REPORT_START_YEAR}`
      : source === "youssefLoan" || source === "tawfiqCustody"
      ? `${sourceConfig.title} — ${custodyDateRange}`
      : `${sourceConfig.title} — ${periodLabel(period, month, year)}`;

  const numericKeys =
    source === "youssefLoan" || source === "tawfiqCustody"
      ? ["amount"]
      : source === "hafiza"
      ? ["amount", "income"]
      : source === "account"
      ? ["income", "expense"]
      : source === "expenses"
      ? ["expense"]
      : source === "revenue"
      ? ["amount"]
      : source === "trainee" || source === "feeTotals"
      ? ["amount"]
      : ["income", "expense", "amount"];

  const isLoanOrCustody = source === "youssefLoan" || source === "tawfiqCustody";
  const actionRows = isLoanOrCustody
    ? processedRows.filter((row) => row.summaryLevel !== "opening" && row.summaryLevel !== "total" && row.summaryLevel !== "signature")
    : processedRows;

  const displayRows = useMemo(() => processedRows, [processedRows]);

  const activeSortColumn = source === "trainee" ? traineeSortColumn : sortColumn;
  const activeSortDirection = source === "trainee" ? traineeSortDirection : sortDirection;
  const hasAnyFilter = Object.values(columnFilters).some((v) => String(v || "").trim() !== "");
  const colCount = sourceConfig.columns.length + 2;

  const deleteRow = (row: ReportRow) => {
    setDeletedRows((prev) => new Set([...prev, row]));
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-100 via-sky-50 to-indigo-50 p-2 sm:p-4" dir="rtl">
      <section className="mx-auto max-w-7xl overflow-hidden rounded-3xl border border-sky-200 bg-white shadow-xl">
        <header className="bg-gradient-to-l from-[#2e6b8a] via-[#3d7fa0] to-[#2e6b8a] p-4 text-white sm:p-6">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/20 backdrop-blur-sm">
              <BarChart3 className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-black sm:text-2xl">التقارير المالية المتقدمة</h1>
              <p className="mt-0.5 text-xs text-sky-100 sm:text-sm">
                استعراض وتحليل كافة البيانات المالية، العهد، الإيرادات والمصروفات بدقة عالية
              </p>
            </div>
          </div>
        </header>

        {/* فلاتر واختيارات التقرير */}
        <div className="border-b border-sky-100 bg-slate-50/70 p-4">
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
            <label className="flex flex-col gap-1 text-xs font-black text-slate-700">
              نوع التقرير
              <select
                value={source}
                onChange={(e) => {
                  setSource(e.target.value as ReportSource);
                  setDeletedRows(new Set());
                  setColumnFilters({});
                }}
                className="rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm font-bold text-slate-900 outline-none focus:border-sky-600"
              >
                {SOURCES.map((s) => (
                  <option key={s.value} value={s.value}>
                    {s.label}
                  </option>
                ))}
              </select>
            </label>

            {source !== "youssefLoan" && source !== "tawfiqCustody" && source !== "trainee" && source !== "feeTotals" && (
              <>
                <label className="flex flex-col gap-1 text-xs font-black text-slate-700">
                  الفترة الزمنية
                  <select
                    value={period}
                    onChange={(e) => setPeriod(e.target.value as PeriodType)}
                    className="rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm font-bold text-slate-900 outline-none focus:border-sky-600"
                  >
                    {PERIODS.map((p) => (
                      <option key={p.value} value={p.value}>
                        {p.label}
                      </option>
                    ))}
                  </select>
                </label>

                {period !== "all" && (
                  <label className="flex flex-col gap-1 text-xs font-black text-slate-700">
                    السنة
                    <select
                      value={year}
                      onChange={(e) => setYear(Number(e.target.value))}
                      className="rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm font-bold text-slate-900 outline-none focus:border-sky-600"
                    >
                      {yearOptions.map((y) => (
                        <option key={y} value={y}>
                          {y}
                        </option>
                      ))}
                    </select>
                  </label>
                )}

                {period === "month" && (
                  <label className="flex flex-col gap-1 text-xs font-black text-slate-700">
                    الشهر
                    <select
                      value={month}
                      onChange={(e) => setMonth(Number(e.target.value))}
                      className="rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm font-bold text-slate-900 outline-none focus:border-sky-600"
                    >
                      {MONTHS.map((m, idx) => (
                        <option key={idx} value={idx}>
                          {m}
                        </option>
                      ))}
                    </select>
                  </label>
                )}
              </>
            )}

            {/* فلاتر خاصة بكشف المتدربين وإجماليات الرسوم */}
            {(source === "trainee" || source === "feeTotals") && (
              <>
                <label className="flex flex-col gap-1 text-xs font-black text-slate-700">
                  المتدرب
                  <select
                    value={selectedTrainee}
                    onChange={(e) => setSelectedTrainee(e.target.value)}
                    className="rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm font-bold outline-none focus:border-sky-600"
                  >
                    <option value="all">كل المتدربين</option>
                    {traineeOptions.map((name) => (
                      <option key={name} value={name}>
                        {name}
                      </option>
                    ))}
                  </select>
                </label>

                {source === "trainee" && (
                  <>
                    <label className="flex flex-col gap-1 text-xs font-black text-slate-700">
                      نوع الرسم
                      <select
                        value={selectedFee}
                        onChange={(e) => setSelectedFee(e.target.value)}
                        className="rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm font-bold outline-none focus:border-sky-600"
                      >
                        <option value="all">كل الرسوم</option>
                        {feeCategoryOptions.map((fee) => (
                          <option key={fee} value={fee}>
                            {fee}
                          </option>
                        ))}
                      </select>
                    </label>

                    <label className="flex flex-col gap-1 text-xs font-black text-slate-700">
                      طريقة التجميع
                      <select
                        value={traineeGrouping}
                        onChange={(e) => setTraineeGrouping(e.target.value as TraineeGrouping)}
                        className="rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm font-bold outline-none focus:border-sky-600"
                      >
                        <option value="month">تجميع شهري</option>
                        <option value="year">تجميع سنوي</option>
                      </select>
                    </label>

                    <label className="flex flex-col gap-1 text-xs font-black text-slate-700">
                      طريقة العرض
                      <select
                        value={traineeDisplayMode}
                        onChange={(e) => setTraineeDisplayMode(e.target.value as TraineeDisplayMode)}
                        className="rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm font-bold outline-none focus:border-sky-600"
                      >
                        <option value="both">تفصيلي وإجمالي</option>
                        <option value="detail">تفصيلي فقط</option>
                        <option value="summary">إجمالي فقط</option>
                      </select>
                    </label>
                  </>
                )}
              </>
            )}

            {/* إدخال الرصيد الافتتاحي للعهد */}
            {source === "youssefLoan" && (
              <label className="flex flex-col gap-1 text-xs font-black text-slate-700">
                الرصيد الافتتاحي (سلفة د/يوسف)
                <input
                  type="number"
                  value={youssefOpeningBalance || ""}
                  onChange={(e) => handleYoussefOpeningChange(Number(e.target.value) || 0)}
                  placeholder="0"
                  className="rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm font-bold text-slate-900 outline-none focus:border-sky-600 font-mono"
                />
              </label>
            )}

            {source === "tawfiqCustody" && (
              <label className="flex flex-col gap-1 text-xs font-black text-slate-700">
                الرصيد الافتتاحي (عهدة توفيق الداعي)
                <input
                  type="number"
                  value={tawfiqOpeningBalance || ""}
                  onChange={(e) => handleTawfiqOpeningChange(Number(e.target.value) || 0)}
                  placeholder="0"
                  className="rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm font-bold text-slate-900 outline-none focus:border-sky-600 font-mono"
                />
              </label>
            )}
          </div>
        </div>

        {/* أزرار العمليات والتصدير والطباعة */}
        <div className="p-4">
          <TabActions
            title={title}
            fileName="financial-report"
            rows={actionRows}
            printRows={displayRows}
            columns={sourceConfig.columns}
            numericKeys={numericKeys}
            pdfCss={reportsTabPrintCss}
            pdfOrientation="landscape"
            includeTotalRow={false}
          />
        </div>

        {/* جدول عرض التقرير */}
        <div className="overflow-x-auto p-4">
          <div className="border border-black bg-white shadow-sm">
            <table id="reports-table" className="w-full border-collapse text-center text-xs">
              <thead>
                <tr className="border-b border-black bg-[#027d11] text-white">
                  <th className="w-10 border border-black px-2 py-3 font-black">م</th>
                  {sourceConfig.columns.map((col) => (
                    <th
                      key={col.key}
                      onClick={() => {
                        if (source === "trainee") {
                          if (traineeSortColumn === col.key) {
                            setTraineeSortDirection((d) => (d === "asc" ? "desc" : "asc"));
                          } else {
                            setTraineeSortColumn(col.key);
                            setTraineeSortDirection("asc");
                          }
                        } else {
                          if (sortColumn === col.key) {
                            setSortDirection((d) => (d === "asc" ? "desc" : "asc"));
                          } else {
                            setSortColumn(col.key);
                            setSortDirection("asc");
                          }
                        }
                      }}
                      className="cursor-pointer border border-black px-3 py-3 font-black hover:bg-[#026c0f]"
                    >
                      <div className="flex items-center justify-center gap-1">
                        <span>{col.label}</span>
                        {activeSortColumn === col.key &&
                          (activeSortDirection === "asc" ? (
                            <ChevronUp className="h-3.5 w-3.5" />
                          ) : (
                            <ChevronDown className="h-3.5 w-3.5" />
                          ))}
                      </div>
                    </th>
                  ))}
                  <th className="w-12 border border-black px-2 py-3 font-black print:hidden">حذف</th>
                </tr>

                {/* صف التصفية والبحث في الأعمدة */}
                <tr className="border-b border-black bg-slate-100 print:hidden">
                  <th className="border border-black p-1 text-[11px] font-bold text-slate-500">بحث</th>
                  {sourceConfig.columns.map((col) => (
                    <th key={`filter-${col.key}`} className="border border-black p-1">
                      <input
                        type="text"
                        value={columnFilters[col.key] || ""}
                        onChange={(e) => setColumnFilters((prev) => ({ ...prev, [col.key]: e.target.value }))}
                        placeholder={`بحث...`}
                        className="w-full rounded border border-slate-300 bg-white px-2 py-1 text-center text-xs font-bold text-slate-800 outline-none focus:border-sky-600"
                      />
                    </th>
                  ))}
                  <th className="border border-black p-1">
                    {hasAnyFilter && (
                      <button
                        onClick={() => setColumnFilters({})}
                        className="rounded bg-rose-100 px-1.5 py-0.5 text-[10px] font-bold text-rose-700 hover:bg-rose-200"
                      >
                        مسح
                      </button>
                    )}
                  </th>
                </tr>
              </thead>

              <tbody>
                {displayRows.length === 0 ? (
                  <tr>
                    <td colSpan={colCount} className="border border-black py-12 text-center text-sm font-bold text-slate-500">
                      لا توجد بيانات مطابقة للفترة أو المعايير المحددة
                    </td>
                  </tr>
                ) : (
                  displayRows.map((row, index) => {
                    const isOpening = row.summaryLevel === "opening";
                    const isTotal = row.summaryLevel === "total" || row.total === "نعم";
                    const isSignature = row.summaryLevel === "signature";

                    let rowStyle = "";
                    if (isOpening) rowStyle = "bg-white font-bold text-slate-950";
                    else if (isTotal) rowStyle = "bg-[#0437bb] font-black text-white total-row";
                    else if (row.summaryLevel === "fee") rowStyle = "bg-white font-bold text-slate-950";
                    else if (row.summaryLevel === "trainee-name-total") rowStyle = "bg-white font-bold text-slate-950";
                    else if (row.summaryLevel === "period") rowStyle = "bg-white font-bold text-slate-950";
                    else if (index % 2 === 1) rowStyle = "bg-white text-slate-900";
                    else rowStyle = "bg-white text-slate-900";

                    // قسم التوقيعات المدمج أسفل تقارير العهد (في سطر أفقي واحد مدمج)
                    if (isSignature) {
                      if (row.id !== "sig-1") return null;
                      return (
                        <tr key="unified-custody-signatures" className="border-t-2 border-black bg-slate-50/90 signature-block-row">
                          <td colSpan={colCount} className="border border-black p-2 sm:p-3">
                            <div className="mx-auto grid w-full max-w-5xl grid-cols-3 gap-x-3 gap-y-1">
                              <input
                                type="text"
                                value={signaturesMeta.sig1Dept}
                                onChange={(e) => setSignaturesMeta((prev: SignaturesMeta) => ({ ...prev, sig1Dept: e.target.value }))}
                                className="w-full min-w-0 rounded border border-slate-200 bg-white px-1.5 py-2 text-center text-[11px] font-black text-slate-900 outline-none focus:border-sky-600 sm:text-xs"
                                placeholder="الإدارة المالية"
                                title="الشؤون المالية"
                              />
                              <input
                                type="text"
                                value={signaturesMeta.sig2Dept}
                                onChange={(e) => setSignaturesMeta((prev: SignaturesMeta) => ({ ...prev, sig2Dept: e.target.value }))}
                                className="w-full min-w-0 rounded border border-slate-200 bg-white px-1.5 py-2 text-center text-[11px] font-black text-slate-900 outline-none focus:border-sky-600 sm:text-xs"
                                placeholder="نائب رئيس المجلس"
                                title="نائب رئيس المجلس"
                              />
                              <input
                                type="text"
                                value={signaturesMeta.sig3Dept}
                                onChange={(e) => setSignaturesMeta((prev: SignaturesMeta) => ({ ...prev, sig3Dept: e.target.value }))}
                                className="w-full min-w-0 rounded border border-slate-200 bg-white px-1.5 py-2 text-center text-[11px] font-black text-slate-900 outline-none focus:border-sky-600 sm:text-xs"
                                placeholder="رئيس المجلس"
                                title="رئيس المجلس اليمني للاختصاصات الطبية"
                              />
                              <input
                                type="text"
                                value={signaturesMeta.sig1Name}
                                onChange={(e) => setSignaturesMeta((prev: SignaturesMeta) => ({ ...prev, sig1Name: e.target.value }))}
                                className="w-full min-w-0 rounded border border-slate-200 bg-white px-1.5 py-2 text-center text-[11px] font-bold text-slate-900 outline-none focus:border-sky-600 sm:text-xs"
                                placeholder="اسم المدير"
                                title="اسم مدير الشؤون المالية"
                              />
                              <input
                                type="text"
                                value={signaturesMeta.sig2Name}
                                onChange={(e) => setSignaturesMeta((prev: SignaturesMeta) => ({ ...prev, sig2Name: e.target.value }))}
                                className="w-full min-w-0 rounded border border-slate-200 bg-white px-1.5 py-2 text-center text-[11px] font-bold text-slate-900 outline-none focus:border-sky-600 sm:text-xs"
                                placeholder="اسم المدير"
                                title="اسم نائب رئيس المجلس"
                              />
                              <input
                                type="text"
                                value={signaturesMeta.sig3Name}
                                onChange={(e) => setSignaturesMeta((prev: SignaturesMeta) => ({ ...prev, sig3Name: e.target.value }))}
                                className="w-full min-w-0 rounded border border-slate-200 bg-white px-1.5 py-2 text-center text-[11px] font-bold text-slate-900 outline-none focus:border-sky-600 sm:text-xs"
                                placeholder="اسم المدير"
                                title="اسم رئيس المجلس"
                              />
                            </div>
                          </td>
                        </tr>
                      );
                    }

                    return (
                      <tr
                        key={`${String(row.date)}-${String(row.trainee || row.name || "")}-${index}`}
                        className={`transition-colors ${rowStyle} ${isTotal ? "total-row" : ""}`}
                      >
                        <td className="border border-black px-2 py-2 font-bold">
                          {isOpening ? "—" : isTotal ? "★" : index + 1}
                        </td>

                        {sourceConfig.columns.map((col) => {
                          const val = row[col.key];
                          const isNumeric = numericKeys.includes(col.key);
                          const isEditableCustodyRow = isLoanOrCustody && !isOpening && !isTotal;

                          // حقول إدخال يدوية لرقم كشف التسوية والملاحظات والمبلغ في تقارير العهد
                          if (isEditableCustodyRow && (col.key === "settlementNo" || col.key === "notes")) {
                            return (
                              <td key={col.key} className="border border-black p-1">
                                <input
                                  type="text"
                                  value={val ?? ""}
                                  onChange={(e) =>
                                    handleManualFieldChange(
                                      row.id as string,
                                      col.key as "settlementNo" | "notes",
                                      e.target.value
                                    )
                                  }
                                  placeholder={col.key === "settlementNo" ? "رقم الكشف..." : "ملاحظة..."}
                                  className="w-full rounded border border-slate-300 bg-white px-2 py-1 text-center text-xs font-bold text-slate-900 outline-none focus:border-sky-600"
                                />
                              </td>
                            );
                          }

                          if (isEditableCustodyRow && col.key === "amount") {
                            return (
                              <td key={col.key} className="border border-black p-1 font-mono font-black">
                                <input
                                  type="number"
                                  value={val ?? ""}
                                  onChange={(e) =>
                                    handleManualFieldChange(row.id as string, "amount", e.target.value)
                                  }
                                  placeholder="0"
                                  className="w-full rounded border border-slate-300 bg-white px-2 py-1 text-center text-xs font-black text-slate-900 outline-none focus:border-sky-600 font-mono"
                                />
                              </td>
                            );
                          }

                          return (
                            <td
                              key={col.key}
                              className={`border border-black px-2 py-2 font-bold ${
                                isNumeric ? "font-mono font-bold" : ""
                              } bg-white text-slate-900`}
                            >
                              {isNumeric ? formatCurrency(val) : val !== undefined && val !== null && String(val) !== "" ? String(val) : "—"}
                            </td>
                          );
                        })}

                        <td className="border border-black px-1 py-1 print:hidden">
                          {!isOpening && !isTotal && (
                            <button
                              onClick={() => deleteRow(row)}
                              className="rounded p-1 text-rose-600 hover:bg-rose-50"
                              title="إخفاء مؤقت"
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                            </button>
                          )}
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      </section>
    </div>
  );
}
