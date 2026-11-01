import { useMemo, useState, useEffect } from "react";
import { useStore } from "@/lib/store";
import TabActions, { type TabCol } from "@/components/TabActions";
import { BarChart3, CalendarDays, Coins, Trash2, UserRound, Wallet } from "lucide-react";
import { useFiscalYear } from "@/lib/fiscalYear";

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
  { value: "year", label: "سنة كاملة" },
  { value: "month", label: "شهري" },
  { value: "quarter", label: "ربع سنوي" },
  { value: "half", label: "نصف سنوي" },
];

const SOURCES: Array<{ value: ReportSource; label: string }> = [
  { value: "youssefLoan", label: "مسير اخلاء عهدة د/ يوسف المداني" },
  { value: "tawfiqCustody", label: "عهدة توفيق الداعي" },
  { value: "trainee", label: "كشف مدفوعات المتدربين (من حوافظ التوريد)" },
  { value: "feeTotals", label: "إجماليات الرسوم حسب النوع (من حوافظ التوريد)" },
  { value: "hafiza", label: "حوافظ التوريد" },
  { value: "account", label: "الحساب الجاري" },
  { value: "expenses", label: "المصروفات" },
  { value: "revenue", label: "الإيرادات" },
  { value: "combined", label: "تقرير مالي مجمّع" },
];

const normalizeDate = (value: unknown): Date | null => {
  if (!value) return null;
  const raw = String(value).trim();
  if (!raw) return null;
  const isoMatch = raw.match(/^(\d{4})[-/.](\d{1,2})[-/.](\d{1,2})/);
  if (isoMatch) {
    const [, y, m, d] = isoMatch;
    const date = new Date(Number(y), Number(m) - 1, Number(d));
    return isNaN(date.getTime()) ? null : date;
  }
  const dmyMatch = raw.match(/^(\d{1,2})[-/.](\d{1,2})[-/.](\d{4})/);
  if (dmyMatch) {
    const [, d, m, y] = dmyMatch;
    const date = new Date(Number(y), Number(m) - 1, Number(d));
    return isNaN(date.getTime()) ? null : date;
  }
  const fallback = new Date(raw);
  return isNaN(fallback.getTime()) ? null : fallback;
};

const amountValue = (value: unknown): number => {
  if (typeof value === "number") return isNaN(value) ? 0 : value;
  if (!value) return 0;
  const cleaned = String(value).replace(/,/g, "").trim();
  const num = Number(cleaned);
  return isNaN(num) ? 0 : num;
};

const periodMonths = (period: PeriodType, monthIndex: number): number[] => {
  if (period === "all" || period === "year") return Array.from({ length: 12 }, (_, i) => i);
  if (period === "month") return [monthIndex];
  if (period === "quarter") {
    const start = Math.floor(monthIndex / 3) * 3;
    return [start, start + 1, start + 2];
  }
  return monthIndex < 6 ? [0, 1, 2, 3, 4, 5] : [6, 7, 8, 9, 10, 11];
};

const periodLabel = (period: PeriodType, monthIndex: number, year: number): string => {
  if (period === "all") return `كامل المدة (من 2026 حتى ${year})`;
  if (period === "year") return `سنة ${year}`;
  if (period === "month") return `${MONTHS[monthIndex]} ${year}`;
  if (period === "quarter") return `الربع ${Math.floor(monthIndex / 3) + 1} لعام ${year}`;
  return monthIndex < 6 ? `النصف الأول لعام ${year}` : `النصف الثاني لعام ${year}`;
};

const canonicalFeeCategory = (description?: string): string => {
  const desc = String(description || "").trim();
  if (/انعاش/i.test(desc)) return "انعاش";
  if (/تسجيل/i.test(desc)) return "تسجيل";
  if (/دبلوم/i.test(desc)) return "دبلوم";
  if (/مساق/i.test(desc)) return "مساق";
  if (/تدريب/i.test(desc)) return "تدريب";
  if (/شهادة/i.test(desc)) return "شهادة";
  if (/امتحان/i.test(desc)) return "امتحان";
  return desc || "أخرى";
};

const classifyCustodyRecord = (description?: string): "tawfiq" | "youssef" => {
  const text = String(description || "").trim();
  if (/(عهدة\s*الداعي|توفيق\s*الداعي)/.test(text)) return "tawfiq";
  return "youssef";
};

