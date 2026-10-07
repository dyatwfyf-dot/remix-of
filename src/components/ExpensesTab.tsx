import React, { useMemo, useState, useEffect } from "react";
import {
  addReportHeader,
  appendRows,
  createExcelWorkbook,
  downloadWorkbook,
  formatWorksheet,
  getExcelPalette,
  loadReportLetterhead,
} from "@/lib/excelExport";
import { toast } from "sonner";
import schemaJson from "@/lib/expensesSchema.json";
import { useReportDate } from "@/lib/reportDate";
import { escapeHtml, reportLetterheadHtml, runningLetterheadCss } from "@/lib/printTableHtml";
import { printReportHtml } from "@/lib/nativePrinter";
import WebActionMenu, { type WebActionItem } from "./WebActionMenu";
import { useStore } from "@/lib/store";

// ====== نوع الصف ======
type Row = {
  n: string;
  b: number | "";
  c: number | "";
  d: number | "";
  e: number | "";
  lv: "header" | "bab" | "fasl" | "band" | "type" | "sub";
};
const schema = schemaJson as { rows: Row[]; totals: string[] };

// ====== أسماء الأشهر ======
const MONTHS = [
  "يناير",
  "فبراير",
  "مارس",
  "ابريل",
  "مايو",
  "يونيو",
  "يوليو",
  "اغسطس",
  "سبتمبر",
  "اكتوبر",
  "نوفمبر",
  "ديسمبر",
];
const QUARTERS = [
  { key: "p1", label: "المدة الأولى", months: [0, 1, 2] },
  { key: "p2", label: "المدة الثانية", months: [3, 4, 5] },
  { key: "p3", label: "المدة الثالثة", months: [6, 7, 8] },
  { key: "p4", label: "المدة الرابعة", months: [9, 10, 11] },
];

const YEAR_DEFAULT = 2026;
const STORAGE_KEY = "expenses-data-v1";

type Cell = { f: number; r: number };
type Store = Record<string, Cell>;
const emptyCell: Cell = { f: 0, r: 0 };

function loadStore(): Store {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) || "{}");
  } catch {
    return {};
  }
}
function saveStore(s: Store) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(s));
}

const isLeaf = (r: Row) => r.lv === "type";

function htmlTableToMatrix(table: HTMLTableElement): string[][] {
  const grid: string[][] = [];

  Array.from(table.rows).forEach((row, rowIndex) => {
    if (!grid[rowIndex]) grid[rowIndex] = [];
    let columnIndex = 0;

    Array.from(row.cells).forEach((cell) => {
      while (grid[rowIndex][columnIndex] !== undefined) columnIndex += 1;

      const rowSpan = Math.max(1, cell.rowSpan || 1);
      const columnSpan = Math.max(1, cell.colSpan || 1);
      const value = cell.textContent?.replace(/\s+/g, " ").trim() || "";

      for (let rowOffset = 0; rowOffset < rowSpan; rowOffset += 1) {
        const targetRowIndex = rowIndex + rowOffset;
        if (!grid[targetRowIndex]) grid[targetRowIndex] = [];
        for (let columnOffset = 0; columnOffset < columnSpan; columnOffset += 1) {
          const targetColumnIndex = columnIndex + columnOffset;
          grid[targetRowIndex][targetColumnIndex] =
            rowOffset === 0 && columnOffset === 0 ? value : "";
        }
      }

      columnIndex += columnSpan;
    });
  });

  const columnCount = Math.max(1, ...grid.map((row) => row.length));
  return grid.map((row) =>
    Array.from({ length: columnCount }, (_, index) => row[index] ?? ""),
  );
}

