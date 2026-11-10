import React, { useEffect, useMemo, useRef, useState } from "react";
import * as XLSX from "xlsx";
import {
  Download,
  FileSpreadsheet,
  Pencil,
  Plus,
  Printer,
  Save,
  Search,
  Trash2,
  Upload,
  X,
  WalletCards,
} from "lucide-react";
import { toast } from "sonner";
import database from "@/data/traineeFinancialDatabase.json";
import { useStore, type TraineeFinancialRecord } from "@/lib/store";
import { isRegistrationFeeDescription } from "@/lib/feeClassification";
import { openBrowserPrintPreview } from "@/lib/browserPrintPreview";
import { escapeHtml, reportLetterheadHtml } from "@/lib/printTableHtml";
import { recalculateTraineeFinancialRecord, STUDY_YEARS_HEADER } from "@/lib/traineeFinancialCalculations";

const HEADERS = database.headers as string[];
const REGISTRY_HEADER = HEADERS[1];
const VISIBLE_BASE_HEADERS = [
  HEADERS[0], HEADERS[2], HEADERS[3], HEADERS[4], STUDY_YEARS_HEADER, ...HEADERS.slice(5),
];
const SHEET_NAME = database.sheetName;
const TITLE = database.title;
const RULES = database.rules;
const CURRENCY_COLUMNS = new Set([
  "رسوم القيد والتسجيل",
  "الأقساط الدراسية المستحقة",
  "رسم الكتابي الأول",
  "رسم الكتابي النهائي",
  "رسم السريري الشفوي",
  "إجمالي رسوم الامتحانات",
  "إجمالي المستحق الكلي (ريال)",
]);
const normalize = (value: unknown) =>
  String(value ?? "")
    .trim()
    .replace(/\s+/g, " ");

const normalizeAcademicStatus = (value: unknown) =>
  String(value ?? "")
    .trim()
    .replace(/[ًٌٍَُِّْـ]/g, "")
    .replace(/[إأآ]/g, "ا")
    .replace(/ى/g, "ي")
    .replace(/ة/g, "ه")
    .replace(/\s+/g, " ")
    .toLocaleLowerCase("ar");

const getAcademicStatusRowClass = (value: unknown) => {
  const status = normalizeAcademicStatus(value);
  if (!status) return "";
  if (["منسحب", "منسحبه", "انسحب", "انسحبت"].includes(status))
    return "bg-red-200 [&>td]:!bg-red-200";
  if (["مفصول", "مفصوله", "فصل"].includes(status))
    return "bg-yellow-200 [&>td]:!bg-yellow-200";
  if (["متخرج", "متخرجه", "خريج", "خريجه"].includes(status))
    return "bg-green-200 [&>td]:!bg-green-200";
  if (["موقوف", "موقوفه"].includes(status))
    return "bg-orange-200 [&>td]:!bg-orange-200";
  if (["مؤجل", "مؤجله"].includes(status))
    return "bg-sky-100 [&>td]:!bg-sky-100";
  if (["مستمر", "مستمرة", "منتظم", "منتظمة", "على راس العمل"].includes(status))
    return "bg-emerald-50 [&>td]:!bg-emerald-50";
  return "";
};
const formatValue = (value: unknown, header: string) =>
  CURRENCY_COLUMNS.has(header) && typeof value === "number"
    ? value.toLocaleString("en-US")
    : String(value ?? "");
const parseAmount = (value: unknown) => Number(String(value ?? 0).replace(/[,٬\s]/g, "")) || 0;
const normalizeDescription = (value: unknown) =>
  String(value ?? "")
    .replace(/[ًٌٍَُِّْـ]/g, "")
    .replace(/[إأآ]/g, "ا")
    .replace(/\s+/g, " ");

