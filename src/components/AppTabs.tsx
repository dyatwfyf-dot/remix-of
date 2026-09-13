import React, { useEffect, useState, useRef, useCallback } from "react";
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
import * as XLSX from "xlsx";
import { useReportDate } from "@/lib/reportDate";
import { toast } from "sonner";
import { reportLetterheadHtml, runningLetterheadCss } from "@/lib/printTableHtml";
import { printReportHtml } from "@/lib/nativePrinter";
import { importUsageInWorker } from "@/lib/excelImportWorkerClient";
import { saveBlobToInternalStorage } from "@/lib/nativeFileStorage";
import WebActionMenu from "./WebActionMenu";

const mainHeaders = ["رقم الاستمارة", "كشف التسوية", "التاريخ", "البيان"];
const STORAGE_KEY = "app-tabs-usages-v1";

/* ============================================================
   لوحة الألوان الداكنة والعميقة — سجل مفردات الاستخدامات
   تعتمد على التدرجات الكحلية، التركواز، والبرونزي بدون الأبيض الداكن
   ============================================================ */
const UI = {
  page: "#071622",
  surface: "#0c2130",
  surface2: "#102f42",
  surface3: "#153b52",
  navy: "#0a1b28",
  navyLight: "#123246",
  teal: "#148686",
  tealDark: "#0e6768",
  turquoise: "#1eb3b0",
  bronze: "#c58538",
  bronzeLight: "#df9d54",
  pink: "#c44670",
  pinkDark: "#a2355a",
  cyanText: "#b2f0ee",
  text: "#eaf8fa",
  muted: "#8fb3c2",
  grid: "#284f61",
  row: "#0e2937",
  rowAlt: "#0a202d",
  formula: "#143748",
  formulaText: "#cff5f3",
};

const COLORS = {
  TOTAL_ALL: "#18384A",
  BAB_TOTAL: "#1B4B55",
  FASL: "#4A3146",
  BAND: "#704F2F",
};

