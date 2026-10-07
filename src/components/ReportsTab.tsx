import { useMemo, useState } from "react";
import { BarChart3, CalendarDays, FileText } from "lucide-react";
import { useStore } from "@/lib/store";
import TabActions, { type TabCol } from "./TabActions";

type ReportSource = "hafiza" | "account" | "journal" | "revenue";
type PeriodType = "month" | "quarter" | "half" | "year";

type ReportRow = Record<string, string | number>;

const MONTHS = [
  "يناير",
  "فبراير",
  "مارس",
  "أبريل",
  "مايو",
  "يونيو",
  "يوليو",
  "أغسطس",
  "سبتمبر",
  "أكتوبر",
  "نوفمبر",
  "ديسمبر",
];

const PERIODS: { value: PeriodType; label: string }[] = [
  { value: "month", label: "شهري" },
  { value: "quarter", label: "ربع سنوي" },
  { value: "half", label: "نصف سنوي" },
  { value: "year", label: "سنوي" },
];

const SOURCES: { value: ReportSource; label: string }[] = [
  { value: "hafiza", label: "حوافظ التوريد" },
  { value: "account", label: "الحساب الجاري" },
  { value: "journal", label: "القيود اليومية" },
  { value: "revenue", label: "الإيرادات" },
];

const normalizeDate = (value: unknown): Date | null => {
  if (!value) return null;
  const date = new Date(String(value));
  return Number.isNaN(date.getTime()) ? null : date;
};

const periodMonths = (period: PeriodType, month: number): number[] => {
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
  values.forEach((value) => {
    const date = normalizeDate(value);
    if (date) years.add(date.getFullYear());
  });
  return Array.from(years).sort((a, b) => b - a);
};

