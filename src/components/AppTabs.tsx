import React, { useEffect, useState, useRef, useCallback, useMemo } from "react";
import {
  FileSpreadsheet,
  Plus,
  Trash2,
  Upload,
  Download,
  FileText,
  Printer,
  Eraser,
} from "lucide-react";
import { useReportDate } from "@/lib/reportDate";
import { toast } from "sonner";
import { reportLetterheadHtml, runningLetterheadCss } from "@/lib/printTableHtml";
import { printReportHtml } from "@/lib/nativePrinter";
import { importUsageInWorker } from "@/lib/excelImportWorkerClient";
import { saveBlobToInternalStorage } from "@/lib/nativeFileStorage";
import WebActionMenu from "./WebActionMenu";

const mainHeaders = ["رقم الاستمارة", "كشف التسوية", "التاريخ", "البيان"];
const STORAGE_KEY = "app-tabs-usages-v1";

const UI = {
  page: "#f8fafc",
  surface: "#ffffff",
  surface2: "#f1f5f9",
  surface3: "#e2e8f0",
  navy: "#1e293b",
  navyLight: "#334155",
  teal: "#0d9488",
  tealDark: "#0f766e",
  turquoise: "#14b8a6",
  bronze: "#d97706",
  bronzeLight: "#f59e0b",
  pink: "#e11d48",
  pinkDark: "#be123c",
  cyanText: "#0f766e",
  text: "#0f172a",
  muted: "#64748b",
  grid: "#cbd5e1",
  row: "#ffffff",
  rowAlt: "#f8fafc",
  formula: "#f0fdfa",
  formulaText: "#0f766e",
};

const COLORS = {
  MAIN_1: "#E0F2FE", // رقم الاستمارة (سماوي فاتح)
  MAIN_2: "#E0E7FF", // كشف التسوية (بنفسجي فاتح)
  MAIN_3: "#CCFBF1", // التاريخ (تركواز فاتح)
  MAIN_4: "#FEF3C7", // البيان (أصفر دافئ فاتح)
  TOTAL_ALL: "#FFE4E6", // إجمالي عام (وردي فاتح)
  BAB_TOTAL: "#CFF4FC", // إجمالي الباب (سماوي مائي فاتح)
  FASL: "#F3E8FF", // الفصل (أرجواني فاتح)
  BAND: "#F1F5F9", // البند (رمادي فاتح)
};

const ARGB = {
  MAIN_1: "FFE0F2FE",
  MAIN_2: "FFE0E7FF",
  MAIN_3: "FFCCFBF1",
  MAIN_4: "FFFEF3C7",
  TOTAL_ALL: "FFFEE4E6",
  BAB_TOTAL: "FFCFF4FC",
  FASL: "FFF3E8FF",
  BAND: "FFF1F5F9",
  DARK: "FF1E293B",
  GOLD: "FFD97706",
  CUR: "FFCCFBF1",
  PREV: "FFF1F5F9",
};

const dataColumnsOrder = [
  "اجمالي عام الاستخدامات",
  "اجمالي الباب الاول",
  "الفصل الاول_باب1",
  "المرتبات الاساسية",
  "اجور تعاقدية",
  "اجور عمل اضافي",
  "مكافات",
  "طبيعة عمل",
  "بدل ريف",
  "بدل سكن",
  "بدل تحديث",
  "الفصل الثاني_باب1",
  "ح/حكومة",
  "اصابة عمل",
  "اجمالي الباب الثاني",
  "الفصل الاول_باب2",
  "مياه",
  "انارة",
  "ادوات كتابية",
  "نشر واعلان",
  "اتصالات",
  "مؤتمرات وااحتفالات",
  "نفقات النظافة",
  "اخرى",
  "نقل مهام",
  "انتقالات داخلية",
  "ايجار مباني",
  "ادوية ومستلزمات طبية",
  "اغذية وملبوسات",
  "اخرى_2",
  "الفصل الثاني_باب2",
  "صيانة مباني",
  "وقود وزيوت",
  "قطع غيار وصيانة وسائل النقل",
  "قطع غيار وصيانة الالات والمعدات والاثاث",
  "اجمالي الباب الرابع",
  "مركز صحي قحزة",
  "وحدة الغسيل الكلوي",
  "مشروع دعم الكلى",
  "الصالة والمطبخ",
  "مركز صحي",
  "الامانات",
];

const allCols = [...mainHeaders, ...dataColumnsOrder];
const TOTAL_COLS = allCols.length + 1;

const isFormulaCol = (col: string) => col.includes("اجمالي") || col.includes("الفصل");

const colArgb = (col: string) =>
  col === "رقم الاستمارة"
    ? ARGB.MAIN_1
    : col === "كشف التسوية"
      ? ARGB.MAIN_2
      : col === "التاريخ"
        ? ARGB.MAIN_3
        : col === "البيان"
          ? ARGB.MAIN_4
          : col === "اجمالي عام الاستخدامات"
            ? ARGB.TOTAL_ALL
            : col.includes("اجمالي الباب")
              ? ARGB.BAB_TOTAL
              : col.includes("الفصل")
                ? ARGB.FASL
                : undefined;

const MONTHS = [
  { id: 1, name: "يناير" },
  { id: 2, name: "فبراير" },
  { id: 3, name: "مارس" },
  { id: 4, name: "أبريل" },
  { id: 5, name: "مايو" },
  { id: 6, name: "يونيو" },
  { id: 7, name: "يوليو" },
  { id: 8, name: "أغسطس" },
  { id: 9, name: "سبتمبر" },
  { id: 10, name: "أكتوبر" },
  { id: 11, name: "نوفمبر" },
  { id: 12, name: "ديسمبر" },
];

