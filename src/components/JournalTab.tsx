import { useState, useMemo, useRef, useEffect } from "react";
import { useStore } from "@/lib/store";
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
  RotateCcw,
  Sparkles,
  ArrowDownLeft,
  ArrowUpRight,
} from "lucide-react";
import { toast } from "sonner";
import ImportButton from "@/components/ImportButton";
import TabActions from "@/components/TabActions";
import type { WebActionItem } from "@/components/WebActionMenu";
import type { Journal } from "@/lib/store";
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

// ── حقل إدخال عصري مع تسمية وأيقونة ───────────────────────────────────────
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
      <span className="mb-1.5 flex items-center gap-1.5 text-xs font-bold text-indigo-950/80">
        <span className="text-purple-600 transition-transform duration-200 group-hover:scale-110">
          {icon}
        </span>
        {label}
      </span>
      {children}
    </label>
  );
}

const inputCls =
  "w-full min-w-0 rounded-xl border border-indigo-200/80 bg-white/90 px-3 py-2.5 text-xs sm:text-sm font-semibold text-slate-800 shadow-sm outline-none transition-all placeholder:text-slate-400 focus:border-purple-600 focus:bg-white focus:ring-4 focus:ring-purple-500/15";

const journalClampCls =
  "block max-w-[95px] overflow-hidden text-ellipsis whitespace-nowrap leading-snug sm:max-w-[190px]";

