import React, { useMemo, useState, useEffect } from "react";
import {
  FileSpreadsheet,
  Calendar,
  Layers,
  ChevronDown,
  ChevronUp,
  Download,
  Printer,
  CalendarDays,
  Trash2,
  Undo2,
  DollarSign,
  TrendingUp,
  CreditCard,
  Building,
  GraduationCap,
  Sparkles,
  BarChart3,
  UserRound,
  Filter,
  Wallet,
} from "lucide-react";
import TabActions from "./TabActions";
import { useStore } from "@/lib/store";
import { useFiscalYear } from "@/lib/fiscalYear";
import { formatCurrency } from "@/lib/reportPdf";

type ReportPeriod = "all" | "year" | "month" | "range";

type ReportSource =
  | "youssefLoan"
  | "tawfiqCustody"
  | "account"
  | "hafiza"
  | "expenses"
  | "revenue"
  | "combined";

const PERIODS: Array<{ value: ReportPeriod; label: string }> = [
  { value: "all", label: "الكل" },
  { value: "year", label: "سنوي" },
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
];

const MONTHS = [
  { value: 1, label: "يناير" },
  { value: 2, label: "فبراير" },
  { value: 3, label: "مارس" },
  { value: 4, label: "أبريل" },
  { value: 5, label: "مايو" },
  { value: 6, label: "يونيو" },
  { value: 7, label: "يوليو" },
  { value: 8, label: "أغسطس" },
  { value: 9, label: "سبتمبر" },
  { value: 10, label: "أكتوبر" },
  { value: 11, label: "نوفمبر" },
  { value: 12, label: "ديسمبر" },
];

export interface ReportRow {
  id?: string;
  date?: string;
  description?: string;
  trainee?: string;
  name?: string;
  specialty?: string;
  year?: string;
  amount?: number;
  income?: number;
  expense?: number;
  hafizaAmount?: number;
  hafizaNo?: string;
  docNo?: string;
  bank?: string;
  source?: string;
  summaryLevel?: "opening" | "total" | "fee" | "trainee-name-total" | "period" | "signature";
  item?: string;
  settlementNo?: string;
  notes?: string;
}

const amountValue = (val: unknown): number => {
  if (typeof val === "number") return Number.isFinite(val) ? val : 0;
  if (!val) return 0;
  const cleaned = String(val).replace(/,/g, "").trim();
  const n = parseFloat(cleaned);
  return Number.isFinite(n) ? n : 0;
};

const normalizeDate = (raw?: string | null): Date | null => {
  if (!raw) return null;
  const trimmed = String(raw).trim();
  if (!trimmed) return null;
  const parts = trimmed.split(/[-/]/);
  if (parts.length === 3) {
    if (parts[0].length === 4) {
      const d = new Date(Number(parts[0]), Number(parts[1]) - 1, Number(parts[2]));
      if (!isNaN(d.getTime())) return d;
    } else if (parts[2].length === 4) {
      const d = new Date(Number(parts[2]), Number(parts[1]) - 1, Number(parts[0]));
      if (!isNaN(d.getTime())) return d;
    }
  }
  const fallback = new Date(trimmed);
  return isNaN(fallback.getTime()) ? null : fallback;
};

const classifyCustodyRecord = (description: unknown): "youssef" | "tawfiq" | "other" => {
  const text = String(description || "").trim();
  if (!text) return "other";
  if (/(عهدة\s*الداعي|توفيق\s*الداعي)/.test(text)) return "tawfiq";
  if (/(عهدة\s*د\s*\/?\s*يوسف|العهدة|عهدة)/.test(text)) return "youssef";
  return "other";
};

/* ====== تصنيف الصفوف (بنية الجدول) ====== */
const isHeadRow = (row: ReportRow) => row.summaryLevel === "opening";
const isFootRow = (row: ReportRow) =>
  row.summaryLevel === "total" ||
  row.summaryLevel === "fee" ||
  row.summaryLevel === "trainee-name-total" ||
  row.summaryLevel === "signature";

const isPreservedFromColumnFilter = (row: ReportRow) =>
  row.summaryLevel === "opening" ||
  row.summaryLevel === "total" ||
  row.summaryLevel === "fee" ||
  row.summaryLevel === "signature";

