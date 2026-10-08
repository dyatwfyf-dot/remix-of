import { useMemo, useState } from "react";
import { BarChart3, CalendarDays, FileText } from "lucide-react";
import { useStore } from "@/lib/store";
import TabActions, { type TabCol } from "./TabActions";
import revenueSchema from "@/data/revenueTemplate.json";

type ReportSource = "hafiza" | "account" | "expenses" | "revenue" | "combined";
type PeriodType = "month" | "quarter" | "half" | "year";
type ReportRow = Record<string, string | number>;

const MONTHS = ["يناير", "فبراير", "مارس", "أبريل", "مايو", "يونيو", "يوليو", "أغسطس", "سبتمبر", "أكتوبر", "نوفمبر", "ديسمبر"];
const PERIODS: { value: PeriodType; label: string }[] = [
  { value: "month", label: "شهري" }, { value: "quarter", label: "ربع سنوي" },
  { value: "half", label: "نصف سنوي" }, { value: "year", label: "سنوي" },
];
const SOURCES: { value: ReportSource; label: string }[] = [
  { value: "combined", label: "تقرير مجمّع لكل التبويبات" },
  { value: "hafiza", label: "حوافظ التوريد" },
  { value: "account", label: "الحساب الجاري" },
  { value: "expenses", label: "المصروفات" },
  { value: "revenue", label: "الإيرادات" },
];

const normalizeDate = (value: unknown): Date | null => {
  if (!value) return null;
  const date = new Date(String(value));
  return Number.isNaN(date.getTime()) ? null : date;
};
const periodMonths = (period: PeriodType, month: number) => {
  if (period === "month") return [month];
  if (period === "quarter") return [Math.floor(month / 3) * 3, Math.floor(month / 3) * 3 + 1, Math.floor(month / 3) * 3 + 2];
  if (period === "half") return month < 6 ? [0, 1, 2, 3, 4, 5] : [6, 7, 8, 9, 10, 11];
  return Array.from({ length: 12 }, (_, index) => index);
};
const periodLabel = (period: PeriodType, month: number) => {
  if (period === "month") return `شهر ${MONTHS[month]}`;
  if (period === "quarter") return `الربع ${Math.floor(month / 3) + 1}`;
  if (period === "half") return month < 6 ? "النصف الأول" : "النصف الثاني";
  return "السنة المالية";
};
const getYearOptions = (values: unknown[]) => {
  const years = new Set<number>([2025, 2026]);
  values.forEach((value) => { const date = normalizeDate(value); if (date) years.add(date.getFullYear()); });
  return Array.from(years).sort((a, b) => b - a);
};

const revenueItemNames = (() => {
  const names = new Map<string, string>();
  const schema = revenueSchema as any;
  (schema.chapters || []).forEach((chapter: any) => (chapter.sections || []).forEach((section: any) => (section.items || []).forEach((item: any) => (item.types || []).forEach((type: any) => {
    names.set(`${chapter.no}-${section.no}-${item.no}-${type.no}`, type.title);
    names.set(String(type.no), type.title);
  }))));
  return names;
})();
const revenueName = (key: string) => {
  const itemKey = key.split("-").slice(2).join("-");
  return revenueItemNames.get(itemKey) || revenueItemNames.get(itemKey.split("-").at(-1) || "") || itemKey || "—";
};