const ARGB = {
  TOTAL_ALL: "FF18384A",
  BAB_TOTAL: "FF1B4B55",
  FASL: "FF4A3146",
  BAND: "FF704F2F",
  DARK: "FF0A1B28",
  GOLD: "FFDF9D54",
  CUR: "FF143748",
  PREV: "FF102A38",
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
  "مؤتمرات واحتفالات",
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

const isFormulaCol = (col: string) =>
  col.includes("اجمالي") || col.includes("الفصل");

const colArgb = (col: string) =>
  col === "اجمالي عام الاستخدامات"
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

const norm = (s: any) => String(s ?? "").replace(/\s+/g, " ").trim();

const normalizeDigits = (value: string) =>
  value.replace(/[٠-٩]/g, (digit) =>
    String("٠١٢٣٤٥٦٧٨٩".indexOf(digit)),
  );

const MONTH_ALIASES = [
  ["يناير", "jan", "january"],
  ["فبراير", "فبر", "feb", "february"],
  ["مارس", "mar", "march"],
  ["أبريل", "ابريل", "apr", "april"],
  ["مايو", "may"],
  ["يونيو", "يونية", "jun", "june"],
  ["يوليو", "july", "jul"],
  ["أغسطس", "اغسطس", "aug", "august"],
  ["سبتمبر", "sep", "september"],
  ["أكتوبر", "اكتوبر", "oct", "october"],
  ["نوفمبر", "nov", "november"],
  ["ديسمبر", "dec", "december"],
];

const parseMonthId = (value: any): number | null => {
  if (value instanceof Date && !Number.isNaN(value.getTime())) {
    return value.getMonth() + 1;
  }

  const text = normalizeDigits(norm(value)).toLowerCase();
  if (!text) return null;

  const aliasIndex = MONTH_ALIASES.findIndex((aliases) =>
    aliases.some(
      (alias) =>
        text === alias ||
        text.startsWith(`${alias} `) ||
        text.includes(`شهر ${alias}`) ||
        text.includes(`month ${alias}`),
    ),
  );

  if (aliasIndex >= 0) return aliasIndex + 1;

  const monthLabel = text.match(/(?:شهر|month)\s*([0-9]{1,2})/);
  if (monthLabel) {
    const month = Number(monthLabel[1]);
    if (month >= 1 && month <= 12) return month;
  }

  const yearFirst = text.match(
    /(?:^|[^0-9])20[0-9]{2}[\/\\.-]([0-9]{1,2})(?:[\/\\.-][0-9]{1,2})?(?:$|[^0-9])/,
  );

  if (yearFirst) {
    const month = Number(yearFirst[1]);
    if (month >= 1 && month <= 12) return month;
  }

  const numeric = Number(text.replace(/,/g, ""));
  return Number.isInteger(numeric) && numeric >= 1 && numeric <= 12
    ? numeric
    : null;
};

const formatNumberEn = (val: any) => {
  if (val === "" || val === null || val === undefined) return "";

  const num = Number(val);
  if (isNaN(num)) return val;

  return new Intl.NumberFormat("en-US", {
    maximumFractionDigits: 2,
  }).format(num);
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
    "مؤتمرات واحتفالات",
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

const EditableCell: React.FC<{
  rowId: string;
  field: string;
  value: any;
  onCommit: (rowId: string, field: string, value: string) => void;
}> = React.memo(({ rowId, field, value, onCommit }) => {
  const isDate = field === "التاريخ";

  return (
    <input
      type={isDate ? "date" : "text"}
      value={value ?? ""}
      onChange={(e) => onCommit(rowId, field, e.target.value)}
      dir={
        isDate
          ? "ltr"
          : /^[\d.,\-]*$/.test(String(value ?? ""))
            ? "ltr"
            : "rtl"
      }
      className="
        w-full h-full min-w-[76px]
        rounded-md
        border border-transparent
        bg-transparent
        px-1.5 py-1.5
        text-center
        text-[12px] sm:text-[13px]
        font-semibold
        text-[#e8f8f9]
        transition-all duration-150
        placeholder:text-[#5a8090]
        focus:border-[#1eb3b0]
        focus:bg-[#143748]
        focus:outline-none
        focus:ring-2 focus:ring-[#1eb3b0]/35
      "
    />
  );
});

EditableCell.displayName = "EditableCell";

const FormulaCell: React.FC<{ value: any }> = React.memo(({ value }) => (
  <div
    className="
      rounded-md
      px-1.5 py-1
      text-center
      text-[12px] sm:text-[13px]
      font-black
      text-[#cff5f3]
      font-mono
      tabular-nums
    "
    dir="ltr"
  >
    {formatNumberEn(value)}
  </div>
));

FormulaCell.displayName = "FormulaCell";

const THEAD_HTML = `
<tr>
  <th rowspan="4" class="c-main">رقم الاستمارة</th>
  <th rowspan="4" class="c-main">كشف التسوية</th>
  <th rowspan="4" class="c-main">التاريخ</th>
  <th rowspan="4" class="c-main">البيان</th>
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
  <th rowspan="3" class="c-main">مركز صحي قحزة</th>
  <th rowspan="3" class="c-main">وحدة الغسيل الكلوي</th>
  <th rowspan="3" class="c-main">مشروع دعم الكلى</th>
  <th rowspan="3" class="c-main">الصالة والمطبخ</th>
  <th rowspan="3" class="c-main">مركز صحي</th>
  <th rowspan="3" class="c-main">الامانات</th>
</tr>
<tr>
  <th rowspan="2" class="c-fasl">إجمالي ف1</th>
  <th colspan="8" class="c-band">المرتبات والأجور</th>
  <th rowspan="2" class="c-fasl">إجمالي ف2</th>
  <th rowspan="2" class="c-main">ح/حكومة</th>
  <th rowspan="2" class="c-main">اصابة عمل</th>
  <th rowspan="2" class="c-fasl">إجمالي ف1</th>
  <th rowspan="2" class="c-main">مياه</th>
  <th rowspan="2" class="c-main">انارة</th>
  <th rowspan="2" class="c-main">ادوات كتابية</th>
  <th rowspan="2" class="c-main">نشر واعلان</th>
  <th rowspan="2" class="c-main">اتصالات</th>
  <th rowspan="2" class="c-main">مؤتمرات</th>
  <th rowspan="2" class="c-main">نظافة</th>
  <th rowspan="2" class="c-main">اخرى</th>
  <th rowspan="2" class="c-main">نقل مهام</th>
  <th rowspan="2" class="c-main">انتقالات</th>
  <th rowspan="2" class="c-main">ايجار مباني</th>
  <th rowspan="2" class="c-main">ادوية</th>
  <th rowspan="2" class="c-main">اغذية</th>
  <th rowspan="2" class="c-main">اخرى2</th>
  <th rowspan="2" class="c-fasl">إجمالي ف2</th>
  <th rowspan="2" class="c-main">صيانة مباني</th>
  <th rowspan="2" class="c-main">وقود وزيوت</th>
  <th rowspan="2" class="c-main">قطع غيار نقل</th>
  <th rowspan="2" class="c-main">قطع غيار معدات</th>
</tr>
<tr>
  <th>اساسية</th>
  <th>تعاقدية</th>
  <th>اضافي</th>
  <th>مكافات</th>
  <th>طبيعة عمل</th>
  <th>بدل ريف</th>
  <th>بدل سكن</th>
  <th>تحديث</th>
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
        localStorage.setItem(
          STORAGE_KEY,
          JSON.stringify(latestDataRows.current),
        );
      } catch (error) {
        console.error("[Storage] Failed to persist usage rows", error);
      }

      storageTimer.current = null;
    }, 80);

    return () => {
      if (storageTimer.current) clearTimeout(storageTimer.current);
    };
  }, [dataRows]);

  useEffect(() => {
    const flush = () => {
      if (storageTimer.current) clearTimeout(storageTimer.current);

      try {
        localStorage.setItem(
          STORAGE_KEY,
          JSON.stringify(latestDataRows.current),
        );
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

  const rowsOfMonth = useCallback(
    (id: number) => dataRows.filter((r) => r.monthId === id),
    [dataRows],
  );

  const makeEmptyRow = (monthId: number) => {
    const r: any = {
      id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      monthId,
    };

    mainHeaders.forEach((h) => (r[h] = ""));
    dataColumnsOrder.forEach((h) => (r[h] = ""));

    return recomputeRow(r);
  };

  useEffect(() => {
    setDataRows((prev) => {
      const counts: Record<number, number> = {};

      prev.forEach(
        (r) => (counts[r.monthId] = (counts[r.monthId] || 0) + 1),
      );

      const additions: any[] = [];

      MONTHS.forEach((m) => {
        if (!counts[m.id]) {
          additions.push(makeEmptyRow(m.id), makeEmptyRow(m.id));
        }
      });

      return additions.length ? [...prev, ...additions] : prev;
    });
  }, []);

  const updateCell = useCallback(
    (rowId: string, key: string, rawValue: string) => {
      setDataRows((prev) =>
        prev.map((row) =>
          row.id === rowId
            ? recomputeRow({ ...row, [key]: rawValue })
            : row,
        ),
      );
    },
    [],
  );

  const handleAddRow = (monthId: number) =>
    setDataRows((prev) => [...prev, makeEmptyRow(monthId)]);

  const handleDeleteRow = (rowId: string) => {
    if (!window.confirm("هل تريد حذف هذا السطر؟")) return;
    setDataRows((prev) => prev.filter((row) => row.id !== rowId));
  };

  const handleClearAll = () => {
    if (
      !window.confirm(
        "سيتم حذف جميع بيانات كل الأشهر نهائياً. هل أنت متأكد؟",
      )
    ) {
      return;
    }

    const fresh: any[] = [];

    MONTHS.forEach((m) =>
      fresh.push(makeEmptyRow(m.id), makeEmptyRow(m.id)),
    );

    setDataRows(fresh);
  };

  const sumOf = (rows: any[], col: string) =>
    rows.reduce((acc, row) => acc + (Number(row[col]) || 0), 0);

  const monthTotals = (id: number) => {
    const cur = rowsOfMonth(id);
    const before = dataRows.filter((r) => r.monthId < id);
    const cum = dataRows.filter((r) => r.monthId <= id);

    return {
      current: (c: string) => sumOf(cur, c),
      before: (c: string) => sumOf(before, c),
      cumulative: (c: string) => sumOf(cum, c),
    };
  };

  const handleImportClick = () => fileInputRef.current?.click();

  const handleImportFile = async (
    e: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;

    e.target.value = "";

    try {
      const imported = await importUsageInWorker(file, importMonthId);

      if (!imported.length) {
        toast.error(
          "لم يتم العثور على صفوف استخدامات صالحة في ملف Excel",
        );
        return;
      }

      const importedMonths = new Set(
        imported.map((row: any) => row.monthId),
      );

      setDataRows((prev) => [
        ...prev.filter((row) => !importedMonths.has(row.monthId)),
        ...imported,
      ]);

      toast.success(
        `تم استيراد ${imported.length} صف إلى ${importedMonths.size} شهر`,
      );
    } catch (error) {
      console.error("[Excel] Usage import failed", error);

      toast.error(
        "تعذّر قراءة الملف. تأكد أنه ملف Excel صالح أو صادر من هذا الجدول.",
      );
    }
  };

  const border = {
    top: {
      style: "thin" as const,
      color: { argb: "FF203F4E" },
    },
    left: {
      style: "thin" as const,
      color: { argb: "FF203F4E" },
    },
    bottom: {
      style: "thin" as const,
      color: { argb: "FF203F4E" },
    },
    right: {
      style: "thin" as const,
      color: { argb: "FF203F4E" },
    },
  };

  const handleExportExcel = async () => {
    const ExcelJS = (await import("exceljs")).default;
    const wb = new ExcelJS.Workbook();

    const disp = wb.addWorksheet("عرض", {
      views: [{ rightToLeft: true, state: "frozen", ySplit: 2 }],
      properties: {
        defaultRowHeight: 20,
        tabColor: { argb: ARGB.DARK },
      },
      pageSetup: {
        orientation: "landscape",
        paperSize: 9,
        fitToPage: true,
        fitToWidth: 1,
        fitToHeight: 0,
        horizontalDpi: 300,
        verticalDpi: 300,
        margins: {
          left: 0.25,
          right: 0.25,
          top: 0.35,
          bottom: 0.35,
          header: 0.15,
          footer: 0.15,
        },
      },
    });

    disp.mergeCells(1, 1, 1, allCols.length);

    const title = disp.getCell(1, 1);
    title.value = "سجل مفردات الاستخدامات والنفقات العامة";

    title.font = {
      bold: true,
      size: 14,
      color: { argb: "FFEAF8FA" },
    };

    title.fill = {
      type: "pattern",
      pattern: "solid",
      fgColor: { argb: ARGB.DARK },
    };

    title.alignment = {
      horizontal: "center",
      vertical: "middle",
      wrapText: true,
      shrinkToFit: true,
    };

    disp.getRow(1).height = 28;

    const hdr = disp.getRow(2);
    hdr.height = 40;

    allCols.forEach((c, i) => {
      const cell = hdr.getCell(i + 1);

      cell.value = c;

      cell.font = {
        bold: true,
        size: 9,
        color: { argb: "FFEAF8FA" },
      };

      cell.alignment = {
        horizontal: "center",
        vertical: "middle",
        wrapText: true,
        shrinkToFit: true,
      };

      cell.border = border;

      const argb = colArgb(c) || ARGB.DARK;

      cell.fill = {
        type: "pattern",
        pattern: "solid",
        fgColor: { argb },
      };
    });

    disp.getColumn(1).width = 12;

    allCols.forEach((_, i) =>
      (disp.getColumn(i + 1).width = i < 4 ? 14 : 11),
    );

    let r = 3;

    MONTHS.forEach((m) => {
      const rows = rowsOfMonth(m.id);
      const t = monthTotals(m.id);

      disp.mergeCells(r, 1, r, allCols.length);

      const mc = disp.getCell(r, 1);
      mc.value = `شهر ${m.name}`;

      mc.font = {
        bold: true,
        color: { argb: ARGB.GOLD },
      };

      mc.fill = {
        type: "pattern",
        pattern: "solid",
        fgColor: { argb: ARGB.DARK },
      };

      mc.alignment = {
        horizontal: "right",
        vertical: "middle",
        wrapText: true,
        shrinkToFit: true,
      };

      r++;

      rows.forEach((row) => {
        allCols.forEach((c, i) => {
          const cell = disp.getCell(r, i + 1);
          const v = row[c];

          cell.value =
            typeof v === "number"
              ? v
              : v === ""
                ? ""
                : isNaN(Number(v))
                  ? v
                  : Number(v);

          cell.alignment = {
            horizontal: "center",
            vertical: "middle",
            wrapText: true,
            shrinkToFit: true,
          };

          cell.font = {
            size: 9,
            bold: isFormulaCol(c),
            color: { argb: "FFEAF8FA" },
          };

          cell.border = border;

          const argb = colArgb(c) || "FF0E2937";

          cell.fill = {
            type: "pattern",
            pattern: "solid",
            fgColor: { argb },
          };
        });

        r++;
      });

      const rowCur = (
        label: string,
        getter: (c: string) => number,
        fillArgb: string,
        fontArgb: string,
      ) => {
        disp.mergeCells(r, 1, r, 4);

        const lc = disp.getCell(r, 1);

        lc.value = label;
        lc.font = {
          bold: true,
          color: { argb: fontArgb },
        };

        lc.alignment = {
          horizontal: "right",
          vertical: "middle",
          wrapText: true,
          shrinkToFit: true,
        };

        lc.fill = {
          type: "pattern",
          pattern: "solid",
          fgColor: { argb: fillArgb },
        };

        dataColumnsOrder.forEach((c, i) => {
          const cell = disp.getCell(r, 5 + i);
          const val = getter(c);

          cell.value = val || "";

          cell.font = {
            bold: true,
            size: 9,
            color: { argb: fontArgb },
          };

          cell.alignment = {
            horizontal: "center",
            vertical: "middle",
            wrapText: true,
            shrinkToFit: true,
          };

          cell.border = border;

          cell.fill = {
            type: "pattern",
            pattern: "solid",
            fgColor: { argb: fillArgb },
          };
        });

        r++;
      };

      rowCur(
        `إجمالي شهر ${m.name}`,
        t.current,
        ARGB.CUR,
        "FFCFF5F3",
      );

      rowCur(
        `إجمالي الأشهر السابقة (قبل ${m.name})`,
        t.before,
        ARGB.PREV,
        "FF8FB3C2",
      );

      rowCur(
        `الإجمالي العام (حتى ${m.name})`,
        t.cumulative,
        ARGB.DARK,
        ARGB.GOLD,
      );
    });

    for (let col = 1; col <= allCols.length; col++) {
      let maxLength = allCols[col - 1].length;

      for (let row = 1; row <= disp.rowCount; row++) {
        const value = disp.getCell(row, col).value;

        maxLength = Math.max(
          maxLength,
          String(value ?? "").length,
        );
      }

      disp.getColumn(col).width = Math.min(
        22,
        Math.max(col <= 4 ? 12 : 9, maxLength + 2),
      );
    }

    disp.pageSetup.printArea = `A1:${XLSX.utils.encode_col(
      Math.min(allCols.length, 16384) - 1,
    )}${Math.max(1, disp.rowCount)}`;

    disp.pageSetup.printTitlesRow = "2:2";

    disp.headerFooter = {
      oddFooter:
        '&L&"Arial"المجلس اليمني للاختصاصات الطبية&C&"Arial"صفحة &P من &N&R&"Arial"فرع صعدة',
    };

    const flat = wb.addWorksheet("بيانات", {
      views: [{ rightToLeft: true }],
    });

    flat.addRow(["monthId", ...allCols]);
    flat.getRow(1).height = 34;

    flat.getRow(1).eachCell(
      { includeEmpty: true },
      (cell: any) => {
        cell.font = {
          bold: true,
          size: 9,
          color: { argb: "FFEAF8FA" },
        };

        cell.fill = {
          type: "pattern",
          pattern: "solid",
          fgColor: { argb: ARGB.DARK },
        };

        cell.alignment = {
          horizontal: "center",
          vertical: "middle",
          wrapText: true,
          shrinkToFit: true,
        };

        cell.border = border;
      },
    );

    MONTHS.forEach((m) =>
      rowsOfMonth(m.id).forEach((row) =>
        flat.addRow([m.id, ...allCols.map((c) => row[c])]),
      ),
    );

    flat.eachRow(
      { includeEmpty: true },
      (row: any) => {
        row.eachCell(
          { includeEmpty: true },
          (cell: any) => {
            cell.alignment = {
              horizontal: "center",
              vertical: "middle",
              wrapText: true,
              shrinkToFit: true,
            };

            cell.border = border;
          },
        );
      },
    );

    allCols.forEach((col, index) => {
      const maxLength = Math.max(
        col.length,
        ...flat
          .getColumn(index + 2)
          .values.slice(1)
          .map((value: any) => String(value ?? "").length),
      );

      flat.getColumn(index + 2).width = Math.min(
        22,
        Math.max(9, maxLength + 2),
      );
    });

    flat.pageSetup = {
      orientation: "landscape",
      paperSize: 9,
      fitToPage: true,
      fitToWidth: 1,
      fitToHeight: 0,
      margins: {
        left: 0.25,
        right: 0.25,
        top: 0.35,
        bottom: 0.35,
        header: 0.15,
        footer: 0.15,
      },
    };

    flat.pageSetup.printArea = `A1:${XLSX.utils.encode_col(
      Math.min(allCols.length + 1, 16384) - 1,
    )}${Math.max(1, flat.rowCount)}`;

    flat.pageSetup.printTitlesRow = "1:1";

    flat.headerFooter = {
      oddFooter:
        '&L&"Arial"المجلس اليمني للاختصاصات الطبية&C&"Arial"صفحة &P من &N&R&"Arial"فرع صعدة',
    };

    const buf = await wb.xlsx.writeBuffer();

    const blob = new Blob([buf], {
      type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    });

    const fileName = `الاستخدامات-${reportDate}.xlsx`;

    const internalUri = await saveBlobToInternalStorage(
      blob,
      fileName,
    );

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
    const numCell = (v: number) =>
      v > 0 ? formatNumberEn(v) : "-";

    let body = "";

    MONTHS.forEach((m) => {
      const rows = rowsOfMonth(m.id);
      const t = monthTotals(m.id);

      body += `<tr class="month"><td colspan="${TOTAL_COLS}">شهر ${m.name}</td></tr>`;

      rows.forEach((row) => {
        body += "<tr>";

        mainHeaders.forEach((h) => {
          const cls =
            h === "التاريخ"
              ? "date-cell"
              : h === "رقم الاستمارة"
                ? "num numeric-cell"
                : "text-cell";

          body += `<td class="${cls}">${row[h] ?? ""}</td>`;
        });

        dataColumnsOrder.forEach((c) => {
          const cls = `num numeric-cell${
            isFormulaCol(c) ? " formula" : ""
          }`;

          body += `<td class="${cls}">${
            row[c] === "" || row[c] === undefined
              ? ""
              : formatNumberEn(row[c])
          }</td>`;
        });

        body += `<td class="text-cell"></td></tr>`;
      });

      const totalRow = (
        label: string,
        cls: string,
        getter: (c: string) => number,
      ) => {
        let tr = `<tr class="${cls}"><td class="text-cell" colspan="4">${label}</td>`;

        dataColumnsOrder.forEach(
          (c) =>
            (tr += `<td class="num numeric-cell">${numCell(
              getter(c),
            )}</td>`),
        );

        tr += `<td class="text-cell"></td></tr>`;

        return tr;
      };

      body += totalRow(
        `إجمالي شهر ${m.name}`,
        "t-cur",
        t.current,
      );

      body += totalRow(
        `إجمالي الأشهر السابقة (قبل ${m.name})`,
        "t-prev",
        t.before,
      );

      body += totalRow(
        `الإجمالي العام (حتى ${m.name})`,
        "t-cum",
        t.cumulative,
      );
    });

    return `<!doctype html><html lang="ar" dir="rtl"><head><meta charset="utf-8">
    <title>سجل مفردات الاستخدامات والنفقات العامة - ${reportDateLabel}</title>
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Cairo:wght@600;700;800&family=Tajawal:wght@400;500;700&display=swap">
    <style>
      @page { size:A4 landscape; margin:3mm; }
      * { box-sizing:border-box; }
      html, body { margin:0; padding:0; }
      body { font-family:'Cairo','Tajawal','Segoe UI',Tahoma,Arial,sans-serif; direction:rtl; color:#0c2130 !important; padding:0 1px; width:100%; font-weight:700 !important; }
      .report-letterhead-block { display:flex; width:100%; max-width:none; height:30mm; min-height:30mm; max-height:30mm; overflow:hidden; align-items:stretch; justify-content:center; margin:0 0 3mm; page-break-before:avoid; page-break-after:avoid; }
      .report-letterhead-image { display:block; width:100% !important; max-width:none !important; height:100% !important; max-height:100% !important; object-fit:fill !important; object-position:top; margin:0 !important; }
      h2 { text-align:center; color:#0c2130 !important; margin:0 0 3mm; font-weight:800; }
      .report-date { text-align:center; color:#153b52 !important; margin:0 0 5px; font-size:10px; font-weight:700; }
      table { width:100%; max-width:100%; min-width:0; border-collapse:collapse; table-layout:auto !important; font-size:clamp(14px,1.05vw,16px); }
      th, td { border:1px solid #284f61; padding:2px 3px !important; text-align:center; vertical-align:middle; white-space:normal; overflow:visible; overflow-wrap:break-word; word-break:normal; hyphens:none; line-height:1.15; font-size:clamp(14px,1.05vw,16px); color:#0c2130 !important; font-weight:700 !important; -webkit-print-color-adjust:exact !important; print-color-adjust:exact !important; }
      .num, .numeric-cell, .date-cell { width:1%; min-width:0; white-space:nowrap !important; overflow:visible; overflow-wrap:normal; word-break:keep-all; hyphens:none; font-family:'Times New Roman',Times,serif !important; font-size:clamp(14px,1vw,16px) !important; font-variant-numeric:tabular-nums; direction:ltr; }
      .text-cell { width:auto; white-space:normal; overflow-wrap:break-word; word-break:normal; }
      .report-letterhead-cell { padding:0 !important; border:0 !important; width:100%; }
      thead th { background:#102f42; font-weight:700; color:#eaf8fa !important; -webkit-print-color-adjust:exact !important; print-color-adjust:exact !important; }
      thead .c-total { background:${COLORS.TOTAL_ALL}; color:#eaf8fa !important; -webkit-print-color-adjust:exact !important; print-color-adjust:exact !important; }
      thead .c-bab   { background:${COLORS.BAB_TOTAL}; color:#eaf8fa !important; -webkit-print-color-adjust:exact !important; print-color-adjust:exact !important; }
      thead .c-fasl  { background:${COLORS.FASL}; color:#eaf8fa !important; -webkit-print-color-adjust:exact !important; print-color-adjust:exact !important; }
      thead .c-band  { background:${COLORS.BAND}; color:#eaf8fa !important; -webkit-print-color-adjust:exact !important; print-color-adjust:exact !important; }
      td.formula { background:#143748; font-weight:700; color:#cff5f3 !important; -webkit-print-color-adjust:exact !important; print-color-adjust:exact !important; }
      tr.month td { background:#0a1b28; color:#df9d54 !important; font-weight:800 !important; text-align:center; padding:0 !important; -webkit-print-color-adjust:exact !important; print-color-adjust:exact !important; }
      tr.t-cur td  { background:#143748; color:#cff5f3 !important; font-weight:700 !important; -webkit-print-color-adjust:exact !important; print-color-adjust:exact !important; }
      tr.t-prev td { background:#102a38; color:#8fb3c2 !important; font-weight:700 !important; -webkit-print-color-adjust:exact !important; print-color-adjust:exact !important; }
      tr.t-cum td  { background:#0a1b28; color:#df9d54 !important; font-weight:800 !important; -webkit-print-color-adjust:exact !important; print-color-adjust:exact !important; }
      tr.t-cur td:first-child, tr.t-prev td:first-child, tr.t-cum td:first-child { text-align:center; padding-right:4px; }
      @media print { @page { size:A4 landscape; margin:3mm; } }
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
      `سجل مفردات الاستخدامات والنفقات العامة - ${reportDateLabel}`,
    );

    if (!opened) {
      toast.error(
        "تم منع فتح نافذة الطباعة، يرجى السماح بالنوافذ المنبثقة",
      );
    }
  };

  const handlePdf = () => {
    handlePrint();
  };

  return (
    <div
      className="sheet-tabs-ui apk-tabs-ui w-full space-y-4 p-2 sm:p-3 font-tajawal"
      style={{
        background:
          "radial-gradient(circle at top right, #102f42 0%, #071622 42%, #040c14 100%)",
        color: UI.text,
      }}
      dir="rtl"
    >
      <style>{`
.usage-table-shell {
  scrollbar-color: #0d9488 #f1f5f9;
}

.usage-table {
  font-family: "Tajawal", "Noto Sans Arabic", sans-serif;
}

.usage-table th {
  position: sticky;
  top: 0;
  z-index: 20;
  color: #ffffff;
  border: 1px solid #94a3b8;
  padding: 10px 8px;
  text-align: center;
  vertical-align: middle;
  white-space: nowrap;
  font-size: 12px;
  font-weight: 900;
  line-height: 1.25;
  background: linear-gradient(180deg, #1e293b 0%, #0f172a 100%);
}

.usage-table td {
  border: 1px solid #cbd5e1;
  padding: 0;
  vertical-align: middle;
}

.usage-table tbody tr {
  background: #ffffff;
  transition: background .15s ease;
}

.usage-table tbody tr:nth-child(even) {
  background: #f8fafc;
}

.usage-table tbody tr:hover {
  background: #e0f2fe;
}

/* صف الشهر الفاتح المتدرج */
.usage-table .month-row td {
  background: linear-gradient(90deg, #e0f2fe 0%, #f0fdf4 50%, #fef2f2 100%);
  color: #0369a1;
  border-color: #cbd5e1;
  font-weight: 900;
  padding: 8px 12px;
  box-shadow: inset 0 2px 0 #0d9488;
}

.usage-table .month-row button {
  color: #ffffff;
  background: linear-gradient(135deg, #0d9488, #06b6d4);
  border: none;
  box-shadow: 0 2px 6px rgba(13, 148, 136, 0.25);
}

.usage-table .month-row button:hover {
  opacity: 0.9;
}

/* صفوف الإجماليات */
.usage-table .total-current td {
  background: #ccfbf1;
  color: #0f766e;
  font-weight: 900;
}

.usage-table .total-previous td {
  background: #f1f5f9;
  color: #475569;
  font-weight: 900;
}

.usage-table .total-cumulative td {
  background: linear-gradient(90deg, #fef3c7 0%, #fef9c3 100%);
  color: #92400e;
  font-weight: 900;
}

.usage-table .formula-col {
  background: rgba(204, 251, 241, 0.3);
}

.usage-table .formula-col > div {
  color: #0f766e;
  font-weight: 800;
}

.usage-table .delete-btn {
  color: #e11d48;
  transition: all .15s ease;
}

.usage-table .delete-btn:hover {
  color: #ffffff;
  background: #be123c;
}
`}</style>

      {/* شريط العنوان والإجراءات */}
      <div
        className="rounded-2xl border p-3 sm:p-4 shadow-2xl"
        style={{
          background:
            "linear-gradient(135deg, rgba(12,33,48,.98), rgba(16,47,66,.98))",
          borderColor: "#285466",
        }}
      >
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex min-w-0 items-center gap-3">
            <span
              className="grid h-11 w-11 shrink-0 place-items-center rounded-xl border"
              style={{
                background:
                  "linear-gradient(135deg, #c58538, #df9d54)",
                borderColor: "#e8b272",
                color: "#051622",
                boxShadow: "0 7px 18px rgba(0,0,0,.32)",
              }}
            >
              <FileSpreadsheet className="h-5 w-5" />
            </span>

            <div className="min-w-0">
              <h2
                className="usage-header truncate text-[16px] sm:text-[18px] font-black tracking-tight"
              >
                سجل مفردات الاستخدامات
              </h2>

              <p
                className="truncate text-[12px] sm:text-[13px] font-bold mt-0.5"
                style={{ color: UI.muted }}
              >
                النفقات العامة شهراً بشهر
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <div
              className="rounded-xl border px-2.5 py-2"
              style={{
                background: UI.surface,
                borderColor: "#285466",
              }}
            >
              <select
                value={importMonthId}
                onChange={(e) =>
                  setImportMonthId(Number(e.target.value))
                }
                className="bg-transparent text-[13px] font-bold outline-none"
                style={{ color: UI.text }}
                title="الشهر الافتراضي للاستيراد (إن لم يحتوِ الملف عمود الشهر)"
              >
                {MONTHS.map((m) => (
                  <option
                    key={m.id}
                    value={m.id}
                    style={{
                      background: "#0c2130",
                      color: "#eaf8fa",
                    }}
                  >
                    {m.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="web-only-actions">
              <WebActionMenu
                label="إجراءات سجل الاستخدامات"
                actions={[
                  {
                    label: "استيراد Excel",
                    icon: Upload,
                    onSelect: handleImportClick,
                  },
                  {
                    label: "تصدير Excel",
                    icon: Download,
                    onSelect: handleExportExcel,
                  },
                  {
                    label: "تحويل PDF",
                    icon: FileText,
                    onSelect: handlePdf,
                  },
                  {
                    label: "طباعة",
                    icon: Printer,
                    onSelect: handlePrint,
                  },
                  {
                    label: "مسح الكل",
                    icon: Eraser,
                    onSelect: handleClearAll,
                    destructive: true,
                  },
                ]}
              />
            </div>

            <div className="apk-only-actions flex flex-wrap items-center gap-2">
              <button
                onClick={handleImportClick}
                className="flex items-center gap-1.5 rounded-xl px-3 py-2 text-[13px] font-extrabold shadow-lg active:scale-[0.98] transition-transform"
                style={{
                  background: UI.tealDark,
                  color: "#e2fbfb",
                  border: `1px solid ${UI.teal}`,
                }}
              >
                <Upload className="w-4 h-4" />
                استيراد Excel
              </button>

              <button
                onClick={handleExportExcel}
                className="flex items-center gap-1.5 rounded-xl px-3 py-2 text-[13px] font-extrabold shadow-lg active:scale-[0.98] transition-transform"
                style={{
                  background: UI.surface3,
                  color: "#dbf9f8",
                  border: "1px solid #285e6e",
                }}
              >
                <Download className="w-4 h-4" />
                تصدير Excel
              </button>

              <button
                onClick={handlePdf}
                className="flex items-center gap-1.5 rounded-xl px-3 py-2 text-[13px] font-extrabold shadow-lg active:scale-[0.98] transition-transform"
                style={{
                  background: UI.bronze,
                  color: "#08151f",
                  border: "1px solid #dfa561",
                }}
              >
                <FileText className="w-4 h-4" />
                تحويل PDF
              </button>

              <button
                onClick={handlePrint}
                className="flex items-center gap-1.5 rounded-xl px-3 py-2 text-[13px] font-extrabold shadow-lg active:scale-[0.98] transition-transform"
                style={{
                  background: UI.navy,
                  color: "#eaf8fa",
                  border: "1px solid #255365",
                }}
              >
                <Printer className="w-4 h-4" />
                طباعة
              </button>

              <button
                onClick={handleClearAll}
                className="flex items-center gap-1.5 rounded-xl px-3 py-2 text-[13px] font-extrabold shadow-lg active:scale-[0.98] transition-transform"
                style={{
                  background: UI.pinkDark,
                  color: "#ffeff4",
                  border: "1px solid #ce5f83",
                }}
              >
                <Eraser className="w-4 h-4" />
                مسح الكل
              </button>
            </div>

            <input
              ref={fileInputRef}
              type="file"
              accept=".xlsx,.xls"
              onChange={handleImportFile}
              className="hidden"
            />
          </div>
        </div>
      </div>

      {/* الجدول الرئيسي */}
      <div
        className="usage-table-shell w-full overflow-auto rounded-2xl border shadow-2xl"
        style={{
          maxHeight: "70vh",
          background: UI.page,
          borderColor: "#285466",
        }}
      >
        <table className="usage-table w-auto table-auto border-collapse text-center">
          <thead
            className="sticky top-0 z-30"
            dangerouslySetInnerHTML={{ __html: THEAD_HTML }}
          />

          <tbody>
            {MONTHS.map((m) => {
              const rows = rowsOfMonth(m.id);
              const t = monthTotals(m.id);

              return (
                <React.Fragment key={m.id}>
                  {/* شريط الشهر */}
                  <tr className="month-row">
                    <td
                      colSpan={TOTAL_COLS}
                      className="text-right"
                    >
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <span className="font-black text-[13px] sm:text-[14px]">
                          شهر {m.name}
                        </span>

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
                        <td
                          key={col}
                          className="bg-[#0e2735]"
                        >
                          <EditableCell
                            rowId={row.id}
                            field={col}
                            value={row[col]}
                            onCommit={updateCell}
                          />
                        </td>
                      ))}

                      {dataColumnsOrder.map((col) => {
                        const isFormula = isFormulaCol(col);

                        return (
                          <td
                            key={col}
                            className={
                              isFormula
                                ? "formula-col"
                                : "bg-transparent"
                            }
                          >
                            {isFormula ? (
                              <FormulaCell value={row[col]} />
                            ) : (
                              <EditableCell
                                rowId={row.id}
                                field={col}
                                value={row[col]}
                                onCommit={updateCell}
                              />
                            )}
                          </td>
                        );
                      })}

                      {/* زر الحذف */}
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
                    <td
                      colSpan={4}
                      className="border border-[#284f61] px-2 py-2 text-right text-[12px] font-black"
                    >
                      إجمالي شهر {m.name}
                    </td>

                    {dataColumnsOrder.map((c) => (
                      <td key={c} className="border border-[#284f61]">
                        <FormulaCell value={t.current(c)} />
                      </td>
                    ))}

                    <td className="border border-[#284f61]" />
                  </tr>

                  {/* إجمالي الأشهر السابقة */}
                  <tr className="total-previous">
                    <td
                      colSpan={4}
                      className="border border-[#284f61] px-2 py-2 text-right text-[12px] font-black"
                    >
                      إجمالي الأشهر السابقة (قبل {m.name})
                    </td>

                    {dataColumnsOrder.map((c) => (
                      <td key={c} className="border border-[#284f61]">
                        <FormulaCell value={t.before(c)} />
                      </td>
                    ))}

                    <td className="border border-[#284f61]" />
                  </tr>

                  {/* الإجمالي التراكمي */}
                  <tr className="total-cumulative">
                    <td
                      colSpan={4}
                      className="border border-[#284f61] px-2 py-2 text-right text-[12px] font-black"
                    >
                      الإجمالي العام (حتى {m.name})
                    </td>

                    {dataColumnsOrder.map((c) => (
                      <td key={c} className="border border-[#284f61]">
                        <div
                          className="px-1.5 py-1 text-[12px] font-black text-[#df9d54] font-mono"
                          dir="ltr"
                        >
                          {formatNumberEn(t.cumulative(c)) || "-"}
                        </div>
                      </td>
                    ))}

                    <td className="border border-[#284f61]" />
                  </tr>
                </React.Fragment>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* شريط سفلي */}
      <div
        className="rounded-2xl border px-3 py-2.5 text-center text-[11px] sm:text-xs font-bold"
        style={{
          background: "rgba(12,33,48,.85)",
          borderColor: "#204656",
          color: UI.muted,
        }}
      >
        يتم حفظ بيانات السجل تلقائياً داخل التطبيق مع بقاء وظائف الاستيراد
        والتصدير والطباعة كما هي.
      </div>
    </div>
  );
};

export default AppTabs;
