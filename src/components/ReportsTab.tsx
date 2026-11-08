import "./ReportsTab.css";
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
import PrintSettingsModal, { type InstallmentsPrintSettings } from "./PrintSettingsModal";
import { toast } from "sonner";
import { useReportDate } from "@/lib/reportDate";
import { openBrowserPrintPreview } from "@/lib/browserPrintPreview";
import { reportDocumentCss } from "@/lib/reportPdf";
import revenueSchema from "@/data/revenueTemplate.json";

type ReportSource = |
 "youssefLoan" |
 "tawfiqCustody" |
 "account" |
 "hafiza" |
 "expenses" |
 "revenue" |
 "combined" |
 "trainee" |
 "feeTotals" |
 "traineeFeeStatus";

type PeriodType = "all" | "month" | "quarter" | "half" | "year";
type TraineeGrouping = "month" | "year";
type TraineeDisplayMode = "detail" | "summary" | "both";

export interface ReportRow {
 id ? : string;
 date ? : string;
 description ? : string;
 trainee ? : string;
 name ? : string;
 specialty ? : string;
 year ? : string | number;
 amount ? : number;
 income ? : number;
 expense ? : number;
 hafizaAmount ? : number;
 hafizaNo ? : string;
 notifyNo ? : string;
 notifyDate ? : string;
 checkNo ? : string;
 category ? : string;
 period ? : string;
 source ? : string;
 displayType ? : string;
 notes ? : string;
 settlementNo ? : string;
 item ? : string;
 summaryLevel ? : "opening" | "total" | "fee" | "trainee-fee-total" | "trainee-name-total" | "period" | "signature" | "detail";
 total ? : string;
 [key: string]: any;
}

const getReportRowKey = (row: ReportRow, source: ReportSource): string => {
if (row.id !== undefined && row.id !== null && String(row.id).trim()) {
return `${source}|id|${String(row.id)}`;
}
const identity = [
row.summaryLevel,
row.trainee ?? row.name,
row.batch,
row.year,
row.period,
row.category,
row.notifyDate ?? row.date,
row.notifyNo,
row.hafizaNo,
row.description ?? row.item,
row.source,
row.displayType,
]
.map((value) => String(value ?? "").trim())
.join("\u001f");
return `${source}|row|${identity}`;
};

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

const PERIODS: Array < { value: PeriodType;label: string } > = [
 { value: "all", label: "كامل المدة (من 2026)" },
 { value: "year", label: "سنوي" },
 { value: "half", label: "نصف سنوي" },
 { value: "quarter", label: "ربع سنوي" },
 { value: "month", label: "شهري" },
];

const SOURCES: Array < { value: ReportSource;label: string } > = [
 { value: "youssefLoan", label: "سلفة د/يوسف" },
 { value: "tawfiqCustody", label: "عهدة توفيق الداعي" },
 { value: "account", label: "الحساب الجاري" },
 { value: "hafiza", label: "حوافظ التوريد" },
 { value: "expenses", label: "المصروفات" },
 { value: "revenue", label: "الإيرادات" },
 { value: "combined", label: "تقرير مجمّع لكل التبويبات" },
 { value: "trainee", label: "كشف مدفوعات المتدربين" },
 { value: "feeTotals", label: "إجماليات الرسوم حسب النوع" },
 { value: "traineeFeeStatus", label: "غير المسددين لرسوم الامتحانات منذ 2022" },
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
 if (period === "all") return ` من تاريخ 1/1/2026 حتى تاريخه`;
 if (period === "year") return `السنة المالية ${year}`;
 if (period === "half") return `${month < 6 ? "النصف الأول" : "النصف الثاني"} لعام ${year}`;
 if (period === "quarter") return `الربع ${Math.floor(month / 3) + 1} لعام ${year}`;
 return `شهر ${MONTHS[month]} ${year}`;
};

const getYearOptions = (values: unknown[]) => {
 const years = new Set < number > ([2024, 2025, 2026]);
 values.forEach((value) => {
  const date = normalizeDate(value);
  if (date) years.add(date.getFullYear());
 });
 return Array.from(years).sort((a, b) => b - a);
};

