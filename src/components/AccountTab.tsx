import React, { useMemo, useState } from "react";
import { useStore } from "@/lib/store";
import { fmt, today } from "@/lib/format";
import { DESCRIPTIONS } from "@/lib/accounts";
import { toast } from "sonner";
import { importExcelInWorker } from "@/lib/excelImportWorkerClient";
import { useTableControls, sortIndicator } from "@/hooks/useTableControls";
import {
  X,
  Plus,
  Edit,
  Trash2,
  Save,
  Eraser,
  FileSpreadsheet,
  Link,
  RefreshCw,
  Calendar,
  Hash,
  FileText,
  User,
  ArrowUpRight,
  ArrowDownLeft,
  Wallet,
  Zap,
  Stethoscope,
  Landmark,
  Ticket,
} from "lucide-react";
import TabActions from "./TabActions";
import WebActionMenu, { type WebActionItem } from "./WebActionMenu";
import schema from "@/data/revenueTemplate.json";
import expensesSchemaJson from "@/lib/expensesSchema.json";

/* ============================================================
   الحساب الجاري — لوحة ألوان مخصصة وحجم عناصر مناسب للهواتف
   ============================================================ */
const BTN_MOBILE = "px-3 py-2 text-[14px] sm:px-4 sm:py-2.5 sm:text-[15px]";
const ICON_MOBILE = "w-4 h-4 sm:w-5 sm:h-5";

const COLS = [
  { key: "date", label: "التاريخ" },
  { key: "hafizaNo", label: "رقم الحافظة" },
  { key: "notifyNo", label: "رقم التوريد" },
  { key: "notifyDate", label: "تاريخ التوريد" },
  { key: "checkNo", label: "رقم الشيك" },
  { key: "checkDate", label: "تاريخ الشيك" },
  { key: "description", label: "البيان" },
  { key: "specialty", label: "التخصص" },
  { key: "name", label: "الاسم" },
  { key: "hafizaAmount", label: "مبلغ الحافظة" },
  { key: "income", label: "الإيرادات" },
  { key: "expense", label: "المصروفات" },
  { key: "revenueKey", label: "رمز الإيراد" },
  { key: "expenseIndex", label: "بند المصروف" },
  { key: "balance", label: "الرصيد" },
];

type FormType = {
  date: string;
  hafizaNo: string;
  notifyNo: string;
  notifyDate: string;
  checkNo: string;
  checkDate: string;
  description: string;
  specialty: string;
  name: string;
  hafizaAmount: string;
  income: string;
  expense: string;
  revenueKey: string;
  expenseIndex: number | "";
};

const emptyForm: FormType = {
  date: today(),
  hafizaNo: "",
  notifyNo: "",
  notifyDate: "",
  checkNo: "",
  checkDate: "",
  description: "",
  specialty: "",
  name: "",
  hafizaAmount: "",
  income: "",
  expense: "",
  revenueKey: "",
  expenseIndex: "",
};

const parseAmount = (val: any): number => {
  if (val === undefined || val === null || val === "") return 0;
  if (typeof val === "number") return val;
  const cleanString = String(val).replace(/[^\d.-]/g, "");
  const parsed = parseFloat(cleanString);
  return isNaN(parsed) ? 0 : parsed;
};

const parseExcelDate = (val: any): string => {
  if (!val) return "";
  if (val instanceof Date) {
    const y = val.getFullYear();
    const m = String(val.getMonth() + 1).padStart(2, "0");
    const d = String(val.getDate()).padStart(2, "0");
    return `${y}-${m}-${d}`;
  }
  const str = String(val).trim();
  if (!str) return "";

  const isoMatch = str.match(/^(\d{4})[-/.](\d{1,2})[-/.](\d{1,2})/);
  if (isoMatch) {
    const y = isoMatch[1];
    const m = isoMatch[2].padStart(2, "0");
    const d = isoMatch[3].padStart(2, "0");
    return `${y}-${m}-${d}`;
  }

  const dmyMatch = str.match(/^(\d{1,2})[-/.](\d{1,2})[-/.](\d{4})/);
  if (dmyMatch) {
    const d = dmyMatch[1].padStart(2, "0");
    const m = dmyMatch[2].padStart(2, "0");
    const y = dmyMatch[3];
    return `${y}-${m}-${d}`;
  }

  const num = Number(str);
  if (!isNaN(num) && num > 20000 && num < 60000) {
    const date = new Date(Math.round((num - 25569) * 86400 * 1000));
    const y = date.getUTCFullYear();
    const m = String(date.getUTCMonth() + 1).padStart(2, "0");
    const d = String(date.getUTCDate()).padStart(2, "0");
    return `${y}-${m}-${d}`;
  }

  return str;
};

