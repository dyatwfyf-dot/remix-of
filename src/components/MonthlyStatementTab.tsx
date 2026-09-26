import React, { useMemo, useRef, useState, useEffect } from "react";
import { useStore } from "@/lib/store";
import { useReportDate } from "@/lib/reportDate";
import { exportMonthlyStatement, exportRevenueStatement } from "@/lib/exportImport";
import monthlySchema from "@/data/monthlyStatement.json";
import revenueSchema from "@/data/revenueTemplate.json";
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
  AlertTriangle,
  ArrowDownLeft,
  ArrowUpRight,
  Scale,
  Building2,
  Layers,
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

  // 1. الفحص في قاموس المرادفات المباشر
  if (EXACT_ALIASES[c]) return EXACT_ALIASES[c];
  if (EXACT_ALIASES[core]) return EXACT_ALIASES[core];

  // 2. المطابقة التامة بعد تنظيف الحروف والهمزات
  const exact = ALL_ACCOUNTS_CLEAN.find((a) => a.cleaned === c);
  if (exact) return exact.original;

  // 3. المطابقة بجوهر الاسم (حذف كلمة حساب أو ح)
  const coreMatch = ALL_ACCOUNTS_CLEAN.find((a) => a.core === core);
  if (coreMatch) return coreMatch.original;

  // 4. مطابقة الاحتواء التام
  const contains = ALL_ACCOUNTS_CLEAN.find(
    (a) => a.cleaned.includes(c) || c.includes(a.cleaned) || a.core.includes(core) || core.includes(a.core)
  );
  if (contains) return contains.original;

  return null;
};