const revenueItemNames = (() => {
 const names = new Map < string,
  string > ();
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

const formatCurrency = (val ? : number | string | null): string => {
 return (Number(val) || 0).toLocaleString("en-US");
};

const normalizeFeeDescription = (value: unknown) =>
 String(value || "")
 .trim()
 .replace(/[ًٌٍَُِّْـ]/g, "")
 .replace(/[إأآ]/g, "ا")
 .replace(/\s+/g, " ");
const isExamFeeDescription = (value: unknown) =>
 /(امتحان|اختبار)/.test(normalizeFeeDescription(value));
const isNewTraineeRegistrationDescription = (value: unknown) =>
 /رسوم\s+(?:ال)?قيد\s+و(?:ال)?تسجيل/.test(normalizeFeeDescription(value));
const isTuitionFeeDescription = (value: unknown) => {
 const text = normalizeFeeDescription(value);
 return /(رسوم\s*(?:ال)?(?:دراس|دراسه|دراسي)|(?:قسط|اقساط)\s*(?:ال)?(?:دراس|دراسه|دراسي)|تسجيل|قيد)/.test(text);
};
const canonicalFeeCategory = (value: unknown) => {
 const text = normalizeFeeDescription(value);
 if (!text) return "رسوم أخرى";
 if (isExamFeeDescription(text)) return "رسوم الامتحانات";
 if (isTuitionFeeDescription(text)) return "أقساط الدراسة والتسجيل";
 return String(value).trim() || "رسوم أخرى";
};

const normalizeTraineeReportName = (value: unknown): string =>
 String(value || "")
 .trim()
 .replace(/[ًٌٍَُِّْـ]/g, "")
 .replace(/[إأآ]/g, "ا")
 .replace(/ى/g, "ي")
 .replace(/\s+/g, " ");

const classifyCustodyRecord = (description: unknown): "youssef" | "tawfiq" | "other" => {
 const text = String(description || "").trim();
 if (!text) return "other";
 if (/(عهدة\s*الداعي|توفيق\s*الداعي)/.test(text)) return "tawfiq";
 if (/(عهدة\s*د\s*\/?\s*يوسف|العهدة|عهدة)/.test(text)) return "youssef";
 return "other";
};

const reportsTabPrintCss = `
  #tableContainer table.reports-data-table { width:100% !important; max-width:100% !important; table-layout:auto !important; font-size:8pt !important; }
  #tableContainer table.reports-data-table th, #tableContainer table.reports-data-table td { font-size: 18px !important; }

  #tableContainer .reports-print-heading { margin:0 auto 4mm !important; padding:2mm 0 !important; text-align:center !important; direction:rtl !important; color:#17324d !important; page-break-after:avoid !important; 
    
  }
  #tableContainer .reports-print-heading h1 { margin:0 !important;
  color: #17324d !important; 
  font-weight:900  !important;
  font-size: 18px !important;
font-Family: Cairo !important; 
  }
  #tableContainer .reports-print-heading .reports-print-sub { margin-top:1.5mm !important; color:#526a7e !important; font:900 18px/1.4 Cairo !important; }
  #tableContainer table.reports-data-table { width:100% !important; min-width:0 !important; max-width:100% !important; margin:0 auto !important; border-collapse:collapse !important; border-spacing:0 !important; table-layout:auto !important; direction:rtl !important; text-align:center !important; color:#243b50 !important; font-family:Cairo !important; }
  #tableContainer table.reports-data-table th,
  #tableContainer table.reports-data-table td { box-sizing:border-box !important; width:auto !important; min-width:0 !important; max-width:100% !important; padding:5px 4px !important; border:1px solid #000 !important; text-align:center !important; vertical-align:middle !important;
  font-family: Cairo !important; 
  font-size: 16px !important; font-weight:1000 !important; line-height:1.35 !important; -webkit-print-color-adjust:exact !important; print-color-adjust:exact !important; }
  #tableContainer table.reports-data-table thead { display:table-header-group !important; }
  #tableContainer table.reports-data-table thead tr.reports-column-header-row > th { background:linear-gradient(180deg,#fff4a3 0%,#ffd700 48%,#d99b00 100%) !important; background-color:#ffd700 !important; color:#000 !important; border-color:#000 !important; font-size: 18px !important; font-weight:900 !important; -webkit-print-color-adjust:exact !important; print-color-adjust:exact !important; }
  #tableContainer table.reports-data-table thead tr.reports-custody-title-row > th,
  #tableContainer table.reports-data-table thead tr.reports-custody-date-row > th { position:static !important; min-width:0 !important; max-width:none !important; background:#fff !important; background-color:#fff !important; color:#17324d !important; border:1px solid #000 !important;
  font-weight:900 !important;
  }
  #tableContainer table.reports-data-table thead tr.reports-custody-title-row > th {
  padding:10px 8px 4px !important; font-size: 18px !important;
  font-weight:1000 !important;
font-family: Cairo !important;
  }
  #tableContainer table.reports-data-table thead tr.reports-custody-date-row > th { padding:3px 8px 8px !important;
  font-size: 13px !important;
font-family: Cairo !important; 
  }
  #tableContainer table.reports-data-table tbody > tr > td { 
font-family: Cairo !important; font-weight:900 !important;
  background:#fff !important; background-color:#fff !important; color:#0f172a !important; }
  #tableContainer table.reports-data-table tbody > tr.reports-opening-row > td { background:#FBFEFF !important; background-color:#FBFEFF !important; color:#000 !important; font-weight:700 !important; }
  #tableContainer table.reports-data-table tbody > tr.reports-detail-row > td { background:#fff !important; color:#17324d !important; font-weight:800 !important; }
  #tableContainer table.reports-data-table tbody > tr.reports-trainee-total-row:not(.total-row):not(.report-grand-total-row) > td { background:#2c666e !important; background-color:#2c666e !important; color:#fff !important; font-weight:900 !important; }
  #tableContainer table.reports-data-table tbody > tr.reports-trainee-summary-row:not(.total-row):not(.report-grand-total-row) > td {
  font-size: 15px !important;
  background:#fff1d6 !important; background-color:#fff1d6 !important; color:#68420a !important; font-weight:900 !important; }
  #tableContainer table.reports-data-table tbody > tr.reports-fee-row:not(.total-row):not(.report-grand-total-row) > td { background:#f1bf98 !important; background-color:#f1bf98 !important; color:#38291f !important;
  font-size: 15px !important;
  font-weight:900 !important; }
  #tableContainer table.reports-data-table tbody > tr.reports-period-row:not(.total-row):not(.report-grand-total-row) > td { background:#5b5750 !important; background-color:#5b5750 !important; color:#fff !important; font-weight:900 !important; }
  #tableContainer table.reports-data-table tbody > tr.total-row > td,
  #tableContainer table.reports-data-table tbody > tr.report-grand-total-row > td { background:#0437bb !important; background-color:#0437bb !important; color:#fff !important; border-color:#000 !important; font-weight:900 !important; }
  #tableContainer table.reports-data-table tbody > tr.total-row > td *,
  #tableContainer table.reports-data-table tbody > tr.report-grand-total-row > td * { background:transparent !important; color:#fff !important; }
  #tableContainer table.reports-data-table tbody > tr.reports-fee-row.reports-exam-fee-total-row:not(.total-row):not(.report-grand-total-row) > td { background:#D8F3DC !important; background-color:#D8F3DC !important; color:#1B4332 !important; border-color:#000 !important; 
font-size: 18px !important;
  font-weight:900 !important; -webkit-print-color-adjust:exact !important; print-color-adjust:exact !important; }
  #tableContainer table.reports-data-table tbody > tr.reports-fee-row.reports-tuition-fee-total-row:not(.total-row):not(.report-grand-total-row) > td { background:#E8DFF5 !important; background-color:#E8DFF5 !important; color:#3D315B !important; border-color:#000 !important; font-weight:900 !important; -webkit-print-color-adjust:exact !important; print-color-adjust:exact !important; }
  #tableContainer table.reports-trainee-payment-table tbody > tr.reports-trainee-total-row:not(.total-row):not(.report-grand-total-row) > td { background:#2C666E !important; background-color:#2C666E !important; color:#fff !important; border-color:#000 !important; font-weight:900 !important; }
  #tableContainer table.reports-trainee-payment-table tbody > tr.total-row > td,
  #tableContainer table.reports-trainee-payment-table tbody > tr.report-grand-total-row > td { background:#0437bb !important; background-color:#0437bb !important; color:#fff !important; border-color:#000 !important; font-weight:900 !important; }
  #tableContainer table.reports-trainee-payment-table tbody > tr.total-row > td *,
  #tableContainer table.reports-trainee-payment-table tbody > tr.report-grand-total-row > td * { color:#fff !important; }
  #tableContainer table.reports-data-table th.rc-num,
  #tableContainer table.reports-data-table td.rc-num,
  #tableContainer table.reports-data-table td.reports-numeric-cell,
  #tableContainer table.reports-data-table td.reports-no-wrap-cell,
  #tableContainer table.reports-data-table td[data-col-key="idx"] { white-space:nowrap !important; word-break:keep-all !important; overflow-wrap:normal !important; }
  #tableContainer table.reports-data-table th.rc-text,
  #tableContainer table.reports-data-table td.rc-text,
  #tableContainer table.reports-data-table td.reports-description-cell,
  #tableContainer table.reports-data-table td.reports-text-cell { white-space:normal !important; word-break:normal !important; overflow-wrap:anywhere !important; }
  #tableContainer table.reports-data-table td.reports-description-cell,
  #tableContainer table.reports-data-table td.reports-text-cell { min-width:25mm !important; max-width:58mm !important; }
  #tableContainer table.reports-data-table td[data-col-key="idx"] { min-width:10mm !important; }
  #tableContainer table.reports-data-table tr.signature-spacer-row > td { height:3mm !important; min-height:3mm !important; padding:0 !important; border:0 !important; background:#fff !important; }
  #tableContainer table.reports-data-table tr.signature-block-row,
  #tableContainer table.reports-data-table tr.signature-block-row > td { background:#fff !important; color:#000 !important; page-break-inside:avoid !important; break-inside:avoid !important; }
  #tableContainer table.reports-data-table tr.signature-block-row > td { padding:5px 8px !important; border:0 !important; }
  #tableContainer .signature-block-grid { display:grid !important; grid-template-columns:repeat(3,minmax(0,1fr)) !important; gap:2mm 3mm !important; width:100% !important; direction:rtl !important; align-items:end !important; }
  #tableContainer .signature-block-grid .reports-print-control-value { display:block !important; min-height:7mm !important; padding:2px 4px !important; border-bottom:1px dotted #000 !important; color:#000 !important; text-align:center !important; font-size:8.5pt !important; font-weight:800 !important; }
  #tableContainer .reports-print-control-value { color:inherit !important; white-space:normal !important; overflow-wrap:anywhere !important; }
  @media print {
    #tableContainer, #tableContainer .reports-print-table-shell { width:100% !important; max-width:100% !important; overflow:visible !important; }
    #tableContainer table.reports-data-table { width:100% !important; max-width:100% !important; min-width:0 !important; }
    #tableContainer table.reports-data-table tr,
    #tableContainer table.reports-data-table th,
    #tableContainer table.reports-data-table td { position:static !important; box-shadow:none !important; page-break-inside:avoid !important; break-inside:avoid !important; }
    #tableContainer table.reports-data-table th,
    #tableContainer table.reports-data-table td { padding:4px 3px !important; white-space:normal !important; word-break:normal !important; overflow-wrap:anywhere !important; }
    #tableContainer table.reports-data-table th.rc-num,
    #tableContainer table.reports-data-table td.rc-num,
    #tableContainer table.reports-data-table td.reports-numeric-cell,
    #tableContainer table.reports-data-table td.reports-no-wrap-cell,
    #tableContainer table.reports-data-table td[data-col-key="idx"] { white-space:nowrap !important; word-break:keep-all !important; overflow-wrap:normal !important; }
  }

`;





/** Clone the rendered table so print preserves its real structure and styling. */
const buildReportsScreenPrintHtml = (
 source: ReportSource,
 reportDateLabel: string,
 recordCount: number,
 settings?: InstallmentsPrintSettings,
) => {
 const sourceTable = document.getElementById("reports-table") as HTMLTableElement | null;
 if (!sourceTable) throw new Error("تعذر العثور على جدول التقرير الحالي");
 const table = sourceTable.cloneNode(true) as HTMLTableElement;
 const actionHeader = Array.from(table.querySelectorAll < HTMLTableRowElement > ("thead tr"))
  .find((row) => row.querySelector(':scope > [data-col-key="actions"]'));
 const originalColumnCount: number = actionHeader ?
  Array.from(actionHeader.cells).reduce < number > ((sum, cell) => sum + cell.colSpan, 0) :
  0;
 
 Array.from(table.querySelectorAll < HTMLTableRowElement > ("tr")).forEach((row) => {
  const actionCell = Array.from(row.cells).find((cell) => cell.dataset.colKey === "actions");
  if (actionCell) { actionCell.remove(); return; }
  const rowColumnCount = Array.from(row.cells).reduce((sum, cell) => sum + cell.colSpan, 0);
  if (originalColumnCount > 0 && rowColumnCount >= originalColumnCount) {
   const spanningCell = Array.from(row.cells).reverse().find((cell) => cell.colSpan > 1);
   if (spanningCell) spanningCell.colSpan = Math.max(1, spanningCell.colSpan - 1);
  }
 });

  // انسخ التنسيق المرئي من الشاشة قبل تطبيق إعدادات إخفاء الصفوف والأعمدة؛
  // بذلك تبقى مطابقة الصفوف صحيحة حتى عند إخفاء الإجماليات.
  const sourceRows = Array.from(sourceTable.rows);
  const printRows = Array.from(table.rows);
  printRows.forEach((printRow, rowIndex) => {
   const sourceRow = sourceRows[rowIndex];
   if (!sourceRow) return;
   const sourceCells = Array.from(sourceRow.cells).filter((cell) => cell.dataset.colKey !== "actions");
   Array.from(printRow.cells).forEach((printCell, cellIndex) => {
    const sourceCell = printCell.dataset.colKey
     ? sourceCells.find((cell) => cell.dataset.colKey === printCell.dataset.colKey)
     : sourceCells[cellIndex];
    if (!sourceCell) return;
    const screenStyle = window.getComputedStyle(sourceCell);
    [
     ["background-color", screenStyle.backgroundColor],
     ["color", screenStyle.color],
     ["border-color", screenStyle.borderColor],
     ["font-family", screenStyle.fontFamily],
     ["font-weight", screenStyle.fontWeight],
     ["font-style", screenStyle.fontStyle],
     ["text-align", screenStyle.textAlign],
     ["vertical-align", screenStyle.verticalAlign],
     ["white-space", screenStyle.whiteSpace],
     ["line-height", screenStyle.lineHeight],
    ].forEach(([property, value]) => printCell.style.setProperty(property, value, "important"));
    const isTextCell = printCell.classList.contains("rc-text") ||
     printCell.classList.contains("reports-text-cell") ||
     printCell.classList.contains("reports-description-cell");
    const isNumericCell = printCell.classList.contains("rc-num") ||
     printCell.classList.contains("reports-numeric-cell") ||
     printCell.classList.contains("reports-no-wrap-cell") ||
     printCell.dataset.colKey === "idx";
    if (isTextCell) {
     printCell.style.setProperty("white-space", "normal", "important");
     printCell.style.setProperty("word-break", "normal", "important");
     printCell.style.setProperty("overflow-wrap", "anywhere", "important");
    } else if (isNumericCell) {
     printCell.style.setProperty("white-space", "nowrap", "important");
     printCell.style.setProperty("word-break", "keep-all", "important");
     printCell.style.setProperty("overflow-wrap", "normal", "important");
    }
    printCell.style.setProperty("-webkit-print-color-adjust", "exact", "important");
    printCell.style.setProperty("print-color-adjust", "exact", "important");
   });
  });

 if (settings) {
  if (!settings.showHeader) {
   table.querySelectorAll("thead .reports-custody-title-row, thead .reports-custody-date-row").forEach((row) => row.remove());
  }
  if (!settings.showTotals) {
   table.querySelectorAll("tbody tr.total-row, tbody tr.report-grand-total-row, tbody tr.reports-trainee-total-row, tbody tr.reports-trainee-summary-row, tbody tr.reports-fee-row, tbody tr.reports-period-row").forEach((row) => row.remove());
  }
  const hidden = new Set(settings.hiddenColumns || []);
  if (hidden.size) {
   const header = table.querySelector<HTMLTableRowElement>("thead tr.reports-column-header-row");
   const keys = header ? Array.from(header.cells).map((cell) => cell.dataset.colKey || "") : [];
   const hiddenIndexes = new Set(keys.flatMap((key, index) => hidden.has(key) ? [index] : []));
   Array.from(table.rows).forEach((row) => {
    let logicalIndex = 0;
    Array.from(row.cells).forEach((cell) => {
     const start = logicalIndex;
     const span = cell.colSpan;
     logicalIndex += span;
     const hiddenInSpan = Array.from(hiddenIndexes).filter((index) => index >= start && index < start + span).length;
     if (cell.colSpan > 1 && hiddenInSpan > 0) {
      cell.colSpan = Math.max(1, cell.colSpan - hiddenInSpan);
     } else if (cell.dataset.colKey && hidden.has(cell.dataset.colKey)) {
      cell.remove();
     }
    });
   });
  }
  if (!settings.colored) {
   table.querySelectorAll<HTMLTableCellElement>("th, td").forEach((cell) => {
    cell.style.setProperty("background", "#ffffff", "important");
    cell.style.setProperty("background-color", "#ffffff", "important");
    cell.style.setProperty("color", "#000000", "important");
    cell.style.setProperty("border-color", "#000000", "important");
   });
  }
 }

  // Preserve the exact screen colors for the two categorized fee totals in print/PDF.
 if (settings?.colored !== false) {
  ["reports-exam-fee-total-row", "reports-tuition-fee-total-row"].forEach((rowClass) => {
   const sourceRows = Array.from(sourceTable.querySelectorAll<HTMLTableRowElement>(`tbody tr.${rowClass}`));
   const printRows = Array.from(table.querySelectorAll<HTMLTableRowElement>(`tbody tr.${rowClass}`));
   sourceRows.forEach((sourceRow, rowIndex) => {
    const printRow = printRows[rowIndex];
   if (!printRow) return;
   Array.from(sourceRow.cells).forEach((sourceCell, cellIndex) => {
     const printCell = sourceCell.dataset.colKey
      ? Array.from(printRow.cells).find((cell) => cell.dataset.colKey === sourceCell.dataset.colKey)
      : printRow.cells[cellIndex];
     if (!printCell) return;
     const screenStyle = window.getComputedStyle(sourceCell);
     printCell.style.setProperty("background-color", screenStyle.backgroundColor, "important");
     printCell.style.setProperty("color", screenStyle.color, "important");
     printCell.style.setProperty("border-color", screenStyle.borderColor, "important");
     printCell.style.setProperty("-webkit-print-color-adjust", "exact", "important");
     printCell.style.setProperty("print-color-adjust", "exact", "important");
    });
   });
  });
 }
 
 table.querySelectorAll("button, svg, script, style").forEach((element) => element.remove());
 table.querySelectorAll("input, textarea, select").forEach((control) => {
  let value = "";
  if (control instanceof HTMLSelectElement) value = control.selectedOptions[0]?.textContent?.trim() || "";
  else if (control instanceof HTMLInputElement) value = control.value || control.placeholder || "";
  else if (control instanceof HTMLTextAreaElement) value = control.value || control.placeholder || "";
  const printableValue = document.createElement("span");
  printableValue.className = "reports-print-control-value";
  printableValue.textContent = value;
  control.replaceWith(printableValue);
 });
 
 const isCustodyReport = source === "youssefLoan" || source === "tawfiqCustody";
 if (!isCustodyReport) {
  const dateCell = table.querySelector < HTMLTableCellElement > ("thead tr.reports-custody-date-row th");
  if (dateCell) {
   dateCell.textContent = "المجلس اليمني للاختصاصات الطبية - صعدة • تاريخ التقرير: " +
    reportDateLabel + " • عدد السجلات: " + String(recordCount);
  }
 }
 return '<div class="reports-print-table-shell">' + table.outerHTML + '</div>';
};

export default function ReportsTab() {
 const { year: fiscalYear } = useFiscalYear();
 const { reportDate, reportDateLabel } = useReportDate();
 const [printSettingsOpen, setPrintSettingsOpen] = useState(false);
 const hafiza = useStore((state) => state.hafiza);
 const trainees = useStore((state) => state.trainees);
 const accounts = useStore((state) => state.accounts);
 const revenue = useStore((state) => state.revenue);
 
 const [source, setSource] = useState < ReportSource > ("youssefLoan");
 const [period, setPeriod] = useState < PeriodType > ("all");
 const [year, setYear] = useState < number > (fiscalYear);
 const [month, setMonth] = useState < number > (new Date().getMonth());
 
 const [selectedTrainee, setSelectedTrainee] = useState < string > ("all");
 const [selectedFee, setSelectedFee] = useState < string > ("all");
 const [selectedBatch, setSelectedBatch] = useState("");
 const [traineeGrouping, setTraineeGrouping] = useState < TraineeGrouping > ("month");
 const [traineeDisplayMode, setTraineeDisplayMode] = useState < TraineeDisplayMode > ("both");
 
 const [sortColumn, setSortColumn] = useState < string > ("date");
 const [sortDirection, setSortDirection] = useState < "asc" | "desc" > ("asc");
 const [traineeSortColumn, setTraineeSortColumn] = useState < string > ("notifyDate");
 const [traineeSortDirection, setTraineeSortDirection] = useState < "asc" | "desc" > ("asc");
 const [deletedRows, setDeletedRows] = useState<Set<string>>(new Set());
 
 const [youssefOpeningBalance, setYoussefOpeningBalance] = useState < number > (() => {
  try {
   const saved = localStorage.getItem("youssef-loan-opening-balance");
   return saved ? Number(saved) || 0 : 0;
  } catch {
   return 0;
  }
 });
 
 const [tawfiqOpeningBalance, setTawfiqOpeningBalance] = useState < number > (() => {
  try {
   const saved = localStorage.getItem("tawfiq-custody-opening-balance");
   return saved ? Number(saved) || 0 : 0;
  } catch {
   return 0;
  }
 });
 
 const [loanManualData, setLoanManualData] = useState <
  Record < string, { settlementNo ? : string;notes ? : string;amount ? : number } >
  >
  (() => {
   try {
    const saved = localStorage.getItem("reports-loan-manual-data-v1");
    return saved ? JSON.parse(saved) : {};
   } catch {
    return {};
   }
  });
 
 const [signaturesMeta, setSignaturesMeta] = useState < SignaturesMeta > (() => {
  try {
   const saved = localStorage.getItem("reports-custody-signatures-meta-v1");
   if (saved) return JSON.parse(saved);
  } catch {}
  return {
   sig1Dept: "الشؤون المالية",
   sig1Name: "أ/ صالح الشعبي",
   sig2Dept: "نائب رئيس المجلس",
   sig2Name: "أ.د/ عبدالرب المروني",
   sig3Dept: "رئيس المجلس اليمني للاختصاصات الطبية",
   sig3Name: "أ.د/ كمال الحوثي  ",
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
 
 const youssefRows = useMemo < ReportRow[] > (() => {
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
  
  matched.forEach((row, index) => {
   const rowKey = `youssef-${index}-${row.date}`;
   const defaultAmt = amountValue(row.income || row.hafizaAmount || row.expense);
   const manual = loanManualData[rowKey];
   const amt = manual?.amount ?? defaultAmt;
   sumAmount += amt;
   
   const docNo = row.checkNo ?
    `شيك: ${row.checkNo}` :
    row.notifyNo ?
    `إشعار: ${row.notifyNo}` :
    row.hafizaNo ?
    `حافظة: ${row.hafizaNo}` :
    "—";
   
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
 
 const tawfiqRows = useMemo < ReportRow[] > (() => {
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
  
  matched.forEach((row, index) => {
   const rowKey = `tawfiq-${index}-${row.date}`;
   const defaultAmt = amountValue(row.income || row.hafizaAmount || row.expense);
   const manual = loanManualData[rowKey];
   const amt = manual?.amount ?? defaultAmt;
   sumAmount += amt;
   
   const docNo = row.checkNo ?
    `شيك: ${row.checkNo}` :
    row.notifyNo ?
    `إشعار: ${row.notifyNo}` :
    row.hafizaNo ?
    `حافظة: ${row.hafizaNo}` :
    "—";
   
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
 
 const hafizaRows = useMemo < ReportRow[] > (
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
 
 const accountRows = useMemo < ReportRow[] > (
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
 
 const expenseRows = useMemo < ReportRow[] > (
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
 
 const revenueRows = useMemo < ReportRow[] > (
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

 const batchOptions = useMemo(
  () =>
  Array.from(
   new Set(
    hafiza
    .map((row) => String(row.batch || "").trim())
    .filter(Boolean)
   )
  ).sort((a, b) => a.localeCompare(b, "ar", { numeric: true })),
  [hafiza]
 );
 
 const traineeRows = useMemo < ReportRow[] > (() => {
  const payments = hafiza.flatMap((row) => {
   const date = normalizeDate(row.notifyDate);
   const trainee = String(row.name || "").trim();
   const batch = String(row.batch || "").trim();
   const category = canonicalFeeCategory(row.description);
   const amount = amountValue(row.notifyAmount);
   if (
    !date ||
    date.getFullYear() < TRAINEE_REPORT_START_YEAR ||
    !trainee ||
    amount <= 0 ||
    (selectedTrainee !== "all" && trainee !== selectedTrainee) ||
    (selectedFee !== "all" && category !== selectedFee) ||
    (selectedBatch.trim() !== "" && batch !== selectedBatch.trim())
   ) {
    return [];
   }
   const p = traineeGrouping === "year" ? String(date.getFullYear()) : `${MONTHS[date.getMonth()]} ${date.getFullYear()}`;
   return [
   {
    id: `trainee-payment-${row.id}`,
    notifyDate: row.notifyDate,
    hafizaNo: row.hafizaNo || "",
    notifyNo: row.notifyNo || "",
    year: date.getFullYear(),
    period: p,
    trainee,
    batch,
    category,
    description: String(row.description || "رسوم أخرى").trim(),
    source: "حوافظ التوريد",
    amount,
   }, ];
  });
  
  const categories = Array.from(new Set(payments.map((row) => String(row.category)))).sort((a, b) => a.localeCompare(b, "ar"));
  const result: ReportRow[] = [];
  
  categories.forEach((category) => {
   const categoryPayments = payments.filter((row) => row.category === category).sort((a, b) => String(a.notifyDate).localeCompare(String(b.notifyDate)));
   if (traineeDisplayMode === "detail" || traineeDisplayMode === "both") {
    result.push(...categoryPayments.map((row) => ({
     ...row,
     displayType: "تفصيلي",
     summaryLevel: "detail" as const,
    })));
   }
   if (traineeDisplayMode === "summary" || traineeDisplayMode === "both") {
    const grouped = new Map < string,
     ReportRow > ();
    categoryPayments.forEach((row) => {
     const key = `${row.year}|${row.period}`;
     const current = grouped.get(key);
     if (current) {
      current.amount = amountValue(current.amount) + amountValue(row.amount);
     } else {
      grouped.set(key, {
       id: `trainee-period-${category}-${row.year}-${row.period}`,
       year: row.year,
       period: row.period,
        trainee: row.trainee,
        batch: row.batch,
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
    id: `trainee-fee-category-${category}`,
    period: `إجمالي ${category}`,
   trainee: selectedTrainee === "all" ? "جميع المتدربين" : selectedTrainee,
    batch: selectedBatch.trim() || "—",
    category,
    description: "إجمالي الرسم",
    source: "حوافظ التوريد",
    amount: categoryPayments.reduce((sum, row) => sum + amountValue(row.amount), 0),
    displayType: "إجمالي الرسم",
    notes: "إجمالي الرسم",
    summaryLevel: "fee",
   });
  });

  // إجماليات مستقلة لرسوم الامتحانات والرسوم الدراسية لكل متدرب
  // ضمن فترة التجميع المختارة، وتظهر حتى في وضع التفاصيل فقط.
  const traineeFeeTotals = new Map<string, ReportRow>();
  payments.forEach((row) => {
   if (row.category !== "رسوم الامتحانات" && row.category !== "أقساط الدراسة والتسجيل") return;
   const key = `${row.trainee}|${row.batch}|${row.year}|${row.period}|${row.category}`;
   const existing = traineeFeeTotals.get(key);
   if (existing) {
    existing.amount = amountValue(existing.amount) + amountValue(row.amount);
    return;
   }
   const isExamFee = row.category === "رسوم الامتحانات";
   traineeFeeTotals.set(key, {
    id: `trainee-fee-total-${key}`,
    year: row.year,
    period: row.period,
    notifyDate: row.period,
    trainee: row.trainee,
    batch: row.batch,
    category: row.category,
    description: isExamFee ? "إجمالي رسوم الامتحانات" : "إجمالي الرسوم الدراسية",
    source: "حوافظ التوريد",
    amount: amountValue(row.amount),
    displayType: isExamFee ? "إجمالي رسوم الامتحانات" : "إجمالي الرسوم الدراسية",
    notes: isExamFee ? "إجمالي رسوم الامتحانات" : "إجمالي الرسوم الدراسية",
    summaryLevel: "trainee-fee-total",
   });
  });
  result.push(...Array.from(traineeFeeTotals.values()));

  if (traineeDisplayMode === "summary" || traineeDisplayMode === "both") {
   const nameYearMap = new Map < string,
    { trainee: string;year: number;amount: number } > ();
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
     id: `trainee-name-total-${trainee}-${year}`,
     year,
     trainee,
     batch: selectedBatch.trim() || "—",
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
 }, [hafiza, selectedTrainee, selectedFee, selectedBatch, traineeGrouping, traineeDisplayMode]);
 
 const feeTotalsRows = useMemo < ReportRow[] > (() => {
  const totals = new Map < string,
   number > ();
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
 
 const traineeFeeStatusRows = useMemo < ReportRow[] > (() => {
  const byName = new Map < string,
   {
    trainee: string;
    batch: string;
    specialty: string;
   } > ();
  const paidExamKeys = new Set < string > ();
  const newTraineeKeys = new Set < string > ();
  
  // مصدر أسماء المتدربين وبياناتهم وتصنيف سدادهم هو حوافظ التوريد فقط.
  // يحتسب السداد من مبلغ وتاريخ التوريد، ويُعد البيان مدفوعاً فقط عند ورود امتحان/اختبار.
  hafiza.forEach((record) => {
   const name = String(record.name || "").trim();
   const key = normalizeTraineeReportName(name);
   if (!key) return;
   let current = byName.get(key);
   if (!current) {
    current = {
     trainee: name,
     batch: String(record.batch || ""),
     specialty: String(record.specialty || ""),
    };
    byName.set(key, current);
   } else {
    if (!current.batch && record.batch) current.batch = String(record.batch);
    if (!current.specialty && record.specialty) current.specialty = String(record.specialty);
   }
   
   if (isNewTraineeRegistrationDescription(record.description)) {
    newTraineeKeys.add(key);
   }
   const amount = amountValue(record.notifyAmount);
   const date = normalizeDate(record.notifyDate);
   if (amount > 0 && date && date.getFullYear() >= 2022 && isExamFeeDescription(record.description)) {
    paidExamKeys.add(key);
   }
  });
  
  // يستبعد المستجدون الذين وردت لهم رسوم قيد وتسجيل، ثم يعرض غير المسددين منذ 2022.
  return Array.from(byName.entries())
   .filter(([key]) => !paidExamKeys.has(key) && !newTraineeKeys.has(key))
   .map(([, item]) => ({
    trainee: item.trainee,
    batch: item.batch || "—",
    specialty: item.specialty || "—",
    examStatus: "غير مسدد منذ 2022",
   }));
 }, [hafiza]);
 
 const sourceConfig = useMemo < { title: string;columns: TabCol[] } > (() => {
  if (source === "youssefLoan") {
   return {
    title: "مسير إخلاء العهدة",
    columns: [
     { key: "date", label: "التاريخ" },
     { key: "description", label: "البيان" },
     { key: "settlementNo", label: "رقم كشف التسوية" },
     { key: "notes", label: "الملاحظات" },
     {
      key: "amount",
      label: "المبلغ"
     },
    ],
   }
  };
  if (source === "tawfiqCustody") {
   return {
    title: "مسير إخلاء العهدة",
    columns: [
     { key: "date", label: "التاريخ" },
     { key: "description", label: "البيان" },
     { key: "settlementNo", label: "رقم كشف التسوية" },
     { key: "notes", label: "الملاحظات" },
     { key: "amount", label: "المبلغ" },
    ],
   };
  }
  if (source === "traineeFeeStatus") {
   return {
    title: "المتدربون غير المسددين لرسوم الامتحانات والاختبارات منذ 2022",
    columns: [
     { key: "trainee", label: "اسم المتدرب" },
     { key: "batch", label: "الدفعة" },
     { key: "specialty", label: "التخصص" },
     { key: "examStatus", label: "حالة السداد منذ 2022" },
    ],
   };
  }
  if (source === "trainee") {
   return {
   title: "كشف مدفوعات المتدربين من حوافظ التوريد",
   columns: [
    { key: "year", label: "السنة" },
    { key: "notifyDate", label: "تاريخ التوريد / الفترة" },
    { key: "trainee", label: "اسم المتدرب" },
     { key: "batch", label: "رقم الدفعة" },
     { key: "hafizaNo", label: "رقم الحافظة" },
     { key: "notifyNo", label: "رقم الإشعار" },
     { key: "description", label: "البيان الأصلي" },
     { key: "category", label: "التصنيف الموحد" },
     { key: "displayType", label: "نوع السجل" },
     { key: "amount", label: "مبلغ التوريد" },
    ],
   };
  }
  if (source === "feeTotals") {
   return {
    title: "إجماليات الرسوم حسب النوع",
    columns: [
     { key: "category", label: "نوع الرسم" },
     { key: "source", label: "المصدر" },
     { key: "amount", label: "الإجمالي" },
    ],
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
    ],
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
    ],
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
    ],
   };
  }
  if (source === "revenue") {
   return {
    title: "تقرير الإيرادات",
    columns: [
     { key: "date", label: "الشهر" },
     { key: "item", label: "اسم بند الإيراد" },
     { key: "amount", label: "المبلغ" },
    ],
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
   ],
  };
 }, [source]);
 
 const reportRows = useMemo < ReportRow[] > (() => {
  if (source === "youssefLoan") return youssefRows;
  if (source === "tawfiqCustody") return tawfiqRows;
  if (source === "trainee") return traineeRows;
  if (source === "traineeFeeStatus") return traineeFeeStatusRows;
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
 }, [source, youssefRows, tawfiqRows, traineeRows, feeTotalsRows, traineeFeeStatusRows, hafizaRows, accountRows, expenseRows, revenueRows]);
 const processedRows = useMemo < ReportRow[] > (() => {
  const activeSortCol = source === "trainee" ? traineeSortColumn : sortColumn;
  const activeSortDir = source === "trainee" ? traineeSortDirection : sortDirection;
  const filtered = reportRows.filter((row) => !deletedRows.has(getReportRowKey(row, source)));
  
  const isCustodySource = source === "youssefLoan" || source === "tawfiqCustody";
  const orderedRows = isCustodySource ?
   filtered : [...filtered].sort((a, b) => {
    // إبقاء صفوف الإجماليات بعد التفاصيل مهما كان عمود الفرز أو اتجاهه.
    if (source === "trainee") {
     const sortRank = (row: ReportRow) => {
      if (row.summaryLevel === "period") return 1;
      if (row.summaryLevel === "fee") return 2;
      if (row.summaryLevel === "trainee-fee-total") return 3;
      if (row.summaryLevel === "trainee-name-total") return 4;
      if (row.summaryLevel === "total" || row.total === "نعم") return 5;
      return 0;
     };
     const rankDiff = sortRank(a) - sortRank(b);
     if (rankDiff !== 0) return rankDiff;
    }
    const aVal = a[activeSortCol];
    const bVal = b[activeSortCol];
    const aMissing = aVal === undefined || aVal === null;
    const bMissing = bVal === undefined || bVal === null;
    if (aMissing || bMissing) return aMissing === bMissing ? 0 : aMissing ? 1 : -1;
    const numA = Number(aVal);
    const numB = Number(bVal);
    if (!isNaN(numA) && !isNaN(numB)) {
     return activeSortDir === "asc" ? numA - numB : numB - numA;
    }
    const strA = String(aVal);
    const strB = String(bVal);
    return activeSortDir === "asc" ? strA.localeCompare(strB, "ar") : strB.localeCompare(strA, "ar");
   });
  
  // احتساب إجمالي المبلغ من السجلات الظاهرة فقط، مع منع جمع صفوف الملخص
  // مع تفاصيلها مرة أخرى في كشف المتدربين.
  const detailRows = orderedRows.filter((row) => row.summaryLevel === "detail");
  const feeRows = orderedRows.filter((row) => row.summaryLevel === "fee");
  const periodRows = orderedRows.filter((row) => row.summaryLevel === "period");
  const totalSourceRows = detailRows.length ?
   detailRows :
   feeRows.length ?
   feeRows :
   periodRows.length ?
   periodRows :
   orderedRows.filter((row) =>
    row.summaryLevel !== "opening" &&
    row.summaryLevel !== "total" &&
    row.summaryLevel !== "signature" &&
    row.total !== "نعم"
   );
  const visibleAmountTotal = totalSourceRows.reduce(
   (sum, row) => sum + amountValue(row.amount),
   0
  );
  
  return orderedRows.map((row) => {
   if (row.summaryLevel === "total" || row.total === "نعم") {
    return { ...row, amount: visibleAmountTotal };
   }
   
   // عند وجود التفاصيل، حدّث المجاميع الفرعية التابعة لها أيضاً بعد الحذف.
   if (source === "trainee" && detailRows.length > 0) {
    let matchingDetails: ReportRow[] | null = null;
    if (row.summaryLevel === "fee") {
     matchingDetails = detailRows.filter((item) => item.category === row.category);
    } else if (row.summaryLevel === "period") {
     matchingDetails = detailRows.filter(
      (item) => item.category === row.category && item.period === row.period
     );
    } else if (row.summaryLevel === "trainee-name-total") {
     matchingDetails = detailRows.filter(
      (item) => item.trainee === row.trainee && Number(item.year) === Number(row.year)
     );
    } else if (row.summaryLevel === "trainee-fee-total") {
     matchingDetails = detailRows.filter(
      (item) =>
       item.trainee === row.trainee &&
       item.batch === row.batch &&
       item.category === row.category &&
       Number(item.year) === Number(row.year) &&
       item.period === row.period
     );
    }
    if (matchingDetails) {
     return {
      ...row,
      amount: matchingDetails.reduce((sum, item) => sum + amountValue(item.amount), 0),
     };
    }
   }
   return row;
  });
 }, [reportRows, sortColumn, sortDirection, source, traineeSortColumn, traineeSortDirection, deletedRows]);
 
 const reportIssuedAt = new Date();
 const reportYearStart = new Date(reportIssuedAt.getFullYear(), 0, 1);
 const formatReportDate = (date: Date) =>
  date.toLocaleDateString("ar-EG-u-nu-latn", { day: "2-digit", month: "2-digit", year: "numeric" });
 const custodyDateRange = `من تاريخ ${formatReportDate(reportYearStart)} وحتى تاريخ ${formatReportDate(reportIssuedAt)}`;
 
 const title =
  source === "trainee" ?
  `كشف مدفوعات ${selectedTrainee === "all" ? "جميع المتدربين" : selectedTrainee} — ${selectedFee === "all" ? "كل الرسوم" : selectedFee}${selectedBatch.trim() ? ` — الدفعة ${selectedBatch.trim()}` : ""} — ${traineeDisplayMode === "detail" ? "تفصيلي" : traineeDisplayMode === "summary" ? "إجمالي" : "تفصيلي وإجمالي"} — تجميع ${traineeGrouping === "month" ? "شهري" : "سنوي"}` :
  source === "feeTotals" ?
  `إجماليات الرسوم حسب النوع — ${selectedTrainee === "all" ? "جميع المتدربين" : selectedTrainee} — من ${TRAINEE_REPORT_START_YEAR}` :
  source === "traineeFeeStatus" ?
  "المتدربون غير المسددين لرسوم الامتحانات والاختبارات منذ 2022" :
  source === "youssefLoan" || source === "tawfiqCustody" ?
  `مسير إخلاء - عهدة - ${source === "youssefLoan" ? "د/ يوسف" : "توفيق الداعي"}\n${custodyDateRange}` :
  `${sourceConfig.title} — ${periodLabel(period, month, year)}`;
 
 const numericKeys =
  source === "youssefLoan" || source === "tawfiqCustody" ? ["amount"] :
  source === "hafiza" ? ["amount", "income"] :
  source === "account" ? ["income", "expense"] :
  source === "expenses" ? ["expense"] :
  source === "revenue" ? ["amount"] :
  source === "traineeFeeStatus" ? ["tuitionPaid", "examPaid"] :
  source === "trainee" || source === "feeTotals" ? ["amount"] : ["income", "expense", "amount"];
 
 const noWrapKeys = sourceConfig.columns
  .filter((col) =>
   numericKeys.includes(col.key) ||
   /(date|year|period|month|تاريخ|السنة|الشهر)/i.test(`${col.key} ${col.label}`) ||
   /(ref|reference|number|code|key|id|check|notify|hafiza|doc|settlement|no$)/i.test(col.key) ||
   /^(رقم|رمز|كود|شيك|إشعار|اشعار|حافظة)/.test(col.label.trim())
  )
  .map((col) => col.key);
 const isLoanOrCustody = source === "youssefLoan" || source === "tawfiqCustody";
 const actionRows = isLoanOrCustody ?
  processedRows.filter((row) => row.summaryLevel !== "opening" && row.summaryLevel !== "total" && row.summaryLevel !== "signature") :
  processedRows;
 
 const displayRows = useMemo(() => processedRows, [processedRows]);
 
 const activeSortColumn = source === "trainee" ? traineeSortColumn : sortColumn;
 const activeSortDirection = source === "trainee" ? traineeSortDirection : sortDirection;
 const colCount = sourceConfig.columns.length + 2;
 const amountColumnIndex = sourceConfig.columns.findIndex((col) => col.key === "amount");
 
 const deleteRow = (row: ReportRow) => {
  setDeletedRows((prev) => new Set([...prev, getReportRowKey(row, source)]));
 };
 const openReportsPrintSettings = () => {
  if (!displayRows.length) {
   toast.error("لا توجد بيانات للطباعة");
   return;
  }
  setPrintSettingsOpen(true);
 };
 const printReportWithSettings = (settings: InstallmentsPrintSettings) => {
  const marginMm = settings.margin === "narrow" ? 2 : settings.margin === "wide" ? 10 : 6;
  const pageWidthMm = settings.pageSize === "A3"
   ? (settings.orientation === "landscape" ? 420 : 297)
   : (settings.orientation === "landscape" ? 297 : 210);
  const visibleColumnCount = Math.max(1,
   sourceConfig.columns.filter((column) => !settings.hiddenColumns.includes(column.key)).length +
   (settings.hiddenColumns.includes("idx") ? 0 : 1));
  const fontSizePx = settings.fontMode === "manual"
   ? Math.max(5, Math.min(14, settings.fontSize))
   : Math.max(7, Math.min(13, (pageWidthMm - marginMm * 2) / (visibleColumnCount * 2.35)));
  const tableHtml = buildReportsScreenPrintHtml(source, settings.showHeader ? reportDateLabel : "", displayRows.length, settings);
  const finalCss = `
   #tableContainer .reports-print-table-shell { width:100%!important; min-width:0!important; max-width:100%!important; overflow:visible!important; }
   #tableContainer table.reports-data-table { width:100%!important; min-width:0!important; max-width:100%!important; table-layout:auto!important; border-collapse:collapse!important; }
   #tableContainer table.reports-data-table thead { display:table-header-group!important; }
   #tableContainer table.reports-data-table tbody { display:table-row-group!important; }
   #tableContainer table.reports-data-table tr, #tableContainer table.reports-data-table th, #tableContainer table.reports-data-table td, #tableContainer table.reports-data-table .pdf-cell-text { page-break-inside:avoid!important; break-inside:avoid!important; font-size:${fontSizePx}px!important; }
   #tableContainer table.reports-data-table th, #tableContainer table.reports-data-table td { min-width:0!important; max-width:100%!important; overflow-wrap:anywhere!important; }
   #tableContainer table.reports-data-table tr.signature-block-row, #tableContainer table.reports-data-table tr.signature-block-row td { page-break-inside:avoid!important; break-inside:avoid!important; }
  `;
  const opened = openBrowserPrintPreview({
   title,
   reportDateLabel: settings.showHeader ? reportDateLabel : "",
   tableHtml,
   contentCss: reportDocumentCss,
   finalCss: `${reportsTabPrintCss}\n${finalCss}`,
   defaultOrientation: settings.orientation,
   defaultPageSize: settings.pageSize,
   defaultMarginMm: marginMm,
  });
  if (!opened) toast.error("تم منع فتح نافذة المعاينة، يرجى السماح بالنوافذ المنبثقة في كروم");
 };
 return (
  <div className="mizan-reports-tab min-h-screen bg-gradient-to-br from-slate-100 via-sky-50 to-indigo-50 p-2 sm:p-4" dir="rtl">
      <section className="mx-auto w-full max-w-[210mm] overflow-hidden rounded-3xl border border-sky-200 bg-white shadow-xl">
        <header className="reports-tab-header bg-gradient-to-l from-[#2e6b8a] via-[#3d7fa0] to-[#2e6b8a] p-4 text-white sm:p-6">
          <div className="flex items-center gap-3">
            <div className="reports-header-icon flex h-12 w-12 items-center justify-center rounded-2xl bg-white/20 backdrop-blur-sm">
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
        <div className="reports-filter-panel border-b border-sky-100 bg-slate-50/70 p-4">
          <div className="reports-filter-grid grid grid-cols-2 gap-3 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
            <label className="flex flex-col gap-1 text-xs font-black text-slate-700">
              نوع التقرير
              <select
                value={source}
                onChange={(e) => {
                  setSource(e.target.value as ReportSource);
                  if (e.target.value === "traineeFeeStatus") {
                    setSortColumn("trainee");
                    setSortDirection("asc");
                  }
                  setDeletedRows(new Set());
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

            {source !== "youssefLoan" && source !== "tawfiqCustody" && source !== "trainee" && source !== "feeTotals" && source !== "traineeFeeStatus" && (
              <>
                <label className="flex flex-col gap-1 text-xs font-black text-slate-700">
                  الفترة الزمنية
                  <select
                    value={period}
                    onChange={(e) => setPeriod(e.target.value as PeriodType)}
                    className="rounded-xl border border-slate-300 bg-[#F1BF98] px-3 py-2 text-sm font-bold text-black outline-none focus:border-sky-600"
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
                    className="rounded-xl border border-slate-300 bg-[#5B5750] px-3 py-2 text-sm font-bold outline-none focus:border-sky-600"
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
                      رقم الدفعة
                      <select
                        value={selectedBatch}
                        onChange={(e) => setSelectedBatch(e.target.value)}
                        aria-label="تصفية كشف المدفوعات حسب رقم الدفعة"
                        className="rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm font-bold text-slate-900 outline-none focus:border-sky-600"
                      >
                        <option value="">كل الدفعات</option>
                        {batchOptions.map((batch) => (
                          <option key={batch} value={batch}>
                            {batch}
                          </option>
                        ))}
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
        <div className="reports-actions-panel p-4">
          <TabActions
            title={title}
            fileName="financial-report"
            rows={actionRows}
            printRows={displayRows}
            columns={sourceConfig.columns}
            printColumns={sourceConfig.columns}
            numericKeys={numericKeys}
            pdfFinalCss={reportsTabPrintCss}
            renderPrintTableHtml={(reportDateLabel) => buildReportsScreenPrintHtml(source, reportDateLabel, displayRows.length)}
            onPrintRequest={openReportsPrintSettings}
            pdfOrientation="portrait"
            includeTotalRow={!isLoanOrCustody && source !== "traineeFeeStatus"}
            printTableClassName={source === "trainee" ? "reports-trainee-payment-table" : ""}
          />
        </div>

        {/* جدول عرض التقرير */}
        
        <div className="reports-table-panel p-3 sm:p-4">
          <div className="reports-table-scroll">
            <table id="reports-table" className={`reports-data-table text-center text-xs ${source === "trainee" ? "reports-trainee-payment-table" : ""}`} style={{ tableLayout: "auto" }}>
              <thead>
                <>
                  <tr className="reports-custody-title-row">
                    <th colSpan={sourceConfig.columns.length + 2}>
                      {title.split("\n")[0]}
                    </th>
                  </tr>
                  <tr className="reports-custody-date-row">
                    <th colSpan={sourceConfig.columns.length + 2}>
                      {(source === "youssefLoan" || source === "tawfiqCustody")
                        ? title.split("\n").slice(1).join(" ")
                        : `تاريخ التقرير: ${formatReportDate(reportIssuedAt)} • عدد السجلات: ${displayRows.length}`}
                    </th>
                  </tr>
                </>
  <tr className="reports-column-header-row border border-black bg-[#FFD700] text-black">
   <th data-col-key="idx" className="w-5 border border-black px-2 py-3 font-black">م</th>
                  {sourceConfig.columns.map((col) => (
                    <th
                      key={col.key}
                      data-col-key={col.key}
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
                      className={`cursor-pointer border border-black px-2 py-2 font-black hover:bg-[#e6b800] ${numericKeys.includes(col.key) ? "reports-numeric-cell" : ["description", "name", "trainee", "specialty", "notes", "item"].includes(col.key) ? "reports-text-cell" : ""}`}
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
                  <th data-col-key="actions" className="w-12 border border-black px-2 py-3 font-black print:hidden">حذف</th>
                </tr></thead>

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
                     const grandTotalLabel = String(row.description ?? row.category ?? row.item ?? "").trim();
                     const isGrandTotal = isTotal && grandTotalLabel.includes("الإجمالي الكلي");
                     const isMergedGrandTotal = isGrandTotal && amountColumnIndex >= 0;
                    const isSignature = row.summaryLevel === "signature";
                    const isTraineeDetail = source === "trainee" && row.displayType === "تفصيلي";
                    const isTraineeAnnualTotal = source === "trainee" && row.summaryLevel === "trainee-name-total";
                    const isTraineeFeeTotal = source === "trainee" && row.summaryLevel === "trainee-fee-total";
                    const isTraineeSummary = source === "trainee" && Boolean(row.displayType) && row.displayType !== "تفصيلي" && !isTraineeAnnualTotal && !isTraineeFeeTotal && row.summaryLevel !== "fee" && row.summaryLevel !== "period";
                    const isTraineeTypedRow = isTraineeDetail || isTraineeSummary || isTraineeAnnualTotal;
                    const traineeRowCellStyle = isTraineeAnnualTotal
                      ? {
                          backgroundColor: "#2C666E",
                          color: "#ffffff",
                          WebkitPrintColorAdjust: "exact" as const,
                          printColorAdjust: "exact" as const,
                        }
                      : isTraineeDetail
                        ? {
                            backgroundColor: "#ffffff",
                            color: "#17324D",
                            WebkitPrintColorAdjust: "exact" as const,
                            printColorAdjust: "exact" as const,
                          }
                        : isTraineeSummary
                          ? {
                              backgroundColor: "#FFF1D6",
                              color: "#68420A",
                              WebkitPrintColorAdjust: "exact" as const,
                              printColorAdjust: "exact" as const,
                            }
                          : undefined;
 const totalCellStyle = isTotal ? {
backgroundColor: "#0437bb",
color: "#ffffff",
                          WebkitPrintColorAdjust: "exact" as const,
                          printColorAdjust: "exact" as const,
                        }
                      : undefined;

 let rowStyle = "";
 if (isOpening) rowStyle = "reports-opening-row bg-[#FBFEFF] font-bold text-black";
else if (isTotal) rowStyle = "bg-[#0437bb] font-bold text-white total-row";
                    else if (isTraineeDetail) rowStyle = "reports-detail-row bg-white font-bold text-[#17324D]";
                    else if (row.summaryLevel === "trainee-name-total") rowStyle = "reports-trainee-total-row bg-[#2C666E] font-bold text-white";
                    else if (row.summaryLevel === "fee") {
                      if (row.category === "رسوم الامتحانات") {
                        rowStyle = "reports-fee-row reports-exam-fee-total-row bg-[#D8F3DC] font-bold text-[#1B4332]";
                      } else if (row.category === "أقساط الدراسة والتسجيل") {
                        rowStyle = "reports-fee-row reports-tuition-fee-total-row bg-[#E8DFF5] font-bold text-[#3D315B]";
                      } else {
                        rowStyle = "reports-fee-row bg-[#F1BF98] font-bold text-[#38291F]";
                      }
                    }
                    else if (isTraineeFeeTotal) {
                      rowStyle = row.category === "رسوم الامتحانات"
                        ? "reports-fee-row reports-exam-fee-total-row bg-[#D8F3DC] font-bold text-[#1B4332]"
                        : "reports-fee-row reports-tuition-fee-total-row bg-[#E8DFF5] font-bold text-[#3D315B]";
                    }
                    else if (row.summaryLevel === "period") rowStyle = "reports-period-row bg-[#5B5750] font-bold text-white";
                    else if (isTraineeSummary) rowStyle = "reports-trainee-summary-row bg-[#FFF1D6] font-bold text-[#68420A]";
                    else rowStyle = "bg-white text-slate-900";

                    // قسم التوقيعات المدمج أسفل تقارير العهد (في سطر أفقي واحد مدمج)
                    if (isSignature) {
                      if (row.id !== "sig-1") return null;
                      return (
                        <React.Fragment key="unified-custody-signatures">
                        <tr aria-hidden="true" className="signature-spacer-row" style={{ height: "3mm" }}>
                          <td colSpan={colCount} style={{ height: "3mm", padding: 0, border: 0, background: "#ffffff" }} />
                        </tr>
                        <tr className="bg-white signature-block-row" style={{ border: 0, outline: 0, boxShadow: "none" }}>
                          <td colSpan={colCount} className="border-0 bg-white px-0 py-1" style={{ border: 0, outline: 0, boxShadow: "none" }}>
                            <div className="signature-block-grid mx-auto grid w-full max-w-5xl grid-cols-3 gap-x-3 gap-y-1">
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
                        </React.Fragment>
                      );
                    }

                     if (isMergedGrandTotal) {
                      return (
                        <tr
                          key={`${String(row.id || row.date)}-grand-total-${index}`}
                          className="report-grand-total-row total-row bg-[#0437bb] font-black text-white"
                          style={{
                            backgroundColor: "#0437bb",
                            color: "#ffffff",
                            WebkitPrintColorAdjust: "exact",
                            printColorAdjust: "exact",
                          }}
                        >
                          <td
                            data-col-key="description"
                            colSpan={amountColumnIndex + 1}
                            className="border border-black px-3 py-2 text-center font-black text-white"
                            style={totalCellStyle}
                          >
                            {grandTotalLabel}
                          </td>
                          <td
                            data-col-key="amount"
                            className="border border-black px-2 py-2 text-center font-black text-white font-mono"
                            style={totalCellStyle}
                          >
                            {formatCurrency(row.amount)}
                          </td>
                          <td
                            data-col-key="actions"
                            className="border border-black px-1 py-1 print:hidden"
                            style={totalCellStyle}
                          />
                        </tr>
                      );
                    }

                    return (
                      <tr
                        key={`${String(row.date)}-${String(row.trainee || row.name || "")}-${index}`}
                        className={`transition-colors ${rowStyle} ${isTotal ? "total-row" : ""}`}
                        style={
                          isTotal
                            ? {
                                backgroundColor: "#0437bb",
                                color: "#ffffff",
                                WebkitPrintColorAdjust: "exact",
                                printColorAdjust: "exact",
                              }
                            : undefined
                        }
                      >
                        <td data-col-key="idx" className="border border-black px-2 py-2 font-bold" style={isTotal ? totalCellStyle : traineeRowCellStyle}>
                          {isOpening ? "—" : isTotal ? "★" : index + 1}
                        </td>

                        {sourceConfig.columns.map((col) => {
                          const val = row[col.key];
                          const isNumeric = numericKeys.includes(col.key);
                          const isNoWrap = noWrapKeys.includes(col.key);
                          const isEditableCustodyRow = isLoanOrCustody && !isOpening && !isTotal;

                          // حقول إدخال يدوية لرقم كشف التسوية والملاحظات والمبلغ في تقارير العهد
                          if (isEditableCustodyRow && (col.key === "settlementNo" || col.key === "notes")) {
                            return (
                              <td key={col.key} data-col-key={col.key} className="max-w-[280px] whitespace-normal break-words [overflow-wrap:anywhere] border border-0 p-1 reports-text-cell">
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
                              <td key={col.key} data-col-key={col.key} className="border border-black p-1 font-mono font-black reports-numeric-cell">
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
                              data-col-key={col.key}
                              className={`border border-black px-2 py-2 font-bold ${
                                col.key === "description" ? "reports-description-cell" : isNumeric ? "reports-numeric-cell font-mono" : isNoWrap ? "reports-no-wrap-cell" : "reports-text-cell"
                              } bg-white text-slate-900`}
                              style={
                                isTotal
                                  ? totalCellStyle
                                  : isTraineeTypedRow
                                    ? traineeRowCellStyle
                                    : isNumeric
                                      ? {
                                          backgroundColor: "#ffffff",
                                          WebkitPrintColorAdjust: "exact",
                                          printColorAdjust: "exact",
                                        }
                                      : undefined
                              }
                            >
                              {col.key === "description" ? (
                                <div className="whitespace-normal break-words leading-snug">{val !== undefined && val !== null && String(val) !== "" ? String(val) : "—"}</div>
                              ) : isNumeric ? formatCurrency(val) : val !== undefined && val !== null && String(val) !== "" ? String(val) : "—"}
                            </td>
                          );
                        })}

                        <td data-col-key="actions" className="border border-black px-1 py-1 print:hidden" style={isTotal ? totalCellStyle : traineeRowCellStyle}>
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
      <PrintSettingsModal
        open={printSettingsOpen}
        year={fiscalYear}
        columnOptions={[{ key: "idx", label: "م" }, ...sourceConfig.columns]}
        onClose={() => setPrintSettingsOpen(false)}
        onPrint={printReportWithSettings}
        storageKey="reports-print-settings"
        contextLabel="إعدادات تقارير العام"
        manualFontMax={14}
      />
    </div>
 );
}
