import React, { useState, useMemo, useRef, useEffect } from "react";
import { useStore, type Journal } from "@/lib/store";
import {
  Edit,
  Save,
  Trash2,
  Plus,
  X,
  ChevronDown,
  Search,
  BookOpenText,
  Hash,
  FileText,
  CalendarDays,
  Scale,
  CheckCircle2,
  AlertTriangle,
  Inbox,
} from "lucide-react";
import { toast } from "sonner";
import ImportButton from "@/components/ImportButton";
import TabActions from "@/components/TabActions";
import type { WebActionItem } from "@/components/WebActionMenu";
import { useTableControls } from "@/hooks/useTableControls";

const JOURNAL_COLS = [
  { key: "formNo", label: "رقم الاستمارة" },
  { key: "settlement", label: "التسوية" },
  { key: "date", label: "التاريخ" },
  { key: "description", label: "البيان" },
  { key: "debitAccount", label: "الحساب المدين" },
  { key: "creditAccount", label: "الحساب الدائن" },
  { key: "debit", label: "مدين" },
  { key: "credit", label: "دائن" },
] as const;

const ALL_EXCEL_ACCOUNTS = [
  "الباب الاول (الأجور والمرتبات)",
  "الباب الثاني (النفقات التشغيلية)",
  "الباب الثالث (الدعم والموارد)",
  "الباب الرابع (اكتساب الأصول غير المالية)",
  "حساب البنك نفقات تشغيلية محلية",
  "حساب البنك اكتساب اصول غير مالية",
  "حساب البنك موارد محلية",
  "حساب البنك موارد عامة مشتركة",
  "حساب البنك حسابات جارية",
  "ح/ النقدية للصندوق",
  "حسابات سلف الحسابات الجارية",
  "حساب السلف على الأجور",
  "حساب السلف المؤقتة",
  "حساب المبالغ المدفوعة مقدما",
  "ح/ المدينين مالية",
  "ح/ الدائنين مالية",
  "حساب الموارد العامة المشتركة",
  "حساب الموارد المشتركة",
  "حساب الحسابات الجارية",
  "حساب المساهمات الذاتية",
  "حساب المبالغ الدائنة تحت التسوية",
  "حساب البنك امانات",
  "حساب التزامات سلع وخدمات وممتلكات",
  "حساب التزامات اكتساب اصول ثابتة",
  "حساب التزامات اكتساب اصول غير منتجة",
  "حساب تسوية الموارد المحصلة مقدما",
  "حساب الموارد المستحقة",
  "حساب النفقات المقدمة عن سلع وخدمات",
  "حساب مرتجع الاجور",
  "حساب التامينات المتنوعة",
  "حساب المبالغ الدائنة المحصلة للغير",
  "حساب دائنون التزمات قائمة",
  "حساب تسوية المستحقات والمقدمات المدينة",
  "حساب الكفالات",
  "حساب امانات الكفالات",
  "حساب الديون المستحقة للحكومة",
  "حساب متابعة مطلوبات الحكومة",
  "حساب اكتساب الاصول غير المالية",
  "حساب مراقبة اكتساب الاصول غير المالية",
  "حساب الاستخدامات",
  "حساب الموارد",
];

interface EntryLine {
  id: string;
  account: string;
  amount: number;
  type: "debit" | "credit";
  description?: string;
}

// ── حقل مع تسمية وأيقونة توضيحية ───────────────────────────────────────────
function Field({
  label,
  icon,
  className = "",
  children,
}: {
  label: string;
  icon?: React.ReactNode;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <label className={`group relative block min-w-0 ${className}`}>
      <span className="mb-1.5 flex items-center gap-1.5 text-xs font-bold text-slate-800">
        {icon}
        {label}
      </span>
      {children}
    </label>
  );
}

const inputCls =
  "w-full min-w-0 rounded-xl border border-amber-200 bg-white text-slate-900 px-3 py-2.5 text-xs sm:text-sm font-medium outline-none transition-all placeholder:text-slate-400 focus:border-amber-500 focus:ring-2 focus:ring-amber-200 shadow-sm";

