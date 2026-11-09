import React, { useMemo, useRef, useState } from "react";
import * as XLSX from "xlsx";
import {
  Download,
  FileSpreadsheet,
  Pencil,
  Plus,
  Save,
  Search,
  Trash2,
  Upload,
  X,
} from "lucide-react";
import { toast } from "sonner";
import database from "@/data/traineeFinancialDatabase.json";
import { useStore, type TraineeFinancialRecord } from "@/lib/store";

const HEADERS = database.headers as string[];
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
const formatValue = (value: unknown, header: string) =>
  CURRENCY_COLUMNS.has(header) && typeof value === "number"
    ? value.toLocaleString("en-US")
    : String(value ?? "");

export default function TraineeFinancialDataTab() {
  const records = useStore((state) => state.traineeFinancialRecords);
  const setRecords = useStore((state) => state.setTraineeFinancialRecords);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [query, setQuery] = useState("");
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [draft, setDraft] = useState<TraineeFinancialRecord>({});
  const [sort, setSort] = useState<{ key: string; desc: boolean } | null>(null);

  const visibleRows = useMemo(() => {
    const q = normalize(query).toLocaleLowerCase("ar");
    const filtered = (records || [])
      .map((row, index) => ({ row, index }))
      .filter(
        ({ row }) =>
          !q ||
          HEADERS.some((header) => normalize(row[header]).toLocaleLowerCase("ar").includes(q)),
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
  }, [records, query, sort]);

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
    const nextRow = Object.fromEntries(HEADERS.map((header) => [header, draft[header] ?? ""]));
    if (editingIndex === next.length) next.push(nextRow);
    else next[editingIndex] = nextRow;
    setRecords(next);
    setEditingIndex(null);
    toast.success("تم حفظ بيانات المتدرب");
  };
  const addRow = () => {
    const row = Object.fromEntries(HEADERS.map((header) => [header, ""])) as TraineeFinancialRecord;
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
      HEADERS,
      ...records.map((row) => HEADERS.map((header) => row[header] ?? "")),
    ];
    const sheet = XLSX.utils.aoa_to_sheet(aoa);
    sheet["!views"] = [{ rightToLeft: true }];
    sheet["!cols"] = HEADERS.map((header) => ({
      wch: Math.min(34, Math.max(14, header.length + 4)),
    }));
    sheet["!autofilter"] = {
      ref: `A4:${XLSX.utils.encode_col(HEADERS.length - 1)}${records.length + 4}`,
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
      for (const sheetName of workbook.SheetNames) {
        const sheet = workbook.Sheets[sheetName];
        const matrix = XLSX.utils.sheet_to_json<unknown[]>(sheet, {
          header: 1,
          defval: "",
          raw: true,
        });
        const headerIndex = matrix.findIndex((row) => {
          const values = new Set(row.map(normalize));
          return values.has(HEADERS[1]) && values.has(HEADERS[2]) && values.has(HEADERS[6]);
        });
        if (headerIndex < 0) continue;
        const sourceHeaders = matrix[headerIndex].map(normalize);
        const indexes = HEADERS.map((header) => sourceHeaders.indexOf(header));
        const rows = matrix.slice(headerIndex + 1).flatMap((row) => {
          if (!row.some((value) => normalize(value))) return [];
          const record = Object.fromEntries(
            HEADERS.map((header, i) => [
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
          "لم أجد ورقة تحتوي الأعمدة المطلوبة (رقم السجل، اسم المتدرب، رسوم القيد والتسجيل)",
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
          records.reduce(
            (sum, row) => sum + (Number(String(row[header] ?? 0).replace(/[,٬\s]/g, "")) || 0),
            0,
          ),
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
          <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-4">
            {HEADERS.map((header) => (
              <label
                key={header}
                className="flex min-w-0 flex-col gap-1 text-xs font-bold text-slate-700"
              >
                {header}
                <input
                  value={String(draft[header] ?? "")}
                  onChange={(event) =>
                    setDraft((current) => ({
                      ...current,
                      [header]:
                        CURRENCY_COLUMNS.has(header) &&
                        event.target.value !== "" &&
                        Number.isFinite(Number(event.target.value.replace(/[,٬\s]/g, "")))
                          ? Number(event.target.value.replace(/[,٬\s]/g, ""))
                          : event.target.value,
                    }))
                  }
                  className="min-w-0 rounded-md border border-slate-300 px-2 py-2 text-sm font-semibold text-black outline-none focus:border-sky-600"
                />
              </label>
            ))}
          </div>
        </section>
      )}

      <div
        className="overflow-auto rounded-xl border border-slate-400 bg-white shadow-sm"
        style={{ maxHeight: "calc(100dvh - 280px)" }}
      >
        <table className="w-full border-collapse text-center text-xs" dir="rtl">
          <thead className="sticky top-0 z-10 bg-[#126c8e] text-white">
            <tr>
              {HEADERS.map((header) => (
                <th
                  key={header}
                  className="whitespace-nowrap border border-slate-500 px-1 py-2 font-extrabold"
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
                    className="whitespace-nowrap"
                  >
                    {header}
                    {sort?.key === header ? (sort.desc ? " ↓" : " ↑") : " ↕"}
                  </button>
                </th>
              ))}
              <th className="sticky left-0 border border-slate-500 bg-[#126c8e] px-2 py-2">
                إجراءات
              </th>
            </tr>
          </thead>
          <tbody>
            {visibleRows.map(({ row, index }) => (
              <tr
                key={`${index}-${String(row[HEADERS[1]])}`}
                className={index % 2 ? "bg-slate-50" : "bg-white"}
              >
                {HEADERS.map((header) => (
                  <td
                    key={header}
                    className="whitespace-nowrap border border-slate-300 px-1 py-1 font-medium text-black"
                  >
                    {formatValue(row[header], header)}
                  </td>
                ))}
                <td className="sticky left-0 whitespace-nowrap border border-slate-300 bg-white px-1 py-1">
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
                </td>
              </tr>
            ))}
          </tbody>
          <tfoot className="sticky bottom-0 bg-[#e2eef5] font-extrabold text-black">
            <tr>
              <td
                colSpan={6}
                className="whitespace-nowrap border border-slate-500 px-1 py-2 text-right"
              >
                الإجمالي العام ({records.length} متدربًا)
              </td>
              {HEADERS.slice(6).map((header) => (
                <td key={header} className="whitespace-nowrap border border-slate-500 px-1 py-2">
                  {totals[header] !== undefined
                    ? Number(totals[header]).toLocaleString("en-US")
                    : ""}
                </td>
              ))}
              <td className="border border-slate-500" />
            </tr>
          </tfoot>
        </table>
        {!visibleRows.length && (
          <p className="p-8 text-center font-bold text-slate-500">لا توجد صفوف مطابقة للبحث.</p>
        )}
      </div>
      <p className="mt-2 text-[11px] font-semibold text-slate-600">
        البيانات محفوظة تلقائيًا على هذا الجهاز. استيراد ملف Excel يستبدل الجدول الحالي بعد التأكيد.
      </p>
    </div>
  );
}