// ===== حساب التجميعات =====
function computeAggregates(values: Cell[]): Cell[] {
  const rows = schema.rows;
  const out = values.map((v) => ({ ...v }));
  const rank: Record<string, number> = { header: 0, bab: 1, fasl: 2, band: 3, type: 4, sub: 5 };
  for (let i = rows.length - 1; i >= 0; i--) {
    const r = rows[i];
    if (isLeaf(r) || r.lv === "sub") continue;
    let sf = 0,
      sr = 0;
    const my = rank[r.lv];
    for (let j = i + 1; j < rows.length; j++) {
      if (rank[rows[j].lv] <= my) break;
      if (isLeaf(rows[j])) {
        sf += out[j].f;
        sr += out[j].r;
      }
    }
    sr += Math.floor(sf / 100);
    sf = sf % 100;
    out[i] = { f: sf, r: sr };
  }
  return out;
}

// ===== مجاميع الأبواب =====
interface BabTotal {
  label: string;
  babNum: number | null;
  cur: Cell;
  prev: Cell;
  total: Cell;
}

function addTwo(a: Cell, b: Cell): Cell {
  let f = a.f + b.f,
    r = a.r + b.r;
  r += Math.floor(f / 100);
  f = f % 100;
  return { f, r };
}

function computeBabTotals(cur: Cell[], prev: Cell[]): BabTotal[] {
  const rows = schema.rows;
  const babMap = new Map<number, { label: string; indices: number[] }>();
  let cb: number | null = null;
  for (let i = 0; i < rows.length; i++) {
    const r = rows[i];
    if (r.lv === "bab" && typeof r.b === "number") {
      cb = r.b;
      if (!babMap.has(cb)) babMap.set(cb, { label: r.n, indices: [] });
    }
    if (r.lv === "type" && cb !== null) babMap.get(cb)!.indices.push(i);
  }
  const sum = (idxs: number[], vals: Cell[]): Cell => {
    let f = 0,
      r = 0;
    idxs.forEach((i) => {
      f += vals[i].f;
      r += vals[i].r;
    });
    r += Math.floor(f / 100);
    f = f % 100;
    return { f, r };
  };
  const labels: Record<number, string> = {
    1: "جملة الباب الأول : أجور وتعويضات العاملين",
    2: "جملة الباب الثاني : نفقات على السلع والخدمات والممتلكات",
  };
  const result: BabTotal[] = [];
  let gc: Cell = emptyCell,
    gp: Cell = emptyCell;
  babMap.forEach((val, bn) => {
    const c = sum(val.indices, cur);
    const p = sum(val.indices, prev);
    gc = addTwo(gc, c);
    gp = addTwo(gp, p);
    result.push({
      label: labels[bn] || val.label,
      babNum: bn,
      cur: c,
      prev: p,
      total: addTwo(c, p),
    });
  });
  result.push({
    label: "الاجمالي العام للاستخدامات",
    babNum: null,
    cur: gc,
    prev: gp,
    total: addTwo(gc, gp),
  });
  return result;
}

// ===== ألوان الصفوف =====
const rowClass = (r: Row) => {
  if (r.lv === "bab") {
    switch (r.b) {
      case 1:
        return "bg-emerald-200 text-emerald-900 font-bold bab-1";
      case 2:
        return "bg-blue-200 text-blue-900 font-bold bab-2";
      case 3:
        return "bg-fuchsia-200 text-fuchsia-900 font-bold bab-3";
      case 4:
        return "bg-orange-200 text-orange-900 font-bold bab-4";
      case 5:
        return "bg-rose-200 text-rose-900 font-bold bab-5";
      default:
        return "bg-emerald-100 text-emerald-900 font-bold bab-default";
    }
  }

  switch (r.lv) {
    case "header":
      return "bg-sky-700 text-white font-bold";
    case "fasl":
      return "bg-sky-100 text-amber-900 font-semibold";
    case "band":
      return "bg-sky-50 text-slate-800 font-medium";
    case "type":
      return "bg-white text-slate-700";
    default:
      return "bg-slate-50 text-slate-600 italic";
  }
};