const journalClampCls =
  "block max-w-[120px] sm:max-w-[180px] overflow-hidden text-ellipsis whitespace-nowrap leading-snug";

// ── قائمة اختيار الحساب: نافذة منبثقة تفاعلية للبحث والاختيار ───────────────
function AccountDropdownCell({
  value,
  onChange,
  type,
}: {
  value: string;
  onChange: (v: string) => void;
  type: "debit" | "credit";
}) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const wrapRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const isDebit = type === "debit";

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return ALL_EXCEL_ACCOUNTS;
    return ALL_EXCEL_ACCOUNTS.filter((a) => a.toLowerCase().includes(q));
  }, [query]);

  useEffect(() => {
    if (!open) return;

    function handler(e: MouseEvent) {
      if (wrapRef.current && !wrapRef.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [open]);

  const handleOpen = () => {
    setOpen(true);
    setQuery("");
    setTimeout(() => inputRef.current?.focus(), 60);
  };

  const pick = (acc: string) => {
    onChange(acc);
    setOpen(false);
    setQuery("");
  };

  return (
    <div ref={wrapRef} className="relative w-full min-w-[180px] sm:min-w-[220px]">
      <button
        type="button"
        onClick={handleOpen}
        className={`flex min-h-[40px] w-full items-center justify-between gap-2 rounded-xl border px-3 py-2 text-right text-xs sm:text-sm font-bold transition-all active:scale-[0.99] shadow-sm
          ${
            value
              ? isDebit
                ? "bg-emerald-50 text-emerald-900 border-emerald-300 shadow-emerald-50"
                : "bg-rose-50 text-rose-900 border-rose-300 shadow-rose-50"
              : "border-dashed border-amber-300 bg-white text-slate-500 hover:border-amber-400 hover:bg-amber-50/30"
          }`}
      >
        <span className="min-w-0 flex-1 truncate text-right leading-snug">
          {value || (isDebit ? "اختر الحساب المدين…" : "اختر الحساب الدائن…")}
        </span>
        <ChevronDown className="h-4 w-4 shrink-0 text-slate-400" />
      </button>

      {open && (
        <>
          <div className="fixed inset-0 z-[998] bg-slate-900/30 backdrop-blur-sm md:hidden" />
          <div
            className="fixed inset-x-0 bottom-0 z-[999] max-h-[75vh] overflow-hidden rounded-t-3xl border border-slate-200 bg-white text-slate-900 shadow-2xl
              md:absolute md:inset-x-auto md:bottom-auto md:right-0 md:left-0 md:top-full md:mt-1.5 md:max-h-[60vh] md:w-[360px] md:rounded-2xl"
            dir="rtl"
          >
            <div className="mx-auto mt-2 h-1.5 w-12 rounded-full bg-slate-300 md:hidden" />
            <div
              className={`mt-2 flex items-center gap-2 px-3.5 py-3 border-b border-slate-200 md:mt-0
              ${isDebit ? "bg-emerald-50/80" : "bg-rose-50/80"}`}
            >
              <Search className="h-4 w-4 shrink-0 text-slate-400" />
              <input
                ref={inputRef}
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder={isDebit ? "ابحث في الحسابات المدينة…" : "ابحث في الحسابات الدائنة…"}
                className="min-w-0 flex-1 bg-transparent text-right text-xs sm:text-sm font-bold text-slate-800 outline-none placeholder:text-slate-400"
                onKeyDown={(e) => e.key === "Escape" && setOpen(false)}
              />
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="grid h-7 w-7 shrink-0 place-items-center rounded-full text-slate-400 transition-colors hover:bg-slate-200/60 hover:text-slate-700"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="border-b border-slate-100 bg-slate-50 px-3.5 py-2 text-right text-[11px] font-bold text-slate-500">
              {filtered.length} حساب متاح
            </div>

            <div className="overflow-y-auto overscroll-contain max-h-[50vh] sm:max-h-[300px]">
              {filtered.length === 0 ? (
                <p className="p-8 text-center text-xs font-bold text-slate-400">لا توجد نتائج مطابقة</p>
              ) : (
                filtered.map((acc, i) => (
                  <button
                    key={acc}
                    type="button"
                    onClick={() => pick(acc)}
                    className={`w-full break-words border-b border-slate-100 px-3.5 py-2.5 text-right text-xs sm:text-sm font-medium leading-relaxed transition-all last:border-0
                      ${
                        value === acc
                          ? isDebit
                            ? "bg-emerald-100/70 font-bold text-emerald-900 border-l-4 border-l-emerald-600"
                            : "bg-rose-100/70 font-bold text-rose-900 border-l-4 border-l-rose-600"
                          : "text-slate-700 hover:bg-slate-50 active:bg-slate-100"
                      }`}
                  >
                    <span
                      className={`ml-2 inline-block w-5 text-center text-[11px] font-bold
                      ${isDebit ? "text-emerald-600" : "text-rose-600"}`}
                    >
                      {i + 1}
                    </span>
                    {acc}
                  </button>
                ))
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}

// ── المكوّن الرئيسي ───────────────────────────────────────────────────────
export default function JournalTab() {
  const { journal, addJournal, deleteJournal, clearJournal } = useStore();

  const [editingId, setEditingId] = useState<string | null>(null);
  const [formNo, setFormNo] = useState("");
  const [settlement, setSettlement] = useState("");
  const [date, setDate] = useState("");
  const [description, setDescription] = useState("");

  const [lines, setLines] = useState<EntryLine[]>([
    { id: "d1", account: "", amount: 0, type: "debit", description: "" },
    { id: "c1", account: "", amount: 0, type: "credit", description: "" },
  ]);

  const genId = () => Math.random().toString(36).slice(2, 8);

  const addLine = (type: "debit" | "credit") =>
    setLines((p) => [...p, { id: genId(), account: "", amount: 0, type, description: "" }]);

  const removeLine = (id: string) => setLines((p) => p.filter((l) => l.id !== id));

  const updateLine = (id: string, field: keyof EntryLine, value: string | number) =>
    setLines((p) => p.map((l) => (l.id === id ? { ...l, [field]: value } : l)));

  const debitLinesArr = useMemo(() => lines.filter((l) => l.type === "debit"), [lines]);
  const creditLinesArr = useMemo(() => lines.filter((l) => l.type === "credit"), [lines]);

  const totalDebit = useMemo(
    () => debitLinesArr.reduce((s, l) => s + (Number(l.amount) || 0), 0),
    [debitLinesArr],
  );

  const totalCredit = useMemo(
    () => creditLinesArr.reduce((s, l) => s + (Number(l.amount) || 0), 0),
    [creditLinesArr],
  );

  const isBalanced = totalDebit > 0 && totalCredit > 0 && totalDebit === totalCredit;
  const diff = Math.abs(totalDebit - totalCredit);
  const balanceRatio =
    Math.max(totalDebit, totalCredit) > 0
      ? Math.min(totalDebit, totalCredit) / Math.max(totalDebit, totalCredit)
      : 0;

  const {
    rows: filteredJournal,
    filters: journalFilters,
    setFilter: setJournalFilter,
    clearFilters: clearJournalFilters,
  } = useTableControls(journal, JOURNAL_COLS.map((c) => c.key));

  const grandDebit = useMemo(
    () => filteredJournal.reduce((s, j) => s + (Number(j.debit) || 0), 0),
    [filteredJournal],
  );

  const grandCredit = useMemo(
    () => filteredJournal.reduce((s, j) => s + (Number(j.credit) || 0), 0),
    [filteredJournal],
  );

  const resetForm = () => {
    setFormNo("");
    setSettlement("");
    setDate("");
    setDescription("");
    setLines([
      { id: "d1", account: "", amount: 0, type: "debit", description: "" },
      { id: "c1", account: "", amount: 0, type: "credit", description: "" },
    ]);
    setEditingId(null);
  };

  const handleSave = () => {
    if (!description && lines.every((l) => !l.description)) {
      toast.error("يرجى تعبئة حقل البيان العام أو بيان الأسطر");
      return;
    }
    if (!isBalanced) {
      toast.error("القيد غير متوازن — يجب أن يتساوى إجمالي المدين والدائن");
      return;
    }

    const debitLines = lines.filter((l) => l.type === "debit");
    const creditLines = lines.filter((l) => l.type === "credit");

    if (editingId) {
      deleteJournal(editingId);
    }

    debitLines.forEach((dl) => {
      creditLines.forEach((cl) => {
        const ratio = (Number(cl.amount) || 0) / totalCredit;

        const combinedDescription = [description, dl.description, cl.description]
          .filter((desc) => desc && desc.trim() !== "")
          .join(" - ");

        const payload: Omit<Journal, "id"> = {
          date,
          formNo,
          settlement,
          description: combinedDescription,
          account: dl.account,
          debitAccount: dl.account,
          creditAccount: cl.account,
          debit: Number(dl.amount) || 0,
          credit: Math.round((Number(dl.amount) || 0) * ratio),
        };
        addJournal(payload);
      });
    });

    toast.success(editingId ? "تم تحديث القيد المركب بنجاح" : "تم حفظ القيد المركب بنجاح");
    resetForm();
  };

  const startEdit = (j: Journal) => {
    setEditingId(j.id);
    setFormNo(j.formNo || "");
    setSettlement(j.settlement || "");
    setDate(j.date || "");
    setDescription(j.description || "");
    setLines([
      {
        id: genId(),
        account: j.debitAccount || "",
        amount: j.debit || 0,
        type: "debit",
        description: "",
      },
      {
        id: genId(),
        account: j.creditAccount || "",
        amount: j.credit || 0,
        type: "credit",
        description: "",
      },
    ]);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const renderEntryRow = (l: EntryLine, idx: number, total: number) => {
    const isDebit = l.type === "debit";
    return (
      <tr
        key={l.id}
        className={`border-b border-slate-100 transition-colors ${
          isDebit ? "bg-emerald-50/40 hover:bg-emerald-50/80" : "bg-rose-50/40 hover:bg-rose-50/80"
        }`}
      >
        <td className="whitespace-nowrap text-center px-2 py-2 text-xs">
          <span
            className={`inline-flex items-center gap-1 rounded-md px-2 py-1 text-[11px] font-bold text-white shadow-xs ${
              isDebit ? "bg-emerald-600" : "bg-rose-600"
            }`}
          >
            {idx + 1} · {isDebit ? "مدين" : "دائن"}
          </span>
        </td>
        <td className="min-w-[180px] sm:min-w-[210px] px-2 py-2 whitespace-nowrap">
          <AccountDropdownCell
            value={l.account}
            onChange={(v) => updateLine(l.id, "account", v)}
            type={l.type}
          />
        </td>
        <td className="min-w-[150px] sm:min-w-[180px] px-2 py-2 whitespace-nowrap">
          <input
            type="text"
            value={l.description || ""}
            onChange={(e) => updateLine(l.id, "description", e.target.value)}
            placeholder="بيان السطر (اختياري)..."
            className={`w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-medium outline-none transition-all placeholder:text-slate-400 shadow-xs ${
              isDebit
                ? "focus:border-emerald-400 focus:ring-2 focus:ring-emerald-100"
                : "focus:border-rose-400 focus:ring-2 focus:ring-rose-100"
            }`}
          />
        </td>
        <td className="w-[120px] sm:w-[140px] px-2 py-2 whitespace-nowrap">
          <input
            type="number"
            inputMode="decimal"
            dir="ltr"
            value={l.amount || ""}
            onChange={(e) => updateLine(l.id, "amount", e.target.value)}
            placeholder="0.00"
            className={`w-full rounded-xl border border-slate-200 bg-white px-2.5 py-2 text-center font-mono text-sm font-bold outline-none transition-all shadow-xs ${
              isDebit
                ? "text-emerald-700 focus:border-emerald-400 focus:ring-2 focus:ring-emerald-100"
                : "text-rose-700 focus:border-rose-400 focus:ring-2 focus:ring-rose-100"
            }`}
          />
        </td>
        <td className="w-[48px] text-center px-2 py-2 whitespace-nowrap">
          {total > 1 && (
            <button
              type="button"
              onClick={() => removeLine(l.id)}
              className="grid h-8 w-8 place-items-center rounded-lg bg-white text-slate-400 border border-slate-200 transition-all hover:bg-rose-50 hover:text-rose-600 hover:border-rose-200 shadow-xs"
              title="حذف السطر"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </td>
      </tr>
    );
  };

  const journalWebActions: WebActionItem[] = [
    {
      label: "استيراد Excel",
      onSelect: () => undefined,
      content: (
        <div className="flex w-full items-center rounded-lg hover:bg-amber-100/50">
          <ImportButton kind="journal" />
        </div>
      ),
    },
  ];

  const tabActions = (
    <TabActions
      title="قيود اليومية"
      rows={journal}
      columns={[
        { key: "date", label: "التاريخ" },
        { key: "formNo", label: "رقم الاستمارة" },
        { key: "description", label: "البيان" },
        { key: "debitAccount", label: "الحساب المدين" },
        { key: "debit", label: "مدين" },
        { key: "creditAccount", label: "الحساب الدائن" },
        { key: "credit", label: "دائن" },
      ]}
      fileName="قيود-اليومية"
      numericKeys={["debit", "credit"]}
      pdfLayout="wide-centered"
      onClear={clearJournal}
      additionalWebActions={journalWebActions}
      className="w-full !grid !grid-cols-2 sm:!gap-2 [&>button]:min-w-0 [&>button]:justify-center [&>button]:px-2 [&>button]:py-1.5 [&>button]:text-xs"
    />
  );

  return (
    <div className="w-full space-y-6 p-4 bg-gray-100 font-sans min-h-screen" dir="rtl">
      <div className="max-w-7xl mx-auto space-y-6">

        {/* ══ الكرت الأول: رأس النموذج والإجراءات ══ */}
        <section className="bg-amber-50/80 p-6 rounded-2xl shadow-sm border border-amber-200">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3 w-full md:w-auto">
              <span className="p-2.5 rounded-xl bg-amber-100 border border-amber-300 flex items-center justify-center shrink-0">
                <BookOpenText className="w-6 h-6 text-amber-700" />
              </span>
              <div>
                <h1 className="text-lg font-bold text-amber-900">
                  {editingId ? "تعديل القيد المركب" : "إدخال قيد يومية مركب"}
                </h1>
                <p className="text-xs text-amber-700 mt-0.5">
                  تسجيل القيود وتوزيع المبالغ تلقائياً بين أطراف القيد
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 w-full md:w-auto justify-end">
              <div className="flex items-center justify-center h-9 px-3 rounded-lg bg-white border border-amber-300 hover:bg-amber-100/50 transition-colors shadow-xs">
                <ImportButton kind="journal" />
              </div>
            </div>
          </div>

          <div className="mt-4 pt-4 border-t border-amber-200">{tabActions}</div>
        </section>

        {/* ══ الكرت الثاني: نموذج أدخال القيد المركب ══ */}
        <section className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 space-y-5">
          <h3 className="text-sm font-bold text-slate-800 pb-2 border-b border-slate-100 flex items-center gap-2">
            <FileText className="w-4 h-4 text-amber-600" /> بيانات القيد الرئيسية
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
            <Field label="رقم الاستمارة" icon={<Hash className="h-3.5 w-3.5 text-amber-600" />}>
              <input
                placeholder="مثال: 145"
                value={formNo}
                onChange={(e) => setFormNo(e.target.value)}
                className={inputCls}
              />
            </Field>

            <Field label="كشف التسوية" icon={<FileText className="h-3.5 w-3.5 text-amber-600" />}>
              <input
                placeholder="مثال: كشف 3"
                value={settlement}
                onChange={(e) => setSettlement(e.target.value)}
                className={inputCls}
              />
            </Field>

            <Field label="التاريخ" icon={<CalendarDays className="h-3.5 w-3.5 text-amber-600" />}>
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className={inputCls}
              />
            </Field>

            <Field label="البيان العام للقيد" icon={<FileText className="h-3.5 w-3.5 text-amber-600" />}>
              <input
                placeholder="اختياري في حال تعبئة بيانات الأسطر..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className={inputCls}
              />
            </Field>
          </div>

          {/* جدول أسطر القيد */}
          <div className="overflow-x-auto border border-slate-200 rounded-xl bg-white shadow-xs">
            <table className="w-full border-collapse text-center text-xs sm:text-sm">
              <thead>
                <tr className="bg-[#E6D7C3] text-slate-800 border-b border-slate-200 font-bold">
                  <th className="px-3 py-2.5 text-center whitespace-nowrap">#</th>
                  <th className="px-3 py-2.5 text-right whitespace-nowrap">الحساب</th>
                  <th className="px-3 py-2.5 text-right whitespace-nowrap">بيان السطر</th>
                  <th className="px-3 py-2.5 text-center whitespace-nowrap">المبلغ</th>
                  <th className="px-3 py-2.5 text-center whitespace-nowrap" />
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {debitLinesArr.map((l, i) => renderEntryRow(l, i, debitLinesArr.length))}
                {creditLinesArr.map((l, i) => renderEntryRow(l, i, creditLinesArr.length))}
              </tbody>
              <tfoot>
                <tr className="bg-slate-50 border-t border-slate-200">
                  <td colSpan={5} className="p-3">
                    <div className="flex flex-wrap items-center justify-between gap-3">
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => addLine("debit")}
                          className="flex items-center gap-1.5 rounded-lg border border-emerald-300 bg-emerald-50 px-3 py-1.5 text-xs font-bold text-emerald-800 hover:bg-emerald-100 transition-colors shadow-xs"
                        >
                          <Plus className="h-3.5 w-3.5 text-emerald-600" /> إضافة حساب مدين
                        </button>
                        <button
                          type="button"
                          onClick={() => addLine("credit")}
                          className="flex items-center gap-1.5 rounded-lg border border-rose-300 bg-rose-50 px-3 py-1.5 text-xs font-bold text-rose-800 hover:bg-rose-100 transition-colors shadow-xs"
                        >
                          <Plus className="h-3.5 w-3.5 text-rose-600" /> إضافة حساب دائن
                        </button>
                      </div>

                      <div className="flex items-center gap-2 font-mono text-xs font-bold">
                        <span className="rounded-md border border-emerald-200 bg-emerald-50 px-2.5 py-1 text-emerald-800">
                          إجمالي المدين: {totalDebit.toLocaleString("en-US")}
                        </span>
                        <span className="rounded-md border border-rose-200 bg-rose-50 px-2.5 py-1 text-rose-800">
                          إجمالي الدائن: {totalCredit.toLocaleString("en-US")}
                        </span>
                      </div>
                    </div>
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>

          {/* شريط التوازن والحفظ */}
          <div
            className={`rounded-xl border p-4 transition-all shadow-xs ${
              isBalanced
                ? "border-emerald-300 bg-emerald-50/60"
                : "border-amber-300 bg-amber-50/60"
            }`}
          >
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="w-full sm:w-auto flex-1">
                <div className="flex items-center justify-between gap-2 font-mono text-xs sm:text-sm font-bold mb-1.5">
                  <span className="text-emerald-800">مدين: {totalDebit.toLocaleString("en-US")}</span>
                  <span className="text-rose-800">دائن: {totalCredit.toLocaleString("en-US")}</span>
                </div>
                <div className="h-2 w-full overflow-hidden rounded-full bg-slate-200">
                  <div
                    className={`h-full transition-all duration-300 ${
                      isBalanced ? "bg-emerald-500" : "bg-amber-500"
                    }`}
                    style={{ width: `${Math.round(balanceRatio * 100)}%` }}
                  />
                </div>
              </div>

              <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
                <span
                  className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-bold border ${
                    isBalanced
                      ? "bg-emerald-100 text-emerald-900 border-emerald-300"
                      : "bg-amber-100 text-amber-900 border-amber-300"
                  }`}
                >
                  {isBalanced ? (
                    <>
                      <CheckCircle2 className="h-4 w-4 text-emerald-700" /> القيد متوازن
                    </>
                  ) : totalDebit > 0 || totalCredit > 0 ? (
                    <>
                      <AlertTriangle className="h-4 w-4 text-amber-700" /> فرق: {diff.toLocaleString("en-US")}
                    </>
                  ) : (
                    <>
                      <Scale className="h-4 w-4 text-amber-700" /> أدخل المبالغ
                    </>
                  )}
                </span>

                <button
                  type="button"
                  onClick={handleSave}
                  disabled={!isBalanced}
                  className={`flex items-center gap-1.5 rounded-lg px-4 py-2 text-xs sm:text-sm font-bold text-white transition-colors shadow-xs ${
                    isBalanced
                      ? "bg-sky-700 hover:bg-sky-800 cursor-pointer"
                      : "bg-slate-300 text-slate-500 cursor-not-allowed"
                  }`}
                >
                  <Save className="h-4 w-4" />
                  {editingId ? "تحديث القيد" : "حفظ القيد"}
                </button>

                {editingId && (
                  <button
                    type="button"
                    onClick={resetForm}
                    className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs sm:text-sm font-bold text-slate-700 hover:bg-slate-50 transition-colors"
                  >
                    إلغاء
                  </button>
                )}
              </div>
            </div>
          </div>
        </section>

        {/* ══ الكرت الثالث: جدول كشف القيود ══ */}
        <section className="bg-violet-50/50 p-6 rounded-2xl shadow-sm border border-violet-200 space-y-4">
          <div className="flex items-center justify-between pb-2 border-b border-violet-200">
            <div className="flex items-center gap-3">
              <h2 className="text-lg font-bold text-violet-900">سجل القيود اليومية</h2>
              <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-violet-100 text-violet-800 border border-violet-300">
                {filteredJournal.length} قيد
              </span>
            </div>

            {Object.values(journalFilters).some(Boolean) && (
              <button
                type="button"
                onClick={clearJournalFilters}
                className="flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-bold text-slate-600 bg-white border border-slate-200 hover:bg-slate-50"
              >
                <X className="w-3.5 h-3.5" />
                مسح التصفية
              </button>
            )}
          </div>

          {journal.length === 0 ? (
            <div className="flex flex-col items-center justify-center p-12 text-center bg-white rounded-xl border border-violet-200 space-y-3">
              <span className="p-3 rounded-2xl bg-violet-50 text-violet-400 border border-violet-100">
                <Inbox className="h-8 w-8" />
              </span>
              <p className="text-base font-bold text-slate-700">لا توجد قيود يومية مسجلة</p>
              <p className="text-xs text-slate-500">ابدأ بإضافة قيد جديد أعلاه أو قم بأستيراد ملف Excel</p>
            </div>
          ) : (
            <div className="overflow-x-auto border border-violet-200 rounded-xl bg-white shadow-sm">
              <table className="w-full border-collapse text-center text-xs sm:text-sm">
                <thead>
                  <tr className="bg-[#E6D7C3] text-violet-900 border-b border-violet-200 font-bold">
                    {JOURNAL_COLS.map((c) => (
                      <th key={c.key} className="px-3 py-2.5 whitespace-nowrap">
                        <div className="flex flex-col gap-1.5 py-1">
                          <span>{c.label}</span>
                          <input
                            value={journalFilters[c.key] || ""}
                            onChange={(e) => setJournalFilter(c.key, e.target.value)}
                            placeholder="فلتر..."
                            className="w-full min-w-[65px] px-2 py-1 rounded text-xs border border-violet-300 text-slate-800 focus:outline-none focus:border-violet-500 bg-white font-normal"
                          />
                        </div>
                      </th>
                    ))}
                    <th className="px-3 py-2.5 whitespace-nowrap text-center">إجراءات</th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-violet-100 bg-white">
                  {filteredJournal.length === 0 ? (
                    <tr>
                      <td colSpan={JOURNAL_COLS.length + 1} className="h-28 text-center text-slate-500">
                        لا توجد قيود تطابق البحث والتصفية الحالية
                      </td>
                    </tr>
                  ) : (
                    filteredJournal.map((j) => (
                      <tr key={j.id} className="hover:bg-violet-50/40 transition-colors">
                        <td className="px-3 py-2 text-slate-700 whitespace-nowrap">
                          <span className={journalClampCls}>{j.formNo || "—"}</span>
                        </td>
                        <td className="px-3 py-2 text-slate-700">
                          <span className={journalClampCls}>{j.settlement || "—"}</span>
                        </td>
                        <td className="px-3 py-2 text-slate-700 whitespace-nowrap">
                          <span className={journalClampCls}>{j.date || "—"}</span>
                        </td>
                        <td className="px-3 py-2 text-slate-800 font-medium" title={j.description}>
                          <span className={journalClampCls}>{j.description || "—"}</span>
                        </td>
                        <td className="px-3 py-2">
                          <span className={`${journalClampCls} inline-block rounded-md bg-emerald-50 px-2 py-1 text-xs font-bold text-emerald-800 border border-emerald-200`}>
                            {j.debitAccount || "—"}
                          </span>
                        </td>
                        <td className="px-3 py-2">
                          <span className={`${journalClampCls} inline-block rounded-md bg-rose-50 px-2 py-1 text-xs font-bold text-rose-800 border border-rose-200`}>
                            {j.creditAccount || "—"}
                          </span>
                        </td>
                        <td className="px-3 py-2 font-mono font-bold text-emerald-700 whitespace-nowrap">
                          {j.debit ? j.debit.toLocaleString("en-US") : "—"}
                        </td>
                        <td className="px-3 py-2 font-mono font-bold text-rose-700 whitespace-nowrap">
                          {j.credit ? j.credit.toLocaleString("en-US") : "—"}
                        </td>
                        <td className="px-3 py-2 whitespace-nowrap">
                          <div className="flex items-center justify-center gap-1">
                            <button
                              type="button"
                              onClick={() => startEdit(j)}
                              className="p-1.5 rounded-lg text-blue-600 hover:bg-blue-50 transition-colors"
                              title="تعديل"
                            >
                              <Edit className="h-4 w-4" />
                            </button>
                            <button
                              type="button"
                              onClick={() => {
                                if (confirm("هل أنت متأكد من حذف هذا القيد؟")) deleteJournal(j.id);
                              }}
                              className="p-1.5 rounded-lg text-rose-600 hover:bg-rose-50 transition-colors"
                              title="حذف"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>

                {filteredJournal.length > 0 && (
                  <tfoot className="bg-violet-50/70 border-t border-violet-200 font-bold">
                    <tr>
                      <td colSpan={6} className="px-3 py-3 text-right text-slate-700 whitespace-nowrap">
                        إجمالي النتائج الحالية
                      </td>
                      <td className="px-3 py-3 font-mono text-emerald-800 whitespace-nowrap">
                        {grandDebit.toLocaleString("en-US")}
                      </td>
                      <td className="px-3 py-3 font-mono text-rose-800 whitespace-nowrap">
                        {grandCredit.toLocaleString("en-US")}
                      </td>
                      <td />
                    </tr>
                  </tfoot>
                )}
              </table>
            </div>
          )}
        </section>

      </div>
    </div>
  );
}
