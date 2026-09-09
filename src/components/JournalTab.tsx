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
  CheckCircle2,
  AlertTriangle,
  Inbox,
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

// ── حقل مع تسمية (رأس النموذج) ───────────────────────────────────
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
    <label className={`group relative flex flex-col gap-1.5 ${className}`}>
      <span className="flex items-center gap-1.5 text-[13px] font-bold text-slate-800">
        {icon && <span className="text-slate-600">{icon}</span>}
        {label}
      </span>
      {children}
    </label>
  );
}

const inputCls =
  "w-full rounded-xl border border-slate-900 bg-slate-200/60 px-3.5 py-2.5 text-sm font-bold text-slate-900 outline-none transition-all shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] placeholder:text-slate-500 hover:bg-slate-200 focus:border-black focus:bg-slate-100 focus:ring-2 focus:ring-black/10";

// ── قائمة اختيار الحساب المحسنة ──────────────────────────────────────────
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
    <div ref={wrapRef} className="relative w-full min-w-[200px]">
      <button
        type="button"
        onClick={handleOpen}
        className={`flex h-[42px] w-full items-center justify-between gap-2 rounded-lg border border-slate-900 px-3 text-right text-[13px] font-bold shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] transition-all active:translate-y-0.5
          ${
            value
              ? isDebit
                ? "bg-emerald-100 text-emerald-950"
                : "bg-rose-100 text-rose-950"
              : "bg-slate-200 text-slate-700 hover:bg-slate-300"
          }`}
      >
        <span className="min-w-0 flex-1 truncate text-right">
          {value || (isDebit ? "اختر الحساب المدين…" : "اختر الحساب الدائن…")}
        </span>
        <ChevronDown className="h-4 w-4 shrink-0 opacity-70" />
      </button>

      {open && (
        <>
          <div className="fixed inset-0 z-[998] bg-slate-900/40 backdrop-blur-sm md:hidden" />
          <div
            className="fixed inset-x-0 bottom-0 z-[999] flex max-h-[75vh] flex-col overflow-hidden rounded-t-3xl border-2 border-slate-900 bg-slate-100 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]
              md:absolute md:inset-x-auto md:bottom-auto md:left-0 md:right-0 md:top-[calc(100%+4px)] md:max-h-[350px] md:w-[320px] md:rounded-xl"
            dir="rtl"
          >
            <div className="border-b border-slate-900 bg-slate-200 p-2 md:p-1.5">
              <div className="mx-auto mb-2 h-1.5 w-12 rounded-full bg-slate-400 md:hidden" />
              <div className="relative flex items-center">
                <Search className="absolute right-3 h-4 w-4 text-slate-600" />
                <input
                  ref={inputRef}
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="ابحث عن حساب..."
                  className="w-full rounded-lg border border-slate-900 bg-slate-50 py-2 pl-9 pr-9 text-sm font-bold text-slate-900 outline-none shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] focus:ring-2 focus:ring-slate-900"
                  onKeyDown={(e) => e.key === "Escape" && setOpen(false)}
                />
                <button
                  onClick={() => setOpen(false)}
                  className="absolute left-2 rounded p-1 text-slate-600 hover:bg-slate-300 hover:text-slate-900 md:hidden"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-1.5 overscroll-contain">
              {filtered.length === 0 ? (
                <div className="py-8 text-center text-sm font-bold text-slate-500">لا توجد نتائج مطابقة</div>
              ) : (
                filtered.map((acc) => (
                  <button
                    key={acc}
                    type="button"
                    onClick={() => pick(acc)}
                    className={`mb-1 w-full rounded-md border border-slate-900 px-3 py-2.5 text-right text-[13px] font-bold transition-colors shadow-[1px_1px_0px_0px_rgba(0,0,0,1)]
                      ${
                        value === acc
                          ? isDebit
                            ? "bg-emerald-300 text-emerald-950"
                            : "bg-rose-300 text-rose-950"
                          : "bg-slate-50 text-slate-800 hover:bg-slate-200"
                      }`}
                  >
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

    toast.success(editingId ? "تم تحديث القيد بنجاح" : "تم حفظ القيد بنجاح");
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

  // ── سطر إدخال القيد ───────────────────────────────────
  const renderEntryRow = (l: EntryLine, idx: number, total: number) => {
    const isDebit = l.type === "debit";
    return (
      <tr
        key={l.id}
        className={`group border-b border-slate-900 transition-colors ${
          isDebit
            ? "bg-emerald-100/40 hover:bg-emerald-100/70"
            : "bg-rose-100/40 hover:bg-rose-100/70"
        }`}
      >
        <td className="px-3 py-2.5 text-center align-middle sm:px-4">
          <span
            className={`inline-flex h-6 w-6 items-center justify-center rounded-full border border-slate-900 text-xs font-black shadow-[1px_1px_0px_0px_rgba(0,0,0,1)]
            ${isDebit ? "bg-emerald-300 text-emerald-950" : "bg-rose-300 text-rose-950"}`}
          >
            {idx + 1}
          </span>
        </td>
        <td className="px-2 py-2.5 align-middle sm:px-3">
          <AccountDropdownCell
            value={l.account}
            onChange={(v) => updateLine(l.id, "account", v)}
            type={l.type}
          />
        </td>
        <td className="px-2 py-2.5 align-middle sm:px-3">
          <input
            type="text"
            value={l.description || ""}
            onChange={(e) => updateLine(l.id, "description", e.target.value)}
            placeholder="بيان تفصيلي (اختياري)"
            className="h-[42px] w-full min-w-[150px] rounded-lg border border-slate-900 bg-slate-200/80 px-3 text-sm font-bold text-slate-900 outline-none shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] placeholder:text-slate-500 focus:border-black focus:bg-slate-100"
          />
        </td>
        <td className="px-2 py-2.5 align-middle sm:px-3">
          <input
            type="number"
            inputMode="decimal"
            dir="ltr"
            value={l.amount || ""}
            onChange={(e) => updateLine(l.id, "amount", e.target.value)}
            placeholder="0.00"
            className={`h-[42px] w-full min-w-[120px] rounded-lg border border-slate-900 px-3 text-left font-mono text-[15px] font-black outline-none shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] placeholder:font-sans focus:bg-slate-100
              ${
                isDebit
                  ? "bg-emerald-50 text-emerald-900 focus:border-emerald-700"
                  : "bg-rose-50 text-rose-900 focus:border-rose-700"
              }`}
          />
        </td>
        <td className="px-3 py-2.5 text-center align-middle sm:px-4">
          {total > 1 && (
            <button
              onClick={() => removeLine(l.id)}
              className="flex h-8 w-8 items-center justify-center rounded-lg border border-slate-900 bg-slate-200 text-slate-700 shadow-[1px_1px_0px_0px_rgba(0,0,0,1)] transition-all hover:bg-rose-200 hover:text-rose-900 active:translate-y-0.5"
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
        <div className="flex w-full items-center rounded-lg hover:bg-slate-200">
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
      className="flex flex-wrap gap-2 [&>button]:flex-1 [&>button]:justify-center"
    />
  );

  return (
    <div className="mx-auto w-full max-w-7xl space-y-6 bg-slate-200/50 p-3 sm:p-5 sm:pb-24" dir="rtl">
      {/* ══ بطاقة إدخال القيد ══ */}
      <section className="relative overflow-hidden rounded-2xl border-2 border-slate-900 bg-slate-100 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
        {/* الترويسة العلوية */}
        <div className="border-b-2 border-slate-900 bg-slate-300/70 px-4 py-3.5 sm:px-6">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-slate-900 bg-sky-200 text-sky-950 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
                <BookOpenText className="h-5 w-5" />
              </div>
              <div>
                <h3 className="text-base font-black text-slate-900">
                  {editingId ? "تعديل قيد يومية" : "إضافة قيد يومية مركب"}
                </h3>
                <p className="text-xs font-bold text-slate-600">
                  قم بتسجيل أطراف القيد وتوزيع المبالغ بسهولة
                </p>
              </div>
            </div>
            <div className="w-full sm:w-auto">{tabActions}</div>
          </div>
        </div>

        <div className="p-4 sm:p-6">
          {/* حقول الرأس (تم تعديل الهيكل لتكون حقلين في كل سطر) */}
          <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2">
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
            <Field label="التاريخ" icon={<CalendarDays className="h-3.5 w-3.5" />}>
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className={inputCls}
              />
            </Field>
            <Field label="البيان العام للقيد" icon={<FileText className="h-3.5 w-3.5" />}>
              <input
                placeholder="وصف عام للعملية..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className={inputCls}
              />
            </Field>
          </div>

          {/* جدول أسطر القيد */}
          <div className="overflow-hidden rounded-xl border-2 border-slate-900 bg-slate-200/40 shadow-[3px_3px_0px_0px_rgba(0,0,0,1)]">
            <div className="overflow-x-auto">
              <table className="w-full min-w-[700px] text-right">
                <thead className="border-b-2 border-slate-900 bg-slate-300 text-[13px] font-black text-slate-900">
                  <tr>
                    <th className="w-12 px-3 py-3 text-center sm:px-4">#</th>
                    <th className="w-[30%] px-2 py-3 sm:px-3">الحساب المالي</th>
                    <th className="w-[35%] px-2 py-3 sm:px-3">البيان التفصيلي</th>
                    <th className="w-[20%] px-2 py-3 sm:px-3">المبلغ</th>
                    <th className="w-12 px-3 py-3 text-center sm:px-4"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-900">
                  {/* الطرف المدين */}
                  <tr className="border-b border-slate-900 bg-emerald-200/70">
                    <td colSpan={5} className="px-4 py-2 text-xs font-black text-emerald-950">
                      الطرف المدين (من حـ/)
                    </td>
                  </tr>
                  {debitLinesArr.map((l, i) => renderEntryRow(l, i, debitLinesArr.length))}

                  {/* الطرف الدائن */}
                  <tr className="border-b border-slate-900 bg-rose-200/70">
                    <td colSpan={5} className="px-4 py-2 text-xs font-black text-rose-950">
                      الطرف الدائن (إلى حـ/)
                    </td>
                  </tr>
                  {creditLinesArr.map((l, i) => renderEntryRow(l, i, creditLinesArr.length))}
                </tbody>
              </table>
            </div>

            {/* أزرار الإضافة السريعة (زرين في سطر واحد) */}
            <div className="border-t-2 border-slate-900 bg-slate-300/80 p-3">
              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={() => addLine("debit")}
                  className="flex items-center justify-center gap-1.5 rounded-lg border border-slate-900 bg-emerald-200 px-3 py-2 text-xs font-black text-emerald-950 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] transition-all hover:bg-emerald-300 active:translate-y-0.5"
                >
                  <Plus className="h-4 w-4" /> إضافة طرف مدين
                </button>
                <button
                  onClick={() => addLine("credit")}
                  className="flex items-center justify-center gap-1.5 rounded-lg border border-slate-900 bg-rose-200 px-3 py-2 text-xs font-black text-rose-950 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] transition-all hover:bg-rose-300 active:translate-y-0.5"
                >
                  <Plus className="h-4 w-4" /> إضافة طرف دائن
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* شريط التوازن والحفظ (أسفل البطاقة) */}
        <div className="border-t-2 border-slate-900 bg-slate-200/90 p-4 sm:px-6 sm:py-4">
          <div
            className={`flex flex-col gap-4 rounded-xl border-2 border-slate-900 p-3.5 shadow-[3px_3px_0px_0px_rgba(0,0,0,1)]
              ${isBalanced ? "bg-emerald-100/80" : "bg-amber-100/80"}`}
          >
            <div className="flex-1">
              <div className="flex flex-wrap items-center gap-4">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-black text-slate-800">الإجمالي المدين:</span>
                  <span className="font-mono text-base font-black text-emerald-900">
                    {totalDebit.toLocaleString("en-US")}
                  </span>
                </div>
                <div className="hidden h-4 w-0.5 bg-slate-900 sm:block"></div>
                <div className="flex items-center gap-2">
                  <span className="text-sm font-black text-slate-800">الإجمالي الدائن:</span>
                  <span className="font-mono text-base font-black text-rose-900">
                    {totalCredit.toLocaleString("en-US")}
                  </span>
                </div>
                <div className="ml-auto">
                  <span
                    className={`flex items-center gap-1.5 rounded-lg border border-slate-900 px-3 py-1 text-xs font-black shadow-[1px_1px_0px_0px_rgba(0,0,0,1)]
                    ${isBalanced ? "bg-emerald-300 text-emerald-950" : "bg-amber-300 text-amber-950"}`}
                  >
                    {isBalanced ? (
                      <>
                        <CheckCircle2 className="h-4 w-4" /> القيد متوازن
                      </>
                    ) : (
                      <>
                        <AlertTriangle className="h-4 w-4" />
                        {totalDebit > 0 || totalCredit > 0
                          ? `الفرق: ${diff.toLocaleString("en-US")}`
                          : "بانتظار إدخال المبالغ"}
                      </>
                    )}
                  </span>
                </div>
              </div>
              {/* شريط التقدم للاتزان */}
              <div className="mt-3 h-2 w-full overflow-hidden rounded-full border border-slate-900 bg-slate-300 shadow-[1px_1px_0px_0px_rgba(0,0,0,1)]">
                <div
                  className={`h-full transition-all duration-500 ${
                    isBalanced ? "bg-emerald-600" : "bg-amber-500"
                  }`}
                  style={{ width: `${Math.round(balanceRatio * 100)}%` }}
                />
              </div>
            </div>

            {/* الأزرار هنا مقسمة إلى 2 في كل سطر في شاشات الجوال ومرتبة أفصل */}
            <div className="grid grid-cols-2 gap-2 sm:flex sm:w-auto">
              {editingId && (
                <button
                  onClick={resetForm}
                  className="rounded-lg border border-slate-900 bg-slate-300 px-4 py-2 text-sm font-black text-slate-900 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] transition-all hover:bg-slate-400 active:translate-y-0.5"
                >
                  إلغاء
                </button>
              )}
              <button
                onClick={handleSave}
                disabled={!isBalanced}
                className={`flex items-center justify-center gap-2 rounded-lg border border-slate-900 px-6 py-2 text-sm font-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] transition-all ${
                  editingId ? "" : "col-span-2 sm:col-span-1"
                }
                  ${
                    isBalanced
                      ? "bg-sky-400 text-slate-950 hover:bg-sky-500 active:translate-y-0.5"
                      : "cursor-not-allowed bg-slate-300 text-slate-500 shadow-none opacity-60"
                  }`}
              >
                <Save className="h-4 w-4" />
                {editingId ? "حفظ التعديلات" : "حفظ القيد"}
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* ══ سجل القيود ══ */}
      <section className="overflow-hidden rounded-2xl border-2 border-slate-900 bg-slate-100 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b-2 border-slate-900 bg-slate-300/80 px-4 py-3 sm:px-6">
          <div className="flex items-center gap-2">
            <h3 className="text-base font-black text-slate-900">سجل القيود المسجلة</h3>
            <span className="rounded-lg border border-slate-900 bg-sky-200 px-2.5 py-0.5 text-xs font-black text-sky-950 shadow-[1px_1px_0px_0px_rgba(0,0,0,1)]">
              {filteredJournal.length} قيد
            </span>
          </div>
          {Object.values(journalFilters).some(Boolean) && (
            <button
              onClick={clearJournalFilters}
              className="rounded-lg border border-slate-900 bg-slate-200 px-3 py-1.5 text-xs font-black text-slate-900 shadow-[1px_1px_0px_0px_rgba(0,0,0,1)] transition-colors hover:bg-slate-300 active:translate-y-0.5"
            >
              مسح التصفية
            </button>
          )}
        </div>

        {journal.length === 0 ? (
          <div className="flex flex-col items-center justify-center gap-3 py-16 text-center">
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl border-2 border-slate-900 bg-slate-200 text-slate-700 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
              <Inbox className="h-8 w-8" />
            </div>
            <p className="text-base font-black text-slate-800">لا توجد قيود يومية بعد</p>
            <p className="text-sm font-bold text-slate-600">ابدأ بإضافة قيد جديد من النموذج أعلاه</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[900px] text-right text-sm">
              <thead className="bg-slate-200/90">
                {/* عناوين الأعمدة */}
                <tr>
                  {JOURNAL_COLS.map((c) => (
                    <th
                      key={c.key}
                      className="whitespace-nowrap border-b-2 border-slate-900 px-4 py-3 font-black text-slate-900"
                    >
                      {c.label}
                    </th>
                  ))}
                  <th className="whitespace-nowrap border-b-2 border-slate-900 px-4 py-3 text-center font-black text-slate-900">
                    الإجراءات
                  </th>
                </tr>
                {/* حقول التصفية */}
                <tr className="border-b border-slate-900 bg-slate-300/50">
                  {JOURNAL_COLS.map((c) => (
                    <th key={c.key} className="px-2 py-2">
                      <input
                        value={journalFilters[c.key] || ""}
                        onChange={(e) => setJournalFilter(c.key, e.target.value)}
                        placeholder="تصفية..."
                        className="w-full rounded-md border border-slate-900 bg-slate-50 px-2 py-1.5 text-xs font-bold text-slate-900 outline-none shadow-[1px_1px_0px_0px_rgba(0,0,0,1)] placeholder:text-slate-500 focus:bg-slate-100"
                      />
                    </th>
                  ))}
                  <th className="px-2 py-2" />
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-900">
                {filteredJournal.length === 0 ? (
                  <tr>
                    <td colSpan={JOURNAL_COLS.length + 1} className="py-8 text-center font-bold text-slate-600">
                      لا توجد نتائج تطابق شروط التصفية
                    </td>
                  </tr>
                ) : (
                  filteredJournal.map((j) => (
                    <tr
                      key={j.id}
                      className="group bg-slate-100/90 transition-colors hover:bg-sky-100/60"
                    >
                      <td className="px-4 py-3 font-mono font-bold text-slate-900">{j.formNo || "—"}</td>
                      <td className="px-4 py-3 font-bold text-slate-900">{j.settlement || "—"}</td>
                      <td className="whitespace-nowrap px-4 py-3 font-mono font-bold text-slate-800">
                        {j.date || "—"}
                      </td>
                      <td className="max-w-[200px] truncate px-4 py-3 font-bold text-slate-900" title={j.description}>
                        {j.description || "—"}
                      </td>
                      <td className="px-4 py-3">
                        <span className="inline-block max-w-[160px] truncate rounded-md border border-slate-900 bg-emerald-200 px-2 py-1 text-xs font-black text-emerald-950 shadow-[1px_1px_0px_0px_rgba(0,0,0,1)]" title={j.debitAccount}>
                          {j.debitAccount || "—"}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <span className="inline-block max-w-[160px] truncate rounded-md border border-slate-900 bg-rose-200 px-2 py-1 text-xs font-black text-rose-950 shadow-[1px_1px_0px_0px_rgba(0,0,0,1)]" title={j.creditAccount}>
                          {j.creditAccount || "—"}
                        </span>
                      </td>
                      <td className="whitespace-nowrap px-4 py-3 font-mono font-black text-emerald-900">
                        {j.debit ? j.debit.toLocaleString("en-US") : "—"}
                      </td>
                      <td className="whitespace-nowrap px-4 py-3 font-mono font-black text-rose-900">
                        {j.credit ? j.credit.toLocaleString("en-US") : "—"}
                      </td>
                      <td className="px-4 py-3">
                        {/* أزرار التعديل والحذف مقسمة بطريقة متناسقة (2 أزرار) */}
                        <div className="grid grid-cols-2 gap-1.5">
                          <button
                            onClick={() => startEdit(j)}
                            className="flex items-center justify-center rounded-lg border border-slate-900 bg-sky-200 p-1.5 text-sky-950 shadow-[1px_1px_0px_0px_rgba(0,0,0,1)] transition-all hover:bg-sky-300 active:translate-y-0.5"
                            title="تعديل"
                          >
                            <Edit className="h-3.5 w-3.5" />
                          </button>
                          <button
                            onClick={() => deleteJournal(j.id)}
                            className="flex items-center justify-center rounded-lg border border-slate-900 bg-rose-200 p-1.5 text-rose-950 shadow-[1px_1px_0px_0px_rgba(0,0,0,1)] transition-all hover:bg-rose-300 active:translate-y-0.5"
                            title="حذف"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
              <tfoot className="border-t-2 border-slate-900 bg-slate-300">
                <tr>
                  <td colSpan={6} className="px-4 py-3 text-left font-black text-slate-900">
                    الإجمالي العام:
                  </td>
                  <td className="whitespace-nowrap px-4 py-3 font-mono text-base font-black text-emerald-950">
                    {grandDebit.toLocaleString("en-US")}
                  </td>
                  <td className="whitespace-nowrap px-4 py-3 font-mono text-base font-black text-rose-950">
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
