import { useFiscalYear, getAvailableYears, readYearNumber, writeYearNumber } from "@/lib/fiscalYear";
import { useEffect, useMemo, useState } from "react";
import { BarChart3, CalendarDays, FileText, UserRound, Wallet, Coins, Trash2 } from "lucide-react";
import { useStore, type Account } from "@/lib/store";
import TabActions, { type TabCol } from "./TabActions";
import revenueSchema from "@/data/revenueTemplate.json";

type ReportSource =
  | "youssefLoan"
  | "tawfiqCustody"
  | "hafiza"
  | "account"
  | "expenses"
  | "revenue"
  | "combined"
  | "trainee"
  | "feeTotals";

type PeriodType = "all" | "month" | "quarter" | "half" | "year";
type TraineeGrouping = "month" | "year";
type TraineeDisplayMode = "detail" | "summary" | "both";
type ReportRow = Record<string, string | number | any>;

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
  const years = new Set<number>(getAvailableYears());
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

const amountValue = (value: unknown) => Number(value) || 0;

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

/* ====== تصنيف الصفوف (بنية الجدول) ====== */
// صفوف «رأس» تظهر أول الجدول
const isHeadRow = (row: ReportRow) => row.summaryLevel === "opening";
// صفوف «تذييل» تظهر آخر الجدول (ثابتة لا تتأثر بالفرز)
const isFootRow = (row: ReportRow) =>
  row.summaryLevel === "total" ||
  row.summaryLevel === "fee" ||
  row.summaryLevel === "summary-card" ||
  row.summaryLevel === "trainee-name-total";
// الصفوف التي لا تُصفّى بالتصفية العمودية (تحافظ على ظهورها)
const isPreservedFromColumnFilter = (row: ReportRow) =>
  row.summaryLevel === "opening" ||
  row.summaryLevel === "total" ||
  row.summaryLevel === "fee" ||
  row.summaryLevel === "summary-card";

// أنماط الطباعة
const reportsTabPrintCss = `
  thead th {
    background: #0f283a !important;
    color: #ffffff !important;
    font-weight: 900 !important;
    font-size: 15.5px !important;
    padding: 6px 4px !important;
    white-space: normal !important;
    word-break: keep-all !important;
    border: 1px solid #1f5f7a !important;
    -webkit-print-color-adjust: exact !important;
    print-color-adjust: exact !important;
  }
  thead th .pdf-cell-text,
  th .pdf-cell-text {
    background: transparent !important;
    color: #ffffff !important;
    font-weight: 900 !important;
  }
  tbody td {
    color: #000000 !important;
    font-weight: 800 !important;
    border: 1px solid #e2e8f0 !important;
    font-size: 15.5px !important;
    padding: 4px 5px !important;
    text-align: center !important;
  }
  tbody td .pdf-cell-text {
    color: inherit !important;
    background: transparent !important;
  }
  tbody tr:nth-child(even) td {
    background: #f8fafc !important;
  }
  tbody tr.report-row-plain td { background: #ffffff !important; color: #0f172a !important; }
  tbody tr.report-row-striped td { background: #f8fafc !important; color: #0f172a !important; }
  tbody tr.report-opening-row td,
  tbody tr.report-period-row td { background: #fef3c7 !important; color: #451a03 !important; font-weight: 900 !important; }
  tbody tr.report-fee-row td { background: #e0f2fe !important; color: #082f49 !important; font-weight: 900 !important; }

  tbody tr.total-row td {
    background: #0437bb !important;
    color: #ffffff !important;
    font-weight: 900 !important;
    border-color: #1e3a8a !important;
    border-top: 2px solid #1e3a8a !important;
    border-bottom: 2px solid #1e3a8a !important;
    white-space: nowrap !important;
    -webkit-print-color-adjust: exact !important;
    print-color-adjust: exact !important;
  }
  tbody tr.total-row td .pdf-cell-text {
    color: #ffffff !important;
    font-weight: 900 !important;
    background: transparent !important;
  }

  .summary-spacer-row td {
    height: 12px !important;
    background: transparent !important;
    border: none !important;
    padding: 0 !important;
  }
  .summary-card-row td {
    text-align: center !important;
    vertical-align: middle !important;
    font-weight: 900 !important;
    padding: 7px 6px !important;
    font-size: 18px !important;
    -webkit-print-color-adjust: exact !important;
    print-color-adjust: exact !important;
    white-space: nowrap !important;
  }
  .summary-card-0 td { background: #fde68a !important; color: #451a03 !important; border: 1.5px solid #f59e0b !important; }
  .summary-card-0 .pdf-cell-text { color: #451a03 !important; background: transparent !important; }
  .summary-card-1 td { background: #fecdd3 !important; color: #4c0519 !important; border: 1.5px solid #f43f5e !important; }
  .summary-card-1 .pdf-cell-text { color: #4c0519 !important; background: transparent !important; }
  .summary-card-2 td { background: #a7f3d0 !important; color: #022c22 !important; border: 1.5px solid #10b981 !important; }
  .summary-card-2 .pdf-cell-text { color: #022c22 !important; background: transparent !important; }
  .report-page-content table thead th {
    background: #0f283a !important;
    color: #ffffff !important;
    border-color: #1f5f7a !important;
  }
  .report-page-content table tbody td { border-color: #e2e8f0 !important; }
  .report-page-content table tbody td .pdf-cell-text { color: inherit !important; background: transparent !important; }
  .report-page-content table tbody tr.report-row-plain td { background: #ffffff !important; color: #0f172a !important; }
  .report-page-content table tbody tr.report-row-striped td { background: #f8fafc !important; color: #0f172a !important; }
  .report-page-content table tbody tr.report-opening-row td,
  .report-page-content table tbody tr.report-period-row td { background: #fef3c7 !important; color: #451a03 !important; font-weight: 900 !important; }
  .report-page-content table tbody tr.report-fee-row td { background: #e0f2fe !important; color: #082f49 !important; font-weight: 900 !important; }
  .report-page-content table tbody tr.report-grand-total-row td {
    background: #0437bb !important;
    color: #ffffff !important;
    border-color: #1e3a8a !important;
    border-top: 2px solid #1e3a8a !important;
    border-bottom: 2px solid #1e3a8a !important;
  }
  .report-page-content table tbody tr.report-grand-total-row td .pdf-cell-text { color: #ffffff !important; }
  .report-page-content table tbody tr.summary-card-0 td { background: #fde68a !important; color: #451a03 !important; border-color: #f59e0b !important; }
  .report-page-content table tbody tr.summary-card-0 .pdf-cell-text { color: #451a03 !important; }
  .report-page-content table tbody tr.summary-card-1 td { background: #fecdd3 !important; color: #4c0519 !important; border-color: #f43f5e !important; }
  .report-page-content table tbody tr.summary-card-1 .pdf-cell-text { color: #4c0519 !important; }
  .report-page-content table tbody tr.summary-card-2 td { background: #a7f3d0 !important; color: #022c22 !important; border-color: #10b981 !important; }
  .report-page-content table tbody tr.summary-card-2 .pdf-cell-text { color: #022c22 !important; }
  #tableContainer table th,
  #tableContainer table td,
  #report-source table th,
  #report-source table td {
    border: 1px solid #ffffff !important;
  }
  @media print {
    #tableContainer table th,
    #tableContainer table td {
      border: 1px solid #000 !important;
    }
  }
`;

