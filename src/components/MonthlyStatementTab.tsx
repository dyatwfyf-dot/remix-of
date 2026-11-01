import React, { useMemo, useRef, useState } from "react";
import { useFiscalYear, getAvailableYears } from "@/lib/fiscalYear";
import { useStore } from "@/lib/store";
import { useReportDate } from "@/lib/reportDate";
import { buildMonthlyStatementRows, exportMonthlyStatement, normName } from "@/lib/exportImport";
import monthlySchema from "@/data/monthlyStatement.json";
import { toast } from "sonner";
import { Printer } from "lucide-react";
import { openBrowserPrintPreview } from "@/lib/browserPrintPreview";
import ImportButton from "./ImportButton";
import {
  getPeriodRange,
  getReportMovementLabel,
  getReportPeriodLabel,
  type ReportPeriodMode,
} from "@/lib/reportPeriods";
import {
  FileSpreadsheet,
  Calendar,
  CheckCircle2,
  ArrowDownLeft,
  ArrowUpRight,
  Scale,
  Sparkles,
  Layers,
  TrendingUp,
} from "lucide-react";

type StatementGroup = { title: string; accounts: string[] };
const GROUPS: StatementGroup[] = (monthlySchema as any).groups;
const ALL_ACCOUNTS = GROUPS.flatMap((g) => g.accounts);

const MONTHS_NAMES = [
  "يناير", "فبراير", "مارس", "أبريل", "مايو", "يونيو",
  "يوليو", "أغسطس", "سبتمبر", "أكتوبر", "نوفمبر", "ديسمبر"
];