export default function TraineeFinancialDataTab() {
  const records = useStore((state) => state.traineeFinancialRecords);
  const setRecords = useStore((state) => state.setTraineeFinancialRecords);
  const customColumns = useStore((state) => state.traineeFinancialCustomColumns);
  const setCustomColumns = useStore((state) => state.setTraineeFinancialCustomColumns);
  const hafiza = useStore((state) => state.hafiza);
  const installments2026 = useStore((state) => state.installments);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const columns = useMemo(() => [...VISIBLE_BASE_HEADERS, ...customColumns], [customColumns]);
  const [query, setQuery] = useState("");
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [draft, setDraft] = useState<TraineeFinancialRecord>({});
  const [sort, setSort] = useState<{ key: string; desc: boolean } | null>(null);
  const [cardTrainee, setCardTrainee] = useState<TraineeFinancialRecord | null>(null);

  const addColumn = () => {
    const name = normalize(window.prompt("اكتب اسم العمود الجديد:") || "");
    if (!name) return;
    if (columns.some((column) => normalize(column) === name)) {
      toast.error("يوجد عمود بهذا الاسم بالفعل");
      return;
    }
    setCustomColumns([...customColumns, name]);
    toast.success(`تمت إضافة العمود «${name}»`);
  };

  const removeColumn = (name: string) => {
    if (!window.confirm(`حذف العمود «${name}» وبياناته من جميع الصفوف؟`)) return;
    setCustomColumns(customColumns.filter((column) => column !== name));
    setRecords(
      records.map((row) => {
        const next = { ...row };
        delete next[name];
        return next;
      }),
    );
  };

  const normalizeTraineeName = (value: unknown) =>
    normalize(value)
      .replace(/[ًٌٍَُِّْـ]/g, "")
      .replace(/[إأآ]/g, "ا")
      .replace(/ى/g, "ي")
      .replace(/[ـ،,.]/g, " ")
      .replace(/\s+/g, " ")
      .trim()
      .split(" ")
      .filter(Boolean)
      .sort()
      .join(" ");

  // مزامنة متدربي الدفعة السادسة من جدول أقساط 2026 إلى قاعدة بيانات المتدربين.
  // تتم الإضافة/استكمال الحقول الناقصة فقط، دون تعديل سجلات الأقساط أو بيانات المتدرب الأخرى.
  useEffect(() => {
    const isSixthBatch = (value: unknown) => {
      const batch = normalize(value)
        .replace(/[ًٌٍَُِّْـ]/g, "")
        .replace(/[إأآ]/g, "ا")
        .replace(/\s+/g, "")
        .replace(/^الدفعة/, "")
        .replace(/^دفعة/, "");
      return batch === "السادسة" || batch === "سادسة" ||
        batch === "السادس" || batch === "سادس" ||
        batch === "6" || batch === "٦";
    };

    const sixthBatchRows = (installments2026 || []).filter((row) => isSixthBatch(row.batch));
    if (!sixthBatchRows.length) return;

    const nextRecords = [...(records || [])];
    let changed = false;

    sixthBatchRows.forEach((installment) => {
      const name = normalizeTraineeName(installment.name);
      if (!name) return;

      const existingIndex = nextRecords.findIndex((record) => {
        const sameName = normalizeTraineeName(record[HEADERS[2]]) === name;
        const existingBatch = normalize(record[HEADERS[3]]);
        // استكمل رقم الدفعة للمتدرب الموجود إذا كان حقل الدفعة فارغاً،
        // أو حدّث التخصص الناقص إذا كان مسجلاً بالفعل في الدفعة السادسة.
        return sameName && (!existingBatch || isSixthBatch(existingBatch));
      });

      if (existingIndex >= 0) {
        const existing = nextRecords[existingIndex];
        const next = { ...existing };
        if (!normalize(next[HEADERS[3]])) next[HEADERS[3]] = installment.batch || "السادسة";
        if (!normalize(next[HEADERS[5]])) next[HEADERS[5]] = installment.specialty || "";
        if (next[HEADERS[3]] !== existing[HEADERS[3]] ||
            next[HEADERS[5]] !== existing[HEADERS[5]]) {
          nextRecords[existingIndex] = next;
          changed = true;
        }
        return;
      }

      // إذا كان الاسم موجوداً ببيانات دفعة أخرى فلا ندمج السجلين ولا نستبدل بياناته.
      const duplicateInSource = nextRecords.some((record) =>
        normalizeTraineeName(record[HEADERS[2]]) === name &&
        isSixthBatch(record[HEADERS[3]])
      );
      if (duplicateInSource) return;

      nextRecords.push({
        [HEADERS[0]]: nextRecords.length + 1,
        [HEADERS[2]]: installment.name || "",
        [HEADERS[3]]: installment.batch || "السادسة",
        [HEADERS[5]]: installment.specialty || "",
      });
      changed = true;
    });

    if (changed) setRecords(nextRecords);
  }, [installments2026, records, setRecords]);

  const accountCardRows = useMemo(() => {
    if (!cardTrainee) return [];
    const key = normalizeTraineeName(cardTrainee[HEADERS[2]]);
    return (hafiza || [])
      .filter((item) => {
        const amount = parseAmount(item.notifyAmount);
        const description = String(item.description || "");
        const isAllowedFee =
          isRegistrationFeeDescription(description) ||
          /(امتحان|اختبار)/.test(normalizeDescription(description));
        return (
          normalizeTraineeName(item.name) === key &&
          Boolean(normalize(item.hafizaNo)) &&
          Boolean(normalize(item.notifyNo)) &&
          amount > 0 &&
          isAllowedFee
        );
      })
      .sort((a, b) =>
        String(a.notifyDate || a.date || "").localeCompare(String(b.notifyDate || b.date || "")),
      );
  }, [cardTrainee, hafiza]);

  const printTraineeAccountCard = () => {
    if (!cardTrainee) return;
    const value = (key: string, fallback = "—") =>
      String(cardTrainee[key] ?? "").trim() || fallback;
    const academicStatus =
      value("الحالة الأكاديمية", "") ||
      value("حالة أكاديمية", "") ||
      value("حالة المتدرب", "غير محدد");
    const info = [
      ["اسم المتدرب", value(HEADERS[2])],
      ["التخصص", value(HEADERS[5])],
      ["رقم الدفعة", value(HEADERS[3])],
      ["المستوى", value(HEADERS[4])],
      ["الحالة الأكاديمية", academicStatus],
    ]
      .map(
        ([label, content]) =>
          `<div class="info"><b>${escapeHtml(label)}</b><span>${escapeHtml(content)}</span></div>`,
      )
      .join("");
    const rows = accountCardRows
      .map((item) => {
        const category = isRegistrationFeeDescription(item.description)
          ? "رسوم القيد والتسجيل"
          : "رسوم الامتحانات/الاختبارات";
        return `<tr><td>${escapeHtml(category)}</td><td>${escapeHtml(item.notifyDate || item.date || "—")}</td><td>${escapeHtml(item.hafizaNo)}</td><td>${escapeHtml(item.notifyNo)}</td><td>${escapeHtml(item.description)}</td><td class="amount">${escapeHtml(parseAmount(item.notifyAmount).toLocaleString("en-US"))}</td></tr>`;
      })
      .join("");
    const total = accountCardRows.reduce((sum, item) => sum + parseAmount(item.notifyAmount), 0);
    const body = `${reportLetterheadHtml()}<h1>كشف بطاقة حساب متدرب</h1><div class="info-grid">${info}</div><table><thead><tr><th>نوع الرسم</th><th>تاريخ التوريد</th><th>رقم الحافظة</th><th>رقم الإشعار</th><th>البيان</th><th>مبلغ التوريد</th></tr></thead><tbody>${rows || '<tr><td colspan="6">لا توجد حركات مطابقة</td></tr>'}</tbody><tfoot><tr><td colspan="5">إجمالي المبالغ المسددة</td><td class="amount">${total.toLocaleString("en-US")}</td></tr></tfoot></table><div class="report-date">تاريخ الطباعة: ${new Date().toLocaleDateString("ar-YE")}</div>`;
    const contentCss = `
      .report-letterhead-block { margin-bottom: 5mm !important; }
      h1 { text-align:center; font-size:18px; margin:4mm 0; font-weight:900; }
      .info-grid { display:grid; grid-template-columns:repeat(3,minmax(0,1fr)); gap:3mm; margin:0 0 5mm; }
      .info {
        min-height:22mm;
        border:1.4px solid #8aa9c2;
        border-radius:3mm;
        padding:3mm 2mm;
        display:flex;
        flex-direction:column;
        align-items:center;
        justify-content:center;
        gap:2mm;
        text-align:center;
        font-size:12px;
        font-weight:800;
        line-height:1.5;
        white-space:normal;
        color:#172b4d;
        background:#eaf3fb;
        box-shadow:0 1mm 2mm rgba(23,43,77,.10);
        print-color-adjust:exact;
        -webkit-print-color-adjust:exact;
      }
      .info b { color:#173b63; font-size:12px; font-weight:900; }
      .info span { color:#111f33; font-size:13px; font-weight:900; overflow-wrap:anywhere; }
      .info:nth-child(2) { background:#e7f5f1; border-color:#78b8a8; }
      .info:nth-child(2) b { color:#145b4c; }
      .info:nth-child(3) { background:#fff2df; border-color:#e3b66e; }
      .info:nth-child(3) b { color:#75430d; }
      .info:nth-child(4) { background:#f0eafd; border-color:#ad98dc; }
      .info:nth-child(4) b { color:#4b347e; }
      .info:nth-child(5) { background:#fcebed; border-color:#d99aa3; }
      .info:nth-child(5) b { color:#7b2938; }
      @media print {
        .info, .info * {
          print-color-adjust:exact !important;
          -webkit-print-color-adjust:exact !important;
        }
      }
      table { width:100%; border-collapse:collapse; table-layout:auto; font-size:9px; }
      th,td { border:1px solid #334155; padding:1.5mm 0; text-align:center; white-space:nowrap; }
      thead th { background:#126c8e !important; color:#fff !important; }
      tfoot td { background:#e2eef5 !important; font-weight:900; }
      .amount { direction:ltr; font-variant-numeric:tabular-nums; }
      .report-date { margin-top:4mm; text-align:left; font-size:9px; }
      @media print { @page { size:A4 landscape; margin:6mm; } }
    `;
    const opened = openBrowserPrintPreview({
      title: `كشف بطاقة حساب متدرب - ${escapeHtml(String(cardTrainee[HEADERS[2]] ?? ""))}`,
      tableHtml: body,
      contentCss,
      defaultOrientation: "landscape",
      defaultPageSize: "A4",
      defaultMarginMm: 6,
    });
    if (!opened) toast.error("تعذر فتح معاينة الطباعة؛ اسمح بالنوافذ المنبثقة في المتصفح");
  };

  const visibleRows = useMemo(() => {
    const q = normalize(query).toLocaleLowerCase("ar");
    const filtered = (records || [])
      .map((row, index) => ({ row, index }))
      .filter(
        ({ row }) =>
          !q ||
          columns.some((header) => normalize(row[header]).toLocaleLowerCase("ar").includes(q)),
      );
    if (sort) {
      filtered.sort((a, b) => {
        const av = a.row[sort.key];
        const bv = b.row[sort.key];
        const an = Number(String(av ?? "").replace(/[,٬\s]/g, ""));
        const bn = Number(String(bv ?? "").replace(/[,٬\s]/g, ""));
        const cmp =
          Number.isFinite(an) && Number.isFinite(bn)
            ? an - bn
            : String(av ?? "").localeCompare(String(bv ?? ""), "ar", { numeric: true });
        return sort.desc ? -cmp : cmp;
      });
    }
    return filtered;
  }, [records, query, sort, columns]);

  const startEdit = (index: number) => {
    setEditingIndex(index);
    setDraft({ ...(records[index] || {}) });
  };
  const saveEdit = () => {
    if (editingIndex === null) return;
    if (!normalize(draft[HEADERS[2]])) {
      toast.error("اسم المتدرب مطلوب");
      return;
    }
    const next = [...records];
    const nextRow = recalculateTraineeFinancialRecord(
      Object.fromEntries(columns.map((header) => [header, draft[header] ?? ""])),
    );
    if (editingIndex === next.length) next.push(nextRow);
    else next[editingIndex] = nextRow;
    setRecords(next);
    setEditingIndex(null);
    toast.success("تم حفظ بيانات المتدرب");
  };
  const addRow = () => {
    const row = Object.fromEntries(columns.map((header) => [header, ""])) as TraineeFinancialRecord;
    const index = records.length;
    setEditingIndex(index);
    setDraft(row);
  };
  const deleteRow = (index: number) => {
    if (!window.confirm("هل تريد حذف هذا الصف؟ لا يمكن التراجع عن الحذف.")) return;
    setRecords(records.filter((_, i) => i !== index));
    if (editingIndex === index) setEditingIndex(null);
    else if (editingIndex !== null && editingIndex > index) setEditingIndex(editingIndex - 1);
    toast.success("تم حذف الصف");
  };

  const exportExcel = () => {
    const aoa: unknown[][] = [
      [TITLE],
      [RULES],
      [],
      columns,
      ...records.map((row) => columns.map((header) => row[header] ?? "")),
    ];
    const sheet = XLSX.utils.aoa_to_sheet(aoa);
    sheet["!views"] = [{ rightToLeft: true }];
    sheet["!cols"] = columns.map((header) => ({
      wch: Math.min(34, Math.max(14, header.length + 4)),
    }));
    sheet["!autofilter"] = {
      ref: `A4:${XLSX.utils.encode_col(columns.length - 1)}${records.length + 4}`,
    };
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, sheet, SHEET_NAME.slice(0, 31));
    XLSX.writeFile(workbook, "بيانات_المتدربين.xlsx");
    toast.success("تم تصدير بيانات المتدربين");
  };

  const importExcel = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;
    try {
      const workbook = XLSX.read(await file.arrayBuffer(), { type: "array", cellDates: true });
      let imported: TraineeFinancialRecord[] | null = null;
      let nextCustomColumns = customColumns;
      for (const sheetName of workbook.SheetNames) {
        const sheet = workbook.Sheets[sheetName];
        const matrix = XLSX.utils.sheet_to_json<unknown[]>(sheet, {
          header: 1,
          defval: "",
          raw: true,
        });
        const headerIndex = matrix.findIndex((row) => {
          const values = new Set(row.map(normalize));
          return values.has(HEADERS[2]) && values.has(HEADERS[6]);
        });
        if (headerIndex < 0) continue;
        const sourceHeaders = matrix[headerIndex].map(normalize);
        const importedCustomColumns = sourceHeaders.filter(
          (header) =>
            header &&
            !HEADERS.includes(header) &&
            header !== STUDY_YEARS_HEADER &&
            header !== REGISTRY_HEADER,
        );
        const mergedCustomColumns = [...new Set([...customColumns, ...importedCustomColumns])];
        nextCustomColumns = mergedCustomColumns;
        const importedColumns = [...VISIBLE_BASE_HEADERS, ...mergedCustomColumns];
        const indexes = importedColumns.map((header) => sourceHeaders.indexOf(header));
        const rows = matrix.slice(headerIndex + 1).flatMap((row) => {
          if (!row.some((value) => normalize(value))) return [];
          const record = Object.fromEntries(
            importedColumns.map((header, i) => [
              header,
              indexes[i] < 0 ? "" : ((row[indexes[i]] as string | number | undefined) ?? ""),
            ]),
          );
          if (!normalize(record[HEADERS[2]])) return [];
          return [record as TraineeFinancialRecord];
        });
        imported = rows;
        break;
      }
      if (!imported) {
        toast.error(
          "لم أجد ورقة تحتوي الأعمدة المطلوبة (اسم المتدرب، رسوم القيد والتسجيل)",
        );
        return;
      }
      if (!imported.length) {
        toast.error("لم يتم العثور على صفوف متدربين في الملف");
        return;
      }
      if (
        !window.confirm(
          `سيتم استبدال ${records.length} صفًا بـ ${imported.length} صفًا من الملف. هل تريد المتابعة؟`,
        )
      )
        return;
      setCustomColumns(nextCustomColumns);
      setRecords(imported);
      setEditingIndex(null);
      toast.success(`تم استيراد ${imported.length} سجلًا إلى تبويب بيانات المتدربين`);
    } catch (error) {
      console.error("Trainee database import failed", error);
      toast.error("تعذر قراءة ملف Excel؛ تحقق من سلامة الملف ثم أعد المحاولة");
    }
  };

  const totals = useMemo(
    () =>
      Object.fromEntries(
        [...CURRENCY_COLUMNS].map((header) => [
          header,
          records.reduce((sum, row) => sum + parseAmount(row[header]), 0),
        ]),
      ),
    [records],
  );

  return (
    <div className="min-h-[calc(100dvh-140px)] bg-[#f4f9fd] p-2 text-slate-900 sm:p-4" dir="rtl">
      <section className="mb-3 rounded-2xl border border-[#b8d4e8] bg-gradient-to-l from-[#e8f0f8] to-white p-3 shadow-sm sm:p-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <span className="grid h-11 w-11 place-items-center rounded-xl bg-[#2e6b8a] text-white">
              <FileSpreadsheet className="h-6 w-6" />
            </span>
            <div>
              <h1 className="text-lg font-black text-[#17324d]">بيانات المتدربين</h1>
              <p className="text-xs font-semibold text-slate-600">
                قاعدة بيانات قابلة للتحرير والاستيراد والتصدير — {records.length} سجلًا
              </p>
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={addRow}
              className="flex items-center gap-1.5 rounded-lg bg-[#176db1] px-3 py-2 text-sm font-bold text-white"
            >
              <Plus className="h-4 w-4" /> إضافة صف
            </button>
            <button
              type="button"
              onClick={addColumn}
              className="flex items-center gap-1.5 rounded-lg bg-[#7055a5] px-3 py-2 text-sm font-bold text-white"
            >
              <Plus className="h-4 w-4" /> إضافة عمود
            </button>
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="flex items-center gap-1.5 rounded-lg bg-[#14746f] px-3 py-2 text-sm font-bold text-white"
            >
              <Upload className="h-4 w-4" /> استيراد Excel
            </button>
            <button
              type="button"
              onClick={exportExcel}
              className="flex items-center gap-1.5 rounded-lg bg-[#2e6b8a] px-3 py-2 text-sm font-bold text-white"
            >
              <Download className="h-4 w-4" /> تصدير Excel
            </button>
            <input
              ref={fileInputRef}
              type="file"
              accept=".xlsx,.xls,.csv"
              className="hidden"
              onChange={importExcel}
            />
          </div>
        </div>
        <div className="relative mt-3 max-w-lg">
          <Search className="absolute right-3 top-2.5 h-4 w-4 text-slate-500" />
          <input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="بحث في جميع بيانات المتدربين..."
            className="w-full rounded-lg border border-slate-300 bg-white py-2 pe-9 ps-3 text-sm outline-none focus:border-sky-600"
          />
        </div>
      </section>

      {editingIndex !== null && (
        <section className="mb-3 rounded-xl border border-sky-300 bg-white p-3 shadow-sm">
          <div className="mb-3 flex items-center justify-between gap-2">
            <h2 className="font-extrabold">
              تحرير بيانات الصف {normalize(draft[HEADERS[0]]) || "الجديد"}
            </h2>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={saveEdit}
                className="flex items-center gap-1 rounded-lg bg-emerald-700 px-3 py-2 text-sm font-bold text-white"
              >
                <Save className="h-4 w-4" /> حفظ التغييرات
              </button>
              <button
                type="button"
                onClick={() => setEditingIndex(null)}
                className="flex items-center gap-1 rounded-lg bg-slate-600 px-3 py-2 text-sm font-bold text-white"
              >
                <X className="h-4 w-4" /> إلغاء
              </button>
            </div>
          </div>
          <p className="mb-2 text-xs font-semibold leading-6 text-slate-600">
            تُحسب الرسوم الدراسية تلقائيًا بمبلغ 300,000 ريال عن كل سنة دراسة، مع إعفاء الدفعة الأولى من الرسوم الدراسية فقط. وتُحدّث حالات مراحل الامتحانات والإجماليات عند تعديل المستوى.
          </p>
          <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-4">
            {columns.map((header) => (
              <label
                key={header}
                className="flex min-w-0 flex-col gap-1 text-xs font-bold text-slate-700"
              >
                {header}
                <input
                  value={String(draft[header] ?? "")}
                  type={header === STUDY_YEARS_HEADER ? "number" : "text"}
                  min={header === STUDY_YEARS_HEADER ? 1 : undefined}
                  step={header === STUDY_YEARS_HEADER ? 1 : undefined}
                  onChange={(event) =>
                    setDraft((current) =>
                      recalculateTraineeFinancialRecord({
                        ...current,
                        [header]:
                          (CURRENCY_COLUMNS.has(header) || header === STUDY_YEARS_HEADER) &&
                          event.target.value !== "" &&
                          Number.isFinite(Number(event.target.value.replace(/[,٬\s]/g, "")))
                            ? Number(event.target.value.replace(/[,٬\s]/g, ""))
                            : event.target.value,
                      }),
                    )
                  }
                  className="min-w-0 rounded-md border border-slate-300 px-2 py-2 text-sm font-semibold text-black outline-none focus:border-sky-600"
                />
              </label>
            ))}
          </div>
        </section>
      )}

      <div className="mb-2 flex flex-wrap items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-bold text-slate-700">
        <span>ألوان الحالة الأكاديمية:</span>
        <span className="rounded px-2 py-1 bg-red-200">منسحب</span>
        <span className="rounded px-2 py-1 bg-yellow-200">مفصول</span>
        <span className="rounded px-2 py-1 bg-green-200">متخرج / متخرجة</span>
        <span className="rounded px-2 py-1 bg-orange-200">موقوف</span>
        <span className="rounded px-2 py-1 bg-sky-100">مؤجل</span>
        <span className="rounded px-2 py-1 bg-emerald-50">مستمر / منتظم</span>
      </div>
      <div
        className="overflow-auto rounded-xl border border-slate-400 bg-white shadow-sm"
        style={{ maxHeight: "calc(100dvh - 280px)" }}
      >
        <table
          className="w-max min-w-full table-auto border-collapse text-center text-sm text-black"
          dir="rtl"
          style={{ width: "max-content", minWidth: "100%", tableLayout: "auto" }}
        >
          <thead className="sticky top-0 z-10 bg-[#126c8e] text-white">
            <tr>
              {columns.map((header) => (
                <th
                  key={header}
                  className="min-w-[100px] max-w-[240px] border border-slate-500 bg-[#126c8e] px-2 py-2 text-[15px] font-black leading-6 text-white"
                >
                  <button
                    type="button"
                    onClick={() =>
                      setSort((current) =>
                        current?.key === header
                          ? { key: header, desc: !current.desc }
                          : { key: header, desc: false },
                      )
                    }
                    className="whitespace-normal break-words"
                  >
                    {header}
                    {sort?.key === header ? (sort.desc ? " ↓" : " ↑") : " ↕"}
                  </button>
                  {customColumns.includes(header) && (
                    <button
                      type="button"
                      title={`حذف العمود ${header}`}
                      onClick={() => removeColumn(header)}
                      className="mr-1 rounded bg-white/20 px-1 text-white"
                    >
                      ×
                    </button>
                  )}
                </th>
              ))}
              <th className="min-w-[100px] max-w-[220px] border border-slate-500 bg-[#126c8e] px-2 py-2 text-[15px] font-black leading-6 text-white">
                إجراءات
              </th>
            </tr>
          </thead>
          <tbody>
            {visibleRows.map(({ row, index }) => (
              <tr
                key={`${index}-${String(row[HEADERS[2]] ?? "")}`}
                className={getAcademicStatusRowClass(row["الحالة الأكاديمية"]) || (index % 2 ? "bg-slate-50" : "bg-white")}
              >
                {columns.map((header) => (
                  <td
                    key={header}
                    className="max-w-[280px] border border-slate-300 px-2 py-1.5 text-[14px] font-bold leading-6 text-black [overflow-wrap:anywhere]"
                  >
                    {formatValue(row[header], header)}
                  </td>
                ))}
                <td className="min-w-[170px] border border-slate-300 bg-white px-1 py-1 text-black">
                  <button
                    type="button"
                    title="تحرير الصف"
                    onClick={() => startEdit(index)}
                    className="mx-0.5 rounded bg-amber-100 p-1.5 text-amber-900"
                  >
                    <Pencil className="h-4 w-4" />
                  </button>
                  <button
                    type="button"
                    title="حذف الصف"
                    onClick={() => deleteRow(index)}
                    className="mx-0.5 rounded bg-rose-100 p-1.5 text-rose-800"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                  <button
                    type="button"
                    title="عرض بطاقة حساب المتدرب"
                    onClick={() => setCardTrainee(row)}
                    className="mx-0.5 inline-flex items-center gap-1 rounded bg-sky-100 px-2 py-1.5 text-sky-900"
                  >
                    <WalletCards className="h-4 w-4" /> بطاقة حساب متدرب
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
          <tfoot className="sticky bottom-0 bg-[#e2eef5] font-extrabold text-black">
            <tr>
              <td
                colSpan={VISIBLE_BASE_HEADERS.indexOf(HEADERS[6])}
                className="border border-slate-500 px-2 py-2 text-right text-[14px] font-black text-black"
              >
                الإجمالي العام ({records.length} متدربًا)
              </td>
              {columns.slice(VISIBLE_BASE_HEADERS.indexOf(HEADERS[6]), VISIBLE_BASE_HEADERS.length).map((header) => (
                <td key={header} className="max-w-[280px] border border-slate-500 px-2 py-2 text-[14px] font-black text-black [overflow-wrap:anywhere]">
                  {totals[header] !== undefined
                    ? Number(totals[header]).toLocaleString("en-US")
                    : ""}
                </td>
              ))}
              {customColumns.map((header) => (
                <td key={header} className="border border-slate-500 px-1 py-2" />
              ))}
              <td className="border border-slate-500" />
            </tr>
          </tfoot>
        </table>
        {!visibleRows.length && (
          <p className="p-8 text-center font-bold text-slate-500">لا توجد صفوف مطابقة للبحث.</p>
        )}
      </div>
      {cardTrainee !== null && (
        <div
          className="fixed inset-0 z-[120] flex items-center justify-center bg-slate-950/60 p-2 sm:p-5"
          role="dialog"
          aria-modal="true"
          aria-label="بطاقة حساب المتدرب"
        >
          <section className="max-h-[92dvh] w-full max-w-5xl overflow-hidden rounded-2xl border border-sky-200 bg-white shadow-2xl">
            <header className="flex items-center justify-between gap-3 bg-[#176db1] px-4 py-3 text-white">
              <div>
                <h2 className="text-lg font-black">بطاقة حساب متدرب</h2>
                <p className="text-sm font-bold">{String(cardTrainee[HEADERS[2]] ?? "")}</p>
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={printTraineeAccountCard}
                  className="inline-flex items-center gap-1.5 rounded-lg bg-white px-3 py-2 text-sm font-extrabold text-[#176db1]"
                >
                  <Printer className="h-4 w-4" /> طباعة كشف البطاقة
                </button>
                <button
                  type="button"
                  onClick={() => setCardTrainee(null)}
                  aria-label="إغلاق"
                  className="rounded-lg bg-white/15 p-2"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
            </header>
            <div className="max-h-[calc(92dvh-90px)] overflow-auto p-3">
              <p className="mb-2 text-xs font-bold text-slate-600">
                تُعرض حركات رسوم القيد والتسجيل والامتحانات/الاختبارات فقط إذا توفر رقم الحافظة ورقم
                الإشعار ومبلغ توريد موجب.
              </p>
              <div className="overflow-auto rounded-lg border border-slate-300">
                <table className="w-full border-collapse text-center text-xs" dir="rtl">
                  <thead className="sticky top-0 bg-[#126c8e] text-white">
                    <tr>
                      {[
                        "نوع الرسم",
                        "التاريخ",
                        "رقم الحافظة",
                        "رقم الإشعار",
                        "البيان",
                        "مبلغ التوريد",
                      ].map((header) => (
                        <th
                          key={header}
                          className="whitespace-nowrap border border-slate-400 px-0 py-2"
                        >
                          {header}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {accountCardRows.map((item, index) => {
                      const description = String(item.description || "");
                      const category = isRegistrationFeeDescription(description)
                        ? "رسوم القيد والتسجيل"
                        : "رسوم الامتحانات/الاختبارات";
                      const amount = parseAmount(item.notifyAmount);
                      return (
                        <tr
                          key={`${item.id}-${index}`}
                          className={index % 2 ? "bg-slate-50" : "bg-white"}
                        >
                          <td className="whitespace-nowrap border border-slate-300 px-0 py-2">
                            {category}
                          </td>
                          <td className="whitespace-nowrap border border-slate-300 px-0 py-2">
                            {item.notifyDate || item.date || "—"}
                          </td>
                          <td className="whitespace-nowrap border border-slate-300 px-0 py-2">
                            {item.hafizaNo}
                          </td>
                          <td className="whitespace-nowrap border border-slate-300 px-0 py-2">
                            {item.notifyNo}
                          </td>
                          <td className="whitespace-nowrap border border-slate-300 px-0 py-2">
                            {description}
                          </td>
                          <td className="whitespace-nowrap border border-slate-300 px-0 py-2 font-bold">
                            {amount.toLocaleString("en-US")}
                          </td>
                        </tr>
                      );
                    })}
                    {!accountCardRows.length && (
                      <tr>
                        <td colSpan={6} className="p-8 text-center font-bold text-slate-500">
                          لا توجد حركات مطابقة ببيانات الحوافظ المتاحة.
                        </td>
                      </tr>
                    )}
                  </tbody>
                  {accountCardRows.length > 0 && (
                    <tfoot className="bg-[#e2eef5] font-black">
                      <tr>
                        <td colSpan={5} className="border border-slate-400 px-2 py-2 text-right">
                          إجمالي المبالغ المسددة
                        </td>
                        <td className="whitespace-nowrap border border-slate-400 px-0 py-2">
                          {accountCardRows
                            .reduce((sum, item) => sum + parseAmount(item.notifyAmount), 0)
                            .toLocaleString("en-US")}
                        </td>
                      </tr>
                    </tfoot>
                  )}
                </table>
              </div>
            </div>
          </section>
        </div>
      )}
      <p className="mt-2 text-[11px] font-semibold text-slate-600">
        البيانات محفوظة تلقائيًا على هذا الجهاز. استيراد ملف Excel يستبدل الجدول الحالي بعد التأكيد.
      </p>
    </div>
  );
}