export default function ReportsTab() {
  const hafiza = useStore((state) => state.hafiza);
  const accounts = useStore((state) => state.accounts);
  const revenue = useStore((state) => state.revenue);

  const [source, setSource] = useState<ReportSource>("youssefLoan");
  const [period, setPeriod] = useState<PeriodType>("all");
  const fiscalYear = useFiscalYear((s) => s.year);
  const [year, setYear] = useState<number>(fiscalYear);
  useEffect(() => setYear(fiscalYear), [fiscalYear]);
  const [month, setMonth] = useState<number>(0);
  const [selectedTrainee, setSelectedTrainee] = useState<string>("all");
  const [traineeGrouping, setTraineeGrouping] = useState<TraineeGrouping>("month");
  const [selectedFee, setSelectedFee] = useState<string>("all");
  const [traineeDisplayMode, setTraineeDisplayMode] = useState<TraineeDisplayMode>("both");

  const [traineeSortColumn, setTraineeSortColumn] = useState<string>("notifyDate");
  const [traineeSortDirection, setTraineeSortDirection] = useState<"asc" | "desc">("asc");

  // ====== الحالة العامة للفرز والتصفية والحذف المؤقت ======
  const [sortColumn, setSortColumn] = useState<string>("");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc");
  const [columnFilters, setColumnFilters] = useState<Record<string, string>>({});
  const [deletedRows, setDeletedRows] = useState<Set<ReportRow>>(() => new Set());

  // إعادة ضبط التصفية والفرز العام والحذف المؤقت عند تغيير المصدر
  useEffect(() => {
    setColumnFilters({});
    setSortColumn("");
    setSortDirection("asc");
    setDeletedRows(new Set());
  }, [source]);

  const [youssefOpeningBalance, setYoussefOpeningBalance] = useState<number>(() => readYearNumber("youssef_loan_opening_balance", year));
  const [tawfiqOpeningBalance, setTawfiqOpeningBalance] = useState<number>(() => readYearNumber("tawfiq_custody_opening_balance", year));

  useEffect(() => {
    setYoussefOpeningBalance(readYearNumber("youssef_loan_opening_balance", year));
    setTawfiqOpeningBalance(readYearNumber("tawfiq_custody_opening_balance", year));
  }, [year]);

  const handleYoussefOpeningChange = (val: number) => {
    setYoussefOpeningBalance(val);
    writeYearNumber("youssef_loan_opening_balance", year, val);
  };

  const handleTawfiqOpeningChange = (val: number) => {
    setTawfiqOpeningBalance(val);
    writeYearNumber("tawfiq_custody_opening_balance", year, val);
  };

  const deleteRow = (row: ReportRow) =>
    setDeletedRows((prev) => {
      const next = new Set(prev);
      next.add(row);
      return next;
    });

  const restoreDeleted = () => setDeletedRows(new Set());

  const selectedMonths = useMemo(() => periodMonths(period, month), [period, month]);
  const selectedMonthSet = useMemo(() => new Set(selectedMonths), [selectedMonths]);
  const years = useMemo(() => getYearOptions([...hafiza.map((r) => r.date), ...accounts.map((r) => r.date)]), [hafiza, accounts]);
  const traineeOptions = useMemo(() => Array.from(new Set(hafiza
    .filter((row) => {
      const date = normalizeDate(row.notifyDate);
      return Boolean(date && date.getFullYear() >= TRAINEE_REPORT_START_YEAR && amountValue(row.notifyAmount) > 0);
    })
    .map((row) => String(row.name || "").trim())
    .filter(Boolean))).sort((a, b) => a.localeCompare(b, "ar")), [hafiza]);
  const feeOptions = useMemo(() => Array.from(new Set(hafiza
    .filter((row) => {
      const date = normalizeDate(row.notifyDate);
      return Boolean(date && date.getFullYear() >= TRAINEE_REPORT_START_YEAR && amountValue(row.notifyAmount) > 0);
    })
    .filter((row) => selectedTrainee === "all" || String(row.name || "").trim() === selectedTrainee)
    .map((row) => canonicalFeeCategory(row.description))
    .filter(Boolean))).sort((a, b) => a.localeCompare(b, "ar")), [hafiza, selectedTrainee]);

  const inPeriod = (dateValue: unknown) => {
    const date = normalizeDate(dateValue);
    if (!date) return false;
    if (period === "all") return date.getFullYear() >= 2026;
    if (period === "year") return date.getFullYear() === year;
    return date.getFullYear() === year && selectedMonthSet.has(date.getMonth());
  };

  // 1. تقرير سلفة د/يوسف
  const youssefRows = useMemo<ReportRow[]>(() => {
    const matched = accounts
      .filter((row) => {
        const d = normalizeDate(row.date);
        if (!d || d.getFullYear() < 2026) return false;
        if (!inPeriod(row.date)) return false;
        return classifyCustodyRecord(row.description) === "youssef";
      })
      .sort((a, b) => String(a.date).localeCompare(String(b.date)));

    let running = youssefOpeningBalance;
    const result: ReportRow[] = [];

    result.push({
      date: `${year}-01-01`,
      docNo: "افتتاحي",
      description: "الرصيد الافتتاحي المدور",
      name: "د/ يوسف",
      debit: youssefOpeningBalance > 0 ? youssefOpeningBalance : 0,
      credit: youssefOpeningBalance < 0 ? Math.abs(youssefOpeningBalance) : 0,
      balance: running,
      summaryLevel: "opening",
    });

    let sumDebit = youssefOpeningBalance > 0 ? youssefOpeningBalance : 0;
    let sumCredit = youssefOpeningBalance < 0 ? Math.abs(youssefOpeningBalance) : 0;

    matched.forEach((row) => {
      const credit = amountValue(row.hafizaAmount);
      const debit = amountValue(row.income);
      running += debit - credit;
      sumDebit += debit;
      sumCredit += credit;

      const docNo = row.checkNo
        ? `شيك: ${row.checkNo}`
        : row.notifyNo
        ? `إشعار: ${row.notifyNo}`
        : row.hafizaNo
        ? `حافظة: ${row.hafizaNo}`
        : "—";

      result.push({
        date: row.date || "—",
        docNo,
        description: row.description || "عهدة د/ يوسف",
        name: row.name || "د/ يوسف",
        debit,
        credit,
        balance: running,
      });
    });

    result.push({
      date: "—",
      docNo: "—",
      description: "الإجمالي الكلي",
      name: "—",
      debit: sumDebit,
      credit: sumCredit,
      balance: running,
      summaryLevel: "total",
    });

    const paidForSummary = sumCredit - (youssefOpeningBalance < 0 ? Math.abs(youssefOpeningBalance) : 0);
    const remainingForSummary = youssefOpeningBalance - paidForSummary;

    result.push({
      __summaryCard: { index: 0, label: `مبلغ العهدة الافتتاحي للعام ${year}`, value: youssefOpeningBalance },
      description: `مبلغ العهدة الافتتاحي للعام ${year}`,
      credit: youssefOpeningBalance,
      summaryLevel: "summary-card",
    });
    result.push({
      __summaryCard: { index: 1, label: "المنصرف من العهدة خلال العام", value: paidForSummary },
      description: "المنصرف من العهدة خلال العام",
      credit: paidForSummary,
      summaryLevel: "summary-card",
    });
    result.push({
      __summaryCard: { index: 2, label: "المتبقي من العهدة حتى تاريخ التقرير", value: remainingForSummary },
      description: "المتبقي من العهدة حتى تاريخ التقرير",
      credit: remainingForSummary,
      summaryLevel: "summary-card",
    });

    return result;
  }, [accounts, youssefOpeningBalance, period, year, selectedMonthSet]);

  // 2. تقرير عهدة توفيق الداعي
  const tawfiqRows = useMemo<ReportRow[]>(() => {
    const matched = accounts
      .filter((row) => {
        const d = normalizeDate(row.date);
        if (!d || d.getFullYear() < 2026) return false;
        if (!inPeriod(row.date)) return false;
        return classifyCustodyRecord(row.description) === "tawfiq";
      })
      .sort((a, b) => String(a.date).localeCompare(String(b.date)));

    let running = tawfiqOpeningBalance;
    const result: ReportRow[] = [];

    result.push({
      date: `${year}-01-01`,
      docNo: "افتتاحي",
      description: "الرصيد الافتتاحي للعهدة",
      name: "توفيق الداعي",
      debit: tawfiqOpeningBalance > 0 ? tawfiqOpeningBalance : 0,
      credit: tawfiqOpeningBalance < 0 ? Math.abs(tawfiqOpeningBalance) : 0,
      balance: running,
      summaryLevel: "opening",
    });

    let sumDebit = tawfiqOpeningBalance > 0 ? tawfiqOpeningBalance : 0;
    let sumCredit = tawfiqOpeningBalance < 0 ? Math.abs(tawfiqOpeningBalance) : 0;

    matched.forEach((row) => {
      const credit = amountValue(row.hafizaAmount);
      const debit = amountValue(row.income);
      running += debit - credit;
      sumDebit += debit;
      sumCredit += credit;

      const docNo = row.checkNo
        ? `شيك: ${row.checkNo}`
        : row.notifyNo
        ? `إشعار: ${row.notifyNo}`
        : row.hafizaNo
        ? `حافظة: ${row.hafizaNo}`
        : "—";

      result.push({
        date: row.date || "—",
        docNo,
        description: row.description || "عهدة توفيق الداعي",
        name: row.name || "توفيق الداعي",
        debit,
        credit,
        balance: running,
      });
    });

    result.push({
      date: "—",
      docNo: "—",
      description: "الإجمالي الكلي",
      name: "—",
      debit: sumDebit,
      credit: sumCredit,
      balance: running,
      summaryLevel: "total",
    });

    const paidForSummary = sumCredit - (tawfiqOpeningBalance < 0 ? Math.abs(tawfiqOpeningBalance) : 0);
    const remainingForSummary = tawfiqOpeningBalance - paidForSummary;

    result.push({
      __summaryCard: { index: 0, label: `مبلغ العهدة الافتتاحي للعام ${year}`, value: tawfiqOpeningBalance },
      description: `مبلغ العهدة الافتتاحي للعام ${year}`,
      credit: tawfiqOpeningBalance,
      summaryLevel: "summary-card",
    });
    result.push({
      __summaryCard: { index: 1, label: "المنصرف من العهدة خلال العام", value: paidForSummary },
      description: "المنصرف من العهدة خلال العام",
      credit: paidForSummary,
      summaryLevel: "summary-card",
    });
    result.push({
      __summaryCard: { index: 2, label: "المتبقي من العهدة حتى تاريخ التقرير", value: remainingForSummary },
      description: "المتبقي من العهدة حتى تاريخ التقرير",
      credit: remainingForSummary,
      summaryLevel: "summary-card",
    });

    return result;
  }, [accounts, tawfiqOpeningBalance, period, year, selectedMonthSet]);

  const hafizaRows = useMemo<ReportRow[]>(() => hafiza.filter((row) => inPeriod(row.date)).map((row) => ({
    date: row.date,
    description: row.description || "—",
    name: row.name || "—",
    hafizaNo: row.hafizaNo || "—",
    amount: amountValue(row.hafizaAmount),
    income: amountValue(row.income ?? row.notifyAmount)
  })), [hafiza, year, selectedMonthSet, period]);

  const accountRows = useMemo<ReportRow[]>(() => accounts.filter((row) => inPeriod(row.date)).sort((a, b) => String(a.date).localeCompare(String(b.date))).map((row) => ({
    date: row.date,
    description: row.description || "—",
    name: row.name || "—",
    income: amountValue(row.income),
    expense: amountValue(row.expense)
  })), [accounts, year, selectedMonthSet, period]);

  const expenseRows = useMemo<ReportRow[]>(() => accountRows.filter((row) => Number(row.expense) > 0).map((row) => ({
    date: row.date,
    item: row.description,
    name: row.name,
    expense: amountValue(row.expense)
  })), [accountRows]);

  const revenueRows = useMemo<ReportRow[]>(() => Object.entries(revenue).map(([key, amount]) => {
    const parts = key.split("-");
    const rowYear = Number(parts[0]);
    const rowMonth = Number(parts[1]) - 1;
    return { date: `${MONTHS[rowMonth] || parts[1]} ${rowYear}`, item: revenueName(key), amount: amountValue(amount), _year: rowYear, _month: rowMonth };
  }).filter((row) => (period === "all" ? row._year >= 2026 : row._year === year && selectedMonthSet.has(row._month as number))).map(({ _year, _month, ...row }) => row), [revenue, year, selectedMonthSet, period]);

  // ====== كشف المتدربين (مع إضافة إجمالي كل اسم حسب السنة) ======
  const traineeRows = useMemo<ReportRow[]>(() => {
    const payments = hafiza.flatMap((row) => {
      const date = normalizeDate(row.notifyDate);
      const trainee = String(row.name || "").trim();
      const category = canonicalFeeCategory(row.description);
      const amount = amountValue(row.notifyAmount);
      if (!date || date.getFullYear() < TRAINEE_REPORT_START_YEAR || !trainee || amount <= 0 || (selectedTrainee !== "all" && trainee !== selectedTrainee) || (selectedFee !== "all" && category !== selectedFee)) return [];
      const p = traineeGrouping === "year" ? String(date.getFullYear()) : `${MONTHS[date.getMonth()]} ${date.getFullYear()}`;
      return [{ notifyDate: row.notifyDate, hafizaNo: row.hafizaNo || "", notifyNo: row.notifyNo || "", year: date.getFullYear(), period: p, trainee, category, description: String(row.description || "رسوم أخرى").trim(), source: "حوافظ التوريد", amount }];
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
              summaryLevel: "period"
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
        summaryLevel: "fee"
      });
    });

    // ====== إجمالي مدفوعات كل متدرب حسب السنة (سواء مكرر أو منفرد) ======
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
        title: "كشف حساب سلفة د/ يوسف",
        columns: [
          { key: "date", label: "التاريخ" },
          { key: "docNo", label: "رقم المستند / الشيك" },
          { key: "description", label: "البيان" },
          { key: "name", label: "الاسم" },
          { key: "debit", label: "مدين (المنصرف)" },
          { key: "credit", label: "دائن (المسدد)" },
          { key: "balance", label: "الرصيد المتبقي" },
        ] satisfies TabCol[],
      };
    }
    if (source === "tawfiqCustody") {
      return {
        title: "كشف حساب عهدة توفيق الداعي",
        columns: [
          { key: "date", label: "التاريخ" },
          { key: "docNo", label: "رقم المستند / الشيك" },
          { key: "description", label: "البيان" },
          { key: "name", label: "الاسم" },
          { key: "debit", label: "مدين (الوارد)" },
          { key: "credit", label: "دائن (المنصرف)" },
          { key: "balance", label: "الرصيد المتبقي" },
        ] satisfies TabCol[],
      };
    }
    if (source === "trainee") return { title: "كشف مدفوعات المتدربين من حوافظ التوريد", columns: [{ key: "year", label: "السنة" }, { key: "notifyDate", label: "تاريخ التوريد" }, { key: "period", label: "الشهر / السنة" }, { key: "trainee", label: "اسم المتدرب" }, { key: "hafizaNo", label: "رقم الحافظة" }, { key: "notifyNo", label: "رقم الإشعار" }, { key: "description", label: "البيان الأصلي" }, { key: "category", label: "التصنيف الموحد" }, { key: "displayType", label: "نوع السجل" }, { key: "source", label: "المصدر" }, { key: "amount", label: "مبلغ التوريد" }] satisfies TabCol[] };
    if (source === "feeTotals") return { title: "إجماليات الرسوم حسب النوع", columns: [{ key: "category", label: "نوع الرسم" }, { key: "source", label: "المصدر" }, { key: "amount", label: "الإجمالي" }] satisfies TabCol[] };
    if (source === "hafiza") return { title: "تقرير حوافظ التوريد", columns: [{ key: "date", label: "التاريخ" }, { key: "hafizaNo", label: "رقم الحافظة" }, { key: "description", label: "البيان" }, { key: "name", label: "الاسم" }, { key: "amount", label: "المبلغ" }, { key: "income", label: "الإيرادات" }] satisfies TabCol[] };
    if (source === "account") return { title: "تقرير الحساب الجاري", columns: [{ key: "date", label: "التاريخ" }, { key: "description", label: "البيان" }, { key: "name", label: "الاسم" }, { key: "income", label: "الإيرادات" }, { key: "expense", label: "المصروفات" }] satisfies TabCol[] };
    if (source === "expenses") return { title: "تقرير المصروفات", columns: [{ key: "date", label: "التاريخ" }, { key: "item", label: "بند المصروف" }, { key: "name", label: "الاسم" }, { key: "expense", label: "المبلغ" }] satisfies TabCol[] };
    if (source === "revenue") return { title: "تقرير الإيرادات", columns: [{ key: "date", label: "الشهر" }, { key: "item", label: "اسم بند الإيراد" }, { key: "amount", label: "المبلغ" }] satisfies TabCol[] };
    return { title: "تقرير مالي مجمّع", columns: [{ key: "source", label: "المصدر" }, { key: "date", label: "التاريخ / الفترة" }, { key: "description", label: "البيان / البند" }, { key: "income", label: "الإيرادات" }, { key: "expense", label: "المصروفات" }, { key: "amount", label: "المبلغ" }] satisfies TabCol[] };
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
      ...revenueRows.map((row) => ({ source: "الإيرادات", date: row.date, description: row.item, amount: row.amount }))
    ];
  }, [source, youssefRows, tawfiqRows, traineeRows, hafizaRows, accountRows, expenseRows, revenueRows, feeTotalsRows]);

  // ====== الصفوف المعالجة (تصفية + فرز + حذف مؤقت) — تُستخدم أيضاً في الطباعة/PDF ======
  const processedRows = useMemo<ReportRow[]>(() => {
    const activeSortCol = source === "trainee" ? traineeSortColumn : sortColumn;
    const activeSortDir = source === "trainee" ? traineeSortDirection : sortDirection;

    // 1) تصفية: حذف مؤقت + تصفية أعمدة (مع الحفاظ على الصفوف البنيوية)
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

    // 2) تصنيف: رأس / جسم / تذييل
    const headRows: ReportRow[] = [];
    const bodyRows: ReportRow[] = [];
    const footRows: ReportRow[] = [];
    filtered.forEach((row) => {
      if (isHeadRow(row)) headRows.push(row);
      else if (isFootRow(row)) footRows.push(row);
      else bodyRows.push(row);
    });

    // 3) فرز صفوف الجسم فقط
    if (activeSortCol) {
      bodyRows.sort((a, b) => {
        let va = a[activeSortCol];
        let vb = b[activeSortCol];
        if (va === undefined || va === null) va = "";
        if (vb === undefined || vb === null) vb = "";
        let cmp = 0;
        if (typeof va === "number" && typeof vb === "number") {
          cmp = va - vb;
        } else {
          const na = Number(va);
          const nb = Number(vb);
          if (!isNaN(na) && !isNaN(nb) && String(va).trim() !== "" && String(vb).trim() !== "") {
            cmp = na - nb;
          } else {
            cmp = String(va).localeCompare(String(vb), "ar", { numeric: true, sensitivity: "base" });
          }
        }
        return activeSortDir === "asc" ? cmp : -cmp;
      });
    }

    // 4) إعادة التجميع: الرأس → الجسم المفروز → التذييل الثابت في النهاية
    return [...headRows, ...bodyRows, ...footRows];
  }, [reportRows, columnFilters, sortColumn, sortDirection, source, traineeSortColumn, traineeSortDirection, deletedRows]);

  const title = source === "trainee"
    ? `كشف مدفوعات ${selectedTrainee === "all" ? "جميع المتدربين" : selectedTrainee} — ${selectedFee === "all" ? "كل الرسوم" : selectedFee} — ${traineeDisplayMode === "detail" ? "تفصيلي" : traineeDisplayMode === "summary" ? "إجمالي" : "تفصيلي وإجمالي"} — تجميع ${traineeGrouping === "month" ? "شهري" : "سنوي"}`
    : source === "feeTotals"
    ? `إجماليات الرسوم حسب النوع — ${selectedTrainee === "all" ? "جميع المتدربين" : selectedTrainee} — من ${TRAINEE_REPORT_START_YEAR}`
    : `${sourceConfig.title} — ${periodLabel(period, month, year)}`;

  const numericKeys =
    source === "youssefLoan" || source === "tawfiqCustody"
      ? ["debit", "credit", "balance"]
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

  // الصفوف المعروضة (بدون بطاقات الملخص لأنها تُعرض كصفوف مدمجة أسفل الجدول)
  const displayRows = useMemo(() => processedRows.filter((row) => row.summaryLevel !== "summary-card"), [processedRows]);

  const activeSortColumn = source === "trainee" ? traineeSortColumn : sortColumn;
  const activeSortDirection = source === "trainee" ? traineeSortDirection : sortDirection;
  const hasAnyFilter = Object.values(columnFilters).some((v) => String(v || "").trim() !== "");

  const colCount = sourceConfig.columns.length + 2; // م + أعمدة + حذف

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-100 via-sky-50 to-indigo-50 p-2 sm:p-4" dir="rtl">
      <section className="mx-auto max-w-7xl overflow-hidden rounded-3xl border border-sky-200 bg-white shadow-xl">
        <header className="bg-gradient-to-l from-[#2e6b8a] via-[#3d7fa0] to-[#2e6b8a] p-4 text-white sm:p-6">
          <div className="flex items-center gap-3">
            <span className="grid h-12 w-12 place-items-center rounded-2xl bg-white/15">
              {isLoanOrCustody ? <Wallet className="h-6 w-6" /> : <BarChart3 className="h-6 w-6" />}
            </span>
            <div>
              <h1 className="text-xl font-black sm:text-2xl">التقارير</h1>
              <p className="text-xs font-semibold text-sky-100 sm:text-sm">
                تقارير السلف والعهد وكشوف الحسابات والإيرادات والمصروفات قابلة للطباعة والتنزيل
              </p>
            </div>
          </div>
        </header>

        {/* عناصر التحكم */}
        <div className="grid grid-cols-1 gap-3 border-b border-slate-200 bg-slate-50/70 p-3 sm:grid-cols-2 lg:grid-cols-4 sm:p-4">
          <label className="flex flex-col gap-1 text-xs font-black text-slate-700">
            مصدر التقرير
            <select
              value={source}
              onChange={(event) => setSource(event.target.value as ReportSource)}
              className="rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm font-bold outline-none focus:border-sky-600"
            >
              {SOURCES.map((item) => (<option key={item.value} value={item.value}>{item.label}</option>))}
            </select>
          </label>

          {source === "youssefLoan" && (
            <label className="flex flex-col gap-1 text-xs font-black text-amber-900 bg-amber-50/80 p-1.5 rounded-xl border border-amber-200">
              <span className="flex items-center gap-1 font-black">
                <Coins className="w-3.5 h-3.5 text-amber-600" />
                الرصيد الافتتاحي لسلفة د/ يوسف (ريال)
              </span>
              <input
                type="number"
                value={youssefOpeningBalance || ""}
                onChange={(e) => handleYoussefOpeningChange(Number(e.target.value) || 0)}
                placeholder="0"
                className="rounded-lg border border-amber-300 bg-white px-3 py-1.5 text-sm font-bold text-slate-900 outline-none focus:border-amber-600 font-mono"
              />
            </label>
          )}

          {source === "tawfiqCustody" && (
            <label className="flex flex-col gap-1 text-xs font-black text-emerald-900 bg-emerald-50/80 p-1.5 rounded-xl border border-emerald-200">
              <span className="flex items-center gap-1 font-black">
                <Coins className="w-3.5 h-3.5 text-emerald-600" />
                الرصيد الافتتاحي لعهدة توفيق الداعي (ريال)
              </span>
              <input
                type="number"
                value={tawfiqOpeningBalance || ""}
                onChange={(e) => handleTawfiqOpeningChange(Number(e.target.value) || 0)}
                placeholder="0"
                className="rounded-lg border border-emerald-300 bg-white px-3 py-1.5 text-sm font-bold text-slate-900 outline-none focus:border-emerald-600 font-mono"
              />
            </label>
          )}

          {source === "trainee" || source === "feeTotals" ? (
            <>
              <label className="flex flex-col gap-1 text-xs font-black text-slate-700">
                المتدرب
                <select
                  value={selectedTrainee}
                  onChange={(event) => setSelectedTrainee(event.target.value)}
                  className="rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm font-bold outline-none focus:border-sky-600"
                >
                  <option value="all">كل المتدربين</option>
                  {traineeOptions.map((name) => (<option key={name} value={name}>{name}</option>))}
                </select>
              </label>

              <label className="flex flex-col gap-1 text-xs font-black text-slate-700">
                طريقة التجميع
                <select
                  value={traineeGrouping}
                  onChange={(event) => setTraineeGrouping(event.target.value as TraineeGrouping)}
                  className="rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm font-bold outline-none focus:border-sky-600"
                >
                  <option value="month">إجمالي كل شهر</option>
                  <option value="year">إجمالي كل سنة</option>
                </select>
              </label>

              {source === "trainee" && (
                <>
                  <label className="flex flex-col gap-1 text-xs font-black text-slate-700">
                    نوع الرسم
                    <select
                      value={selectedFee}
                      onChange={(event) => setSelectedFee(event.target.value)}
                      className="rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm font-bold outline-none focus:border-sky-600"
                    >
                      <option value="all">كل الرسوم</option>
                      {feeOptions.map((fee) => (<option key={fee} value={fee}>{fee}</option>))}
                    </select>
                  </label>

                  <label className="flex flex-col gap-1 text-xs font-black text-slate-700">
                    نمط التقرير
                    <select
                      value={traineeDisplayMode}
                      onChange={(event) => setTraineeDisplayMode(event.target.value as TraineeDisplayMode)}
                      className="rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm font-bold outline-none focus:border-sky-600"
                    >
                      <option value="detail">تفصيلي فقط</option>
                      <option value="summary">إجمالي فقط</option>
                      <option value="both">تفصيلي وإجمالي</option>
                    </select>
                  </label>

                  <label className="flex flex-col gap-1 text-xs font-black text-slate-700">
                    فرز حسب العمود
                    <select
                      value={traineeSortColumn}
                      onChange={(event) => setTraineeSortColumn(event.target.value)}
                      className="rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm font-bold outline-none focus:border-sky-600"
                    >
                      <option value="trainee">اسم المتدرب</option>
                      <option value="notifyDate">تاريخ التوريد</option>
                      <option value="amount">مبلغ التوريد</option>
                      <option value="hafizaNo">رقم الحافظة</option>
                      <option value="notifyNo">رقم الإشعار</option>
                      <option value="category">التصنيف الموحد</option>
                      <option value="year">السنة</option>
                      <option value="period">الشهر / السنة</option>
                      <option value="description">البيان الأصلي</option>
                    </select>
                  </label>

                  <label className="flex flex-col gap-1 text-xs font-black text-slate-700">
                    اتجاه الفرز
                    <select
                      value={traineeSortDirection}
                      onChange={(event) => setTraineeSortDirection(event.target.value as "asc" | "desc")}
                      className="rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm font-bold outline-none focus:border-sky-600"
                    >
                      <option value="asc">تصاعدي (من أ إلى ي / الأصغر للأكبر)</option>
                      <option value="desc">تنازلي (من ي إلى أ / الأكبر للأصغر)</option>
                    </select>
                  </label>
                </>
              )}
            </>
          ) : (
            <>
              <label className="flex flex-col gap-1 text-xs font-black text-slate-700">
                نوع الفترة
                <select
                  value={period}
                  onChange={(event) => setPeriod(event.target.value as PeriodType)}
                  className="rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm font-bold outline-none focus:border-sky-600"
                >
                  {PERIODS.map((item) => (<option key={item.value} value={item.value}>{item.label}</option>))}
                </select>
              </label>

              {period !== "all" && (
                <label className="flex flex-col gap-1 text-xs font-black text-slate-700">
                  السنة
                  <select
                    value={year}
                    onChange={(event) => setYear(Number(event.target.value))}
                    className="rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm font-bold outline-none focus:border-sky-600"
                  >
                    {years.map((item) => (<option key={item} value={item}>{item}</option>))}
                  </select>
                </label>
              )}

              {period !== "all" && period !== "year" && (
                <label className="flex flex-col gap-1 text-xs font-black text-slate-700">
                  الشهر / بداية الفترة
                  <select
                    value={month}
                    onChange={(event) => setMonth(Number(event.target.value))}
                    className="rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm font-bold outline-none focus:border-sky-600"
                  >
                    {MONTHS.map((item, index) => (<option key={item} value={index}>{item}</option>))}
                  </select>
                </label>
              )}
            </>
          )}
        </div>

        {/* شريط الإجراءات والطباعة والتصدير */}
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 p-3 sm:p-4">
          <div className="flex items-center gap-2 text-sm font-black text-slate-800">
            {source === "trainee" ? (
              <UserRound className="h-5 w-5 text-sky-700" />
            ) : isLoanOrCustody ? (
              <Wallet className="h-5 w-5 text-[#1f5f7a]" />
            ) : (
              <CalendarDays className="h-5 w-5 text-sky-700" />
            )}
            <span>{title}</span>
            <span className="rounded-full bg-sky-100 px-2.5 py-1 text-xs font-bold text-sky-800">
              {displayRows.length} سجل
            </span>
            {hasAnyFilter && (
              <span className="rounded-full bg-amber-100 px-2.5 py-1 text-xs font-bold text-amber-800">مفلتر</span>
            )}
            {deletedRows.size > 0 && (
              <button
                onClick={restoreDeleted}
                className="rounded-full bg-rose-100 px-2.5 py-1 text-xs font-bold text-rose-800 hover:bg-rose-200"
                title="استعادة كل الصفوف المحذوفة مؤقتاً"
              >
                استعادة المحذوف ({deletedRows.size})
              </button>
            )}
          </div>

          <TabActions
            title={title}
            rows={processedRows}
            columns={sourceConfig.columns}
            fileName={
              source === "youssefLoan"
                ? `كشف-حساب-سلفة-د-يوسف-${year}`
                : source === "tawfiqCustody"
                ? `كشف-حساب-عهدة-توفيق-الداعي-${year}`
                : `تقرير-${source}-${year}`
            }
            numericKeys={numericKeys}
            pdfLayout="wide-centered"
            pdfOrientation="landscape"
            pdfCss={reportsTabPrintCss}
            includeTotalRow={false}
            className="w-full sm:w-auto"
          />
        </div>

        {/* الجدول */}
        <div className="overflow-x-auto p-3 sm:p-4">
          <table className="w-full min-w-[900px] border-collapse overflow-hidden rounded-2xl text-center text-xs sm:text-sm">
            <thead className="bg-[#0f283a] text-white">
              <tr>