// ── تنظيف وتوحيد النصوص العربية وتجاوز كافة الفوارق الإملائية ─────────────────
export const cleanArabic = (s: string) => {
  return String(s || "")
    .replace(/[\u064B-\u0652\u0670\u0640]/g, "") // التشكيل والتطويل
    .replace(/[أإآٱ]/g, "ا")
    .replace(/[ىي]/g, "ي")
    .replace(/ة/g, "ه")
    .replace(/ؤ/g, "و")
    .replace(/ئ/g, "ي")
    .replace(/ء/g, "")
    .replace(/\u062D\s*[\/\\]\s*/g, "حساب ") // ح/ -> حساب
    .replace(/[()\[\]./\\،,:\-_+]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
};

// استخراج جوهر اسم الحساب بحذف كلمة (حساب / حسابات / ح)
export const coreAccountName = (s: string) => {
  return cleanArabic(s)
    .replace(/^(حساب|حسابات|ح)\s+/, "")
    .replace(/\s+/g, " ")
    .trim();
};

// ── قاموس المرادفات الموسع للأبواب والحسابات الشائعة ─────────────────────────
const EXACT_ALIASES: Record<string, string> = {
  // ── الباب الأول والباب الثاني (الاستخدامات) ──
  [cleanArabic("الباب الاول")]: "الاستخدامات",
  [cleanArabic("الباب الأول")]: "الاستخدامات",
  [cleanArabic("باب اول")]: "الاستخدامات",
  [cleanArabic("باب أول")]: "الاستخدامات",
  [cleanArabic("الباب 1")]: "الاستخدامات",
  [cleanArabic("باب 1")]: "الاستخدامات",
  [cleanArabic("الباب1")]: "الاستخدامات",
  [cleanArabic("الأجور والمرتبات")]: "الاستخدامات",
  [cleanArabic("الاجور والمرتبات")]: "الاستخدامات",
  [cleanArabic("اجور ومرتبات")]: "الاستخدامات",
  [cleanArabic("مرتبات واجور")]: "الاستخدامات",
  [cleanArabic("نفقات الباب الاول")]: "الاستخدامات",
  [cleanArabic("استخدامات الباب الاول")]: "الاستخدامات",
  [cleanArabic("الاستخدامات - الباب الاول")]: "الاستخدامات",

  [cleanArabic("الباب الثاني")]: "الاستخدامات",
  [cleanArabic("باب ثاني")]: "الاستخدامات",
  [cleanArabic("الباب 2")]: "الاستخدامات",
  [cleanArabic("باب 2")]: "الاستخدامات",
  [cleanArabic("الباب2")]: "الاستخدامات",
  [cleanArabic("النفقات التشغيلية")]: "الاستخدامات",
  [cleanArabic("نفقات تشغيلية")]: "الاستخدامات",
  [cleanArabic("نفقات التشغيل")]: "الاستخدامات",
  [cleanArabic("مصاريف تشغيلية")]: "الاستخدامات",
  [cleanArabic("نفقات الباب الثاني")]: "الاستخدامات",
  [cleanArabic("استخدامات الباب الثاني")]: "الاستخدامات",
  [cleanArabic("الاستخدامات - الباب الثاني")]: "الاستخدامات",

  [cleanArabic("الباب الاول والثاني")]: "الاستخدامات",
  [cleanArabic("الباب الأول والثاني")]: "الاستخدامات",
  [cleanArabic("الباب الاول والباب الثاني")]: "الاستخدامات",

  // ── الباب الثالث (الموارد) ──
  [cleanArabic("الباب الثالث")]: "الموارد",
  [cleanArabic("باب ثالث")]: "الموارد",
  [cleanArabic("الباب 3")]: "الموارد",
  [cleanArabic("باب 3")]: "الموارد",
  [cleanArabic("الباب3")]: "الموارد",
  [cleanArabic("الدعم والموارد")]: "الموارد",
  [cleanArabic("دعم وموارد")]: "الموارد",
  [cleanArabic("الموارد")]: "الموارد",
  [cleanArabic("موارد الباب الثالث")]: "الموارد",
  [cleanArabic("الايرادات")]: "الموارد",
  [cleanArabic("الإيرادات")]: "الموارد",

  // ── الباب الرابع (اكتساب الأصول غير المالية) ──
  [cleanArabic("الباب الرابع")]: "حساب اكتساب الأصول غير المالية",
  [cleanArabic("باب رابع")]: "حساب اكتساب الأصول غير المالية",
  [cleanArabic("الباب 4")]: "حساب اكتساب الأصول غير المالية",
  [cleanArabic("باب 4")]: "حساب اكتساب الأصول غير المالية",
  [cleanArabic("الباب4")]: "حساب اكتساب الأصول غير المالية",
  [cleanArabic("اكتساب الأصول غير المالية")]: "حساب اكتساب الأصول غير المالية",
  [cleanArabic("اكتساب الاصول غير الماليه")]: "حساب اكتساب الأصول غير المالية",
  [cleanArabic("شراء أصول")]: "حساب اكتساب الأصول غير المالية",
  [cleanArabic("شراء اصول")]: "حساب اكتساب الأصول غير المالية",
  [cleanArabic("الاصول غير المالية")]: "حساب اكتساب الأصول غير المالية",

  // ── النقدية والبنوك والحسابات الوسيطة ──
  [cleanArabic("النقدية")]: "حساب النقدية",
  [cleanArabic("نقدية")]: "حساب النقدية",
  [cleanArabic("نقدية بالصندوق")]: "حساب النقدية",
  [cleanArabic("صندوق المركز")]: "حساب النقدية",
  [cleanArabic("الصندوق")]: "حساب النقدية",
  [cleanArabic("صندوق")]: "حساب النقدية",

  [cleanArabic("البنك موارد")]: "حساب البنك موارد",
  [cleanArabic("بنك موارد")]: "حساب البنك موارد",
  [cleanArabic("البنك موارد محلية")]: "حساب البنك موارد محلية",
  [cleanArabic("بنك موارد محلية")]: "حساب البنك موارد محلية",
  [cleanArabic("البنك استخدامات")]: "حساب البنك استخدامات",
  [cleanArabic("بنك استخدامات")]: "حساب البنك استخدامات",
  [cleanArabic("البنك نفقات تشغيلية محلية")]: "حساب البنك نفقات تشغيلية محلية",
  [cleanArabic("بنك نفقات تشغيلية")]: "حساب البنك نفقات تشغيلية محلية",
  [cleanArabic("البنك اكتساب اصول غير مالية محلية")]: "حساب البنك اكتساب أصول غير مالية محلية",
  [cleanArabic("البنك موارد عامة مشتركة")]: "حساب البنك موارد عامة مشتركة",
  [cleanArabic("البنك موارد مشتركة")]: "حساب البنك موارد مشتركة",
  [cleanArabic("البنك حسابات جارية")]: "حساب البنك حسابات جارية",
  [cleanArabic("البنك مساهمات ذاتية")]: "حساب البنك مساهمات ذاتية",
  [cleanArabic("البنك امانات")]: "حساب البنك أمانات",

  [cleanArabic("السلف المؤقتة")]: "حساب السلف المؤقتة",
  [cleanArabic("سلف مؤقتة")]: "حساب السلف المؤقتة",
  [cleanArabic("سلف الحسابات الجارية")]: "حساب سلف الحسابات الجارية",
  [cleanArabic("السلف على الأجور")]: "حساب السلف على الأجور",
  [cleanArabic("سلف الأجور")]: "حساب السلف على الأجور",
  [cleanArabic("المدينين مالية")]: "حساب المدينين (مالية)",
  [cleanArabic("مدينين مالية")]: "حساب المدينين (مالية)",
  [cleanArabic("الدائنين مالية")]: "حساب الدائنين (مالية)",
  [cleanArabic("دائنين مالية")]: "حساب الدائنين (مالية)",
  [cleanArabic("التأمينات المتنوعة")]: "حساب التأمينات المتنوعة",
  [cleanArabic("تامينات متنوعة")]: "حساب التأمينات المتنوعة",
  [cleanArabic("مرتجع الأجور")]: "حساب مرتجع الأجور",
  [cleanArabic("مرتجع اجور")]: "حساب مرتجع الأجور",
  [cleanArabic("تسوية المنصرف بالزيادة")]: "حساب تسوية المنصرف بالزيادة",
  [cleanArabic("المبالغ الدائنة تحت التسوية")]: "حساب المبالغ الدائنة تحت التسوية",
  [cleanArabic("مبالغ دائنة تحت التسوية")]: "حساب المبالغ الدائنة تحت التسوية",
  [cleanArabic("دائنة تحت التسوية")]: "حساب المبالغ الدائنة تحت التسوية",
  [cleanArabic("الامانات المتنوعة")]: "حساب الأمانات المتنوعة",
  [cleanArabic("أمانات متنوعة")]: "حساب الأمانات المتنوعة",
  [cleanArabic("امانات متنوعة")]: "حساب الأمانات المتنوعة",
  [cleanArabic("أمانات")]: "حساب الأمانات المتنوعة",
  [cleanArabic("امانات")]: "حساب الأمانات المتنوعة",
};

// ── مطابقة ذكية فائقة المرونة لأسماء الحسابات ──────────────────────────────
const ALL_ACCOUNTS_CLEAN = ALL_ACCOUNTS.map((a) => ({
  original: a,
  cleaned: cleanArabic(a),
  core: coreAccountName(a),
}));

export const matchAccount = (raw: string): string | null => {
  if (!raw) return null;
  const c = cleanArabic(raw);
  const core = coreAccountName(raw);
  if (!c) return null;

  if (EXACT_ALIASES[c]) return EXACT_ALIASES[c];
  if (EXACT_ALIASES[core]) return EXACT_ALIASES[core];

  const exact = ALL_ACCOUNTS_CLEAN.find((a) => a.cleaned === c);
  if (exact) return exact.original;

  const coreMatch = ALL_ACCOUNTS_CLEAN.find((a) => a.core === core);
  if (coreMatch) return coreMatch.original;

  const contains = ALL_ACCOUNTS_CLEAN.find(
    (a) =>
      a.cleaned.includes(c) ||
      c.includes(a.cleaned) ||
      a.core.includes(core) ||
      core.includes(a.core)
  );
  if (contains) return contains.original;

  return null;
};

// ── تحليل التاريخ واستخراج الشهر والسنة بدقة ─────────────────────────────────
function parseJournalDate(dateStr?: string | number): { year: number; month: number } | null {
  if (!dateStr) return null;

  const num = Number(dateStr);
  if (!isNaN(num) && num > 30000 && num < 60000) {
    const d = new Date((num - 25569) * 86400 * 1000);
    return { year: d.getUTCFullYear(), month: d.getUTCMonth() + 1 };
  }

  const s = String(dateStr).trim();
  const matchIso = s.match(/^(\d{4})[-/.](\d{1,2})[-/.](\d{1,2})/);
  if (matchIso) {
    return { year: parseInt(matchIso[1], 10), month: parseInt(matchIso[2], 10) };
  }
  const matchEur = s.match(/^(\d{1,2})[-/.](\d{1,2})[-/.](\d{4})/);
  if (matchEur) {
    return { year: parseInt(matchEur[3], 10), month: parseInt(matchEur[2], 10) };
  }
  const d = new Date(s);
  if (!isNaN(d.getTime())) {
    return { year: d.getFullYear(), month: d.getMonth() + 1 };
  }
  return null;
}

export default function MonthlyStatementTab() {
  const { journal } = useStore();
  const { reportDate, reportDateLabel } = useReportDate();
  const tableRef = useRef<HTMLTableElement>(null);

  const fiscalYear = useFiscalYear((s) => s.year);
  const [year, setYear] = useState(fiscalYear);
  React.useEffect(() => setYear(fiscalYear), [fiscalYear]);
  const [mode, setMode] = useState<ReportPeriodMode>("month");
  const [month, setMonth] = useState(new Date().getMonth() + 1);
  const [quarter, setQuarter] = useState(Math.floor(new Date().getMonth() / 3) + 1);
  const [halfYear, setHalfYear] = useState(new Date().getMonth() < 6 ? 1 : 2);

  const { startMonth, endMonth } = getPeriodRange({ mode, year, month, quarter, halfYear });

  // مصدر موحد للمجاميع: الشاشة وPDF وExcel تعتمد نفس الترحيل والمطابقة
  const { data, matchedEntriesCount, activeMonths } = useMemo(() => {
    const statement = buildMonthlyStatementRows(journal, year, startMonth, endMonth);
    const map = Object.fromEntries(
      Object.entries(statement.map).map(([key, row]) => [
        key,
        {
          prevDebit: row.prevD,
          prevCredit: row.prevC,
          curDebit: row.curD,
          curCredit: row.curC,
        },
      ])
    ) as Record<string, { prevDebit: number; prevCredit: number; curDebit: number; curCredit: number }>;

    const active = new Set<number>();
    journal.forEach((entry) => {
      const parsed = parseJournalDate(entry.date);
      if (parsed?.year === year) active.add(parsed.month);
    });

    const matched = Object.values(map).filter(
      (row) => row.prevDebit || row.prevCredit || row.curDebit || row.curCredit
    ).length;

    return {
      data: map,
      matchedEntriesCount: matched,
      activeMonths: Array.from(active).sort((a, b) => a - b),
    };
  }, [journal, year, startMonth, endMonth]);

  // احتساب الإجماليات العامة وتجميع الأرصدة بدون مقاصة (مجموع أرصدة الحسابات)
  const totals = useMemo(() => {
    let prevDebit = 0;
    let prevCredit = 0;
    let curDebit = 0;
    let curCredit = 0;
    let balDebit = 0;
    let balCredit = 0;

    ALL_ACCOUNTS.forEach((acc) => {
      const row = data[normName(acc)];
      if (!row) return;
      prevDebit += row.prevDebit;
      prevCredit += row.prevCredit;
      curDebit += row.curDebit;
      curCredit += row.curCredit;

      const totD = row.prevDebit + row.curDebit;
      const totC = row.prevCredit + row.curCredit;
      const balD = Math.max(0, totD - totC);
      const balC = Math.max(0, totC - totD);
      balDebit += balD;
      balCredit += balC;
    });

    return {
      prevDebit,
      prevCredit,
      curDebit,
      curCredit,
      balDebit,
      balCredit,
    };
  }, [data]);

  const movementLabel = getReportMovementLabel({ mode, year, month, quarter, halfYear });
  const periodLabel = getReportPeriodLabel({ mode, year, month, quarter, halfYear });
  const netBalance = totals.curDebit - totals.curCredit;

  const handlePrint = () => {
    const tableHtml = tableRef.current?.outerHTML;
    if (!tableHtml) {
      toast.error("تعذر تجهيز كشف الحساب للطباعة");
      return;
    }
    const opened = openBrowserPrintPreview({
      title: `كشف الحساب الشهري - ${periodLabel}`,
      reportDateLabel,
      tableHtml,
      defaultOrientation: "landscape",
      defaultPageSize: "A4",
      defaultMarginMm: 3,
      contentCss: `
        table { width:100% !important; border-collapse:collapse !important; table-layout:auto !important; background:#fff; color:#000 !important; }
        th,td { border:1px solid #000 !important; padding:4px 5px !important; text-align:center !important; vertical-align:middle !important; color:#000 !important; font-family:Cairo,Arial,sans-serif !important; font-weight:800 !important; white-space:normal !important; }
        th { background:#dbeafe !important; font-weight:900 !important; color:#000 !important; }
        tbody tr:nth-child(even) td { background:#f8fafc !important; color:#000 !important; }
        tbody tr td:first-child { text-align:right !important; font-weight:900 !important; color:#000 !important; }
        tfoot td { background:#1e3a8a !important; color:#fff !important; font-weight:900 !important; }
      `,
    });
    if (!opened) toast.error("تم منع فتح نافذة الطباعة، يرجى السماح بالنوافذ المنبثقة");
  };

  return (
    <div
      className="w-full space-y-6 p-2 sm:p-5 min-h-screen bg-gradient-to-br from-slate-50 via-sky-50/50 to-indigo-50/40 text-slate-800"
      dir="rtl"
    >
      {/* ══ الترويسة الرئيسية والبطاقات بتصميم فاتح ناصع ══ */}
      <div className="rounded-3xl border border-sky-200/70 bg-white/90 p-4 sm:p-6 shadow-xl shadow-sky-100/60 backdrop-blur-md">
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-100 pb-4">
          <div className="flex items-center gap-3.5">
            <div className="grid h-12 w-12 sm:h-14 sm:w-14 place-items-center rounded-2xl bg-gradient-to-br from-sky-500 to-blue-600 text-white shadow-lg shadow-sky-500/25">
              <FileSpreadsheet className="h-6 w-6 sm:h-7 sm:w-7" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-lg sm:text-xl font-black bg-gradient-to-r from-sky-700 via-blue-800 to-indigo-800 bg-clip-text text-transparent">
                  كشف الحساب الشهري
                </h1>
                <span className="hidden sm:inline-flex items-center gap-1 rounded-full bg-sky-50 px-2.5 py-0.5 text-[11px] font-bold text-sky-700 border border-sky-200">
                  <Sparkles className="h-3 w-3 text-sky-500" /> ترحيل فوري
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                ترحيل ذكي لكافة القيود اليومية حسب الأبواب والحسابات تلقائياً
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <ImportButton kind="monthly" />
            <button
              type="button"
              onClick={handlePrint}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-gradient-to-r from-sky-100 to-indigo-100 text-indigo-700 border border-indigo-200 font-bold text-xs rounded-xl shadow-sm hover:shadow-md active:scale-95 transition-all"
              title="طباعة كشف الحساب الشهري"
            >
              <Printer className="h-4 w-4" /> طباعة
            </button>
            <button
              type="button"
              onClick={() => void exportMonthlyStatement(journal, year, reportDate)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-gradient-to-r from-emerald-50 to-teal-100 text-emerald-700 border border-emerald-200 font-bold text-xs rounded-xl shadow-sm hover:shadow-md active:scale-95 transition-all"
              title="تصدير إلى Excel"
            >
              <FileSpreadsheet className="h-4 w-4" /> Excel
            </button>
          </div>
        </div>

        {/* ══ مؤشرات الحالة اللحظية (KPI Cards الفاتحة الناعمة) ══ */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mt-4">
          {/* قيود مرحلة */}
          <div className="relative overflow-hidden rounded-2xl border border-emerald-200 bg-gradient-to-br from-emerald-50 via-teal-50/40 to-white p-3.5 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between text-xs text-emerald-800 mb-1.5 font-bold">
              <span>قيود مرحّلة</span>
              <div className="p-1.5 rounded-xl bg-emerald-500/15 text-emerald-600">
                <CheckCircle2 className="h-4 w-4" />
              </div>
            </div>
            <div className="text-xl sm:text-2xl font-black text-emerald-800 tracking-tight font-mono">
              {matchedEntriesCount}
            </div>
            <span className="text-[10px] text-emerald-600 font-medium mt-1 block">حسابات بها حركة في الفترة</span>
          </div>

          {/* مدين الفترة */}
          <div className="relative overflow-hidden rounded-2xl border border-sky-200 bg-gradient-to-br from-sky-50 via-blue-50/40 to-white p-3.5 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between text-xs text-sky-800 mb-1.5 font-bold">
              <span>مدين الفترة</span>
              <div className="p-1.5 rounded-xl bg-sky-500/15 text-sky-600">
                <ArrowDownLeft className="h-4 w-4" />
              </div>
            </div>
            <div className="text-xl sm:text-2xl font-black text-sky-800 tracking-tight font-mono">
              {totals.curDebit.toLocaleString()}
            </div>
            <span className="text-[10px] text-sky-600 font-medium mt-1 block">إجمالي حركة الجانب المدين</span>
          </div>

          {/* دائن الفترة */}
          <div className="relative overflow-hidden rounded-2xl border border-amber-200 bg-gradient-to-br from-amber-50 via-orange-50/40 to-white p-3.5 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between text-xs text-amber-800 mb-1.5 font-bold">
              <span>دائن الفترة</span>
              <div className="p-1.5 rounded-xl bg-amber-500/15 text-amber-600">
                <ArrowUpRight className="h-4 w-4" />
              </div>
            </div>
            <div className="text-xl sm:text-2xl font-black text-amber-800 tracking-tight font-mono">
              {totals.curCredit.toLocaleString()}
            </div>
            <span className="text-[10px] text-amber-600 font-medium mt-1 block">إجمالي حركة الجانب الدائن</span>
          </div>

          {/* صافي الحركة */}
          <div className="relative overflow-hidden rounded-2xl border border-indigo-200 bg-gradient-to-br from-indigo-50 via-purple-50/40 to-white p-3.5 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between text-xs text-indigo-800 mb-1.5 font-bold">
              <span>صافي حركة الفترة</span>
              <div className="p-1.5 rounded-xl bg-indigo-500/15 text-indigo-600">
                <Scale className="h-4 w-4" />
              </div>
            </div>
            <div
              className={`text-xl sm:text-2xl font-black tracking-tight font-mono ${
                netBalance >= 0 ? "text-indigo-800" : "text-rose-700"
              }`}
            >
              {netBalance.toLocaleString()}
            </div>
            <span className="text-[10px] text-indigo-600 font-medium mt-1 block">
              {netBalance >= 0 ? "رصيد مدين للفترة" : "رصيد دائن للفترة"}
            </span>
          </div>
        </div>

        {/* ══ أشرطة اختيار الأشهر النشطة بأزرار زاهية ══ */}
        {activeMonths.length > 0 && (
          <div className="mt-4 p-3 bg-gradient-to-r from-sky-50/80 via-blue-50/50 to-indigo-50/80 rounded-2xl border border-sky-100 flex flex-wrap items-center gap-2">
            <div className="flex items-center gap-1.5 text-xs font-bold text-sky-800 ml-2">
              <TrendingUp className="h-4 w-4 text-sky-600" />
              <span>أشهر بها حركات مسجلة:</span>
            </div>
            {activeMonths.map((m) => {
              const isSelected = mode === "month" && month === m;
              return (
                <button
                  key={m}
                  onClick={() => {
                    setMode("month");
                    setMonth(m);
                  }}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all shadow-sm ${
                    isSelected
                      ? "bg-gradient-to-r from-sky-500 to-blue-600 text-white shadow-sky-500/30 shadow-md scale-105"
                      : "bg-white text-slate-700 hover:bg-sky-50 hover:text-sky-700 border border-slate-200"
                  }`}
                >
                  {MONTHS_NAMES[m - 1]}
                </button>
              );
            })}
          </div>
        )}

        {/* ══ محددات الفترة والتقويم بتنسيق أبيض أنيق ══ */}
        <div className="mt-4 flex flex-wrap items-center gap-2.5 text-xs">
          {/* محدد السنة */}
          <div className="flex items-center gap-2 bg-white px-3 py-2 rounded-xl border border-slate-200 shadow-sm hover:border-sky-300 transition-colors">
            <Calendar className="h-4 w-4 text-sky-600" />
            <select
              value={year}
              onChange={(e) => setYear(Number(e.target.value))}
              className="bg-transparent font-bold text-slate-800 outline-none cursor-pointer text-xs"
            >
              {getAvailableYears([year]).map((y) => (
                <option key={y} value={y} className="bg-white text-slate-800">
                  عام {y}م
                </option>
              ))}
            </select>
          </div>

          {/* محدد نوع الفترة */}
          <div className="flex items-center gap-2 bg-white px-3 py-2 rounded-xl border border-slate-200 shadow-sm hover:border-sky-300 transition-colors">
            <Layers className="h-4 w-4 text-indigo-600" />
            <select
              value={mode}
              onChange={(e) => setMode(e.target.value as ReportPeriodMode)}
              className="bg-transparent font-bold text-slate-800 outline-none cursor-pointer text-xs"
            >
              <option value="month">شهري</option>
              <option value="quarter">ربع سنوي</option>
              <option value="halfYear">نصف سنوي</option>
              <option value="year">سنوي كامل</option>
            </select>
          </div>

          {/* محدد الشهر إذا كان النمط شهري */}
          {mode === "month" && (
            <div className="flex items-center gap-2 bg-white px-3 py-2 rounded-xl border border-slate-200 shadow-sm hover:border-sky-300 transition-colors">
              <select
                value={month}
                onChange={(e) => setMonth(Number(e.target.value))}
                className="bg-transparent font-bold text-slate-800 outline-none cursor-pointer text-xs"
              >
                {MONTHS_NAMES.map((m, idx) => (
                  <option key={idx + 1} value={idx + 1}>
                    شهر {m}
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* محدد الربع إذا كان النمط ربع سنوي */}
          {mode === "quarter" && (
            <div className="flex items-center gap-2 bg-white px-3 py-2 rounded-xl border border-slate-200 shadow-sm hover:border-sky-300 transition-colors">
              <select
                value={quarter}
                onChange={(e) => setQuarter(Number(e.target.value))}
                className="bg-transparent font-bold text-slate-800 outline-none cursor-pointer text-xs"
              >
                <option value={1}>الربع الأول (يناير - مارس)</option>
                <option value={2}>الربع الثاني (أبريل - يونيو)</option>
                <option value={3}>الربع الثالث (يوليو - سبتمبر)</option>
                <option value={4}>الربع الرابع (أكتوبر - ديسمبر)</option>
              </select>
            </div>
          )}

          {/* محدد النصف إذا كان النمط نصف سنوي */}
          {mode === "halfYear" && (
            <div className="flex items-center gap-2 bg-white px-3 py-2 rounded-xl border border-slate-200 shadow-sm hover:border-sky-300 transition-colors">
              <select
                value={halfYear}
                onChange={(e) => setHalfYear(Number(e.target.value))}
                className="bg-transparent font-bold text-slate-800 outline-none cursor-pointer text-xs"
              >
                <option value={1}>النصف الأول (يناير - يونيو)</option>
                <option value={2}>النصف الثاني (يوليو - ديسمبر)</option>
              </select>
            </div>
          )}

          <div className="mr-auto flex items-center gap-2 text-slate-600 font-medium">
            <span>الفترة المعروضة:</span>
            <span className="font-bold text-sky-800 bg-sky-100/80 px-3 py-1 rounded-xl border border-sky-200">
              {periodLabel}
            </span>
          </div>
        </div>
      </div>

      {/* ══ جدول كشف الحساب الشهري ══ */}
      <div className="overflow-x-auto rounded-3xl border border-slate-200 bg-white shadow-xl shadow-slate-200/50">
        <table ref={tableRef} className="w-full text-center text-xs border-collapse">
          <thead>
            <tr className="bg-gradient-to-r from-slate-100 via-sky-100/70 to-indigo-100/70 text-slate-800 border-b border-slate-200">
              <th rowSpan={2} className="p-3 border-l border-slate-200 min-w-[200px] text-right pr-4 font-black text-sky-900 text-sm">
                بيان أنواع الحسابات
              </th>
              <th colSpan={2} className="p-2 border-l border-slate-200 bg-slate-200/50 font-bold text-slate-700">
                الأشهر السابقة
              </th>
              <th colSpan={2} className="p-2 border-l border-slate-200 bg-sky-100/70 font-bold text-sky-900">
                حركة {movementLabel}
              </th>
              <th colSpan={2} className="p-2 border-l border-slate-200 bg-indigo-100/70 font-bold text-indigo-900">
                الجملة (سابق + حالي)
              </th>
              <th colSpan={2} className="p-2 bg-emerald-100/70 font-bold text-emerald-900">
                الرصيد في نهاية الفترة
              </th>
            </tr>
            <tr className="bg-slate-50 text-[11px] font-bold text-slate-700 border-b border-slate-200">
              {/* سابق */}
              <th className="p-2 border-l border-slate-200 text-sky-700 bg-slate-100/40">مدين</th>
              <th className="p-2 border-l border-slate-200 text-amber-700 bg-slate-100/40">دائن</th>
              {/* حالي */}
              <th className="p-2 border-l border-slate-200 text-sky-800 bg-sky-50">مدين</th>
              <th className="p-2 border-l border-slate-200 text-amber-800 bg-sky-50">دائن</th>
              {/* جملة */}
              <th className="p-2 border-l border-slate-200 text-indigo-800 bg-indigo-50/50">مدين</th>
              <th className="p-2 border-l border-slate-200 text-indigo-800 bg-indigo-50/50">دائن</th>
              {/* رصيد */}
              <th className="p-2 border-l border-slate-200 text-emerald-800 bg-emerald-50/50">مدين</th>
              <th className="p-2 text-emerald-800 bg-emerald-50/50">دائن</th>
            </tr>
          </thead>

          <tbody className="divide-y divide-slate-100 font-bold">
            {GROUPS.map((group, gIdx) => {
              let gPrevD = 0, gPrevC = 0, gCurD = 0, gCurC = 0, gBalD = 0, gBalC = 0;
              return (
                <React.Fragment key={gIdx}>
                  {/* عنوان المجموعة الرئيسي */}
                  <tr className="bg-gradient-to-r from-sky-50/80 via-slate-50 to-indigo-50/60 font-black text-slate-800 border-y border-slate-200">
                    <td colSpan={9} className="px-4 py-2.5 text-center">
                      <div className="flex items-center gap-2">
                        <span className="h-2.5 w-2.5 rounded-full bg-sky-500 shadow-sm shadow-sky-300"></span>
                        <span className="text-xl sm:text-xs font-bold text-sky-950 tracking-wide">{group.title}</span>
                      </div>
                    </td>
                  </tr>

                  {/* سطور الحسابات التفصيلية */}
                  {group.accounts.map((acc, aIdx) => {
                    const rowData = data[normName(acc)] || {
                      prevDebit: 0,
                      prevCredit: 0,
                      curDebit: 0,
                      curCredit: 0,
                    };
                    const totD = rowData.prevDebit + rowData.curDebit;
                    const totC = rowData.prevCredit + rowData.curCredit;
                    const balD = Math.max(0, totD - totC);
                    const balC = Math.max(0, totC - totD);

                    gPrevD += rowData.prevDebit;
                    gPrevC += rowData.prevCredit;
                    gCurD += rowData.curDebit;
                    gCurC += rowData.curCredit;
                    gBalD += balD;
                    gBalC += balC;

                    const isHighlight = acc === "الاستخدامات" || acc === "الموارد";

                    return (
                      <tr
                        key={aIdx}
                        className={`transition-colors duration-150 ${
                          isHighlight
                            ? "bg-amber-50/80 font-bold border-y border-amber-200/80 text-amber-950"
                            : "hover:bg-sky-50/40 text-slate-700"
                        }`}
                      >
                        <td className="px-3 py-2 text-center pr-5 border-l border-black whitespace-normal">
                          {isHighlight ? (
                            <span className="inline-flex items-center gap-1.5 font-black text-amber-900">
                              <span className="h-2 w-2 rounded-full bg-amber-500"></span>
                              {acc}
                            </span>
                          ) : (
                            acc
                          )}
                        </td>
                        {/* سابق */}
                        <td className="px-2 py-1.5 border-l border-slate-100 font-mono text-slate-600">
                          {rowData.prevDebit ? rowData.prevDebit.toLocaleString() : "-"}
                        </td>
                        <td className="px-2 py-1.5 border-l border-slate-100 font-mono text-slate-600">
                          {rowData.prevCredit ? rowData.prevCredit.toLocaleString() : "-"}
                        </td>
                        {/* حالي */}
                        <td className="px-2 py-1.5 border-l border-slate-100 font-mono text-sky-800 font-bold bg-sky-50/50">
                          {rowData.curDebit ? rowData.curDebit.toLocaleString() : "-"}
                        </td>
                        <td className="px-2 py-1.5 border-l border-slate-100 font-mono text-amber-800 font-bold bg-amber-50/50">
                          {rowData.curCredit ? rowData.curCredit.toLocaleString() : "-"}
                        </td>
                        {/* جملة */}
                        <td className="px-2 py-1.5 border-l border-slate-100 font-extrabold text-black bg-indigo-90/30">
                          {totD ? totD.toLocaleString() : "-"}
                        </td>
                        <td className="px-2 py-1.5 border-l border-slate-100 font-mono text-slate-800 bg-indigo-50/30">
                          {totC ? totC.toLocaleString() : "-"}
                        </td>
                        {/* رصيد */}
                        <td className="px-2 py-1.5 border-l border-slate-100 font-mono text-emerald-700 font-bold bg-emerald-50/40">
                          {balD ? balD.toLocaleString() : "-"}
                        </td>
                        <td className="px-2 py-1.5 font-mono text-emerald-700 font-bold bg-emerald-50/40">
                          {balC ? balC.toLocaleString() : "-"}
                        </td>
                      </tr>
                    );
                  })}

                  {/* جملة المجموعة (تجميع الأرصدة بدون مقاصة تصفيرية) */}
                  <tr className="bg-slate-100/90 font-bold text-slate-800 border-b border-slate-200 text-xl">
                    <td className="px-3 py-2 text-center pr-4 border-l border-black text-black">
                      جملة {group.title}
                    </td>
                    <td className="px-2 py-2 border-l border-slate-200 font-mono text-slate-700">
                      {gPrevD ? gPrevD.toLocaleString() : "-"}
                    </td>
                    <td className="px-2 py-2 border-l border-slate-200 font-mono text-slate-700">
                      {gPrevC ? gPrevC.toLocaleString() : "-"}
                    </td>
                    <td className="px-2 py-2 border-l border-slate-200 font-mono text-sky-800 font-black">
                      {gCurD ? gCurD.toLocaleString() : "-"}
                    </td>
                    <td className="px-2 py-2 border-l border-slate-200 font-mono text-amber-800 font-black">
                      {gCurC ? gCurC.toLocaleString() : "-"}
                    </td>
                    <td className="px-2 py-2 border-l border-slate-200 font-mono text-indigo-800">
                      {(gPrevD + gCurD) ? (gPrevD + gCurD).toLocaleString() : "-"}
                    </td>
                    <td className="px-2 py-2 border-l border-slate-200 font-mono text-indigo-800">
                      {(gPrevC + gCurC) ? (gPrevC + gCurC).toLocaleString() : "-"}
                    </td>
                    <td className="px-2 py-2 border-l border-slate-200 font-mono text-emerald-800 font-bold">
                      {gBalD ? gBalD.toLocaleString() : "-"}
                    </td>
                    <td className="px-2 py-2 font-mono text-emerald-800 font-bold">
                      {gBalC ? gBalC.toLocaleString() : "-"}
                    </td>
                  </tr>
                </React.Fragment>
              );
            })}
          </tbody>

          {/* الإجمالي العام لكافة الحسابات (مجموع الأرصدة المتوازنة) */}
          <tfoot>
            <tr className="bg-gradient-to-r from-sky-900 via-blue-900 to-indigo-800 font-black text-white text-xs sm:text-sm border-t-2 border-sky-500 shadow-md">
              <td className="px-3 py-3.5 text-right pr-4 border-l border-white/10">
                الإجمالي العام لكافة الحسابات
              </td>
              <td className="px-2 py-3.5 border-l border-white/10 font-mono text-sky-100">
                {totals.prevDebit.toLocaleString()}
              </td>
              <td className="px-2 py-3.5 border-l border-white/10 font-mono text-sky-100">
                {totals.prevCredit.toLocaleString()}
              </td>
              <td className="px-2 py-3.5 border-l border-white/10 font-mono text-yellow-300 font-black text-sm">
                {totals.curDebit.toLocaleString()}
              </td>
              <td className="px-2 py-3.5 border-l border-white/10 font-mono text-amber-200 font-black text-sm">
                {totals.curCredit.toLocaleString()}
              </td>
              <td className="px-2 py-3.5 border-l border-white/10 font-mono text-white font-black">
                {(totals.prevDebit + totals.curDebit).toLocaleString()}
              </td>
              <td className="px-2 py-3.5 border-l border-white/10 font-mono text-white font-black">
                {(totals.prevCredit + totals.curCredit).toLocaleString()}
              </td>
              <td className="px-2 py-3.5 border-l border-white/10 font-mono text-emerald-300 font-black">
                {totals.balDebit.toLocaleString()}
              </td>
              <td className="px-2 py-3.5 font-mono text-emerald-300 font-black">
                {totals.balCredit.toLocaleString()}
              </td>
            </tr>
          </tfoot>
        </table>
      </div>
    </div>
  );
}