export const reportsTabPrintCss = `
  #tableContainer table thead th,
  #tableContainer table thead th.desc-cell,
  #tableContainer table thead th[data-col-key="description"] {
    background: #027d11 !important;
    color: #ffffff !important;
    font-weight: 900 !important;
    font-size: 13px !important;
    padding: 5px 3px !important;
    -webkit-print-color-adjust: exact !important;
    print-color-adjust: exact !important;
  }
  #tableContainer table thead th .pdf-cell-text {
    color: #ffffff !important;
    background: transparent !important;
  }
  #tableContainer table tbody td {
    color: #000000 !important;
    font-weight: 800 !important;
    background: #ffffff !important;
    -webkit-print-color-adjust: exact !important;
    print-color-adjust: exact !important;
  }
  #tableContainer table tbody tr.total-row td,
  #tableContainer table tbody tr.report-grand-total-row td,
  #tableContainer table tbody tr[data-summary="total"] td {
    background: #0437bb !important;
    color: #ffffff !important;
    font-weight: 900 !important;
    font-size: 13px !important;
    border-top: 2px solid #000000 !important;
    border-bottom: 2px solid #000000 !important;
    -webkit-print-color-adjust: exact !important;
    print-color-adjust: exact !important;
  }
  #tableContainer table tbody tr.total-row td .pdf-cell-text,
  #tableContainer table tbody tr.report-grand-total-row td .pdf-cell-text,
  #tableContainer table tbody tr[data-summary="total"] td .pdf-cell-text {
    color: #ffffff !important;
  }
  .summary-card-0 td {
    background: #fde68a !important;
    color: #78350f !important;
    border: 1.5px solid #d97706 !important;
    font-weight: 900 !important;
  }
  .summary-card-1 td {
    background: #fecaca !important;
    color: #7f1d1d !important;
    border: 1.5px solid #dc2626 !important;
    font-weight: 900 !important;
  }
  .summary-card-2 td {
    background: #a7f3d0 !important;
    color: #064e3b !important;
    border: 1.5px solid #059669 !important;
    font-weight: 900 !important;
  }
  .summary-card-row td {
    text-align: center !important;
    vertical-align: middle !important;
    font-weight: 900 !important;
    font-size: 13px !important;
    padding: 6px 5px !important;
    -webkit-print-color-adjust: exact !important;
    print-color-adjust: exact !important;
    white-space: nowrap !important;
  }
  .signature-block-row td {
    background: #ffffff !important;
    border: 1.5px solid #000000 !important;
    padding: 14px 18px !important;
    page-break-inside: avoid !important;
    break-inside: avoid !important;
  }
  .signature-block-grid {
    display: flex !important;
    flex-direction: row !important;
    justify-content: space-between !important;
    align-items: flex-start !important;
    width: 100% !important;
    direction: rtl !important;
  }
  .signature-item {
    display: flex !important;
    flex-direction: column !important;
    align-items: center !important;
    text-align: center !important;
    flex: 1 !important;
    padding: 4px 8px !important;
  }
  .sig-title {
    font-family: Cairo, sans-serif !important;
    font-weight: 900 !important;
    font-size: 13px !important;
    color: #000000 !important;
    margin-bottom: 12px !important;
  }
  .sig-name {
    font-family: Cairo, sans-serif !important;
    font-weight: 800 !important;
    font-size: 13px !important;
    color: #000000 !important;
    min-height: 24px !important;
  }
`;

const isHeadRow = (row: ReportRow) => row.summaryLevel === "opening";
const isFootRow = (row: ReportRow) =>
  row.summaryLevel === "total" ||
  row.summaryLevel === "summary-card" ||
  row.summaryLevel === "signature" ||
  row.description === "الإجمالي الكلي" ||
  row.category === "الإجمالي الكلي لجميع الرسوم";
const isPreservedFromColumnFilter = (row: ReportRow) => isHeadRow(row) || isFootRow(row);

const getYearOptions = (dates: unknown[]): number[] => {
  const years = new Set<number>();
  dates.forEach((d) => {
    const parsed = normalizeDate(d);
    if (parsed) years.add(parsed.getFullYear());
  });
  years.add(2026);
  return Array.from(years).sort((a, b) => b - a);
};