// ==========================================
// مكونات مساعدة للنموذج
// ==========================================
const Field = ({
  label,
  icon,
  v,
  on,
  ph,
  type = "text",
  placeholder = "",
  className = "",
  inputMode,
  step,
}: {
  label: string;
  icon?: React.ReactNode;
  v: string;
  on: (v: string) => void;
  ph?: string;
  type?: string;
  placeholder?: string;
  className?: string;
  inputMode?: any;
  step?: any;
}) => (
  <div className="flex flex-col">
    <label className="flex items-center gap-1.5 text-[15px] font-black mb-1 mr-0.5 tracking-wide text-[#0f2f44]">
      {icon} {label}
    </label>
    <input
      type={type}
      inputMode={inputMode}
      step={step}
      value={v}
      onChange={(e) => on(e.target.value)}
      placeholder={placeholder || ph}
      className={`w-full px-3 py-2 text-[15px] border border-black rounded-xl outline-none shadow-sm transition-all bg-white text-[#0f2f44] font-bold placeholder:text-gray-400 focus:bg-[#eef6fb] focus:border-[#1f5f7a] ${className}`}
    />
  </div>
);

export default function AccountTab() {
  const {
    accounts,
    addAccount,
    updateAccount,
    deleteAccount,
    clearAccounts,
    syncHafizaToAccount,
    hafiza,
  } = useStore();

  const [form, setForm] = useState<FormType>(emptyForm);
  const [editingRow, setEditingRow] = useState<any | null>(null);

  const {
    search,
    setSearch,
    sortField,
    sortDir,
    handleSort,
    page,
    setPage,
    pageSize,
    setPageSize,
    totalCount,
    totalPages,
    paginated,
    filtered,
    visibleColumns,
    toggleColumn,
    allColumns,
    filters,
    setFilter,
    clearFilters,
  } = useTableControls(
    accounts,
    COLS.map((c) => c.key),
  );

  // استخراج قائمة الإيرادات
  const revenueTypes = useMemo(() => {
    const list: { key: string; label: string }[] = [];
    if (schema && schema.chapters) {
      schema.chapters.forEach((ch: any) =>
        ch.sections.forEach((sec: any) =>
          sec.items.forEach((it: any) =>
            it.types.forEach((t: any) => {
              list.push({
                key: `${ch.no}-${sec.no}-${it.no}-${t.no}`,
                label: `${ch.title} ← ${t.title}`,
              });
            }),
          ),
        ),
      );
    }
    return list;
  }, []);

  // استخراج الأنواع النهائية للمصروفات مع مسارها الكامل
  const expenseTypes = useMemo(() => {
    const list: { index: number; label: string; code: string }[] = [];
    const rows = (expensesSchemaJson as any)?.rows || [];
    let currentBab = "";
    let currentFasl = "";

    rows.forEach((r: any, idx: number) => {
      if (r.lv === "bab") currentBab = r.n;
      if (r.lv === "fasl") currentFasl = r.n;
      if (r.lv === "type") {
        const code = [r.b, r.c, r.d, r.e].filter(Boolean).join("-");
        list.push({
          index: idx,
          code: code || String(idx),
          label: `${currentBab ? currentBab + " ← " : ""}${r.n}`,
        });
      }
    });
    return list;
  }, []);

  const totalIncome = useMemo(
    () => accounts.reduce((sum, a) => sum + (Number(a.income) || 0), 0),
    [accounts],
  );
  const totalExpense = useMemo(
    () => accounts.reduce((sum, a) => sum + (Number(a.expense) || 0), 0),
    [accounts],
  );
  const currentBalance = totalIncome - totalExpense;

  const filteredWithBalance = useMemo(() => {
    const isOpeningRow = (row: any) =>
      String(row.description ?? "").includes("الرصيد الافتتاحي");

    const openingRow = accounts.find(isOpeningRow);
    const base = openingRow ? Number(openingRow.income) || 0 : 0;
    const displayedRows = filtered.filter((r) => !isOpeningRow(r));

    let runningBalance = base;
    const rest = displayedRows.map((row) => {
      runningBalance += (Number(row.income) || 0) - (Number(row.expense) || 0);
      return { ...row, balance: runningBalance };
    });

    const pinned = openingRow ? [{ ...openingRow, balance: base }] : [];
    return [...pinned, ...rest];
  }, [filtered, accounts]);

  const [accountReportMode, setAccountReportMode] = useState<"quarter" | "halfYear" | "year">("quarter");
  const [accountReportYear, setAccountReportYear] = useState(new Date().getFullYear());
  const [accountReportPeriod, setAccountReportPeriod] = useState(1);

  const accountReportStartMonth =
    accountReportMode === "quarter"
      ? (accountReportPeriod - 1) * 3 + 1
      : accountReportMode === "halfYear"
        ? (accountReportPeriod - 1) * 6 + 1
        : 1;
  const accountReportEndMonth =
    accountReportMode === "quarter"
      ? accountReportPeriod * 3
      : accountReportMode === "halfYear"
        ? accountReportPeriod * 6
        : 12;

  const accountReportRows = useMemo(() => {
    const isOpeningRow = (row: any) => String(row.description ?? "").includes("الرصيد الافتتاحي");
    const openingRow = accounts.find(isOpeningRow);
    let openingBalance = openingRow ? Number(openingRow.income) || 0 : 0;
    const periodRows: any[] = [];

    accounts.forEach((row: any) => {
      if (isOpeningRow(row)) return;
      const date = new Date(row.date);
      if (isNaN(date.getTime()) || date.getFullYear() !== accountReportYear) return;
      const rowMonth = date.getMonth() + 1;
      const movement = (Number(row.income) || 0) - (Number(row.expense) || 0);
      if (rowMonth < accountReportStartMonth) openingBalance += movement;
      if (rowMonth >= accountReportStartMonth && rowMonth <= accountReportEndMonth) {
        periodRows.push(row);
      }
    });

    periodRows.sort((a, b) => String(a.date || "").localeCompare(String(b.date || "")));
    let runningBalance = openingBalance;
    const rows = periodRows.map((row) => {
      runningBalance += (Number(row.income) || 0) - (Number(row.expense) || 0);
      return { ...row, balance: runningBalance };
    });
    const openingReportRow = {
      id: `period-opening-${accountReportYear}-${accountReportStartMonth}`,
      date: `${accountReportYear}-${String(accountReportStartMonth).padStart(2, "0")}-01`,
      hafizaNo: "",
      notifyNo: "",
      notifyDate: "",
      checkNo: "",
      checkDate: "",
      description: "الرصيد الافتتاحي",
      specialty: "",
      name: "",
      hafizaAmount: 0,
      income: 0,
      expense: 0,
      revenueKey: "",
      expenseIndex: undefined,
      balance: openingBalance,
    };
    return [openingReportRow, ...rows];
  }, [accounts, accountReportYear, accountReportStartMonth, accountReportEndMonth]);

  const submit = () => {
    if (!form.description && !form.name) {
      toast.error("يرجى إدخال الاسم أو البيان على الأقل");
      return;
    }
    addAccount({
      date: form.date,
      hafizaNo: form.hafizaNo,
      notifyNo: form.notifyNo,
      notifyDate: form.notifyDate,
      checkNo: form.checkNo,
      checkDate: form.checkDate,
      description: form.description,
      specialty: form.specialty,
      name: form.name,
      hafizaAmount: Number(form.hafizaAmount) || 0,
      income: Number(form.income) || 0,
      expense: Number(form.expense) || 0,
      revenueKey: form.revenueKey || undefined,
      expenseIndex: form.expenseIndex !== "" ? Number(form.expenseIndex) : undefined,
    });
    toast.success("تم حفظ القيد يدوياً");
    setForm(emptyForm);
  };

  const handleEditSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingRow) return;
    updateAccount(editingRow.id, {
      ...editingRow,
      hafizaAmount: Number(editingRow.hafizaAmount) || 0,
      income: Number(editingRow.income) || 0,
      expense: Number(editingRow.expense) || 0,
      expenseIndex: editingRow.expenseIndex !== undefined && editingRow.expenseIndex !== "" ? Number(editingRow.expenseIndex) : undefined,
    });
    toast.success("تم تحديث السجل بنجاح");
    setEditingRow(null);
  };

  const handleExcelImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const rows = await importExcelInWorker(file);
      if (!rows || rows.length === 0) {
        toast.error("الملف فارغ أو بتنسيق غير مدعوم");
        return;
      }
      let added = 0;
      rows.forEach((r: any) => {
        const desc = r["البيان"] || r["الوصف"] || "";
        const name = r["الاسم"] || "";
        if (!desc && !name) return;
        addAccount({
          date: parseExcelDate(r["التاريخ"]) || today(),
          hafizaNo: String(r["رقم الحافظة"] || ""),
          notifyNo: String(r["رقم التوريد"] || r["رقم الإشعار"] || ""),
          notifyDate: parseExcelDate(r["تاريخ التوريد"] || r["تاريخ الإشعار"]) || "",
          checkNo: String(r["رقم الشيك"] || ""),
          checkDate: parseExcelDate(r["تاريخ الشيك"]) || "",
          description: desc,
          specialty: String(r["التخصص"] || ""),
          name,
          hafizaAmount: parseAmount(r["مبلغ الحافظة"]),
          income: parseAmount(r["الإيرادات"] || r["المقبوضات"]),
          expense: parseAmount(r["المصروفات"] || r["المدفوعات"]),
          revenueKey: r["رمز الإيراد"] ? String(r["رمز الإيراد"]) : undefined,
        });
        added++;
      });
      toast.success(`تم استيراد ${added} حركة بنجاح`);
    } catch (err) {
      console.error(err);
      toast.error("تعذر استيراد الملف");
    } finally {
      e.target.value = "";
    }
  };

  const actionItems: WebActionItem[] = [
    {
      id: "import-excel",
      label: "استيراد من إكسل",
      icon: "FileSpreadsheet",
      colorClass: "bg-emerald-600 hover:bg-emerald-700 text-white",
      onSelect: () => document.getElementById("account-excel-input")?.click(),
    },
    {
      id: "sync-hafiza",
      label: "مزامنة الحوافظ",
      icon: "RefreshCw",
      colorClass: "bg-teal-600 hover:bg-teal-700 text-white",
      onSelect: () => {
        hafiza.forEach((h) => syncHafizaToAccount(h));
        toast.success("تمت مزامنة الحوافظ بنجاح");
      },
    },
    {
      id: "clear-all",
      label: "تفريغ الحساب الجاري",
      icon: "Trash2",
      colorClass: "bg-rose-600 hover:bg-rose-700 text-white",
      onSelect: () => {
        if (confirm("هل تريد تفريغ جدول الحساب الجاري بالكامل؟")) {
          clearAccounts();
          toast.success("تم مسح السجلات");
        }
      },
    },
  ];

  return (
    <div className="space-y-6 pb-12 font-sans" dir="rtl">
      <input
        type="file"
        id="account-excel-input"
        accept=".xlsx,.xls,.csv"
        className="hidden"
        onChange={handleExcelImport}
      />

      {/* الشريط العلوي للعنوان والإجراءات */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-4 rounded-2xl border border-[#1f5f7a]/20 bg-gradient-to-r from-[#eef6fb] to-[#d7e7f0] shadow-sm">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-[#1f5f7a] text-white rounded-xl shadow">
            <Wallet className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-xl sm:text-2xl font-black text-[#0f2f44]">
              سجل الحساب الجاري للعام 2026م
            </h1>
            <p className="text-sm font-bold text-[#1f5f7a]">
              متابعة الإيرادات والمصروفات والربط المحاسبي الآلي
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <WebActionMenu items={actionItems} />
          <TabActions
            data={filteredWithBalance}
            columns={COLS}
            title="كشف حركة الحساب الجاري"
            defaultOrientation="landscape"
          />
        </div>
      </div>

      {/* بطاقات الإحصائيات الفاتحة */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-4 rounded-xl border border-emerald-300 bg-gradient-to-br from-emerald-50 to-teal-100 shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-bold text-emerald-800">إجمالي المقبوضات (الإيراد)</span>
            <ArrowDownLeft className="w-5 h-5 text-emerald-700" />
          </div>
          <div className="text-2xl font-black font-mono text-emerald-950 tabular-nums">
            {fmt(totalIncome)} <span className="text-xs font-normal">ر.ي</span>
          </div>
        </div>

        <div className="p-4 rounded-xl border border-rose-300 bg-gradient-to-br from-rose-50 to-pink-100 shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-bold text-rose-800">إجمالي المدفوعات (المصروف)</span>
            <ArrowUpRight className="w-5 h-5 text-rose-700" />
          </div>
          <div className="text-2xl font-black font-mono text-rose-950 tabular-nums">
            {fmt(totalExpense)} <span className="text-xs font-normal">ر.ي</span>
          </div>
        </div>

        <div className="p-4 rounded-xl border border-sky-300 bg-gradient-to-br from-sky-50 to-cyan-100 shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-bold text-sky-800">الرصيد الدفتري الحالي</span>
            <Wallet className="w-5 h-5 text-sky-700" />
          </div>
          <div className="text-2xl font-black font-mono text-sky-950 tabular-nums">
            {fmt(currentBalance)} <span className="text-xs font-normal">ر.ي</span>
          </div>
        </div>
      </div>

      {/* نموذج تسجيل حركة جديدة */}
      <div className="p-5 rounded-2xl border border-[#1f5f7a]/20 bg-white shadow-sm space-y-4">
        <h2 className="text-lg font-black text-[#0f2f44] flex items-center gap-2 border-b pb-2 border-slate-200">
          <Plus className="w-5 h-5 text-[#1f5f7a]" /> تسجيل قيد حركة في الحساب الجاري
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
          <Field
            label="التاريخ"
            type="date"
            icon={<Calendar className="w-4 h-4 text-[#1f5f7a]" />}
            v={form.date}
            on={(v) => setForm({ ...form, date: v })}
          />
          <Field
            label="رقم الحافظة"
            icon={<Hash className="w-4 h-4 text-[#1f5f7a]" />}
            v={form.hafizaNo}
            on={(v) => setForm({ ...form, hafizaNo: v })}
            ph="رقم الحافظة"
          />
          <Field
            label="رقم التوريد"
            icon={<Hash className="w-4 h-4 text-[#1f5f7a]" />}
            v={form.notifyNo}
            on={(v) => setForm({ ...form, notifyNo: v })}
            ph="رقم إشعار التوريد"
          />
          <Field
            label="تاريخ التوريد"
            type="date"
            icon={<Calendar className="w-4 h-4 text-[#1f5f7a]" />}
            v={form.notifyDate}
            on={(v) => setForm({ ...form, notifyDate: v })}
          />

          <Field
            label="رقم الشيك"
            icon={<Ticket className="w-4 h-4 text-[#9c3d3d]" />}
            v={form.checkNo}
            on={(v) => setForm({ ...form, checkNo: v })}
            ph="إن وجد"
          />
          <Field
            label="تاريخ الشيك"
            type="date"
            icon={<Calendar className="w-4 h-4 text-[#9c3d3d]" />}
            v={form.checkDate}
            on={(v) => setForm({ ...form, checkDate: v })}
          />
          <Field
            label="الاسم / الجهة"
            icon={<User className="w-4 h-4 text-[#1f5f7a]" />}
            v={form.name}
            on={(v) => setForm({ ...form, name: v })}
            ph="اسم المورد أو المستفيد"
          />
          <Field
            label="التخصص"
            icon={<Stethoscope className="w-4 h-4 text-[#1f5f7a]" />}
            v={form.specialty}
            on={(v) => setForm({ ...form, specialty: v })}
            ph="تخصص المتدرب إن وجد"
          />

          <div className="sm:col-span-2">
            <Field
              label="البيان / تفاصيل القيد"
              icon={<FileText className="w-4 h-4 text-[#1f5f7a]" />}
              v={form.description}
              on={(v) => setForm({ ...form, description: v })}
              ph="اكتب تفاصيل وبيان الحركة..."
            />
          </div>

          <Field
            label="مبلغ الإيراد"
            type="number"
            icon={<span className="text-xs font-bold text-emerald-700">ر.ي</span>}
            v={form.income}
            on={(v) => setForm({ ...form, income: v })}
            placeholder="0.00"
            className="text-emerald-800 font-bold bg-emerald-50/50"
          />

          <Field
            label="مبلغ المصروف"
            type="number"
            icon={<span className="text-xs font-bold text-rose-700">ر.ي</span>}
            v={form.expense}
            on={(v) => setForm({ ...form, expense: v })}
            placeholder="0.00"
            className="text-rose-800 font-bold bg-rose-50/50"
          />

          {/* قائمة ربط الإيراد */}
          <div className="sm:col-span-2">
            <label className="flex items-center gap-1.5 text-[15px] font-black mb-1.5 mr-0.5 tracking-wide text-indigo-900">
              <Link className="w-4 h-4 text-indigo-600" /> ربط بدليل هيكل الإيرادات
            </label>
            <select
              value={form.revenueKey}
              onChange={(e) => setForm({ ...form, revenueKey: e.target.value })}
              className="w-full px-3 py-2 text-[14px] border border-black rounded-xl outline-none shadow-sm bg-indigo-50/40 text-[#0f2f44] font-bold focus:border-indigo-600"
            >
              <option value="">-- بدون ربط بإيراد --</option>
              {revenueTypes.map((t) => (
                <option key={t.key} value={t.key}>
                  {t.key} | {t.label}
                </option>
              ))}
            </select>
          </div>

          {/* قائمة ربط المصروف */}
          <div className="sm:col-span-2">
            <label className="flex items-center gap-1.5 text-[15px] font-black mb-1.5 mr-0.5 tracking-wide text-[#9c3d3d]">
              <Link className="w-4 h-4 text-[#9c3d3d]" /> ربط بدليل المصروفات (الاستخدامات)
            </label>
            <select
              value={form.expenseIndex !== "" ? form.expenseIndex : ""}
              onChange={(e) =>
                setForm({
                  ...form,
                  expenseIndex: e.target.value !== "" ? Number(e.target.value) : "",
                })
              }
              className="w-full px-3 py-2 text-[14px] border border-black rounded-xl outline-none shadow-sm bg-[#fdf2f2] text-[#0f2f44] font-bold focus:border-[#9c3d3d]"
            >
              <option value="">-- بدون ربط بمصروف --</option>
              {expenseTypes.map((t) => (
                <option key={t.index} value={t.index}>
                  {t.code} | {t.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="flex gap-3 pt-2">
          <button
            onClick={submit}
            className="flex-1 flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl font-black bg-[#1f5f7a] hover:bg-[#16485d] text-white shadow transition-colors"
          >
            <Save className="w-5 h-5" /> <span>ترحيل القيد</span>
          </button>
          <button
            onClick={() => setForm(emptyForm)}
            className="flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl font-bold bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors"
          >
            <Eraser className="w-5 h-5" /> <span>مسح النموذج</span>
          </button>
        </div>
      </div>

      {/* جدول الحساب الجاري */}
      <div className="rounded-2xl border border-black bg-white shadow-sm overflow-hidden">
        <div className="p-3 bg-slate-100 border-b border-black flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="بحث في الحركات أو الأسماء..."
              className="px-3 py-1.5 text-sm rounded-lg border border-slate-300 w-64 bg-white outline-none"
            />
          </div>
          <div className="text-sm font-bold text-slate-600">
            عدد القيود: <span className="font-mono text-black">{filteredWithBalance.length}</span>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full min-w-max table-auto border-collapse text-sm">
            <thead>
              <tr className="bg-slate-200 text-[#0f2f44] font-black border-b border-black">
                <th className="border border-black px-2 py-2 text-center w-10">#</th>
                <th className="border border-black px-2 py-2 text-center cursor-pointer" onClick={() => handleSort("date")}>
                  التاريخ {sortIndicator(sortField, sortDir, "date")}
                </th>
                <th className="border border-black px-2 py-2 text-center">رقم الحافظة</th>
                <th className="border border-black px-2 py-2 text-center">رقم التوريد</th>
                <th className="border border-black px-2 py-2 text-center">تاريخ التوريد</th>
                <th className="border border-black px-2 py-2 text-center">رقم الشيك</th>
                <th className="border border-black px-2 py-2 text-center">تاريخ الشيك</th>
                <th className="border border-black px-2 py-2 text-right">البيان</th>
                <th className="border border-black px-2 py-2 text-right">الاسم</th>
                <th className="border border-black px-2 py-2 text-center bg-emerald-100 text-emerald-950">الإيراد</th>
                <th className="border border-black px-2 py-2 text-center bg-rose-100 text-rose-950">المصروف</th>
                <th className="accounts-print-hide border border-black px-2 py-2 text-center">رمز الإيراد</th>
                <th className="accounts-print-hide border border-black px-2 py-2 text-center">بند المصروف</th>
                <th className="border border-black px-2 py-2 text-center bg-sky-100 text-sky-950">الرصيد</th>
                <th className="accounts-print-hide border border-black px-2 py-2 text-center w-20">إجراءات</th>
              </tr>
            </thead>
            <tbody>
              {filteredWithBalance.length === 0 ? (
                <tr>
                  <td colSpan={15} className="text-center py-8 text-slate-500 font-bold">
                    لا توجد قيود مسجلة
                  </td>
                </tr>
              ) : (
                filteredWithBalance.map((acc: any, idx: number) => (
                  <tr key={acc.id || idx} className="hover:bg-slate-50 transition-colors">
                    <td className="border border-black text-center font-mono text-xs">{idx + 1}</td>
                    <td className="border border-black text-center font-mono">{acc.date}</td>
                    <td className="border border-black text-center font-mono">{acc.hafizaNo || "—"}</td>
                    <td className="border border-black text-center font-mono">{acc.notifyNo || "—"}</td>
                    <td className="border border-black text-center font-mono">{acc.notifyDate || "—"}</td>
                    <td className="border border-black text-center font-mono">{acc.checkNo || "—"}</td>
                    <td className="border border-black text-center font-mono">{acc.checkDate || "—"}</td>
                    <td className="border border-black px-2 py-1 text-right max-w-[220px] min-w-[140px] whitespace-normal leading-snug line-clamp-2">
                      {acc.description}
                    </td>
                    <td className="border border-black px-2 py-1 text-right">{acc.name || "—"}</td>
                    <td className="border border-black font-mono font-bold text-center bg-emerald-50/50 text-emerald-800">
                      {Number(acc.income) > 0 ? fmt(acc.income) : "—"}
                    </td>
                    <td className="border border-black font-mono font-bold text-center bg-rose-50/50 text-rose-800">
                      {Number(acc.expense) > 0 ? fmt(acc.expense) : "—"}
                    </td>

                    {/* قائمة ربط الإيراد */}
                    <td className="accounts-print-hide border border-black text-center p-1">
                      <select
                        value={acc.revenueKey || ""}
                        onChange={(e) => {
                          const newKey = e.target.value;
                          updateAccount(acc.id, { ...acc, revenueKey: newKey || undefined });
                          toast.success("تم تحديث رمز الإيراد");
                        }}
                        className="w-full text-xs font-bold text-indigo-900 bg-indigo-50 border rounded p-1 outline-none"
                      >
                        <option value="">— ربط الإيراد —</option>
                        {revenueTypes.map((t) => (
                          <option key={t.key} value={t.key}>
                            {t.key}
                          </option>
                        ))}
                      </select>
                    </td>

                    {/* قائمة ربط المصروف */}
                    <td className="accounts-print-hide border border-black text-center p-1">
                      <select
                        value={acc.expenseIndex !== undefined ? acc.expenseIndex : ""}
                        onChange={(e) => {
                          const val = e.target.value;
                          updateAccount(acc.id, {
                            ...acc,
                            expenseIndex: val !== "" ? Number(val) : undefined,
                          });
                          toast.success("تم تحديث بند المصروف");
                        }}
                        className="w-full text-xs font-bold text-[#9c3d3d] bg-rose-50 border rounded p-1 outline-none"
                      >
                        <option value="">— ربط المصروف —</option>
                        {expenseTypes.map((t) => (
                          <option key={t.index} value={t.index}>
                            {t.label}
                          </option>
                        ))}
                      </select>
                    </td>

                    <td className="border border-black font-mono font-bold text-center bg-sky-50/50 text-sky-900">
                      {fmt(acc.balance)}
                    </td>

                    <td className="accounts-print-hide border border-black text-center p-1">
                      <div className="flex justify-center gap-1">
                        <button
                          onClick={() => setEditingRow(acc)}
                          className="p-1.5 text-blue-600 hover:bg-blue-50 rounded"
                          title="تعديل"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => {
                            if (confirm("هل تريد حذف هذا القيد؟")) deleteAccount(acc.id);
                          }}
                          className="p-1.5 text-rose-600 hover:bg-rose-50 rounded"
                          title="حذف"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* نافذة التعديل المنبثقة */}
      {editingRow && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-2xl w-full border border-black shadow-2xl p-6 space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b pb-3">
              <h3 className="text-lg font-black text-[#0f2f44]">تعديل قيد في الحساب الجاري</h3>
              <button onClick={() => setEditingRow(null)} className="p-1 rounded hover:bg-slate-100">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleEditSave} className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Field
                label="التاريخ"
                type="date"
                v={editingRow.date || ""}
                on={(v) => setEditingRow({ ...editingRow, date: v })}
              />
              <Field
                label="رقم الحافظة"
                v={editingRow.hafizaNo || ""}
                on={(v) => setEditingRow({ ...editingRow, hafizaNo: v })}
              />
              <Field
                label="رقم التوريد"
                v={editingRow.notifyNo || ""}
                on={(v) => setEditingRow({ ...editingRow, notifyNo: v })}
              />
              <Field
                label="تاريخ التوريد"
                type="date"
                v={editingRow.notifyDate || ""}
                on={(v) => setEditingRow({ ...editingRow, notifyDate: v })}
              />
              <Field
                label="رقم الشيك"
                v={editingRow.checkNo || ""}
                on={(v) => setEditingRow({ ...editingRow, checkNo: v })}
              />
              <Field
                label="تاريخ الشيك"
                type="date"
                v={editingRow.checkDate || ""}
                on={(v) => setEditingRow({ ...editingRow, checkDate: v })}
              />
              <Field
                label="الاسم"
                v={editingRow.name || ""}
                on={(v) => setEditingRow({ ...editingRow, name: v })}
              />
              <Field
                label="التخصص"
                v={editingRow.specialty || ""}
                on={(v) => setEditingRow({ ...editingRow, specialty: v })}
              />
              <div className="sm:col-span-2">
                <Field
                  label="البيان"
                  v={editingRow.description || ""}
                  on={(v) => setEditingRow({ ...editingRow, description: v })}
                />
              </div>
              <Field
                label="الإيرادات"
                type="number"
                v={String(editingRow.income || "")}
                on={(v) => setEditingRow({ ...editingRow, income: v })}
              />
              <Field
                label="المصروفات"
                type="number"
                v={String(editingRow.expense || "")}
                on={(v) => setEditingRow({ ...editingRow, expense: v })}
              />

              <div className="sm:col-span-2">
                <label className="text-sm font-bold text-slate-700 mb-1 block">بند المصروف المرتبط:</label>
                <select
                  value={editingRow.expenseIndex !== undefined ? editingRow.expenseIndex : ""}
                  onChange={(e) =>
                    setEditingRow({
                      ...editingRow,
                      expenseIndex: e.target.value !== "" ? Number(e.target.value) : undefined,
                    })
                  }
                  className="w-full p-2 border rounded-xl font-bold text-sm bg-rose-50 text-[#9c3d3d] outline-none"
                >
                  <option value="">— بدون ربط بمصروف —</option>
                  {expenseTypes.map((t) => (
                    <option key={t.index} value={t.index}>
                      {t.code} | {t.label}
                    </option>
                  ))}
                </select>
              </div>

              <div className="sm:col-span-2 flex justify-end gap-2 pt-4 border-t">
                <button
                  type="button"
                  onClick={() => setEditingRow(null)}
                  className="px-4 py-2 rounded-xl bg-slate-100 font-bold"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-[#1f5f7a] text-white font-bold"
                >
                  حفظ التعديلات
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