<th className="border border-[#1f5f7a] px-3 py-2.5 font-bold text-white">م</th>
                {sourceConfig.columns.map((column) => {
                  const isSortActive = activeSortColumn === column.key;
                  return (
  <th
                      key={column.key}
                      onClick={() => {
                        if (source === "trainee") {
                          if (traineeSortColumn === column.key) setTraineeSortDirection((p) => (p === "asc" ? "desc" : "asc"));
                          else { setTraineeSortColumn(column.key); setTraineeSortDirection("asc"); }
                        } else {
                          if (sortColumn === column.key) setSortDirection((p) => (p === "asc" ? "desc" : "asc"));
                          else { setSortColumn(column.key); setSortDirection("asc"); }
                        }
                      }}
   className="border border-[#1f5f7a] px-3 py-2.5 font-bold text-white cursor-pointer hover:bg-[#1a4b64] select-none transition-colors"
                      title="انقر للفرز تصاعدياً أو تنازلياً"
                    >
  <div className="flex items-center justify-center gap-1.5 text-white">
  <span className="text-white font-bold">{column.label}</span>

<span className="text-[11px] font-bold text-white">
 {isSortActive ? (activeSortDirection === "asc" ? "▲" : "▼") : (
  <span className="text-white opacity-70">⇅</span>)}
               </span>
                      </div>
                    </th>
                  );
                })}