const getColumnLetter = (colIndex: number): string => {
  let temp = colIndex;
  let letter = "";
  while (temp > 0) {
    const mod = (temp - 1) % 26;
    letter = String.fromCharCode(65 + mod) + letter;
    temp = Math.floor((temp - mod) / 26);
  }
  return letter;
};

const formatNumberEn = (val: any) => {
  if (val === "" || val === null || val === undefined) return "";
  const num = Number(val);
  if (isNaN(num)) return val;
  return new Intl.NumberFormat("en-US", { maximumFractionDigits: 2 }).format(num);
};

const sumColumns = (row: any, cols: string[]): number =>
  cols.reduce((acc, col) => {
    const num = Number(row[col]);
    return acc + (isNaN(num) ? 0 : num);
  }, 0);

const recomputeRow = (row: any) => {
  const newRow = { ...row };

  const fasl1Bab1 = sumColumns(newRow, [
    "المرتبات الاساسية",
    "اجور تعاقدية",
    "اجور عمل اضافي",
    "مكافات",
    "طبيعة عمل",
    "بدل ريف",
    "بدل سكن",
    "بدل تحديث",
  ]);

  const fasl2Bab1 = sumColumns(newRow, ["ح/حكومة", "اصابة عمل"]);

  newRow["الفصل الاول_باب1"] = fasl1Bab1;
  newRow["الفصل الثاني_باب1"] = fasl2Bab1;
  newRow["اجمالي الباب الاول"] = fasl1Bab1 + fasl2Bab1;

  const fasl1Bab2 = sumColumns(newRow, [
    "مياه",
    "انارة",
    "ادوات كتابية",
    "نشر واعلان",
    "اتصالات",
    "مؤتمرات وااحتفالات",
    "نفقات النظافة",
    "اخرى",
    "نقل مهام",
    "انتقالات داخلية",
    "ايجار مباني",
    "ادوية ومستلزمات طبية",
    "اغذية وملبوسات",
    "اخرى_2",
  ]);

  const fasl2Bab2 = sumColumns(newRow, [
    "صيانة مباني",
    "وقود وزيوت",
    "قطع غيار وصيانة وسائل النقل",
    "قطع غيار وصيانة الالات والمعدات والاثاث",
  ]);

  newRow["الفصل الاول_باب2"] = fasl1Bab2;
  newRow["الفصل الثاني_باب2"] = fasl2Bab2;
  newRow["اجمالي الباب الثاني"] = fasl1Bab2 + fasl2Bab2;

  newRow["اجمالي الباب الرابع"] = sumColumns(newRow, [
    "مركز صحي قحزة",
    "وحدة الغسيل الكلوي",
    "مشروع دعم الكلى",
    "الصالة والمطبخ",
    "مركز صحي",
    "الامانات",
  ]);

  newRow["اجمالي عام الاستخدامات"] =
    newRow["اجمالي الباب الاول"] +
    newRow["اجمالي الباب الثاني"] +
    newRow["اجمالي الباب الرابع"];

  return newRow;
};

/* ============================================================
   مكون إدخال متفاعل محلياً مع تأجيل الحفظ حتى انتهاء الكتابة
   ============================================================ */