// أنماط الطباعة
const reportsTabPrintCss = `
  .reports-data-table thead th,
  .reports-data-table thead th * {
    background-color: #027d11 !important;
    background: #027d11 !important;
    color: #ffffff !important;
    font-weight: 900 !important;
    border-color: #000000 !important;
    -webkit-print-color-adjust: exact !important;
    print-color-adjust: exact !important;
  }

  .reports-data-table tbody td.desc-cell,
  .reports-data-table tbody td[data-col-key="description"],
  .reports-data-table tbody td[data-col-key="item"] {
    color: #174258 !important;
    font-weight: 800 !important;
  }

  .reports-data-table tbody tr.total-row,
  .reports-data-table tbody tr.total-row td,
  .reports-data-table tbody tr.total-row td * {
    background-color: #0437bb !important;
    background: #0437bb !important;
    color: #ffffff !important;
    font-weight: 900 !important;
    border-color: #000000 !important;
    -webkit-print-color-adjust: exact !important;
    print-color-adjust: exact !important;
  }

  .custody-card-opening {
    background: #fde68a !important;
    color: #78350f !important;
    border: 1px solid #d97706 !important;
  }
  .custody-card-spent {
    background: #fecaca !important;
    color: #7f1d1d !important;
    border: 1px solid #dc2626 !important;
  }
  .custody-card-remaining {
    background: #a7f3d0 !important;
    color: #064e3b !important;
    border: 1px solid #059669 !important;
  }

  .signature-block-row td {
    background: #ffffff !important;
    border: 1.5px solid #000000 !important;
    padding: 14px 18px !important;
    page-break-inside: avoid !important;
    break-inside: avoid !important;
  }
  .signature-block-grid {
    display: grid !important;
    grid-template-columns: repeat(3, minmax(0, 1fr)) !important;
    gap: 6px 12px !important;
    width: 100% !important;
    min-width: 0 !important;
    text-align: center !important;
  }
  .sig-title {
    font-size: 13px !important;
    font-weight: 900 !important;
    color: #000000 !important;
    margin-bottom: 8px !important;
  }
  .sig-name {
    font-size: 13px !important;
    font-weight: 800 !important;
    color: #000000 !important;
  }
`;

