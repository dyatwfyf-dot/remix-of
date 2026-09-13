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
      <span className="mb-1 flex items-center gap-1.5 text-xs font-black text-slate-200 sm:mb-1.5 sm:text-xs">
        {icon}
        {label}
      </span>
      {children}
    </label>
  );
}

const inputCls =
  "w-full min-w-0 rounded-xl border-2 border-slate-600 bg-slate-800 text-slate-100 px-3 py-2.5 text-[13px] font-bold outline-none transition-all placeholder:text-slate-400 focus:border-amber-400 focus:bg-slate-750 focus:ring-4 focus:ring-amber-400/20 sm:px-3 sm:py-3 sm:text-sm shadow-sm";

const journalClampCls =
  "block max-w-[90px] overflow-hidden text-ellipsis whitespace-nowrap leading-snug sm:max-w-[180px]";

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
    return ALL_EXCEL_ACCOUNTS.filter((a) =>
      a.toLowerCase().includes(q.toLowerCase()),
    );
  }, [query]);

  useEffect(() => {
    if (!open) return;

    function handler(e: MouseEvent) {
      if (
        wrapRef.current &&
        !wrapRef.current.contains(e.target as Node)
      ) {
        setOpen(false);
      }
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
    <div
      ref={wrapRef}
      className="relative w-full min-w-[180px] sm:min-w-[210px]"
    >
      <button
        type="button"
        onClick={handleOpen}
        className={`flex min-h-[40px] w-full items-center justify-between gap-1.5 rounded-xl border-2 px-2.5 py-2 text-right text-sm font-black transition-all active:scale-[0.98] shadow-sm sm:min-h-[42px] sm:gap-2 sm:px-3 sm:text-[13px]
          ${
            value
              ? isDebit
                ? "bg-emerald-950/70 text-emerald-200 border-emerald-700 shadow-emerald-950/40"
                : "bg-rose-950/70 text-rose-200 border-rose-700 shadow-rose-950/40"
              : "border-dashed border-slate-600 bg-slate-800 text-slate-400 hover:border-slate-500 hover:bg-slate-750"
          }`}
      >
        <span className="min-w-0 flex-1 truncate text-right leading-snug">
          {value ||
            (isDebit
              ? "اختر الحساب المدين…"
              : "اختر الحساب الدائن…")}
        </span>

        <ChevronDown className="h-4 w-4 shrink-0 text-slate-400" />
      </button>

      {open && (
        <>
          <div className="fixed inset-0 z-[998] bg-slate-950/70 backdrop-blur-sm md:hidden" />

          <div
            className="fixed inset-x-0 bottom-0 z-[999] max-h-[72vh] overflow-hidden rounded-t-3xl border-2 border-slate-700 bg-slate-900 text-slate-100 shadow-2xl
              md:absolute md:inset-x-auto md:bottom-auto md:right-0 md:left-0 md:top-full md:mt-1 md:max-h-[60vh] md:w-[360px] md:rounded-2xl"
            dir="rtl"
          >
            <div className="mx-auto mt-2 h-1.5 w-12 rounded-full bg-slate-600 md:hidden" />

            <div
              className={`mt-2 flex items-center gap-1.5 border-b-2 border-slate-700 px-3 py-3 md:mt-0 md:gap-2
              ${
                isDebit
                  ? "bg-gradient-to-r from-emerald-950 via-teal-950 to-emerald-900"
                  : "bg-gradient-to-r from-rose-950 via-pink-950 to-rose-900"
              }`}
            >
              <Search className="h-4 w-4 shrink-0 text-amber-400" />

              <input
                ref={inputRef}
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder={
                  isDebit
                    ? "ابحث في الحسابات المدينة…"
                    : "ابحث في الحسابات الدائنة…"
                }
                className="min-w-0 flex-1 bg-transparent text-right text-[13px] font-bold text-slate-100 outline-none placeholder:text-slate-400 sm:text-sm"
                onKeyDown={(e) =>
                  e.key === "Escape" && setOpen(false)
                }
              />

              <button
                onClick={() => setOpen(false)}
                className="grid h-8 w-8 shrink-0 place-items-center rounded-full text-slate-400 transition-colors hover:bg-slate-700 hover:text-white"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="border-b border-slate-700 bg-slate-800 px-3 py-2 text-right text-xs font-black text-amber-400">
              {filtered.length} حساب متاح
            </div>

            <div
              className="overflow-y-auto overscroll-contain"
              style={{ maxHeight: "56vh" }}
            >
              {filtered.length === 0 ? (
                <p className="p-8 text-center text-sm font-bold text-slate-400">
                  لا توجد نتائج مطابقة
                </p>
              ) : (
                filtered.map((acc, i) => (
                  <button
                    key={acc}
                    type="button"
                    onClick={() => pick(acc)}
                    className={`w-full break-words border-b border-slate-800 px-3 py-3 text-right text-[13px] font-bold leading-relaxed transition-all last:border-0 sm:px-4 sm:py-3.5 sm:text-sm
                      ${
                        value === acc
                          ? isDebit
                            ? "border-l-4 border-l-emerald-500 bg-emerald-950 font-black text-emerald-200"
                            : "border-l-4 border-l-rose-500 bg-rose-950 font-black text-rose-200"
                          : "text-slate-300 hover:bg-slate-800 active:bg-slate-700"
                      }`}
                  >
                    <span
                      className={`ml-2 inline-block w-6 text-center text-xs font-black ${
                        isDebit
                          ? "text-emerald-400"
                          : "text-rose-400"
                      }`}
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

export default function JournalTab() {
  const {
    journal,
    addJournal,
    updateJournal,
    deleteJournal,
    clearJournal,
  } = useStore();

  const [editingId, setEditingId] = useState<string | null>(null);
  const [formNo, setFormNo] = useState("");
  const [settlement, setSettlement] = useState("");
  const [date, setDate] = useState("");
  const [description, setDescription] = useState("");

  const [lines, setLines] = useState<EntryLine[]>([
    {
      id: "d1",
      account: "",
      amount: 0,
      type: "debit",
      description: "",
    },
    {
      id: "c1",
      account: "",
      amount: 0,
      type: "credit",
      description: "",
    },
  ]);

  const genId = () => Math.random().toString(36).slice(2, 8);

  const addLine = (type: "debit" | "credit") =>
    setLines((p) => [
      ...p,
      {
        id: genId(),
        account: "",
        amount: 0,
        type,
        description: "",
      },
    ]);

  const removeLine = (id: string) =>
    setLines((p) => p.filter((l) => l.id !== id));

  const updateLine = (
    id: string,
    field: keyof EntryLine,
    value: any,
  ) =>
    setLines((p) =>
      p.map((l) =>
        l.id === id ? { ...l, [field]: value } : l,
      ),
    );

  const debitLinesArr = lines.filter((l) => l.type === "debit");
  const creditLinesArr = lines.filter((l) => l.type === "credit");

  const totalDebit = debitLinesArr.reduce(
    (s, l) => s + (Number(l.amount) || 0),
    0,
  );

  const totalCredit = creditLinesArr.reduce(
    (s, l) => s + (Number(l.amount) || 0),
    0,
  );

  const isBalanced =
    totalDebit > 0 &&
    totalCredit > 0 &&
    totalDebit === totalCredit;

  const diff = Math.abs(totalDebit - totalCredit);

  const balanceRatio =
    Math.max(totalDebit, totalCredit) > 0
      ? Math.min(totalDebit, totalCredit) /
        Math.max(totalDebit, totalCredit)
      : 0;

  const {
    rows: filteredJournal,
    filters: journalFilters,
    setFilter: setJournalFilter,
    clearFilters: clearJournalFilters,
  } = useTableControls(
    journal,
    JOURNAL_COLS.map((c) => c.key),
  );

  const grandDebit = filteredJournal.reduce(
    (s, j) => s + (Number(j.debit) || 0),
    0,
  );

  const grandCredit = filteredJournal.reduce(
    (s, j) => s + (Number(j.credit) || 0),
    0,
  );

  const resetForm = () => {
    setFormNo("");
    setSettlement("");
    setDate("");
    setDescription("");

    setLines([
      {
        id: "d1",
        account: "",
        amount: 0,
        type: "debit",
        description: "",
      },
      {
        id: "c1",
        account: "",
        amount: 0,
        type: "credit",
        description: "",
      },
    ]);

    setEditingId(null);
  };

  const handleSave = () => {
    if (
      !description &&
      lines.every((l) => !l.description)
    ) {
      toast.error(
        "يرجى تعبئة حقل البيان العام أو بيان الأسطر",
      );
      return;
    }

    if (!isBalanced) {
      toast.error(
        "القيد غير متوازن — يجب أن يتساوى إجمالي المدين والدائن",
      );
      return;
    }

    const debitLines = lines.filter(
      (l) => l.type === "debit",
    );

    const creditLines = lines.filter(
      (l) => l.type === "credit",
    );

    if (editingId) {
      deleteJournal(editingId);
    }

    debitLines.forEach((dl) => {
      creditLines.forEach((cl) => {
        const ratio =
          (Number(cl.amount) || 0) / totalCredit;

        const combinedDescription = [
          description,
          dl.description,
          cl.description,
        ]
          .filter(
            (desc) =>
              desc && desc.trim() !== "",
          )
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
          credit: Math.round(
            (Number(dl.amount) || 0) * ratio,
          ),
        };

        addJournal(payload);
      });
    });

    toast.success(
      editingId
        ? "تم تحديث القيد المركب بنجاح"
        : "تم حفظ القيد المركب بنجاح",
    );

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

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  const renderEntryRow = (
    l: EntryLine,
    idx: number,
    total: number,
  ) => {
    const isDebit = l.type === "debit";

    return (
      <tr
        key={l.id}
        className={`border-b border-slate-700 transition-colors ${
          isDebit
            ? "bg-emerald-950/35 hover:bg-emerald-950/60"
            : "bg-rose-950/35 hover:bg-rose-950/60"
        }`}
      >
        <td className="!whitespace-nowrap text-center !px-1 !py-2 sm:!px-2 sm:!py-2.5 !text-sm sm:!text-base">
          <span
            className={`inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1 text-xs font-black text-white shadow-sm border ${
              isDebit
                ? "border-emerald-600 bg-emerald-700 shadow-emerald-950/40"
                : "border-rose-600 bg-rose-700 shadow-rose-950/40"
            }`}
          >
            {idx + 1} · {isDebit ? "مدين" : "دائن"}
          </span>
        </td>

        <td className="min-w-[180px] sm:min-w-[210px] !px-1 !py-1.5 sm:!px-2 sm:!py-2 !text-sm sm:!text-base whitespace-nowrap">
          <AccountDropdownCell
            value={l.account}
            onChange={(v) =>
              updateLine(l.id, "account", v)
            }
            type={l.type}
          />
        </td>

        <td className="min-w-[150px] sm:min-w-[180px] !px-1 !py-1.5 sm:!px-2 sm:!py-2 !text-sm sm:!text-base whitespace-nowrap">
          <input
            type="text"
            value={l.description || ""}
            onChange={(e) =>
              updateLine(
                l.id,
                "description",
                e.target.value,
              )
            }
            placeholder="بيان السطر (اختياري)"
            className={`min-w-0 w-full rounded-xl border-2 border-slate-600 bg-slate-800 text-slate-100 px-3 py-2 text-xs font-bold outline-none transition-all sm:px-3 sm:py-2.5 sm:text-xs shadow-sm placeholder:text-slate-500 ${
              isDebit
                ? "focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20"
                : "focus:border-rose-500 focus:ring-2 focus:ring-rose-500/20"
            }`}
          />
        </td>

        <td className="w-[110px] sm:w-[130px] !px-1 !py-1.5 sm:!px-2 sm:!py-2 !text-sm sm:!text-base whitespace-nowrap">
          <input
            type="number"
            inputMode="decimal"
            dir="ltr"
            value={l.amount || ""}
            onChange={(e) =>
              updateLine(
                l.id,
                "amount",
                e.target.value,
              )
            }
            placeholder="0.00"
            className={`min-w-0 w-full rounded-xl border-2 border-slate-600 bg-slate-800 px-2 py-2 text-center font-mono text-sm font-black outline-none transition-all sm:px-2 sm:py-2.5 sm:text-base shadow-sm ${
              isDebit
                ? "text-emerald-300 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20"
                : "text-rose-300 focus:border-rose-500 focus:ring-2 focus:ring-rose-500/20"
            }`}
          />
        </td>

        <td className="w-[52px] text-center !px-1 !py-1.5 sm:!px-2 sm:!py-2 !text-sm sm:!text-base whitespace-nowrap">
          {total > 1 && (
            <button
              onClick={() => removeLine(l.id)}
              className="grid h-9 w-9 place-items-center rounded-xl bg-slate-800 text-slate-400 border border-slate-600 transition-all hover:bg-rose-950 hover:text-rose-300 hover:border-rose-700 shadow-sm"
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
        <div className="flex w-full items-center rounded-lg hover:bg-slate-800">
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
      className="w-full !grid !grid-cols-2 sm:!gap-2 [&>button]:min-w-0 [&>button]:justify-center [&>button]:px-1 [&>button]:py-1 sm:[&>button]:px-2 sm:[&>button]:py-1 [&>button]:text-xs sm:[&>button]:text-xm"
    />
  );

  return (
    <div
      className="w-full space-y-4 overflow-x-hidden p-1.5 sm:p-3 bg-slate-950 text-slate-100 min-h-screen"
      dir="rtl"
    >
      <section className="overflow-hidden rounded-2xl border-2 border-slate-700 bg-slate-900 shadow-xl shadow-black/30">
        <div className="relative bg-gradient-to-r from-slate-950 via-slate-900 to-teal-950 border-b-2 border-slate-700 px-3 py-3 sm:px-5 sm:py-4">
          <div className="absolute inset-x-0 top-0 h-[3px] bg-gradient-to-r from-amber-600 via-yellow-400 to-amber-600 opacity-90" />

          <div className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-2 sm:gap-3">
            <div className="flex min-w-0 items-center gap-3">
              <span className="grid h-11 w-11 shrink-0 place-items-center rounded-xl border-2 border-amber-600/70 bg-gradient-to-br from-amber-700 to-slate-800 text-amber-300 shadow-md shadow-black/30">
                <BookOpenText className="h-6 w-6" />
              </span>

              <div className="min-w-0">
                <h3 className="truncate text-base font-black text-white sm:text-lg">
                  {editingId
                    ? "تعديل القيد المركب"
                    : "قيد يومية مركب"}
                </h3>

                <p className="truncate text-xs font-bold text-slate-400">
                  إدخال أطراف متعددة مع توزيع تلقائي للمبالغ
                </p>
              </div>
            </div>

            <div className="apk-only-actions shrink-0 [&>label]:border-2 [&>label]:border-emerald-600 [&>label]:bg-gradient-to-r [&>label]:from-emerald-700 [&>label]:to-teal-700 [&>label]:text-white [&>label]:hover:from-emerald-600 [&>label]:hover:to-teal-600 [&>label]:px-2.5 [&>label]:py-1.5 [&>label]:text-xs [&>label]:font-black sm:[&>label]:px-3 sm:[&>label]:py-1.5 sm:[&>label]:text-xs [&>label]:shadow-md">
              <ImportButton kind="journal" />
            </div>
          </div>

          <div className="mt-3 border-t border-slate-700 pt-2.5 sm:mt-3 sm:pt-3">
            {tabActions}
          </div>
        </div>

        <div className="space-y-4 p-3 sm:p-5 bg-gradient-to-b from-slate-900 via-slate-900 to-slate-950">
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-2 sm:gap-3">
            <Field
              label="رقم الاستمارة"
              icon={
                <Hash className="h-3.5 w-3.5 text-amber-400" />
              }
            >
              <input
                placeholder="مثال: 145"
                value={formNo}
                onChange={(e) => setFormNo(e.target.value)}
                className={inputCls}
              />
            </Field>

            <Field
              label="كشف التسوية"
              icon={
                <FileText className="h-3.5 w-3.5 text-amber-400" />
              }
            >
              <input
                placeholder="مثال: كشف 3"
                value={settlement}
                onChange={(e) =>
                  setSettlement(e.target.value)
                }
                className={inputCls}
              />
            </Field>

            <Field
              label="التاريخ"
              icon={
                <CalendarDays className="h-3.5 w-3.5 text-amber-400" />
              }
            >
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className={inputCls}
              />
            </Field>

            <Field
              label="البيان العام للقيد"
              icon={
                <FileText className="h-3.5 w-3.5 text-amber-400" />
              }
              className="sm:col-span-1"
            >
              <input
                placeholder="اختياري في حال تعبئة بيانات الأسطر"
                value={description}
                onChange={(e) =>
                  setDescription(e.target.value)
                }
                className={inputCls}
              />
            </Field>
          </div>

          <div className="overflow-hidden rounded-2xl border-2 border-slate-700 bg-slate-900 shadow-md">
            <div className="overflow-auto max-h-[72vh]">
              <table className="table-auto border-collapse text-center text-lg sm:text-base font-black w-full">
                <thead className="bg-gradient-to-r from-slate-950 via-slate-800 to-teal-950 text-amber-300 border-b-2 border-slate-700">
                  <tr>
                    <th className="!whitespace-nowrap text-center font-black !px-2 !py-2.5 sm:!px-3 sm:!py-3 !text-xs sm:!text-sm">
                      #
                    </th>

                    <th className="!whitespace-nowrap text-right font-black !px-2 !py-2.5 sm:!px-3 sm:!py-3 !text-xs sm:!text-sm">
                      الحساب
                    </th>

                    <th className="!whitespace-nowrap text-right font-black !px-2 !py-2.5 sm:!px-3 sm:!py-3 !text-xs sm:!text-sm">
                      بيان السطر
                    </th>

                    <th className="!whitespace-nowrap text-center font-black !px-2 !py-2.5 sm:!px-3 sm:!py-3 !text-xs sm:!text-sm">
                      المبلغ
                    </th>

                    <th className="!whitespace-nowrap text-center font-black !px-2 !py-2.5 sm:!px-3 sm:!py-3 !text-xs sm:!text-sm" />
                  </tr>
                </thead>

                <tbody>
                  {debitLinesArr.map((l, i) =>
                    renderEntryRow(
                      l,
                      i,
                      debitLinesArr.length,
                    ),
                  )}

                  {creditLinesArr.map((l, i) =>
                    renderEntryRow(
                      l,
                      i,
                      creditLinesArr.length,
                    ),
                  )}
                </tbody>

                <tfoot>
                  <tr className="border-t-2 border-slate-700 bg-slate-950">
                    <td
                      colSpan={5}
                      className="!px-2 !py-2.5 sm:!px-3 sm:!py-3 !text-sm sm:!text-base whitespace-nowrap"
                    >
                      <div className="grid grid-cols-2 sm:flex items-center gap-2">
                        <button
                          onClick={() => addLine("debit")}
                          className="min-w-0 flex min-h-[36px] items-center justify-center gap-1.5 rounded-xl border-2 border-emerald-700 bg-emerald-950/70 px-2 sm:px-3 text-xs font-black text-emerald-300 transition-all hover:bg-emerald-900 active:scale-95 shadow-sm"
                        >
                          <Plus className="h-4 w-4 text-emerald-400" />
                          إضافة حساب مدين
                        </button>

                        <button
                          onClick={() => addLine("credit")}
                          className="min-w-0 flex min-h-[36px] items-center justify-center gap-1.5 rounded-xl border-2 border-rose-700 bg-rose-950/70 px-2 sm:px-3 text-xs font-black text-rose-300 transition-all hover:bg-rose-900 active:scale-95 shadow-sm"
                        >
                          <Plus className="h-4 w-4 text-rose-400" />
                          إضافة حساب دائن
                        </button>

                        <span className="col-span-2 flex items-center justify-center gap-2 font-mono text-xs sm:mr-auto sm:col-span-1 sm:justify-start sm:gap-2.5 sm:text-xs font-black">
                          <span className="rounded-xl border border-emerald-800 bg-emerald-950/70 px-2.5 py-1 text-emerald-300 shadow-sm">
                            مدين{" "}
                            {totalDebit.toLocaleString("en-US")}
                          </span>

                          <span className="rounded-xl border border-rose-800 bg-rose-950/70 px-2.5 py-1 text-rose-300 shadow-sm">
                            دائن{" "}
                            {totalCredit.toLocaleString("en-US")}
                          </span>
                        </span>
                      </div>
                    </td>
                  </tr>
                </tfoot>
              </table>
            </div>
          </div>

          <div
            className={`sticky bottom-2 z-30 rounded-2xl border-2 p-3 sm:p-4 shadow-lg backdrop-blur-md transition-all ${
              isBalanced
                ? "border-emerald-700 bg-emerald-950/80 shadow-emerald-950/30"
                : "border-amber-700 bg-slate-900/95 shadow-black/30"
            }`}
          >
            <div className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-2 sm:gap-3">
              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-x-3 gap-y-1 font-mono text-sm font-black">
                  <span className="text-emerald-300">
                    مدين{" "}
                    {totalDebit.toLocaleString("en-US")}
                  </span>

                  <span className="text-slate-600">|</span>

                  <span className="text-rose-300">
                    دائن{" "}
                    {totalCredit.toLocaleString("en-US")}
                  </span>
                </div>

                <div className="mt-2 h-2 w-full overflow-hidden rounded-full bg-slate-700 border border-slate-600">
                  <div
                    className={`h-full rounded-full transition-all duration-300 ${
                      isBalanced
                        ? "bg-gradient-to-r from-emerald-500 to-teal-400"
                        : "bg-gradient-to-r from-amber-500 to-yellow-400"
                    }`}
                    style={{
                      width: `${Math.round(
                        balanceRatio * 100,
                      )}%`,
                    }}
                  />
                </div>
              </div>

              <span
                className={`flex shrink-0 items-center gap-1.5 rounded-xl px-3 py-1.5 text-xs font-black border shadow-sm ${
                  isBalanced
                    ? "border-emerald-700 bg-emerald-950 text-emerald-300"
                    : "border-amber-700 bg-amber-950/60 text-amber-300"
                }`}
              >
                {isBalanced ? (
                  <>
                    <CheckCircle2 className="h-4 w-4" />
                    متوازن
                  </>
                ) : totalDebit > 0 || totalCredit > 0 ? (
                  <>
                    <AlertTriangle className="h-4 w-4" />
                    فرق {diff.toLocaleString("en-US")}
                  </>
                ) : (
                  <>
                    <Scale className="h-4 w-4" />
                    أدخل المبالغ
                  </>
                )}
              </span>
            </div>

            <div className="mt-3 grid grid-cols-2 sm:mt-3 sm:flex gap-2">
              <button
                onClick={handleSave}
                title={
                  isBalanced
                    ? ""
                    : "يجب تساوي إجمالي المدين والدائن"
                }
                className={`min-w-0 flex min-h-[42px] flex-1 items-center justify-center gap-2 rounded-xl border-2 px-3 sm:min-h-[48px] sm:gap-2 sm:px-5 text-xs sm:text-sm font-black shadow-md transition-all active:scale-[0.98] ${
                  isBalanced
                    ? "border-indigo-600 bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-700 text-white hover:brightness-110"
                    : "border-slate-700 bg-slate-800 text-slate-500 cursor-not-allowed"
                }`}
              >
                <Save className="h-4 w-4" />

                {editingId
                  ? "تحديث القيد"
                  : "حفظ القيد المركب"}
              </button>

              {editingId && (
                <button
                  onClick={resetForm}
                  className="min-h-[42px] rounded-xl border-2 border-slate-600 bg-slate-800 px-3 text-xs sm:min-h-[48px] sm:px-5 sm:text-sm font-black text-slate-200 transition-colors hover:bg-slate-700 shadow-sm"
                >
                  إلغاء
                </button>
              )}
            </div>
          </div>
        </div>
      </section>

      <section className="overflow-hidden rounded-2xl border-2 border-slate-700 bg-slate-900 shadow-xl shadow-black/30">
        <div className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-2 sm:gap-3 bg-gradient-to-r from-slate-950 via-slate-900 to-teal-950 border-b-2 border-slate-700 px-3 py-3 sm:px-5 sm:py-3.5">
          <h3 className="truncate text-base font-black text-amber-300">
            سجل القيود اليومية
          </h3>

          <div className="flex min-w-0 items-center justify-end gap-2">
            {Object.values(journalFilters).some(Boolean) && (
              <button
                onClick={clearJournalFilters}
                className="min-w-0 rounded-full border border-amber-700 bg-amber-950/60 px-3 py-1 text-[11px] font-black text-amber-300 transition-all hover:bg-amber-900 sm:text-xs"
              >
                مسح التصفية
              </button>
            )}

            <span className="shrink-0 rounded-full border border-slate-600 bg-slate-800 px-3 py-1 text-xs font-black text-blue-300 shadow-sm">
              {filteredJournal.length} قيد
            </span>
          </div>
        </div>

        {journal.length === 0 ? (
          <div className="flex flex-col items-center gap-3 p-12 text-center bg-slate-950">
            <span className="grid h-16 w-16 place-items-center rounded-2xl border-2 border-slate-700 bg-slate-800 text-slate-500 shadow-inner">
              <Inbox className="h-8 w-8" />
            </span>

            <p className="text-base font-black text-slate-200">
              لا توجد قيود يومية بعد
            </p>

            <p className="text-xs font-bold text-slate-500">
              ابدأ بإضافة قيد جديد أعلاه أو استورد ملف Excel
            </p>

            <div className="[&>label]:border-2 [&>label]:border-emerald-700 [&>label]:bg-emerald-700 [&>label]:text-white [&>label]:hover:bg-emerald-600 [&>label]:font-black">
              <ImportButton kind="journal" />
            </div>
          </div>
        ) : (
          <>
            <div className="overflow-auto max-h-[72vh] bg-slate-950">
              <table className="w-full min-w-auto table-auto border-collapse text-center text-sm sm:text-base font-bold">
                <thead className="sticky top-0 z-20 bg-slate-900 text-amber-300 shadow-sm border-b-2 border-slate-700">
                  <tr>
                    {JOURNAL_COLS.map((c) => (
                      <th
                        key={c.key}
                        className="min-w-0 max-w-[120px] whitespace-nowrap border-b-2 border-slate-700 text-center font-black leading-tight !px-2 !py-2.5 sm:!px-3 sm:!py-3 !text-xs sm:!text-sm"
                      >
                        {c.label}
                      </th>
                    ))}

                    <th className="min-w-0 max-w-[120px] whitespace-nowrap border-b-2 border-slate-700 text-center font-black leading-tight !px-2 !py-2.5 sm:!px-3 sm:!py-3 !text-xs sm:!text-sm">
                      الإجراءات
                    </th>
                  </tr>

                  <tr className="bg-slate-800 text-slate-300 border-b-2 border-slate-700">
                    {JOURNAL_COLS.map((c) => (
                      <th
                        key={c.key}
                        className="border-b border-slate-700 !px-1.5 !py-2"
                      >
                        <input
                          value={
                            journalFilters[c.key] || ""
                          }
                          onChange={(e) =>
                            setJournalFilter(
                              c.key,
                              e.target.value,
                            )
                          }
                          placeholder="تصفية..."
                          aria-label={`تصفية ${c.label}`}
                          className="w-full min-w-[58px] rounded-lg border-2 border-slate-600 bg-slate-900 px-2 py-1 text-xs font-bold text-slate-200 outline-none transition-colors placeholder:text-slate-500 focus:border-amber-500 sm:text-xs shadow-sm"
                        />
                      </th>
                    ))}

                    <th className="border-b border-slate-700 !px-1.5 !py-2" />
                  </tr>
                </thead>

                <tbody className="divide-y divide-slate-800">
                  {filteredJournal.length === 0 ? (
                    <tr>
                      <td
                        colSpan={JOURNAL_COLS.length + 1}
                        className="bg-slate-950 px-2 py-8 text-center text-sm font-black text-slate-500 sm:text-base"
                      >
                        لا توجد قيود تطابق حقول التصفية.
                      </td>
                    </tr>
                  ) : (
                    filteredJournal.map((j) => (
                      <tr
                        key={j.id}
                        className="odd:bg-slate-900 even:bg-slate-950 transition-colors hover:bg-slate-800"
                      >
                        <td className="min-w-0 max-w-[90px] numeric-cell font-mono text-slate-300 !px-2 !py-2.5 sm:!px-3 sm:!py-3 !text-xs sm:!text-sm whitespace-nowrap">
                          <span className={journalClampCls}>
                            {j.formNo || "—"}
                          </span>
                        </td>

                        <td className="min-w-0 max-w-[90px] text-slate-300 !px-2 !py-2.5 sm:!px-3 sm:!py-3 !text-xs sm:!text-sm">
                          <span className={journalClampCls}>
                            {j.settlement || "—"}
                          </span>
                        </td>

                        <td className="min-w-0 max-w-[105px] date-cell numeric-cell font-mono text-slate-300 !px-2 !py-2.5 sm:!px-3 sm:!py-3 !text-xs sm:!text-sm whitespace-nowrap">
                          <span className={journalClampCls}>
                            {j.date || "—"}
                          </span>
                        </td>

                        <td
                          className="min-w-0 max-w-[180px] font-bold text-slate-200 !px-2 !py-2.5 sm:!px-3 sm:!py-3 !text-xs sm:!text-sm"
                          title={j.description}
                        >
                          <span className={journalClampCls}>
                            {j.description || "—"}
                          </span>
                        </td>

                        <td className="min-w-0 max-w-[180px] !px-2 !py-2.5 sm:!px-3 sm:!py-3 !text-xs sm:!text-sm">
                          <span className={`${journalClampCls} rounded-lg border border-emerald-700 bg-emerald-950/70 px-2 py-1 text-xs font-black text-emerald-300 shadow-sm`}>
                            {j.debitAccount || "—"}
                          </span>
                        </td>

                        <td className="min-w-0 max-w-[180px] !px-2 !py-2.5 sm:!px-3 sm:!py-3 !text-xs sm:!text-sm">
                          <span className={`${journalClampCls} rounded-lg border border-rose-700 bg-rose-950/70 px-2 py-1 text-xs font-black text-rose-300 shadow-sm`}>
                            {j.creditAccount || "—"}
                          </span>
                        </td>

                        <td className="min-w-0 max-w-[105px] numeric-cell font-mono font-black text-emerald-300 !px-2 !py-2.5 sm:!px-3 sm:!py-3 !text-xs sm:!text-sm whitespace-nowrap">
                          <span className={journalClampCls}>
                            {j.debit
                              ? j.debit.toLocaleString("en-US")
                              : "—"}
                          </span>
                        </td>

                        <td className="min-w-0 max-w-[105px] numeric-cell font-mono font-black text-rose-300 !px-2 !py-2.5 sm:!px-3 sm:!py-3 !text-xs sm:!text-sm whitespace-nowrap">
                          <span className={journalClampCls}>
                            {j.credit
                              ? j.credit.toLocaleString("en-US")
                              : "—"}
                          </span>
                        </td>

                        <td className="min-w-0 !px-2 !py-2.5 sm:!px-3 sm:!py-3 !text-xs sm:!text-sm">
                          <div className="flex justify-center gap-1.5">
                            <button
                              onClick={() => startEdit(j)}
                              className="grid h-8 w-8 place-items-center rounded-xl border border-slate-600 bg-slate-800 text-blue-300 transition-all hover:bg-blue-950 hover:text-blue-200 hover:border-blue-700 shadow-sm"
                            >
                              <Edit className="h-4 w-4" />
                            </button>

                            <button
                              onClick={() =>
                                deleteJournal(j.id)
                              }
                              className="grid h-8 w-8 place-items-center rounded-xl border border-slate-600 bg-slate-800 text-rose-300 transition-all hover:bg-rose-950 hover:text-rose-200 hover:border-rose-700 shadow-sm"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>

                <tfoot className="sticky bottom-0 bg-slate-900 border-t-2 border-slate-700 shadow-md">
                  <tr className="bg-gradient-to-r from-slate-950 via-slate-900 to-teal-950">
                    <td
                      colSpan={6}
                      className="text-right font-black text-amber-300 !px-3 !py-3 sm:!px-4 sm:!py-3.5 !text-xs sm:!text-sm whitespace-nowrap"
                    >
                      الإجمالي
                    </td>

                    <td className="numeric-cell font-mono font-black text-emerald-300 !px-3 !py-3 sm:!px-4 sm:!py-3.5 !text-xs sm:!text-sm whitespace-nowrap">
                      {grandDebit.toLocaleString("en-US")}
                    </td>

                    <td className="numeric-cell font-mono font-black text-rose-300 !px-3 !py-3 sm:!px-4 sm:!py-3.5 !text-xs sm:!text-sm whitespace-nowrap">
                      {grandCredit.toLocaleString("en-US")}
                    </td>

                    <td />
                  </tr>
                </tfoot>
              </table>
            </div>
          </>
        )}
      </section>
    </div>
  );
            }