const getBabSummaryColor = (bn: number | null) => {
  if (bn === null) return "bg-sky-700 text-white font-bold";
  switch (bn) {
    case 1: return "bg-emerald-200 text-emerald-900 font-semibold bab-1";
    case 2: return "bg-blue-200 text-blue-900 font-semibold bab-2";
    case 3: return "bg-fuchsia-200 text-fuchsia-900 font-semibold bab-3";
    case 4: return "bg-orange-200 text-orange-900 font-semibold bab-4";
    case 5: return "bg-rose-200 text-rose-900 font-semibold bab-5";
    default: return "bg-emerald-100 text-emerald-900 font-semibold bab-default";
  }
};

const fmt = (n: number) => (n === 0 ? "0" : n.toLocaleString("en-US"));

const CUR_H = "bg-amber-300 text-amber-900"; 
const CUR_C = "bg-sky-50"; 
const PREV_H = "bg-sky-300 text-sky-900"; 
const PREV_C = "bg-sky-50"; 
const TOT_H = "bg-emerald-200 text-black-900"; 
const TOT_C = "bg-emerald-50"; 

const TH = ({
  children,
  cls = "",
  rowSpan = 1,
  colSpan = 1,
}: {
  children: React.ReactNode;
  cls?: string;
  rowSpan?: number;
  colSpan?: number;
}) => (
  <th
    rowSpan={rowSpan}
    colSpan={colSpan}
    className={`border border-black px-1 sm:px-2 py-1 whitespace-normal break-words text-center align-middle text-sm sm:text-base font-bold ${cls}`}
  >
    {children}
  </th>
);

const TD = ({
  children,
  cls = "",
  right = false,
}: {
  children: React.ReactNode;
  cls?: string;
  right?: boolean;
}) => (
  <td
    className={`border border-black px-1 sm:px-2 py-1 whitespace-nowrap align-middle numeric-cell font-mono text-sm sm:text-base ${right ? "text-right" : "text-center"} ${cls}`}
  >
    {children}
  </td>
);