export default function ReportsTab() {
  const { year } = useFiscalYear();
  const { hafiza, accounts } = useStore();

  const [period, setPeriod] = useState<ReportPeriod>("all");
  const [selectedMonths, setSelectedMonths] = useState<number[]>([]);
  const [source, setSource] = useState<ReportSource>("youssefLoan");

  const [traineeSortColumn, setTraineeSortColumn] = useState<string>("date");
  const [traineeSortDirection, setTraineeSortDirection] = useState<"asc" | "desc">("asc");

  // الرصيد الافتتاحي لسلفة د/يوسف
  const [youssefOpeningBalance, setYoussefOpeningBalance] = useState<number>(() => {
    try {
      const saved = localStorage.getItem(`youssef_loan_opening_balance_${year}`);
      return saved !== null ? Number(saved) || 0 : 0;
    } catch {
      return 0;
    }
  });

  // الرصيد الافتتاحي لعهدة توفيق الداعي
  const [tawfiqOpeningBalance, setTawfiqOpeningBalance] = useState<number>(() => {
    try {
      const saved = localStorage.getItem(`tawfiq_custody_opening_balance_${year}`);
      return saved !== null ? Number(saved) || 0 : 0;
    } catch {
      return 0;
    }
  });

  const [columnFilters, setColumnFilters] = useState<Record<string, string>>({});
  const [sortColumn, setSortColumn] = useState<string>("");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc");
  const [deletedRows, setDeletedRows] = useState<Set<ReportRow>>(() => new Set());

  // حفظ القيم اليدوية لأعمدة رقم كشف التسوية والملاحظات والمبلغ محلياً
  const [loanManualData, setLoanManualData] = useState<Record<string, { settlementNo?: string; notes?: string; amount?: number }>>(() => {
    try {
      const saved = localStorage.getItem("reports-loan-manual-data-v1");
      return saved ? JSON.parse(saved) : {};
    } catch {
      return {};
    }
  });

  // حالة لتخزين مسميات الإدارات والمدراء لصفوف التوقيعات يدوياً مع الحفظ التلقائي
  const [signaturesMeta, setSignaturesMeta] = useState(() => {
    try {
      const saved = localStorage.getItem("reports-custody-signatures-meta-v1");
      if (saved) return JSON.parse(saved);
    } catch {}
    return {
      sig1Dept: "الشؤون المالية",
      sig1Name: "أ. ___________________",
      sig2Dept: "نائب رئيس المجلس",
      sig2Name: "أ. ___________________",
      sig3Dept: "رئيس المجلس اليمني للاختصاصات الطبية - فرع / صعدة",
      sig3Name: "د. ___________________",
    };
  });

  useEffect(() => {
    setColumnFilters({});
    setSortColumn("");
    setSortDirection("asc");
    setDeletedRows(new Set());
  }, [source]);

  useEffect(() => {
    try {
      localStorage.setItem("reports-loan-manual-data-v1", JSON.stringify(loanManualData));
    } catch (error) {
      console.error("تعذر حفظ بيانات أعمدة تقارير العهد محلياً:", error);
    }
  }, [loanManualData]);

  // حفظ بيانات التوقيعات تلقائياً عند أي تعديل
  useEffect(() => {
    try {
      localStorage.setItem("reports-custody-signatures-meta-v1", JSON.stringify(signaturesMeta));
    } catch (error) {
      console.error("تعذر حفظ مسميات وأسماء التوقيعات محلياً:", error);
    }
  }, [signaturesMeta]);

  const selectedMonthSet = useMemo(() => new Set(selectedMonths), [selectedMonths]);

  const inPeriod = (dateStr?: string | null): boolean => {
    if (!dateStr) return false;
    const d = normalizeDate(dateStr);
    if (!d) return false;
    if (period === "all") return true;
    if (period === "year") return d.getFullYear() === Number(year);
    if (period === "month") {
      if (d.getFullYear() !== Number(year)) return false;
      if (selectedMonthSet.size === 0) return true;
      return selectedMonthSet.has(d.getMonth() + 1);
    }
    return true;
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

    result.push({
      id: "y-opening",
      date: "2026-01-01",
      docNo: "افتتاحي",
      description: "الرصيد الافتتاحي للعهدة",
      name: "د/ يوسف",
      settlementNo: "—",
      notes: "رصيد افتتاحي للعهدة",
      amount: youssefOpeningBalance,
      summaryLevel: "opening",
    });

    let sumAmount = 0;

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

    result.push({
      id: "t-opening",
      date: "2026-01-01",
      docNo: "افتتاحي",
      description: "الرصيد الافتتاحي للعهدة",
      name: "توفيق الداعي",
      settlementNo: "—",
      notes: "رصيد افتتاحي للعهدة",
      amount: tawfiqOpeningBalance,
      summaryLevel: "opening",
    });

    let sumAmount = 0;

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

  const hafizaRows = useMemo<ReportRow[]>(() => hafiza.filter((row) => inPeriod(row.date)).map((row) => ({
    date: row.date,
    description: row.description || "—",
    name: row.name || "—",
    hafizaNo: row.hafizaNo || "—",
    amount: amountValue(row.hafizaAmount),
    income: amountValue(row.income ?? row.notifyAmount)
  })), [hafiza, year, selectedMonthSet, period]);

  const accountRows = useMemo<ReportRow[]>(() => accounts.filter((row) => inPeriod(row.date)).map((row) => ({
    date: row.date,
    description: row.description || "—",
    name: row.name || "—",
    income: amountValue(row.income || row.hafizaAmount),
    expense: amountValue(row.expense),
    bank: row.bank || "—",
    docNo: row.checkNo ? `شيك: ${row.checkNo}` : row.notifyNo ? `إشعار: ${row.notifyNo}` : row.hafizaNo ? `حافظة: ${row.hafizaNo}` : "—"
  })), [accounts, year, selectedMonthSet, period]);

  const expensesRows = useMemo<ReportRow[]>(() => accountRows.filter((row) => Number(row.expense) > 0).map((row) => ({
    date: row.date,
    item: row.description,
    name: row.name || "—",
    expense: amountValue(row.expense)
  })), [accountRows]);

  const revenueRows = useMemo<ReportRow[]>(() => accountRows.filter((row) => Number(row.income) > 0).map((row) => ({
    date: row.date,
    item: row.description,
    name: row.name || "—",
    income: amountValue(row.income)
  })), [accountRows]);

  const combinedRows = useMemo<ReportRow[]>(() => [
    ...hafizaRows.map((r) => ({ ...r, source: "حوافظ التوريد" })),
    ...accountRows.map((r) => ({ ...r, source: "الحساب الجاري" })),
  ], [hafizaRows, accountRows]);

  const sourceConfig = useMemo(() => {
    switch (source) {
      case "youssefLoan":
      case "tawfiqCustody":
        return {
          title: source === "youssefLoan" ? "تقرير سلفة د/يوسف" : "تقرير عهدة توفيق الداعي",
          rows: source === "youssefLoan" ? youssefRows : tawfiqRows,
          columns: [
            { key: "date", label: "التاريخ" },
            { key: "docNo", label: "رقم المستند / الشيك" },
            { key: "description", label: "البيان" },
            { key: "name", label: "الاسم" },
            { key: "settlementNo", label: "رقم كشف التسوية" },
            { key: "notes", label: "ملاحظات" },
            { key: "amount", label: "المبلغ" },
          ],
        };
      case "account":
        return {
          title: "تقرير الحساب الجاري",
          rows: accountRows,
          columns: [
            { key: "date", label: "التاريخ" },
            { key: "description", label: "البيان" },
            { key: "name", label: "الاسم" },
            { key: "docNo", label: "رقم المستند" },
            { key: "bank", label: "البنك" },
            { key: "income", label: "المقبوضات" },
            { key: "expense", label: "المدفوعات" },
          ],
        };
      case "hafiza":
        return {
          title: "تقرير حوافظ التوريد",
          rows: hafizaRows,
          columns: [
            { key: "date", label: "التاريخ" },
            { key: "hafizaNo", label: "رقم الحافظة" },
            { key: "description", label: "البيان" },
            { key: "name", label: "الاسم" },
            { key: "amount", label: "مبلغ الحافظة" },
            { key: "income", label: "المبلغ المورّد" },
          ],
        };
      case "expenses":
        return {
          title: "تقرير المصروفات",
          rows: expensesRows,
          columns: [
            { key: "date", label: "التاريخ" },
            { key: "item", label: "بند الصرف" },
            { key: "name", label: "المستفيد" },
            { key: "expense", label: "المبلغ المنصرف" },
          ],
        };
      case "revenue":
        return {
          title: "تقرير الإيرادات",
          rows: revenueRows,
          columns: [
            { key: "date", label: "التاريخ" },
            { key: "item", label: "بند الإيراد" },
            { key: "name", label: "المودع" },
            { key: "income", label: "المبلغ المحصل" },
          ],
        };
      case "combined":
      default:
        return {
          title: "التقرير المجمّع",
          rows: combinedRows,
          columns: [
            { key: "source", label: "المصدر" },
            { key: "date", label: "التاريخ" },
            { key: "description", label: "البيان" },
            { key: "name", label: "الاسم" },
            { key: "income", label: "المقبوضات" },
            { key: "expense", label: "المدفوعات" },
          ],
        };
    }
  }, [source, youssefRows, tawfiqRows, accountRows, hafizaRows, expensesRows, revenueRows, combinedRows]);

  const { title, rows: baseRows, columns } = sourceConfig;

  const totalSpent = useMemo(() => {
    if (source === "youssefLoan") {
      return youssefRows
        .filter((r) => !isHeadRow(r) && !isFootRow(r))
        .reduce((sum, r) => sum + (Number(r.amount) || 0), 0);
    }
    if (source === "tawfiqCustody") {
      return tawfiqRows
        .filter((r) => !isHeadRow(r) && !isFootRow(r))
        .reduce((sum, r) => sum + (Number(r.amount) || 0), 0);
    }
    return 0;
  }, [source, youssefRows, tawfiqRows]);

  const currentOpeningBalance = source === "youssefLoan" ? youssefOpeningBalance : tawfiqOpeningBalance;
  const remainingBalance = currentOpeningBalance - totalSpent;

  const processedRows = useMemo(() => {
    let list = baseRows.filter((row) => !deletedRows.has(row));

    const activeFilterEntries = Object.entries(columnFilters).filter(
      ([, val]) => val !== undefined && val.trim() !== ""
    );

    if (activeFilterEntries.length > 0) {
      list = list.filter((row) => {
        if (isPreservedFromColumnFilter(row)) return true;
        return activeFilterEntries.every(([colKey, filterVal]) => {
          const rowVal = row[colKey as keyof ReportRow];
          if (rowVal === undefined || rowVal === null) return false;
          return String(rowVal).toLowerCase().includes(filterVal.toLowerCase().trim());
        });
      });
    }

    if (sortColumn) {
      const headRows = list.filter(isHeadRow);
      const footRows = list.filter(isFootRow);
      const dataRows = list.filter((r) => !isHeadRow(r) && !isFootRow(r));

      dataRows.sort((a, b) => {
        const valA = a[sortColumn as keyof ReportRow];
        const valB = b[sortColumn as keyof ReportRow];

        if (typeof valA === "number" && typeof valB === "number") {
          return sortDirection === "asc" ? valA - valB : valB - valA;
        }

        const strA = String(valA || "");
        const strB = String(valB || "");
        const cmp = strA.localeCompare(strB, "ar", { numeric: true });
        return sortDirection === "asc" ? cmp : -cmp;
      });

      list = [...headRows, ...dataRows, ...footRows];
    }

    return list;
  }, [baseRows, deletedRows, columnFilters, sortColumn, sortDirection]);

  const hasAnyFilter = Object.values(columnFilters).some((v) => v.trim() !== "");

  const handleSort = (colKey: string) => {
    if (sortColumn === colKey) {
      if (sortDirection === "asc") setSortDirection("desc");
      else {
        setSortColumn("");
        setSortDirection("asc");
      }
    } else {
      setSortColumn(colKey);
      setSortDirection("asc");
    }
  };

  const handleFilterChange = (colKey: string, value: string) => {
    setColumnFilters((prev) => ({ ...prev, [colKey]: value }));
  };

  const clearAllFilters = () => setColumnFilters({});

  const deleteRow = (row: ReportRow) => {
    setDeletedRows((prev) => new Set([...prev, row]));
  };

  const restoreDeleted = () => setDeletedRows(new Set());

  const numericKeys =
    source === "youssefLoan" || source === "tawfiqCustody"
      ? ["amount"]
      : source === "trainee" || source === "feeTotals"
      ? ["amount"]
      : ["income", "expense", "amount"];

  const isLoanOrCustody = source === "youssefLoan" || source === "tawfiqCustody";
  const actionRows = isLoanOrCustody ? processedRows.filter((row) => row.summaryLevel !== "opening" && row.summaryLevel !== "total") : processedRows;

  const displayRows = useMemo(() => processedRows, [processedRows]);

  const activeSortColumn = source === "trainee" ? traineeSortColumn : sortColumn;
  const activeSortDirection = source === "trainee" ? traineeSortDirection : sortDirection;

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

        {/* بطاقات المؤشرات والملخص للعهد */}
        {isLoanOrCustody && (
          <div className="grid grid-cols-1 gap-3 p-4 sm:grid-cols-3">
            <div className="flex items-center justify-between rounded-2xl border border-amber-300 bg-amber-50/70 p-4 shadow-sm">
              <div>
                <span className="text-xs font-bold text-amber-800">الرصيد الافتتاحي</span>
                <div className="mt-1 flex items-center gap-1">
                  <input
                    type="number"
                    value={currentOpeningBalance || ""}
                    onChange={(e) => {
                      const val = Number(e.target.value) || 0;
                      if (source === "youssefLoan") {
                        setYoussefOpeningBalance(val);
                        localStorage.setItem(`youssef_loan_opening_balance_${year}`, String(val));
                      } else {
                        setTawfiqOpeningBalance(val);
                        localStorage.setItem(`tawfiq_custody_opening_balance_${year}`, String(val));
                      }
                    }}
                    placeholder="0"
                    className="w-32 rounded-lg border border-amber-300 bg-white px-2 py-1 text-base font-black text-amber-950 focus:outline-none focus:ring-2 focus:ring-amber-500"
                  />
                  <span className="text-xs font-bold text-amber-700">ريال</span>
                </div>
              </div>
              <span className="grid h-10 w-10 place-items-center rounded-xl bg-amber-200/60 text-amber-800">
                <DollarSign className="h-5 w-5" />
              </span>
            </div>

            <div className="flex items-center justify-between rounded-2xl border border-rose-300 bg-rose-50/70 p-4 shadow-sm">
              <div>
                <span className="text-xs font-bold text-rose-800">إجمالي المنصرف (المسير)</span>
                <p className="mt-1 text-lg font-black text-rose-950">
                  {formatCurrency(totalSpent)} <span className="text-xs">ريال</span>
                </p>
              </div>
              <span className="grid h-10 w-10 place-items-center rounded-xl bg-rose-200/60 text-rose-800">
                <TrendingUp className="h-5 w-5" />
              </span>
            </div>

            <div className="flex items-center justify-between rounded-2xl border border-emerald-300 bg-emerald-50/70 p-4 shadow-sm">
              <div>
                <span className="text-xs font-bold text-emerald-800">الرصيد المتبقي</span>
                <p className={`mt-1 text-lg font-black ${remainingBalance < 0 ? "text-rose-600" : "text-emerald-950"}`}>
                  {formatCurrency(remainingBalance)} <span className="text-xs">ريال</span>
                </p>
              </div>
              <span className="grid h-10 w-10 place-items-center rounded-xl bg-emerald-200/60 text-emerald-800">
                <Wallet className="h-5 w-5" />
              </span>
            </div>
          </div>
        )}

        {/* عناصر التحكم والتصفية */}
        <div className="border-b border-slate-200 p-4 sm:p-6">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <div>
              <label className="mb-1 block text-xs font-bold text-slate-700">مصدر التقرير</label>
              <select
                value={source}
                onChange={(e) => setSource(e.target.value as ReportSource)}
                className="w-full rounded-xl border border-slate-300 bg-white p-2.5 text-xs font-bold text-slate-800 shadow-sm focus:border-sky-500 focus:outline-none"
              >
                {SOURCES.map((s) => (
                  <option key={s.value} value={s.value}>
                    {s.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="mb-1 block text-xs font-bold text-slate-700">الفترة الزمنية</label>
              <select
                value={period}
                onChange={(e) => setPeriod(e.target.value as ReportPeriod)}
                className="w-full rounded-xl border border-slate-300 bg-white p-2.5 text-xs font-bold text-slate-800 shadow-sm focus:border-sky-500 focus:outline-none"
              >
                {PERIODS.map((p) => (
                  <option key={p.value} value={p.value}>
                    {p.label}
                  </option>
                ))}
              </select>
            </div>

            {period === "month" && (
              <div>
                <label className="mb-1 block text-xs font-bold text-slate-700">الشهر</label>
                <select
                  value={selectedMonths[0] || ""}
                  onChange={(e) => {
                    const val = e.target.value ? [Number(e.target.value)] : [];
                    setSelectedMonths(val);
                  }}
                  className="w-full rounded-xl border border-slate-300 bg-white p-2.5 text-xs font-bold text-slate-800 shadow-sm focus:border-sky-500 focus:outline-none"
                >
                  <option value="">كل الشهور</option>
                  {MONTHS.map((m) => (
                    <option key={m.value} value={m.value}>
                      {m.label}
                    </option>
                  ))}
                </select>
              </div>
            )}
          </div>
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
              {displayRows.filter((r) => r.summaryLevel !== "signature").length} سجل
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
            rows={actionRows.filter((row) => !isLoanOrCustody || row.summaryLevel !== "opening")}
            columns={sourceConfig.columns}
            printColumns={isLoanOrCustody ? sourceConfig.columns.filter((column) => column.key !== "name") : sourceConfig.columns}
            fileName={
              source === "youssefLoan"
                ? `مسير-إخلاء-عهدة-د-يوسف-${year}`
                : source === "tawfiqCustody"
                ? `مسير-إخلاء-عهدة-توفيق-الداعي-${year}`
                : `تقرير-${source}-${year}`
            }
            numericKeys={numericKeys}
            pdfLayout="wide-centered"
            pdfOrientation="landscape"
            pdfCss={reportsTabPrintCss}
            includeTotalRow={isLoanOrCustody}
            className="w-full sm:w-auto"
          />
        </div>

        {/* الجدول */}
        <div className="overflow-x-auto p-3 sm:p-4">
          <table className="reports-data-table w-full min-w-[900px] border-collapse overflow-hidden rounded-2xl text-center text-xs sm:text-sm">
            <thead className="bg-[#0f283a] text-white">
              <tr>
                <th className="border border-black px-3 py-2.5 font-bold text-white">م</th>
                {sourceConfig.columns.map((column) => {
                  const isSortActive = activeSortColumn === column.key;
                  return (
                    <th
                      key={column.key}
                      onClick={() => handleSort(column.key)}
                      className="cursor-pointer border border-black px-3 py-2.5 font-bold text-white transition hover:bg-[#1a3a50]"
                    >
                      <div className="flex items-center justify-center gap-1">
                        <span>{column.label}</span>
                        {isSortActive && (
                          activeSortDirection === "asc" ? <ChevronUp className="h-3.5 w-3.5" /> : <ChevronDown className="h-3.5 w-3.5" />
                        )}
                      </div>
                    </th>
                  );
                })}
                <th className="border border-black px-3 py-2.5 font-bold text-white print:hidden">إجراء</th>
              </tr>

              {/* صف التصفية */}
              <tr className="bg-slate-100 print:hidden">
                <th className="border border-black p-1 text-center font-normal">
                  {hasAnyFilter && (
                    <button
                      onClick={clearAllFilters}
                      className="rounded bg-rose-100 px-1 py-0.5 text-[10px] font-bold text-rose-700 hover:bg-rose-200"
                      title="مسح كل الفلاتر"
                    >
                      مسح
                    </button>
                  )}
                </th>
                {sourceConfig.columns.map((column) => (
                  <th key={`filter-${column.key}`} className="border border-black p-1 font-normal">
                    <input
                      type="text"
                      placeholder={`بحث في ${column.label}`}
                      value={columnFilters[column.key] || ""}
                      onChange={(e) => handleFilterChange(column.key, e.target.value)}
                      className="w-full rounded border border-slate-300 bg-white px-1.5 py-1 text-center text-[11px] font-normal text-slate-800 outline-none focus:border-sky-500"
                    />
                  </th>
                ))}
                <th className="border border-black p-1 font-normal" />
              </tr>
            </thead>

            <tbody className="divide-y divide-black border border-black bg-white">
              {displayRows.length === 0 ? (
                <tr>
                  <td colSpan={sourceConfig.columns.length + 2} className="py-8 text-center text-sm font-bold text-slate-500">
                    لا توجد بيانات مطابقة للفترة المحددة
                  </td>
                </tr>
              ) : (
                displayRows.map((row, index) => {
                  const isTotal = row.summaryLevel === "total";
                  const isOpening = row.summaryLevel === "opening";
                  const isSignature = row.summaryLevel === "signature";

                  let rowStyle = "hover:bg-sky-50/50";
                  if (isTotal) rowStyle = "bg-[#0437bb] text-white font-black text-sm sm:text-base";
                  else if (isOpening) rowStyle = "bg-amber-100/90 text-amber-950 font-bold";
                  else if (isSignature) rowStyle = "bg-slate-100 text-slate-800 font-bold signature-row";
                  else if (row.summaryLevel === "fee") rowStyle = "bg-sky-100 font-bold text-sky-950";
                  else if (row.summaryLevel === "trainee-name-total") rowStyle = "bg-emerald-100 font-bold text-emerald-950";
                  else if (row.summaryLevel === "period") rowStyle = "bg-amber-100 font-bold text-amber-950";
                  else if (index % 2 === 1) rowStyle = "bg-slate-50/80 text-slate-900";
                  else rowStyle = "bg-white text-slate-900";

                  // صفوف التوقيعات: تجميعها في كتلة ثلاثية واحدة متناسقة أسفل الجدول بكامل العرض
                  if (isSignature) {
                    if (row.id !== "sig-1") return null;
                    return (
                      <tr key="unified-custody-signatures" className="border-t-2 border-black bg-slate-50/90 signature-block-row">
                        <td colSpan={sourceConfig.columns.length + 2} className="border border-black p-4">
                          <div className="mx-auto grid w-full max-w-5xl grid-cols-1 gap-4 text-center md:grid-cols-3">
                            {/* 1. الشؤون المالية (اليمين) */}
                            <div className="flex flex-col items-center gap-2 rounded-xl border border-slate-300 bg-white p-3 shadow-sm">
                              <label className="w-full text-center">
                                <span className="mb-1 block text-[11px] font-black text-slate-600">المسمى / الإدارة</span>
                                <input
                                  type="text"
                                  value={signaturesMeta.sig1Dept}
                                  onChange={(e) => setSignaturesMeta((prev) => ({ ...prev, sig1Dept: e.target.value }))}
                                  className="w-full rounded border border-slate-200 bg-slate-50 px-2 py-1 text-center text-xs font-black text-slate-800 outline-none focus:border-sky-600 focus:bg-white"
                                  placeholder="المسمى / الإدارة"
                                />
                              </label>
                              <label className="w-full text-center">
                                <span className="mb-1 block text-[11px] font-bold text-slate-500">اسم الموقّع / التوقيع</span>
                                <input
                                  type="text"
                                  value={signaturesMeta.sig1Name}
                                  onChange={(e) => setSignaturesMeta((prev) => ({ ...prev, sig1Name: e.target.value }))}
                                  className="w-full rounded border border-slate-200 bg-white px-2 py-1 text-center text-xs font-bold text-slate-900 outline-none focus:border-sky-600"
                                  placeholder="اسم المدير / التوقيع"
                                />
                              </label>
                            </div>

                            {/* 2. نائب رئيس المجلس (الوسط) */}
                            <div className="flex flex-col items-center gap-2 rounded-xl border border-slate-300 bg-white p-3 shadow-sm">
                              <label className="w-full text-center">
                                <span className="mb-1 block text-[11px] font-black text-slate-600">المسمى / الإدارة</span>
                                <input
                                  type="text"
                                  value={signaturesMeta.sig2Dept}
                                  onChange={(e) => setSignaturesMeta((prev) => ({ ...prev, sig2Dept: e.target.value }))}
                                  className="w-full rounded border border-slate-200 bg-slate-50 px-2 py-1 text-center text-xs font-black text-slate-800 outline-none focus:border-sky-600 focus:bg-white"
                                  placeholder="المسمى / الإدارة"
                                />
                              </label>
                              <label className="w-full text-center">
                                <span className="mb-1 block text-[11px] font-bold text-slate-500">اسم الموقّع / التوقيع</span>
                                <input
                                  type="text"
                                  value={signaturesMeta.sig2Name}
                                  onChange={(e) => setSignaturesMeta((prev) => ({ ...prev, sig2Name: e.target.value }))}
                                  className="w-full rounded border border-slate-200 bg-white px-2 py-1 text-center text-xs font-bold text-slate-900 outline-none focus:border-sky-600"
                                  placeholder="اسم المدير / التوقيع"
                                />
                              </label>
                            </div>

                            {/* 3. رئيس المجلس (اليسار) */}
                            <div className="flex flex-col items-center gap-2 rounded-xl border border-slate-300 bg-white p-3 shadow-sm">
                              <label className="w-full text-center">
                                <span className="mb-1 block text-[11px] font-black text-slate-600">المسمى / الإدارة</span>
                                <input
                                  type="text"
                                  value={signaturesMeta.sig3Dept}
                                  onChange={(e) => setSignaturesMeta((prev) => ({ ...prev, sig3Dept: e.target.value }))}
                                  className="w-full rounded border border-slate-200 bg-slate-50 px-2 py-1 text-center text-xs font-black text-slate-800 outline-none focus:border-sky-600 focus:bg-white"
                                  placeholder="المسمى / الإدارة"
                                />
                              </label>
                              <label className="w-full text-center">
                                <span className="mb-1 block text-[11px] font-bold text-slate-500">اسم الموقّع / التوقيع</span>
                                <input
                                  type="text"
                                  value={signaturesMeta.sig3Name}
                                  onChange={(e) => setSignaturesMeta((prev) => ({ ...prev, sig3Name: e.target.value }))}
                                  className="w-full rounded border border-slate-200 bg-white px-2 py-1 text-center text-xs font-bold text-slate-900 outline-none focus:border-sky-600"
                                  placeholder="اسم المدير / التوقيع"
                                />
                              </label>
                            </div>
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

                      {sourceConfig.columns.map((column) => {
                        const cellVal = row[column.key as keyof ReportRow];
                        const isNum = numericKeys.includes(column.key);
                        const isSettlement = column.key === "settlementNo";
                        const isNotes = column.key === "notes";
                        const isAmountCol = column.key === "amount" && isLoanOrCustody;

                        // حقل إدخال رقم كشف التسوية
                        if (isSettlement && !isOpening && !isTotal) {
                          const rowId = row.id || "";
                          return (
                            <td key={column.key} className="border border-black px-2 py-1.5 font-bold">
                              <input
                                type="text"
                                value={row.settlementNo || ""}
                                onChange={(e) => {
                                  const val = e.target.value;
                                  setLoanManualData((prev) => ({
                                    ...prev,
                                    [rowId]: { ...prev[rowId], settlementNo: val },
                                  }));
                                }}
                                placeholder="أدخل رقم التسوية"
                                className="w-full rounded border border-slate-200 bg-white px-2 py-1 text-center text-xs font-bold text-slate-900 outline-none focus:border-sky-500 print:hidden"
                              />
                              <span className="hidden print:inline">{row.settlementNo || "—"}</span>
                            </td>
                          );
                        }

                        // حقل إدخال الملاحظات
                        if (isNotes && !isOpening && !isTotal) {
                          const rowId = row.id || "";
                          return (
                            <td key={column.key} className="border border-black px-2 py-1.5 font-bold">
                              <input
                                type="text"
                                value={row.notes || ""}
                                onChange={(e) => {
                                  const val = e.target.value;
                                  setLoanManualData((prev) => ({
                                    ...prev,
                                    [rowId]: { ...prev[rowId], notes: val },
                                  }));
                                }}
                                placeholder="أدخل ملاحظات"
                                className="w-full rounded border border-slate-200 bg-white px-2 py-1 text-center text-xs font-bold text-slate-900 outline-none focus:border-sky-500 print:hidden"
                              />
                              <span className="hidden print:inline">{row.notes || "—"}</span>
                            </td>
                          );
                        }

                        // حقل إدخال/تعديل المبلغ
                        if (isAmountCol && !isOpening && !isTotal) {
                          const rowId = row.id || "";
                          return (
                            <td key={column.key} className="border border-black px-2 py-1.5 font-black text-slate-900">
                              <input
                                type="number"
                                value={row.amount || ""}
                                onChange={(e) => {
                                  const val = Number(e.target.value) || 0;
                                  setLoanManualData((prev) => ({
                                    ...prev,
                                    [rowId]: { ...prev[rowId], amount: val },
                                  }));
                                }}
                                placeholder="0"
                                className="w-full rounded border border-slate-200 bg-white px-2 py-1 text-center text-xs font-black text-slate-900 outline-none focus:border-sky-500 print:hidden"
                              />
                              <span className="hidden print:inline">{formatCurrency(Number(cellVal) || 0)}</span>
                            </td>
                          );
                        }

                        return (
                          <td
                            key={column.key}
                            className={`border border-black px-2 py-2 font-bold ${
                              column.key === "description" || column.key === "item" ? "desc-cell text-right" : ""
                            } ${isNum ? "font-black" : ""}`}
                          >
                            {isNum ? (
                              typeof cellVal === "number" ? (
                                formatCurrency(cellVal)
                              ) : (
                                cellVal || "—"
                              )
                            ) : (
                              String(cellVal ?? "—")
                            )}
                          </td>
                        );
                      })}

                      <td className="border border-black px-1 py-1 print:hidden">
                        {!isOpening && !isTotal && (
                          <button
                            onClick={() => deleteRow(row)}
                            className="rounded p-1 text-rose-600 hover:bg-rose-50"
                            title="حذف مؤقت"
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
      </section>
    </div>
  );
}