export default function ReportsTab() {
  const hafiza = useStore((state) => state.hafiza);
  const accounts = useStore((state) => state.accounts);
  const revenue = useStore((state) => state.revenue);
  const [source, setSource] = useState<ReportSource>("combined");
  const [period, setPeriod] = useState<PeriodType>("month");
  const [year, setYear] = useState(2026);
  const [month, setMonth] = useState(0);
  const selectedMonths = useMemo(() => periodMonths(period, month), [period, month]);
  const selectedMonthSet = useMemo(() => new Set(selectedMonths), [selectedMonths]);
  const years = useMemo(() => getYearOptions([...hafiza.map((row) => row.date), ...accounts.map((row) => row.date)]), [hafiza, accounts]);

  const inPeriod = (dateValue: unknown) => {
    const date = normalizeDate(dateValue);
    return date?.getFullYear() === year && selectedMonthSet.has(date.getMonth());
  };

  const hafizaRows = useMemo<ReportRow[]>(() => hafiza.filter((row) => inPeriod(row.date)).map((row) => ({
    date: row.date, description: row.description || "—", name: row.name || "—",
    hafizaNo: row.hafizaNo || "—", amount: Number(row.hafizaAmount) || 0, income: Number(row.income ?? row.notifyAmount) || 0,
  })), [hafiza, year, selectedMonthSet]);

  const accountRows = useMemo<ReportRow[]>(() => accounts.filter((row) => inPeriod(row.date)).sort((a, b) => String(a.date).localeCompare(String(b.date))).map((row) => ({
    date: row.date, description: row.description || "—", name: row.name || "—", income: Number(row.income) || 0, expense: Number(row.expense) || 0,
  })), [accounts, year, selectedMonthSet]);

  const expenseRows = useMemo<ReportRow[]>(() => accountRows.filter((row) => Number(row.expense) > 0).map((row) => ({
    date: row.date, item: row.description, name: row.name, expense: Number(row.expense) || 0,
  })), [accountRows]);

  const revenueRows = useMemo<ReportRow[]>(() => Object.entries(revenue).map(([key, amount]) => {
    const parts = key.split("-");
    const rowYear = Number(parts[0]);
    const rowMonth = Number(parts[1]) - 1;
    return { date: `${MONTHS[rowMonth] || parts[1]} ${rowYear}`, item: revenueName(key), amount: Number(amount) || 0, _year: rowYear, _month: rowMonth };
  }).filter((row) => row._year === year && selectedMonthSet.has(row._month as number)).map(({ _year, _month, ...row }) => row), [revenue, year, selectedMonthSet]);

const sourceConfig = useMemo(() => {
if (source === "hafiza") return { title: "تقرير حوافظ التوريد", columns: [{ key: "date", label: "التاريخ" }, { key: "hafizaNo", label: "رقم الحافظة" }, { key: "description", label: "البيان" }, { key: "name", label: "الاسم" }, { key: "amount", label: "المبلغ" }, { key: "income", label: "الإيرادات" }] satisfies TabCol[] };
    if (source === "account") return { title: "تقرير الحساب الجاري", columns: [{ key: "date", label: "التاريخ" }, { key: "description", label: "البيان" }, { key: "name", label: "الاسم" }, { key: "income", label: "الإيرادات" }, { key: "expense", label: "المصروفات" }] satisfies TabCol[]};

if (source === "expenses") return { title: "تقرير المصروفات", columns: [{ key: "date", label: "التاريخ" }, { key: "item", label: "بند المصروف" }, { key: "name", label: "الاسم" }, { key: "expense", label: "المبلغ" }] satisfies TabCol[] };
if (source === "revenue") 
return { title: "تقرير الإيرادات", columns: [{ key: "date", label: "الشهر" }, { key: "item", label: "اسم بند الإيراد" }, { key: "amount", label: "المبلغ" }] satisfies TabCol[] };
    return { title: "تقرير مالي مجمّع", columns: [{ key: "source", label: "المصدر" }, { key: "date", label: "التاريخ / الفترة" }, { key: "description", label: "البيان / البند" }, { key: "income", label: "الإيرادات" }, { key: "expense", label: "المصروفات" }, { key: "amount", label: "المبلغ" }] satisfies TabCol[] };
  }, [source]);

  const reportRows = useMemo<ReportRow[]>(() => {
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
  }, [source, hafizaRows, accountRows, expenseRows, revenueRows]);

  const title = `${sourceConfig.title} — ${periodLabel(period, month)} ${year}`;
  const numericKeys = source === "hafiza" ? ["amount", "income"] : source === "account" ? ["income", "expense"] : source === "expenses" ? ["expense"] : source === "revenue" ? ["amount"] : ["income", "expense", "amount"];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-100 via-sky-50 to-indigo-50 p-2 sm:p-4" dir="rtl">
      <section className="mx-auto max-w-7xl overflow-hidden rounded-3xl border border-sky-200 bg-white shadow-xl">
        <header className="bg-gradient-to-l from-[#2e6b8a] via-[#3d7fa0] to-[#2e6b8a] p-4 text-white sm:p-6"><div className="flex items-center gap-3"><span className="grid h-12 w-12 place-items-center rounded-2xl bg-white/15"><BarChart3 className="h-6 w-6" /></span><div><h1 className="text-xl font-black sm:text-2xl">التقارير</h1><p className="text-xs font-semibold text-sky-100 sm:text-sm">تقارير دورية منفردة أو مجمّعة قابلة للطباعة والتنزيل بصيغة PDF</p></div></div></header>
        <div className="grid gap-3 border-b border-slate-200 bg-slate-50 p-3 sm:grid-cols-4 sm:p-4">
          <label className="flex flex-col gap-1 text-xs font-black text-slate-700">مصدر التقرير<select value={source} onChange={(event) => setSource(event.target.value as ReportSource)} className="rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm font-bold outline-none focus:border-sky-600">{SOURCES.map((item) => <option key={item.value} value={item.value}>{item.label}</option>)}</select></label>
          <label className="flex flex-col gap-1 text-xs font-black text-slate-700">نوع الفترة<select value={period} onChange={(event) => setPeriod(event.target.value as PeriodType)} className="rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm font-bold outline-none focus:border-sky-600">{PERIODS.map((item) => <option key={item.value} value={item.value}>{item.label}</option>)}</select></label>
          <label className="flex flex-col gap-1 text-xs font-black text-slate-700">السنة<select value={year} onChange={(event) => setYear(Number(event.target.value))} className="rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm font-bold outline-none focus:border-sky-600">{years.map((item) => <option key={item} value={item}>{item}</option>)}</select></label>
          <label className={`flex flex-col gap-1 text-xs font-black text-slate-700 ${period === "year" ? "opacity-50" : ""}`}>الشهر / بداية الفترة<select disabled={period === "year"} value={month} onChange={(event) => setMonth(Number(event.target.value))} className="rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm font-bold outline-none focus:border-sky-600 disabled:cursor-not-allowed">{MONTHS.map((item, index) => <option key={item} value={index}>{item}</option>)}</select></label>
        </div>
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 p-3 sm:p-4"><div className="flex items-center gap-2 text-sm font-black text-slate-800"><CalendarDays className="h-5 w-5 text-sky-700" /><span>{title}</span><span className="rounded-full bg-sky-100 px-2 py-1 text-xs text-sky-800">{reportRows.length} سجل</span></div><TabActions title={title} rows={reportRows} columns={sourceConfig.columns} fileName={`تقرير-${source}-${year}-${period}`} numericKeys={numericKeys} pdfLayout="wide-centered" pdfOrientation="landscape" className="w-full sm:w-auto" /></div>
        <div className="overflow-x-auto p-3 sm:p-4">{reportRows.length === 0 ? <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-10 text-center text-sm font-bold text-slate-500"><FileText className="mx-auto mb-2 h-8 w-8 text-slate-400" />لا توجد بيانات في الفترة المحددة لهذا المصدر.</div> : <table className="w-full min-w-[760px] border-collapse overflow-hidden rounded-2xl text-center text-xs sm:text-sm"><thead className="bg-sky-900 text-white"><tr><th className="border border-sky-700 px-2 py-2">م</th>{sourceConfig.columns.map((column) => <th key={column.key} className="border border-sky-700 px-2 py-2">{column.label}</th>)}</tr></thead><tbody>{reportRows.map((row, index) => <tr key={`${String(row.date)}-${index}`} className={index % 2 ? "bg-slate-50" : "bg-white"}><td className="border border-slate-200 px-2 py-2 font-bold">{index + 1}</td>{sourceConfig.columns.map((column) => <td key={column.key} className="border border-slate-200 px-2 py-2 font-semibold">{row[column.key] ?? "—"}</td>)}</tr>)}</tbody></table>}</div>
      </section>
    </div>
  );
}
