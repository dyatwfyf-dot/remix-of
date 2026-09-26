import React, { useMemo, useRef, useState } from "react";
import { useStore } from "@/lib/store";
import { useReportDate } from "@/lib/reportDate";
import { exportMonthlyStatement } from "@/lib/exportImport";
import monthlySchema from "@/data/monthlyStatement.json";
import TabActions from "./TabActions";
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
    .replace(/[()[\]./\\،,:\-_+]/g, " ")
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
  [cleanArabic("أمانات الكفالات")]: "حساب أمانات الكفالات",
  [cleanArabic("امانات الكفالات")]: "حساب أمانات الكفالات",
  [cleanArabic("دائنون التزامات قائمة")]: "حساب دائنون التزامات قائمة",
};

// ── دالة مطابقة الحساب الذكية والمتسامحة ─────────────────────────────────────
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
  const { journal, clearJournal } = useStore();
  const { reportDate } = useReportDate();
  const tableRef = useRef<HTMLTableElement>(null);

  const [year, setYear] = useState(new Date().getFullYear());
  const [mode, setMode] = useState<ReportPeriodMode>("month");
  const [month, setMonth] = useState(new Date().getMonth() + 1);
  const [quarter, setQuarter] = useState(Math.floor(new Date().getMonth() / 3) + 1);
  const [halfYear, setHalfYear] = useState(new Date().getMonth() < 6 ? 1 : 2);

  const { startMonth, endMonth } = getPeriodRange({ mode, year, month, quarter, halfYear });

  // ── الترحيل الآلي الفوري لمبالغ القيود اليومية شهراً بشهر وحساباً بحساب ──
  const { data, matchedEntriesCount, activeMonths } = useMemo(() => {
    const map: Record<
      string,
      { prevDebit: number; prevCredit: number; curDebit: number; curCredit: number }
    > = {};
    ALL_ACCOUNTS.forEach((a) => {
      map[cleanArabic(a)] = { prevDebit: 0, prevCredit: 0, curDebit: 0, curCredit: 0 };
    });

    let matched = 0;
    const monthsSet = new Set<number>();

    journal.forEach((j) => {
      const parsedDate = parseJournalDate(j.date);
      if (!parsedDate || parsedDate.year !== year) return;

      const m = parsedDate.month;
      monthsSet.add(m);

      const isCurrent = m >= startMonth && m <= endMonth;
      const isPrev = m < startMonth;
      if (!isCurrent && !isPrev) return;

      const debitAmt = Number(j.debit) || 0;
      const creditAmt = Number(j.credit) || 0;

      const debitAccountRaw = j.debitAccount || (debitAmt > 0 ? j.account : "") || "";
      const creditAccountRaw = j.creditAccount || (creditAmt > 0 ? j.account : "") || "";

      const dMatch = matchAccount(debitAccountRaw);
      const cMatch = matchAccount(creditAccountRaw);
      const dKey = dMatch ? cleanArabic(dMatch) : "";
      const cKey = cMatch ? cleanArabic(cMatch) : "";

      let hasMatchedLeg = false;

      // ترحيل المبلغ المدين
      if (dKey && map[dKey] && debitAmt > 0) {
        if (isCurrent) map[dKey].curDebit += debitAmt;
        else map[dKey].prevDebit += debitAmt;
        hasMatchedLeg = true;
      }

      // ترحيل المبلغ الدائن
      if (cKey && map[cKey] && creditAmt > 0) {
        if (isCurrent) map[cKey].curCredit += creditAmt;
        else map[cKey].prevCredit += creditAmt;
        hasMatchedLeg = true;
      }

      if (hasMatchedLeg) matched++;
    });

    return {
      data: map,
      matchedEntriesCount: matched,
      activeMonths: Array.from(monthsSet).sort((a, b) => a - b),
    };
  }, [journal, year, startMonth, endMonth]);

  const totals = useMemo(() => {
    return Object.values(data).reduce(
      (a, r) => ({
        prevDebit: a.prevDebit + r.prevDebit,
        prevCredit: a.prevCredit + r.prevCredit,
        curDebit: a.curDebit + r.curDebit,
        curCredit: a.curCredit + r.curCredit,
      }),
      { prevDebit: 0, prevCredit: 0, curDebit: 0, curCredit: 0 }
    );
  }, [data]);

  const movementLabel = getReportMovementLabel({ mode, month, quarter, halfYear });
  const periodLabel = getReportPeriodLabel({ mode, year, month, quarter, halfYear });

  const netBalance = totals.curDebit - totals.curCredit;

  return (
    <div
      className="w-full space-y-6 p-2 sm:p-5 min-h-screen bg-gradient-to-br from-slate-950 via-[#0B132B] to-[#1C2541] text-slate-100"
      dir="rtl"
    >
      {/* ══ الترويسة الرئيسية والبطاقات الزجاجية ══ */}
      <div className="rounded-2xl border border-cyan-500/20 bg-slate-900/70 p-4 sm:p-6 shadow-2xl backdrop-blur-xl transition-all">
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-white/10 pb-4">
          <div className="flex items-center gap-3.5">
            <div className="grid h-12 w-12 sm:h-14 sm:w-14 place-items-center rounded-2xl bg-gradient-to-br from-cyan-500/20 to-blue-600/20 text-cyan-400 border border-cyan-400/30 shadow-lg shadow-cyan-950/50">
              <FileSpreadsheet className="h-6 w-6 sm:h-7 sm:w-7" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-lg sm:text-xl font-black bg-gradient-to-r from-cyan-300 via-sky-200 to-indigo-300 bg-clip-text text-transparent">
                  كشف الحساب الشهري التلقائي
                </h1>
                <span className="hidden sm:inline-flex items-center gap-1 rounded-full bg-cyan-500/10 px-2.5 py-0.5 text-[11px] font-bold text-cyan-300 border border-cyan-500/30">
                  <Sparkles className="h-3 w-3" /> ترحيل ذكي
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                ربط تلقائي بالقيود اليومية المحفوظة والمستوردة مع توحيد مرن للحسابات
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <ImportButton kind="monthly" />
            <TabActions
              tableRef={tableRef}
              title={`كشف_الحساب_الشهري_${periodLabel}`}
              onExportExcel={() => exportMonthlyStatement(tableRef)}
            />
          </div>
        </div>

        {/* ══ مؤشرات الحالة اللحظية (KPI Cards) ══ */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mt-4">
          {/* قيود مرحلة */}
          <div className="relative overflow-hidden rounded-xl border border-emerald-500/30 bg-gradient-to-br from-emerald-950/40 via-slate-900/50 to-slate-900/80 p-3 shadow-lg">
            <div className="flex items-center justify-between text-xs text-emerald-300 mb-1.5 font-bold">
              <span>قيود مرحّلة</span>
              <div className="p-1 rounded-lg bg-emerald-500/20 text-emerald-400">
                <CheckCircle2 className="h-4 w-4" />
              </div>
            </div>
            <div className="text-xl sm:text-2xl font-black text-emerald-300 tracking-tight font-mono">
              {matchedEntriesCount}
            </div>
            <span className="text-[10px] text-emerald-400/80 mt-1 block">قيد متطابق من دفتر اليومية</span>
          </div>

          {/* مدين الفترة */}
          <div className="relative overflow-hidden rounded-xl border border-cyan-500/30 bg-gradient-to-br from-cyan-950/40 via-slate-900/50 to-slate-900/80 p-3 shadow-lg">
            <div className="flex items-center justify-between text-xs text-cyan-300 mb-1.5 font-bold">
              <span>مدين الفترة</span>
              <div className="p-1 rounded-lg bg-cyan-500/20 text-cyan-400">
                <ArrowDownLeft className="h-4 w-4" />
              </div>
            </div>
            <div className="text-xl sm:text-2xl font-black text-cyan-300 tracking-tight font-mono">
              {totals.curDebit.toLocaleString()}
            </div>
            <span className="text-[10px] text-cyan-400/80 mt-1 block">إجمالي حركة الجانب المدين</span>
          </div>

          {/* دائن الفترة */}
          <div className="relative overflow-hidden rounded-xl border border-amber-500/30 bg-gradient-to-br from-amber-950/40 via-slate-900/50 to-slate-900/80 p-3 shadow-lg">
            <div className="flex items-center justify-between text-xs text-amber-300 mb-1.5 font-bold">
              <span>دائن الفترة</span>
              <div className="p-1 rounded-lg bg-amber-500/20 text-amber-400">
                <ArrowUpRight className="h-4 w-4" />
              </div>
            </div>
            <div className="text-xl sm:text-2xl font-black text-amber-300 tracking-tight font-mono">
              {totals.curCredit.toLocaleString()}
            </div>
            <span className="text-[10px] text-amber-400/80 mt-1 block">إجمالي حركة الجانب الدائن</span>
          </div>

          {/* صافي الحركة */}
          <div className="relative overflow-hidden rounded-xl border border-indigo-500/30 bg-gradient-to-br from-indigo-950/40 via-slate-900/50 to-slate-900/80 p-3 shadow-lg">
            <div className="flex items-center justify-between text-xs text-indigo-300 mb-1.5 font-bold">
              <span>صافي حركة الفترة</span>
              <div className="p-1 rounded-lg bg-indigo-500/20 text-indigo-400">
                <Scale className="h-4 w-4" />
              </div>
            </div>
            <div
              className={`text-xl sm:text-2xl font-black tracking-tight font-mono ${
                netBalance >= 0 ? "text-indigo-300" : "text-rose-400"
              }`}
            >
              {netBalance.toLocaleString()}
            </div>
            <span className="text-[10px] text-indigo-400/80 mt-1 block">
              {netBalance >= 0 ? "رصيد مدين للفترة" : "رصيد دائن للفترة"}
            </span>
          </div>
        </div>

        {/* ══ أشرطة اختيار الأشهر النشطة ══ */}
        {activeMonths.length > 0 && (
          <div className="mt-4 p-2.5 bg-slate-950/60 rounded-xl border border-cyan-500/10 flex flex-wrap items-center gap-2">
            <div className="flex items-center gap-1.5 text-xs font-bold text-cyan-300 ml-2">
              <TrendingUp className="h-3.5 w-3.5 text-cyan-400" />
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
                  className={`px-3 py-1 rounded-lg text-xs font-bold transition-all shadow-sm ${
                    isSelected
                      ? "bg-gradient-to-r from-cyan-500 to-blue-600 text-white shadow-cyan-500/30 shadow-md scale-105"
                      : "bg-slate-800/80 text-slate-300 hover:bg-slate-700/80 hover:text-white border border-white/5"
                  }`}
                >
                  {MONTHS_NAMES[m - 1]}
                </button>
              );
            })}
          </div>
        )}

        {/* ══ محددات الفترة والتقويم ══ */}
        <div className="mt-4 flex flex-wrap items-center gap-2.5 text-xs">
          {/* محدد السنة */}
          <div className="flex items-center gap-2 bg-slate-800/80 px-3 py-1.5 rounded-xl border border-white/10 hover:border-cyan-500/30 transition-colors shadow-inner">
            <Calendar className="h-4 w-4 text-cyan-400" />
            <select
              value={year}
              onChange={(e) => setYear(Number(e.target.value))}
              className="bg-transparent font-bold text-white outline-none cursor-pointer text-xs"
            >
              {[2024, 2025, 2026, 2027].map((y) => (
                <option key={y} value={y} className="bg-slate-900 text-white">
                  عام {y}م
                </option>
              ))}
            </select>
          </div>

          {/* محدد نوع الفترة */}
          <div className="flex items-center gap-2 bg-slate-800/80 px-3 py-1.5 rounded-xl border border-white/10 hover:border-cyan-500/30 transition-colors shadow-inner">
            <Layers className="h-4 w-4 text-indigo-400" />
            <select
              value={mode}
              onChange={(e) => setMode(e.target.value as ReportPeriodMode)}
              className="bg-transparent font-bold text-white outline-none cursor-pointer text-xs"
            >
              <option value="month" className="bg-slate-900 text-white">شهري</option>
              <option value="quarter" className="bg-slate-900 text-white">ربع سنوي</option>
              <option value="halfYear" className="bg-slate-900 text-white">نصف سنوي</option>
              <option value="year" className="bg-slate-900 text-white">سنوي كامل</option>
            </select>
          </div>

          {/* محدد الشهر إذا كان النمط شهري */}
          {mode === "month" && (
            <div className="flex items-center gap-2 bg-slate-800/80 px-3 py-1.5 rounded-xl border border-white/10 hover:border-cyan-500/30 transition-colors shadow-inner">
              <select
                value={month}
                onChange={(e) => setMonth(Number(e.target.value))}
                className="bg-transparent font-bold text-white outline-none cursor-pointer text-xs"
              >
                {MONTHS_NAMES.map((m, idx) => (
                  <option key={idx + 1} value={idx + 1} className="bg-slate-900 text-white">
                    شهر {m}
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* محدد الربع إذا كان النمط ربع سنوي */}
          {mode === "quarter" && (
            <div className="flex items-center gap-2 bg-slate-800/80 px-3 py-1.5 rounded-xl border border-white/10 hover:border-cyan-500/30 transition-colors shadow-inner">
              <select
                value={quarter}
                onChange={(e) => setQuarter(Number(e.target.value))}
                className="bg-transparent font-bold text-white outline-none cursor-pointer text-xs"
              >
                <option value={1} className="bg-slate-900 text-white">الربع الأول (يناير - مارس)</option>
                <option value={2} className="bg-slate-900 text-white">الربع الثاني (أبريل - يونيو)</option>
                <option value={3} className="bg-slate-900 text-white">الربع الثالث (يوليو - سبتمبر)</option>
                <option value={4} className="bg-slate-900 text-white">الربع الرابع (أكتوبر - ديسمبر)</option>
              </select>
            </div>
          )}

          {/* محدد النصف إذا كان النمط نصف سنوي */}
          {mode === "halfYear" && (
            <div className="flex items-center gap-2 bg-slate-800/80 px-3 py-1.5 rounded-xl border border-white/10 hover:border-cyan-500/30 transition-colors shadow-inner">
              <select
                value={halfYear}
                onChange={(e) => setHalfYear(Number(e.target.value))}
                className="bg-transparent font-bold text-white outline-none cursor-pointer text-xs"
              >
                <option value={1} className="bg-slate-900 text-white">النصف الأول (يناير - يونيو)</option>
                <option value={2} className="bg-slate-900 text-white">النصف الثاني (يوليو - ديسمبر)</option>
              </select>
            </div>
          )}

          <div className="mr-auto flex items-center gap-1.5 text-slate-300 font-medium">
            <span>الفترة المعروضة:</span>
            <span className="font-bold text-cyan-300 bg-cyan-950/50 px-2.5 py-0.5 rounded-md border border-cyan-500/20">
              {periodLabel}
            </span>
          </div>
        </div>
      </div>

      {/* ══ جدول كشف الحساب الشهري بتصميم أنيق وعصري ══ */}
      <div className="overflow-x-auto rounded-2xl border border-cyan-500/20 bg-slate-900/60 shadow-2xl backdrop-blur-xl">
        <table ref={tableRef} className="w-full text-center text-xs border-collapse">
          {/* ترويسة الجدول الرئيسية */}
          <thead>
            <tr className="bg-gradient-to-r from-slate-950 via-[#0e1e38] to-slate-950 text-slate-200 border-b border-cyan-500/30">
              <th rowSpan={2} className="p-3 border-l border-white/10 min-w-[200px] text-right pr-4 font-black text-cyan-300 text-sm">
                بيان أنواع الحسابات
              </th>
              <th colSpan={2} className="p-2 border-l border-white/10 bg-slate-900/80 font-bold text-slate-300">
                الأشهر السابقة
              </th>
              <th colSpan={2} className="p-2 border-l border-white/10 bg-cyan-950/40 font-bold text-cyan-300">
                حركة {movementLabel}
              </th>
              <th colSpan={2} className="p-2 border-l border-white/10 bg-indigo-950/40 font-bold text-indigo-300">
                الجملة (سابق + حالي)
              </th>
              <th colSpan={2} className="p-2 bg-emerald-950/40 font-bold text-emerald-300">
                الرصيد في نهاية الفترة
              </th>
            </tr>
            <tr className="bg-slate-950/90 text-[11px] font-bold text-slate-300 border-b border-cyan-500/20">
              {/* سابق */}
              <th className="p-2 border-l border-white/10 text-cyan-400 bg-slate-900/60">مدين</th>
              <th className="p-2 border-l border-white/10 text-amber-400 bg-slate-900/60">دائن</th>
              {/* حالي */}
              <th className="p-2 border-l border-white/10 text-cyan-300 bg-cyan-950/30">مدين</th>
              <th className="p-2 border-l border-white/10 text-amber-300 bg-cyan-950/30">دائن</th>
              {/* جملة */}
              <th className="p-2 border-l border-white/10 text-cyan-400 bg-indigo-950/30">مدين</th>
              <th className="p-2 border-l border-white/10 text-amber-400 bg-indigo-950/30">دائن</th>
              {/* رصيد */}
              <th className="p-2 border-l border-white/10 text-emerald-300 bg-emerald-950/30">مدين</th>
              <th className="p-2 text-emerald-300 bg-emerald-950/30">دائن</th>
            </tr>
          </thead>

          {/* محتوى الحسابات والمجموعات */}
          <tbody className="divide-y divide-white/5 font-medium">
            {GROUPS.map((group, gIdx) => {
              let gPrevD = 0, gPrevC = 0, gCurD = 0, gCurC = 0;
              return (
                <React.Fragment key={gIdx}>
                  {/* عنوان المجموعة الرئيسي */}
                  <tr className="bg-gradient-to-r from-slate-900 via-indigo-950/40 to-slate-900 font-black text-cyan-300 border-y border-cyan-500/20">
                    <td colSpan={9} className="px-4 py-2 text-right">
                      <div className="flex items-center gap-2">
                        <span className="h-2 w-2 rounded-full bg-cyan-400 shadow-sm shadow-cyan-400"></span>
                        <span className="text-xs sm:text-sm font-bold tracking-wide">{group.title}</span>
                      </div>
                    </td>
                  </tr>

                  {/* سطور الحسابات التفصيلية */}
                  {group.accounts.map((acc, aIdx) => {
                    const rowData = data[cleanArabic(acc)] || {
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

                    const isHighlight = acc === "الاستخدامات" || acc === "الموارد";

                    return (
                      <tr
                        key={aIdx}
                        className={`transition-colors duration-150 ${
                          isHighlight
                            ? "bg-cyan-500/10 font-bold border-y border-cyan-500/30 text-cyan-200"
                            : "hover:bg-slate-800/40 text-slate-200"
                        }`}
                      >
                        <td className="px-3 py-2 text-right pr-5 border-l border-white/5 whitespace-nowrap">
                          {isHighlight ? (
                            <span className="inline-flex items-center gap-1.5 font-black text-cyan-300">
                              <span className="h-1.5 w-1.5 rounded-full bg-cyan-400 animate-pulse"></span>
                              {acc}
                            </span>
                          ) : (
                            acc
                          )}
                        </td>
                        {/* سابق */}
                        <td className="px-2 py-1.5 border-l border-white/5 font-mono text-slate-300">
                          {rowData.prevDebit ? rowData.prevDebit.toLocaleString() : "-"}
                        </td>
                        <td className="px-2 py-1.5 border-l border-white/5 font-mono text-slate-300">
                          {rowData.prevCredit ? rowData.prevCredit.toLocaleString() : "-"}
                        </td>
                        {/* حالي */}
                        <td className="px-2 py-1.5 border-l border-white/5 font-mono text-cyan-300 font-bold bg-cyan-950/20">
                          {rowData.curDebit ? rowData.curDebit.toLocaleString() : "-"}
                        </td>
                        <td className="px-2 py-1.5 border-l border-white/5 font-mono text-amber-300 font-bold bg-amber-950/20">
                          {rowData.curCredit ? rowData.curCredit.toLocaleString() : "-"}
                        </td>
                        {/* جملة */}
                        <td className="px-2 py-1.5 border-l border-white/5 font-mono text-slate-200 bg-indigo-950/20">
                          {totD ? totD.toLocaleString() : "-"}
                        </td>
                        <td className="px-2 py-1.5 border-l border-white/5 font-mono text-slate-200 bg-indigo-950/20">
                          {totC ? totC.toLocaleString() : "-"}
                        </td>
                        {/* رصيد */}
                        <td className="px-2 py-1.5 border-l border-white/5 font-mono text-emerald-400 font-bold bg-emerald-950/20">
                          {balD ? balD.toLocaleString() : "-"}
                        </td>
                        <td className="px-2 py-1.5 font-mono text-emerald-400 font-bold bg-emerald-950/20">
                          {balC ? balC.toLocaleString() : "-"}
                        </td>
                      </tr>
                    );
                  })}

                  {/* جملة المجموعة */}
                  <tr className="bg-slate-950/80 font-bold text-slate-100 border-b border-cyan-500/20 text-xs">
                    <td className="px-3 py-2 text-right pr-4 border-l border-white/5 text-cyan-300">
                      جملة {group.title}
                    </td>
                    <td className="px-2 py-2 border-l border-white/5 font-mono text-slate-300">
                      {gPrevD.toLocaleString()}
                    </td>
                    <td className="px-2 py-2 border-l border-white/5 font-mono text-slate-300">
                      {gPrevC.toLocaleString()}
                    </td>
                    <td className="px-2 py-2 border-l border-white/5 font-mono text-cyan-300 font-black">
                      {gCurD.toLocaleString()}
                    </td>
                    <td className="px-2 py-2 border-l border-white/5 font-mono text-amber-300 font-black">
                      {gCurC.toLocaleString()}
                    </td>
                    <td className="px-2 py-2 border-l border-white/5 font-mono text-indigo-300">
                      {(gPrevD + gCurD).toLocaleString()}
                    </td>
                    <td className="px-2 py-2 border-l border-white/5 font-mono text-indigo-300">
                      {(gPrevC + gCurC).toLocaleString()}
                    </td>
                    <td className="px-2 py-2 border-l border-white/5 font-mono text-emerald-400 font-bold">
                      {Math.max(0, gPrevD + gCurD - (gPrevC + gCurC)).toLocaleString()}
                    </td>
                    <td className="px-2 py-2 font-mono text-emerald-400 font-bold">
                      {Math.max(0, gPrevC + gCurC - (gPrevD + gCurD)).toLocaleString()}
                    </td>
                  </tr>
                </React.Fragment>
              );
            })}
          </tbody>

          {/* الإجمالي العام */}
          <tfoot>
            <tr className="bg-gradient-to-r from-slate-950 via-[#0e1e38] to-slate-950 font-black text-white text-xs sm:text-sm border-t-2 border-cyan-400 shadow-inner">
              <td className="px-3 py-3 text-right pr-4 border-l border-white/10 text-cyan-300">
                الإجمالي العام لكافة الحسابات
              </td>
              <td className="px-2 py-3 border-l border-white/10 font-mono text-slate-300">
                {totals.prevDebit.toLocaleString()}
              </td>
              <td className="px-2 py-3 border-l border-white/10 font-mono text-slate-300">
                {totals.prevCredit.toLocaleString()}
              </td>
              <td className="px-2 py-3 border-l border-white/10 font-mono text-cyan-300 font-black text-sm">
                {totals.curDebit.toLocaleString()}
              </td>
              <td className="px-2 py-3 border-l border-white/10 font-mono text-amber-300 font-black text-sm">
                {totals.curCredit.toLocaleString()}
              </td>
              <td className="px-2 py-3 border-l border-white/10 font-mono text-indigo-300 font-black">
                {(totals.prevDebit + totals.curDebit).toLocaleString()}
              </td>
              <td className="px-2 py-3 border-l border-white/10 font-mono text-indigo-300 font-black">
                {(totals.prevCredit + totals.curCredit).toLocaleString()}
              </td>
              <td className="px-2 py-3 border-l border-white/10 font-mono text-emerald-300 font-black">
                {Math.max(
                  0,
                  totals.prevDebit + totals.curDebit - (totals.prevCredit + totals.curCredit)
                ).toLocaleString()}
              </td>
              <td className="px-2 py-3 font-mono text-emerald-300 font-black">
                {Math.max(
                  0,
                  totals.prevCredit + totals.curCredit - (totals.prevDebit + totals.curDebit)
                ).toLocaleString()}
              </td>
            </tr>
          </tfoot>
        </table>
      </div>
    </div>
  );
}