<th className="border border-[#1f5f7a] px-1 py-2.5 font-bold text-white print:hidden" style={{ width: "44px" }} title="حذف مؤقت">حذف</th>
              </tr>
              {/* صف التصفية — يظهر على الشاشة فقط */}
              <tr className="bg-slate-200/80 print:hidden">
                <td className="border border-slate-300 px-2 py-1 text-center">
                  {hasAnyFilter && (
                    <button
                      onClick={() => setColumnFilters({})}
                      className="rounded bg-rose-600 px-2 py-0.5 text-[10px] font-bold text-white hover:bg-rose-700"
                      title="مسح جميع التصفية"
                    >مسح</button>
                  )}
                </td>
                {sourceConfig.columns.map((column) => (
                  <td key={column.key} className="border border-slate-300 px-1 py-1">
                    <input
                      type="text"
                      value={columnFilters[column.key] || ""}
                      onChange={(e) => setColumnFilters((prev) => ({ ...prev, [column.key]: e.target.value }))}
                      placeholder="تصفية..."
                      className="w-full rounded border border-slate-300 bg-white px-1.5 py-0.5 text-[11px] font-semibold text-slate-900 outline-none focus:border-sky-600"
                    />
                  </td>
                ))}
                <td className="border border-slate-300 px-1 py-1 print:hidden"></td>
              </tr>
            </thead>
            <tbody>
              {displayRows.length === 0 ? (
                <tr>
                  <td colSpan={colCount} className="p-10 text-center text-sm font-bold text-slate-600">
                    <FileText className="mx-auto mb-2 h-8 w-8 text-slate-400" />
                    لا توجد حركات مسجلة للخيارات المحددة في الحساب الجاري.
                  </td>
                </tr>
              ) : (
                <>
                  {displayRows.map((row, index) => {
                    const isTotal = row.summaryLevel === "total" || row.description === "الإجمالي الكلي";
                    const isOpening = row.summaryLevel === "opening";

                    let rowStyle = "hover:bg-sky-50/50";
                    if (isTotal) rowStyle = "bg-[#0437bb] text-white font-black text-sm sm:text-base";
                    else if (isOpening) rowStyle = "bg-amber-100/90 text-amber-950 font-bold";
                    else if (row.summaryLevel === "fee") rowStyle = "bg-sky-100 font-bold text-sky-950";
                    else if (row.summaryLevel === "trainee-name-total") rowStyle = "bg-emerald-100 font-bold text-emerald-950";
                    else if (row.summaryLevel === "period") rowStyle = "bg-amber-100 font-bold text-amber-950";
                    else if (index % 2 === 1) rowStyle = "bg-slate-50/80 text-slate-900";
                    else rowStyle = "bg-white text-slate-900";

                    return (
                      <tr
                        key={`${String(row.date)}-${String(row.trainee || row.name || "")}-${index}`}
                        className={`transition-colors ${rowStyle} ${isTotal ? "total-row" : ""}`}
                        data-summary={isTotal ? "total" : undefined}
                      >
                        <td className={`border px-2 py-2 font-bold ${isTotal ? "border-blue-900 text-white font-black" : "border-slate-200 text-slate-800"}`}>
                          {isTotal ? "★" : index + 1}
                        </td>
                        {sourceConfig.columns.map((column) => {
                          const val = row[column.key];
                          const isNum = numericKeys.includes(column.key);
                          return (
                            <td
                              key={column.key}
                              className={`border px-3 py-2 font-semibold ${
                                isTotal ? "border-blue-900 text-white font-black" : "border-slate-200 text-slate-900"
                              } ${isNum ? "font-mono" : ""}`}
                            >
                              {typeof val === "number" ? val.toLocaleString() : (val ?? "—")}
                            </td>
                          );
                        })}
                        <td className="border border-slate-200 px-1 py-1 print:hidden">
                          <button
                            onClick={() => deleteRow(row)}
                            className={`rounded p-1 hover:bg-rose-50 ${isTotal ? "text-white hover:bg-white/20" : "text-rose-600"}`}
                            title="حذف مؤقت"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        </td>
                      </tr>
                    );
                  })}

                  {/* بطاقات ملخص العهدة */}
                  {isLoanOrCustody && (() => {
                    const summaryRows = processedRows.filter((r) => r.summaryLevel === "summary-card");
                    if (!summaryRows.length) return null;

                    const cardStyles = [
                      { label: `مبلغ العهدة الافتتاحي للعام ${year}`,   bg: "bg-amber-200",   text: "text-amber-950",   border: "border-amber-500",   cls: "summary-card-0" },
                      { label: "المنصرف من العهدة خلال العام",        bg: "bg-rose-200",    text: "text-rose-950",    border: "border-rose-500",    cls: "summary-card-1" },
                      { label: "المتبقي من العهدة حتى تاريخ التقرير", bg: "bg-emerald-200", text: "text-emerald-950", border: "border-emerald-500", cls: "summary-card-2" },
                    ];

                    return (
                      <>
                        <tr className="summary-spacer" aria-hidden="true">
                          <td colSpan={colCount} className="border-0 bg-transparent p-0" style={{ height: "14px" }} />
                        </tr>

                        {summaryRows.map((row, i) => {
                          const style = cardStyles[i % cardStyles.length];
                          const value = amountValue(row.credit);
                          return (
                            <tr key={`summary-${i}`} className={`summary-card-row ${style.cls} ${style.bg} ${style.text} font-black`}>
                              <td colSpan={sourceConfig.columns.length - 1} className={`border ${style.border} px-3 py-2.5 text-center text-xs sm:text-sm font-black`}>
                                {style.label}
                              </td>
                              <td colSpan={2} className={`border ${style.border} px-3 py-2.5 text-center font-mono text-sm sm:text-base font-black`}>
                                {value.toLocaleString()}
                              </td>
                              <td className={`border ${style.border} px-1 py-1 print:hidden`}>
                                <button
                                  onClick={() => deleteRow(row)}
                                  className={`rounded p-1 ${style.text} hover:bg-white/30`}
                                  title="حذف مؤقت"
                                >
                                  <Trash2 className="h-3.5 w-3.5" />
                                </button>
                              </td>
                            </tr>
                          );
                        })}
                      </>
                    );
                  })()}
                </>
              )}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}