// ── قائمة اختيار الحسابات مع بحث منبثق ────────────────────────────────────
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
    const q = query.trim();
    if (!q) return ALL_EXCEL_ACCOUNTS;
    return ALL_EXCEL_ACCOUNTS.filter((a) => a.toLowerCase().includes(q.toLowerCase()));
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
    <div ref={wrapRef} className="relative w-full min-w-[180px] sm:min-w-[210px]">
      <button
        type="button"
        onClick={handleOpen}
        className={`flex min-h-[40px] w-full items-center justify-between gap-1.5 rounded-xl border px-2.5 py-2 text-right text-xs sm:text-sm font-bold shadow-sm transition-all active:scale-[0.99]
          ${
            value
              ? isDebit
                ? "border-emerald-300 bg-emerald-50 text-emerald-950 hover:bg-emerald-100/70"
                : "border-rose-300 bg-rose-50 text-rose-950 hover:bg-rose-100/70"
              : "border-dashed border-indigo-200 bg-indigo-50/40 text-slate-400 hover:border-purple-400 hover:bg-white"
          }`}
      >
        <span className="min-w-0 flex-1 truncate text-right leading-snug">
          {value || (isDebit ? "اختر الحساب المدين…" : "اختر الحساب الدائن…")}
        </span>
        <ChevronDown className="h-3.5 w-3.5 shrink-0 text-slate-400" />
      </button>

      {open && (
        <>
          <div className="fixed inset-0 z-[998] bg-slate-950/50 backdrop-blur-sm md:hidden" />
          <div
            className="fixed inset-x-0 bottom-0 z-[999] max-h-[75vh] overflow-hidden rounded-t-3xl border border-indigo-100 bg-white shadow-2xl
              md:absolute md:inset-x-auto md:bottom-auto md:right-0 md:left-0 md:top-full md:mt-1.5 md:max-h-[62vh] md:w-[370px] md:rounded-2xl"
            dir="rtl"
          >
            <div className="mx-auto mt-2 h-1.5 w-12 rounded-full bg-slate-200 md:hidden" />
            <div
              className={`mt-2 flex items-center gap-2 px-3 py-3 md:mt-0
              ${isDebit ? "bg-gradient-to-l from-emerald-800 to-teal-700" : "bg-gradient-to-l from-rose-800 to-pink-700"}`}
            >
              <Search className="h-4 w-4 shrink-0 text-white" />
              <input
                ref={inputRef}
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder={isDebit ? "ابحث في الحسابات المدينة…" : "ابحث في الحسابات الدائنة…"}
                className="min-w-0 flex-1 bg-transparent text-right text-xs sm:text-sm font-semibold text-white outline-none placeholder:text-white/70"
                onKeyDown={(e) => e.key === "Escape" && setOpen(false)}
              />
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="grid h-7 w-7 shrink-0 place-items-center rounded-full text-white/80 transition-colors hover:bg-white/20 hover:text-white"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="border-b border-indigo-50 bg-indigo-50/50 px-3 py-1.5 text-right text-xs font-bold text-indigo-900/70">
              {filtered.length} حساب متاح
            </div>

            <div className="overflow-y-auto overscroll-contain" style={{ maxHeight: "56vh" }}>
              {filtered.length === 0 ? (
                <p className="p-8 text-center text-sm font-bold text-slate-400">لا توجد نتائج مطابقة</p>
              ) : (
                filtered.map((acc, i) => (
                  <button
                    key={acc}
                    type="button"
                    onClick={() => pick(acc)}
                    className={`w-full break-words border-b border-slate-100 px-3 py-3 text-right text-xs sm:text-sm font-semibold leading-relaxed transition-colors last:border-0
                      ${
                        value === acc
                          ? isDebit
                            ? "bg-emerald-100 text-emerald-950 font-black"
                            : "bg-rose-100 text-rose-950 font-black"
                          : "text-slate-700 hover:bg-indigo-50/60 active:bg-indigo-100"
                      }`}
                  >
                    <span
                      className={`ml-2 inline-block w-6 text-center text-xs font-bold
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

// ── المكوّن الرئيسي لتبويب القيود اليومية ──────────────────────────────────
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
  const updateLine = (id: string, field: keyof EntryLine, value: any) =>
    setLines((p) => p.map((l) => (l.id === id ? { ...l, [field]: value } : l)));

  const debitLinesArr = lines.filter((l) => l.type === "debit");
  const creditLinesArr = lines.filter((l) => l.type === "credit");

  const totalDebit = debitLinesArr.reduce((s, l) => s + (Number(l.amount) || 0), 0);
  const totalCredit = creditLinesArr.reduce((s, l) => s + (Number(l.amount) || 0), 0);
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

  const grandDebit = filteredJournal.reduce((s, j) => s + (Number(j.debit) || 0), 0);
  const grandCredit = filteredJournal.reduce((s, j) => s + (Number(j.credit) || 0), 0);

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
        className={`border-b border-indigo-100/60 transition-colors ${
          isDebit
            ? "bg-emerald-50/40 hover:bg-emerald-50/70"
            : "bg-rose-50/40 hover:bg-rose-50/70"
        }`}
      >
        <td className="!whitespace-nowrap text-center !px-1.5 !py-2 !text-xs sm:!text-sm">
          <span
            className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-black shadow-sm text-white
            ${isDebit ? "bg-gradient-to-l from-emerald-600 to-teal-600" : "bg-gradient-to-l from-rose-600 to-red-600"}`}
          >
            {isDebit ? <ArrowDownLeft className="h-3 w-3" /> : <ArrowUpRight className="h-3 w-3" />}
            {idx + 1} · {isDebit ? "مدين" : "دائن"}
          </span>
        </td>
        <td className="min-w-[180px] sm:min-w-[210px] !px-1.5 !py-2 !text-xs sm:!text-sm whitespace-nowrap">
          <AccountDropdownCell
            value={l.account}
            onChange={(v) => updateLine(l.id, "account", v)}
            type={l.type}
          />
        </td>
        <td className="min-w-[150px] sm:min-w-[180px] !px-1.5 !py-2 !text-xs sm:!text-sm whitespace-nowrap">
          <input
            type="text"
            value={l.description || ""}
            onChange={(e) => updateLine(l.id, "description", e.target.value)}
            placeholder="بيان السطر (اختياري)"
            className={`min-w-0 w-full rounded-xl border bg-white px-2.5 py-2 text-xs sm:text-sm font-semibold outline-none shadow-sm transition-all
              ${
                isDebit
                  ? "border-emerald-200 text-emerald-950 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20"
                  : "border-rose-200 text-rose-950 focus:border-rose-500 focus:ring-2 focus:ring-rose-500/20"
              }`}
          />
        </td>
        <td className="w-[110px] sm:w-[130px] !px-1.5 !py-2 !text-xs sm:!text-sm whitespace-nowrap">
          <input
            type="number"
            inputMode="decimal"
            dir="ltr"
            value={l.amount || ""}
            onChange={(e) => updateLine(l.id, "amount", e.target.value)}
            placeholder="0.00"
            className={`min-w-0 w-full rounded-xl border bg-white px-2 py-2 text-center font-mono text-xs sm:text-sm font-bold shadow-sm outline-none transition-all
              ${
                isDebit
                  ? "border-emerald-200 text-emerald-900 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20"
                  : "border-rose-200 text-rose-900 focus:border-rose-500 focus:ring-2 focus:ring-rose-500/20"
              }`}
          />
        </td>
        <td className="w-[50px] text-center !px-1.5 !py-2 !text-xs sm:!text-sm whitespace-nowrap">
          {total > 1 && (
            <button
              type="button"
              onClick={() => removeLine(l.id)}
              className="grid h-8 w-8 place-items-center rounded-xl text-slate-400 shadow-sm transition-all hover:bg-rose-100 hover:text-rose-600 active:scale-95"
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
        <div className="flex w-full items-center rounded-lg hover:bg-slate-100">
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
      className="w-full !grid !grid-cols-2 sm:!flex !gap-2 [&>button]:min-w-0 [&>button]:justify-center [&>button]:rounded-xl [&>button]:px-2 [&>button]:py-2 [&>button]:text-xs [&>button]:font-bold [&>button]:shadow-sm"
    />
  );

  return (
    <div
      className="w-full space-y-3.5 overflow-x-hidden p-1.5 sm:p-3 bg-gradient-to-br from-slate-100 via-indigo-50/40 to-purple-50/30 min-h-screen"
      dir="rtl"
    >
      {/* ══ 1. بطاقة إدخال القيد اليومي المركب ══ */}
      <section className="overflow-hidden rounded-2xl border border-indigo-100/80 bg-white/95 shadow-md backdrop-blur-md">
        {/* الترويسة الفخمة */}
        <div className="relative bg-gradient-to-l from-slate-950 via-indigo-950 to-purple-950 px-3 py-3 sm:px-5 sm:py-4">
          <div className="absolute inset-x-0 top-0 h-[3px] bg-gradient-to-r from-purple-400 via-pink-400 to-indigo-300 opacity-80" />
          <div className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-2.5">
            <div className="flex min-w-0 items-center gap-2.5">
              <span className="grid h-11 w-11 shrink-0 place-items-center rounded-2xl border border-purple-400/30 bg-purple-500/20 text-purple-200 shadow-inner">
                <BookOpenText className="h-5 w-5" />
              </span>
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <h3 className="truncate text-base font-black text-white">
                    {editingId ? "تعديل القيد المركب" : "قيد يومية مركب"}
                  </h3>
                  {editingId && (
                    <span className="rounded-full bg-amber-400/20 px-2 py-0.5 text-[11px] font-bold text-amber-300 border border-amber-400/30">
                      وضع التعديل
                    </span>
                  )}
                </div>
                <p className="truncate text-xs font-semibold text-indigo-200/80">
                  إدخال أطراف متعددة مع احتساب وتوزيع آلي متزن
                </p>
              </div>
            </div>

            <div className="apk-only-actions shrink-0 [&>label]:border-purple-500/40 [&>label]:bg-gradient-to-r [&>label]:from-purple-600 [&>label]:to-indigo-600 [&>label]:text-white [&>label]:shadow-sm [&>label]:hover:brightness-110 [&>label]:rounded-xl [&>label]:px-2.5 [&>label]:py-1.5 [&>label]:text-xs [&>label]:font-bold">
              <ImportButton kind="journal" />
            </div>
          </div>

          <div className="mt-3 border-t border-white/10 pt-2.5">{tabActions}</div>
        </div>

        {/* جسم النموذج: حقلين في كل سطر بدقة */}
        <div className="space-y-3.5 p-3 sm:p-4">
          <div className="grid grid-cols-2 gap-2 sm:gap-3">
            {/* السطر الأول: رقم الاستمارة | كشف التسوية */}
            <Field label="رقم الاستمارة" icon={<Hash className="h-3.5 w-3.5" />}>
              <input
                placeholder="مثال: 145"
                value={formNo}
                onChange={(e) => setFormNo(e.target.value)}
                className={inputCls}
              />
            </Field>

            <Field label="كشف التسوية" icon={<FileText className="h-3.5 w-3.5" />}>
              <input
                placeholder="مثال: كشف 3"
                value={settlement}
                onChange={(e) => setSettlement(e.target.value)}
                className={inputCls}
              />
            </Field>

            {/* السطر الثاني: تاريخ القيد | البيان العام */}
            <Field label="تاريخ القيد" icon={<CalendarDays className="h-3.5 w-3.5" />}>
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className={inputCls}
              />
            </Field>

            <Field label="البيان العام للقيد" icon={<FileText className="h-3.5 w-3.5" />}>
              <input
                placeholder="بيان اختياري شامل"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className={inputCls}
              />
            </Field>
          </div>

          {/* جدول أطراف القيد (المدين والدائن) */}
          <div className="overflow-hidden rounded-2xl border border-indigo-100 shadow-sm">
            <div className="overflow-auto max-h-[80vh]">
              <table className="min-w-auto w-full table-auto border-collapse text-right text-xs sm:text-sm font-semibold">
                <thead className="bg-gradient-to-l from-indigo-950 to-purple-900 text-white">
                  <tr>
                    <th className="!whitespace-nowrap text-center font-bold !px-2 !py-2.5 !text-xs sm:!text-sm">
                      الطرف
                    </th>
                    <th className="!whitespace-nowrap text-right font-bold !px-2 !py-2.5 !text-xs sm:!text-sm">
                      الحساب
                    </th>
                    <th className="!whitespace-nowrap text-right font-bold !px-2 !py-2.5 !text-xs sm:!text-sm">
                      بيان السطر
                    </th>
                    <th className="!whitespace-nowrap text-center font-bold !px-2 !py-2.5 !text-xs sm:!text-sm">
                      المبلغ
                    </th>
                    <th className="!whitespace-nowrap text-center font-bold !px-2 !py-2.5 !text-xs sm:!text-sm" />
                  </tr>
                </thead>
                <tbody>
                  {debitLinesArr.map((l, i) => renderEntryRow(l, i, debitLinesArr.length))}
                  {creditLinesArr.map((l, i) => renderEntryRow(l, i, creditLinesArr.length))}
                </tbody>
              </table>
            </div>

            {/* أزرار إضافة الأطراف: زرين في سطر واحد بدقة */}
            <div className="border-t border-indigo-100 bg-indigo-50/40 p-2.5">
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => addLine("debit")}
                  className="flex min-h-[38px] items-center justify-center gap-1.5 rounded-xl border border-emerald-300 bg-emerald-50/80 px-2 text-xs sm:text-sm font-bold text-emerald-900 shadow-sm transition-all hover:bg-emerald-100 active:scale-[0.98]"
                >
                  <Plus className="h-4 w-4 text-emerald-600" /> إضافة حساب مدين
                </button>
                <button
                  type="button"
                  onClick={() => addLine("credit")}
                  className="flex min-h-[38px] items-center justify-center gap-1.5 rounded-xl border border-rose-300 bg-rose-50/80 px-2 text-xs sm:text-sm font-bold text-rose-900 shadow-sm transition-all hover:bg-rose-100 active:scale-[0.98]"
                >
                  <Plus className="h-4 w-4 text-rose-600" /> إضافة حساب دائن
                </button>
              </div>
            </div>
          </div>

          {/* ══ بطاقة التوازن ومؤشر التعادل ══ */}
          <div
            className={`rounded-2xl border p-3 shadow-md backdrop-blur-md transition-all
              ${
                isBalanced
                  ? "border-emerald-300 bg-gradient-to-br from-emerald-50/90 to-teal-50/90"
                  : "border-amber-300 bg-gradient-to-br from-amber-50/90 to-purple-50/70"
              }`}
          >
            {/* إحصائيات سريعة */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 pb-2.5">
              <div className="rounded-xl border border-emerald-200 bg-white/80 p-2 text-center shadow-xs">
                <span className="text-[11px] font-bold text-emerald-700">إجمالي المدين</span>
                <p className="font-mono text-sm sm:text-base font-black text-emerald-950">
                  {totalDebit.toLocaleString("en-US")}
                </p>
              </div>

              <div className="rounded-xl border border-rose-200 bg-white/80 p-2 text-center shadow-xs">
                <span className="text-[11px] font-bold text-rose-700">إجمالي الدائن</span>
                <p className="font-mono text-sm sm:text-base font-black text-rose-950">
                  {totalCredit.toLocaleString("en-US")}
                </p>
              </div>

              <div className="col-span-2 sm:col-span-1 rounded-xl border border-indigo-200 bg-white/80 p-2 text-center shadow-xs flex flex-col justify-center">
                <span className="text-[11px] font-bold text-indigo-900">حالة التوازن</span>
                <div className="flex items-center justify-center gap-1.5 font-bold text-xs sm:text-sm">
                  {isBalanced ? (
                    <span className="inline-flex items-center gap-1 text-emerald-600">
                      <CheckCircle2 className="h-4 w-4" /> متوازن تماماً
                    </span>
                  ) : totalDebit > 0 || totalCredit > 0 ? (
                    <span className="inline-flex items-center gap-1 text-amber-600">
                      <AlertTriangle className="h-4 w-4" /> فارق {diff.toLocaleString("en-US")}
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 text-slate-400">
                      <Scale className="h-4 w-4" /> بانتظار المبالغ
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* شريط التقدم المرئي للتعادل */}
            <div className="mt-1 h-2 w-full overflow-hidden rounded-full bg-slate-200/80">
              <div
                className={`h-full rounded-full transition-all duration-300 ${
                  isBalanced
                    ? "bg-gradient-to-r from-emerald-500 to-teal-500"
                    : "bg-gradient-to-r from-amber-400 to-rose-400"
                }`}
                style={{ width: `${Math.round(balanceRatio * 100)}%` }}
              />
            </div>

            {/* أزرار الحفظ والإلغاء: 2 أزرار في سطر واحد */}
            <div className="mt-3 grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={handleSave}
                title={isBalanced ? "" : "يجب تساوي إجمالي المدين والدائن"}
                className={`flex min-h-[44px] items-center justify-center gap-2 rounded-xl px-2 text-xs sm:text-sm font-black text-white shadow-md transition-all active:scale-[0.98]
                  ${
                    isBalanced
                      ? "bg-gradient-to-l from-purple-700 via-indigo-700 to-purple-800 shadow-purple-600/30 hover:brightness-110"
                      : "bg-slate-300 text-slate-500 cursor-not-allowed"
                  }`}
              >
                <Save className="h-4 w-4" />
                {editingId ? "تحديث القيد" : "حفظ القيد المركب"}
              </button>

              <button
                type="button"
                onClick={resetForm}
                className="flex min-h-[44px] items-center justify-center gap-1.5 rounded-xl border border-slate-200 bg-white px-2 text-xs sm:text-sm font-bold text-slate-700 shadow-sm transition-all hover:bg-slate-100 active:scale-[0.98]"
              >
                <RotateCcw className="h-4 w-4 text-slate-500" />
                {editingId ? "إلغاء التعديل" : "تفريغ الحقول"}
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* ══ 2. جدول سجل القيود اليومية ══ */}
      <section className="overflow-hidden rounded-2xl border border-indigo-100/80 bg-white/95 shadow-md backdrop-blur-md">
        <div className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-2 bg-gradient-to-l from-slate-950 via-indigo-950 to-purple-950 px-3 py-3 sm:px-5 sm:py-3.5">
          <div className="flex items-center gap-2">
            <span className="grid h-8 w-8 place-items-center rounded-xl bg-purple-500/20 text-purple-200">
              <Sparkles className="h-4 w-4" />
            </span>
            <h3 className="truncate text-sm sm:text-base font-black text-white">
              سجل القيود اليومية
            </h3>
          </div>

          <div className="flex min-w-0 items-center justify-end gap-1.5 sm:gap-2">
            {Object.values(journalFilters).some(Boolean) && (
              <button
                type="button"
                onClick={clearJournalFilters}
                className="rounded-full border border-white/20 bg-white/10 px-2.5 py-1 text-xs font-bold text-white transition-colors hover:bg-white/20"
              >
                مسح التصفية
              </button>
            )}
            <span className="shrink-0 rounded-full bg-purple-400/20 border border-purple-400/30 px-3 py-1 text-xs font-bold text-purple-200">
              {filteredJournal.length} قيد
            </span>
          </div>
        </div>

        {journal.length === 0 ? (
          <div className="flex flex-col items-center gap-3 p-10 text-center">
            <span className="grid h-16 w-16 place-items-center rounded-2xl bg-indigo-50 text-indigo-400">
              <Inbox className="h-8 w-8" />
            </span>
            <p className="text-base font-bold text-slate-700">لا توجد قيود يومية مسجلة بعد</p>
            <p className="text-xs text-slate-400">ابدأ بإدخال أول قيد أعلاه أو استورد ملف Excel مباشر</p>
            <div className="[&>label]:border-purple-600 [&>label]:bg-purple-600 [&>label]:text-white [&>label]:hover:bg-purple-700 [&>label]:rounded-xl [&>label]:px-3 [&>label]:py-2 [&>label]:text-xs [&>label]:font-bold">
              <ImportButton kind="journal" />
            </div>
          </div>
        ) : (
          <div className="overflow-auto max-h-[75vh]">
            <table className="w-auto min-w-auto table-auto border-collapse text-center text-xs sm:text-sm font-semibold">
              <thead className="sticky top-0 z-20 bg-gradient-to-l from-slate-900 via-indigo-950 to-purple-900 text-white shadow-md">
                <tr>
                  {JOURNAL_COLS.map((c) => (
                    <th
                      key={c.key}
                      className="min-w-0 max-w-[120px] whitespace-nowrap border-b border-white/10 text-center font-bold leading-tight !px-2 !py-2.5 !text-xs sm:!text-sm"
                    >
                      {c.label}
                    </th>
                  ))}
                  <th className="min-w-0 max-w-[100px] whitespace-nowrap border-b border-white/10 text-center font-bold leading-tight !px-2 !py-2.5 !text-xs sm:!text-sm">
                    الإجراءات
                  </th>
                </tr>
                {/* صف التصفية */}
                <tr className="bg-indigo-50/70 text-slate-700">
                  {JOURNAL_COLS.map((c) => (
                    <th key={c.key} className="border-b border-indigo-100 !px-1.5 !py-1.5">
                      <input
                        value={journalFilters[c.key] || ""}
                        onChange={(e) => setJournalFilter(c.key, e.target.value)}
                        placeholder="تصفية..."
                        aria-label={`تصفية ${c.label}`}
                        className="w-full min-w-[55px] rounded-lg border border-indigo-200 bg-white px-2 py-1 text-xs font-bold text-slate-800 outline-none transition-colors placeholder:text-slate-400 focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20"
                      />
                    </th>
                  ))}
                  <th className="border-b border-indigo-100 !px-1.5 !py-1.5" />
                </tr>
              </thead>
              <tbody>
                {filteredJournal.length === 0 ? (
                  <tr>
                    <td
                      colSpan={JOURNAL_COLS.length + 1}
                      className="border-b border-slate-100 bg-white px-2 py-6 text-center text-sm font-bold text-slate-500"
                    >
                      لا توجد قيود تطابق معايير التصفية المحددة.
                    </td>
                  </tr>
                ) : (
                  filteredJournal.map((j) => (
                    <tr
                      key={j.id}
                      className="border-b border-indigo-50/70 odd:bg-white even:bg-indigo-50/20 transition-colors hover:bg-purple-50/60"
                    >
                      <td className="min-w-0 max-w-[90px] font-mono text-slate-600 !px-1.5 !py-2 !text-xs sm:!text-sm whitespace-nowrap">
                        <span className={journalClampCls}>{j.formNo || "—"}</span>
                      </td>
                      <td className="min-w-0 max-w-[90px] text-slate-600 !px-1.5 !py-2 !text-xs sm:!text-sm">
                        <span className={journalClampCls}>{j.settlement || "—"}</span>
                      </td>
                      <td className="min-w-0 max-w-[105px] font-mono text-slate-600 !px-1.5 !py-2 !text-xs sm:!text-sm whitespace-normal">
                        <span className={journalClampCls}>{j.date || "—"}</span>
                      </td>
                      <td
className="min-w-0 max-w-auto font-medium text-slate-800 !px-1.5 !py-2 !text-xs sm:!text-sm whitespace-normal"
                        title={j.description}
                      >
                        <span className={journalClampCls}>{j.description || "—"}</span>
                      </td>
                      <td className="min-w-0 max-w-auto !px-1.5 !py-2 !text-xs sm:!text-sm">
                        <span className={`${journalClampCls} rounded-full bg-emerald-50 px-2.5 py-1 text-xs sm:text-sm font-bold text-emerald-950 border border-emerald-200/60`}>
                          {j.debitAccount || "—"}
                        </span>
                      </td>
                      <td className="min-w-0 max-w-[180px] !px-1.5 !py-2 !text-xs sm:!text-sm whitespace-normal">
                        <span className={`${journalClampCls} rounded-full bg-rose-50 px-2.5 py-1 text-xs sm:text-sm font-bold text-rose-950 border border-rose-200/60`}>
                          {j.creditAccount || "—"}
                        </span>
                      </td>
                      <td className="min-w-0 max-w-[105px] font-mono font-black text-emerald-800 !px-1.5 !py-2 !text-xs sm:!text-sm whitespace-nowrap">
                        <span className={journalClampCls}>
                          {j.debit ? j.debit.toLocaleString("en-US") : "—"}
                        </span>
                      </td>
                      <td className="min-w-0 max-w-[105px] font-mono font-black text-rose-800 !px-1.5 !py-2 !text-xs sm:!text-sm whitespace-nowrap">
                        <span className={journalClampCls}>
                          {j.credit ? j.credit.toLocaleString("en-US") : "—"}
                        </span>
                      </td>
                      <td className="min-w-0 !px-1.5 !py-2 !text-xs sm:!text-sm">
                        <div className="flex justify-center gap-1.5">
                          <button
                            type="button"
                            onClick={() => startEdit(j)}
                            className="grid h-8 w-8 place-items-center rounded-xl bg-purple-50 text-purple-700 shadow-xs transition-all hover:bg-purple-600 hover:text-white active:scale-95"
                            title="تعديل القيد"
                          >
                            <Edit className="h-3.5 w-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={() => deleteJournal(j.id)}
                            className="grid h-8 w-8 place-items-center rounded-xl bg-rose-50 text-rose-600 shadow-xs transition-all hover:bg-rose-600 hover:text-white active:scale-95"
                            title="حذف القيد"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
              <tfoot className="sticky bottom-0 z-10 bg-indigo-50/95 backdrop-blur-md">
                <tr className="border-t-2 border-indigo-200/80">
                  <td colSpan={6} className="text-right font-black text-indigo-950 !px-2 !py-2.5 !text-xs sm:!text-sm whitespace-nowrap">
                    إجمالي القيود المعروضة
                  </td>
                  <td className="font-mono font-black text-emerald-900 !px-2 !py-2.5 !text-xs sm:!text-sm whitespace-nowrap">
                    {grandDebit.toLocaleString("en-US")}
                  </td>
                  <td className="font-mono font-black text-rose-900 !px-2 !py-2.5 !text-xs sm:!text-sm whitespace-nowrap">
                    {grandCredit.toLocaleString("en-US")}
                  </td>
                  <td />
                </tr>
              </tfoot>
            </table>
          </div>
        )}
      </section>
    </div>
  );
}