// ── تحليل التاريخ واستخراج الشهر والسنة بدقة ─────────────────────────────────
function parseJournalDate(dateStr?: string | number): { year: number; month: number } | null {
  if (!dateStr) return null;

  // إذا كان التاريخ رقماً تسلسلياً من إكسل
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
  const tableRef1 = useRef<HTMLTableElement>(null);
  const tableRef2 = useRef<HTMLTableElement>(null);

  const [year, setYear] = useState(new Date().getFullYear());
  const [mode, setMode] = useState<ReportPeriodMode>("month");
  const [month, setMonth] = useState(new Date().getMonth() + 1);
  const [quarter, setQuarter] = useState(Math.floor(new Date().getMonth() / 3) + 1);
  const [halfYear, setHalfYear] = useState(new Date().getMonth() < 6 ? 1 : 2);

  const { startMonth, endMonth } = getPeriodRange({ mode, year, month, quarter, halfYear });

  // ── الترحيل الآلي الفوري لمبالغ القيود اليومية شهراً بشهر وحساباً بحساب ──
  const { data, matchedEntriesCount, unmatchedCount, activeMonths } = useMemo(() => {
    const map: Record<
      string,
      { prevDebit: number; prevCredit: number; curDebit: number; curCredit: number }
    > = {};
    ALL_ACCOUNTS.forEach((a) => {
      map[cleanArabic(a)] = { prevDebit: 0, prevCredit: 0, curDebit: 0, curCredit: 0 };
    });

    let matched = 0;
    let unmatched = 0;
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

      // تحديد الحساب المدين والدائن بمرونة فائقة
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
      else if (debitAmt > 0 || creditAmt > 0) unmatched++;
    });

    return {
      data: map,
      matchedEntriesCount: matched,
      unmatchedCount: unmatched,
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
      { prevDebit: 0, prevCredit: 0, curDebit: 0, curCredit: 0 },
    );
  }, [data]);

  const movementLabel = getReportMovementLabel({ mode, month, quarter, halfYear });
  const periodLabel = getReportPeriodLabel({ mode, year, month, quarter, halfYear });

  return (
    <div className="w-full space-y-4 p-2 sm:p-4 bg-gradient-to-br from-slate-900 via-sky-950 to-slate-900 text-slate-100 min-h-screen" dir="rtl">
      {/* ══ الترويسة وأزرار التحكم ══ */}
      <div className="rounded-2xl border border-sky-500/20 bg-slate-100 p-4 shadow-xl backdrop-blur-md">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-white/10 pb-3">
          <div className="flex items-center gap-3">
            <div className="grid h-12 w-12 place-items-center rounded-2xl bg-sky-500/20 text-sky-400 border border-sky-400/30 shadow-inner">
              <FileSpreadsheet className="h-6 w-6" />
            </div>
            <div>
              <h1 className="text-lg font-black text-white">كشف الحساب الشهري التلقائي</h1>
              <p className="text-xs text-sky-300">ترحيل آلي فوري لكافة قيود اليومية المحفوظة والمستوردة</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <ImportButton kind="monthly" />
          </div>
        </div>

        {/* ══ مؤشرات الحالة وسرعة الترحيل ══ */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 mt-3">
          <div className="rounded-xl border border-emerald-500/30 bg-emerald-950/40 p-2.5">
            <div className="flex items-center justify-between text-xs text-emerald-300 mb-1">
              <span>قيود مرحلة آلياً</span>
              <CheckCircle2 className="h-4 w-4 text-emerald-400" />
            </div>
            <div className="text-lg font-black text-white">{matchedEntriesCount}</div>
          </div>

          <div className="rounded-xl border border-sky-500/30 bg-sky-950/40 p-2.5">
            <div className="flex items-center justify-between text-xs text-sky-300 mb-1">
              <span>مدين الشهر الجاري</span>
              <ArrowDownLeft className="h-4 w-4 text-sky-400" />
            </div>
            <div className="text-lg font-black text-white">{totals.curDebit.toLocaleString()}</div>
          </div>

          <div className="rounded-xl border border-amber-500/30 bg-amber-950/40 p-2.5">
            <div className="flex items-center justify-between text-xs text-amber-300 mb-1">
              <span>دائن الشهر الجاري</span>
              <ArrowUpRight className="h-4 w-4 text-amber-400" />
            </div>
            <div className="text-lg font-black text-white">{totals.curCredit.toLocaleString()}</div>
          </div>

          <div className="rounded-xl border border-purple-500/30 bg-purple-950/40 p-2.5">
            <div className="flex items-center justify-between text-xs text-purple-300 mb-1">
              <span>صافي حركة الفترة</span>
              <Scale className="h-4 w-4 text-purple-400" />
            </div>
            <div className="text-lg font-black text-white">{(totals.curDebit - totals.curCredit).toLocaleString()}</div>
          </div>
        </div>

        {/* ══ أشرطة اختيار الشهر السريع ══ */}
        {activeMonths.length > 0 && (
          <div className="mt-3 p-2 bg-slate-950/60 rounded-xl border border-white/5 flex flex-wrap items-center gap-1.5">
            <span className="text-xs font-bold text-sky-300 ml-2">الأشهر التي تحتوي حركات:</span>
            {activeMonths.map((m) => (
              <button
                key={m}
                onClick={() => {
                  setMode("month");
                  setMonth(m);
                }}
                className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all ${
                  mode === "month" && month === m
                    ? "bg-sky-500 text-white shadow-md shadow-sky-500/30"
                    : "bg-slate-800 text-slate-300 hover:bg-slate-700"
                }`}
              >
                {MONTHS_NAMES[m - 1]}
              </button>
            ))}
          </div>
        )}

        {/* ══ محددات الفترة ══ */}
        <div className="mt-3 flex flex-wrap items-center gap-2 text-xs">
          <div className="flex items-center gap-1 bg-slate-800/80 px-2.5 py-1.5 rounded-lg border border-white/10">
            <Calendar className="h-3.5 w-3.5 text-sky-400" />
            <select
              value={year}
              onChange={(e) => setYear(Number(e.target.value))}
              className="bg-transparent font-bold text-white outline-none cursor-pointer"
            >
              {[2024, 2025, 2026, 2027].map((y) => (
                <option key={y} value={y} className="bg-slate-900 text-white">{y}م</option>
              ))}
            </select>
          </div>

          <div className="flex items-center gap-1 bg-slate-800/80 px-2.5 py-1.5 rounded-lg border border-white/10">
            <select
              value={month}
              onChange={(e) => setMonth(Number(e.target.value))}
              className="bg-transparent font-bold text-white outline-none cursor-pointer"
            >
              {MONTHS_NAMES.map((m, idx) => (
                <option key={idx + 1} value={idx + 1} className="bg-slate-900 text-white">
                  شهر {m}
                </option>
              ))}
            </select>
          </div>

          <span className="text-slate-400 font-medium mr-auto">
            الفترة الحالية: <strong className="text-sky-300">{periodLabel}</strong>
          </span>
        </div>
      </div>

      {/* ══ جدول كشف الحساب الشهري ══ */}
      <div className="overflow-x-auto rounded-2xl border border-sky-500/20 bg-slate-900/90 shadow-2xl">
        <table ref={tableRef1} className="w-full text-center text-xs border-collapse">
          <thead>
            <tr className="bg-gradient-to-r from-sky-950 via-slate-900 to-sky-950 text-sky-200 border-b border-sky-500/30">
              <th rowSpan={2} className="p-2 border-l border-white/10 min-w-[180px] text-right font-black">
                بيان أنواع الحسابات
              </th>
              <th colSpan={2} className="p-2 border-l border-white/10 bg-slate-800/40 font-bold">
                الأشهر السابقة
              </th>
              <th colSpan={2} className="p-2 border-l border-white/10 bg-sky-900/30 font-bold">
                {movementLabel}
              </th>
              <th colSpan={2} className="p-2 border-l border-white/10 bg-indigo-900/30 font-bold">
                الجملة
              </th>
              <th colSpan={2} className="p-2 bg-emerald-900/30 font-bold">
                الرصيد في نهاية الفترة
              </th>
            </tr>
            <tr className="bg-slate-950/80 text-[11px] text-slate-300 border-b border-white/10">
              <th className="p-1.5 border-l border-white/10 text-sky-300">مدين</th>
              <th className="p-1.5 border-l border-white/10 text-amber-300">دائن</th>
              <th className="p-1.5 border-l border-white/10 text-sky-300 bg-sky-950/40">مدين</th>
              <th className="p-1.5 border-l border-white/10 text-amber-300 bg-sky-950/40">دائن</th>
              <th className="p-1.5 border-l border-white/10 text-sky-300 bg-indigo-950/40">مدين</th>
              <th className="p-1.5 border-l border-white/10 text-amber-300 bg-indigo-950/40">دائن</th>
              <th className="p-1.5 border-l border-white/10 text-emerald-300 bg-emerald-950/40">مدين</th>
              <th className="p-1.5 text-emerald-300 bg-emerald-950/40">دائن</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5 font-medium">
            {GROUPS.map((group, gIdx) => {
              let gPrevD = 0, gPrevC = 0, gCurD = 0, gCurC = 0;
              return (
                <React.Fragment key={gIdx}>
                  <tr className="bg-sky-950/40 font-bold text-sky-200 text-right">
                    <td colSpan={9} className="px-3 py-1.5 border-y border-sky-500/20">
                      • {group.title}
                    </td>
                  </tr>
                  {group.accounts.map((acc, aIdx) => {
                    const rowData = data[cleanArabic(acc)] || { prevDebit: 0, prevCredit: 0, curDebit: 0, curCredit: 0 };
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
                        className={`hover:bg-sky-500/10 transition-colors ${
                          isHighlight ? "bg-sky-500/5 font-bold text-sky-100" : ""
                        }`}
                      >
                        <td className="px-3 py-1.5 text-right border-l border-white/5 whitespace-nowrap">
                          {acc}
                        </td>
                        <td className="px-2 py-1.5 border-l border-white/5 font-mono text-slate-300">
                          {rowData.prevDebit ? rowData.prevDebit.toLocaleString() : "-"}
                        </td>
                        <td className="px-2 py-1.5 border-l border-white/5 font-mono text-slate-300">
                          {rowData.prevCredit ? rowData.prevCredit.toLocaleString() : "-"}
                        </td>
                        <td className="px-2 py-1.5 border-l border-white/5 font-mono text-sky-300 bg-sky-950/20 font-bold">
                          {rowData.curDebit ? rowData.curDebit.toLocaleString() : "-"}
                        </td>
                        <td className="px-2 py-1.5 border-l border-white/5 font-mono text-amber-300 bg-sky-950/20 font-bold">
                          {rowData.curCredit ? rowData.curCredit.toLocaleString() : "-"}
                        </td>
                        <td className="px-2 py-1.5 border-l border-white/5 font-mono text-slate-200 bg-indigo-950/20">
                          {totD ? totD.toLocaleString() : "-"}
                        </td>
                        <td className="px-2 py-1.5 border-l border-white/5 font-mono text-slate-200 bg-indigo-950/20">
                          {totC ? totC.toLocaleString() : "-"}
                        </td>
                        <td className="px-2 py-1.5 border-l border-white/5 font-mono text-emerald-300 bg-emerald-950/20 font-bold">
                          {balD ? balD.toLocaleString() : "-"}
                        </td>
                        <td className="px-2 py-1.5 font-mono text-emerald-300 bg-emerald-950/20 font-bold">
                          {balC ? balC.toLocaleString() : "-"}
                        </td>
                      </tr>
                    );
                  })}
                  {/* جملة المجموعة */}
                  <tr className="bg-slate-950/90 font-bold text-sky-200 border-b border-sky-500/20 text-xs">
                    <td className="px-3 py-1.5 text-right border-l border-white/5">
                      جملة {group.title}
                    </td>
                    <td className="px-2 py-1.5 border-l border-white/5 font-mono">{gPrevD.toLocaleString()}</td>
                    <td className="px-2 py-1.5 border-l border-white/5 font-mono">{gPrevC.toLocaleString()}</td>
                    <td className="px-2 py-1.5 border-l border-white/5 font-mono text-sky-300">{gCurD.toLocaleString()}</td>
                    <td className="px-2 py-1.5 border-l border-white/5 font-mono text-amber-300">{gCurC.toLocaleString()}</td>
                    <td className="px-2 py-1.5 border-l border-white/5 font-mono text-indigo-300">{(gPrevD + gCurD).toLocaleString()}</td>
                    <td className="px-2 py-1.5 border-l border-white/5 font-mono text-indigo-300">{(gPrevC + gCurC).toLocaleString()}</td>
                    <td className="px-2 py-1.5 border-l border-white/5 font-mono text-emerald-300">
                      {Math.max(0, gPrevD + gCurD - (gPrevC + gCurC)).toLocaleString()}
                    </td>
                    <td className="px-2 py-1.5 font-mono text-emerald-300">
                      {Math.max(0, gPrevC + gCurC - (gPrevD + gCurD)).toLocaleString()}
                    </td>
                  </tr>
                </React.Fragment>
              );
            })}
          </tbody>
          {/* الإجمالي العام */}
          <tfoot>
            <tr className="bg-gradient-to-r from-sky-950 via-slate-900 to-sky-950 font-black text-white text-sm border-t-2 border-sky-400">
              <td className="px-3 py-2 text-right border-l border-white/10">الإجمالي العام</td>
              <td className="px-2 py-2 border-l border-white/10 font-mono">{totals.prevDebit.toLocaleString()}</td>
              <td className="px-2 py-2 border-l border-white/10 font-mono">{totals.prevCredit.toLocaleString()}</td>
              <td className="px-2 py-2 border-l border-white/10 font-mono text-sky-400">{totals.curDebit.toLocaleString()}</td>
              <td className="px-2 py-2 border-l border-white/10 font-mono text-amber-400">{totals.curCredit.toLocaleString()}</td>
              <td className="px-2 py-2 border-l border-white/10 font-mono text-indigo-300">
                {(totals.prevDebit + totals.curDebit).toLocaleString()}
              </td>
              <td className="px-2 py-2 border-l border-white/10 font-mono text-indigo-300">
                {(totals.prevCredit + totals.curCredit).toLocaleString()}
              </td>
              <td className="px-2 py-2 border-l border-white/10 font-mono text-emerald-400">
                {Math.max(0, totals.prevDebit + totals.curDebit - (totals.prevCredit + totals.curCredit)).toLocaleString()}
              </td>
              <td className="px-2 py-2 font-mono text-emerald-400">
                {Math.max(0, totals.prevCredit + totals.curCredit - (totals.prevDebit + totals.curDebit)).toLocaleString()}
              </td>
            </tr>
          </tfoot>
        </table>
      </div>
    </div>
  );
}
