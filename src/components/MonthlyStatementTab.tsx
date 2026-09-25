import { Fragment, useEffect, useMemo, useRef, useState } from "react";
import { useStore } from "@/lib/store";
import { fmt } from "@/lib/format";
import schema from "@/data/monthlyStatement.json";
import revenueSchema from "@/data/revenueTemplate.json";
import { exportPeriodicStatement } from "@/lib/exportImport";
import { monthlyStatementPdf } from "@/lib/exportPdf";
import {
  getPeriodRange,
  getReportMovementLabel,
  getReportPeriodLabel,
  REPORT_MONTH_NAMES,
  type ReportPeriodMode,
} from "@/lib/reportPeriods";
import {
  AlertOctagon,
  FileSpreadsheet,
  FileText,
  Calendar,
  Layers,
  Clock,
  CheckCircle2,
  AlertTriangle,
  ArrowDownLeft,
  ArrowUpRight,
  Scale,
  RefreshCw,
  Sparkles,
} from "lucide-react";
import WebActionMenu, { type WebActionItem } from "./WebActionMenu";
import { toast } from "sonner";
import ImportButton from "./ImportButton";
import { useReportDate } from "@/lib/reportDate";

type Group = { title: string; accounts: string[] };
const GROUPS = schema.groups as Group[];
const ALL_ACCOUNTS = GROUPS.flatMap((g) => g.accounts);

