/* ملف: src/components/InstallmentsTab.tsx
   ملاحظة: التغييرات تنسيقية فقط (CSS / classNames / ثوابت أحجام)
*/
import "./InstallmentsTab.css";
import React, { useDeferredValue, useEffect, useMemo,
  useState } from "react";
import { useStore,
  type InstallmentCustomColumn } from "@/lib/store";
import { isRegistrationFeeDescription } from "@/lib/feeClassification";
import { fmt } from "@/lib/format";
import { importInstallmentsInWorker } from "@/lib/excelImportWorkerClient";
import { toast } from "sonner";
import { useTableControls } from "@/hooks/useTableControls";
import {
  X,
  Printer,
  AlertCircle,
  Search,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  Edit,
  Plus,
  Trash,
  Palette,
  Settings,
  FileSpreadsheet,
  FileText,
  ClipboardList,
  Image as ImageIcon,
  Download,
} from "lucide-react";
import TabActions from "./TabActions";
import { noteRowClass,
  noteRowCss } from "@/lib/notesColors";
import type { WebActionItem } from "./WebActionMenu";
import PrintSettingsModal, {
  DEFAULT_PRINT_SETTINGS,
  type InstallmentsPrintSettings,
} from "./PrintSettingsModal";
import { openBrowserPrintPreview } from "@/lib/browserPrintPreview";
import { useReportDate } from "@/lib/reportDate";
import { reportLetterheadHtml } from "@/lib/printTableHtml";
import { downloadReportPdf, reportDocumentCss } from "@/lib/reportPdf";
import { reportArabicFontFacesCss, reportArabicFontStack } from "@/lib/reportArabicFonts";
import {
  addReportHeader,
  appendRows,
  createExcelWorkbook,
  downloadWorkbook,
  formatWorksheet,
  getExcelPalette,
  loadReportLetterhead,
} from "@/lib/excelExport";

const MONTHS_2025 = [
  "يونيو 2024",
  "يوليو 2024",
  "أغسطس 2024",
  "مارس 2025",
  "ابريل 2025",
  "مايو 2025",
  "يونيو 2025",
  "يوليو 2025",
  "أغسطس 2025",
  "سبتمبر 2025",
  "أكتوبر 2025",
  "نوفمبر2025",
  "ديسمبر2025",
];

const MONTHS_2026 = [
  "يناير",
  "فبراير",
  "مارس",
  "ابريل",
  "مايو",
  "يونيو",
  "يوليو",
  "اغسطس",
  "سبتمبر",
  "اكتوبر ",
  "نوفمبر",
  "ديسمبر",
];

const INSTALLMENT_PAGE_SIZE = 40;

// دالة تنظيف الأرقام واستخراج القيم العددية
const cleanNumber = (val: any):
  number => {
    if (!val || isNaN(Number(String(val)
        .replace(/[^0-9.-]/g, ""))))
      return 0;
    return Number(String(val).replace(
      /[^0-9.-]/g, "")) || 0;
  };