export default function ReportsTab() {
  const { hafiza, accounts, expenses } = useStore();
  const year = useFiscalYear((s) => s.year);

  const [source, setSource] = useState<ReportSource>("youssefLoan");
  const [period, setPeriod] = useState<PeriodType>("all");
  const [month, setMonth] = useState<number>(0);

  const [selectedTrainee, setSelectedTrainee] = useState<string>("all");
  const [selectedFee, setSelectedFee] = useState<string>("all");
  const [traineeGrouping, setTraineeGrouping] = useState<TraineeGrouping>("month");
  const [traineeDisplayMode, setTraineeDisplayMode] = useState<TraineeDisplayMode>("both");

  const [traineeSortColumn, setTraineeSortColumn] = useState<string>("notifyDate");
  const [traineeSortDirection, setTraineeSortDirection] = useState<"asc" | "desc">("asc");

  // ====== توقيعات أسماء المدراء (تُحفظ لكل سنة) ======
  const [financeManager, setFinanceManager] = useState<string>(() => {
    try { return localStorage.getItem(`signature_finance_${year}`) || ""; } catch { return ""; }
  });
  const [viceManager, setViceManager] = useState<string>(() => {
    try { return localStorage.getItem(`signature_vice_${year}`) || ""; } catch { return ""; }
  });
  const [presidentManager, setPresidentManager] = useState<string>(() => {
    try { return localStorage.getItem(`signature_president_${year}`) || ""; } catch { return ""; }
  });

  useEffect(() => {
    try {
      setFinanceManager(localStorage.getItem(`signature_finance_${year}`) || "");
      setViceManager(localStorage.getItem(`signature_vice_${year}`) || "");
      setPresidentManager(localStorage.getItem(`signature_president_${year}`) || "");
    } catch {}
  }, [year]);

  useEffect(() => {
    try { localStorage.setItem(`signature_finance_${year}`, financeManager); } catch {}
  }, [financeManager, year]);
  useEffect(() => {
    try { localStorage.setItem(`signature_vice_${year}`, viceManager); } catch {}
  }, [viceManager, year]);
  useEffect(() => {
    try { localStorage.setItem(`signature_president_${year}`, presidentManager); } catch {}
  }, [presidentManager, year]);

  // ====== حفظ الحقول اليدوية لتقارير العهد (رقم كشف التسوية والملاحظات) ======
  const [custodySettlementMap, setCustodySettlementMap] = useState<Record<string, string>>(() => {
    try { return JSON.parse(localStorage.getItem(`custody_settlement_${year}`) || "{}"); } catch { return {}; }
  });
  const [custodyNotesMap, setCustodyNotesMap] = useState<Record<string, string>>(() => {
    try { return JSON.parse(localStorage.getItem(`custody_notes_${year}`) || "{}"); } catch { return {}; }
  });

  useEffect(() => {
    try {
      setCustodySettlementMap(JSON.parse(localStorage.getItem(`custody_settlement_${year}`) || "{}"));
      setCustodyNotesMap(JSON.parse(localStorage.getItem(`custody_notes_${year}`) || "{}"));
    } catch {}
  }, [year]);

  const updateSettlement = (id: string, val: string) => {
    setCustodySettlementMap((prev) => {
      const next = { ...prev, [id]: val };
      try { localStorage.setItem(`custody_settlement_${year}`, JSON.stringify(next)); } catch {}
      return next;
    });
  };

  const updateNotes = (id: string, val: string) => {
    setCustodyNotesMap((prev) => {
      const next = { ...prev, [id]: val };
      try { localStorage.setItem(`custody_notes_${year}`, JSON.stringify(next)); } catch {}
      return next;
    });
  };

  // ====== الحالة العامة للفرز والتصفية والحذف المؤقت ======
  const [sortColumn, setSortColumn] = useState<string>("");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc");
  const [columnFilters, setColumnFilters] = useState<Record<string, string>>({});
  const [deletedRows, setDeletedRows] = useState<Set<ReportRow>>(() => new Set());

  const handleFilterChange = (key: string, value: string) => {
    setColumnFilters((prev) => ({ ...prev, [key]: value }));
  };

  const clearColumnFilter = (key: string) => {
    setColumnFilters((prev) => {
      const next = { ...prev };
      delete next[key];
      return next;
    });
  };

  const toggleSort = (colKey: string) => {
    if (source === "trainee") {
      if (traineeSortColumn === colKey) {
        setTraineeSortDirection((d) => (d === "asc" ? "desc" : "asc"));
      } else {
        setTraineeSortColumn(colKey);
        setTraineeSortDirection("asc");
      }
    } else {
      if (sortColumn === colKey) {
        setSortDirection((d) => (d === "asc" ? "desc" : "asc"));
      } else {
        setSortColumn(colKey);
        setSortDirection("asc");
      }
    }
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

    const result: ReportRow[] = [];
    let sumAmount = 0;

    matched.forEach((row, index) => {
      const rowId = String(row.id || `${row.date}_${row.description}_${index}`);
      const amount = amountValue(row.hafizaAmount);
      sumAmount += amount;

      const docNo = row.checkNo
        ? `شيك: ${row.checkNo}`
        : row.notifyNo
        ? `إشعار: ${row.notifyNo}`
        : row.hafizaNo
        ? `حافظة: ${row.hafizaNo}`
        : "—";

      result.push({
        rawId: rowId,
        date: row.date || "—",
        docNo,
        description: row.description || "عهدة د/ يوسف",
        name: row.name || "د/ يوسف",
        settlementNo: custodySettlementMap[rowId] || "",
        notes: custodyNotesMap[rowId] || "",
        amount,
      });
    });

    result.push({
      date: "—",
      docNo: "—",
      description: "الإجمالي الكلي",
      name: "—",
      settlementNo: "—",
      notes: "—",
      amount: sumAmount,
      summaryLevel: "total",
    });

    return result;
  }, [accounts, period, year, selectedMonthSet, custodySettlementMap, custodyNotesMap]);

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

    const result: ReportRow[] = [];
    let sumAmount = 0;

    matched.forEach((row, index) => {
      const rowId = String(row.id || `${row.date}_${row.description}_${index}`);
      const amount = amountValue(row.hafizaAmount);
      sumAmount += amount;

      const docNo = row.checkNo
        ? `شيك: ${row.checkNo}`
        : row.notifyNo
        ? `إشعار: ${row.notifyNo}`
        : row.hafizaNo
        ? `حافظة: ${row.hafizaNo}`
        : "—";

      result.push({
        rawId: rowId,
        date: row.date || "—",
        docNo,
        description: row.description || "عهدة توفيق الداعي",
        name: row.name || "توفيق الداعي",
        settlementNo: custodySettlementMap[rowId] || "",
        notes: custodyNotesMap[rowId] || "",
        amount,
      });
    });

    result.push({
      date: "—",
      docNo: "—",
      description: "الإجمالي الكلي",
      name: "—",
      settlementNo: "—",
      notes: "—",
      amount: sumAmount,
      summaryLevel: "total",
    });

    return result;
  }, [accounts, period, year, selectedMonthSet, custodySettlementMap, custodyNotesMap]);

  const hafizaRows = useMemo<ReportRow[]>(() => hafiza.filter((row) => inPeriod(row.date)).map((row) => ({
    date: row.date,
    description: row.description || "—",
    name: row.name || "—",
    hafizaNo: row.hafizaNo || "—",
    amount: amountValue(row.amount),
    income: amountValue(row.income)
  })), [hafiza, period, month, year]);

  const accountRows = useMemo<ReportRow[]>(() => accounts.filter((row) => inPeriod(row.date)).map((row) => ({
    date: row.date,
    description: row.description || "—",
    name: row.name || "—",
    income: amountValue(row.income),
    expense: amountValue(row.expense)
  })), [accounts, period, month, year]);

  const expenseRows = useMemo<ReportRow[]>(() => expenses.filter((row) => inPeriod(row.date)).map((row) => ({
    date: row.date,
    item: row.item,
    name: row.name || "—",
    expense: amountValue(row.amount)
  })), [expenses, period, month, year]);

  const revenueRows = useMemo<ReportRow[]>(() => {
    const months = selectedMonths;
    return months.map((monthIndex) => {
      const monthIncome = accounts
        .filter((row) => {
          const date = normalizeDate(row.date);
          return Boolean(date && date.getFullYear() === year && date.getMonth() === monthIndex);
        })
        .reduce((sum, row) => sum + amountValue(row.income), 0);
      return {
        date: `${MONTHS[monthIndex]} ${year}`,
        item: `إيرادات ${MONTHS[monthIndex]}`,
        amount: monthIncome
      };
    });
  }, [accounts, selectedMonths, year]);

  const traineeRows = useMemo<ReportRow[]>(() => {
    const matched = hafiza.filter((row) => {
      const date = normalizeDate(row.notifyDate);
      if (!date || date.getFullYear() < TRAINEE_REPORT_START_YEAR) return false;
      if (amountValue(row.notifyAmount) <= 0) return false;
      const tName = String(row.name || "").trim();
      if (selectedTrainee !== "all" && tName !== selectedTrainee) return false;
      const category = canonicalFeeCategory(row.description);
      if (selectedFee !== "all" && category !== selectedFee) return false;
      return true;
    });

    const detailRows: ReportRow[] = matched.map((row) => {
      const date = normalizeDate(row.notifyDate);
      const rowYear = date ? date.getFullYear() : 0;
      const rowMonth = date ? date.getMonth() : 0;
      return {
        year: rowYear || "—",
        notifyDate: row.notifyDate || "—",
        period: date ? `${MONTHS[rowMonth]} ${rowYear}` : "—",
        trainee: String(row.name || "—").trim(),
        hafizaNo: row.hafizaNo || "—",
        notifyNo: row.notifyNo || "—",
        description: row.description || "—",
        category: canonicalFeeCategory(row.description),
        displayType: "حركة توريد",
        source: "حوافظ التوريد",
        amount: amountValue(row.notifyAmount),
        summaryLevel: "detail",
        _sortKey: date ? date.getTime() : 0,
      };
    });

    if (traineeDisplayMode === "detail") {
      detailRows.sort((a, b) => (Number(a._sortKey) || 0) - (Number(b._sortKey) || 0));
      return detailRows;
    }

    const groups = new Map<string, { year: number; month?: number; amount: number; count: number }>();
    matched.forEach((row) => {
      const date = normalizeDate(row.notifyDate);
      if (!date) return;
      const rowYear = date.getFullYear();
      const rowMonth = date.getMonth();
      const key = traineeGrouping === "month" ? `${rowYear}-${String(rowMonth).padStart(2, "0")}` : `${rowYear}`;
      const prev = groups.get(key) || { year: rowYear, month: rowMonth, amount: 0, count: 0 };
      prev.amount += amountValue(row.notifyAmount);
      prev.count += 1;
      groups.set(key, prev);
    });

    const summaryRows: ReportRow[] = Array.from(groups.entries())
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([key, data]) => ({
        year: data.year,
        notifyDate: traineeGrouping === "month" ? `${MONTHS[data.month ?? 0]} ${data.year}` : `سنة ${data.year}`,
        period: traineeGrouping === "month" ? `${MONTHS[data.month ?? 0]} ${data.year}` : `سنة ${data.year}`,
        trainee: selectedTrainee === "all" ? "جميع المتدربين" : selectedTrainee,
        hafizaNo: "—",
        notifyNo: "—",
        description: `إجمالي ${traineeGrouping === "month" ? `${MONTHS[data.month ?? 0]} ${data.year}` : `سنة ${data.year}`} (${data.count} حركة)`,
        category: selectedFee === "all" ? "كل الرسوم" : selectedFee,
        displayType: traineeGrouping === "month" ? "إجمالي شهري" : "إجمالي سنوي",
        source: "حوافظ التوريد",
        amount: data.amount,
        summaryLevel: traineeGrouping === "month" ? "month-total" : "year-total",
        _groupKey: key,
      }));

    if (traineeDisplayMode === "summary") return summaryRows;

    const combined: ReportRow[] = [];
    const groupsDone = new Set<string>();
    detailRows.sort((a, b) => (Number(a._sortKey) || 0) - (Number(b._sortKey) || 0));

    detailRows.forEach((row) => {
      const d = normalizeDate(row.notifyDate);
      const key = d ? (traineeGrouping === "month" ? `${d.getFullYear()}-${String(d.getMonth()).padStart(2, "0")}` : `${d.getFullYear()}`) : "";
      combined.push(row);
      if (key && !groupsDone.has(key)) {
        const sumRow = summaryRows.find((s) => s._groupKey === key);
        if (sumRow) {
          combined.push(sumRow);
          groupsDone.add(key);
        }
      }
    });

    return combined;
  }, [hafiza, selectedTrainee, selectedFee, traineeGrouping, traineeDisplayMode]);

  const feeTotalsRows = useMemo<ReportRow[]>(() => {
    const feeTotals = new Map<string, number>();
    hafiza.forEach((row) => {
      const date = normalizeDate(row.notifyDate);
      if (!date || date.getFullYear() < TRAINEE_REPORT_START_YEAR) return;
      const amount = amountValue(row.notifyAmount);
      if (amount <= 0) return;
      const tName = String(row.name || "").trim();
      if (selectedTrainee !== "all" && tName !== selectedTrainee) return;
      const category = canonicalFeeCategory(row.description);
      feeTotals.set(category, (feeTotals.get(category) || 0) + amount);
    });
    const rows = Array.from(feeTotals.entries())
      .sort((a, b) => b[1] - a[1])
      .map(([category, amount]) => ({ category, source: "حوافظ التوريد", amount }));
    const grandTotal = rows.reduce((sum, row) => sum + amountValue(row.amount), 0);
    return grandTotal > 0 ? [...rows, { category: "الإجمالي الكلي لجميع الرسوم", source: "حوافظ التوريد", amount: grandTotal, total: "نعم" }] : rows;
  }, [hafiza, selectedTrainee]);

  const sourceConfig = useMemo(() => {
    if (source === "youssefLoan") {
      return {
        title: "مسير اخلاء عهدة د/ يوسف المداني",
        columns: [
          { key: "date", label: "التاريخ" },
          { key: "docNo", label: "رقم المستند / الشيك" },
          { key: "description", label: "البيان" },
          { key: "name", label: "الاسم" },
          { key: "settlementNo", label: "رقم كشف التسوية" },
          { key: "notes", label: "ملاحظات" },
          { key: "amount", label: "المبلغ" },
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
          { key: "settlementNo", label: "رقم كشف التسوية" },
          { key: "notes", label: "ملاحظات" },
          { key: "amount", label: "المبلغ" },
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

  // ====== الصفوف المعالجة (تصفية + فرز + حذف مؤقت) ======
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

    const headRows: ReportRow[] = [];
    const bodyRows: ReportRow[] = [];
    const footRows: ReportRow[] = [];
    filtered.forEach((row) => {
      if (isHeadRow(row)) headRows.push(row);
      else if (isFootRow(row)) footRows.push(row);
      else bodyRows.push(row);
    });

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

    return [...headRows, ...bodyRows, ...footRows];
  }, [reportRows, columnFilters, sortColumn, sortDirection, source, traineeSortColumn, traineeSortDirection, deletedRows]);

  const title = source === "trainee"
    ? `كشف مدفوعات ${selectedTrainee === "all" ? "جميع المتدربين" : selectedTrainee} — ${selectedFee === "all" ? "كل الرسوم" : selectedFee} — ${traineeDisplayMode === "detail" ? "تفصيلي" : traineeDisplayMode === "summary" ? "إجمالي" : "تفصيلي وإجمالي"} — تجميع ${traineeGrouping === "month" ? "شهري" : "سنوي"}`
    : source === "feeTotals"
    ? `إجماليات الرسوم حسب النوع — ${selectedTrainee === "all" ? "جميع المتدربين" : selectedTrainee} — من ${TRAINEE_REPORT_START_YEAR}`
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
      : source === "feeTotals"
      ? ["amount"]
      : ["income", "expense", "amount"];

  const isLoanOrCustody = source === "youssefLoan" || source === "tawfiqCustody";

  const displayRows = useMemo(
    () => processedRows.filter((row) => row.summaryLevel !== "summary-card" && row.summaryLevel !== "signature"),
    [processedRows]
  );

  // صفوف الطباعة وPDF مع إرفاق بيانات التوقيعات الثلاثة لتقارير العهد
  const pdfRows = useMemo<ReportRow[]>(() => {
    const base = processedRows.filter(
      (row) => row.summaryLevel !== "summary-card" && row.summaryLevel !== "signature"
    );
    if (!isLoanOrCustody) return base;

    const sigRow: ReportRow = {
      summaryLevel: "signature",
      signature: true,
      __signatureFinance: financeManager,
      __signatureVice: viceManager,
      __signaturePresident: presidentManager,
      date: "الشؤون المالية",
      settlementNo: "نائب رئيس المجلس",
      amount: "رئيس المجلس اليمني للاختصاصات الطبية - فرع / صعدة",
    };

    return [...base, sigRow];
  }, [processedRows, isLoanOrCustody, financeManager, viceManager, presidentManager]);

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
              {SOURCES.map((item) => (
                <option key={item.value} value={item.value}>{item.label}</option>
              ))}
            </select>
          </label>

          {source !== "trainee" && source !== "feeTotals" && (
            <>
              <label className="flex flex-col gap-1 text-xs font-black text-slate-700">
                الفترة
                <select
                  value={period}
                  onChange={(event) => setPeriod(event.target.value as PeriodType)}
                  className="rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm font-bold outline-none focus:border-sky-600"
                >
                  {PERIODS.map((item) => (
                    <option key={item.value} value={item.value}>{item.label}</option>
                  ))}
                </select>
              </label>

              {(period === "month" || period === "quarter" || period === "half") && (
                <label className="flex flex-col gap-1 text-xs font-black text-slate-700">
                  الشهر / الفترة
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
            rows={pdfRows}
            columns={sourceConfig.columns}
            fileName={
              source === "youssefLoan"
                ? `مسير اخلاء-عهدة-د-يوسف-${year}`
                : source === "tawfiqCustody"
                ? `مسير اخلاء-عهدة-توفيق-الداعي-${year}`
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

        {/* الجدول المعروض */}
        <div className="overflow-x-auto" id="tableContainer">
          <table className="w-full text-center text-xs sm:text-sm">
            <thead>
              <tr className="bg-[#174258] text-white">
                <th className="w-12 border border-slate-700 px-2 py-3 font-black">م</th>
                {sourceConfig.columns.map((column) => (
                  <th
                    key={column.key}
                    onClick={() => toggleSort(column.key)}
                    className="cursor-pointer border border-slate-700 px-3 py-3 font-black select-none hover:bg-white/10"
                    title="اضغط للفرز"
                  >
                    <div className="flex items-center justify-center gap-1">
                      <span>{column.label}</span>
                      {activeSortColumn === column.key && (
                        <span>{activeSortDirection === "asc" ? "▲" : "▼"}</span>
                      )}
                    </div>
                  </th>
                ))}
                <th className="w-12 border border-slate-700 px-2 py-3 font-black print:hidden">حذف</th>
              </tr>

              {/* صف خانات التصفية */}
              <tr className="bg-slate-100 text-slate-700 print:hidden">
                <th className="border border-slate-300 p-1"></th>
                {sourceConfig.columns.map((column) => (
                  <th key={column.key} className="border border-slate-300 p-1">
                    <div className="relative">
                      <input
                        type="text"
                        value={columnFilters[column.key] || ""}
                        onChange={(e) => handleFilterChange(column.key, e.target.value)}
                        placeholder="تصفية..."
                        className="w-full rounded border border-slate-300 bg-white px-2 py-1 text-center text-xs font-semibold outline-none focus:border-sky-600"
                      />
                      {columnFilters[column.key] && (
                        <button
                          onClick={() => clearColumnFilter(column.key)}
                          className="absolute left-1 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700"
                        >
                          ✕
                        </button>
                      )}
                    </div>
                  </th>
                ))}
                <th className="border border-slate-300 p-1"></th>
              </tr>
            </thead>
            <tbody>
              {displayRows.length === 0 ? (
                <tr>
                  <td colSpan={colCount} className="p-8 text-center text-slate-400 font-bold">
                    لا توجد بيانات مطابقة للفترة المحددة
                  </td>
                </tr>
              ) : (
                <>
                  {displayRows.map((row, index) => {
                    const isTotal = row.summaryLevel === "total" || row.description === "الإجمالي الكلي" || row.category === "الإجمالي الكلي لجميع الرسوم";
                    const isOpening = row.summaryLevel === "opening";
                    const isSubtotal = row.summaryLevel === "month-total" || row.summaryLevel === "year-total";

                    let rowStyle = "bg-white hover:bg-sky-50/50";
                    if (isTotal) {
                      rowStyle = "bg-[#0437bb] text-white font-black";
                    } else if (isOpening) {
                      rowStyle = "bg-amber-100/90 text-amber-950 font-black";
                    } else if (isSubtotal) {
                      rowStyle = "bg-sky-100 text-sky-950 font-black";
                    } else if (index % 2 === 1) {
                      rowStyle = "bg-slate-50 hover:bg-sky-50/50";
                    }

                    return (
                      <tr
                        key={index}
                        className={`transition-colors ${rowStyle} ${isTotal ? "total-row" : ""}`}
                        data-summary={isTotal ? "total" : undefined}
                      >
                        <td className={`border px-2 py-2 font-bold ${isTotal ? "border-blue-900 text-white font-black" : "border-slate-200 text-slate-800"}`}>
                          {isTotal ? "★" : index + 1}
                        </td>
                        {sourceConfig.columns.map((column) => {
                          const val = row[column.key];
                          const isNum = numericKeys.includes(column.key);
                          const rowId = String(row.rawId || `${row.date}_${index}`);

                          // حقل إدخال رقم كشف التسوية يدوياً
                          if (isLoanOrCustody && !isTotal && column.key === "settlementNo") {
                            return (
                              <td key={column.key} className="border border-slate-200 px-1.5 py-1 text-center">
                                <input
                                  type="text"
                                  value={custodySettlementMap[rowId] || ""}
                                  onChange={(e) => updateSettlement(rowId, e.target.value)}
                                  placeholder="رقم الكشف..."
                                  className="w-full min-w-[90px] rounded border border-slate-200 bg-white px-2 py-1 text-center text-xs font-bold text-slate-800 outline-none focus:border-sky-600 print:hidden"
                                />
                                <span className="hidden print:inline">{custodySettlementMap[rowId] || "—"}</span>
                              </td>
                            );
                          }

                          // حقل إدخال الملاحظات يدوياً
                          if (isLoanOrCustody && !isTotal && column.key === "notes") {
                            return (
                              <td key={column.key} className="border border-slate-200 px-1.5 py-1 text-right">
                                <input
                                  type="text"
                                  value={custodyNotesMap[rowId] || ""}
                                  onChange={(e) => updateNotes(rowId, e.target.value)}
                                  placeholder="ملاحظات..."
                                  className="w-full min-w-[120px] rounded border border-slate-200 bg-white px-2 py-1 text-right text-xs font-semibold text-slate-800 outline-none focus:border-sky-600 print:hidden"
                                />
                                <span className="hidden print:inline">{custodyNotesMap[rowId] || "—"}</span>
                              </td>
                            );
                          }

                          return (
                            <td
                              key={column.key}
                              className={`border px-3 py-2 font-semibold ${
                                isTotal ? "border-blue-900 text-white font-black" : "border-slate-200 text-slate-900"
                              } ${isNum ? "font-mono text-center" : ""}`}
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
                </>
              )}
            </tbody>
          </table>
        </div>

        {/* قسم التوقيعات الثلاثة لتقارير العهد */}
        {isLoanOrCustody && (
          <div
            className="border-t-2 border-slate-300 bg-slate-50 p-4 sm:p-6"
            dir="rtl"
          >
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-3">
              {/* يمين: الشؤون المالية */}
              <div className="flex flex-col items-center gap-2 text-center">
                <div className="text-xs sm:text-sm font-black text-slate-800">
                  الشؤون المالية
                </div>
                <input
                  type="text"
                  value={financeManager}
                  onChange={(e) => setFinanceManager(e.target.value)}
                  placeholder="اسم المدير المالي"
                  className="w-full max-w-[340px] rounded-lg border border-slate-300 bg-white px-3 py-2 text-center text-xs sm:text-sm font-bold text-slate-900 outline-none focus:border-sky-600 print:border-0 print:bg-transparent print:p-0 print:shadow-none"
                />
              </div>

              {/* وسط: نائب رئيس المجلس */}
              <div className="flex flex-col items-center gap-2 text-center">
                <div className="text-xs sm:text-sm font-black text-slate-800">
                  نائب رئيس المجلس
                </div>
                <input
                  type="text"
                  value={viceManager}
                  onChange={(e) => setViceManager(e.target.value)}
                  placeholder="اسم نائب رئيس المجلس"
                  className="w-full max-w-[240px] rounded-lg border border-slate-300 bg-white px-3 py-2 text-center text-xs sm:text-sm font-bold text-slate-900 outline-none focus:border-sky-600 print:border-0 print:bg-transparent print:p-0 print:shadow-none"
                />
              </div>

              {/* يسار: رئيس المجلس اليمني للاختصاصات الطبية - فرع / صعدة */}
              <div className="flex flex-col items-center gap-2 text-center">
                <div className="text-xs sm:text-sm font-black text-slate-800 leading-relaxed">
                  رئيس المجلس اليمني للاختصاصات الطبية - فرع / صعدة
                </div>
                <input
                  type="text"
                  value={presidentManager}
                  onChange={(e) => setPresidentManager(e.target.value)}
                  placeholder="اسم رئيس المجلس"
                  className="w-full max-w-[240px] rounded-lg border border-slate-300 bg-white px-3 py-2 text-center text-xs sm:text-sm font-bold text-slate-900 outline-none focus:border-sky-600 print:border-0 print:bg-transparent print:p-0 print:shadow-none"
                />
              </div>
            </div>
          </div>
        )}
      </section>
    </div>
  );
}