const EditableCell: React.FC<{
  rowId: string;
  field: string;
  value: any;
  onCommit: (rowId: string, field: string, value: string) => void;
}> = React.memo(({ rowId, field, value, onCommit }) => {
  const isDate = field === "التاريخ";
  const [localVal, setLocalVal] = useState(value ?? "");

  useEffect(() => {
    setLocalVal(value ?? "");
  }, [value]);

  const handleBlur = () => {
    if (localVal !== (value ?? "")) {
      onCommit(rowId, field, localVal);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.currentTarget.blur();
    }
  };

  return (
    <input
      type={isDate ? "date" : "text"}
      value={localVal}
      onChange={(e) => setLocalVal(e.target.value)}
      onBlur={handleBlur}
      onKeyDown={handleKeyDown}
      dir={
        isDate
          ? "ltr"
          : /^[\d.,\-]*$/.test(String(localVal ?? ""))
            ? "ltr"
            : "rtl"
      }
      className="
        w-auto h-auto
        rounded-md border border-1-black
        bg-transparent px-1.5 py-1.5
        text-center text-[12px] sm:text-[13px]
        font-bold text-[#0f172a]
        transition-all duration-150
        placeholder:text-[#94a3b8]
        focus:border-[#0d9488] focus:bg-[#f0fdfa]
        focus:outline-none focus:ring-2 focus:ring-[#0d9488]/30
      "
    />
  );
});

EditableCell.displayName = "EditableCell";

const FormulaCell: React.FC<{ value: any }> = React.memo(({ value }) => (
  <div
    className="
      rounded-md px-1.5 py-1
      text-center text-[12px] sm:text-[13px]
      font-black text-[#0f766e]
      font-mono tabular-nums
    "
    dir="ltr"
  >
    {formatNumberEn(value)}
  </div>
));

FormulaCell.displayName = "FormulaCell";

const THEAD_HTML = `
<tr>
  <th rowspan="4" class="c-main c-main-1">رقم الاستمارة</th>
  <th rowspan="4" class="c-main c-main-2">كشف التسوية</th>
  <th rowspan="4" class="c-main c-main-3">التاريخ</th>
  <th rowspan="4" class="c-main c-main-4">البيان</th>
  <th rowspan="4" class="c-total">اجمالي عام الاستخدامات</th>
  <th colspan="13" class="c-bab">اجمالي الباب الاول</th>
  <th colspan="21" class="c-bab">اجمالي الباب الثاني</th>
  <th colspan="7" class="c-bab">اجمالي الباب الرابع</th>
  <th rowspan="4" class="c-action">إجراء</th>
</tr>
<tr>
  <th rowspan="3" class="c-bab">الإجمالي</th>
  <th colspan="10" class="c-fasl">الفصل الاول</th>
  <th colspan="2" class="c-fasl">الفصل الثاني</th>
  <th rowspan="3" class="c-bab">الإجمالي</th>
  <th colspan="15" class="c-fasl">الفصل الاول</th>
  <th colspan="5" class="c-fasl">الفصل الثاني</th>
  <th rowspan="3" class="c-bab">الإجمالي</th>
  <th rowspan="3" class="c-sub-item">مركز صحي قحزة</th>
  <th rowspan="3" class="c-sub-item">وحدة الغسيل الكلوي</th>
  <th rowspan="3" class="c-sub-item">مشروع دعم الكلى</th>
  <th rowspan="3" class="c-sub-item">الصالة والمطبخ</th>
  <th rowspan="3" class="c-sub-item">مركز صحي</th>
  <th rowspan="3" class="c-sub-item">الامانات</th>
</tr>
<tr>
  <th rowspan="2" class="c-fasl">إجمالي ف1</th>
  <th colspan="8" class="c-band">المرتبات والأجور</th>
  <th rowspan="2" class="c-fasl">إجمالي ف2</th>
  <th rowspan="2" class="c-sub-item">ح/حكومة</th>
  <th rowspan="2" class="c-sub-item">اصابة عمل</th>
  <th rowspan="2" class="c-fasl">إجمالي ف1</th>
  <th rowspan="2" class="c-sub-item">مياه</th>
  <th rowspan="2" class="c-sub-item">انارة</th>
  <th rowspan="2" class="c-sub-item">ادوات كتابية</th>
  <th rowspan="2" class="c-sub-item">نشر واعلان</th>
  <th rowspan="2" class="c-sub-item">اتصالات</th>
  <th rowspan="2" class="c-sub-item">مؤتمرات</th>
  <th rowspan="2" class="c-sub-item">نظافة</th>
  <th rowspan="2" class="c-sub-item">اخرى</th>
  <th rowspan="2" class="c-sub-item">نقل مهام</th>
  <th rowspan="2" class="c-sub-item">انتقالات</th>
  <th rowspan="2" class="c-sub-item">ايجار مباني</th>
  <th rowspan="2" class="c-sub-item">ادوية</th>
  <th rowspan="2" class="c-sub-item">اغذية</th>
  <th rowspan="2" class="c-sub-item">اخرى2</th>
  <th rowspan="2" class="c-fasl">إجمالي ف2</th>
  <th rowspan="2" class="c-sub-item">صيانة مباني</th>
  <th rowspan="2" class="c-sub-item">وقود وزيوت</th>
  <th rowspan="2" class="c-sub-item">قطع غيار نقل</th>
  <th rowspan="2" class="c-sub-item">قطع غيار معدات</th>
</tr>
<tr>
  <th class="c-sub-item">اساسية</th>
  <th class="c-sub-item">تعاقدية</th>
  <th class="c-sub-item">اضافي</th>
  <th class="c-sub-item">مكافات</th>
  <th class="c-sub-item">طبيعة عمل</th>
  <th class="c-sub-item">بدل ريف</th>
  <th class="c-sub-item">بدل سكن</th>
  <th class="c-sub-item">تحديث</th>
</tr>
`;

const AppTabs: React.FC = () => {
  const { reportDate, reportDateLabel } = useReportDate();

  const [dataRows, setDataRows] = useState<any[]>(() => {
    try {
      return JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]");
    } catch {
      return [];
    }
  });

  const [importMonthId, setImportMonthId] = useState<number>(1);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const latestDataRows = useRef(dataRows);
  const storageTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    latestDataRows.current = dataRows;

    if (storageTimer.current) clearTimeout(storageTimer.current);

    storageTimer.current = setTimeout(() => {
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(latestDataRows.current));
      } catch (error) {
        console.error("[Storage] Failed to persist usage rows", error);
      }
      storageTimer.current = null;
    }, 150);

    return () => {
      if (storageTimer.current) clearTimeout(storageTimer.current);
    };
  }, [dataRows]);

  useEffect(() => {
    const flush = () => {
      if (storageTimer.current) clearTimeout(storageTimer.current);
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(latestDataRows.current));
      } catch (error) {
        console.error("[Storage] Failed to flush usage rows", error);
      }
      storageTimer.current = null;
    };

    window.addEventListener("pagehide", flush);
    return () => {
      window.removeEventListener("pagehide", flush);
      flush();
    };
  }, []);

  const makeEmptyRow = useCallback((monthId: number) => {
    const r: any = {
      id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      monthId,
    };
    mainHeaders.forEach((h) => (r[h] = ""));
    dataColumnsOrder.forEach((h) => (r[h] = ""));
    return recomputeRow(r);
  }, []);

  useEffect(() => {
    setDataRows((prev) => {
      const counts: Record<number, number> = {};
      prev.forEach((r) => (counts[r.monthId] = (counts[r.monthId] || 0) + 1));

      const additions: any[] = [];
      MONTHS.forEach((m) => {
        if (!counts[m.id]) {
          additions.push(makeEmptyRow(m.id), makeEmptyRow(m.id));
        }
      });

      return additions.length ? [...prev, ...additions] : prev;
    });
  }, [makeEmptyRow]);

  const updateCell = useCallback((rowId: string, key: string, rawValue: string) => {
    setDataRows((prev) =>
      prev.map((row) =>
        row.id === rowId ? recomputeRow({ ...row, [key]: rawValue }) : row
      )
    );
  }, []);

  const rowsByMonth = useMemo(() => {
    const map: Record<number, any[]> = {};
    MONTHS.forEach((m) => (map[m.id] = []));
    dataRows.forEach((row) => {
      if (map[row.monthId]) {
        map[row.monthId].push(row);
      }
    });
    return map;
  }, [dataRows]);

  const computedTotals = useMemo(() => {
    const sumCols = (rows: any[], col: string) =>
      rows.reduce((acc, row) => acc + (Number(row[col]) || 0), 0);

    const map: Record<
      number,
      {
        current: (col: string) => number;
        before: (col: string) => number;
        cumulative: (col: string) => number;
      }
    > = {};

    MONTHS.forEach((m) => {
      const curRows = rowsByMonth[m.id] || [];
      const beforeRows = dataRows.filter((r) => r.monthId < m.id);
      const cumRows = dataRows.filter((r) => r.monthId <= m.id);

      map[m.id] = {
        current: (c: string) => sumCols(curRows, c),
        before: (c: string) => sumCols(beforeRows, c),
        cumulative: (c: string) => sumCols(cumRows, c),
      };
    });

    return map;
  }, [dataRows, rowsByMonth]);

  const handleAddRow = (monthId: number) =>
    setDataRows((prev) => [...prev, makeEmptyRow(monthId)]);

  const handleDeleteRow = (rowId: string) => {
    if (!window.confirm("هل تريد حذف هذا السطر؟")) return;
    setDataRows((prev) => prev.filter((row) => row.id !== rowId));
  };

  const handleClearAll = () => {
    if (!window.confirm("سيتم حذف جميع بيانات كل الأشهر نهائياً. هل أنت متأكد؟")) return;
    const fresh: any[] = [];
    MONTHS.forEach((m) => fresh.push(makeEmptyRow(m.id), makeEmptyRow(m.id)));
    setDataRows(fresh);
  };

  const handleImportClick = () => fileInputRef.current?.click();

  const handleImportFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    e.target.value = "";

    try {
      const imported = await importUsageInWorker(file, importMonthId);
      if (!imported.length) {
        toast.error("لم يتم العثور على صفوف استخدامات صالحة في ملف Excel");
        return;
      }

      const importedMonths = new Set(imported.map((row: any) => row.monthId));
      setDataRows((prev) => [
        ...prev.filter((row) => !importedMonths.has(row.monthId)),
        ...imported,
      ]);

      toast.success(`تم استيراد ${imported.length} صف إلى ${importedMonths.size} شهر`);
    } catch (error) {
      console.error("[Excel] Usage import failed", error);
      toast.error("تعذّر قراءة الملف. تأكد أنه ملف Excel صالح أو صادر من هذا الجدول.");
    }
  };

  const border = {
    top: { style: "thin" as const, color: { argb: "FFCBD5E1" } },
    left: { style: "thin" as const, color: { argb: "FFCBD5E1" } },
    bottom: { style: "thin" as const, color: { argb: "FFCBD5E1" } },
    right: { style: "thin" as const, color: { argb: "FFCBD5E1" } },
  };

  const handleExportExcel = async () => {
    const ExcelJS = (await import("exceljs")).default;
    const wb = new ExcelJS.Workbook();

    const disp = wb.addWorksheet("عرض", {
      views: [{ rightToLeft: true, state: "frozen", ySplit: 2 }],
      properties: { defaultRowHeight: 20, tabColor: { argb: "FF0D9488" } },
      pageSetup: {
        orientation: "landscape",
        paperSize: 9,
        fitToPage: true,
        fitToWidth: 7,
        fitToHeight: 0,
        margins: { left: 0.25, right: 0.25, top: 0.35, bottom: 0.35, header: 0.15, footer: 0.15 },
      },
    });

    disp.mergeCells(1, 1, 1, allCols.length);
    const title = disp.getCell(1, 1);
    title.value = "سجل مفردات الاستخدامات والنفقات العامة";
    title.font = { bold: true, size: 14, color: { argb: "FF0F172A" } };
    title.fill = { type: "pattern", pattern: "solid", fgColor: { argb: "FFE2E8F0" } };
    title.alignment = { horizontal: "center", vertical: "middle", wrapText: true };
    disp.getRow(1).height = 28;

    const hdr = disp.getRow(2);
    hdr.height = 40;

    allCols.forEach((c, i) => {
      const cell = hdr.getCell(i + 1);
      cell.value = c;
      cell.font = { bold: true, size: 13, color: { argb: "FF0F172A" } };
      cell.alignment = { horizontal: "center", vertical: "middle", wrapText: true };
      cell.border = border;
      cell.fill = { type: "pattern", pattern: "solid", fgColor: { argb: colArgb(c) || "FFF1F5F9" } };
    });

    let r = 3;
    MONTHS.forEach((m) => {
      const rows = rowsByMonth[m.id] || [];
      const t = computedTotals[m.id];

      disp.mergeCells(r, 1, r, allCols.length);
      const mc = disp.getCell(r, 1);
      mc.value = `شهر ${m.name}`;
      mc.font = { bold: true, color: { argb: "FF0F172A" } };
      mc.fill = { type: "pattern", pattern: "solid", fgColor: { argb: "FFBAE6FD" } };
      mc.alignment = { horizontal: "right", vertical: "middle" };
      r++;

      rows.forEach((row) => {
        allCols.forEach((c, i) => {
          const cell = disp.getCell(r, i + 1);
          const v = row[c];
          cell.value = typeof v === "number" ? v : v === "" ? "" : isNaN(Number(v)) ? v : Number(v);
          cell.alignment = { horizontal: "center", vertical: "middle" };
          cell.font = { size: 9, bold: isFormulaCol(c), color: { argb: "FF0F172A" } };
          cell.border = border;
          cell.fill = { type: "pattern", pattern: "solid", fgColor: { argb: "FFFFFFFF" } };
        });
        r++;
      });

      const rowCur = (label: string, getter: (c: string) => number, fillArgb: string, fontArgb: string) => {
        disp.mergeCells(r, 1, r, 4);
        const lc = disp.getCell(r, 1);
        lc.value = label;
        lc.font = { bold: true, color: { argb: fontArgb } };
        lc.alignment = { horizontal: "right", vertical: "middle" };
        lc.fill = { type: "pattern", pattern: "solid", fgColor: { argb: fillArgb } };

        dataColumnsOrder.forEach((c, i) => {
          const cell = disp.getCell(r, 5 + i);
          cell.value = getter(c) || "";
          cell.font = { bold: true, size: 9, color: { argb: fontArgb } };
          cell.alignment = { horizontal: "center", vertical: "middle" };
          cell.border = border;
          cell.fill = { type: "pattern", pattern: "solid", fgColor: { argb: fillArgb } };
        });
        r++;
      };

      rowCur(`إجمالي شهر ${m.name}`, t.current, ARGB.CUR, "FF0F766E");
      rowCur(`إجمالي الأشهر السابقة (قبل ${m.name})`, t.before, ARGB.PREV, "FF475569");
      rowCur(`الإجمالي العام (حتى ${m.name})`, t.cumulative, "FFFDE68A", "FF92400E");
    });

    for (let col = 1; col <= allCols.length; col++) {
      disp.getColumn(col).width = col <= 4 ? 14 : 10;
    }

    disp.pageSetup.printArea = `A1:${getColumnLetter(allCols.length)}${Math.max(1, disp.rowCount)}`;
    disp.pageSetup.printTitlesRow = "2:2";

    const buf = await wb.xlsx.writeBuffer();
    const blob = new Blob([buf], {
      type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    });

    const fileName = `الاستخدامات-${reportDate}.xlsx`;
    const internalUri = await saveBlobToInternalStorage(blob, fileName);

    if (internalUri) {
      toast.success("تم حفظ ملف Excel داخل تخزين التطبيق");
      return;
    }

    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = fileName;
    a.click();
    URL.revokeObjectURL(url);
  };

  const buildAllMonthsHtml = () => {
    const numCell = (v: number) => (v > 0 ? formatNumberEn(v) : "-");
    let body = "";

    MONTHS.forEach((m) => {
      const rows = rowsByMonth[m.id] || [];
      const t = computedTotals[m.id];

      body += `<tr class="month"><td colspan="${TOTAL_COLS}">شهر ${m.name}</td></tr>`;

      rows.forEach((row) => {
        body += "<tr>";
        mainHeaders.forEach((h) => {
          const cls = h === "التاريخ" ? "date-cell" : h === "رقم الاستمارة" ? "num numeric-cell" : "text-cell";
          body += `<td class="${cls}">${row[h] ?? ""}</td>`;
        });

        dataColumnsOrder.forEach((c) => {
          const cls = `num numeric-cell${isFormulaCol(c) ? " formula" : ""}`;
          body += `<td class="${cls}">${row[c] === "" || row[c] === undefined ? "" : formatNumberEn(row[c])}</td>`;
        });

        body += `<td class="text-cell"></td></tr>`;
      });

      const totalRow = (label: string, cls: string, getter: (c: string) => number) => {
        let tr = `<tr class="${cls}"><td class="text-cell" colspan="4">${label}</td>`;
        dataColumnsOrder.forEach((c) => (tr += `<td class="num numeric-cell">${numCell(getter(c))}</td>`));
        tr += `<td class="text-cell"></td></tr>`;
        return tr;
      };

      body += totalRow(`إجمالي شهر ${m.name}`, "t-cur", t.current);
      body += totalRow(`إجمالي الأشهر السابقة (قبل ${m.name})`, "t-prev", t.before);
      body += totalRow(`الإجمالي العام (حتى ${m.name})`, "t-cum", t.cumulative);
    });

    return `<!doctype html><html lang="ar" dir="rtl"><head><meta charset="utf-8">
    <title>سجل مفردات الاستخدامات والنفقات العامة - ${reportDateLabel}</title>
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Cairo:wght@600;700;800&family=Tajawal:wght@400;500;700&display=swap">
<style>
      /* 1. ضبط حجم الورقة إلى A3 بالوضع الأفقي */
      @page { 
        size: A3 landscape; 
        margin: 3mm; 
      }

      * { box-sizing: border-box; }
      html, body { margin: 0; padding: 0; }
      
      body { 
        font-family: 'Cairo', 'Tajawal', sans-serif; 
        direction: rtl; 
        color:#0f172a!important; 
        padding: 0 1px; 
        width: 100%; 
        font-weight: 700; !important; 
      }

      /* 2. تجعل الحاوية تمتد على 100% من عرض الصفحة */
      .report-letterhead-block { 
        display:flex !important; 
        width:100% !important; 
        height:30mm; 
        overflow:hidden; 
  justify-content:space-between; /* توزيع النص والصورة على طرفي الصفحة */
        align-items: center; 
        margin: 0 0 3mm; 
      }
      .report-letterhead-image { 
        width:100%!important; 
        height:100%!important; 
  object-fit:contain!important;
        /* يحافظ على أبعاد الصورة دون قص أو تشويه */
      }
      h2 { text-align:center; color:#0f172a !important; margin:0 0 3mm; font-weight:800; }
      .report-date { text-align:center; color:#334155 !important; margin:0 0 5px; font-size:10px; font-weight:700; }
      table { width:100%; border-collapse:collapse; table-layout:auto !important; font-size:clamp(14px,1.05vw,16px); }
      th, td { border:1px solid #000; padding:2px 3px !important; text-align:center; vertical-align:middle; line-height:1.15; font-size:clamp(14px,1.05vw,16px); color:#0f172a !important; font-weight:700 !important; }
      .num, .numeric-cell, .date-cell { width:1%; white-space:nowrap !important; font-family:'Times New Roman',Times,serif !important; font-size:clamp(14px,1vw,16px) !important; font-variant-numeric:tabular-nums; direction:ltr; }
      .text-cell { width:auto; white-space:nowrap; overflow-wrap:break-word; }
      
      /* ألوان رؤوس الأعمدة المتدرجة للطباعة */
      thead th { font-weight:800; color:#0f172a !important; }
      thead .c-main-1 { background: linear-gradient(180deg, #e0f2fe, #bae6fd) !important; color: #0369a1 !important; }
      thead .c-main-2 { background: linear-gradient(180deg, #e0e7ff, #c7d2fe) !important; color: #3730a3 !important; }
      thead .c-main-3 { background: linear-gradient(180deg, #ccfbf1, #99f6e4) !important; color: #0f766e !important; }
      thead .c-main-4 { background: linear-gradient(180deg, #fef3c7, #fde68a) !important; color: #92400e !important; }
      thead .c-total  { background: linear-gradient(180deg, #ffe4e6, #fecdd3) !important; color: #be123c !important; }
      thead .c-bab    { background: linear-gradient(180deg, #cff4fc, #a6e9f5) !important; color: #08596b !important; }
      thead .c-fasl   { background: linear-gradient(180deg, #f3e8ff, #e9d5ff) !important; color: #6b21a8 !important; }
      thead .c-band   { background: linear-gradient(180deg, #f1f5f9, #e2e8f0) !important; color: #334155 !important; }
      thead .c-sub-item { background: linear-gradient(180deg, #f8fafc, #f1f5f9) !important; color: #1e293b !important; }
      thead .c-action { background: linear-gradient(180deg, #ffe4e6, #fecdd3) !important; color: #be123c !important; }
      
      td.formula { background:#f0fdfa; font-weight:700; color:#0f766e !important; }
      tr.month td { background: linear-gradient(90deg, #e0f2fe, #c7d2fe); color:#1e3a8a !important; font-weight:800 !important; text-align:center; }
      tr.t-cur td  { background:#ccfbf1; color:#0f766e !important; font-weight:700 !important; }
      tr.t-prev td { background:#f1f5f9; color:#475569 !important; font-weight:700 !important; }
      tr.t-cum td  { background:#fef3c7; color:#92400e !important; font-weight:800 !important; }
      ${runningLetterheadCss}
    </style></head><body>
    ${reportLetterheadHtml()}
    <h2>سجل مفردات الاستخدامات والنفقات العامة</h2>
    <div class="report-date">تاريخ التقرير: ${reportDateLabel}</div>
    <table><thead>${THEAD_HTML}</thead><tbody>${body}</tbody></table>
    </body></html>`;
  };

  const handlePrint = () => {
    const opened = printReportHtml(
      buildAllMonthsHtml(),
      `سجل مفردات الاستخدامات والنفقات العامة - ${reportDateLabel}`
    );
    if (!opened) {
      toast.error("تم منع فتح نافذة الطباعة، يرجى السماح بالنوافذ المنبثقة");
    }
  };

  return (
    <div
      className="sheet-tabs-ui apk-tabs-ui w-full space-y-4 p-2 sm:p-3 font-tajawal"
      style={{
        background: "linear-gradient(135deg, #f8fafc 0%, #f1f5f9 50%, #e2e8f0 100%)",
        color: UI.text,
      }}
      dir="rtl"
    >
      <style>{`
        .usage-header { color: ${UI.text}; }
        .usage-table-shell { scrollbar-color: ${UI.teal} ${UI.surface3}; }
        .usage-table { font-family: "Tajawal", "Noto Sans Arabic", sans-serif; }
        
        /* ألوان رؤوس الجدول المتدرجة الفاتحة */
        .usage-table th {
          position: sticky; top: 0; z-index: 20; color: #0f172a;
          border: 1px solid #000; padding: 10px 8px; text-align: center;
          vertical-align: middle; white-space:normal; font-size: 12px; font-weight: 900;
          line-height: 1.25; background: linear-gradient(180deg, #f8fafc, #e2e8f0);
        }
        
        /* تخصيص ألوان فاتحة مميزة لكل عمود رئيسي وتجميعي */
        .usage-table th.c-main-1 { background: linear-gradient(180deg, #e0f2fe, #bae6fd); color: #0369a1; }
        .usage-table th.c-main-2 { background: linear-gradient(180deg, #e0e7ff, #c7d2fe); color: #3730a3; }
        .usage-table th.c-main-3 { background: linear-gradient(180deg, #ccfbf1, #99f6e4); color: #0f766e; }
        .usage-table th.c-main-4 { background: linear-gradient(180deg, #fef3c7, #fde68a); color: #92400e; }
        .usage-table th.c-total  { background: linear-gradient(180deg, #ffe4e6, #fecdd3); color: #be123c; }
        .usage-table th.c-bab    { background: linear-gradient(180deg, #cff4fc, #a6e9f5); color: #08596b; }
        .usage-table th.c-fasl   { background: linear-gradient(180deg, #f3e8ff, #e9d5ff); color: #6b21a8; }
        .usage-table th.c-band   { background: linear-gradient(180deg, #f1f5f9, #e2e8f0); color: #334155; }
        .usage-table th.c-sub-item { background: linear-gradient(180deg, #f8fafc, #f1f5f9); color: #1e293b; }
        .usage-table th.c-action { background: linear-gradient(180deg, #ffe4e6, #fecdd3); color: #be123c; }

        .usage-table td { border: 1px solid ${UI.grid}; padding: 0; vertical-align: middle; }
        .usage-table tbody tr { background: ${UI.row}; transition: background .15s ease; }
        .usage-table tbody tr:nth-child(even) { background: ${UI.rowAlt}; }
        .usage-table tbody tr:hover { background: #f0fdfa; }
        .usage-table .month-row td {
          background: linear-gradient(90deg, #38bdf8, #818cf8); color: #ffffff;
          border-color: #000; font-weight: 900; padding: 9px 10px;
          box-shadow: inset 0 2px 0 rgba(255,255,255,.6), inset 0 -1px 0 rgba(0,0,0,.1);
        }
        .usage-table .month-row button {
          color: #ffffff; background: linear-gradient(135deg, #0d9488, #0f766e); border: 1px solid #0f766e;
          box-shadow: 0 4px 10px rgba(13,148,136,.25);
        }
        .usage-table .month-row button:hover { background: linear-gradient(135deg, #14b8a6, #0d9488); }
        .usage-table .total-current td { background: linear-gradient(90deg, #ccfbf1, #e0f2fe); color: #0f766e; font-weight: 900; }
        .usage-table .total-previous td { background: linear-gradient(90deg, #f1f5f9, #e2e8f0); color: #475569; font-weight: 900; }
        .usage-table .total-cumulative td {
          background: linear-gradient(90deg, #fef3c7, #fde68a); color: #92400e; font-weight: 900;
          box-shadow: inset 0 1px 0 rgba(217,119,6,.2);
        }
        .usage-table .formula-col { background: rgba(13,148,136,.05); }
        .usage-table .action-cell { background: rgba(225,29,72,.04); }
        .usage-table .delete-btn { color: ${UI.pink}; transition: all .15s ease; }
        .usage-table .delete-btn:hover { color: #ffffff; background: ${UI.pink}; }
      `}</style>

      {/* شريط العنوان والإجراءات */}
      <div
        className="rounded-2xl border p-3 sm:p-4 shadow-xl"
        style={{
          background: "linear-gradient(135deg, #ffffff, #f8fafc)",
          borderColor: "#e2e8f0",
        }}
      >
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex min-w-0 items-center gap-3">
            <span
              className="grid h-11 w-11 shrink-0 place-items-center rounded-xl border"
              style={{
                background: "linear-gradient(135deg, #0d9488, #14b8a6)",
                borderColor: "#2dd4bf",
                color: "#ffffff",
                boxShadow: "0 6px 16px rgba(13,148,136,.25)",
              }}
            >
              <FileSpreadsheet className="h-5 w-5" />
            </span>

            <div className="min-w-0">
              <h2 className="usage-header truncate text-[16px] sm:text-[18px] font-black tracking-tight">
                سجل مفردات الاستخدامات
              </h2>
              <p className="truncate text-[12px] sm:text-[13px] font-bold mt-0.5" style={{ color: UI.muted }}>
                النفقات العامة شهراً بشهر
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <div className="rounded-xl border px-2.5 py-2 shadow-sm" style={{ background: "#ffffff", borderColor: "#cbd5e1" }}>
              <select
                value={importMonthId}
                onChange={(e) => setImportMonthId(Number(e.target.value))}
                className="bg-transparent text-[13px] font-bold outline-none"
                style={{ color: UI.text }}
                title="الشهر الافتراضي للاستيراد"
              >
                {MONTHS.map((m) => (
                  <option key={m.id} value={m.id} style={{ background: "#ffffff", color: "#0f172a" }}>
                    {m.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="web-only-actions">
              <WebActionMenu
                label="إجراءات سجل الاستخدامات"
                actions={[
                  { label: "استيراد Excel", icon: Upload, onSelect: handleImportClick },
                  { label: "تصدير Excel", icon: Download, onSelect: handleExportExcel },
                  { label: "تحويل PDF", icon: FileText, onSelect: handlePrint },
                  { label: "طباعة", icon: Printer, onSelect: handlePrint },
                  { label: "مسح الكل", icon: Eraser, onSelect: handleClearAll, destructive: true },
                ]}
              />
            </div>

            <div className="apk-only-actions flex flex-wrap items-center gap-2">
              <button
                onClick={handleImportClick}
                className="flex items-center gap-1.5 rounded-xl px-3 py-2 text-[13px] font-extrabold shadow-md active:scale-[0.98]"
                style={{ background: "linear-gradient(135deg, #0d9488, #0f766e)", color: "#ffffff", border: "1px solid #0f766e" }}
              >
                <Upload className="w-4 h-4" />
                استيراد Excel
              </button>

              <button
                onClick={handleExportExcel}
                className="flex items-center gap-1.5 rounded-xl px-3 py-2 text-[13px] font-extrabold shadow-md active:scale-[0.98]"
                style={{ background: "linear-gradient(135deg, #0284c7, #0369a1)", color: "#ffffff", border: "1px solid #0284c7" }}
              >
                <Download className="w-4 h-4" />
                تصدير Excel
              </button>

              <button
                onClick={handlePrint}
                className="flex items-center gap-1.5 rounded-xl px-3 py-2 text-[13px] font-extrabold shadow-md active:scale-[0.98]"
                style={{ background: "linear-gradient(135deg, #d97706, #b45309)", color: "#ffffff", border: "1px solid #d97706" }}
              >
                <FileText className="w-4 h-4" />
                تحويل PDF
              </button>

              <button
                onClick={handlePrint}
                className="flex items-center gap-1.5 rounded-xl px-3 py-2 text-[13px] font-extrabold shadow-md active:scale-[0.98]"
                style={{ background: "linear-gradient(135deg, #475569, #334155)", color: "#ffffff", border: "1px solid #334155" }}
              >
                <Printer className="w-4 h-4" />
                طباعة
              </button>

              <button
                onClick={handleClearAll}
                className="flex items-center gap-1.5 rounded-xl px-3 py-2 text-[13px] font-extrabold shadow-md active:scale-[0.98]"
                style={{ background: "linear-gradient(135deg, #e11d48, #be123c)", color: "#ffffff", border: "1px solid #e11d48" }}
              >
                <Eraser className="w-4 h-4" />
                مسح الكل
              </button>
            </div>

            <input ref={fileInputRef} type="file" accept=".xlsx,.xls" onChange={handleImportFile} className="hidden" />
          </div>
        </div>
      </div>

      {/* الجدول الرئيسي */}
      <div
        className="usage-table-shell  overflow-auto rounded-2xl border shadow-xl"
        style={{ maxHeight: "70vh", background: "#ffffff", borderColor: "#cbd5e1" }}
      >
        <table className="usage-table w-full table-auto border-collapse text-center [&_th]:whitespace-normal [&_th]:break-words [&_td]:whitespace-normal [&_td]:break-words">
    <thead className="sticky top-0 z-30" dangerouslySetInnerHTML={{ __html: THEAD_HTML }} />

          <tbody>
            {MONTHS.map((m) => {
              const rows = rowsByMonth[m.id] || [];
              const t = computedTotals[m.id];

              return (
                <React.Fragment key={m.id}>
                  {/* شريط الشهر */}
                  <tr className="month-row">
                    <td colSpan={TOTAL_COLS} className="text-right">
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <span className="font-black text-[13px] sm:text-[14px]">شهر {m.name}</span>
                        <button
                          onClick={() => handleAddRow(m.id)}
                          className="inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-[11px] sm:text-xs font-black transition-all"
                        >
                          <Plus className="w-3.5 h-3.5" />
                          إضافة سطر
                        </button>
                      </div>
                    </td>
                  </tr>

                  {/* صفوف البيانات */}
                  {rows.map((row) => (
                    <tr key={row.id}>
                      {mainHeaders.map((col) => (
                        <td key={col} className="bg-[#f8fafc]">
                          <EditableCell rowId={row.id} field={col} value={row[col]} onCommit={updateCell} />
                        </td>
                      ))}

                      {dataColumnsOrder.map((col) => {
                        const isFormula = isFormulaCol(col);
                        return (
                          <td key={col} className={isFormula ? "formula-col" : "bg-transparent"}>
                            {isFormula ? (
                              <FormulaCell value={row[col]} />
                            ) : (
                              <EditableCell rowId={row.id} field={col} value={row[col]} onCommit={updateCell} />
                            )}
                          </td>
                        );
                      })}

                      <td className="action-cell px-1.5">
                        <button
                          onClick={() => handleDeleteRow(row.id)}
                          className="delete-btn rounded-lg p-2"
                          aria-label="حذف السطر"
                          title="حذف السطر"
                        >
                          <Trash2 className="w-4 h-4 mx-auto" />
                        </button>
                      </td>
                    </tr>
                  ))}

                  {/* إجمالي الشهر */}
                  <tr className="total-current">
                    <td colSpan={4} className="border border-[#cbd5e1] px-2 py-2 text-right text-[12px] font-black">
                      إجمالي شهر {m.name}
                    </td>
                    {dataColumnsOrder.map((c) => (
                      <td key={c} className="border border-[#cbd5e1]">
                        <FormulaCell value={t.current(c)} />
                      </td>
                    ))}
                    <td className="border border-[#cbd5e1]" />
                  </tr>

                  {/* إجمالي الأشهر السابقة */}
                  <tr className="total-previous">
                    <td colSpan={4} className="border border-[#cbd5e1] px-2 py-2 text-right text-[12px] font-black">
                      إجمالي الأشهر السابقة (قبل {m.name})
                    </td>
                    {dataColumnsOrder.map((c) => (
                      <td key={c} className="border border-[#cbd5e1]">
                        <FormulaCell value={t.before(c)} />
                      </td>
                    ))}
                    <td className="border border-[#cbd5e1]" />
                  </tr>

                  {/* الإجمالي التراكمي */}
                  <tr className="total-cumulative">
                    <td colSpan={4} className="border border-[#cbd5e1] px-2 py-2 text-right text-[12px] font-black">
                      الإجمالي العام (حتى {m.name})
                    </td>
                    {dataColumnsOrder.map((c) => (
                      <td key={c} className="border border-[#cbd5e1]">
                        <div className="px-1.5 py-1 text-[12px] font-black text-[#92400e] font-mono" dir="ltr">
                          {formatNumberEn(t.cumulative(c)) || "-"}
                        </div>
                      </td>
                    ))}
                    <td className="border border-[#cbd5e1]" />
                  </tr>
                </React.Fragment>
              );
            })}
          </tbody>
        </table>
      </div>

      <div
        className="rounded-2xl border px-3 py-2.5 text-center text-[11px] sm:text-xs font-bold shadow-sm"
        style={{
          background: "linear-gradient(135deg, #ffffff, #f8fafc)",
          borderColor: "#e2e8f0",
          color: UI.muted,
        }}
      >
        يتم حفظ بيانات السجل تلقائياً داخل التطبيق مع بقاء وظائف الاستيراد والتصدير والطباعة كما هي.
      </div>
    </div>
  );
};

export default AppTabs;