const escapeHtml = (value: any):
  string =>
  String(value ?? "")
  .replace(/&/g, "&amp;")
  .replace(/</g, "&lt;")
  .replace(/>/g, "&gt;")
  .replace(/"/g, "&quot;")
  .replace(/'/g, "&#39;");

const safePdfFileName = (value: any):
  string =>
  String(value || "متدرب")
  .replace(/[\\/:*?"<>|]/g, "-")
  .replace(/\s+/g, "_")
  .trim() || "متدرب";

/* ==========================
   ثوابت تنسيق عامة للموبايل
   ========================== */
// أحجام أيقونات وأزرار أصغر لتناسب شاشات شاومي
const ICON_MOBILE =
"w-4 h-4"; // أيقونات مضغوطة في الجداول والأزرار
const ICON_TAP =
"w-5 h-5"; // أيقونات لزرّات اللمس المهمة
const BTN_COMPACT =
  "px-2 py-1 text-xs rounded-md"; // أزرار أصغر وأكثر إحكامًا
const HEADING_MOBILE =
  "text-lg sm:text-xl font-extrabold";

const INSTALLMENTS_SUMMARY_REPORT_CSS = `
  html, body { margin: 0 !important; padding: 0 !important; }
  .report-page-content { width: 100% !important; min-width: 0 !important; }
  .report-page-content table { width: 100% !important; max-width: 100% !important; table-layout: fixed !important; border-collapse: collapse !important; }
  .report-page-content, .report-page-content table, .report-page-content th, .report-page-content td { font-family: ${reportArabicFontStack} !important; font-weight: 900 !important; }
  .report-page-content table th, .report-page-content table td, .report-page-content table th *, .report-page-content table td * { font-size: 8px !important; }
  .report-page-content th, .report-page-content td { box-sizing: border-box !important; padding: 1px 2px !important; margin: 0 !important; vertical-align: middle !important; text-align: center !important; white-space: normal !important; line-height: 1.1 !important; overflow: hidden !important; }
  .report-page-content th { background: #0f766e !important; color: #000 !important; }
  .report-page-content td { color: #000 !important; overflow-wrap: anywhere !important; word-break: normal !important; }
  .report-page-content td.numeric-cell, .report-page-content th.numeric-cell,
  .report-page-content td.numeric-cell *, .report-page-content th.numeric-cell * {
    white-space: nowrap !important; overflow-wrap: normal !important; word-break: keep-all !important;
    direction: ltr !important; unicode-bidi: isolate !important; font-variant-numeric: tabular-nums !important;
    max-width: 100% !important; overflow: hidden !important; text-overflow: clip !important;
  }
  .report-page-content table.reports-data-table th[data-col-key="notes"],
  .report-page-content table.reports-data-table td[data-col-key="notes"] {
    width: 1% !important; max-width: 10% !important; white-space: normal !important;
    overflow-wrap: anywhere !important; word-break: normal !important;
  }
  .report-page-content .num, .report-page-content .numeric-cell { white-space: nowrap !important; word-break: keep-all !important; direction: ltr !important; }
  .report-page-content h1, .report-page-content h2 { margin: 0 0 5px !important; text-align: center !important; }
  /* Summary print style for installments 2026 mirrors visible screen table. */
  .report-page-content table.installments-summary-2026 { border-collapse: collapse !important; direction: rtl !important; }
  .report-page-content table.installments-summary-2026 thead th { background: linear-gradient(180deg,#7dd3fc 0%,#38bdf8 52%,#0ea5e9 100%) !important; color: #000 !important; border: 1px solid #000000 !important; border-color: #000000 !important; -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; }
  .report-page-content table.installments-summary-2026 thead th[data-col-key="idx"], .report-page-content table.installments-summary-2026 thead th[data-col-key="name"] { color: #fff !important; }
  .report-page-content table.installments-summary-2026 tbody td { border: 1px solid #000000 !important; border-color: #000000 !important; color: #000000 !important; -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; }
  .report-page-content table.installments-summary-2026 tbody td[data-col-key="name"] { background: #fdf4ff !important; }
  .report-page-content table.installments-summary-2026 tbody td[data-col-key="batch"], .report-page-content table.installments-summary-2026 tbody td[data-col-key="specialty"], .report-page-content table.installments-summary-2026 tbody td[data-col-key="fees"] { background: #f0f9ff !important; }
  .report-page-content table.installments-summary-2026 tbody td[data-col-key="prevDue"] { background: #f8fcff !important; }
  .report-page-content table.installments-summary-2026 tbody td[data-col-key="totalPaid"] { background: #ecfdf5 !important; }
  .report-page-content table.installments-summary-2026 tbody td[data-col-key="remaining"] { background: #fff1f2 !important; }
  .report-page-content table.installments-summary-2026 tbody td[data-col-key="notes"] { background: #fffbeb !important; }
  .report-page-content table.installments-summary-2026 tbody tr.total-row > td, .report-page-content table.installments-summary-2026 tbody tr.total-row > td * { background: #e0f2fe !important; color: #000000 !important; border: 1px solid #000000 !important; border-color: #000000 !important; font-weight: 900 !important; -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; }
`;

// All PDF reports use the same paper layout and measured row pagination.
const downloadDetailedHtmlPdf =
  downloadReportPdf;

// شبكة إحصائيات علوية بتصميم عصري
const StatsGrid = ({ stats, columns =
  3 }: { stats: any[];columns ? :
  number }) => {
const colClass = columns === 4 ?
  "grid-cols-4" : "grid-cols-3";
return (
  <div className={`grid ${colClass} gap-1.5 sm:gap-2 mb-3 sm:mb-4`}>
      {stats.map((stat, idx) => (
        <div
          key={idx}
          // خففنا min-height لجعل البطاقات أكثر إحكامًا على الشاشات الصغيرة
className={`${stat.bgClass} relative overflow-hidden min-h-[46px] sm:min-h-[56px] px-2 sm:px-3 py-1 sm:py-2 rounded-xl sm:rounded-2xl border ${stat.borderClass} shadow-sm`}
        >
<span className={`absolute inset-y-0 right-0 w-1 sm:w-1.5 ${stat.accentClass || "bg-sky-500"}`} />
<div className="pr-1.5 sm:pr-2 min-w-0">
<div className="text-xs leading-tight sm:text-xs font-bold text-slate-500 truncate">
              {stat.label}
</div>
            <div className="text-sm sm:text-xl numeric-cell font-mono font-extrabold mt-0.5 text-slate-900 tabular-nums truncate">
              {stat.value}
            </div>
          </div>
        </div>
))
}
</div>
);
};

// مكوّن النافذة المنبثقة العامة
const Modal = ({
  title,
  isOpen,
  onClose,
  children,
}: {
  title: string;
  isOpen: boolean;
  onClose: () => void;
  children: React.ReactNode;
}) => {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 bg-black/40 flex items-end sm:items-center justify-center z-50 p-2 sm:p-4">
      <div
        className="bg-white rounded-t-2xl sm:rounded-2xl w-full max-w-md shadow-2xl max-h-[90vh] overflow-y-auto"
        dir="rtl"
      >
        <div className="flex justify-between items-center p-3 sm:p-4 border-b bg-gradient-to-l from-blue-50 to-slate-50 sticky top-0 z-10">
          <h3 className={`font-bold text-sm sm:text-base ${HEADING_MOBILE}`}>{title}</h3>
          <button onClick={onClose} className="p-1 hover:bg-slate-200 rounded-lg">
            <X className={`${ICON_MOBILE} text-slate-600`} />
          </button>
        </div>
        <div className="p-3 sm:p-4 space-y-3">{children}</div>
      </div>
    </div>
  );
};

// أيقونة الفرز للأعمدة
const SortIcon = ({
  sortConfig,
  columnKey,
}: {
  sortConfig: { key: string;direction: "asc" |
      "desc" } | null;
  columnKey: string;
}) => {
  if (sortConfig?.key !== columnKey)
    return <ArrowUpDown className="w-3 h-3 text-white/70" />;
  return sortConfig.direction ===
    "asc" ? (
      <ArrowUp className="w-3 h-3 text-emerald-300" />
    ) : (
      <ArrowDown className="w-3 h-3 text-emerald-300" />
    );
};

export default function InstallmentsTab() {
  const {
    installments,
    hafiza,
    installments2025,
    clearInstallments,
    installmentCustomColumns2026,
    installmentConditionalRules2026,
    setInstallmentCustomColumns2026,
    setInstallmentConditionalRules2026,
  } = useStore() as any;
  const { reportDate,
    reportDateLabel } = useReportDate();
  
  const [paymentModal,
  setPaymentModal] = useState <
    { row: any;month: string } | null >
    (null);
  const [payAmount, setPayAmount] =
  useState("");
  const [newPaymentModal,
    setNewPaymentModal
  ] = useState(false);
  const [newStudentName,
    setNewStudentName
  ] = useState("");
  const [newStudentAmount,
    setNewStudentAmount
  ] = useState("");
  const [newStudentMonth,
    setNewStudentMonth
  ] = useState("");
  const [editPaymentModal,
    setEditPaymentModal
  ] = useState < {
    row: any;
    month: string;
    amount: number;
  } | null > (null);
  const [editAmount, setEditAmount] =
  useState("");
  const [nameSuggestions,
    setNameSuggestions
  ] = useState < string[] > ([]);
  const [showSuggestions,
    setShowSuggestions
  ] = useState(false);
  const [, setHoveredCell] = useState <
    string | null > (null);
  const [importError, setImportError] =
  useState < string | null > (null);
  const [importingYear, setImportingYear] = useState<2025 | 2026 | null>(null);
  const [page2025, setPage2025] = useState(1);
  const [page2026, setPage2026] = useState(1);
  const [printSettingsYear,
    setPrintSettingsYear
  ] = useState < number | null > (null);
  const [detailedPdfBusy2026,
    setDetailedPdfBusy2026
  ] = useState(false);
  const [feeDemandTrainee, setFeeDemandTrainee] = useState<{ name: string; registrationPaid: number; examPaid: number } | null>(null);
  const [feeDemandIncludeRegistration, setFeeDemandIncludeRegistration] = useState(false);
  const [feeDemandIncludeExam, setFeeDemandIncludeExam] = useState(true);
  const [feeDemandIncludeFinalWritten, setFeeDemandIncludeFinalWritten] = useState(false);
  const [feeDemandIncludeOralScientific, setFeeDemandIncludeOralScientific] = useState(false);
  const [feeDemandIncludeOralClinical, setFeeDemandIncludeOralClinical] = useState(false);
  const [feeDemandRegistrationAmount, setFeeDemandRegistrationAmount] = useState(10000);
  const [feeDemandExamAmount, setFeeDemandExamAmount] = useState(30000);
  const [feeDemandSignatures, setFeeDemandSignatures] = useState<{ department: string; director: string; signer: string }>(() => {
    try {
      const saved = localStorage.getItem("reports-fee-demand-signatures-v1");
      if (saved) return { department: "الشؤون المالية", director: "", signer: "", ...JSON.parse(saved) };
    } catch {}
    return { department: "الشؤون المالية", director: "", signer: "" };
  });
  useEffect(() => {
    try {
      localStorage.setItem("reports-fee-demand-signatures-v1", JSON.stringify(feeDemandSignatures));
    } catch {}
  }, [feeDemandSignatures]);
  
  const [search2025, setSearch2025] =
  useState("");
  const [search2026, setSearch2026] =
  useState("");
  const deferredSearch2025 = useDeferredValue(search2025);
  const deferredSearch2026 = useDeferredValue(search2026);
  
  const [sortConfig2025,
    setSortConfig2025
  ] = useState < {
    key: string;
    direction: "asc" | "desc";
  } | null > (null);
  const [sortConfig2026,
    setSortConfig2026
  ] = useState < {
    key: string;
    direction: "asc" | "desc";
  } | null > (null);
  
  const [editRowModal,
  setEditRowModal] = useState < {
    year: number;
    row: any;
    index: number;
  } | null > (null);
  const [editRowData, setEditRowData] =
  useState < any > ({});
  
  const extraCols2026 = (
    installmentCustomColumns2026 || []
    ) as InstallmentCustomColumn[];
  const [newColModal, setNewColModal] =
  useState(false);
  const [newColName, setNewColName] =
  useState("");
  const [newColType, setNewColType] =
  useState < "text" | "select" |
    "formula" > ("text");
  const [newColOptions,
    setNewColOptions] = useState("");
  const [newColFormula,
    setNewColFormula] = useState("");
  
  const [editColModal,
  setEditColModal] = useState < {
    oldName: string;
    name: string;
    type: "text" | "select" |
      "formula";
    options: string;
    formula: string;
  } | null > (null);
  
  const [condFormatModal,
    setCondFormatModal
  ] = useState(false);
  const [condFormatParams,
    setCondFormatParams
  ] = useState({ text: "",
    color: "bg-sky-100" });
  const condFormatRules = (
    installmentConditionalRules2026 ||
    []) as Array < {
    text: string;
    color: string;
  } > ;
  
  const [newRowModal2026,
    setNewRowModal2026
  ] = useState(false);
  const [newRowData2026,
    setNewRowData2026
  ] = useState({
    name: "",
    batch: "",
    specialty: "",
    prevDue: 0,
    fees: 0,
  });
  
  const controls2026 = useTableControls(
    installments || [], [
      "name",
      "batch",
      "specialty",
      "fees",
      "prevDue",
      "totalPaid",
      "remaining",
    ]);
  const controls2025 = useTableControls(
    installments2025 || [], [
      "name",
      "batch",
      "specialty",
      "fees",
      "totalPaid",
      "remaining",
    ]);
  
  const evaluateFormula = (formula:
    string, row: any) => {
    if (!formula) return "";
    try {
      let parsedFormula = formula;
      const variables: Record <
        string, number > = {
          fees: cleanNumber(row.fees),
          prevDue: cleanNumber(row
            .prevDue),
          totalPaid: cleanNumber(row
            .totalPaid),
          remaining: cleanNumber(row
            .remaining),
        };
      
      extraCols2026.forEach((col) => {
        if (col.type !==
          "formula") {
          variables[col.name] =
            cleanNumber(row
              .customData?.[col
                .name
              ]);
        }
      });
      
      Object.keys(variables).forEach((
        key) => {
        const regex = new RegExp(
          `\\b${key}\\b`, "g");
        parsedFormula =
          parsedFormula.replace(
            regex, variables[key]
            .toString());
      });
      
      const result = new Function(
        `return ${parsedFormula}`)();
      return isNaN(result) ? "خطأ" :
        Number(result).toFixed(2);
    } catch (e) {
      return "صيغة غير صالحة";
    }
  };
  
  const getConditionalRowPrintStyle = (row: any): string => {
    const searchableValues = [
      row.name, row.batch, row.specialty, row.prevDue, row.fees, row.totalPaid, row.remaining, row.notes,
      ...Object.values(row.payments || {}), ...Object.values(row.customData || {}),
    ].map((value) => String(value ?? "").toLowerCase());
    const matchedRule = condFormatRules.find((rule) => {
      const term = String(rule.text || "").trim().toLowerCase();
      return term.length > 0 && searchableValues.some((value) => value.includes(term));
    });
    const notesTone = getNotesStatusTone(row.notes);
    const notesPrintColors: Record<NotesStatusTone, string> = { red: "#fecaca", yellow: "#fef08a", green: "#bbf7d0", orange: "#fed7aa", blue: "#e0f2fe", emerald: "#ecfdf5" };
    if (notesTone) return `background-color: ${notesPrintColors[notesTone]} !important; -webkit-print-color-adjust: exact; print-color-adjust: exact;`;
    const colorMap: Record<string, string> = {
      "bg-sky-100": "#e0f2fe", "bg-blue-100": "#dbeafe", "bg-indigo-100": "#e0e7ff",
      "bg-violet-100": "#ede9fe", "bg-purple-100": "#f3e8ff", "bg-pink-100": "#fce7f3",
      "bg-rose-100": "#ffe4e6", "bg-red-100": "#fee2e2", "bg-orange-100": "#ffedd5",
      "bg-amber-100": "#fef3c7", "bg-yellow-100": "#fef9c3", "bg-lime-100": "#ecfccb",
      "bg-green-100": "#dcfce7", "bg-emerald-100": "#d1fae5", "bg-teal-100": "#ccfbf1",
      "bg-cyan-100": "#cffafe", "bg-slate-100": "#f1f5f9", "bg-gray-100": "#f3f4f6",
    };
    const color = matchedRule?.color ? colorMap[matchedRule.color] : undefined;
    return color ? `background-color: ${color} !important; -webkit-print-color-adjust: exact; print-color-adjust: exact;` : "";
  };

  // نفس ألوان الحالة الأكاديمية في تبويب بيانات المتدربين،
  // وتُطبّق هنا على كامل صف أقساط 2026 بحسب عمود الملاحظات فقط.
  const normalizeNotesStatus = (value: unknown) =>
    String(value ?? "")
      .trim()
      .replace(/[ًٌٍَُِّْـ]/g, "")
      .replace(/[إأآ]/g, "ا")
      .replace(/ى/g, "ي")
      .replace(/ة/g, "ه")
      .replace(/\s+/g, " ")
      .toLocaleLowerCase("ar");

  type NotesStatusTone = "red" | "yellow" | "green" | "orange" | "blue" | "emerald";

  const getNotesStatusTone = (value: unknown): NotesStatusTone | null => {
    const status = normalizeNotesStatus(value);
    if (!status) return null;
    if (["منسحب", "منسحبه", "انسحب", "انسحبت", "منقطع", "منقطعه", "مستقيل", "مستقيله"].includes(status))
      return "red";
    if (["مفصول", "مفصوله", "فصل", "راسب", "راسبه"].includes(status))
      return "yellow";
    if (["متخرج", "متخرجه", "خريج", "خريجه"].includes(status))
      return "green";
    if (["موقوف", "موقوفه", "معتذر", "معتذره"].includes(status))
      return "orange";
    if (["مؤجل", "مؤجله"].includes(status))
      return "blue";
    if (["مستمر", "مستمره", "منتظم", "منتظمه", "على راس العمل"].includes(status))
      return "emerald";
    return null;
  };

  const getNotesStatusRowClass = (value: unknown) => {
    const tone = getNotesStatusTone(value);
    const classes: Record<NotesStatusTone, string> = {
      red: "bg-red-200 [&>td]:!bg-red-200",
      yellow: "bg-yellow-200 [&>td]:!bg-yellow-200",
      green: "bg-green-200 [&>td]:!bg-green-200",
      orange: "bg-orange-200 [&>td]:!bg-orange-200",
      blue: "bg-sky-100 [&>td]:!bg-sky-100",
      emerald: "bg-emerald-50 [&>td]:!bg-emerald-50",
    };
    return tone ? classes[tone] : "";
  };

  const getNotesStatusPrintClass = (value: unknown) => {
    const tone = getNotesStatusTone(value);
    return tone ? `notes-status-${tone}` : "";
  };

  const getConditionalRowClass = (row: any) => {
    const searchableValues = [
      row.name,
      row.batch,
      row.specialty,
      row.prevDue,
      row.fees,
      row.totalPaid,
      row.remaining,
      row.notes,
      ...Object.values(row
        .payments || {}),
      ...Object.values(row
        .customData || {}),
    ].map((val) => String(val ?? "")
      .toLowerCase());
    
    const matchedRule =
      condFormatRules.find((rule) => {
        const term = rule.text
        .trim().toLowerCase();
        return term.length > 0 &&
          searchableValues.some((
              value) => value
            .includes(term));
      });
    
    return matchedRule?.color ||
      "hover:bg-slate-50/80";
  };
  
  const addConditionalRule = () => {
    if (!condFormatParams.text.trim())
      return toast.error(
        "يرجى إدخال نص الشرط");
    setInstallmentConditionalRules2026
      ([
        ...condFormatRules,
        { ...condFormatParams,
          text: condFormatParams
            .text.trim() },
      ]);
    setCondFormatParams({ text: "",
      color: "bg-sky-100" });
    toast.success(
      "تمت إضافة قاعدة التنسيق");
  };
  
  const deleteConditionalRule = (index:
    number) => {
    setInstallmentConditionalRules2026
      (condFormatRules.filter((_,
        i) => i !== index));
  };
  
  const filteredRows2025 = useMemo(
() => {
    let result = controls2025
      .rows || [];
    if (deferredSearch2025) {
      const term = deferredSearch2025
        .toLowerCase();
      result = result.filter(
        (r: any) =>
        (r.name && r.name
          .toLowerCase().includes(
            term)) ||
        (r.batch && String(r
            .batch).toLowerCase()
          .includes(term)) ||
        (r.specialty && r
          .specialty.toLowerCase()
          .includes(term)),
      );
    }
    if (sortConfig2025) {
      result = [...result].sort((a:
        any, b: any) => {
        let aVal = a[
          sortConfig2025.key];
        let bVal = b[
          sortConfig2025.key];
        if (["fees",
            "totalPaid",
            "remaining"
          ].includes(
            sortConfig2025.key
            )) {
          aVal = cleanNumber(
            aVal);
          bVal = cleanNumber(
            bVal);
        } else {
          aVal = aVal ? String(
            aVal)
          .toLowerCase() : "";
          bVal = bVal ? String(
            bVal)
          .toLowerCase() : "";
        }
        if (aVal < bVal)
        return sortConfig2025
          .direction ===
          "asc" ? -1 : 1;
        if (aVal > bVal)
        return sortConfig2025
          .direction ===
          "asc" ? 1 : -1;
        return 0;
      });
    }
    return result;
  }, [controls2025.rows, deferredSearch2025,
    sortConfig2025
  ]);
  
  const filteredRows2026 = useMemo(
() => {
    let result = controls2026
      .rows || [];
    if (deferredSearch2026) {
      const term = deferredSearch2026
        .toLowerCase();
      result = result.filter(
        (r: any) =>
        (r.name && r.name
          .toLowerCase().includes(
            term)) ||
        (r.batch && String(r
            .batch).toLowerCase()
          .includes(term)) ||
        (r.specialty && r
          .specialty.toLowerCase()
          .includes(term)) ||
        (r.customData &&
          Object.values(r
            .customData).some((
              val) => String(val)
            .toLowerCase()
            .includes(term))),
      );
    }
    if (sortConfig2026) {
      result = [...result].sort((a:
        any, b: any) => {
        let aVal = a[
          sortConfig2026.key];
        let bVal = b[
          sortConfig2026.key];
        if (["prevDue", "fees",
            "totalPaid",
            "remaining"
          ].includes(
            sortConfig2026.key
            )) {
          aVal = cleanNumber(
            aVal);
          bVal = cleanNumber(
            bVal);
        } else {
          aVal = aVal ? String(
            aVal)
          .toLowerCase() : "";
          bVal = bVal ? String(
            bVal)
          .toLowerCase() : "";
        }
        if (aVal < bVal)
        return sortConfig2026
          .direction ===
          "asc" ? -1 : 1;
        if (aVal > bVal)
        return sortConfig2026
          .direction ===
          "asc" ? 1 : -1;
        return 0;
      });
    }
    return result;
  }, [controls2026.rows, deferredSearch2026,
    sortConfig2026
  ]);

  const originalIndex2025 = useMemo(() => {
    const indices = new Map<string, number>();
    (installments2025 || []).forEach((row: any, index: number) => {
      if (!indices.has(row.name)) indices.set(row.name, index);
    });
    return indices;
  }, [installments2025]);
  const originalIndex2026 = useMemo(() => {
    const indices = new Map<string, number>();
    (installments || []).forEach((row: any, index: number) => {
      if (!indices.has(row.name)) indices.set(row.name, index);
    });
    return indices;
  }, [installments]);
  const totalPages2025 = Math.max(1, Math.ceil(filteredRows2025.length / INSTALLMENT_PAGE_SIZE));
  const totalPages2026 = Math.max(1, Math.ceil(filteredRows2026.length / INSTALLMENT_PAGE_SIZE));
  const currentPage2025 = Math.min(page2025, totalPages2025);
  const currentPage2026 = Math.min(page2026, totalPages2026);
  const pageRows2025 = useMemo(
    () => filteredRows2025.slice((currentPage2025 - 1) * INSTALLMENT_PAGE_SIZE, currentPage2025 * INSTALLMENT_PAGE_SIZE),
    [filteredRows2025, currentPage2025],
  );
  const pageRows2026 = useMemo(
    () => filteredRows2026.slice((currentPage2026 - 1) * INSTALLMENT_PAGE_SIZE, currentPage2026 * INSTALLMENT_PAGE_SIZE),
    [filteredRows2026, currentPage2026],
  );
  
  const handleSort2025 = (key:
    string) => {
      let direction: "asc" | "desc" =
        "asc";
      if (sortConfig2025 &&
        sortConfig2025.key === key &&
        sortConfig2025.direction ===
        "asc")
        direction = "desc";
      setSortConfig2025({ key,
          direction });
    };
  
  const handleSort2026 = (key:
    string) => {
      let direction: "asc" | "desc" =
        "asc";
      if (sortConfig2026 &&
        sortConfig2026.key === key &&
        sortConfig2026.direction ===
        "asc")
        direction = "desc";
      setSortConfig2026({ key,
          direction });
    };
  
  const totals2025 = useMemo(
    () => ({
      fees: (filteredRows2025 || [])
        .reduce((s, r) => s +
          cleanNumber(r.fees), 0),
      paid: (filteredRows2025 || [])
        .reduce((s, r) => s +
          cleanNumber(r.totalPaid),
          0),
      remaining: (
          filteredRows2025 || [])
        .reduce((s, r) => s +
          cleanNumber(r.remaining),
          0),
      months: MONTHS_2025.reduce((
          acc, m) => {
          acc[m] = (
            filteredRows2025 ||
            []).reduce((s, r) =>
            s + cleanNumber(r
              .payments?.[m]), 0
            );
          return acc;
        }, {} as Record < string,
        number > ),
    }),
    [filteredRows2025],
  );
  
  const totals2026 = useMemo(
    () => ({
      prevDue: (filteredRows2026 ||
          []).reduce((s, r) => s +
          cleanNumber(r.prevDue), 0
          ),
      fees: (filteredRows2026 || [])
        .reduce((s, r) => s +
          cleanNumber(r.fees), 0),
      paid: (filteredRows2026 || [])
        .reduce((s, r) => s +
          cleanNumber(r.totalPaid),
          0),
      remaining: (
          filteredRows2026 || [])
        .reduce((s, r) => s +
          cleanNumber(r.remaining),
          0),
      months: MONTHS_2026.reduce((
          acc, m) => {
          acc[m] = (
            filteredRows2026 ||
            []).reduce((s, r) =>
            s + cleanNumber(r
              .payments?.[m]), 0
            );
          return acc;
        }, {} as Record < string,
        number > ),
    }),
    [filteredRows2026],
  );
  
  const allNames = useMemo(() => {
    const n1 = (installments2025 ||
      []).map((s: any) => s.name);
    const n2 = (installments || [])
      .map((s: any) => s.name);
    return [...new Set([...n1, ...
      n2])];
  }, [installments2025,
    installments]);
  
  const handleNameChange = (val:
    string) => {
      setNewStudentName(val);
      setShowSuggestions(val.length >
      0);
      setNameSuggestions(
        val.length > 0 ? allNames
        .filter((n) => n.toLowerCase()
          .includes(val.toLowerCase())
          ) : [],
      );
    };
  
  const updateInstallments = (list:
  any[]) => useStore
.setState({ installments: list });
  const updateInstallments2025 = (list:
    any[]) => useStore
.setState({ installments2025: list });
  
  // تصدير ملف Excel مصحح ومكتمل
  const exportToExcel = async (year:
    number) => {
    try {
      const monthsList = year ===
        2025 ? MONTHS_2025 :
        MONTHS_2026;
      const rows = year === 2025 ?
        filteredRows2025 :
        filteredRows2026;
      const extraCols = year ===
        2026 ? extraCols2026 : [];
      
      const headers =
        year === 2025 ?
        ["#", "اسم المتدرب",
          "الدفعة", "المساق",
          "الرسوم", ...monthsList,
          "المسدد", "المتبقي"
        ] :
        [
          "#",
          "اسم المتدرب",
          "الدفعة",
          "المساق",
          "المتبقي من 2025",
          "الرسوم",
          ...monthsList,
          ...extraCols.map((c) => c
            .name),
          "مسدد 2026",
          "الرصيد المتبقي",
          "الحالة",
        ];
      
      const data = rows.map((row:
        any, i: number) => {
        if (year === 2025) {
          return [
            i + 1,
            row.name || "",
            row.batch || "",
            row.specialty ||
            "",
            row.fees || 0,
            ...monthsList.map(
              (m) => row
              .payments?.[
              m] || 0),
            row.totalPaid ||
            0,
            row.remaining ||
            0,
          ];
        }
        const status = row
          .remaining <= 0 ?
          "له" : "عليه";
        return [
          i + 1,
          row.name || "",
          row.batch || "",
          row.specialty || "",
          row.prevDue || 0,
          row.fees || 0,
          ...monthsList.map((
              m) => row
            .payments?.[m] ||
            0),
          ...extraCols.map((
            col) => {
            if (col.type ===
              "formula")
              return evaluateFormula(
                col
                .formula ||
                "", row);
            return row
              .customData?.[
                col.name
              ] || "";
          }),
          row.totalPaid || 0,
          row.remaining || 0,
          status,
        ];
      });
      
      const totalRow =
        year === 2025 ?
        [
          "الإجمالي", "", "", "",
          totals2025.fees,
          ...monthsList.map((m) =>
            totals2025.months[m] ||
            0),
          totals2025.paid,
          totals2025.remaining,
        ] :
        [
          "الإجمالي", "", "", "",
          totals2026.prevDue,
          totals2026.fees,
          ...monthsList.map((m) =>
            totals2026.months[m] ||
            0),
          ...extraCols.map(() =>
          ""), totals2026.paid,
          totals2026.remaining, "",
        ];
      
      const workbook =
        await createExcelWorkbook();
      const worksheet = workbook
        .addWorksheet(
          `أقساط ${year}`, { views: [
            { rightToLeft: true }] }
          );
      const imageId =
        await loadReportLetterhead(
          workbook);
      const dataStartRow =
        addReportHeader(workbook,
          worksheet, {
            title: `أقساط العام ${year}`,
            reportDateLabel,
            recordCount: rows
              .length,
            totalColumns: headers
              .length,
            palette: getExcelPalette(
              `أقساط العام ${year}`
              ),
          }, imageId);
      appendRows(worksheet, [
        headers, ...data,
        totalRow
      ], dataStartRow);
      formatWorksheet(worksheet, {
        headerRow: dataStartRow,
        totalRows: [
          dataStartRow + data
          .length + 1
        ],
        palette: getExcelPalette(
          `أقساط العام ${year}`
          ),
        maxColumnWidth: 28,
      });
      await downloadWorkbook(
        workbook,
        `جدول_أقساط_${year}_${reportDate}.xlsx`
        );
      toast.success(
        "تم تصدير ملف Excel بنجاح"
        );
    } catch (error) {
      console.error(
        "Installments Excel export error:",
        error);
      toast.error(
        "حدث خطأ أثناء تصدير ملف Excel"
        );
    }
  };
  
  // خيارات الأعمدة المتاحة في نافذة إعدادات الطباعة
  const printColumnOptions = (year:
    number) => {
    const monthsList = year === 2025 ?
      MONTHS_2025 : MONTHS_2026;
    const opts: { key: string; label: string }[] = [
        { key: "batch",
          label: "الدفعة" },
        { key: "specialty",
          label: "المساق" },
      ];
    if (year === 2026) opts
  .push({ key: "prevDue",
      label: "مدور 2025" });
    opts.push({ key: "fees",
      label: "الرسوم" });
    monthsList.forEach((m) => opts
      .push({ key: `month:${m}`,
        label: m.trim() }));
    if (year === 2026)
      extraCols2026.forEach((c) =>
        opts.push({ key: `col:${c.name}`,
          label: c.name }));
    opts.push({ key: "totalPaid",
      label: "إجمالي المسدد" });
    opts.push({ key: "remaining",
      label: "الرصيد المتبقي" });
    if (year === 2026) {
      opts.push({ key: "status",
        label: "الحالة" });
      opts.push({ key: "notes",
        label: "الملاحظات" });
    }
    return opts;
  };
  
  
  const exportToPDF = async (
    year: number,
    settings:
    InstallmentsPrintSettings =
    DEFAULT_PRINT_SETTINGS,
    options: { download ? :
    boolean } = {},
  ): Promise < void > => {
    try {
      const monthsList = year ===
        2025 ? MONTHS_2025 :
        MONTHS_2026;
      const rows = year === 2025 ?
        filteredRows2025 :
        filteredRows2026;
      const extraCols = year ===
        2026 ? extraCols2026 : [];
      const date = reportDateLabel;
      const hidden = new Set(
        settings.hiddenColumns ||
        []);
      
      type PrintCol = {
        key: string;
        label: string;
        cell: (row: any, i:
          number) => string;
        total ? : () => string;
        wide ? : boolean;
        tone ? : "paid" | "due" |
          "fees" | "plain";
      };
      
      const sum = (fn: (r: any) =>
          any) =>
        (rows || []).reduce((s:
            number, r: any) => s +
          cleanNumber(fn(r)), 0);
      
      const allCols:
  PrintCol[] = [];
      allCols.push({
        key: "idx",
        label: "م",
        cell: (_r, i) => String(
          i + 1),
      });
      allCols.push({
        key: "name",
        label: "اسم المتدرب",
        cell: (r) => escapeHtml(
          r.name || ""),
        wide: true,
      });
      allCols.push({ key: "batch",
        label: "الدفعة", cell: (
          r) => escapeHtml(r
          .batch || "—") });
      allCols.push({
        key: "specialty",
        label: "المساق",
        cell: (r) => escapeHtml(
          r.specialty || "—"),
        wide: true,
      });
      if (year === 2026) {
        allCols.push({
          key: "prevDue",
          label: "مدور 2025",
          cell: (r) => fmt(
            cleanNumber(r
              .prevDue)),
          total: () => fmt(sum((
              r) => r
            .prevDue)),
          tone: "due",
        });
      }
      allCols.push({
        key: "fees",
        label: "الرسوم",
        cell: (r) => fmt(
            cleanNumber(r.fees)
            ),
        total: () => fmt(sum((
          r) => r.fees)),
        tone: "fees",
      });
      monthsList.forEach((m) => {
        allCols.push({
          key: `month:${m}`,
          label: m.trim(),
          cell: (r) => (
            cleanNumber(r
              .payments?.[
                m
              ]) ? fmt(
              cleanNumber(
                r
                .payments[
                  m])) :
            "—"),
          total: () => {
            const t = sum(
              (r) => r
              .payments
              ?.[m]);
            return t > 0 ?
              fmt(t) :
              "—";
          },
        });
      });
      extraCols.forEach((col) => {
        allCols.push({
          key: `col:${col.name}`,
          label: col.name,
          cell: (r) =>
            col.type ===
            "formula" ?
            escapeHtml(
              evaluateFormula(
                col
                .formula ||
                "", r)) :
            escapeHtml(r
              .customData?.[
                col.name
              ] || "—"),
          total: col
            .type ===
            "formula" ?
            () => {
              const t = (
                rows || []
                ).reduce(
                (s:
                  number,
                  r: any
                  ) => s +
                cleanNumber(
                  evaluateFormula(
                    col
                    .formula ||
                    "", r)
                  ),
                0,
              );
              return t !==
                0 ? fmt(t) :
                "—";
            } :
            undefined,
        });
      });
      allCols.push({
        key: "totalPaid",
        label: "إجمالي المسدد",
        cell: (r) => fmt(
          cleanNumber(r
            .totalPaid)),
        total: () => fmt(sum((
            r) => r.totalPaid
            )),
        tone: "paid",
      });
      allCols.push({
        key: "remaining",
        label: "الرصيد المتبقي",
        cell: (r) => fmt(
          cleanNumber(r
            .remaining)),
        total: () => fmt(sum((
            r) => r.remaining
            )),
        tone: "due",
      });
      if (year === 2026) {
        allCols.push({
          key: "status",
          label: "الحالة",
          cell: (r) => (
              cleanNumber(r
                .remaining) <=
              0 ? "له" : "عليه"
              ),
        });
        allCols.push({
          key: "notes",
          label: "الملاحظات",
          cell: (r) =>
            escapeHtml(r
              .notes || "—"),
        });
      }
      
      const cols = allCols.filter((
          c) => !hidden.has(c
        .key));
      
      // ملاءمة تلقائية لعرض الصفحة حسب الحجم والاتجاه
      const pageWidthMm =
        settings.pageSize === "A4" ?
        settings.orientation ===
        "portrait" ?
        210 :
        297 :
        settings.orientation ===
        "landscape" ?
        297 :
        210;
      const marginMm = settings
        .margin === "narrow" ? 2 :
        settings.margin === "wide" ?
        5 : 5;
      const usableWidthMm =
        pageWidthMm - marginMm * 2;
      const widthUnits = cols
        .reduce((s, c) => s + (c
          .wide ? 2.4 : 1), 0);
      const unitMm = usableWidthMm /
        Math.max(1, widthUnits);
      // في A4 الطولي يوجد عدد كبير من أعمدة الأشهر؛ نخفض الخط تلقائيًا
      // ونمنع القيمة اليدوية من إعادة الجدول إلى عرض يتجاوز الصفحة.
      const autoFont = Math.max(10, Math.min(15, unitMm * 1.18));
      const fontSizePx = Math.min(
        settings.fontMode ===
        "manual" ? settings
        .fontSize : autoFont,
        autoFont,
      );
      const headerFontSizePx =
        fontSizePx + 0.4;
      
      const fitStyle = (text: any,
        base = fontSizePx) => {
        const len = String(text ??
          "").replace(
          /<[^>]*>/g, "").length;
        const steps = Math.max(0,
          Math.ceil(Math.max(0,
            len - 16) / 10));
        const final = Math.max(9, base - Math.min(6, steps * 0.7));
        return `font-size:${final.toFixed(2)}px`;
      };
      
      const colGroup = `<colgroup>${cols
      .map(
        (c) =>
          `<col style="width:${(((c.wide ? 2.4 : 1) / widthUnits) * 100).toFixed(3)}%" />`,
      )
      .join("")}</colgroup>`;
      
      const thead = `<tr>${cols
      .map((c) => `<th class="c-${c.key.replace(/[^a-zA-Z]/g, "")}" data-col-key="${escapeHtml(c.key)}">${escapeHtml(c.label)}</th>`)
      .join("")}</tr>`;
      
      const tbody = (rows || [])
        .map((r: any, i:
        number) => {
          const notesStatusPrintClass = year === 2026
            ? getNotesStatusPrintClass(r.notes)
            : "";
          const tds = cols
            .map((c) => {
              const v = c.cell(
                r, i);
              const toneClass = c.tone ? ` t-${c.tone}` : "";
              const numericClass = c.key === "idx" || Boolean(c.tone) || c.key.startsWith("month:") ? " numeric-cell" : "";
              const screenCellClassMap: Record<string, string> = {
                idx: "screen-idx-cell", name: "screen-name-cell", batch: "screen-batch-cell",
                specialty: "screen-specialty-cell", prevDue: "screen-prevdue-cell", fees: "screen-fees-cell",
                totalPaid: "screen-totalpaid-cell", remaining: "screen-remaining-cell",
                notes: "screen-notes-cell", status: "screen-status-cell",
              };
              const screenCellClass = year === 2026
                ? (screenCellClassMap[c.key] || (c.key.startsWith("month:") ? "screen-month-cell" : c.key.startsWith("col:") ? "screen-extra-cell" : ""))
                : "";
              const statusClass =
                c.key ===
                "status" ? (
                  cleanNumber(r
                    .remaining
                    ) <= 0 ?
                  " s-ok" :
                  " s-bad") :
                "";
              const searchableValues = [
                r.name, r.batch, r.specialty, r.prevDue, r.fees,
                r.totalPaid, r.remaining, r.notes,
                ...Object.values(r.payments || {}),
                ...Object.values(r.customData || {}),
              ].map((value) => String(value ?? "").toLowerCase());
              const matchedRule = year === 2026
                ? condFormatRules.find((rule) => {
                    const term = String(rule.text || "").trim().toLowerCase();
                    return term.length > 0 && searchableValues.some((value) => value.includes(term));
                  })
                : undefined;
              const conditionalColor = !notesStatusPrintClass && matchedRule?.color
                ? ({
                    "bg-sky-100": "#e0f2fe", "bg-blue-100": "#dbeafe",
                    "bg-indigo-100": "#e0e7ff", "bg-violet-100": "#ede9fe",
                    "bg-purple-100": "#f3e8ff", "bg-pink-100": "#fce7f3",
                    "bg-rose-100": "#ffe4e6", "bg-red-100": "#fee2e2",
                    "bg-orange-100": "#ffedd5", "bg-amber-100": "#fef3c7",
                    "bg-yellow-100": "#fef9c3", "bg-lime-100": "#ecfccb",
                    "bg-green-100": "#dcfce7", "bg-emerald-100": "#d1fae5",
                    "bg-teal-100": "#ccfbf1", "bg-cyan-100": "#cffafe",
                    "bg-slate-100": "#f1f5f9", "bg-gray-100": "#f3f4f6",
                  } as Record<string, string>)[matchedRule.color] || undefined
                : undefined;
              return `<td class="${c.wide ? "wrap" : ""}${numericClass}${toneClass}${statusClass} ${screenCellClass}" data-col-key="${escapeHtml(c.key)}" style="${fitStyle(v)}${conditionalColor ? `;background-color:${conditionalColor} !important` : ""}"><span class="cell-content${numericClass}">${v}</span></td>`;
            })
            .join("");
          return `<tr class="${noteRowClass(r.notes)} ${notesStatusPrintClass}">${tds}</tr>`;
        })
        .join("");
      
      const totalRow = settings
        .showTotals ?
        `<tr class="total-row">${cols
          .map((c, idx) => {
            if (c.key === "idx") return `<td><span class="cell-content">—</span></td>`;
            if (idx === 1) return `<td class="wrap"><span class="cell-content">الإجمالي</span></td>`;
            return `<td style="${fitStyle("")}"><span class="cell-content">${c.total ? c.total() : ""}</span></td>`;
          })
          .join("")}</tr>` :
        "";
      
      const colorTokens = settings
        .colored ?
        {
          head: "#0f766e",
          headText: "#ffffff",
          zebra: "#ffffff",
          totals: "#ccfbf1",
          fees: "#eff6ff",
          paid: "#ecfdf5",
          due: "#fff7ed",
          accent: "#0d9488",
        } :
        {
          head: "#ffffff",
          headText: "#ffffff",
          zebra: "#ffffff",
          totals: "#f2f2f2",
          fees: "#ffffff",
          paid: "#ffffff",
          due: "#ffffff",
          accent: "#000000",
        };
const reportCss = `
      html, body { 
      margin: 0 !important;
     padding: 0!important; 
      }
      * { 
    box-sizing:border-box; 
      }
 .print-toolbar {
 display: flex;
 justify-content:flex-end;
  margin: 0 0 6px;
      }
      .print-toolbar button {
        border: 0.6pt solid #0f766e;
        border-radius: 4px;
        background: #0f766e;
        color: #fff;
        cursor: pointer;
        font-family: ${reportArabicFontStack};
        font-size: 13px;
        font-weight: 800;
        padding: 4px 10px;
      }
      .print-toolbar button:hover { 
  background: #115e59; 
      }
      .doc-header {
        display: flex;
      text-align: center;
        align-items: center;
        justify-content: space-between;
        gap: 8px;
        border-bottom: 2pt solid ${colorTokens.accent};
        padding-bottom: 4px;
        margin-bottom: 5px;
      }
      .doc-header.title {
      text-align:center;
       font-family:${reportArabicFontStack}; }
      .doc-header h1 { 
  font-size: 18px; 
 font-weight: 1000; 
 text-align: center;
 font-family:${reportArabicFontStack}; 
}
.doc-header h2 { 
font-size: 16px; 
font-weight: 700;
margin-top:8px; 
text-align: center;
color: ${colorTokens.accent}; }
  .doc-header .meta { 
font-size: 14px; 
font-weight: 700; 
text-align:center; 
line-height: 1.5; 
  }
   .doc-header .meta span { 
   display: block; 
   }

table {
font-size:${fontSizePx}px !important;
table-layout: fixed !important;
width: 100% !important;
max-width:100% !important;
	border: 1px solid #000;
      }

th, td {
	 border: 1px solid #000;
	padding: 2px 2px !important;
	text-align: center !important;
min-width: 0 !important;
max-width: 100% !important;
font-size:${fontSizePx}px;
overflow-wrap: normal !important;
word-break: break-word !important;
hyphens: none !important;
line-height: 1.5;
font-weight: 900;
color: #000 !important;
      }

      /* أعمدة الاسم والمساق (wide): السماح بالتفاف النص بدل خط واحد ممدود */
th.wrap, td.wrap {
white-space: nowrap !important; 
overflow: visible !important;
text-overflow: clip !important;
overflow-wrap: break-word !important;
word-break: normal !important;
      }

.cell-content {
  display: inline-block !important;
align-items:center !important; /* التمركز الرأسي للمحتوى */
justify-content:center !important; /* التمركز الأفقي للمحتوى */
 width: 100%;
height: auto;
box-sizing: border-box;
        padding: 3px 2px;
        margin: 0;
text-align: center !important;
white-space: normal !important;
        overflow: hidden;
        overflow-wrap: normal !important;
        word-break: keep-all !important;
        hyphens: none !important;
        line-height: 1.35;
      }

td.wrap .cell-content,
th.wrap .cell-content {
white-space: normal!important;
        overflow: visible !important;
        overflow-wrap: break-word !important;
        word-break: normal !important;
        line-height: 1.3;
      }
      td.wrap, td.wrap .cell-content {
        height: auto;
      }
      table th *, table td * {
        text-align: center !important;
      }
      table th.wrap *, table td.wrap * {
        white-space: normal!important;
        overflow-wrap: break-word !important;
        word-break: normal !important;
      }
      td.numeric-cell, th.numeric-cell, td.date-cell, th.date-cell, td.compact-cell, th.compact-cell {
        font-family: ${reportArabicFontStack} !important;
        font-size: ${fontSizePx}px !important;
        line-height: 1.15 !important;
        white-space: nowrap !important;
        overflow-wrap: normal !important;
        word-break:break-word !important;
        hyphens: none !important;
        text-align: center !important;
      }
      td.numeric-cell *, th.numeric-cell *, td.date-cell *, th.date-cell *, td.compact-cell *, th.compact-cell * {
        font-size: inherit !important;
        line-height: inherit !important;
        white-space: nowrap !important;
        overflow-wrap:nowrap !important;
        word-break: keep-all !important;
        text-align: center !important;
      }
      th {
background: ${colorTokens.head} !important;
        color: ${colorTokens.headText} !important;
font-family: ${reportArabicFontStack} !important;
font-size: ${headerFontSizePx}px !important;
font-weight: 800;
padding: 5px 5px !important;
text-align: center !important;
vertical-align: middle !important;
   white-space: normal !important;
      }

tbody tr:nth-child(even) td { background: ${colorTokens.zebra} !important; }

td.t-fees { background: ${colorTokens.fees} !important; }
      td.t-paid { background: ${colorTokens.paid} !important; font-weight: 800; }
      td.t-due { background: ${colorTokens.due} !important; color: #000 !important; font-weight: 800; }
      td.s-ok { background: ${settings.colored ? "#d1fae5" : "#ffffff"} !important; }
      td.s-bad { background: ${settings.colored ? "#fee2e2" : "#ffffff"} !important; }
      thead { display: table-header-group; }
      .total-row td {
        background: ${colorTokens.totals} !important;
        font-weight: 900;
        border-top: 1pt solid #111;
        text-align: center !important;
      }
      .doc-foot {
        margin-top: 5px;
        display: flex;
        justify-content: space-between;
        font-size: 14px;
        font-weight: 700;
        border-top: 0.75pt solid ${colorTokens.accent};
        padding-top: 3px;
      }
      ${settings.colored ? noteRowCss : ""}
      /* تنسيق موحد لصفحات التقرير الإجمالي والتفصيلي عند الطباعة أو تنزيل PDF */
      .doc-header {
        width: 100%;
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 14px;
        padding: 4px 6px 7px;
        margin: 0 0 8px;
        border-bottom: 2px solid ${colorTokens.accent};
      }
      .doc-header .title { flex: 1; text-align: center; }
      .doc-header h1, .doc-header h2 { margin: 0; line-height: 1.35; }
      .doc-header h1 { font-size: 18px; font-weight: 900; color: ${colorTokens.accent}; }
      .doc-header h2 { margin-top: 3px; font-size: 15px; font-weight: 800; color: #172b35; }
      .doc-header .meta { min-width: 105px; font-size: 11px; line-height: 1.6; text-align: right; color: #334155; }
      table { width: 100% !important; max-width: 100% !important; table-layout: fixed !important; border-collapse: collapse !important; }
      th, td { box-sizing: border-box !important; vertical-align: middle !important; text-align: center !important; }
      th { white-space: normal !important; line-height: 1.2 !important; }
      td { white-space: normal !important; line-height: 1.25 !important; }
      td.wrap, td.wrap .cell-content { white-space: normal !important; overflow-wrap: anywhere !important; word-break: normal !important; }
      .cell-content { display: block !important; width: 100% !important; overflow-wrap: anywhere !important; word-break: normal !important; }
      td.numeric-cell, td.date-cell, td.compact-cell, td.numeric-cell .cell-content { white-space: nowrap !important; overflow-wrap: normal !important; word-break: keep-all !important; }
      .doc-foot { width: 100%; margin-top: 8px; padding-top: 5px; border-top: 1px solid ${colorTokens.accent}; font-size: 11px; }
      @media print {
        .print-toolbar { display: none !important; }
        tr { page-break-inside: avoid; }
        table { table-layout: auto !important; width: 100% !important; max-width: auto !important; }
        th, td {
          width: auto !important;
          min-width: 0 !important;
          max-width: 100% !important;
          overflow: hidden !important;
          white-space: normal !important;
          word-break: break-word !important;
        }
      }
      /* قواعد PDF النهائية: Cairo، حجم 16px، أسود غامق، وبدون حشو رأسي */
      html, body, table, th, td, .cell-content, .doc-header, .doc-foot {
        font-family: ${reportArabicFontStack} !important;
        font-weight: 900 !important;
        color: #000 !important;
      }
      html, body, table { font-size: ${fontSizePx}px !important; }
      table.installments-report-table { table-layout: fixed !important; width: 100% !important; max-width: 100% !important; }
       table.installments-report-table th, table.installments-report-table td {
        padding: 0 4px !important;
        margin: 0 !important;
        text-align: center !important;
        vertical-align: middle !important;
        white-space: normal !important;
        overflow-wrap: anywhere !important;
        word-break: break-word !important;
        line-height: 1.2 !important;
      }
      .cell-content {
        display: block !important;
        width: 100% !important;
        height: auto !important;
        padding: 0 !important;
        margin: 0 !important;
        text-align: center !important;
        white-space: normal !important;
        overflow: visible !important;
        overflow-wrap: anywhere !important;
        word-break: break-word !important;
        line-height: 1.2 !important;
      }
      th *, td * { font-family: ${reportArabicFontStack} !important; font-size: inherit !important; font-weight: 900 !important; color: #000 !important; }
      table.installments-report-table td.numeric-cell, table.installments-report-table th.numeric-cell,
       table.installments-report-table td.numeric-cell .cell-content, table.installments-report-table th.numeric-cell .cell-content {
         white-space: nowrap !important; overflow-wrap: normal !important; word-break: keep-all !important;
         direction: ltr !important; unicode-bidi: isolate !important; font-variant-numeric: tabular-nums !important;
       }
       table.installments-report-table th[data-col-key="notes"], table.installments-report-table td[data-col-key="notes"] {
         width: 1% !important; max-width: 10% !important; white-space: normal !important; overflow-wrap: anywhere !important;
       }
       /* 2026 notes-driven academic status row colors: same palette as trainee data tab. */
       table.installments-report-table tbody tr.notes-status-red > td {
         background: #fecaca !important; -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important;
       }
       table.installments-report-table tbody tr.notes-status-yellow > td {
         background: #fef08a !important; -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important;
       }
       table.installments-report-table tbody tr.notes-status-green > td {
         background: #bbf7d0 !important; -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important;
       }
       table.installments-report-table tbody tr.notes-status-orange > td {
         background: #fed7aa !important; -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important;
       }
       table.installments-report-table tbody tr.notes-status-blue > td {
         background: #e0f2fe !important; -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important;
       }
       table.installments-report-table tbody tr.notes-status-emerald > td {
         background: #ecfdf5 !important; -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important;
       }
       /* Screen-equivalent appearance for the detailed 2026 installments report. */
       table.installments-screen-parity { direction: rtl !important; border-collapse: collapse !important; }
       table.installments-screen-parity thead th {
         background: linear-gradient(180deg,#7dd3fc 0%,#38bdf8 52%,#0ea5e9 100%) !important;
         color: #000 !important; border: 1px solid #0369a1 !important;
         -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important;
       }
       table.installments-screen-parity thead th[data-col-key="idx"], table.installments-screen-parity thead th[data-col-key="name"] { color: #fff !important; }
        table.installments-screen-parity tbody td { border: 1px solid #000000 !important; border-color: #000000 !important; color: #000000 !important; -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; }
       table.installments-screen-parity tbody td.screen-name-cell { background: #fdf4ff !important; }
       table.installments-screen-parity tbody td.screen-batch-cell, table.installments-screen-parity tbody td.screen-specialty-cell, table.installments-screen-parity tbody td.screen-fees-cell { background: #f0f9ff !important; }
       table.installments-screen-parity tbody td.screen-prevdue-cell { background: #f8fcff !important; }
       table.installments-screen-parity tbody td.screen-month-cell, table.installments-screen-parity tbody td.screen-extra-cell, table.installments-screen-parity tbody td.screen-status-cell, table.installments-screen-parity tbody td.screen-idx-cell { background: #ffffff !important; }
       table.installments-screen-parity tbody td.screen-totalpaid-cell { background: #ecfdf5 !important; }
       table.installments-screen-parity tbody td.screen-remaining-cell { background: #fff1f2 !important; }
       table.installments-screen-parity tbody td.screen-notes-cell { background: #fffbeb !important; }
        table.installments-screen-parity tbody tr.total-row > td, table.installments-screen-parity tbody tr.total-row > td * { background: #e0f2fe !important; color: #000000 !important; border: 1px solid #000000 !important; border-color: #000000 !important; font-weight: 900 !important; -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; }
       table.installments-screen-parity tbody tr.notes-status-red > td { background: #fecaca !important; }
       table.installments-screen-parity tbody tr.notes-status-yellow > td { background: #fef08a !important; }
       table.installments-screen-parity tbody tr.notes-status-green > td { background: #bbf7d0 !important; }
       table.installments-screen-parity tbody tr.notes-status-orange > td { background: #fed7aa !important; }
       table.installments-screen-parity tbody tr.notes-status-blue > td { background: #e0f2fe !important; }
       table.installments-screen-parity tbody tr.notes-status-emerald > td { background: #ecfdf5 !important; }
       table.installments-screen-parity tbody tr.notes-status-red > td, table.installments-screen-parity tbody tr.notes-status-yellow > td,
       table.installments-screen-parity tbody tr.notes-status-green > td, table.installments-screen-parity tbody tr.notes-status-orange > td,
       table.installments-screen-parity tbody tr.notes-status-blue > td, table.installments-screen-parity tbody tr.notes-status-emerald > td {
         -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important;
       }
       /* Detailed installments report: enforce black cell borders and black text
          in browser preview, direct printing, and standalone PDF output. */
       table.installments-report-table,
       table.installments-report-table th,
       table.installments-report-table td {
         border: 1px solid #000000 !important;
         border-color: #000000 !important;
         color: #000000 !important;
       }
       table.installments-report-table th *,
       table.installments-report-table td * {
         color: #000000 !important;
       }
       table.installments-report-table tbody tr.total-row > th,
       table.installments-report-table tbody tr.total-row > td {
         background: #e0f2fe !important;
         border: 1px solid #000000 !important;
         border-color: #000000 !important;
         color: #000000 !important;
         font-weight: 900 !important;
         -webkit-print-color-adjust: exact !important;
         print-color-adjust: exact !important;
       }
       table.installments-report-table tbody tr.total-row > th *,
       table.installments-report-table tbody tr.total-row > td * {
         color: #000000 !important;
       }
        table.installments-report-table.installments-screen-parity thead th,
        table.installments-report-table.installments-screen-parity tbody td {
          border: 1px solid #000000 !important;
          border-color: #000000 !important;
        }
        table.installments-report-table.installments-screen-parity tbody tr.total-row > th,
        table.installments-report-table.installments-screen-parity tbody tr.total-row > td,
        table.installments-report-table.installments-screen-parity tbody tr.total-row > th *,
        table.installments-report-table.installments-screen-parity tbody tr.total-row > td * {
          background: #e0f2fe !important;
          color: #000000 !important;
          border: 1px solid #000000 !important;
          border-color: #000000 !important;
          font-weight: 900 !important;
          -webkit-print-color-adjust: exact !important;
          print-color-adjust: exact !important;
        }
    `;
      
      const body = `
      ${
        settings.showHeader
          ? `<div class="doc-header">
        <div class="title">
          <h1>المجلس اليمني للاختصاصات الطبية — صعدة</h1>
          <h2>تقرير الأقساط والمدفوعات للعام ${year}م</h2>
        </div>
        <div class="meta">
          <span>التاريخ: ${escapeHtml(date)}</span>
          <span>عدد السجلات: ${(rows || []).length}</span>
        </div>
      </div>`
          : ""
      }
      <table class="installments-report-table${year === 2026 ? " installments-screen-parity" : ""}">
         ${colGroup}
        <thead>${thead}</thead>
        <tbody>${tbody}${totalRow}</tbody>
      </table>
      <div class="doc-foot">
        <span>إعداد: قسم الشؤون المالية</span>
        <span>التوقيع: ________________</span>
      </div>
    `;
      
      if (options.download) {
        await downloadDetailedHtmlPdf
          ({
            title: `تقرير_الأقساط_والمدفوعات_${year}_${reportDate}`,
            body,
            css: reportCss,
            pageSize: settings
              .pageSize,
            orientation: settings
              .orientation,
            marginMm: settings.margin === "narrow" ? 1 : settings.margin === "wide" ? 12 : 6,
            fileName: `${safePdfFileName(`اقساط-${year}-تفصيلي-${reportDate}`)}.pdf`,
          });
        toast.success(
          `تم تنزيل تقرير الأقساط التفصيلي لعام ${year}`
          );
        return;
      }
      
      const ok = await openBrowserPrintPreview({
        title: `تقرير الأقساط والمدفوعات للعام ${year}`,
        reportDateLabel: date,
        tableHtml: body,
        contentCss: reportCss,
        finalCss: `
          #tableContainer table.installments-table { width: 100% !important; border-collapse: collapse !important; table-layout: auto !important; direction: rtl !important; }
           #tableContainer table.installments-table td.numeric-cell,
           #tableContainer table.installments-table th.numeric-cell,
           #tableContainer table.installments-table td.numeric-cell *,
           #tableContainer table.installments-table th.numeric-cell * {
             white-space: nowrap !important; overflow-wrap: normal !important; word-break: keep-all !important;
             direction: ltr !important; unicode-bidi: isolate !important; font-variant-numeric: tabular-nums !important;
           }
           #tableContainer table.installments-table th[data-col-key="notes"],
           #tableContainer table.installments-table td[data-col-key="notes"] {
             width: 1% !important; max-width: 10% !important; white-space: normal !important; overflow-wrap: anywhere !important;
           }
          #tableContainer table.installments-table th { background: ${colorTokens.head} !important; color: ${colorTokens.headText} !important; font-weight: 900 !important; }
          #tableContainer table.installments-table td { background-clip: padding-box !important; color: #000 !important; }
          #tableContainer table.installments-table tr.total-row td { background: #0871ce !important; color: #fff !important; font-weight: 900 !important; }
          #tableContainer table.installments-table tr.total-row td * { color: #fff !important; }
          #tableContainer table.installments-table tr { break-inside: avoid !important; page-break-inside: avoid !important; }
          #tableContainer .doc-header, #tableContainer .doc-foot { font-family: ${reportArabicFontStack} !important; }
          /* Match the actual detailed report class (not the live screen table class). */
          #tableContainer table.installments-report-table th,
          #tableContainer table.installments-report-table td {
            border: 1px solid #000000 !important;
            border-color: #000000 !important;
            color: #000000 !important;
          }
          #tableContainer table.installments-report-table th *,
          #tableContainer table.installments-report-table td * {
            color: #000000 !important;
          }
          #tableContainer table.installments-report-table tbody tr.total-row > th,
          #tableContainer table.installments-report-table tbody tr.total-row > td {
            background: #e0f2fe !important;
            border: 1px solid #000000 !important;
            border-color: #000000 !important;
            color: #000000 !important;
            font-weight: 900 !important;
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
          }
          #tableContainer table.installments-report-table tbody tr.total-row > th *,
          #tableContainer table.installments-report-table tbody tr.total-row > td * {
            color: #000000 !important;
          }
          #tableContainer table.installments-report-table.installments-screen-parity thead th,
          #tableContainer table.installments-report-table.installments-screen-parity tbody td {
            border: 1px solid #000000 !important;
            border-color: #000000 !important;
          }
          #tableContainer table.installments-report-table.installments-screen-parity tbody tr.total-row > th,
          #tableContainer table.installments-report-table.installments-screen-parity tbody tr.total-row > td,
          #tableContainer table.installments-report-table.installments-screen-parity tbody tr.total-row > th *,
          #tableContainer table.installments-report-table.installments-screen-parity tbody tr.total-row > td * {
            background: #e0f2fe !important;
            color: #000000 !important;
            border: 1px solid #000000 !important;
            border-color: #000000 !important;
            font-weight: 900 !important;
          }
          @media print {
            #tableContainer table.installments-report-table th,
            #tableContainer table.installments-report-table td {
              border: 1px solid #000000 !important;
              color: #000000 !important;
            }
            #tableContainer table.installments-report-table tbody tr.total-row > th,
            #tableContainer table.installments-report-table tbody tr.total-row > td {
              border: 1px solid #000000 !important;
              color: #000000 !important;
              background: #e0f2fe !important;
            }
          }
        `,
        defaultOrientation: settings.orientation,
        defaultPageSize: settings.pageSize,
        defaultMarginMm: settings.margin === "narrow" ? 1 : settings.margin === "wide" ? 12 : 6,
        fitToContent: false,
      });

      if (ok) {
        toast.success("تم فتح معاينة التقرير — يمكنك الطباعة أو الحفظ بصيغة PDF");
      } else {
        toast.error("تعذّر فتح نافذة معاينة الطباعة، يرجى السماح بالنوافذ المنبثقة");
      }
    } catch (error) {
      toast.error(
        "فشل إنشاء التقرير");
    }
  };
  
  
  const saveRowEdit = (e: React
    .FormEvent) => {
    e.preventDefault();
    if (!editRowModal) return;
    
    if (editRowModal.year === 2025) {
      const list = [...(
        installments2025 || [])];
      const updatedRow = {
        ...editRowData,
        remaining: Math.max(0,
          cleanNumber(editRowData
            .fees) - cleanNumber(
            editRowData.totalPaid)
          ),
      };
      list[editRowModal.index] =
        updatedRow;
      updateInstallments2025(list);
    } else {
      const list = [...(
        installments || [])];
      const updatedRow = {
        ...editRowData,
        remaining: Math.max(
          0,
          (cleanNumber(editRowData
              .prevDue) +
            cleanNumber(
              editRowData.fees)) -
          cleanNumber(editRowData
            .totalPaid),
        ),
      };
      list[editRowModal.index] =
        updatedRow;
      updateInstallments(list);
    }
    
    toast.success(
      "تم تحديث البيانات بنجاح");
    setEditRowModal(null);
  };
  
  const addCustomColumn = (e: React
    .FormEvent) => {
    e.preventDefault();
    if (!newColName.trim()) return;
    if (extraCols2026.some((c) => c
        .name === newColName))
      return toast.error(
        "اسم العمود موجود مسبقاً");
    
    setInstallmentCustomColumns2026([
      ...extraCols2026,
      {
        name: newColName,
        type: newColType,
        options: newColType ===
          "select" ? newColOptions
          .split(",").map((s) => s
            .trim()) : [],
        formula: newColType ===
          "formula" ?
          newColFormula : "",
      },
    ]);
    
    toast.success(
      `تم إضافة العمود: ${newColName}`
      );
    setNewColModal(false);
    setNewColName("");
    setNewColType("text");
    setNewColOptions("");
    setNewColFormula("");
  };
  
  const saveCustomColumnEdit = (e: React
    .FormEvent) => {
    e.preventDefault();
    if (!editColModal) return;
    
    if (
      editColModal.name !==
      editColModal.oldName &&
      extraCols2026.some((c) => c
        .name === editColModal.name)
    ) {
      return toast.error(
        "اسم العمود موجود مسبقاً");
    }
    
    const updatedCols = extraCols2026
      .map((c) => {
        if (c.name === editColModal
          .oldName) {
          return {
            name: editColModal.name,
            type: editColModal.type,
            options: editColModal
              .type === "select" ?
              editColModal.options
              .split(",").map((s) =>
                s.trim()) :
              [],
            formula: editColModal
              .type === "formula" ?
              editColModal.formula :
              "",
          };
        }
        return c;
      });
    
    if (editColModal.oldName !==
      editColModal.name) {
      const list = [...(
        installments || [])];
      list.forEach((row) => {
        if (row.customData && row
          .customData[editColModal
            .oldName] !==
          undefined) {
          row.customData[
              editColModal.name] =
            row.customData[
              editColModal.oldName
              ];
          delete row.customData[
            editColModal.oldName
            ];
        }
      });
      updateInstallments(list);
    }
    
    setInstallmentCustomColumns2026(
      updatedCols);
    setEditColModal(null);
    toast.success(
      "تم تعديل العمود بنجاح");
  };
  
  const deleteCustomColumn = (colName:
    string) => {
    if (!confirm(
        `هل أنت متأكد من حذف العمود "${colName}"؟`
        )) return;
    setInstallmentCustomColumns2026(
      extraCols2026.filter((c) => c
        .name !== colName));
    setEditColModal(null);
    toast.success("تم حذف العمود");
  };
  
  const recalculate2026Row = (row:
    any) => {
      const payments = { ...(row
          .payments || {}) };
      const totalPaid = MONTHS_2026
        .reduce((sum, m) => sum + (
            Number(payments[m]) || 0),
          0);
      return {
        ...row,
        payments,
        totalPaid,
        remaining: Math.max(0, (
            cleanNumber(row.prevDue) +
            cleanNumber(row.fees)) -
          totalPaid),
      };
    };
  
  const update2026CellValue = (rowIndex:
    number, key: string, value: string
    ) => {
    if (rowIndex < 0) return;
    const list = [...(installments ||
      [])];
    const current = { ...list[
        rowIndex] };
    const numericKeys = ["prevDue",
      "fees", "totalPaid",
      "remaining"
    ];
    const nextValue: any = numericKeys
      .includes(key) ? cleanNumber(
        value) : value;
    list[rowIndex] =
      (key === "prevDue" || key ===
        "fees") ?
      recalculate2026Row({ ...current,
        [key]: nextValue }) :
      { ...current, [
      key]: nextValue };
    updateInstallments(list);
  };
  
  const update2026PaymentValue = (
    rowIndex: number, month: string,
    value: string) => {
    if (rowIndex < 0) return;
    const list = [...(installments ||
      [])];
    const row = { ...list[rowIndex],
      payments: { ...(list[rowIndex]
          ?.payments || {}) } };
    row.payments[month] = cleanNumber(
      value);
    list[rowIndex] =
      recalculate2026Row(row);
    updateInstallments(list);
  };
  
  const updateCustomColValue = (
    rowIndex: number, colName: string,
    value: string) => {
    const list = [...(installments ||
      [])];
    const row = { ...list[rowIndex],
      customData: { ...(list[
          rowIndex]?.customData ||
        {}) } };
    row.customData[colName] = value;
    list[rowIndex] = row;
    updateInstallments(list);
  };
  
  const deleteRow2026 = (rowIndex:
    number, name: string) => {
    if (rowIndex < 0) return;
    if (!confirm(
        `هل أنت متأكد من حذف صف المتدرب "${name}" من جدول 2026؟`
        )) return;
    updateInstallments((
      installments || []).filter((
        _: any, i: number) =>
      i !== rowIndex));
    toast.success("تم حذف الصف");
  };
  
  const addNewRow2026 = (e: React
    .FormEvent) => {
    e.preventDefault();
    if (!newRowData2026.name)
    return toast.error(
        "يرجى إدخال اسم المتدرب");
    
    const payments = MONTHS_2026
      .reduce((acc, m) => ({ ...acc, [
          m
        ]: 0 }), {} as any);
    const newRec = {
      name: newRowData2026.name,
      batch: newRowData2026.batch,
      specialty: newRowData2026
        .specialty,
      fees: Number(newRowData2026
        .fees) || 0,
      prevDue: Number(newRowData2026
        .prevDue) || 0,
      totalPaid: 0,
      remaining: Number(
          newRowData2026.prevDue) ||
        0,
      notes: "",
      phone: "",
      payments,
      customData: {},
    };
    
    updateInstallments([...(
        installments || []),
      newRec
    ]);
    toast.success(
      "تم إضافة الصف بنجاح");
    setNewRowModal2026(false);
    setNewRowData2026({ name: "",
      batch: "", specialty: "",
      prevDue: 0, fees: 0 });
  };
  
  const addPayment = (e: React
    .FormEvent) => {
    e.preventDefault();
    if (!paymentModal || !payAmount)
      return toast.error(
        "يرجى إدخال المبلغ");
    const amount = Number(
      payAmount) || 0;
    if (amount <= 0) return toast
      .error("مبلغ غير صحيح");
    const list = [...(installments ||
      [])];
    const updated = list.map((s) => {
      if (s.name !== paymentModal
        .row.name) return s;
      const payments = {
        ...s.payments,
        [paymentModal.month]: (
            Number(s.payments[
              paymentModal
              .month]) || 0) +
          amount,
      };
      const totalPaid =
        MONTHS_2026.reduce((sum,
          m) => sum + (Number(
          payments[m]) || 0), 0);
      return {
        ...s,
        payments,
        totalPaid,
        remaining: Math.max(0, (
            cleanNumber(s
              .prevDue) +
            cleanNumber(s.fees)
            ) - totalPaid),
      };
    });
    updateInstallments(updated);
    toast.success(
      `تم تسجيل دفعة ${fmt(amount)}`
      );
    setPaymentModal(null);
    setPayAmount("");
  };
  
  const addNewPayment = (e: React
    .FormEvent) => {
    e.preventDefault();
    if (!newStudentName || !
      newStudentAmount || !
      newStudentMonth)
      return toast.error(
        "يرجى إدخال جميع البيانات");
    const amount = Number(
      newStudentAmount) || 0;
    if (amount <= 0) return toast
      .error("مبلغ غير صحيح");
    const list = [...(installments ||
      [])];
    const exist = list.find((s) => s
      .name === newStudentName);
    if (exist) {
      const updated = list.map((
      s) => {
        if (s.name !==
          newStudentName)
      return s;
        const payments = {
          ...s.payments,
          [newStudentMonth]: (
              Number(s.payments[
                newStudentMonth
                ]) || 0) +
            amount,
        };
        const totalPaid =
          MONTHS_2026.reduce((sum,
              m) => sum + (Number(
              payments[m]) || 0),
            0);
        return {
          ...s,
          payments,
          totalPaid,
          remaining: Math.max(0, (
              cleanNumber(s
                .prevDue) +
              cleanNumber(s
                .fees)) -
            totalPaid),
        };
      });
      updateInstallments(updated);
    } else {
      const payments = MONTHS_2026
        .reduce(
          (acc, m) => ({ ...acc, [
            m]: m ===
              newStudentMonth ?
              amount :
              0 }), {} as any,
        );
      const newRec = {
        name: newStudentName,
        batch: "",
        specialty: "",
        fees: 0,
        prevDue: 0,
        totalPaid: amount,
        remaining: Math.max(0, 0 -
          amount),
        notes: "",
        phone: "",
        payments,
      };
      updateInstallments([...list,
        newRec
      ]);
    }
    toast.success(
      `تم إضافة دفعة ${fmt(amount)}`
      );
    setNewPaymentModal(false);
    setNewStudentName("");
    setNewStudentAmount("");
    setNewStudentMonth("");
  };
  
  const editPayment = (e: React
    .FormEvent) => {
    e.preventDefault();
    if (!editPaymentModal || !
      editAmount)
      return;
    const newAmount = Number(
      editAmount) || 0;
    const list = [...(installments ||
      [])];
    const updated = list.map((s) => {
      if (s.name !==
        editPaymentModal.row.name)
        return s;
      const payments = { ...s
        .payments, [
          editPaymentModal.month
        ]: newAmount };
      const totalPaid =
        MONTHS_2026.reduce((sum,
          m) => sum + (Number(
          payments[m]) || 0), 0);
      return {
        ...s,
        payments,
        totalPaid,
        remaining: Math.max(0, (
            cleanNumber(s
              .prevDue) +
            cleanNumber(s.fees)
            ) - totalPaid),
      };
    });
    updateInstallments(updated);
    toast.success("تم تعديل القسط");
    setEditPaymentModal(null);
    setEditAmount("");
  };
  
  const deletePayment = (row: any,
    month: string) => {
    if (!confirm(
        `حذف قسط شهر ${month}؟`))
      return;
    const list = [...(installments ||
      [])];
    const updated = list.map((s) => {
      if (s.name !== row.name)
        return s;
      const payments = { ...s
        .payments, [month]: 0 };
      const totalPaid =
        MONTHS_2026.reduce((sum,
          m) => sum + (Number(
          payments[m]) || 0), 0);
      return {
        ...s,
        payments,
        totalPaid,
        remaining: Math.max(0, (
            cleanNumber(s
              .prevDue) +
            cleanNumber(s.fees)
            ) - totalPaid),
      };
    });
    updateInstallments(updated);
    toast.success(
      `تم حذف قسط شهر ${month}`);
    if (editPaymentModal)
      setEditPaymentModal(null);
  };
  
  const importFile = async (e: React
    .ChangeEvent <
    HTMLInputElement > , year:
    2025 | 2026) => {
    const input = e.target;
    const file = input.files?.[0];
    if (!file) return;
    if (importingYear !== null) {
      input.value = "";
      toast.error("هناك عملية استيراد أخرى قيد التنفيذ.");
      return;
    }
    setImportingYear(year);
    const loadingToast = toast.loading(`جارٍ فحص ملف الأقساط لعام ${year}…`);
    try {
      // ملاحظة: لا نصفّر قيمة الحقل قبل القراءة — بعض متصفحات أندرويد/شاومي
      // تُبطل الملف عند التصفير فتخرج النتيجة فارغة بدون خطأ.
      const formattedData =
        await importInstallmentsInWorker(
          file, year);
      if (!formattedData?.length) {
        const msg =
          "لم يتم العثور على أسماء متدربين في الملف — تأكد من وجود عمود «اسم المتدرب» في الصف الأول.";
        setImportError(msg);
        toast.error(msg);
        return;
      }
      if (year === 2025) {
        useStore
      .setState({ installments2025: formattedData });
        setPage2025(1);
      } else {
        useStore
      .setState({ installments: formattedData });
        setPage2026(1);
      }
      
      toast.success(
        `تم استيراد ${formattedData.length} سجلاً للعام ${year} بنجاح!`
        );
      setImportError(null);
    } catch (error) {
      console.error(
        `[Excel] Installments ${year} import failed`,
        error);
      const detail =
        error instanceof Error ?
        error.message : String(
          error);
      setImportError(
        `حدث خطأ في قراءة الملف: ${detail}`
        );
      toast.error(detail || "فشل استيراد الملف");
    } finally {
      toast.dismiss(loadingToast);
      setImportingYear(null);
      input.value = "";
    }
  };
  
  
  const getStatusText = (rem: number) =>
    rem <= 0 ?
    { text: "له",
      color: "text-emerald-800",
      bg: "bg-emerald-50" } :
    { text: "عليه",
      color: "text-rose-800",
      bg: "bg-rose-50" };
  
  // تم تعديل هذه الدالة لتتوافق بشكل أفضل مع صيغة حفظ PDF واللغة العربية
      const generateAccountStatement = (row: any, year: number) => {
    // 1. تحديد قائمة الأشهر بناءً على السنة المختارة
    const monthsList = year === 2025 ? MONTHS_2025 : MONTHS_2026;

    // 2. المبالغ والمستحقات
    const fees = cleanNumber(row?.fees);
    const prevDue = cleanNumber(row?.prevDue);

    // 3. حساب إجمالي المدفوعات
    const totalPaid = monthsList.reduce((sum, month) => {
      const payment = Number(row?.payments?.[month]) || 0;
      return sum + payment;
    }, 0);

    // 4. إجمالي المطلوب والمتبقي
    const dueTotal = year === 2026 ? prevDue + 0 : fees;
    const remaining = dueTotal - totalPaid;
    const safeName = safePdfFileName(row.name);

    // 5. إظهار الأشهر التي لها مبلغ سداد فقط
    const monthlyRows = monthsList
      .map((m) => {
        const amount = Number(row?.payments?.[m]) || 0;
        if (amount <= 0) return "";
        return `
          <tr class="installments-statement-row row-paid">
            <td class="lbl">قسط شهر ${escapeHtml(m)}</td>
            <td class="num">${escapeHtml(fmt(amount))}</td>
          </tr>`;
      })
      .join("");

    // قالب كروت البيانات العلوية الأربعة
    const infoCard = (label: string, value: string) =>
      `<div class="info-box">
        <div class="info-lbl">${escapeHtml(label)}</div>
        <div class="info-val">${escapeHtml(value || "—")}</div>
      </div>`;

    const prevRow =
      year === 2026
        ? `<tr class="installments-statement-row row-due-old">
            <td class="lbl">متبقي من العام 2025 (مدور)</td>
            <td class="num">${escapeHtml(fmt(prevDue))}</td>
          </tr>`
        : "";

    const remainingLabel =
      remaining > 0
        ? "الرصيد المتبقي (عليه)"
        : remaining < 0
          ? "الرصيد الإضافي (له)"
          : "الحالة: تم السداد بالكامل";

    // تنسيقات CSS لقص الصفحة على حدود كشف المتدرب وتوحيد خط Cairo
    const statementCss = `
      ${reportArabicFontFacesCss}
      * { 
        box-sizing: border-box; 
        font-family: ${reportArabicFontStack} !important; 
      }
      html, body { 
        margin: 0; 
        padding: 0; 
        width: 100%;
        min-height: auto;
        background: #fff;
        color: #000;
        direction: rtl;
        -webkit-print-color-adjust: exact;
        print-color-adjust: exact;
      }
      .container {
        width: 100%;
        min-height: 0;
        margin: 0;
        padding: 0;
        display: flex;
        flex-direction: column;
        justify-content: flex-start;
      }
      .page-frame {
        width: 100%;
        min-height: 0;
        border: 2px solid #0f766e;
        border-radius: 0;
        background: #fff;
        padding: 4mm;
        display: flex;
        flex-direction: column;
        justify-content: flex-start;
        box-sizing: border-box;
      }
      .statement-title {
        text-align: center;
        font-size: 20px;
        font-weight: 900;
        color: #0f766e;
        margin: 0 0 12px;
        padding-bottom: 8px;
        border-bottom: 2px solid #0f766e;
      }
      .info-grid {
        display: grid;
     grid-template-columns: 1fr 1fr;
        gap: 8px;
        margin-bottom: 14px;
        page-break-inside: avoid;
        break-inside: avoid;
      }
      .info-box {
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        gap: 2px;
        border: 1.5px solid #0f172a;
        background: #dbeafe;
        padding: 2.5mm 2mm;
        min-height: 16mm;
        border-radius: 2mm;
        text-align: center;
        box-sizing: border-box;
        -webkit-print-color-adjust: exact !important;
        print-color-adjust: exact !important;
      }
      .info-box:nth-child(1) {
        background: #dbeafe !important;
        border-color: #2563eb !important;
      }
      .info-box:nth-child(2) {
        background: #fef3c7 !important;
        border-color: #d97706 !important;
      }
      .info-box:nth-child(3) {
        background: #ede9fe !important;
        border-color: #7c3aed !important;
      }
      .info-box:nth-child(4) {
        background: #d1fae5 !important;
        border-color: #059669 !important;
      }
      .info-lbl {
        width: 100%;
        font-size: 19px;
        line-height: 1.35;
        font-weight: 900 !important;
        color: #172554 !important;
        margin: 0;
        text-align: center !important;
      }
      .info-val {
        width: 100%;
        font-size: 22px;
        line-height: 1.4;
        font-weight: 900 !important;
        color: #000000 !important;
        text-align: center !important;
        white-space: normal;
        overflow-wrap: anywhere;
        word-break: break-word;
      }
      .table-wrapper {
        flex: 1 1 auto;
        display: flex;
        flex-direction: column;
      }
      table {
      table-layout: auto;
        width: 100%;
        border-collapse: collapse;
        margin-top: 4px;
      }
      th, td {
        border: 1.5px solid #0f766e;
        text-align: center;
        vertical-align: middle;
        padding: 8px 12px;
      }
      th {
        background: #0f766e !important;
        color: #ffffff !important;
        font-weight: 900;
        font-size: 17px;
      }
      td {
        color: #000000 !important;
        font-size: 20px;
      }
      .report-page-content .page-frame th,
      .report-page-content .page-frame td {
        font-family: ${reportArabicFontStack} !important;
        font-size: 20px !important;
        line-height: 1.4 !important;
      }
      .report-page-content .page-frame .info-lbl,
      .report-page-content .page-frame .info-val,
      .report-page-content .page-frame .statement-title,
      .report-page-content .page-frame .foot {
        font-family: ${reportArabicFontStack} !important;
        font-size: 20px !important;
      }
      .lbl {
        font-weight: 800;
        text-align: center;
        padding-right: 16px;
        font-weight: 900;
      }
      .num {
        font-weight: 900;
        font-size: 20px;
        direction: ltr;
        text-align: center;
        padding-left: 16px;
        font-variant-numeric: tabular-nums;
      }
      .row-fees td {
 background: #eff6ff !important; 
      }
      .row-due-old td { background: #fef3c7 !important;
        
      }
      .row-total-due td { background: ${year === 2026 ? "#fecaca" : "#fee2e2"} !important; font-weight: 900; }
      .row-paid td { background: ${year === 2026 ? "#dcfce7" : "#f0fdf4"} !important; font-weight: 800; }
      .row-unpaid td { background: #f8fafc !important; color: #64748b !important; }
      .row-total-paid td { background: ${year === 2026 ? "#a7f3d0" : "#d1fae5"} !important; font-weight: 900; }
      .row-final td {
        background: ${year === 2026 ? "#0f766e" : "#f1f5f9"} !important;
        ${year === 2026 ? "color: #ffffff !important;" : ""}
        font-size: 20px;
        font-weight: 900;
        border-top: 2.5px solid #0f766e !important;
      }
      /* استعادة التنسيق الأصلي لكشف حساب المتدرب وعزله عن القالب العام للتقارير. */
      .page-frame table.trainee-account-statement {
        width: 100% !important;
        max-width: 100% !important;
        table-layout: fixed !important;
        border-collapse: collapse !important;
        direction: rtl !important;
        margin-top: 4px !important;
      }
      .page-frame table.trainee-account-statement th,
      .page-frame table.trainee-account-statement td {
        border: 1.5px solid #0f766e !important;
        text-align: center !important;
        vertical-align: middle !important;
        padding: 8px 12px !important;
        font-family: ${reportArabicFontStack} !important;
        font-size: 20px !important;
        line-height: 1.4 !important;
        white-space: normal !important;
        overflow-wrap: anywhere !important;
        -webkit-print-color-adjust: exact !important;
        print-color-adjust: exact !important;
      }
      .page-frame table.trainee-account-statement thead th {
        background: #0f766e !important;
        background-image: none !important;
        color: #ffffff !important;
        font-size: 17px !important;
        font-weight: 900 !important;
      }
      .page-frame table.trainee-account-statement tbody tr.row-fees > td { background: #eff6ff !important; color: #000000 !important; }
      .page-frame table.trainee-account-statement tbody tr.row-due-old > td { background: #fef3c7 !important; color: #000000 !important; }
      .page-frame table.trainee-account-statement tbody tr.row-total-due > td { background: ${year === 2026 ? "#fecaca" : "#fee2e2"} !important; color: #000000 !important; font-weight: 900 !important; }
      .page-frame table.trainee-account-statement tbody tr.row-paid > td { background: ${year === 2026 ? "#dcfce7" : "#f0fdf4"} !important; color: #000000 !important; font-weight: 800 !important; }
      .page-frame table.trainee-account-statement tbody tr.row-unpaid > td { background: #f8fafc !important; color: #64748b !important; }
      .page-frame table.trainee-account-statement tbody tr.row-total-paid > td { background: ${year === 2026 ? "#a7f3d0" : "#d1fae5"} !important; color: #000000 !important; font-weight: 900 !important; }
      .page-frame table.trainee-account-statement tbody tr.row-final > td {
        background: ${year === 2026 ? "#0f766e" : "#f1f5f9"} !important;
        color: ${year === 2026 ? "#ffffff" : "#000000"} !important;
        font-size: 20px !important;
        font-weight: 900 !important;
        border-top: 2.5px solid #0f766e !important;
      }
      .page-frame table.trainee-account-statement tbody tr.installments-statement-row > td * {
        background: transparent !important;
        color: inherit !important;
      }
      .foot {
        margin-top: 10px;
        padding-top: 10px;
        display: flex;
        justify-content: space-between;
        align-items: center;
        font-size: 20px;
        font-weight: 800;
        color: #000000;
        border-top: 1.5px dashed #0f766e;
        page-break-inside: avoid;
        break-inside: avoid;
      }
      @media print {
        body { margin: 0; padding: 0; }
        .print-toolbar { display: none !important; }
        .page-frame { min-height: 0; border-radius: 0; }
        .info-box, th, td, .statement-title {
          -webkit-print-color-adjust: exact;
          print-color-adjust: exact;
        }
      }
    `;

    const body = `
      <div class="container">
        <div class="page-frame">
          <h2 class="statement-title">كشف حساب متدرب — للعام ${year}م</h2>
          <div class="info-grid">
            ${infoCard("اسم المتدرب", row.name)}
            ${infoCard("الدفعة", row.batch)}
            ${infoCard("المساق", row.specialty)}
            ${infoCard("رقم الهاتف", row.phone)}
          </div>
<div class="table-wrapper">
<table class="trainee-account-statement">
              <colgroup><col style="width:65%"><col style="width:35%"></colgroup>
              <thead>
                <tr>
                  <th>البيان</th>
                  <th style="width: 35%">المبلغ</th>
                </tr>
              </thead>
              <tbody>
                <tr class="installments-statement-row row-fees"><td class="lbl">إجمالي الرسوم المستحقة</td><td class="num">${escapeHtml(fmt(fees))}</td></tr>
                ${prevRow}
                <tr class="installments-statement-row row-total-due"><td class="lbl">إجمالي المبلغ المطلوب</td><td class="num">${escapeHtml(fmt(dueTotal))}</td></tr>
                ${monthlyRows}
                <tr class="installments-statement-row row-total-paid"><td class="lbl">إجمالي المسدد (له)</td><td class="num">${escapeHtml(fmt(totalPaid))}</td></tr>
                <tr class="installments-statement-row row-final"><td class="lbl">${escapeHtml(remainingLabel)}</td><td class="num">${escapeHtml(fmt(Math.abs(remaining)))}</td></tr>
              </tbody>
            </table>
          </div>
          <div class="foot">
            <span>تاريخ التقرير: ${escapeHtml(reportDateLabel)}</span>
   <span>التوقيع: ________________</span>
          </div>
        </div>
      </div>
    `;

    return {
      title: `كشف_حساب_${safeName}_${year}_${reportDate}`,
      body,
      css: statementCss,
    };
  };

    const downloadTraineeStatementPdf = downloadReportPdf;


  const openFeeDemand = (row: any) => {
    const normalizeName = (value: unknown) => String(value ?? "").trim()
      .replace(/[ًٌٍَُِّْـ]/g, "").replace(/[إأآ]/g, "ا").replace(/ى/g, "ي")
      .replace(/ة/g, "ه").replace(/\s+/g, " ").toLocaleLowerCase("ar");
    const targetName = normalizeName(row.name);
    let registrationPaid = 0;
    let examPaid = 0;
    (hafiza || []).forEach((record: any) => {
      if (normalizeName(record.name) !== targetName) return;
      const paymentDate = new Date(record.notifyDate || record.date || "");
      if (!Number.isFinite(paymentDate.getTime()) || paymentDate.getFullYear() < 2022) return;
      const notifyAmount = cleanNumber(record.notifyAmount);
      const hasReceipt = Boolean(String(record.hafizaNo || "").trim()) && cleanNumber(record.hafizaAmount) > 0;
      const paidAmount = notifyAmount > 0 ? notifyAmount : hasReceipt ? cleanNumber(record.hafizaAmount) : 0;
      if (paidAmount <= 0) return;
      if (isRegistrationFeeDescription(record.description)) registrationPaid += paidAmount;
      else if (/امتحان|اختبار/.test(String(record.description || ""))) examPaid += paidAmount;
    });
    setFeeDemandIncludeRegistration(false);
    setFeeDemandIncludeExam(true);
    setFeeDemandIncludeFinalWritten(false);
    setFeeDemandIncludeOralScientific(false);
    setFeeDemandIncludeOralClinical(false);
    setFeeDemandRegistrationAmount(10000);
    setFeeDemandExamAmount(30000);
    setFeeDemandTrainee({ name: String(row.name || ""), registrationPaid, examPaid });
  };

  const printFeeDemand = () => {
    if (!feeDemandTrainee) return;
    const escapeHtml = (value: unknown) => String(value ?? "").replace(/[&<>"']/g, (char) => ({
      "&": "&amp;",
      "<": "&lt;",
      ">": "&gt;",
      '"': "&quot;",
      "'": "&#39;",
    })[char] || char);
    const traineeName = String(feeDemandTrainee.name || "").trim();
    const outstandingFees = [
      { label: "رسوم القيد والتسجيل", amount: feeDemandIncludeRegistration && feeDemandTrainee.registrationPaid <= 0 ? Math.max(0, feeDemandRegistrationAmount) : 0 },
      { label: "رسوم امتحان الكتابي الأول", amount: feeDemandIncludeExam && feeDemandTrainee.examPaid <= 0 ? Math.max(0, feeDemandExamAmount) : 0 },
      { label: "رسوم امتحان الكتابي النهائي", amount: feeDemandIncludeFinalWritten ? 30000 : 0 },
      { label: "رسوم امتحان العلمي الشفوي", amount: feeDemandIncludeOralScientific ? 100000 : 0 },
      { label: "رسوم امتحان شفوي/سريري", amount: feeDemandIncludeOralClinical ? 30000 : 0 },
    ].filter((fee) => fee.amount > 0);
    if (!outstandingFees.length) {
      toast.info("لا توجد رسوم مستحقة غير مسددة لهذا المتدرب");
      return;
    }
    const outstandingFeeText = outstandingFees.map((fee) => fee.label + " (" + fee.amount.toLocaleString("en-US") + " ريال)").join(" و");
    const title = "مطالبة مالية بسداد الرسوم - " + traineeName;
    const tableHtml = '<article class="fee-demand-letter" dir="rtl" style="text-align: center; font-size: 18px; line-height: 2.2; font-family: &quot;IBM Plex Sans Arabic&quot;, &quot;Noto Sans Arabic&quot;, &quot;Noto Naskh Arabic&quot;, Cairo, sans-serif;">' +
      '<h1 style="font-size: 20px; font-weight: bold; margin-bottom: 25px;">مطالبة مالية بسداد الرسوم</h1>' +
      '<p class="letter-date" style="text-align: right; font-size: 16px;">التاريخ: ' + escapeHtml(reportDateLabel) + '</p>' +
      '<p class="salutation" style="margin: 18px 0; font-size: 20px; text-align: right;">الأخ-الدكتور// <strong>' + escapeHtml(traineeName) + '</strong>' +
      '&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;' +
      '&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; المحتــرم</p>' +
      '<p style="margin: 15px 0; text-align: center;">تحية طيبة وبعد،</p>' +
      '<p style="margin: 15px 0;text-align: center;text-decoration: underline; font-weight: bold; color: red;"><strong>الموضوع: مطالبة بسداد ' + escapeHtml(outstandingFeeText) + '</strong></p>' +
      '<p style="margin: 15px 0; text-align: center;font-size: 18px">بالإشارة إلى الموضوع أعلاه، نرجو منكم المبادرة إلى سداد الرسوم المحددة في هذه المطالبة وغير المسددة، ومراجعة الإدارة المالية لإتمام إجراءات السداد وتوثيقه.</p>' +
      '<p style="margin: 15px 0;text-align: center;font-weight: bold; color: #000;">نأمل منكم سرعة سداد المستحقات المالية التي عليكم. وفي حال عدم السداد، سيتم اتخاذ الإجراءات اللازمة وفق الأنظمة واللوائح المعمول بها.</p>' +
      '<p class="thanks" style="margin: 30px 0;text-align: center">شاكرين لكم حسن تعاونكم، وتفضلوا بقبول خالص الشكر والتقدير،،،،</p>' +
      '<div class="letter-signatures" style="display: flex; justify-content: space-between; margin-top: 60px; text-align: center; font-size: 16px;">' +
      '<div style="flex: 1;"><label style="display: block; font-weight: bold; margin-bottom: 8px;">الصندوق</label><strong style="display: block; margin-bottom: 15px;">' + escapeHtml(feeDemandSignatures.department) + '</strong><span style="display: block; border-bottom: 1px dotted #000; width: 80%; margin: 0 auto;"></span></div>' +
      '<div style="flex: 1;"><label style="display: block; font-weight: bold; margin-bottom: 8px;">الشؤون المالية</label><strong style="display: block; margin-bottom: 15px;">' + escapeHtml(feeDemandSignatures.director) + '</strong><span style="display: block; border-bottom: 1px dotted #000; width: 80%; margin: 0 auto;"></span></div>' +
      '<div style="flex: 1;"><label style="display: block; font-weight: bold; margin-bottom: 8px;">رئيس فرع المجلس </label><strong style="display: block; margin-bottom: 15px;">' + escapeHtml(feeDemandSignatures.signer) + '</strong><span style="display: block; border-bottom: 1px dotted #000; width: 80%; margin: 0 auto;"></span></div>' +
      '</div></article>';
    const finalCss = [
      "@page { size:A4 portrait; margin:18mm; }",
      "#tableContainer .fee-demand-letter { width:100%; min-height:245mm; margin:0 auto; color:#111; font-family:'IBM Plex Sans Arabic','Noto Sans Arabic','Noto Naskh Arabic',Cairo,Tahoma,Arial,sans-serif; font-size:16px; line-height:2; }",
      "#tableContainer .fee-demand-letter h1 { margin:0 0 10mm; padding:0 0 4mm; border-bottom:2px solid #17324d; color:#17324d; text-align:center; font-size:22px; font-weight:900; }",
      "#tableContainer .fee-demand-letter p { margin:0 0 5mm; text-align:justify; }",
      "#tableContainer .fee-demand-letter .letter-date { text-align:left; }",
      "#tableContainer .fee-demand-letter .salutation { margin-top:10mm; }",
      "#tableContainer .fee-demand-letter .thanks { margin-top:8mm; }",
      "#tableContainer .letter-signatures { display:grid; grid-template-columns:repeat(3,minmax(0,1fr)); gap:8mm; margin-top:22mm; text-align:center; }",
      "#tableContainer .letter-signatures > div { display:flex; min-height:32mm; flex-direction:column; align-items:center; gap:3mm; }",
      "#tableContainer .letter-signatures label { font-weight:800; }",
      "#tableContainer .letter-signatures strong { min-height:8mm; }",
      "#tableContainer .letter-signatures span { width:75%; height:8mm; margin-top:2mm; border-bottom:1px dotted #333; }"
    ].join("\n");
    const opened = openBrowserPrintPreview({
      title,
      reportDateLabel,
      tableHtml,
      contentCss: reportDocumentCss,
      finalCss,
      defaultOrientation: "portrait",
      defaultPageSize: "A4",
      defaultMarginMm: 18,
    });
    if (!opened) toast.error("تعذر فتح معاينة المطالبة، تحقق من السماح بالنوافذ المنبثقة");
  };

  const handleExportPdf = async (row: any, year: number) => {
    const { title, body, css } = generateAccountStatement(row, year);
    try {
      await downloadTraineeStatementPdf({
        title,
        body,
        css,
        fileName: `${title}.pdf`,
        pageSize: "A4",
        orientation: "portrait",
        marginMm: 0,
        fitToContent: true,
      });
      toast.success("تم تنزيل كشف الحساب بصيغة PDF بنجاح");
    } catch (error) {
      console.error("Account statement PDF error:", error);
      toast.error("تعذّر تنزيل كشف الحساب");
    }
  };

  const printStatement = (row: any, year: number) => {
    const { title, body, css } = generateAccountStatement(row, year);
    const opened = openBrowserPrintPreview({
      title,
      reportDateLabel,
      tableHtml: body,
      contentCss: css,
      defaultOrientation: "portrait",
      defaultPageSize: "A4",
      defaultMarginMm: 0,
      fitToContent: true,
      finalCss: `
        html body #tableContainer table.trainee-account-statement { width:100% !important; max-width:100% !important; table-layout:fixed !important; border-collapse:collapse !important; }
        html body #tableContainer table.trainee-account-statement th,
        html body #tableContainer table.trainee-account-statement td { border:1.5px solid #0f766e !important; padding:8px 12px !important; font-family:${reportArabicFontStack} !important; font-size:20px !important; line-height:1.4 !important; text-align:center !important; vertical-align:middle !important; -webkit-print-color-adjust:exact !important; print-color-adjust:exact !important; }
        html body #tableContainer table.trainee-account-statement thead th { background:#0f766e !important; background-image:none !important; color:#fff !important; font-size:17px !important; font-weight:900 !important; }
        html body #tableContainer table.trainee-account-statement tbody tr.row-fees > td { background:#eff6ff !important; color:#000 !important; }
        html body #tableContainer table.trainee-account-statement tbody tr.row-due-old > td { background:#fef3c7 !important; color:#000 !important; }
        html body #tableContainer table.trainee-account-statement tbody tr.row-total-due > td { background:${year === 2026 ? "#fecaca" : "#fee2e2"} !important; color:#000 !important; font-weight:900 !important; }
        html body #tableContainer table.trainee-account-statement tbody tr.row-paid > td { background:${year === 2026 ? "#dcfce7" : "#f0fdf4"} !important; color:#000 !important; font-weight:800 !important; }
        html body #tableContainer table.trainee-account-statement tbody tr.row-unpaid > td { background:#f8fafc !important; color:#64748b !important; }
        html body #tableContainer table.trainee-account-statement tbody tr.row-total-paid > td { background:${year === 2026 ? "#a7f3d0" : "#d1fae5"} !important; color:#000 !important; font-weight:900 !important; }
        html body #tableContainer table.trainee-account-statement tbody tr.row-final > td { background:${year === 2026 ? "#0f766e" : "#f1f5f9"} !important; color:${year === 2026 ? "#fff" : "#000"} !important; font-size:20px !important; font-weight:900 !important; }
        html body #tableContainer table.trainee-account-statement tbody tr.installments-statement-row > td * { background:transparent !important; color:inherit !important; }
      `,
    });
    if (!opened) {
      toast.error("تم منع فتح نافذة المعاينة، يرجى السماح بالنوافذ المنبثقة في كروم");
    }
  };


  // توحيد الاسم لتجاوز اختلاف الهمزات والتشكيل والمسافات وترتيب الأسماء.
  const normalizeTraineeName = (value: any): string =>
    String(value || "")
      .toLowerCase()
      .replace(/[ًٌٍَُِّْـ]/g, "")
      .replace(/[إأآٱ]/g, "ا")
      .replace(/[ؤ]/g, "و")
      .replace(/[ئ]/g, "ي")
      .replace(/ى/g, "ي")
      .replace(/[ـ.,،؛;:()\[\]{}"'ـ_-]/g, " ")
      .replace(/[^\p{L}\p{N}\s]/gu, " ")
      .replace(/\s+/g, " ")
      .trim();

  // المطابقة باسم المتدرب فقط، مع اشتراط تطابق الاسم الكامل بعد توحيد الهمزات
  // والتشكيل والمسافات، مع السماح باختلاف ترتيب أجزاء الاسم.
  // يمنع ذلك إظهار رسوم متدرب آخر لمجرد اشتراكهما في اسم أو كلمة شائعة.
  const traineeNamesMatch = (installmentName: any, hafizaName: any): boolean => {
    const installmentNameParts = [...new Set(
      normalizeTraineeName(installmentName).split(" ").filter(Boolean),
    )].sort();
    const hafizaNameParts = [...new Set(
      normalizeTraineeName(hafizaName).split(" ").filter(Boolean),
    )].sort();

    return installmentNameParts.length > 0 &&
      installmentNameParts.length === hafizaNameParts.length &&
      installmentNameParts.every((part, index) => part === hafizaNameParts[index]);
  };

  // كشف لسداد رسوم الامتحانات والقيد والتسجيل من حوافظ التوريد.
  const printExamFeesStatement = (row: any) => {
    const traineeName = String(row?.name || "").trim();
    if (!traineeName) return toast.error("اسم المتدرب غير محدد");

    const payments = (hafiza || []).flatMap((item: any) => {
      const name = String(item?.name || "").trim();
      const date = item?.notifyDate ? new Date(String(item.notifyDate)) : null;
      const amount = cleanNumber(item?.notifyAmount);
      const description = String(item?.description || "")
        .trim().replace(/[ًٌٍَُِّْـ]/g, "").replace(/[إأآ]/g, "ا").replace(/\s+/g, " ");
      const isExamFee = /(امتحان|اختبار)/.test(description);
      const isRegistrationFee = isRegistrationFeeDescription(item?.description);
      if (!traineeNamesMatch(traineeName, name) || !date || Number.isNaN(date.getTime()) ||
          date.getFullYear() < 2022 || amount <= 0 || (!isExamFee && !isRegistrationFee)) return [];
      return [{
        date, year: date.getFullYear(), month: date.getMonth(),
        category: isExamFee ? "رسوم الامتحانات" : "رسوم القيد والتسجيل",
        hafizaNo: String(item.hafizaNo || ""), notifyNo: String(item.notifyNo || ""),
        description: String(item.description || "رسوم امتحانات").trim(), amount,
      }];
    }).sort((a: any, b: any) => a.date.getTime() - b.date.getTime());

    if (!payments.length) {
      toast.error("لا توجد حوافظ توريد لرسوم الامتحانات أو القيد والتسجيل لهذا المتدرب منذ عام 2022");
      return;
    }

    const formatDate = (date: Date) =>
      String(date.getDate()).padStart(2, "0") + "/" +
      String(date.getMonth() + 1).padStart(2, "0") + "/" + date.getFullYear();
    const monthlyTotals = new Map<string, { category: string; label: string; amount: number }>();
    const yearlyTotals = new Map<string, { category: string; year: number; amount: number }>();
    const categoryTotals = new Map<string, number>();
    payments.forEach((payment: any) => {
      const key = payment.category + "|" + payment.year + "-" + payment.month;
      const monthName = payment.date.toLocaleDateString("ar", { month: "long" });
      const current = monthlyTotals.get(key);
      if (current) current.amount += payment.amount;
      else monthlyTotals.set(key, { category: payment.category, label: monthName + " " + payment.year, amount: payment.amount });
      const yearKey = payment.category + "|" + payment.year;
      const yearly = yearlyTotals.get(yearKey);
      if (yearly) yearly.amount += payment.amount;
      else yearlyTotals.set(yearKey, { category: payment.category, year: payment.year, amount: payment.amount });
      categoryTotals.set(payment.category, (categoryTotals.get(payment.category) || 0) + payment.amount);
    });

    const totalPaid = payments.reduce((sum: number, payment: any) => sum + payment.amount, 0);
    const safeName = safePdfFileName(traineeName);
    const detailRows = payments.map((payment: any) =>
      '<tr class="row-paid' + (payment.category === "رسوم القيد والتسجيل" ? ' row-registration' : '') + (payment.year === 2026 ? ' installments-statement-row row-paid-2026' : '') + '"><td>' + payment.year + '</td><td class="num">' + formatDate(payment.date) +
      '</td><td>' + escapeHtml(payment.hafizaNo || "—") + '</td><td>' +
      escapeHtml(payment.notifyNo || "—") + '</td><td class="lbl">' +
      escapeHtml(payment.description) + '</td><td class="num">' +
      escapeHtml(fmt(payment.amount)) + '</td></tr>'
    ).join("");
    const monthlyRows = Array.from(monthlyTotals.values()).map((item) =>
      '<tr class="row-period' + (item.label.endsWith("2026") ? ' installments-statement-row row-period-2026' : '') + '"><td colspan="5">إجمالي ' + escapeHtml(item.category) + ' لشهر ' + escapeHtml(item.label) +
      '</td><td class="num">' + escapeHtml(fmt(item.amount)) + '</td></tr>'
    ).join("");
    const yearlyRows = Array.from(yearlyTotals.values()).sort((a, b) => a.year - b.year || a.category.localeCompare(b.category, "ar")).map((item) =>
      '<tr class="row-year' + (item.year === 2026 ? ' installments-statement-row row-year-2026' : '') + '"><td colspan="5">إجمالي ' + escapeHtml(item.category) + ' لعام ' + item.year +
      '</td><td class="num">' + escapeHtml(fmt(item.amount)) + '</td></tr>'
    ).join("");
    const categoryRows = Array.from(categoryTotals.entries()).map(([category, amount]) =>
      '<tr class="row-category-total"><td colspan="5">الإجمالي الكلي لـ ' + escapeHtml(category) +
      '</td><td class="num">' + escapeHtml(fmt(amount)) + '</td></tr>'
    ).join("");

    const statementCss = [
      ' * { box-sizing: border-box; font-family: "IBM Plex Sans Arabic", "Noto Sans Arabic", "Noto Naskh Arabic", Cairo, Tahoma, Arial, sans-serif !important; }',
      'html, body { margin: 0; padding: 0; width: 100%; background: #fff; color: #000; direction: rtl; -webkit-print-color-adjust: exact; print-color-adjust: exact; }',
      '.container { width: 100%; margin: 0; padding: 0; }',
      '.page-frame { width: 100%; border: 2px solid #0f766e; background: #fff; padding: 4mm; }',
      '.statement-title { text-align: center; font-size: 20px; font-weight: 900; color: #0f766e; margin: 0 0 12px; padding-bottom: 8px; border-bottom: 2px solid #0f766e; }',
      '.info-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 8px; margin-bottom: 14px; }',
      '.info-box { border: 1px solid #000; background: #CDD5AE; padding: 2mm 1.5mm; min-height: 12mm; text-align: center; }',
      '.info-lbl { font-size: 16px; font-weight: 700; color: #0f766e; margin-bottom: 2px; }',
      '.info-val { font-size: 18px; font-weight: 900; color: #000; }',
      '.statement-table { width: 100%; table-layout: fixed; border-collapse: collapse; margin-top: 4px; }',
      '.statement-table th, .statement-table td { border: 1.5px solid #0f766e; text-align: center; vertical-align: middle; padding: 2px; font-size: 12px; white-space: nowrap; }',
      'th { background: #0f766e !important; color: #fff !important; font-weight: 900; }',
      'td { color: #000 !important; font-weight: 800; }',
      '.lbl { font-weight: 900; } .num { direction: ltr; white-space: nowrap; font-variant-numeric: tabular-nums; }',
      '.row-paid td { background: #f0fdf4 !important; } .row-period td { background: #e0f2fe !important; font-weight: 900; }',
      '.row-year td { background: #dbeafe !important; font-weight: 900; } .row-registration td { background: #DDEBFF !important; } .row-category-total td { background: #e0f2fe !important; font-weight: 900; }',
      '.row-paid-2026 td { background: #dcfce7 !important; color: #14532d !important; font-weight: 900; }',
      '.row-period-2026 td { background: #bfdbfe !important; color: #1e3a8a !important; font-weight: 900; }',
      '.row-year-2026 td { background: #1d4ed8 !important; color: #ffffff !important; font-weight: 900; }',
      '.row-final td { background: #0437bb !important; color: #fff !important; font-size: 17px; font-weight: 900; }',
      '.foot { margin-top: 10px; padding-top: 10px; display: flex; justify-content: space-between; font-size: 14px; font-weight: 800; border-top: 1.5px dashed #0f766e; }',
    ].join("\n");
    const infoCard = (label: string, value: string) =>
      '<div class="info-box"><div class="info-lbl">' + escapeHtml(label) +
      '</div><div class="info-val">' + escapeHtml(value || "—") + '</div></div>';
    const body = [
      '<div class="container"><div class="page-frame">',
      '<h2 class="statement-title">كشف سداد رسوم الامتحانات والقيد والتسجيل</h2><div class="info-grid">',
      infoCard("اسم المتدرب", traineeName),
      infoCard("الدفعة", String(row.batch || "—")),
      infoCard("المساق", String(row.specialty || "—")),
      infoCard("الفترة", "من عام 2022 وحتى آخر توريد مسجل"),
      '</div><table class="statement-table"><colgroup><col style="width:6%"><col style="width:12%"><col style="width:10%"><col style="width:10%"><col style="width:48%"><col style="width:14%"></colgroup><thead><tr><th>السنة</th><th>تاريخ التوريد</th><th>رقم الحافظة</th><th>رقم الإشعار</th><th>البيان الأصلي</th><th>مبلغ التوريد</th></tr></thead><tbody>',
      detailRows, monthlyRows, yearlyRows, categoryRows,
      '<tr class="installments-statement-row row-final"><td colspan="5">الإجمالي الكلي لرسوم الامتحانات والقيد والتسجيل</td><td class="num">' +
      escapeHtml(fmt(totalPaid)) + '</td></tr></tbody></table>',
      '<div class="foot"><span>تاريخ التقرير: ' + escapeHtml(reportDateLabel) +
      '</span><span>التوقيع: ________________</span></div></div></div>',
    ].join("");
    const title = "كشف_سداد_رسوم_الامتحانات_والقيد_والتسجيل_" + safeName + "_من_2022_" + reportDate;
    const opened = openBrowserPrintPreview({
      title, reportDateLabel, tableHtml: body, contentCss: statementCss,
      defaultOrientation: "landscape", defaultPageSize: "A4",
      defaultMarginMm: 5, fitToContent: false,
    });
    if (!opened) toast.error("تم منع فتح نافذة المعاينة، يرجى السماح بالنوافذ المنبثقة في كروم");
  };



  const stats2025 = [
  {
    label: "إجمالي الرسوم التقديرية",
    value: fmt(totals2025.fees),
    bgClass: "bg-white",
    borderClass: "border-sky-100",
    accentClass: "bg-sky-500",
  },
  {
    label: "إجمالي الأقساط المسددة",
    value: fmt(totals2025.paid),
    bgClass: "bg-emerald-50/70",
    borderClass: "border-emerald-100",
    accentClass: "bg-emerald-500",
  },
  {
    label: "إجمالي المتبقي",
    value: fmt(totals2025
      .remaining),
    bgClass: "bg-orange-50/70",
    borderClass: "border-orange-100",
    accentClass: "bg-orange-500",
  }, ];
  
  const stats2026 = [
  {
    label: "المدور (متبقي 2025)",
    value: fmt(totals2026.prevDue),
    bgClass: "bg-white",
    borderClass: "border-sky-100",
    accentClass: "bg-sky-600",
  },
  {
    label: "إجمالي مسدد 2026",
    value: fmt(totals2026.paid),
    bgClass: "bg-emerald-50/70",
    borderClass: "border-emerald-100",
    accentClass: "bg-emerald-500",
  },
  {
    label: "صافي الرصيد المتبقي",
    value: fmt(totals2026
      .remaining),
    bgClass: "bg-orange-50/70",
    borderClass: "border-orange-100",
    accentClass: "bg-orange-500",
  }, ];
  
  const handleDetailedPdf2026 =
async () => {
      if (detailedPdfBusy2026) return;
      if (!filteredRows2026.length) {
        toast.error(
          "لا توجد بيانات للتصدير");
        return;
      }
      setDetailedPdfBusy2026(true);
      try {
        await exportToPDF(2026, { ...
          DEFAULT_PRINT_SETTINGS }, { download: true });
      } finally {
        setDetailedPdfBusy2026(false);
      }
    };
  
  const installments2025WebActions:
    WebActionItem[] = [
      {
        label: "استيراد Excel",
        onSelect: () => undefined,
        content: (
          <label className="flex w-full relative cursor-pointer items-center gap-2 rounded-lg px-2 py-1 text-sm font-semibold text-slate-700 hover:bg-slate-100">
          <span>{importingYear === 2025 ? "جارٍ الاستيراد…" : "استيراد Excel"}</span>
          <input
            type="file"
            accept=".xlsx,.xls"
            disabled={importingYear !== null}
            onChange={(e) => importFile(e, 2025)}
            className="absolute h-0 w-0 opacity-0 overflow-hidden"
          />
        </label>
        ),
      },
      { label: "تصدير Excel التفصيلي",
        icon: FileSpreadsheet,
        onSelect: () => exportToExcel(
            2025) },
      { label: "طباعة تفصيلية",
        icon: Printer, onSelect: () =>
          setPrintSettingsYear(2025) },
    ];
  
  const installments2026WebActions:
    WebActionItem[] = [
      {
        label: condFormatRules.length ?
          `تنسيق نشط (${condFormatRules.length})` :
          "تنسيق شرطي",
        icon: Palette,
        onSelect: () =>
          setCondFormatModal(true),
      },
      { label: "طالب جديد", icon: Plus,
        onSelect: () =>
          setNewRowModal2026(true) },
      { label: "عمود جديد", icon: Plus,
        onSelect: () => setNewColModal(
          true) },
      { label: "إضافة قسط", icon: Plus,
        onSelect: () =>
          setNewPaymentModal(true) },
      {
        label: "استيراد Excel",
        onSelect: () => undefined,
        content: (
          <label className="flex w-full relative cursor-pointer items-center gap-2 rounded-lg px-2 py-1 text-sm font-semibold text-slate-700 hover:bg-slate-100">
          <span>{importingYear === 2026 ? "جارٍ الاستيراد…" : "استيراد Excel"}</span>
          <input
            type="file"
            accept=".xlsx,.xls"
            disabled={importingYear !== null}
            onChange={(e) => importFile(e, 2026)}
            className="absolute h-0 w-0 opacity-0 overflow-hidden"
          />
        </label>
        ),
      },
      { label: "تصدير Excel التفصيلي",
        icon: FileSpreadsheet,
        onSelect: () => exportToExcel(
            2026) },
      { label: "طباعة تفصيلية",
        icon: Printer, onSelect: () =>
          setPrintSettingsYear(2026) },
      {
        label: detailedPdfBusy2026 ?
          
          "جارٍ التحضير…" :
          "تنزيل PDF التفصيلي",
        icon: Download,
        onSelect: handleDetailedPdf2026,
        disabled: detailedPdfBusy2026,
      },
    ];
  
  return (
    <div className="mizan-installments-tab w-full space-y-4 sm:space-y-6 p-0" dir="rtl">
      
{/* ========== واجهة جدول 2025 ========== */}
      <div className="w-full bg-gradient-to-b from-sky-50/60 to-white shadow-lg border border-sky-100 rounded-2xl overflow-hidden">
        <div className="bg-gradient-to-l from-sky-800 via-sky-600 to-sky-600 px-2 sm:px-6 py-2.5 sm:py-4 flex flex-col sm:flex-row justify-between items-stretch sm:items-center flex-wrap gap-2">
          <div className="min-w-0">
            <h2 className={`${HEADING_MOBILE} text-white`}>
 
 📊 أقساط ومستندات 
 العام 2025
            </h2>
 <p className="text-lg text-sky-100">يشمل جميع الدفعات لعامي 2024 و 2025</p>
          </div>
<div className="installments-controls-2025 w-full grid grid-cols-2 gap-2 items-center">
 <div className="installments-search-2025 relative col-span-2 w-full sm:w-auto">
<Search className="w-8 h-4 absolute right-2.5 top-2.5 text-sky-500" />
              <input
                type="text"
                placeholder="بحث (الاسم، الدفعة، المساق)..."
                value={search2025}
                onChange={(e) => { setSearch2025(e.target.value); setPage2025(1); }}
 className="pl-3 pr-8 py-2 rounded-lg text-sm border border-sky-300 outline-none focus:ring-2 focus:ring-sky-300 w-full sm:w-48 text-slate-800 shadow-sm"
              />
            </div>
<label className={`apk-only-actions relative w-full px-2 sm:px-2 py-2 sm:py-2 bg-white text-sky-700 rounded-lg text-xs sm:text-xs font-bold cursor-pointer hover:bg-sky-50 shadow text-center ${importingYear !== null ? "opacity-60 pointer-events-none" : ""}`}>
  {importingYear === 2025 ? "جارٍ الاستيراد…" : "📥 استيراد الملف"}{" "}
  <input
    type="file"
    accept=".xlsx,.xls"
    disabled={importingYear !== null}
    onChange={(e) => importFile(e, 2025)}
    className="absolute h-0 w-0 opacity-0 overflow-hidden"
  />
</label>


<div className="apk-only-actions col-span-2 flex gap-1 w-full">
<button
 onClick={() => exportToExcel(2025)}
className={`flex-1 ${BTN_COMPACT} bg-teal-400 text-black-700 rounded-md font-bold shadow hover:bg-green-200 transition-colors flex items-center justify-center gap-1`}
  >تصدير الي اكسل
<FileSpreadsheet className={ICON_MOBILE} /> 
<span className="hidden sm:inline">Excel تصدير الي 
</span>
              </button>
              <button
                onClick={() => setPrintSettingsYear(2025)}
className={`flex-1 ${BTN_COMPACT} bg-green-500 text-white rounded-md font-bold shadow hover:bg-white transition-colors flex items-center justify-center gap-1`} >طباعة تفصيلية
 <Printer className={ICON_MOBILE} /> <span className="hidden sm:inline">طباعة تفصيلية</span>
              </button>
            </div>

<TabActions
 title="أقساط العام 2025"
              rows={installments2025 || []}
              columns={[
                { key: "name", label: "اسم المتدرب" },
                { key: "batch", label: "الدفعة" },
                { key: "specialty", label: "المساق" },
                { key: "fees", label: "الرسوم" },
                { key: "totalPaid", label: "المسدد" },
                { key: "remaining", label: "المتبقي" },
              ]}
              fileName="اقساط-2025"
              numericKeys={["fees", "totalPaid", "remaining"]}
              onClear={() => clearInstallments("2025")}
              printLabel="الأقساط/إجمالي"
              pdfLayout="wide-centered"
              pdfOrientation="portrait"
              pdfMarginMm={1}
              pdfCss={INSTALLMENTS_SUMMARY_REPORT_CSS}
              additionalWebActions={installments2025WebActions}
 className="col-span-2 w-full grid !grid-cols-2 !gap-2 [&>button]:w-full [&>button]:min-w-0 [&>button]:justify-center [&>button]:px-2 [&>button]:py-2"
            />
          </div>
        </div>

        {importError && (
 <div className="bg-red-50 border-b border-red-200 p-3 flex gap-2">
<AlertCircle className="w-5 h-5 text-red-600" />
            <p className="text-sm text-red-700">{importError}</p>
          </div>
        )}

 <div className="p-1 sm:p-3">
<StatsGrid stats={stats2025} columns={3} />
<div className="flex items-center justify-between gap-2 px-2 py-2 text-xs text-slate-700" aria-live="polite">
  <span>عرض {filteredRows2025.length ? (currentPage2025 - 1) * INSTALLMENT_PAGE_SIZE + 1 : 0}–{Math.min(currentPage2025 * INSTALLMENT_PAGE_SIZE, filteredRows2025.length)} من {filteredRows2025.length} سجل</span>
  <div className="flex items-center gap-2">
    <button type="button" disabled={currentPage2025 <= 1} onClick={() => setPage2025((page) => Math.max(1, page - 1))} className="rounded border px-2 py-1 disabled:opacity-40">السابق</button>
    <span>{currentPage2025} / {totalPages2025}</span>
    <button type="button" disabled={currentPage2025 >= totalPages2025} onClick={() => setPage2025((page) => Math.min(totalPages2025, page + 1))} className="rounded border px-2 py-1 disabled:opacity-40">التالي</button>
  </div>
</div>
<div className="overflow-auto max-h-[72vh] rounded-lg border border-slate-200 shadow-sm relative">
            <table className="installments-table min-w-max table-auto text-sm sm:text-base font-semibold">
              <thead className="bg-gradient-to-b from-sky-700 to-sky-800 font-bold border-b-2 border-sky-900  [&>tr>th]:!text-white sticky top-0 z-20 shadow-md">
                <tr>
                  <th className="text-center whitespace-nowrap !px-1 !py-1.5 sm:!px-2 sm:!py-2 !text-sm sm:!text-base">#</th>
                  <th
                    className="text-center whitespace-nowrap cursor-pointer hover:bg-white/10 transition-colors !px-1 !py-1.5 sm:!px-2 sm:!py-2 !text-sm sm:!text-base"
                    onClick={() => handleSort2025("name")}
                  >
                    <div className="flex items-center justify-center gap-1">
                      اسم المتدرب <SortIcon sortConfig={sortConfig2025} columnKey="name" />
                    </div>
                  </th>
                  <th
                    className="text-center whitespace-nowrap cursor-pointer hover:bg-white/10 transition-colors !px-1 !py-1.5 sm:!px-2 sm:!py-2 !text-sm sm:!text-base"
                    onClick={() => handleSort2025("batch")}
                  >
                    <div className="flex items-center justify-center gap-1">
                      الدفعة <SortIcon sortConfig={sortConfig2025} columnKey="batch" />
                    </div>
                  </th>
                  <th
                    className="text-center whitespace-nowrap cursor-pointer hover:bg-white/10 transition-colors !px-1 !py-1.5 sm:!px-2 sm:!py-2 !text-sm sm:!text-base"
                    onClick={() => handleSort2025("specialty")}
                  >
                    <div className="flex items-center justify-center gap-1">
                      المساق <SortIcon sortConfig={sortConfig2025} columnKey="specialty" />
                    </div>
                  </th>
                  <th
                    className="text-center whitespace-nowrap cursor-pointer hover:bg-white/10 transition-colors !px-1 !py-1.5 sm:!px-2 sm:!py-2 !text-sm sm:!text-base"
                    onClick={() => handleSort2025("fees")}
                  >
                    <div className="flex items-center justify-center gap-1">
                      الرسوم <SortIcon sortConfig={sortConfig2025} columnKey="fees" />
                    </div>
                  </th>
                  {MONTHS_2025.map((m) => (
                    <th
                      key={m}
                      className="text-center border-l border-white/25 whitespace-nowrap !px-1 !py-1.5 sm:!px-2 sm:!py-2 !text-sm sm:!text-base"
                    >
                      {m}
                    </th>
                  ))}
                  <th
                    className="text-center whitespace-nowrap cursor-pointer hover:bg-white/10 transition-colors !px-1 !py-1.5 sm:!px-2 sm:!py-2 !text-sm sm:!text-base"
                    onClick={() => handleSort2025("totalPaid")}
                  >
                    <div className="flex items-center justify-center gap-1">
                      المسدد <SortIcon sortConfig={sortConfig2025} columnKey="totalPaid" />
                    </div>
                  </th>
                  <th
                    className="text-center whitespace-nowrap cursor-pointer hover:bg-white/10 transition-colors !px-1 !py-1.5 sm:!px-2 sm:!py-2 !text-sm sm:!text-base"
                    onClick={() => handleSort2025("remaining")}
                  >
                    <div className="flex items-center justify-center gap-1">
                      المتبقي <SortIcon sortConfig={sortConfig2025} columnKey="remaining" />
                    </div>
                  </th>
                  <th className="text-center whitespace-nowrap !px-1 !py-1.5 sm:!px-2 sm:!py-2 !text-sm sm:!text-base">إجراءات</th>
                </tr>
              </thead>
              <tbody>
                {filteredRows2025.length === 0 ? (
                  <tr>
                    <td colSpan={8 + MONTHS_2025.length} className="text-center text-slate-400 !px-1 !py-1.5 sm:!px-2 sm:!py-2 !text-sm sm:!text-base whitespace-nowrap">
                      لا توجد بيانات (يرجى التأكد من استيراد الملف أو تعديل البحث)
                    </td>
                  </tr>
                ) : (
                  <>
                    {pageRows2025.map((r: any, i: number) => {
                      const originalIndex = originalIndex2025.get(r.name) ?? -1;
                      return (
                        <tr
                          key={i}
                          className="border-t border-slate-200 hover:bg-slate-50/80 transition-colors"
                        >
                          <td className="text-center text-black whitespace-nowrap !px-1 !py-1.5 sm:!px-2 sm:!py-2 !text-sm sm:!text-base">
                            {(currentPage2025 - 1) * INSTALLMENT_PAGE_SIZE + i + 1}
                          </td>
                          <td className="text-center font-semibold text-black whitespace-nowrap bg-sky-50/70 !px-1 !py-1.5 sm:!px-2 sm:!py-2 !text-sm sm:!text-base">
                            {r.name}
                          </td>
                          <td className="text-center text-black whitespace-nowrap bg-cyan-50/70 !px-1 !py-1.5 sm:!px-2 sm:!py-2 !text-sm sm:!text-base">
                            {r.batch || "—"}
                          </td>
                          <td className="text-center text-black whitespace-nowrap bg-sky-50/70 !px-1 !py-1.5 sm:!px-2 sm:!py-2 !text-sm sm:!text-base">
                            {r.specialty || "—"}
                          </td>
                          <td className="text-center numeric-cell font-mono font-semibold text-black whitespace-nowrap bg-blue-50/70 !px-1 !py-1.5 sm:!px-2 sm:!py-2 !text-sm sm:!text-base">
                            {fmt(r.fees)}
                          </td>
                          {MONTHS_2025.map((m) => {
                            const paid = Number(r.payments?.[m]) || 0;
                            return (
                              <td
                                key={m}
                                className="numeric-cell text-center bg-slate-50/50 border-l border-slate-200 whitespace-nowrap !px-1 !py-1.5 sm:!px-2 sm:!py-2 !text-sm sm:!text-base"
                              >
                                {paid > 0 ? (
                                  <span className="text-black font-bold numeric-cell font-mono">
                                    {fmt(paid)}
                                  </span>
                                ) : (
                                  <span className="text-slate-300">—</span>
                                )}
                              </td>
                            );
                          })}
                          <td className="text-center numeric-cell font-mono text-black font-bold bg-emerald-50/30 whitespace-nowrap !px-1 !py-1.5 sm:!px-2 sm:!py-2 !text-sm sm:!text-base">
                            {fmt(r.totalPaid)}
                          </td>
                          <td className="text-center numeric-cell font-mono text-black font-bold bg-rose-50/30 whitespace-nowrap !px-1 !py-1.5 sm:!px-2 sm:!py-2 !text-sm sm:!text-base">
                            {fmt(r.remaining)}
                          </td>
                          <td className="text-center whitespace-nowrap flex justify-center gap-1 !px-1 !py-1.5 sm:!px-2 sm:!py-2 !text-sm sm:!text-base">
                            <button
                              onClick={() => {
                                setEditRowData(r);
                                setEditRowModal({ year: 2025, row: r, index: originalIndex });
                              }}
                              className="p-1 bg-sky-50 text-amber-600 rounded border border-amber-200 hover:bg-amber-500 hover:text-white transition-colors"
                              title="تعديل الصف"
                            >
                              <Edit className={ICON_MOBILE} />
                            </button>
                            <button
                              onClick={() => printStatement(r, 2025)}
                              className="p-1 bg-blue-50 text-blue-600 rounded border border-blue-200 hover:bg-blue-500 hover:text-white transition-colors"
                              title="طباعة الكشف"
                            >
                              <Printer className={ICON_MOBILE} />
                            </button>
                                <button
                                  onClick={() => handleExportPdf(r, 2025)}
                                  className="p-1 bg-emerald-50 text-emerald-600 rounded border border-emerald-200 hover:bg-emerald-500 hover:text-white transition-colors"
                                  title="تنزيل PDF (متوافق مع شاومي)"
                                >
                                  <FileText className={ICON_MOBILE} />
                                </button>
                          </td>
                        </tr>
                      );
                    })}
                    <tr className="border-t-2 border-sky-800 bg-sky-100/80 font-extrabold">
                      <td className="text-center text-black whitespace-nowrap !px-1 !py-1.5 sm:!px-2 sm:!py-2 !text-sm sm:!text-base" colSpan={4}>
                        الإجماليات
                      </td>
                      <td className="text-center numeric-cell font-mono text-black whitespace-nowrap !px-1 !py-1.5 sm:!px-2 sm:!py-2 !text-sm sm:!text-base">
                        {fmt(totals2025.fees)}
                      </td>
                      {MONTHS_2025.map((m) => (
                        <td
                          key={m}
                          className="text-center numeric-cell font-mono text-black border-l border-slate-200 whitespace-nowrap !px-1 !py-1.5 sm:!px-2 sm:!py-2 !text-sm sm:!text-base"
                        >
                          {totals2025.months[m] > 0 ? fmt(totals2025.months[m]) : "—"}
                        </td>
                      ))}
                      <td className="text-center numeric-cell font-mono text-black whitespace-nowrap !px-1 !py-1.5 sm:!px-2 sm:!py-2 !text-sm sm:!text-base">
                        {fmt(totals2025.paid)}
                      </td>
                      <td className="text-center numeric-cell font-mono text-black whitespace-nowrap !px-1 !py-1.5 sm:!px-2 sm:!py-2 !text-sm sm:!text-base">
                        {fmt(totals2025.remaining)}
                      </td>
                      <td className="text-center whitespace-nowrap !px-1 !py-1.5 sm:!px-2 sm:!py-2 !text-sm sm:!text-base"></td>
                    </tr>
                  </>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
{/* ========== واجهة جدول 2026 ========== */}
<div className="w-full bg-gradient-to-b from-sky-50/60 to-white shadow-lg border border-sky-100 rounded-2xl overflow-hidden">
  <div className="bg-gradient-to-l from-sky-800 via-sky-600 to-sky-600 px-4 sm:px-6 py-4 flex flex-col gap-4">
    
    {/* العنوان والوصف */}
    <div className="min-w-0">
      <h2 className="text-xl font-extrabold text-white">
        📊 سجل أقساط العام الحالي 2026
      </h2>
      <p className="text-lg sm:text-sm font-bold text-white/90 mt-1">
        بيانات المسدد والرصيد المدور لعام 2026
      </p>
    </div>

    {/* شبكة الأزرار والحقول (كل 2 أزرار/عناصر في سطر) */}
    <div className="installments-controls-2026 grid grid-cols-2 gap-2 w-full">

      {/* السطر 1: البحث + التنسيق الشرطي */}
      <div className="installments-search-2026 relative w-full col-span-2 sm:col-span-2">
    <Search className="w-15 h-5 absolute right-2.5 top-2 text-yellow-700 pointer-events-none" />
        <input
          type="text"
          placeholder="بحث (الاسم، الدفعة، المساق)..."
          value={search2026}
          onChange={(e) => { setSearch2026(e.target.value); setPage2026(1); }}
          className="pl-3 pr-8 py-1.5 rounded-lg text-sm border border-black outline-none focus:ring-2 focus:ring-sky-300 w-full text-white shadow-sm placeholder:text-white/70"
        />
      </div>

      <button
        onClick={() => setCondFormatModal(true)}
        className={`apk-only-actions installment-action-btn installment-action-format w-full px-2 py-1.5 rounded-md text-sm font-extrabold shadow transition-colors flex items-center justify-center gap-1 ${
          condFormatRules.length
            ? "bg-yellow-900 text-yellow-900 animate-pulse"
            : "bg-white/20 text-black hover:bg-white/30"
        }`}
        title="تلوين الصفوف حسب نص معين"
      >
        <Palette className={ICON_MOBILE} />
        <span>
          {condFormatRules.length
            ? `تنسيق نشط (${condFormatRules.length})`
            : "تنسيق شرطي"}
        </span>
      </button>

      {/* السطر 2: إضافة طالب جديد + إضافة عمود جديد */}
      <button
        onClick={() => setNewRowModal2026(true)}
        className="apk-only-actions installment-action-btn installment-action-student w-full px-2 py-1.5 bg-blue-900 text-white rounded-md text-sm sm:text-sm font-bold shadow hover:bg-blue-800 transition-colors flex items-center justify-center gap-1"
      >
        <Plus className={ICON_MOBILE} />
        <span>طالب جديد</span>
      </button>

      <button
        onClick={() => setNewColModal(true)}
        className="apk-only-actions installment-action-btn installment-action-column w-full px-2 py-1.5 bg-amber-800 text-white rounded-md text-xs sm:text-sm font-bold shadow hover:bg-amber-700 transition-colors flex items-center justify-center gap-1"
      >
        <Plus className={ICON_MOBILE} />
        <span>عمود جديد</span>
      </button>

      {/* السطر 3: إضافة قسط + استيراد */}
      <button
        onClick={() => setNewPaymentModal(true)}
        className="apk-only-actions installment-action-btn installment-action-payment w-full px-2 py-1.5 bg-red-700 text-white rounded-md text-sm font-bold shadow hover:bg-red-800 transition-colors flex items-center justify-center gap-1 truncate"
      >
        <span>➕ إضافة قسط</span>
      </button>

      <label className={`apk-only-actions installment-action-btn installment-action-import relative w-full px-2 py-1.5 bg-white text-sky-700 rounded-md text-sm font-bold cursor-pointer shadow hover:bg-sky-50 transition-colors flex items-center justify-center gap-1 text-center ${importingYear !== null ? "opacity-60 pointer-events-none" : ""}`}>
        {importingYear === 2026 ? "جارٍ الاستيراد…" : "📥 استيراد"}
        <input
          type="file"
          accept=".xlsx,.xls"
          disabled={importingYear !== null}
          onChange={(e) => importFile(e, 2026)}
          className="absolute h-0 w-0 opacity-0 overflow-hidden"
        />
      </label>

      {/* السطر 4: تصدير إلى Excel + طباعة تفصيلية */}
      <button
        onClick={() => exportToExcel(2026)}
        className={`installment-action-btn installment-action-excel w-full ${BTN_COMPACT} bg-green-100 text-green-900 rounded-md font-bold shadow hover:bg-green-200 transition-colors flex items-center justify-center gap-1 text-sm`}
      >
        <FileSpreadsheet className={ICON_MOBILE} />
        <span>تصدير Excel</span>
      </button>

      <button
        onClick={() => setPrintSettingsYear(2026)}
        className={`installment-action-btn installment-action-print w-full ${BTN_COMPACT} bg-green-800 text-black rounded-md font-bold shadow hover:bg-green-700 transition-colors flex items-center justify-center gap-1 text-sm`}
      >
        <Printer className={ICON_MOBILE} />
        <span>طباعة تفصيلية</span>
      </button>

      {/* السطر 5: مكون TabActions (يمتد على العمودين مع تنسيق الأزرار الداخلية 2 في كل سطر) */}
      <TabActions
        title="أقساط العام 2026"
        rows={(installments || []).map((r: any) => {
          const customValues: any = { ...r.customData };
          extraCols2026.forEach((col) => {
            if (col.type === "formula")
              customValues[col.name] = evaluateFormula(col.formula || "", r);
          });
          return { ...r, ...customValues };
        })}
        columns={[
          { key: "name", label: "اسم المتدرب" },
          { key: "batch", label: "الدفعة" },
          { key: "specialty", label: "المساق" },
          { key: "prevDue", label: "المتبقي من 2025" },
          { key: "fees", label: "الرسوم" },
          { key: "totalPaid", label: "المسدد" },
          { key: "remaining", label: "المتبقي" },
          { key: "notes", label: "الملاحظات" },
          ...extraCols2026.map((c) => ({ key: c.name, label: c.name })),
        ]}
        fileName="اقساط-2026"
        numericKeys={["prevDue", "fees", "totalPaid", "remaining"]}
        onClear={() => clearInstallments()}
        printLabel="الأقساط/إجمالي"
        pdfLayout="wide-centered"
        pdfOrientation="landscape"
        pdfMarginMm={1}
        pdfCss={INSTALLMENTS_SUMMARY_REPORT_CSS}
        pdfFinalCss={`
          #tableContainer table.installments-summary-2026 thead th,
          #tableContainer table.installments-summary-2026 tbody td {
            border: 1px solid #000000 !important;
            border-color: #000000 !important;
          }
          #tableContainer table.installments-summary-2026 tbody tr.total-row > td,
          #tableContainer table.installments-summary-2026 tbody tr.total-row > td * {
            color: #000000 !important;
            background: #e0f2fe !important;
            border: 1px solid #000000 !important;
            border-color: #000000 !important;
            font-weight: 900 !important;
          }
        `}
        printRowStyle={getConditionalRowPrintStyle}
        printTableClassName="installments-summary-2026"
        additionalWebActions={installments2026WebActions}
className="installments-summary-actions col-span-full grid grid-cols-2 gap-2 w-full 
[&>button]:w-auto 
[&>button]:min-w-auto
[&>button]:justify-center 
[&>button]:px-2 
[&>button]:py-1.5 [&>button]:text-xs [&>button]:font-bold [&>button]:rounded-md [&>button]:shadow"
      />

      {/* السطر 6: زر تنزيل PDF تفصيلي (يمتد عبر العرض الكامل لختام المجموعة) */}
      <button
        className="apk-only-actions installment-action-btn installment-action-pdf min-w-auto flex-items-center justify-center gap-1 px-3 py-2 bg-[#10528e] text-white rounded-md text-sm font-bold shadow-sm hover:bg-[#0d4272] active:scale-95 transition-all disabled:opacity-50"
        type="button"
        onClick={handleDetailedPdf2026}
        disabled={detailedPdfBusy2026}
        title="تنزيل تقرير الأقساط التفصيلي لعام 2026"
      >
        <Download
          className={`${ICON_MOBILE} ${
            detailedPdfBusy2026 ? "animate-pulse" : ""
          }`}
        />
        <span>{detailedPdfBusy2026 ? "جارٍ التحضير…" : "تنزيل PDF تفصيلي"}</span>
      </button>
    </div>
  </div>

<div className="p-1 sm:p-3">
          <StatsGrid stats={stats2026} columns={3} />
          <div className="flex items-center justify-between gap-2 px-2 py-2 text-xs text-slate-700" aria-live="polite">
            <span>عرض {filteredRows2026.length ? (currentPage2026 - 1) * INSTALLMENT_PAGE_SIZE + 1 : 0}–{Math.min(currentPage2026 * INSTALLMENT_PAGE_SIZE, filteredRows2026.length)} من {filteredRows2026.length} سجل</span>
            <div className="flex items-center gap-2">
              <button type="button" disabled={currentPage2026 <= 1} onClick={() => setPage2026((page) => Math.max(1, page - 1))} className="rounded border px-2 py-1 disabled:opacity-40">السابق</button>
              <span>{currentPage2026} / {totalPages2026}</span>
              <button type="button" disabled={currentPage2026 >= totalPages2026} onClick={() => setPage2026((page) => Math.min(totalPages2026, page + 1))} className="rounded border px-2 py-1 disabled:opacity-40">التالي</button>
            </div>
          </div>
          <div className="overflow-auto max-h-[72vh] rounded-lg border border-slate-200 shadow-sm relative">
<table className="installments-table installments-table-2026 w-auto min-w-auto table-auto text-xs sm:text-base font-semibold">
<thead className="bg-gradient-to-b from-sky-300 via-sky-400 to-sky-500 font-extrabold border-b-2 border-sky-700 text-black sticky top-0 z-20 shadow-md">
                <tr>
 <th className="text-center whitespace-nowrap !px-1 !py-1.5 sm:!px-2 sm:!py-2 !text-xl sm:!text-base text-white border-l border-sky-700/30">#</th>
                  <th
className="text-center whitespace-nowrap cursor-pointer hover:bg-black/5 transition-colors !px-1 !py-1.5 sm:!px-2 sm:!py-2 !text-sm sm:!text-base text-white border-l border-sky-700/30"
                    onClick={() => handleSort2026("name")}
                  >
                    <div className="flex items-center justify-center gap-1">
                      اسم المتدرب <SortIcon sortConfig={sortConfig2026} columnKey="name" />
                    </div>
                  </th>
                  <th
className="text-center whitespace-nowrap cursor-pointer hover:bg-black/5 transition-colors !px-1 !py-1.5 sm:!px-2 sm:!py-2 !text-sm sm:!text-base text-black border-l border-sky-700/30"
                    onClick={() => handleSort2026("batch")}
                  >
                    <div className="flex items-center justify-center gap-1">
                      دفعة <SortIcon sortConfig={sortConfig2026} columnKey="batch" />
                    </div>
                  </th>
                  <th
                    className="text-center whitespace-nowrap cursor-pointer hover:bg-black/5 transition-colors !px-1 !py-1.5 sm:!px-2 sm:!py-2 !text-sm sm:!text-base text-black border-l border-sky-700/30"
                    onClick={() => handleSort2026("specialty")}
                  >
                    <div className="flex items-center justify-center gap-1">
                      المساق <SortIcon sortConfig={sortConfig2026} columnKey="specialty" />
                    </div>
                  </th>
                  <th
                    className="text-center whitespace-nowrap cursor-pointer hover:bg-black/5 transition-colors !px-1 !py-1.5 sm:!px-2 sm:!py-2 !text-sm sm:!text-base text-black border-l border-sky-700/30"
                    onClick={() => handleSort2026("prevDue")}
                  >
                    <div className="flex items-center justify-center gap-1">
                      المتبقي من 2025 <SortIcon sortConfig={sortConfig2026} columnKey="prevDue" />
                    </div>
                  </th>
                  <th
                    className="text-center whitespace-nowrap cursor-pointer hover:bg-black/5 transition-colors !px-1 !py-1.5 sm:!px-2 sm:!py-2 !text-sm sm:!text-base text-black border-l border-sky-700/30"
                    onClick={() => handleSort2026("fees")}
                  >
                    <div className="flex items-center justify-center gap-1">
                      الرسوم <SortIcon sortConfig={sortConfig2026} columnKey="fees" />
                    </div>
                  </th>
                  {MONTHS_2026.map((m) => (
                    <th
                      key={m}
                      className="text-center border-l border-sky-700/30 whitespace-nowrap !px-1 !py-1.5 sm:!px-2 sm:!py-2 !text-sm sm:!text-base text-black"
                    >
                      {m.trim()}
                    </th>
                  ))}
                  {extraCols2026.map((col) => (
                    <th
                      key={col.name}
                      className="text-center border-l border-sky-700/30 whitespace-nowrap !px-1 !py-1.5 sm:!px-2 sm:!py-2 !text-sm sm:!text-base text-black"
                    >
 <div className="flex items-center justify-center gap-1">
                        {col.name}
                        <button
                          onClick={() =>
                            setEditColModal({
                              oldName: col.name,
                              name: col.name,
                              type: col.type,
                              options: col.options?.join(",") || "",
                              formula: col.formula || "",
                            })
                          }
                          className="p-0.5 bg-black/10 hover:bg-black/20 rounded transition-all"
                          title="تعديل أو حذف العمود"
                        >
                          <Settings className={ICON_MOBILE} />
                        </button>
                      </div>
                    </th>
                  ))}
                  <th
                    className="text-center whitespace-nowrap cursor-pointer hover:bg-black/5 transition-colors !px-1 !py-1.5 sm:!px-2 sm:!py-2 !text-sm sm:!text-base text-black border-l border-sky-700/30"
                    onClick={() => handleSort2026("totalPaid")}
                  >
                    <div className="flex items-center justify-center gap-1">
                      مسدد 2026 <SortIcon sortConfig={sortConfig2026} columnKey="totalPaid" />
                    </div>
                  </th>
                  <th
                    className="text-center whitespace-nowrap cursor-pointer hover:bg-black/5 transition-colors !px-1 !py-1.5 sm:!px-2 sm:!py-2 !text-sm sm:!text-base text-black border-l border-sky-700/30"
                    onClick={() => handleSort2026("remaining")}
                  >
                    <div className="flex items-center justify-center gap-1">
                      الرصيد المتبقي <SortIcon sortConfig={sortConfig2026} columnKey="remaining" />
                    </div>
                  </th>
                  <th className="text-center whitespace-nowrap !px-1 !py-1.5 sm:!px-2 sm:!py-2 !text-sm sm:!text-base text-black border-l border-sky-700/30">الملاحظات</th>
                  <th className="text-center whitespace-nowrap !px-1 !py-1.5 sm:!px-2 sm:!py-2 !text-sm sm:!text-base text-black border-l border-sky-700/30">حالة</th>
                  <th className="text-center whitespace-nowrap !px-1 !py-1.5 sm:!px-2 sm:!py-2 !text-sm sm:!text-base text-black">إجراءات</th>
                </tr>
              </thead>
              <tbody>
                {filteredRows2026.length === 0 ? (
                  <tr>
                    <td
                      colSpan={11 + MONTHS_2026.length + extraCols2026.length}
                      className="text-center text-slate-400 !px1 !py-1 !text-sm sm:!text-base whitespace-nowrap"
                    >
                      لا توجد بيانات (يرجى التأكد من استيراد الملف أو تعديل البحث)
                    </td>
                  </tr>
                ) : (
                  <>
                    {pageRows2026.map((r: any, i: number) => {
                      const status = getStatusText(r.remaining);
                      const originalIndex = originalIndex2026.get(r.name) ?? -1;
                      const rowBgClass = getConditionalRowClass(r);
                      const notesStatusRowClass = getNotesStatusRowClass(r.notes);

                      return (
                        <tr
                          key={i}
                          className={`border-t border-slate-200 transition-colors ${rowBgClass} ${notesStatusRowClass}`}
                        >
<td className="text-center text-black font-mono whitespace-nowrap !px-1 !py-1.5 sm:!px-2 sm:!py-2 !text-sm sm:!text-base border-l border-slate-200">
                            {(currentPage2026 - 1) * INSTALLMENT_PAGE_SIZE + i + 1}
                          </td>
<td className="text-center font-bold text-black whitespace-nowrap bg-fuchsia-50/70 !px-1 !py-1.5 sm:!px-2 sm:!py-2 !text-sm sm:!text-base border-l border-slate-200">
                            <input
                              value={r.name || ""}
                              onChange={(e) =>
                                update2026CellValue(originalIndex, "name", e.target.value)
                              }
                              className="w-auto min-w-max bg-transparent text-center text-black font-bold !text-sm sm:!text-base outline-none focus:bg-white focus:ring-2 ring-yellow-400 rounded px-1"
                            />
                          </td>
                          <td className="text-center text-black whitespace-nowrap bg-sky-50/70 !px-1 !py-1.5 sm:!px-2 sm:!py-2 !text-sm sm:!text-base border-l border-slate-200">
                            <input
                              value={r.batch || ""}
                              onChange={(e) =>
                                update2026CellValue(originalIndex, "batch", e.target.value)
                              }
                              className="w-full min-w-0 bg-transparent text-center text-black font-semibold !text-sm sm:!text-base outline-none focus:bg-white focus:ring-2 ring-yellow-400 rounded px-1"
                              placeholder="—"
                            />
                          </td>
                          <td className="text-center text-black whitespace-nowrap bg-sky-50/60 !px-1 !py-1.5 sm:!px-2 sm:!py-2 !text-sm sm:!text-base border-l border-slate-200">
                            <input
                              value={r.specialty || ""}
                              onChange={(e) =>
                                update2026CellValue(originalIndex, "specialty", e.target.value)
                              }
                              className="w-full min-w-0 bg-transparent text-center text-black font-semibold !text-sm sm:!text-base outline-none focus:bg-white focus:ring-2 ring-yellow-400 rounded px-1"
                              placeholder="—"
                            />
                          </td>
                          <td className="text-center numeric-cell font-mono text-black font-semibold bg-sky-50/40 whitespace-nowrap !px-1 !py-1.5 sm:!px-2 sm:!py-2 !text-sm sm:!text-base border-l border-slate-200">
                            <input
                              type="text"
                              inputMode="decimal"
                              value={fmt(cleanNumber(r.prevDue))}
                              onChange={(e) =>
                                update2026CellValue(originalIndex, "prevDue", e.target.value)
                              }
                              className="w-full min-w-0 bg-transparent text-center font-mono text-black font-semibold !text-sm sm:!text-base outline-none focus:bg-white focus:ring-2 ring-yellow-400 rounded px-1"
                            />
                          </td>
                          <td className="text-center numeric-cell font-mono text-black font-semibold whitespace-nowrap bg-sky-50/50 !px-1 !py-1.5 sm:!px-2 sm:!py-2 !text-sm sm:!text-base border-l border-slate-200">
                            <input
                              type="text"
                              inputMode="decimal"
                              value={fmt(cleanNumber(r.fees))}
                              onChange={(e) =>
                                update2026CellValue(originalIndex, "fees", e.target.value)
                              }
                              className="w-full min-w-0 bg-transparent text-center font-mono text-black font-semibold !text-sm sm:!text-base outline-none focus:bg-white focus:ring-2 ring-yellow-400 rounded px-1"
                            />
                          </td>
                          {MONTHS_2026.map((m) => {
                            const paid = Number(r.payments?.[m]) || 0;
                            const cellId = `${r.name}-${m}`;
                            return (
                              <td
                                key={m}
                                className="numeric-cell text-center relative bg-white/40 border-l border-slate-200 hover:bg-yellow-50 cursor-pointer group transition-colors whitespace-nowrap !px-1 !py-1.5 sm:!px-2 sm:!py-2 !text-sm sm:!text-base"
                                onMouseEnter={() => setHoveredCell(cellId)}
                                onMouseLeave={() => setHoveredCell(null)}
                              >
                                <input
                                  type="text"
                                  inputMode="decimal"
                                  value={paid > 0 ? fmt(paid) : ""}
                                  onChange={(e) =>
                                    update2026PaymentValue(originalIndex, m, e.target.value)
                                  }
                                  className="w-full min-w-0 bg-transparent text-center numeric-cell font-mono text-black font-semibold !text-sm sm:!text-base outline-none focus:bg-white focus:ring-2 ring-yellow-400 rounded px-1"
                                  placeholder="—"
                                />
                              </td>
                            );
                          })}

                          {extraCols2026.map((col) => (
                            <td key={col.name} className="border-l border-slate-200 !px-1 !py-1.5 sm:!px-2 sm:!py-2 !text-sm sm:!text-base whitespace-nowrap">
                              {col.type === "select" ? (
                                <select
                                  className="w-full min-w-0 text-center text-black font-semibold bg-transparent outline-none focus:bg-white focus:ring-2 ring-yellow-400 rounded px-1 !text-sm sm:!text-base"
                                  value={r.customData?.[col.name] || ""}
                                  onChange={(e) =>
                                    updateCustomColValue(originalIndex, col.name, e.target.value)
                                  }
                                >
                                  <option value="">- اختر -</option>
                                  {col.options?.map((opt, idx) => (
                                    <option key={idx} value={opt}>
                                      {opt}
                                    </option>
                                  ))}
                                </select>
                              ) : col.type === "formula" ? (
                                <div className="text-center min-w-0 numeric-cell font-mono !text-sm sm:!text-base font-semibold text-yellow-700 bg-white/50 px-1 rounded">
                                  {fmt(Number(evaluateFormula(col.formula || "", r) || 0))}
                                </div>
                              ) : (
                                <input
                                  type="text"
                                  className="w-full min-w-0 text-center text-black font-semibold bg-transparent outline-none focus:bg-white focus:ring-2 ring-yellow-400 rounded px-1 !text-sm sm:!text-base"
                                  value={r.customData?.[col.name] || ""}
                                  onChange={(e) =>
                                    updateCustomColValue(originalIndex, col.name, e.target.value)
                                  }
                                  placeholder="—"
                                />
                              )}
                            </td>
                          ))}

                          <td className="text-center numeric-cell font-mono text-black font-bold bg-emerald-50/50 whitespace-nowrap !px-1 !py-1.5 sm:!px-2 sm:!py-2 !text-sm sm:!text-base border-l border-slate-200">
                            {fmt(Number(r.totalPaid || 0))}
                          </td>
                          <td className="text-center numeric-cell font-mono text-black font-bold bg-rose-50/40 whitespace-nowrap !px-1 !py-1.5 sm:!px-2 sm:!py-2 !text-sm sm:!text-base border-l border-slate-200">
                            {fmt(Number(r.remaining || 0))}
                          </td>
                          <td className="text-center bg-amber-50/40 !px-1 !py-1.5 sm:!px-2 sm:!py-2 !text-sm sm:!text-base border-l border-slate-200 whitespace-nowrap">
                            <input
                              type="text"
                              value={r.notes || ""}
                              onChange={(e) =>
                                update2026CellValue(originalIndex, "notes", e.target.value)
                              }
                              className="w-full min-w-0 bg-transparent text-center text-black font-medium !text-sm sm:!text-base outline-none focus:bg-white focus:ring-2 ring-yellow-400 rounded px-1"
                              placeholder="—"
                            />
                          </td>

                          <td className="text-center whitespace-nowrap !px-1 !py-1.5 sm:!px-2 sm:!py-2 !text-sm sm:!text-base border-l border-slate-200">
                            <span
                              className={`px-2 py-0.5 rounded-full !text-xs sm:!text-sm font-bold ${status.bg} ${status.color}`}
                            >
                              {status.text}
                            </span>
                          </td>
                          <td className="text-center whitespace-nowrap flex justify-center gap-1 !px-1 !py-1.5 sm:!px-2 sm:!py-2 !text-sm sm:!text-base">
                            <button
                              onClick={() => {
                                setEditRowData(r);
                                setEditRowModal({ year: 2026, row: r, index: originalIndex });
                              }}
                              className="p-1 bg-sky-50 text-amber-600 rounded border border-amber-200 hover:bg-amber-500 hover:text-white transition-colors"
                              title="تعديل الصف"
                            >
                              <Edit className={ICON_MOBILE} />
                            </button>
                            <button
                              onClick={() => printStatement(r, 2026)}
                              className="p-1 bg-blue-50 text-blue-600 rounded border border-blue-200 hover:bg-blue-500 hover:text-white transition-colors"
                              title="طباعة الكشف"
                            >
                              <Printer className={ICON_MOBILE} />
                            </button>
                            <button
                              onClick={() => openFeeDemand(r)}
                              className="p-1 bg-sky-50 text-sky-700 rounded border border-sky-200 hover:bg-sky-600 hover:text-white transition-colors"
                              title="إعداد مطالبة مالية للمتدرب"
                            >
                              <ClipboardList className={ICON_MOBILE} />
                            </button>
                            <button
                              onClick={() => printExamFeesStatement(r)}
                              className="p-1 bg-violet-50 text-violet-700 rounded border border-violet-200 hover:bg-violet-600 hover:text-white transition-colors"
                              title="معاينة كشف سداد رسوم الامتحانات والقيد والتسجيل"
                            >
                              <FileSpreadsheet className={ICON_MOBILE} />
                            </button>
                            <button
                              onClick={() => deleteRow2026(originalIndex, r.name)}
                              className="p-1 bg-red-50 text-red-600 rounded border border-red-200 hover:bg-red-500 hover:text-white transition-colors"
                              title="حذف الصف"
                            >
                              <Trash className={ICON_MOBILE} />
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                    <tr className="total-row border-t-2 border-black bg-sky-100 font-extrabold !text-black">
                      <td className="text-center text-black whitespace-nowrap !px-1 !py-1.5 sm:!px-2 sm:!py-2 !text-sm sm:!text-base border-l border-sky-300" colSpan={4}>
                        الإجماليات
                      </td>
                      <td className="text-center numeric-cell font-mono text-black whitespace-nowrap !px-1 !py-1.5 sm:!px-2 sm:!py-2 !text-sm sm:!text-base border-l border-sky-300">
                        {fmt(Number(totals2026.prevDue || 0))}
                      </td>
                      <td className="text-center numeric-cell font-mono text-black whitespace-nowrap !px-1 !py-1.5 sm:!px-2 sm:!py-2 !text-sm sm:!text-base border-l border-sky-300">
                        {fmt(Number(totals2026.fees || 0))}
                      </td>

                      {MONTHS_2026.map((m) => (
                        <td
                          key={m}
                          className="text-center numeric-cell font-mono text-black whitespace-nowrap !px-1 !py-1.5 sm:!px-2 sm:!py-2 !text-sm sm:!text-base border-l border-sky-300"
                        >
                          {totals2026.months[m] > 0 ? fmt(Number(totals2026.months[m])) : "—"}
                        </td>
                      ))}
                      {extraCols2026.map((col) => (
                        <td
                          key={col.name}
                          className="text-center text-black whitespace-nowrap !px-1 !py-1.5 sm:!px-2 sm:!py-2 !text-sm sm:!text-base border-l border-sky-300"
                        >
                          —
                        </td>
                      ))}
                      <td className="text-center numeric-cell font-mono text-black whitespace-nowrap !px-1 !py-1.5 sm:!px-2 sm:!py-2 !text-sm sm:!text-base border-l border-sky-300">
                        {fmt(Number(totals2026.paid || 0))}
                      </td>
                      <td className="text-center numeric-cell font-mono text-black whitespace-nowrap !px-1 !py-1.5 sm:!px-2 sm:!py-2 !text-sm sm:!text-base border-l border-sky-300">
                        {fmt(Number(totals2026.remaining || 0))}
                      </td>
                      <td className="text-center whitespace-nowrap !px-1 !py-1.5 sm:!px-2 sm:!py-2 !text-sm sm:!text-base border-l border-sky-300">—</td>
                      <td className="text-center whitespace-nowrap !px-1 !py-1.5 sm:!px-2 sm:!py-2 !text-sm sm:!text-base border-l border-sky-300"></td>
                      <td className="text-center whitespace-nowrap !px-1 !py-1.5 sm:!px-2 sm:!py-2 !text-sm sm:!text-base"></td>
                    </tr>
                  </>
                )}
              </tbody>
            </table>
          </div>
          </div>
          </div>


      {/* ========== النوافذ المنبثقة ========== */}

      <Modal
        title="🎨 التنسيق الشرطي للصفوف"
        isOpen={condFormatModal}
        onClose={() => setCondFormatModal(false)}
      >
        <div className="space-y-20">
          <p className="text-xs text-slate-500">
            سيتم تلوين الصف بالكامل إذا كان يحتوي على النص الذي تدخله أدناه في أي عمود.
          </p>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              النص المطلوب البحث عنه (الشرط)
            </label>
            <input
              type="text"
              value={condFormatParams.text}
              onChange={(e) => setCondFormatParams({ ...condFormatParams, text: e.target.value })}
              className="w-full p-2 border rounded-md focus:ring-2 focus:ring-sky-300 outline-none text-sm"
              placeholder="مثال: معتمد, منسحب, مجاني..."
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-2">
              اختر لون تمييز الصف
            </label>
            <div className="flex gap-2">
              {[
                { name: "أصفر", class: "bg-sky-100 hover:bg-sky-100" },
                { name: "أخضر", class: "bg-green-100 hover:bg-green-100" },
                { name: "أحمر", class: "bg-red-100 hover:bg-red-100" },
                { name: "أزرق", class: "bg-blue-100 hover:bg-blue-100" },
                { name: "بنفسجي", class: "bg-sky-100 hover:bg-sky-100" },
              ].map((color) => (
                <button
                  key={color.class}
                  onClick={() => setCondFormatParams({ ...condFormatParams, color: color.class })}
                  className={`w-8 h-8 rounded-full border-2 ${
                    condFormatParams.color === color.class
                      ? "border-slate-800 scale-110"
                      : "border-transparent"
                  } ${color.class}`}
                  title={color.name}
                />
              ))}
            </div>
          </div>

          {condFormatRules.length > 0 && (
            <div className="space-y-2 border-t pt-3">
              <div className="text-xs font-bold text-slate-700">القواعد الحالية</div>
              {condFormatRules.map((rule, idx) => (
                <div
                  key={`${rule.text}-${idx}`}
                  className="flex items-center justify-between gap-2 bg-slate-50 border rounded-md p-2"
                >
                  <span className={`px-2 py-1 rounded text-xs ${rule.color}`}>{rule.text}</span>
                  <button
                    onClick={() => deleteConditionalRule(idx)}
                    className="text-red-600 hover:text-red-800 text-xs font-bold"
                  >
                    حذف
                  </button>
                </div>
              ))}
            </div>
          )}

          <div className="flex justify-between items-center pt-3 border-t mt-4">
            <button
              onClick={() => {
                setCondFormatParams({ text: "", color: "bg-sky-100" });
                setInstallmentConditionalRules2026([]);
                setCondFormatModal(false);
              }}
              className="px-3 py-1 bg-red-50 text-red-600 rounded-md text-xs font-bold hover:bg-red-100"
            >
              إلغاء التنسيق تماماً
            </button>
            <div className="flex gap-2">
              <button
                onClick={addConditionalRule}
                className="px-3 py-1 bg-amber-500 text-white rounded-md font-bold text-sm"
              >
                إضافة قاعدة
              </button>
              <button
                onClick={() => setCondFormatModal(false)}
                className="px-3 py-1 bg-sky-700 text-white rounded-md font-bold text-sm"
              >
                إغلاق
              </button>
            </div>
          </div>
        </div>
      </Modal>

      <Modal
        title={`⚙️ تعديل العمود: ${editColModal?.oldName}`}
        isOpen={!!editColModal}
        onClose={() => setEditColModal(null)}
      >
        {editColModal && (
          <form onSubmit={saveCustomColumnEdit} className="space-y-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">اسم العمود</label>
              <input
                type="text"
                required
                value={editColModal.name}
                onChange={(e) => setEditColModal({ ...editColModal, name: e.target.value })}
                className="w-full p-2 border rounded-md text-sm"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">نوع العمود</label>
              <select
                value={editColModal.type}
                onChange={(e: any) => setEditColModal({ ...editColModal, type: e.target.value })}
                className="w-full p-2 border rounded-md text-sm"
              >
                <option value="text">نص أو رقم حر (إدخال يدوي)</option>
                <option value="select">قائمة منسدلة (خيارات محددة)</option>
                <option value="formula">معادلة رياضية دالة (حساب تلقائي)</option>
              </select>
            </div>

            {editColModal.type === "select" && (
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  الخيارات (افصل بينها بفاصلة)
                </label>
                <input
                  type="text"
                  required
                  value={editColModal.options}
                  onChange={(e) => setEditColModal({ ...editColModal, options: e.target.value })}
                  className="w-full p-2 border rounded-md text-sm"
                  placeholder="مثال: معتمد, غير معتمد"
                />
              </div>
            )}

            {editColModal.type === "formula" && (
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  المعادلة (استخدم المتغيرات الإنجليزية)
                </label>
                <input
                  type="text"
                  required
                  value={editColModal.formula}
                  onChange={(e) => setEditColModal({ ...editColModal, formula: e.target.value })}
                  className="w-full p-2 border rounded-md text-left text-sm"
                  dir="ltr"
                />
              </div>
            )}

            <div className="flex justify-between items-center pt-3 border-t mt-4">
              <button
                type="button"
                onClick={() => deleteCustomColumn(editColModal.oldName)}
                className="px-3 py-1 bg-red-100 text-red-700 rounded-md flex items-center gap-1 font-bold text-sm"
              >
                <Trash className={ICON_MOBILE} /> حذف العمود
              </button>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setEditColModal(null)}
                  className="px-3 py-1 bg-slate-100 text-slate-700 rounded-md text-sm"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  className="px-3 py-1 bg-blue-600 text-white rounded-md font-bold text-sm"
                >
                  حفظ التعديل
                </button>
              </div>
            </div>
          </form>
        )}
      </Modal>

      <Modal
        title={`✏️ تعديل بيانات المتدرب (${editRowModal?.year})`}
        isOpen={!!editRowModal}
        onClose={() => setEditRowModal(null)}
      >
        <form onSubmit={saveRowEdit} className="space-y-3">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">اسم المتدرب</label>
            <input
              type="text"
              required
              value={editRowData?.name || ""}
              onChange={(e) => setEditRowData({ ...editRowData, name: e.target.value })}
              className="w-full p-2 border rounded-md text-sm"
            />
          </div>
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">الدفعة</label>
              <input
                type="text"
                value={editRowData?.batch || ""}
                onChange={(e) => setEditRowData({ ...editRowData, batch: e.target.value })}
                className="w-full p-2 border rounded-md text-sm"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">المساق</label>
              <input
                type="text"
                value={editRowData?.specialty || ""}
                onChange={(e) => setEditRowData({ ...editRowData, specialty: e.target.value })}
                className="w-full p-2 border rounded-md text-sm"
              />
            </div>
          </div>
          {editRowModal?.year === 2025 && (
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                الرسوم الكلية
              </label>
              <input
                type="number"
                value={editRowData?.fees || 0}
                onChange={(e) => setEditRowData({ ...editRowData, fees: e.target.value })}
                className="w-full p-2 border rounded-md text-sm"
              />
            </div>
          )}
          {editRowModal?.year === 2026 && (
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                المتبقي من 2025 (المدور)
              </label>
              <input
                type="number"
                value={editRowData?.prevDue || 0}
                onChange={(e) => setEditRowData({ ...editRowData, prevDue: e.target.value })}
                className="w-full p-2 border rounded-md text-sm"
              />
            </div>
          )}
          <div className="flex justify-end gap-2 pt-3 border-t mt-4">
            <button
              type="button"
              onClick={() => setEditRowModal(null)}
              className="px-3 py-1 bg-slate-100 text-slate-700 rounded-md text-sm"
            >
              إلغاء
            </button>
            <button
              type="submit"
              className="px-3 py-1 bg-amber-600 text-white rounded-md font-bold text-sm"
            >
              حفظ التعديلات
            </button>
          </div>
        </form>
      </Modal>

      <Modal
        title="➕ إضافة عمود جديد (2026)"
        isOpen={newColModal}
        onClose={() => setNewColModal(false)}
      >
        <form onSubmit={addCustomColumn} className="space-y-3">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">اسم العمود</label>
            <input
              type="text"
              required
              value={newColName}
              onChange={(e) => setNewColName(e.target.value)}
              className="w-full p-2 border rounded-md text-sm"
              autoFocus
              placeholder="مثل: حالة الاعتماد، الخصم..."
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">نوع العمود</label>
            <select
              value={newColType}
              onChange={(e: any) => setNewColType(e.target.value)}
              className="w-full p-2 border rounded-md text-sm"
            >
              <option value="text">نص أو رقم حر (إدخال يدوي)</option>
              <option value="select">قائمة منسدلة (خيارات محددة)</option>
              <option value="formula">معادلة رياضية دالة (حساب تلقائي)</option>
            </select>
          </div>

          {newColType === "select" && (
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                الخيارات (افصل بينها بفاصلة)
              </label>
              <input
                type="text"
                required
                value={newColOptions}
                onChange={(e) => setNewColOptions(e.target.value)}
                className="w-full p-2 border rounded-md text-sm"
                placeholder="مثال: معتمد, غير معتمد, قيد المراجعة"
              />
            </div>
          )}

          {newColType === "formula" && (
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                المعادلة (استخدم المتغيرات الإنجليزية)
              </label>
              <input
                type="text"
                required
                value={newColFormula}
                onChange={(e) => setNewColFormula(e.target.value)}
                className="w-full p-2 border rounded-md text-left text-sm"
                dir="ltr"
                placeholder="مثال: fees - totalPaid"
              />
            </div>
          )}

          <div className="flex justify-end gap-2 pt-3 border-t mt-4">
            <button
              type="button"
              onClick={() => setNewColModal(false)}
              className="px-3 py-1 bg-slate-100 text-slate-700 rounded-md text-sm"
            >
              إلغاء
            </button>
            <button type="submit" className="px-3 py-1 bg-amber-600 text-white rounded-md font-bold text-sm">
              إضافة العمود
            </button>
          </div>
        </form>
      </Modal>

      <Modal
        title="➕ إضافة طالب جديد لعام 2026"
        isOpen={newRowModal2026}
        onClose={() => setNewRowModal2026(false)}
      >
        <form onSubmit={addNewRow2026} className="space-y-3">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">اسم المتدرب *</label>
            <input
              type="text"
              required
              value={newRowData2026.name}
              onChange={(e) => setNewRowData2026({ ...newRowData2026, name: e.target.value })}
              className="w-full p-2 border rounded-md text-sm"
            />
          </div>
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">الدفعة</label>
              <input
                type="text"
                value={newRowData2026.batch}
                onChange={(e) => setNewRowData2026({ ...newRowData2026, batch: e.target.value })}
                className="w-full p-2 border rounded-md text-sm"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">المساق</label>
              <input
                type="text"
                value={newRowData2026.specialty}
                onChange={(e) =>
                  setNewRowData2026({ ...newRowData2026, specialty: e.target.value })
                }
                className="w-full p-2 border rounded-md text-sm"
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                الرسوم الكلية
              </label>
              <input
                type="number"
                value={newRowData2026.fees}
                onChange={(e) =>
                  setNewRowData2026({ ...newRowData2026, fees: Number(e.target.value) })
                }
                className="w-full p-2 border rounded-md text-sm"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                المتبقي من 2025
              </label>
              <input
                type="number"
                value={newRowData2026.prevDue}
                onChange={(e) =>
                  setNewRowData2026({ ...newRowData2026, prevDue: Number(e.target.value) })
                }
                className="w-full p-2 border rounded-md text-sm"
              />
            </div>
          </div>
          <div className="flex justify-end gap-2 pt-3 border-t mt-4">
            <button
              type="button"
              onClick={() => setNewRowModal2026(false)}
              className="px-3 py-1 bg-slate-100 text-slate-700 rounded-md text-sm"
            >
              إلغاء
            </button>
            <button type="submit" className="px-3 py-1 bg-blue-600 text-white rounded-md font-bold text-sm">
              إضافة المتدرب
            </button>
          </div>
        </form>
      </Modal>

      <Modal
        title="➕ إضافة قسط جديد - 2026"
        isOpen={newPaymentModal}
        onClose={() => setNewPaymentModal(false)}
      >
        <form onSubmit={addNewPayment} className="space-y-3">
          <div className="relative">
            <label className="block text-xs font-semibold text-slate-700 mb-1">اسم المتدرب *</label>
            <input
              type="text"
              required
              placeholder="ابحث عن الاسم"
              value={newStudentName}
              onChange={(e) => handleNameChange(e.target.value)}
              onFocus={() => newStudentName.length > 0 && setShowSuggestions(true)}
              className="w-full p-2 border rounded-md text-sm outline-none"
            />
            {showSuggestions && nameSuggestions.length > 0 && (
              <div className="absolute top-full right-0 left-0 bg-white border rounded-b-md shadow-xl z-50 max-h-32 overflow-y-auto text-sm">
                {nameSuggestions.map((n, idx) => (
                  <div
                    key={idx}
                    onClick={() => {
                      setNewStudentName(n);
                      setShowSuggestions(false);
                    }}
                    className="p-2 hover:bg-sky-50 cursor-pointer text-slate-800"
                  >
                    {n}
                  </div>
                ))}
              </div>
            )}
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              المبلغ المالي *
            </label>
            <input
              type="number"
              required
              value={newStudentAmount}
              onChange={(e) => setNewStudentAmount(e.target.value)}
              className="w-full p-2 border rounded-md text-sm"
              min="0"
              step="0.01"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              الشهر المستهدف *
            </label>
            <select
              required
              value={newStudentMonth}
              onChange={(e) => setNewStudentMonth(e.target.value)}
              className="w-full p-2 border rounded-md text-sm"
            >
              <option value="">-- اختر الشهر --</option>
              {MONTHS_2026.map((m) => (
                <option key={m} value={m}>
                  {m.trim()}
                </option>
              ))}
            </select>
          </div>
          <div className="flex justify-end gap-2 pt-3 border-t mt-4">
            <button
              type="button"
              onClick={() => setNewPaymentModal(false)}
              className="px-3 py-1 bg-slate-100 text-slate-700 rounded-md text-sm"
            >
              إلغاء
            </button>
            <button
              type="submit"
              className="px-3 py-1 bg-sky-700 text-white rounded-md font-bold text-sm"
            >
              حفظ
            </button>
          </div>
        </form>
      </Modal>

      <Modal
        title="💵 تسجيل دفعة مالية"
        isOpen={!!paymentModal}
        onClose={() => setPaymentModal(null)}
      >
        {paymentModal && (
          <>
            <div className="bg-emerald-50 border border-emerald-200 rounded-md p-3 text-slate-800 text-sm">
              <p>
                <b>المتدرب:</b> {paymentModal.row.name}
              </p>
              <p>
                <b>شهر:</b> {paymentModal.month}
              </p>
            </div>
            <form onSubmit={addPayment} className="space-y-3 mt-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  المبلغ المدفوع *
                </label>
                <input
                  type="number"
                  required
                  value={payAmount}
                  onChange={(e) => setPayAmount(e.target.value)}
                  className="w-full p-2 border rounded-md text-sm"
                  autoFocus
                  min="0"
                  step="0.01"
                />
              </div>
              <div className="flex justify-end gap-2 pt-3 border-t mt-4">
                <button
                  type="button"
                  onClick={() => setPaymentModal(null)}
                  className="px-3 py-1 bg-slate-100 text-slate-700 rounded-md text-sm"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  className="px-3 py-1 bg-emerald-600 text-white rounded-md font-bold text-sm"
                >
                  تأكيد التوريد
                </button>
              </div>
            </form>
          </>
        )}
      </Modal>

      <Modal
        title="✏️ مراجعة وتعديل القسط"
        isOpen={!!editPaymentModal}
        onClose={() => setEditPaymentModal(null)}
      >
        {editPaymentModal && (
          <>
            <div className="bg-blue-50 border border-blue-200 rounded-md p-3 text-slate-800 text-sm">
              <p className="font-bold">{editPaymentModal.row.name}</p>
              <p>بيان شهر: {editPaymentModal.month}</p>
            </div>
            <form onSubmit={editPayment} className="space-y-3 mt-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  المبلغ المعدل *
                </label>
                <input
                  type="number"
                  required
                  value={editAmount}
                  onChange={(e) => setEditAmount(e.target.value)}
                  className="w-full p-2 border rounded-md text-sm"
                  min="0"
                  step="0.01"
                />
              </div>
              <div className="flex justify-end gap-2 pt-3 border-t mt-4">
                <button
                  type="button"
                  onClick={() => setEditPaymentModal(null)}
                  className="px-3 py-1 bg-slate-100 text-slate-700 rounded-md text-sm"
                >
                  إلغاء
                </button>
                <button
                  type="button"
                  onClick={() => deletePayment(editPaymentModal.row, editPaymentModal.month)}
                  className="px-3 py-1 bg-red-600 text-white rounded-md text-sm"
                >
                  🗑️ حذف القسط
                </button>
                <button
                  type="submit"
                  className="px-3 py-1 bg-blue-600 text-white rounded-md font-bold text-sm"
                >
                  حفظ التعديل
                </button>
              </div>
            </form>
          </>
        )}
      </Modal>


      {feeDemandTrainee && (() => {
        const registrationUnpaid = feeDemandTrainee.registrationPaid <= 0;
        const examUnpaid = feeDemandTrainee.examPaid <= 0;
        const unpaidItems = [
          { label: "رسوم القيد والتسجيل", amount: feeDemandIncludeRegistration && registrationUnpaid ? Math.max(0, feeDemandRegistrationAmount) : 0 },
          { label: "رسوم امتحان الكتابي الأول", amount: feeDemandIncludeExam && examUnpaid ? Math.max(0, feeDemandExamAmount) : 0 },
          { label: "رسوم امتحان الكتابي النهائي", amount: feeDemandIncludeFinalWritten ? 30000 : 0 },
          { label: "رسوم امتحان العلمي الشفوي", amount: feeDemandIncludeOralScientific ? 100000 : 0 },
          { label: "رسوم امتحان شفوي/سريري", amount: feeDemandIncludeOralClinical ? 30000 : 0 },
        ].filter((fee) => fee.amount > 0);
        return (
          <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-950/60 p-3" role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget) setFeeDemandTrainee(null); }}>
            <section className="max-h-[92vh] w-full max-w-3xl overflow-y-auto rounded-2xl bg-white p-4 shadow-2xl sm:p-6" role="dialog" aria-modal="true" aria-labelledby="installment-fee-demand-title" dir="rtl">
              <div className="mb-4 flex items-center justify-between gap-3 border-b border-slate-200 pb-3">
                <h2 id="installment-fee-demand-title" className="text-lg font-black text-slate-900">مطالبة مالية للمتدرب</h2>
                <button type="button" onClick={() => setFeeDemandTrainee(null)} className="rounded-lg p-2 text-slate-600 hover:bg-slate-100" aria-label="إغلاق"><X className="h-5 w-5" /></button>
              </div>
              <div className="mb-4 rounded-xl border border-sky-200 bg-sky-50 p-3 text-right">
                <h3 className="mb-2 font-black text-slate-800">تحديد الرسوم المطلوب إدراجها في المطالبة</h3>
                <div className="grid gap-3 sm:grid-cols-2">
                  {registrationUnpaid && <label className="flex items-center gap-2 rounded-lg bg-white p-2 font-bold text-slate-800"><input type="checkbox" checked={feeDemandIncludeRegistration} onChange={(event) => setFeeDemandIncludeRegistration(event.target.checked)} /><span className="flex-1">رسوم القيد والتسجيل</span><input type="number" min="0" value={feeDemandRegistrationAmount} onChange={(event) => setFeeDemandRegistrationAmount(Math.max(0, Number(event.target.value) || 0))} className="w-24 rounded border border-slate-300 px-2 py-1 text-center" aria-label="مبلغ رسوم القيد والتسجيل" /><span>ريال</span></label>}
                  {examUnpaid && <label className="flex items-center gap-2 rounded-lg bg-white p-2 font-bold text-slate-800"><input type="checkbox" checked={feeDemandIncludeExam} onChange={(event) => setFeeDemandIncludeExam(event.target.checked)} /><span className="flex-1">رسوم امتحان الكتابي الأول</span><input type="number" min="0" value={feeDemandExamAmount} onChange={(event) => setFeeDemandExamAmount(Math.max(0, Number(event.target.value) || 0))} className="w-24 rounded border border-slate-300 px-2 py-1 text-center" aria-label="مبلغ رسوم امتحان الكتابي الأول" /><span>ريال</span></label>}
                  <label className="flex items-center gap-2 rounded-lg bg-white p-2 font-bold text-slate-800"><input type="checkbox" checked={feeDemandIncludeFinalWritten} onChange={(event) => setFeeDemandIncludeFinalWritten(event.target.checked)} /><span className="flex-1">رسوم امتحان الكتابي النهائي</span><strong className="whitespace-nowrap">30,000 ريال</strong></label>
                  <label className="flex items-center gap-2 rounded-lg bg-white p-2 font-bold text-slate-800"><input type="checkbox" checked={feeDemandIncludeOralScientific} onChange={(event) => setFeeDemandIncludeOralScientific(event.target.checked)} /><span className="flex-1">رسوم امتحان العلمي الشفوي</span><strong className="whitespace-nowrap">100,000 ريال</strong></label>
                  <label className="flex items-center gap-2 rounded-lg bg-white p-2 font-bold text-slate-800"><input type="checkbox" checked={feeDemandIncludeOralClinical} onChange={(event) => setFeeDemandIncludeOralClinical(event.target.checked)} /><span className="flex-1">رسوم امتحان شفوي/سريري</span><strong className="whitespace-nowrap">30,000 ريال</strong></label>
                </div>
                <p className="mt-2 text-xs text-slate-600">يُدرج في المطالبة ما تختاره فقط من الرسوم غير المسددة، ويمكن تعديل مبلغ كل رسم قبل الطباعة. الخيار الافتراضي هو رسوم امتحان الكتابي الأول فقط.</p>
              </div>
              <div className="space-y-3 text-sm leading-8 text-slate-900 text-center">
                <p className="text-left">التاريخ: {reportDateLabel}</p>
                <p>الأخ الدكتور/ <strong>{feeDemandTrainee.name}</strong>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;المحترم،</p>
                <p>تحية طيبة وبعد،</p>
                {unpaidItems.length ? <><p><strong>الموضوع: مطالبة بسداد الرسوم غير المسددة</strong></p><ul className="list-disc space-y-1 pr-6">{unpaidItems.map((fee) => <li key={fee.label}>{fee.label}: <strong>{fee.amount.toLocaleString("en-US")} ريال</strong></li>)}</ul><p>نرجو المبادرة إلى سداد الرسوم المستحقة المحددة أعلاه وغير المسددة أو المتأخرة، ومراجعة الإدارة المالية بالمجلس اليمني للاختصاصات الطبية – فرع صعدة لتوثيق السداد.</p><p>وفي حال عدم السداد، سيتم اتخاذ الإجراءات اللازمة وفقاً للوائح والأنظمة المعمول بها.</p></> : <p className="rounded-lg bg-emerald-50 p-3 font-bold text-emerald-800">لا توجد رسوم مستحقة غير مسددة على هذا المتدرب، لذا لا يمكن إصدار مطالبة مالية له.</p>}
                <p>شاكرين لكم حسن تعاونكم، وتفضلوا بقبول خالص الشكر والتقدير.</p>
              </div>
              <div className="mt-5 grid gap-3 sm:grid-cols-3">
                {([["department", "الصندوق"], ["director", "الشؤون المالية"], ["signer", "رئيس المجلس اليمني للاختصاصات الطبية / فرع صعدة"]] as const).map(([key, label]) => (
                  <label key={key} className="flex flex-col gap-1 text-xs font-bold text-slate-700 text-center">
                    {label}
                    <input type="text" value={feeDemandSignatures[key]} onChange={(event) => {
                      const next = { ...feeDemandSignatures, [key]: event.target.value };
                      setFeeDemandSignatures(next);
                      try { localStorage.setItem("reports-fee-demand-signatures-v1", JSON.stringify(next)); } catch {}
                    }} className="min-h-10 rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 outline-none focus:border-sky-600 text-center" placeholder={"أدخل " + label} />
                    <span className="mt-3 h-5 border-b border-dotted border-slate-500" />
                  </label>
                ))}
              </div>
              <div className="mt-5 flex flex-wrap justify-end gap-2 border-t border-slate-200 pt-4">
                <button type="button" onClick={() => setFeeDemandTrainee(null)} className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-bold text-slate-700 hover:bg-slate-50">إغلاق</button>
                <button type="button" disabled={!unpaidItems.length} onClick={printFeeDemand} className="inline-flex items-center gap-2 rounded-lg bg-sky-700 px-4 py-2 text-sm font-bold text-white hover:bg-sky-800 disabled:cursor-not-allowed disabled:bg-slate-400"><Printer className="h-4 w-4" /> معاينة وطباعة المطالبة</button>
              </div>
            </section>
          </div>
        );
      })()}
      <PrintSettingsModal
        open={printSettingsYear !== null}
        year={printSettingsYear ?? 2026}
        columnOptions={printColumnOptions(printSettingsYear ?? 2026)}
        onClose={() => setPrintSettingsYear(null)}
        onPrint={(s) => exportToPDF(printSettingsYear ?? 2026, s)}
      />
    </div>
  );
}