// ============================================================
export default function ExpensesTab() {
  const [store, setStore] = useState<Store>(() => loadStore());
  const accounts = useStore((s) => s.accounts); // قراءة الحركات من الحساب الجاري
  const { reportDate, reportDateLabel } = useReportDate();
  const [year] = useState<number>(YEAR_DEFAULT);
  const [view, setView] = useState<string>("cover");

  useEffect(() => {
    saveStore(store);
  }, [store]);

  // دمج المبالغ المدخلة يدوياً مع المبالغ المرحلة تلقائياً من الحساب الجاري
  const monthlyLeaves: Cell[][] = useMemo(
    () =>
      MONTHS.map((_, m) =>
        schema.rows.map((_, idx) => {
          const manual = store[`${year}-${m}-${idx}`] || emptyCell;
          let autoR = 0;
          let autoF = 0;

          accounts.forEach((acc) => {
            if (acc.expenseIndex === idx && Number(acc.expense) > 0) {
              const dateStr = acc.checkDate || acc.notifyDate || acc.date;
              const d = new Date(dateStr);
              const accYear = isNaN(d.getFullYear()) ? 2026 : d.getFullYear();
              const accMonth = isNaN(d.getMonth()) ? 0 : d.getMonth();

              if (accYear === year && accMonth === m) {
                const val = Number(acc.expense);
                const r = Math.floor(val);
                const f = Math.round((val - r) * 100);
                autoR += r;
                autoF += f;
              }
            }
          });

          const totalF = manual.f + autoF;
          const totalR = manual.r + autoR + Math.floor(totalF / 100);

          return {
            f: totalF % 100,
            r: totalR,
          };
        }),
      ),
    [store, year, accounts],
  );

  const monthlyComputed: Cell[][] = useMemo(
    () => monthlyLeaves.map((v) => computeAggregates(v)),
    [monthlyLeaves],
  );

  const updateCell = (mi: number, ri: number, field: "f" | "r", val: number) => {
    setStore((prev) => {
      const key = `${year}-${mi}-${ri}`;
      const cur = prev[key] || emptyCell;
      const next = { ...cur, [field]: val };
      if (next.f === 0 && next.r === 0) {
        const { [key]: _, ...rest } = prev;
        return rest;
      }
      return { ...prev, [key]: next };
    });
  };

  const sumCells = (arrs: Cell[][]): Cell[] => {
    if (!arrs.length) return schema.rows.map(() => emptyCell);
    return schema.rows.map((_, idx) => {
      let f = 0,
        r = 0;
      arrs.forEach((a) => {
        f += a[idx].f;
        r += a[idx].r;
      });
      r += Math.floor(f / 100);
      f = f % 100;
      return { f, r };
    });
  };

  // ========= ملخص الأبواب =========
  const renderBabSummary = (
    curVals: Cell[],
    prevVals: Cell[],
    curLabel: string,
    prevLabel: string,
  ) => {
    const totals = computeBabTotals(curVals, prevVals);
    return (
      <div className="mt-3 rounded-xl overflow-hidden border-2 border-black shadow" dir="rtl">
        <div className="bg-sky-800 text-white text-center py-2 font-bold text-sm tracking-wide">
          إجمالي الاستخدامات — ملخص حسب الأبواب
        </div>
        <div className="overflow-x-auto">
          <table className="w-full min-w-max table-auto border-collapse text-sm sm:text-base">
            <thead className="font-bold text-xs">
              <tr>
                <TH rowSpan={2} cls="bg-slate-200 text-slate-800 text-center w-1/4">
                  البيان
                </TH>
                <TH colSpan={2} cls={CUR_H}>
                  {curLabel}
                </TH>
                <TH colSpan={2} cls={PREV_H}>
                  {prevLabel}
                </TH>
                <TH colSpan={2} cls={TOT_H}>
                  الجملة
                </TH>
              </tr>
              <tr className="text-[11px]">
                <TH cls={CUR_H}>ف</TH> <TH cls={CUR_H}>ريال</TH>
                <TH cls={PREV_H}>ف</TH> <TH cls={PREV_H}>ريال</TH>
                <TH cls={TOT_H}>ف</TH> <TH cls={TOT_H}>ريال</TH>
              </tr>
            </thead>
            <tbody>
              {totals.map((t, i) => (
                <tr key={i} className={getBabSummaryColor(t.babNum)}>
                  <TD right cls="font-bold text-right pr-3">{t.label}</TD>
                  <TD cls="text-center">{t.cur.f || "-"}</TD>
                  <TD cls="text-center">{fmt(t.cur.r)}</TD>
                  <TD cls="text-center">{t.prev.f || "-"}</TD>
                  <TD cls="text-center">{fmt(t.prev.r)}</TD>
                  <TD cls="text-center font-bold">{t.total.f || "-"}</TD>
                  <TD cls="text-center font-bold">{fmt(t.total.r)}</TD>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    );
  };

  // ========= تصدير إلى Excel =========
  const handleExportExcel = async () => {
    try {
      const activeTable = document.querySelector(".expenses-active-table table") as HTMLTableElement | null;
      if (!activeTable) {
        toast.error("لم يتم العثور على جدول التقرير النشط للتصدير");
        return;
      }
      const rawMatrix = htmlTableToMatrix(activeTable);
      if (!rawMatrix.length) {
        toast.error("جدول التقرير فارغ");
        return;
      }

      const reportTitle = "كشف الاستخدامات (المصروفات)";
      const reportPeriod = `للعام المالي ${year}م — ${reportDateLabel || reportDate}`;
      const headerRows = addReportHeader({
        title: reportTitle,
        period: reportPeriod,
        colSpan: Math.max(1, rawMatrix[0]?.length || 1),
      });

      const matrixWithHeader = [...headerRows, ...rawMatrix];
      const workbook = createExcelWorkbook();
      const worksheet = appendRows(workbook, matrixWithHeader, "الاستخدامات");
      const palette = getExcelPalette("emerald");
      const letterhead = await loadReportLetterhead();

      formatWorksheet(worksheet, {
        palette,
        titleRows: headerRows.length,
        headerRows: 2,
        letterhead,
      });

      await downloadWorkbook(workbook, `الاستخدامات_${year}.xlsx`);
      toast.success("تم تصدير ملف الإكسل بنجاح");
    } catch (e: any) {
      console.error(e);
      toast.error("حدث خطأ أثناء تصدير ملف الإكسل");
    }
  };

  // ========= طباعة التقرير =========
  const handlePrint = async () => {
    try {
      const activeContainer = document.querySelector(".expenses-active-table");
      if (!activeContainer) {
        toast.error("لم يتم العثور على التقرير للطباعة");
        return;
      }

      const letterhead = await reportLetterheadHtml();
      const css = `
        ${runningLetterheadCss}
        @page { size: A4 landscape; margin: 8mm; }
        body { font-family: 'Amiri', 'Traditional Arabic', serif; direction: rtl; }
        table { width: 100%; border-collapse: collapse; margin-top: 10px; font-size: 11px; }
        th, td { border: 1px solid #000; padding: 3px; text-align: center; }
        th { background-color: #f1f5f9; -webkit-print-color-adjust: exact; }
        .bab-1 { background-color: #a7f3d0 !important; -webkit-print-color-adjust: exact; }
        .bab-2 { background-color: #bfdbfe !important; -webkit-print-color-adjust: exact; }
      `;

      await printReportHtml({
        title: `كشف الاستخدامات — ${year}م`,
        html: `
          <div dir="rtl">
            ${letterhead}
            <div style="text-align:center; font-weight:bold; font-size:16px; margin: 10px 0;">
              كشف الاستخدامات (المصروفات) للعام المالي ${year}م
            </div>
            ${activeContainer.innerHTML}
          </div>
        `,
        css,
        orientation: "landscape",
      });
    } catch (e) {
      console.error(e);
      toast.error("حدث خطأ أثناء محاولة الطباعة");
    }
  };

  // إجراءات القائمة الموحدة
  const actionItems: WebActionItem[] = [
    {
      id: "print",
      label: "طباعة التقرير النشط",
      icon: "Printer",
      colorClass: "bg-blue-600 hover:bg-blue-700 text-white",
      onSelect: handlePrint,
    },
    {
      id: "export-excel",
      label: "تصدير إلى Excel",
      icon: "FileSpreadsheet",
      colorClass: "bg-emerald-600 hover:bg-emerald-700 text-white",
      onSelect: handleExportExcel,
    },
  ];

  // دالة عرض جدول الشهر
  const renderMonthView = (mIdx: number) => {
    const cur = monthlyComputed[mIdx];
    const prevArr = monthlyLeaves.slice(0, mIdx);
    const prev = computeAggregates(sumCells(prevArr));

    return (
      <div className="expenses-active-table overflow-x-auto">
        <table className="w-full min-w-max table-auto border-collapse border border-black text-sm">
          <thead>
            <tr>
              <TH colSpan={5} cls="bg-slate-200">الرمز والتبويب</TH>
              <TH rowSpan={2} cls="bg-slate-200 w-1/4">البيان</TH>
              <TH colSpan={2} cls={CUR_H}>{MONTHS[mIdx]}</TH>
              <TH colSpan={2} cls={PREV_H}>ما قبله</TH>
              <TH colSpan={2} cls={TOT_H}>الجملة</TH>
            </tr>
            <tr className="text-xs">
              <TH cls="bg-slate-100">باب</TH>
              <TH cls="bg-slate-100">فصل</TH>
              <TH cls="bg-slate-100">بند</TH>
              <TH cls="bg-slate-100">نوع</TH>
              <TH cls="bg-slate-100">فرعي</TH>
              <TH cls={CUR_H}>ف</TH><TH cls={CUR_H}>ريال</TH>
              <TH cls={PREV_H}>ف</TH><TH cls={PREV_H}>ريال</TH>
              <TH cls={TOT_H}>ف</TH><TH cls={TOT_H}>ريال</TH>
            </tr>
          </thead>
          <tbody>
            {schema.rows.map((r, rIdx) => {
              const cCell = cur[rIdx];
              const pCell = prev[rIdx];
              const tot = addTwo(cCell, pCell);
              const leaf = isLeaf(r);

              return (
                <tr key={rIdx} className={rowClass(r)}>
                  <TD>{r.b || ""}</TD>
                  <TD>{r.c || ""}</TD>
                  <TD>{r.d || ""}</TD>
                  <TD>{r.e || ""}</TD>
                  <TD>{r.lv === "sub" ? "-" : ""}</TD>
                  <TD right cls={r.lv === "header" || r.lv === "bab" ? "font-bold pr-2" : "pr-2"}>
                    {r.n}
                  </TD>
                  {leaf ? (
                    <>
                      <td className="border border-black p-0 w-12 text-center bg-amber-50">
                        <input
                          type="number"
                          value={cCell.f || ""}
                          onChange={(e) => updateCell(mIdx, rIdx, "f", Number(e.target.value) || 0)}
                          className="w-full text-center outline-none bg-transparent font-mono text-xs"
                          placeholder="0"
                        />
                      </td>
                      <td className="border border-black p-0 w-24 text-center bg-amber-50">
                        <input
                          type="number"
                          value={cCell.r || ""}
                          onChange={(e) => updateCell(mIdx, rIdx, "r", Number(e.target.value) || 0)}
                          className="w-full text-center outline-none bg-transparent font-mono text-sm font-semibold"
                          placeholder="0"
                        />
                      </td>
                    </>
                  ) : (
                    <>
                      <TD cls={CUR_C}>{cCell.f || "-"}</TD>
                      <TD cls={CUR_C}>{fmt(cCell.r)}</TD>
                    </>
                  )}
                  <TD cls={PREV_C}>{pCell.f || "-"}</TD>
                  <TD cls={PREV_C}>{fmt(pCell.r)}</TD>
                  <TD cls={TOT_C}>{tot.f || "-"}</TD>
                  <TD cls={TOT_C + " font-bold"}>{fmt(tot.r)}</TD>
                </tr>
              );
            })}
          </tbody>
        </table>

        {renderBabSummary(cur, prev, MONTHS[mIdx], "ما قبله")}
      </div>
    );
  };

  return (
    <div className="p-4 space-y-4" dir="rtl">
      {/* شريط الإجراءات والتحكم */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-white p-3 rounded-xl border border-slate-200 shadow-sm">
        <div className="flex items-center gap-2">
          <span className="font-bold text-slate-700">عرض التقرير:</span>
          <select
            value={view}
            onChange={(e) => setView(e.target.value)}
            className="px-3 py-1.5 border border-slate-300 rounded-lg text-sm font-bold bg-slate-50 outline-none"
          >
            <option value="cover">الغلاف والمعلومات العامة</option>
            {MONTHS.map((m, idx) => (
              <option key={idx} value={`m-${idx}`}>
                شهر {m}
              </option>
            ))}
          </select>
        </div>

        <WebActionMenu items={actionItems} />
      </div>

      {/* محتوى التقرير */}
      {view === "cover" ? (
        <div className="bg-white p-8 rounded-xl border border-slate-200 shadow-sm text-center space-y-4">
          <h2 className="text-2xl font-black text-sky-900">
            كشف الاستخدامات (المصروفات) الفعلية
          </h2>
          <p className="text-slate-600 font-bold">للعام المالي {year}م</p>
          <div className="p-4 max-w-md mx-auto bg-sky-50 rounded-lg border border-sky-200 text-sm text-sky-800">
            يتم احتساب ودمج المصروفات المسجلة في تبويب الحساب الجاري تلقائياً مع خيارات الإدخال اليدوي والتجميع المحاسبي للأبواب والفصول.
          </div>
        </div>
      ) : (
        renderMonthView(Number(view.split("-")[1]))
      )}
    </div>
  );
}