export default function ReportsTab() {
  const hafiza = useStore((state) => state.hafiza);
  const accounts = useStore((state) => state.accounts);
  const journal = useStore((state) => state.journal);
  const revenue = useStore((state) => state.revenue);
  const [source, setSource] = useState<ReportSource>("account");
  const [period, setPeriod] = useState<PeriodType>("month");
  const [year, setYear] = useState(2026);
  const [month, setMonth] = useState(0);

  const years = useMemo(
    () =>
      getYearOptions([
        ...hafiza.map((row) => row.date),
        ...accounts.map((row) => row.date),
        ...journal.map((row) => row.date),
      ]),
    [hafiza, accounts, journal],
  );

  const selectedMonths = useMemo(() => periodMonths(period, month), [period, month]);
  const selectedMonthSet = useMemo(() => new Set(selectedMonths), [selectedMonths]);

  const sourceConfig = useMemo(() => {
    if (source === "hafiza") {
      return {
        title: "تقرير حوافظ التوريد",
        columns: [
          { key: "date", label: "التاريخ" },
          { key: "hafizaNo", label: "رقم الحافظة" },
          { key: "notifyNo", label: "رقم الإشعار" },
          { key: "description", label: "البيان" },
          { key: "name", label: "الاسم" },
          { key: "hafizaAmount", label: "مبلغ الحافظة" },
          { key: "income", label: "الإيرادات" },
        ] satisfies TabCol[],
      };
    }
    if (source === "account") {
      return {
        title: "تقرير الحساب الجاري",
        columns: [
          { key: "date", label: "التاريخ" },
          { key: "description", label: "البيان" },
          { key: "name", label: "الاسم" },
          { key: "income", label: "الإيرادات" },
          { key: "expense", label: "المصروفات" },
          { key: "balance", label: "الرصيد" },
        ] satisfies TabCol[],
      };
    }
    if (source === "journal") {
      return {
        title: "تقرير القيود اليومية",
        columns: [
          { key: "date", label: "التاريخ" },
          { key: "formNo", label: "رقم الاستمارة" },
          { key: "description", label: "البيان" },
          { key: "debitAccount", label: "الحساب المدين" },
          { key: "creditAccount", label: "الحساب الدائن" },
          { key: "debit", label: "مدين" },
          { key: "credit", label: "دائن" },
        ] satisfies TabCol[],
      };
    }
    return {
      title: "تقرير الإيرادات",
      columns: [
        { key: "date", label: "الشهر" },
        { key: "item", label: "البند" },
        { key: "amount", label: "المبلغ" },
      ] satisfies TabCol[],
    };
  }, [source]);

  const reportRows = useMemo<ReportRow[]>(() => {
    if (source === "revenue") {
      return Object.entries(revenue)
        .map(([key, amount]) => {
          const [rowYear, rowMonth, ...itemParts] = key.split("-");
          const rowMonthIndex = Number(rowMonth) - 1;
          return {
            date: `${MONTHS[rowMonthIndex] || rowMonth} ${rowYear}`,
            item: itemParts.join("-"),
            amount: Number(amount) || 0,
            _year: Number(rowYear),
            _month: rowMonthIndex,
          };
        })
        .filter((row) => row._year === year && selectedMonthSet.has(row._month as number))
        .map(({ _year, _month, ...row }) => row);
    }

    if (source === "hafiza") {
      return hafiza
        .filter((row) => {
          const date = normalizeDate(row.date);
          return date?.getFullYear() === year && selectedMonthSet.has(date.getMonth());
        })
        .map((row) => ({
          date: row.date,
          hafizaNo: row.hafizaNo || "—",
          notifyNo: row.notifyNo || "—",
          description: row.description || "—",
          name: row.name || "—",
          hafizaAmount: Number(row.hafizaAmount) || 0,
          income: Number(row.income ?? row.notifyAmount) || 0,
        }));
    }

    if (source === "account") {
      let balance = 0;
      return accounts
        .filter((row) => {
          const date = normalizeDate(row.date);
          return date?.getFullYear() === year && selectedMonthSet.has(date.getMonth());
        })
        .sort((a, b) => String(a.date).localeCompare(String(b.date)))
        .map((row) => {
          balance += (Number(row.income) || 0) - (Number(row.expense) || 0);
          return {
            date: row.date,
            description: row.description || "—",
            name: row.name || "—",
            income: Number(row.income) || 0,
            expense: Number(row.expense) || 0,
            balance,
          };
        });
    }

    return journal
      .filter((row) => {
        const date = normalizeDate(row.date);
        return date?.getFullYear() === year && selectedMonthSet.has(date.getMonth());
      })
      .map((row) => ({
        date: row.date,
        formNo: row.formNo || "—",
        description: row.description || "—",
        debitAccount: row.debitAccount || row.account || "—",
        creditAccount: row.creditAccount || "—",
        debit: Number(row.debit) || 0,
        credit: Number(row.credit) || 0,
      }));
  }, [source, revenue, hafiza, accounts, journal, year, selectedMonthSet]);

  const title = `${sourceConfig.title} — ${periodLabel(period, month)} ${year}`;
  const numericKeys = source === "hafiza"
    ? ["hafizaAmount", "income"]
    : source === "account"
      ? ["income", "expense", "balance"]
      : source === "journal"
        ? ["debit", "credit"]
        : ["amount"];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-100 via-sky-50 to-indigo-50 p-2 sm:p-4" dir="rtl">
      <section className="mx-auto max-w-7xl overflow-hidden rounded-3xl border border-sky-200 bg-white shadow-xl">
        <header className="bg-gradient-to-l from-[#2e6b8a] via-[#3d7fa0] to-[#2e6b8a] p-4 text-white sm:p-6">
          <div className="flex items-center gap-3">
            <span className="grid h-12 w-12 place-items-center rounded-2xl bg-white/15">
              <BarChart3 className="h-6 w-6" />
            </span>
            <div>
              <h1 className="text-xl font-black sm:text-2xl">التقارير</h1>
              <p className="text-xs font-semibold text-sky-100 sm:text-sm">تقارير مالية دورية قابلة للطباعة والتنزيل بصيغة PDF</p>
            </div>
          </div>
        </header>

        <div className="grid gap-3 border-b border-slate-200 bg-slate-50 p-3 sm:grid-cols-4 sm:p-4">
          <label className="flex flex-col gap-1 text-xs font-black text-slate-700">
            مصدر التقرير
            <select value={source} onChange={(event) => setSource(event.target.value as ReportSource)} className="rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm font-bold outline-none focus:border-sky-600">
              {SOURCES.map((item) => <option key={item.value} value={item.value}>{item.label}</option>)}
            </select>
          </label>
          <label className="flex flex-col gap-1 text-xs font-black text-slate-700">
            نوع الفترة
            <select value={period} onChange={(event) => setPeriod(event.target.value as PeriodType)} className="rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm font-bold outline-none focus:border-sky-600">
              {PERIODS.map((item) => <option key={item.value} value={item.value}>{item.label}</option>)}
            </select>
          </label>
          <label className="flex flex-col gap-1 text-xs font-black text-slate-700">
            السنة
            <select value={year} onChange={(event) => setYear(Number(event.target.value))} className="rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm font-bold outline-none focus:border-sky-600">
              {years.map((item) => <option key={item} value={item}>{item}</option>)}
            </select>
          </label>
          <label className={`flex flex-col gap-1 text-xs font-black text-slate-700 ${period === "year" ? "opacity-50" : ""}`}>
            الشهر / بداية الفترة
            <select disabled={period === "year"} value={month} onChange={(event) => setMonth(Number(event.target.value))} className="rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm font-bold outline-none focus:border-sky-600 disabled:cursor-not-allowed">
              {MONTHS.map((item, index) => <option key={item} value={index}>{item}</option>)}
            </select>
          </label>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 p-3 sm:p-4">
          <div className="flex items-center gap-2 text-sm font-black text-slate-800">
            <CalendarDays className="h-5 w-5 text-sky-700" />
            <span>{title}</span>
            <span className="rounded-full bg-sky-100 px-2 py-1 text-xs text-sky-800">{reportRows.length} سجل</span>
          </div>
          <TabActions
            title={title}
            rows={reportRows}
            columns={sourceConfig.columns}
            fileName={`تقرير-${source}-${year}-${period}`}
            numericKeys={numericKeys}
            pdfLayout="wide-centered"
            pdfOrientation="landscape"
            className="w-full sm:w-auto"
          />
        </div>

        <div className="overflow-x-auto p-3 sm:p-4">
          {reportRows.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-10 text-center text-sm font-bold text-slate-500">
              <FileText className="mx-auto mb-2 h-8 w-8 text-slate-400" />
              لا توجد بيانات في الفترة المحددة لهذا المصدر.
            </div>
          ) : (
            <table className="w-full min-w-[760px] border-collapse overflow-hidden rounded-2xl text-center text-xs sm:text-sm">
              <thead className="bg-sky-900 text-white">
                <tr>
                  <th className="border border-sky-700 px-2 py-2">م</th>
                  {sourceConfig.columns.map((column) => <th key={column.key} className="border border-sky-700 px-2 py-2">{column.label}</th>)}
                </tr>
              </thead>
              <tbody>
                {reportRows.map((row, index) => (
                  <tr key={`${String(row.date)}-${index}`} className={index % 2 ? "bg-slate-50" : "bg-white"}>
                    <td className="border border-slate-200 px-2 py-2 font-bold">{index + 1}</td>
                    {sourceConfig.columns.map((column) => <td key={column.key} className="border border-slate-200 px-2 py-2 font-semibold">{row[column.key] ?? "—"}</td>)}
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </section>
    </div>
  );
}