// ── توحيد وتطبيع النصوص العربية ──────────────────────────────────────────────
const norm = (s: string) => {
  if (!s) return "";
  return s
    .replace(/[\u064B-\u0652\u0670\u0640]/g, "")
    .replace(/[\u0622\u0623\u0625]/g, "\u0627")
    .replace(/[\u0649\u064A]/g, "\u064A")
    .replace(/\u0629/g, "\u0648")
    .replace(/\u062D\s*\/\s*/g, "\u062D\u0633\u0627\u0628 ")
    .replace(/[()[\]./\\،,]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
};

const STOP_WORDS = new Set(["حساب", "حسابات", "ح"]);
const tokens = (s: string) =>
  norm(s)
    .split(" ")
    .filter((w) => w && !STOP_WORDS.has(w));

const ALL_NORM = ALL_ACCOUNTS.map((a) => ({ name: a, norm: norm(a), toks: tokens(a) }));

// ── قاموس المطابقة الصريحة والشاملة لترحيل الأبواب والحسابات ──────────────────
const EXACT_ALIASES: Record<string, string> = {
  // ── الباب الأول والباب الثاني يمثلان الاستخدامات ──
  [norm("الباب الاول")]: "الاستخدامات",
  [norm("الباب الأول")]: "الاستخدامات",
  [norm("باب اول")]: "الاستخدامات",
  [norm("باب أول")]: "الاستخدامات",
  [norm("الباب 1")]: "الاستخدامات",
  [norm("باب 1")]: "الاستخدامات",
  [norm("الباب الاول (الأجور والمرتبات)")]: "الاستخدامات",
  [norm("الباب الأول (الأجور والمرتبات)")]: "الاستخدامات",
  [norm("الأجور والمرتبات")]: "الاستخدامات",
  [norm("الاجور والمرتبات")]: "الاستخدامات",
  [norm("نفقات الباب الاول")]: "الاستخدامات",
  [norm("نفقات الباب الأول")]: "الاستخدامات",
  [norm("الاستخدامات - الباب الاول")]: "الاستخدامات",
  [norm("الاستخدامات - الباب الأول")]: "الاستخدامات",
  [norm("استخدامات الباب الاول")]: "الاستخدامات",
  [norm("استخدامات الباب الأول")]: "الاستخدامات",

  [norm("الباب الثاني")]: "الاستخدامات",
  [norm("باب ثاني")]: "الاستخدامات",
  [norm("الباب 2")]: "الاستخدامات",
  [norm("باب 2")]: "الاستخدامات",
  [norm("الباب الثاني (النفقات التشغيلية)")]: "الاستخدامات",
  [norm("النفقات التشغيلية")]: "الاستخدامات",
  [norm("نفقات تشغيلية")]: "الاستخدامات",
  [norm("نفقات الباب الثاني")]: "الاستخدامات",
  [norm("الاستخدامات - الباب الثاني")]: "الاستخدامات",
  [norm("استخدامات الباب الثاني")]: "الاستخدامات",

  [norm("الباب الاول والباب الثاني")]: "الاستخدامات",
  [norm("الباب الأول والباب الثاني")]: "الاستخدامات",
  [norm("الباب الاول والثاني")]: "الاستخدامات",
  [norm("الباب الأول والثاني")]: "الاستخدامات",

  // ── الباب الثالث يمثل الموارد ──
  [norm("الباب الثالث")]: "الموارد",
  [norm("باب ثالث")]: "الموارد",
  [norm("الباب 3")]: "الموارد",
  [norm("باب 3")]: "الموارد",
  [norm("الباب الثالث (الدعم والموارد)")]: "الموارد",
  [norm("الدعم والموارد")]: "الموارد",
  [norm("دعم وموارد")]: "الموارد",
  [norm("الموارد")]: "الموارد",
  [norm("موارد الباب الثالث")]: "الموارد",

  // ── الباب الرابع يمثل اكتساب الأصول غير المالية ──
  [norm("الباب الرابع")]: "حساب اكتساب الأصول غير المالية",
  [norm("باب رابع")]: "حساب اكتساب الأصول غير المالية",
  [norm("الباب 4")]: "حساب اكتساب الأصول غير المالية",
  [norm("باب 4")]: "حساب اكتساب الأصول غير المالية",
  [norm("الباب الرابع (اكتساب الأصول غير المالية)")]: "حساب اكتساب الأصول غير المالية",
  [norm("اكتساب الأصول غير المالية")]: "حساب اكتساب الأصول غير المالية",
  [norm("اكتساب الاصول غير الماليه")]: "حساب اكتساب الأصول غير المالية",
  [norm("حساب اكتساب الاصول غير المالية")]: "حساب اكتساب الأصول غير المالية",
  [norm("شراء أصول")]: "حساب اكتساب الأصول غير المالية",
  [norm("شراء اصول")]: "حساب اكتساب الأصول غير المالية",

  // ── مطابقة الحسابات المصرفية والنقدية والوسيطة ──
  [norm("ح/ النقدية للصندوق")]: "حساب النقدية",
  [norm("النقدية للصندوق")]: "حساب النقدية",
  [norm("ح/ النقدية")]: "حساب النقدية",
  [norm("صندوق المركز")]: "حساب النقدية",
  [norm("النقدية بالصندوق")]: "حساب النقدية",
  [norm("ح/ المدينين مالية")]: "حساب المدينين (مالية)",
  [norm("ح/ الدائنين مالية")]: "حساب الدائنين (مالية)",
  [norm("حسابات سلف الحسابات الجارية")]: "حساب سلف الحسابات الجارية",
  [norm("حساب البنك اكتساب اصول غير مالية")]: "حساب البنك اكتساب أصول غير مالية محلية",
  [norm("حساب تسوية الموارد المحصلة مقدما")]: "حساب تسوية الموارد المحصلة مقدماً",
  [norm("حساب مرتجع الاجور")]: "حساب مرتجع الأجور",
  [norm("حساب التامينات المتنوعة")]: "حساب التأمينات المتنوعة",
  [norm("حساب دائنون التزمات قائمة")]: "حساب دائنون التزامات قائمة",
  [norm("حساب امانات الكفالات")]: "حساب أمانات الكفالات",
  [norm("حساب النفقات المقدمة عن سلع وخدمات")]: "حساب النفقات المقدمة عن سلع وخدمات وممتلكات",
  [norm("حساب مراقبة اكتساب الاصول غير المالية")]: "حساب مراقبة اكتساب الأصول غير المالية",
  [norm("حساب البنك امانات")]: "حساب البنك أمانات",
};

const matchAccount = (raw: string): string | null => {
  if (!raw) return null;
  const n = norm(raw);
  if (!n) return null;

  // 1. فحص في قاموس المرادفات المباشر
  if (EXACT_ALIASES[n]) return EXACT_ALIASES[n];

  // 2. مطابقة حرفية تامة
  const exact = ALL_NORM.find((a) => a.norm === n);
  if (exact) return exact.name;

  // 3. مطابقة احتوائية دقيقة
  const contains = ALL_NORM.find((a) => a.norm === n || a.norm.startsWith(n) || n.startsWith(a.norm));
  if (contains) return contains.name;

  // 4. مطابقة توكنز قوية
  const rawToks = tokens(raw);
  if (!rawToks.length) return null;
  let best: { name: string; score: number } | null = null;
  for (const a of ALL_NORM) {
    if (!a.toks.length) continue;
    const common = a.toks.filter((t) => rawToks.includes(t)).length;
    if (!common) continue;
    const score = common / Math.max(a.toks.length, rawToks.length);
    if (!best || score > best.score) best = { name: a.name, score };
  }
  return best && best.score >= 0.65 ? best.name : null;
};

// ── تحليل التاريخ واستخراج السنة والشهر بأمان تام ─────────────────────────────
function parseJournalDate(dateStr?: string): { year: number; month: number } | null {
  if (!dateStr) return null;
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

function lastDayOfMonth(y: number, m: number) {
  return new Date(y, m, 0).getDate();
}

// ── مكوّن لتقليص حجم خطوط الجداول تلقائياً ─────────────────────────────────────
function useFitText(ref: React.RefObject<HTMLTableElement | null>) {
  useEffect(() => {
    const table = ref.current;
    if (!table) return;

    function fitCells() {
      const cells = table!.querySelectorAll<HTMLElement>("td, th");
      cells.forEach((cell) => {
        cell.style.fontSize = "";
        let size = parseFloat(getComputedStyle(cell).fontSize) || 14;
        const minSize = 8;
        while (size > minSize && cell.scrollWidth > cell.clientWidth + 1) {
          size -= 0.5;
          cell.style.fontSize = size + "px";
        }
      });
    }

    fitCells();
    const ro = new ResizeObserver(fitCells);
    ro.observe(table);
    return () => ro.disconnect();
  }, [ref]);
}

// ── المكوّن الرئيسي لتبويب كشف الحساب الشهري ─────────────────────────────────
export default function MonthlyStatementTab() {
  const { journal, accounts, clearJournal } = useStore();
  const { reportDate } = useReportDate();
  const tableRef1 = useRef<HTMLTableElement>(null);
  const tableRef2 = useRef<HTMLTableElement>(null);
  useFitText(tableRef1);
  useFitText(tableRef2);

  const [year, setYear] = useState(new Date().getFullYear());
  const [mode, setMode] = useState<ReportPeriodMode>("month");
  const [month, setMonth] = useState(new Date().getMonth() + 1);
  const [quarter, setQuarter] = useState(Math.floor(new Date().getMonth() / 3) + 1);
  const [halfYear, setHalfYear] = useState(new Date().getMonth() < 6 ? 1 : 2);

  const { startMonth, endMonth } = getPeriodRange({ mode, year, month, quarter, halfYear });

  // تجميع الحركات من قيود اليومية وترحيلها للحسابات المقابلة في كشف الحساب
  const { data, matchedEntriesCount, unmatchedCount } = useMemo(() => {
    const map: Record<
      string,
      { prevDebit: number; prevCredit: number; curDebit: number; curCredit: number }
    > = {};
    ALL_ACCOUNTS.forEach(
      (a) => (map[norm(a)] = { prevDebit: 0, prevCredit: 0, curDebit: 0, curCredit: 0 }),
    );

    let matched = 0;
    let unmatched = 0;

    journal.forEach((j) => {
      const parsedDate = parseJournalDate(j.date);
      if (!parsedDate || parsedDate.year !== year) return;

      const m = parsedDate.month;
      const isCurrent = m >= startMonth && m <= endMonth;
      const isPrev = m < startMonth;
      if (!isCurrent && !isPrev) return;

      const dMatch = matchAccount(j.debitAccount || j.account || "");
      const cMatch = matchAccount(j.creditAccount || "");
      const dKey = dMatch ? norm(dMatch) : "";
      const cKey = cMatch ? norm(cMatch) : "";

      let hasMatchedLeg = false;

      if (dKey && map[dKey]) {
        if (isCurrent) map[dKey].curDebit += Number(j.debit) || 0;
        else map[dKey].prevDebit += Number(j.debit) || 0;
        hasMatchedLeg = true;
      }

      if (cKey && map[cKey]) {
        if (isCurrent) map[cKey].curCredit += Number(j.credit) || 0;
        else map[cKey].prevCredit += Number(j.credit) || 0;
        hasMatchedLeg = true;
      }

      if (hasMatchedLeg) matched++;
      else unmatched++;
    });

    return { data: map, matchedEntriesCount: matched, unmatchedCount: unmatched };
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

  const revenueLabelByKey = useMemo(() => {
    const map: Record<string, string> = {};
    (revenueSchema as any).chapters?.forEach((ch: any) =>
      ch.sections?.forEach((sec: any) =>
        sec.items?.forEach((it: any) =>
          it.types?.forEach((t: any) => {
            map[`${ch.no}-${sec.no}-${it.no}-${t.no}`] =
              `${ch.title} ← ${sec.title || ""} ← ${it.title || ""} ← ${t.title}`;
          }),
        ),
      ),
    );
    return map;
  }, []);

  const revenueByCode = useMemo(() => {
    const agg: Record<string, { prev: number; cur: number; count: number }> = {};
    (accounts || []).forEach((acc: any) => {
      const code = acc.revenueKey;
      if (!code) return;
      const income = Number(acc.income) || 0;
      if (!income) return;

      const parsedDate = parseJournalDate(acc.date);
      if (!parsedDate || parsedDate.year !== year) return;

      const m = parsedDate.month;
      const isCurrent = m >= startMonth && m <= endMonth;
      const isPrev = m < startMonth;
      if (!isCurrent && !isPrev) return;

      if (!agg[code]) agg[code] = { prev: 0, cur: 0, count: 0 };
      if (isCurrent) agg[code].cur += income;
      else agg[code].prev += income;
      agg[code].count++;
    });

    return Object.entries(agg)
      .map(([code, v]) => ({
        code,
        label: revenueLabelByKey[code] || code,
        ...v,
        total: v.prev + v.cur,
      }))
      .sort((a, b) => a.code.localeCompare(b.code));
  }, [accounts, year, startMonth, endMonth, revenueLabelByKey]);

  const revenueTotals = useMemo(
    () =>
      revenueByCode.reduce(
        (a, r) => ({
          prev: a.prev + r.prev,
          cur: a.cur + r.cur,
          total: a.total + r.total,
          count: a.count + r.count,
        }),
        { prev: 0, cur: 0, total: 0, count: 0 },
      ),
    [revenueByCode],
  );

  const handleClearAllData = () => {
    if (journal.length === 0) {
      toast.info("لا توجد بيانات حالية لمسحها");
      return;
    }
    const confirmClear = window.confirm(
      "⚠️ تنبيه محاسبي: هل أنت متأكد تماماً من رغبتك في مسح كافة قيود اليومية؟ سيؤدي ذلك لتصفير كشف الحساب.",
    );
    if (confirmClear) {
      if (clearJournal) {
        clearJournal();
        toast.success("تم مسح كافة البيانات وتصفير الكشف بنجاح");
      } else {
        toast.error("حدث خطأ أثناء محاولة التصفير");
      }
    }
  };

  const periodSelection = { mode, year, month, quarter, halfYear };
  const periodLabel = getReportPeriodLabel(periodSelection);
  const movementLabel = getReportMovementLabel(periodSelection);

  const handleExport = () =>
    exportPeriodicStatement(journal, year, { ...periodSelection, reportDate });

  const handlePdf = () =>
    monthlyStatementPdf({
      journal,
      year,
      startMonth,
      endMonth,
      mode,
      month,
      quarter,
      halfYear,
      reportDate,
    });

  const webActions: WebActionItem[] = [
    {
      label: "استيراد Excel",
      onSelect: () => undefined,
      content: <ImportButton kind="monthly" />,
    },
    ...(journal.length > 0
      ? [{ label: "تصفير الكشف", icon: AlertOctagon, onSelect: handleClearAllData, destructive: true }]
      : []),
    { label: "تصدير Excel", icon: FileSpreadsheet, onSelect: handleExport },
    { label: "تصدير PDF", icon: FileText, onSelect: handlePdf },
  ];

  const netBalance =
    totals.prevDebit + totals.curDebit - (totals.prevCredit + totals.curCredit);

  return (
    <div className="sheet-tabs-ui space-y-4 p-2 sm:space-y-6 sm:p-4 text-slate-800" dir="rtl">
      {/* ── الترويسة الرئيسية ────────────────────────────────────────── */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-[#071326] via-[#0d2847] to-[#1a446c] p-4 text-white shadow-xl shadow-cyan-950/20 border border-cyan-800/40">
        <div className="absolute -top-16 -left-16 w-56 h-56 rounded-full bg-cyan-500/10 blur-3xl pointer-events-none" />
        <div className="absolute -bottom-16 -right-16 w-56 h-56 rounded-full bg-blue-600/10 blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-center sm:text-right">
          <div>
            <div className="inline-flex items-center gap-1.5 rounded-full bg-cyan-500/20 px-3 py-1 text-xs font-bold text-cyan-300 border border-cyan-400/30 mb-2">
              <Sparkles className="w-3.5 h-3.5 text-cyan-300 animate-pulse" />
              النظام المحاسبي المالي الموحد
            </div>
            <h1 className="text-xl sm:text-2xl font-black tracking-wide text-white drop-shadow-sm">
              {schema.title || "كشف الحساب الشهري"}
            </h1>
            <p className="text-xs sm:text-sm text-cyan-100/80 mt-1 font-medium">
              {schema.office || "المجلس اليمني للاختصاصات الطبية"} — {schema.governorate || "صعدة"}
            </p>
          </div>

          <div className="flex flex-wrap items-center justify-center sm:justify-end gap-2 text-xs">
            <span className="rounded-xl bg-white/10 px-3 py-1.5 font-bold border border-white/15 backdrop-blur-sm text-white flex items-center gap-1.5">
              <Clock className="w-4 h-4 text-cyan-300" /> الفترة: {periodLabel}
            </span>
            <span className="rounded-xl bg-cyan-950/70 px-3 py-1.5 font-bold border border-cyan-500/40 text-cyan-200">
              السنة: {year}م
            </span>
          </div>
        </div>
      </div>

      {/* ── البطاقات الإحصائية الأربع ───────────────────────────────────── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-2.5 sm:gap-4">
        <div className="rounded-2xl border border-cyan-100 bg-gradient-to-br from-white to-cyan-50/40 p-3 shadow-sm hover:shadow-md transition">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-cyan-900">مدين الفترة</span>
            <div className="p-1.5 rounded-lg bg-cyan-100 text-cyan-700">
              <ArrowDownLeft className="w-4 h-4" />
            </div>
          </div>
          <p className="mt-2 text-base sm:text-xl font-black font-mono text-cyan-950">
            {fmt(totals.curDebit)}
          </p>
          <p className="text-[10px] text-cyan-700/70 mt-0.5">
            التراكمي: {fmt(totals.prevDebit + totals.curDebit)}
          </p>
        </div>

        <div className="rounded-2xl border border-rose-100 bg-gradient-to-br from-white to-rose-50/40 p-3 shadow-sm hover:shadow-md transition">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-rose-900">دائن الفترة</span>
            <div className="p-1.5 rounded-lg bg-rose-100 text-rose-700">
              <ArrowUpRight className="w-4 h-4" />
            </div>
          </div>
          <p className="mt-2 text-base sm:text-xl font-black font-mono text-rose-950">
            {fmt(totals.curCredit)}
          </p>
          <p className="text-[10px] text-rose-700/70 mt-0.5">
            التراكمي: {fmt(totals.prevCredit + totals.curCredit)}
          </p>
        </div>

        <div className="rounded-2xl border border-emerald-100 bg-gradient-to-br from-white to-emerald-50/40 p-3 shadow-sm hover:shadow-md transition">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-emerald-900">صافي المركز المالي</span>
            <div className="p-1.5 rounded-lg bg-emerald-100 text-emerald-700">
              <Scale className="w-4 h-4" />
            </div>
          </div>
<p className={`mt-2 text-base sm:text-xl font-black font-mono ${
              netBalance >= 0 ? "text-emerald-700" : "text-rose-700"
            }`}>
 {fmt(Math.abs(netBalance))}
          </p>
<p className="text-[10px] text-emerald-700/80 mt-0.5 font-bold">
{netBalance >= 0 ? "رصيد فائض / مدين" : "رصيد دائن"}
</p>
 </div>

        <div className="rounded-2xl border border-blue-100 bg-gradient-to-br from-white to-blue-50/40 p-3 shadow-sm hover:shadow-md transition">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-blue-900">القيود المطابقة</span>
            <div className="p-1.5 rounded-lg bg-blue-100 text-blue-700">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>
          <p className="mt-2 text-base sm:text-xl font-black font-mono text-blue-950">
            {matchedEntriesCount} قيداً
          </p>
          <p className="text-[10px] text-blue-700/80 mt-0.5">
            {unmatchedCount > 0 ? (
              <span className="text-amber-600 font-bold">⚠️ {unmatchedCount} قيد غير مطابق</span>
            ) : (
              <span className="text-emerald-600 font-bold">✓ ربط مطابق 100%</span>
            )}
          </p>
        </div>
      </div>

      {/* ── لوحة التحكم والإجراءات (حقلين أو زرين في كل سطر دائماً) ────────── */}
      <div className="rounded-2xl border border-slate-200/90 bg-white p-3 sm:p-5 shadow-sm space-y-3.5">
        <div className="flex items-center gap-2 border-b border-slate-100 pb-2.5">
          <Layers className="w-4 h-4 text-cyan-700" />
          <h2 className="text-xs sm:text-sm font-black text-slate-800">
            فترة التقرير وخيارات العرض المحاسبي
          </h2>
        </div>

        {/* سطر 1: حقلين (طريقة العرض + الفترة) */}
        <div className="grid grid-cols-2 gap-2 sm:gap-3">
          <div>
            <label className="mb-1 block text-xs font-bold text-slate-700">
              طريقة العرض المالي
            </label>
            <select
              value={mode}
              onChange={(e) => setMode(e.target.value as ReportPeriodMode)}
              className="w-full px-2.5 py-2 text-xs sm:text-sm border border-slate-300 rounded-xl bg-slate-50/80 font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 transition"
            >
              <option value="month">كشف شهري تفصيلي</option>
              <option value="quarter">تقرير ربع سنوي</option>
              <option value="halfYear">تقرير نصف سنوي</option>
              <option value="year">تقرير سنوي شامل</option>
            </select>
          </div>

          <div>
            <label className="mb-1 block text-xs font-bold text-slate-700">
              {mode === "month"
                ? "الشهر المالي"
                : mode === "quarter"
                ? "الربع المالي"
                : mode === "halfYear"
                ? "النصف المالي"
                : "الفترة الزمنية"}
            </label>

            {mode === "month" ? (
              <select
                value={month}
                onChange={(e) => setMonth(Number(e.target.value))}
                className="w-full px-2.5 py-2 text-xs sm:text-sm border border-slate-300 rounded-xl bg-slate-50/80 font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 transition"
              >
                {REPORT_MONTH_NAMES.map((n, i) => (
                  <option key={i} value={i + 1}>
                    {n}
                  </option>
                ))}
              </select>
            ) : mode === "quarter" ? (
              <select
                value={quarter}
                onChange={(e) => setQuarter(Number(e.target.value))}
                className="w-full px-2.5 py-2 text-xs sm:text-sm border border-slate-300 rounded-xl bg-slate-50/80 font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 transition"
              >
                <option value={1}>الربع الأول (يناير - مارس)</option>
                <option value={2}>الربع الثاني (أبريل - يونيو)</option>
                <option value={3}>الربع الثالث (يوليو - سبتمبر)</option>
                <option value={4}>الربع الرابع (أكتوبر - ديسمبر)</option>
              </select>
            ) : mode === "halfYear" ? (
              <select
                value={halfYear}
                onChange={(e) => setHalfYear(Number(e.target.value))}
                className="w-full px-2.5 py-2 text-xs sm:text-sm border border-slate-300 rounded-xl bg-slate-50/80 font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 transition"
              >
                <option value={1}>النصف الأول (يناير - يونيو)</option>
                <option value={2}>النصف الثاني (يوليو - ديسمبر)</option>
              </select>
            ) : (
              <div className="w-full px-2.5 py-2 text-xs sm:text-sm border border-slate-200 bg-slate-100 rounded-xl font-bold text-slate-700 text-center">
                كامل العام (يناير - ديسمبر)
              </div>
            )}
          </div>
        </div>

        {/* سطر 2: حقلين (السنة + مسمى الحركة) */}
        <div className="grid grid-cols-2 gap-2 sm:gap-3">
          <div>
            <label className="mb-1 block text-xs font-bold text-slate-700">السنة المالية</label>
            <input
              type="number"
              value={year}
              onChange={(e) => setYear(Number(e.target.value) || year)}
              className="w-full px-2.5 py-2 text-xs sm:text-sm border border-slate-300 rounded-xl bg-slate-50/80 font-mono font-bold text-center text-slate-800 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 transition"
            />
          </div>

          <div>
            <label className="mb-1 block text-xs font-bold text-slate-700">تسمية حركة الفترة</label>
            <div className="w-full px-2.5 py-2 text-xs sm:text-sm border border-cyan-200/80 bg-cyan-50/60 rounded-xl font-bold text-cyan-950 truncate text-center">
              {movementLabel}
            </div>
          </div>
        </div>

        {/* سطر 3: زرين (تصدير Excel + PDF) */}
        <div className="grid grid-cols-2 gap-2 sm:gap-3 pt-1">
          <button
            onClick={handleExport}
            className="flex items-center justify-center gap-1.5 px-3 py-2 text-xs sm:text-sm font-bold text-white rounded-xl bg-gradient-to-r from-emerald-600 to-teal-700 hover:from-emerald-700 hover:to-teal-800 shadow-md shadow-emerald-700/20 active:scale-98 transition"
          >
            <FileSpreadsheet className="w-4 h-4" />
            <span>تصدير Excel</span>
          </button>

          <button
            onClick={handlePdf}
            className="flex items-center justify-center gap-1.5 px-3 py-2 text-xs sm:text-sm font-bold text-white rounded-xl bg-gradient-to-r from-cyan-700 to-blue-800 hover:from-cyan-800 hover:to-blue-900 shadow-md shadow-blue-800/20 active:scale-98 transition"
          >
            <FileText className="w-4 h-4" />
            <span>طباعة وتصدير PDF</span>
          </button>
        </div>

        {/* سطر 4: زرين (استيراد + تصفير) */}
        <div className="grid grid-cols-2 gap-2 sm:gap-3">
          <div className="[&>label]:w-full [&>label]:flex [&>label]:justify-center [&>label]:items-center [&>label]:py-2 [&>label]:rounded-xl [&>label]:text-xs sm:[&>label]:text-sm [&>label]:font-bold [&>label]:shadow-sm">
            <ImportButton kind="monthly" />
          </div>

          {journal.length > 0 ? (
            <button
              onClick={handleClearAllData}
              className="flex items-center justify-center gap-1.5 px-3 py-2 text-xs sm:text-sm font-bold text-rose-700 bg-rose-50 hover:bg-rose-600 hover:text-white border border-rose-200 rounded-xl transition"
              title="تصفير قيود اليومية"
            >
              <AlertOctagon className="w-4 h-4" />
              <span>تصفير الكشف</span>
            </button>
          ) : (
            <WebActionMenu
              label="خيارات إضافية"
              actions={webActions}
              className="w-full text-xs font-bold"
            />
          )}
        </div>
      </div>

      {/* ── جدول كشف الحساب الشهري الموحد ─────────────────────────────────── */}
      <div className="bg-white rounded-2xl shadow-md border border-slate-200 overflow-hidden">
        <div className="bg-gradient-to-r from-[#071326] via-[#0d2847] to-[#1a446c] p-3 text-white sm:p-4 border-b border-cyan-800/40">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-2 text-center sm:text-right">
            <div>
 <h3 className="font-black text-sm sm:text-base tracking-wide text-cyan-200">
 📑 ميزان المراجعة
 وكشف الحساب الدوري الموسع
</h3>
 <p className="text-[11px] sm:text-xs text-cyan-100/70 mt-0.5">
  آلي فوري
لكافة قيود اليومية 
المسجلة خلال عام {year}م
              </p>
            </div>
            <div className="inline-flex items-center gap-2 bg-cyan-950/60 border border-cyan-400/30 px-3 py-1 rounded-full text-xs font-mono font-bold text-cyan-300">
              الفترة: {periodLabel}
            </div>
          </div>
        </div>

        <div className="relative max-h-[72vh] overflow-auto">
<table
ref={tableRef1}
 className="min-w-max table-auto border-collapse text-xs sm:text-sm text-center font-semibold w-full"
          >
<thead className="sticky top-0 z-20 shadow-sm bg-slate-900 text-white border-b-2 border-black">
              <tr>
                <th
                  rowSpan={2}
className="border border-slate-700 bg-slate-950 text-cyan-200 font-extrabold !px-2 !py-2 !text-xs sm:!text-sm min-w-0 whitespace-normal text-center">
بيان الحسابات
(طبقاً للنظام الموحد)
                </th>
                <th
                  colSpan={2}
className="border border-slate-700 bg-slate-900 text-slate-200 font-bold !px-1.5 !py-2 !text-xs sm:!text-sm"
                >
                  الرصيد السابق في {startMonth === 1 ? `1/1/${year}` : `${year}/${startMonth}/1`}م
                </th>
                <th
                  colSpan={2}
                  className="border border-cyan-800 bg-cyan-950/90 text-cyan-300 font-bold !px-1.5 !py-2 !text-xs sm:!text-sm"
                >
                  {movementLabel}
                </th>
                <th
                  colSpan={2}
                  className="border border-slate-700 bg-slate-900 text-slate-200 font-bold !px-1.5 !py-2 !text-xs sm:!text-sm"
                >
                  الجملـــــــــة التراكمية
                </th>
                <th
                  colSpan={2}
                  className="border border-slate-700 bg-blue-950 text-blue-200 font-extrabold !px-1.5 !py-2 !text-xs sm:!text-sm"
                >
                  الرصيد الختامي في {year}/{endMonth}/{lastDayOfMonth(year, endMonth)}م
                </th>
              </tr>
              <tr className="bg-slate-800 text-[11px] sm:text-xs text-slate-300 border-b border-black">
                <th className="border border-slate-700 bg-slate-850 font-bold min-w-[90px] !py-1.5">
                  مدين
                </th>
                <th className="border border-slate-700 bg-slate-850 font-bold min-w-[90px] !py-1.5">
                  دائن
                </th>
                <th className="border border-cyan-800 bg-cyan-950 font-bold text-cyan-300 min-w-[90px] !py-1.5">
                  مدين
                </th>
                <th className="border border-cyan-800 bg-cyan-950 font-bold text-cyan-300 min-w-[90px] !py-1.5">
                  دائن
                </th>
                <th className="border border-slate-700 bg-slate-850 font-bold min-w-[90px] !py-1.5">
                  مدين
                </th>
                <th className="border border-slate-700 bg-slate-850 font-bold min-w-[90px] !py-1.5">
                  دائن
                </th>
                <th className="border border-slate-700 bg-emerald-950 text-emerald-300 font-black min-w-[90px] !py-1.5">
                  أرصدة مدينة
                </th>
                <th className="border border-slate-700 bg-rose-950 text-rose-300 font-black min-w-[90px] !py-1.5">
                  أرصدة دائنة
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {GROUPS.map((g) => {
                let gPD = 0,
                  gPC = 0,
                  gCD = 0,
                  gCC = 0;
                return (
                  <Fragment key={g.title}>
                    <tr className="bg-cyan-900/10 font-bold">
                      <td
                        colSpan={9}
                        className="border border-slate-300 text-right pr-4 text-cyan-950 font-extrabold bg-gradient-to-r from-cyan-100/60 to-transparent !py-1.5 !text-xs sm:!text-sm"
                      >
                        📁 {g.title}
                      </td>
                    </tr>
                    {g.accounts.map((a) => {
                      const r = data[norm(a)] || {
                        prevDebit: 0,
                        prevCredit: 0,
                        curDebit: 0,
                        curCredit: 0,
                      };
                      const totD = r.prevDebit + r.curDebit;
                      const totC = r.prevCredit + r.curCredit;
                      const balD = Math.max(0, totD - totC);
                      const balC = Math.max(0, totC - totD);

                      gPD += r.prevDebit;
                      gPC += r.prevCredit;
                      gCD += r.curDebit;
                      gCC += r.curCredit;

                      return (
                        <tr key={a} className="hover:bg-cyan-50/40 transition-colors even:bg-slate-50/50">
                          <td className="border border-slate-300 font-medium text-slate-800 text-right pr-3 min-w-[150px] !px-1.5 !py-1.5 !text-xs sm:!text-sm">
                            {a}
                          </td>
                          <td className="border border-slate-300 numeric-cell font-mono text-center text-slate-600 !px-1 !py-1.5">
                            {r.prevDebit ? fmt(r.prevDebit) : "—"}
                          </td>
                          <td className="border border-slate-300 numeric-cell font-mono text-center text-slate-600 !px-1 !py-1.5">
                            {r.prevCredit ? fmt(r.prevCredit) : "—"}
                          </td>
                          <td className="border border-slate-300 numeric-cell font-mono text-center font-bold text-cyan-800 bg-cyan-50/20 !px-1 !py-1.5">
                            {r.curDebit ? fmt(r.curDebit) : "—"}
                          </td>
                          <td className="border border-slate-300 numeric-cell font-mono text-center font-bold text-rose-800 bg-rose-50/20 !px-1 !py-1.5">
                            {r.curCredit ? fmt(r.curCredit) : "—"}
                          </td>
                          <td className="border border-slate-300 numeric-cell font-mono text-center text-slate-800 font-bold !px-1 !py-1.5">
                            {totD ? fmt(totD) : "—"}
                          </td>
                          <td className="border border-slate-300 numeric-cell font-mono text-center text-slate-800 font-bold !px-1 !py-1.5">
                            {totC ? fmt(totC) : "—"}
                          </td>
                          <td className="border border-slate-300 numeric-cell font-mono text-center text-emerald-700 font-black bg-emerald-50/30 !px-1 !py-1.5">
                            {balD ? fmt(balD) : "—"}
                          </td>
                          <td className="border border-slate-300 numeric-cell font-mono text-center text-rose-700 font-black bg-rose-50/30 !px-1 !py-1.5">
                            {balC ? fmt(balC) : "—"}
                          </td>
                        </tr>
                      );
                    })}
                    <tr className="bg-slate-100 font-bold text-slate-900 border-b-2 border-slate-300">
                      <td className="border border-slate-300 text-right pr-3 text-slate-800 font-black !py-1.5 !text-xs sm:!text-sm">
                        مجموع بند: {g.title}
                      </td>
                      <td className="border border-slate-300 numeric-cell font-mono text-center text-slate-700 bg-slate-200/40 !py-1.5">
                        {fmt(gPD)}
                      </td>
                      <td className="border border-slate-300 numeric-cell font-mono text-center text-slate-700 bg-slate-200/40 !py-1.5">
                        {fmt(gPC)}
                      </td>
                      <td className="border border-slate-300 numeric-cell font-mono text-center text-cyan-900 font-black bg-cyan-100/50 !py-1.5">
                        {fmt(gCD)}
                      </td>
                      <td className="border border-slate-300 numeric-cell font-mono text-center text-rose-900 font-black bg-rose-100/50 !py-1.5">
                        {fmt(gCC)}
                      </td>
                      <td className="border border-slate-300 numeric-cell font-mono text-center text-slate-900 font-black !py-1.5">
                        {fmt(gPD + gCD)}
                      </td>
                      <td className="border border-slate-300 numeric-cell font-mono text-center text-slate-900 font-black !py-1.5">
                        {fmt(gPC + gCC)}
                      </td>
                      <td className="border border-slate-300 numeric-cell font-mono text-center text-emerald-800 bg-emerald-100/40 font-black !py-1.5">
                        {fmt(Math.max(0, gPD + gCD - (gPC + gCC)))}
                      </td>
                      <td className="border border-slate-300 numeric-cell font-mono text-center text-rose-800 bg-rose-100/40 font-black !py-1.5">
                        {fmt(Math.max(0, gPC + gCC - (gPD + gCD)))}
                      </td>
                    </tr>
                  </Fragment>
                );
              })}

              {/* ── الإجمالي العام ── */}
              <tr className="bg-[#071326] text-white font-extrabold text-xs sm:text-sm border-t-2 border-black">
                <td className="border border-slate-700 text-center bg-black font-black text-cyan-300 !py-2.5">
                  الإجمالي العام النهائي للحسابات الكلية
                </td>
                <td className="border border-slate-700 numeric-cell font-mono text-center text-slate-200 !py-2">
                  {fmt(totals.prevDebit)}
                </td>
                <td className="border border-slate-700 numeric-cell font-mono text-center text-slate-200 !py-2">
                  {fmt(totals.prevCredit)}
                </td>
                <td className="border border-slate-700 numeric-cell font-mono text-center text-cyan-300 bg-slate-900 font-black !py-2">
                  {fmt(totals.curDebit)}
                </td>
                <td className="border border-slate-700 numeric-cell font-mono text-center text-rose-300 bg-slate-900 font-black !py-2">
                  {fmt(totals.curCredit)}
                </td>
                <td className="border border-slate-700 numeric-cell font-mono text-center text-white !py-2">
                  {fmt(totals.prevDebit + totals.curDebit)}
                </td>
                <td className="border border-slate-700 numeric-cell font-mono text-center text-white !py-2">
                  {fmt(totals.prevCredit + totals.curCredit)}
                </td>
                <td className="border border-slate-700 numeric-cell font-mono text-center text-emerald-300 bg-emerald-950/70 font-black !py-2">
                  {fmt(
                    Math.max(
                      0,
                      totals.prevDebit + totals.curDebit - (totals.prevCredit + totals.curCredit),
                    ),
                  )}
                </td>
                <td className="border border-slate-700 numeric-cell font-mono text-center text-rose-300 bg-rose-950/70 font-black !py-2">
                  {fmt(
                    Math.max(
                      0,
                      totals.prevCredit + totals.curCredit - (totals.prevDebit + totals.curDebit),
                    ),
                  )}
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
      </div>
  );
}
