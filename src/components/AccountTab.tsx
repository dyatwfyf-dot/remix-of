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
  Link as LinkIcon,
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
  ChevronDown,
  BarChart3,
  Layers,
} from "lucide-react";
import TabActions from "./TabActions";
import schema from "@/data/revenueTemplate.json";

/* ============================================================
   الحساب الجاري — هوية Modern Teal & Warm Gold
   تنسيق ثنائي دقيق ومحسّن للشاشات والهواتف
   ============================================================ */

const COLS = [
  { key: "date", label: "التاريخ" },
  { key: "hafizaNo", label: "رقم الحافظة" },
  { key: "notifyNo", label: "رقم الإشعار" },
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
};

/* أنماط الطباعة */
const PRINT_STYLES = `
@media print {
  .accounts-print-scope { background: #ffffff !important; padding: 0 !important; }
  .accounts-print-area, .accounts-print-area * { visibility: visible !important; }
  .accounts-print-hide { display: none !important; }
  table { width: 100% !important; border-collapse: collapse !important; font-size: 14px !important; 
        table-layout:auto !important; 
max-with:auto !important;

    
  }
  th, td { border: 1px solid #000 !important; padding: 3px 5px !important; }
}
`;

/* مودال التعديل الزجاجي العصري */
const EditModal = ({
  title,
  isOpen,
  onClose,
  children,
}: {
  title: string;
  isOpen: boolean;
  onClose: () => void;
  children: React.ReactNode;
}) => {
  if (!isOpen) return null;
  return (
    <div
      className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-end sm:items-center justify-center z-50 p-2 sm:p-4"
      dir="rtl"
    >
      <div className="bg-white rounded-t-3xl sm:rounded-3xl w-auto max-w-auto shadow-2xl max-h-[92vh] overflow-y-auto border border-slate-200">
        <div className="flex justify-between items-center px-5 py-4 border-b border-slate-100 bg-gradient-to-r from-teal-800 to-slate-900 text-white rounded-t-3xl sticky top-0 z-10">
          <h3 className="text-base sm:text-lg font-black flex items-center gap-2">{title}</h3>
          <button
            onClick={onClose}
            className="p-1.5 hover:bg-white/20 rounded-xl transition-colors text-white"
            aria-label="إغلاق"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        <div className="p-4 sm:p-6">{children}</div>
      </div>
    </div>
  );
};

/* مكوّن الحقل الفردي المصمم لشبكة حقلين لكل سطر */
function FormField({
  label,
  v,
  on,
  type = "text",
  placeholder = "",
  icon,
  className = "",
}: {
  label: string;
  v: string;
  on: (v: string) => void;
  type?: string;
  placeholder?: string;
  icon?: React.ReactNode;
  className?: string;
}) {
  return (
    <div className="w-full">
      <label className="block text-xs sm:text-sm font-bold text-slate-700 mb-1 tracking-wide">
        {label}
      </label>
      <div className="relative flex items-center">
        {icon && <span className="absolute right-3 z-10 pointer-events-none">{icon}</span>}
        <input
          type={type}
          value={v}
          onChange={(e) => on(e.target.value)}
          placeholder={placeholder}
className={`w-auto ${icon ? "pr-9" : "px-3"} pl-3 py-2 text-xs sm:text-sm rounded-xl border border-slate-300 bg-white/95 text-slate-900 font-medium placeholder:text-slate-400 focus:border-teal-600 focus:ring-2 focus:ring-teal-600/20 shadow-sm transition-all outline-none ${className}`}
        />
      </div>
    </div>
  );
}

export default function AccountsTab() {
  const {
    accounts,
    addAccount,
    updateAccount,
    deleteAccount,
    clearAccounts,
    hafiza = [],
  } = useStore();

  const [form, setForm] = useState<FormType>(emptyForm);
  const [showForm, setShowForm] = useState(false);
  const [showReports, setShowReports] = useState(false);
  const [editingRow, setEditingRow] = useState<any | null>(null);

  // مطابقة شاملة معتمدة على sourceHafizaId (مفتاح فريد) لمنع التكرار
  const handleSyncFromHafiza = () => {
    const source = hafiza && hafiza.length > 0 ? hafiza : useStore.getState().hafiza || [];
    if (!source || source.length === 0) {
      toast.error("لا توجد بيانات في تبويب حوافظ التوريد!");
      return;
    }

    const normalizeStr = (val: any) => String(val ?? "").trim();
    const normalizeNum = (val: any): number => {
      const num = Number(val);
      return isNaN(num) ? 0 : num;
    };
    const cleanDate = (dateStr: string) => String(dateStr ?? "").replace(/[^\d]/g, "");

    const hafiza2026 = source.filter((h: any) => cleanDate(h?.date).substring(0, 4) === "2026");

    if (hafiza2026.length === 0) {
      toast.info("لا توجد حوافظ لعام 2026.");
      return;
    }

    let addedCount = 0;
    let updatedCount = 0;
    let skippedCount = 0;

    const currentAccounts = useStore.getState().accounts;
    const byHafizaId = new Map<string, any>();
    const byHafizaNo = new Map<string, any>();
    const linkedAccountIds = new Set<string>();

    currentAccounts.forEach((acc: any) => {
      if (acc.sourceHafizaId) {
        byHafizaId.set(normalizeStr(acc.sourceHafizaId), acc);
        linkedAccountIds.add(acc.id);
      }
    });

    currentAccounts.forEach((acc: any) => {
      if (
        acc.hafizaNo &&
        !linkedAccountIds.has(acc.id) &&
        !byHafizaNo.has(normalizeStr(acc.hafizaNo))
      ) {
        byHafizaNo.set(normalizeStr(acc.hafizaNo), acc);
      }
    });

    hafiza2026.forEach((hafizaRow: any) => {
      if (!hafizaRow?.id) return;
      const hid = normalizeStr(hafizaRow.id);

      const notifyAmountValue =
        hafizaRow.notifyAmount ?? hafizaRow.supplyAmount ?? hafizaRow.tawreedAmount ?? 0;
      const incomeValue = normalizeNum(notifyAmountValue);

      const mappedData = {
        date: hafizaRow.date || today(),
        hafizaNo: normalizeStr(hafizaRow.hafizaNo),
        notifyNo: normalizeStr(hafizaRow.notifyNo),
        notifyDate: hafizaRow.notifyDate || "",
        description: normalizeStr(hafizaRow.description),
        specialty: normalizeStr(hafizaRow.specialty),
        name: normalizeStr(hafizaRow.name),
        hafizaAmount: normalizeNum(hafizaRow.hafizaAmount || hafizaRow.amount),
        income: incomeValue,
      };

      let existing = byHafizaId.get(hid);
      if (!existing && mappedData.hafizaNo) {
        existing = byHafizaNo.get(mappedData.hafizaNo);
        if (existing) byHafizaNo.delete(mappedData.hafizaNo);
      }

      if (!existing) {
        const created = addAccount({
          ...mappedData,
          checkNo: "",
          checkDate: "",
          expense: 0,
          revenueKey: undefined,
          sourceHafizaId: hafizaRow.id,
        });
        byHafizaId.set(hid, { ...created, sourceHafizaId: hafizaRow.id });
        addedCount++;
        return;
      }

      const hasDiff =
        cleanDate(existing.date) !== cleanDate(mappedData.date) ||
        normalizeStr(existing.hafizaNo) !== mappedData.hafizaNo ||
        normalizeStr(existing.notifyNo) !== mappedData.notifyNo ||
        normalizeStr(existing.notifyDate) !== mappedData.notifyDate ||
        normalizeStr(existing.description) !== mappedData.description ||
        normalizeStr(existing.specialty) !== mappedData.specialty ||
        normalizeStr(existing.name) !== mappedData.name ||
        normalizeNum(existing.hafizaAmount) !== mappedData.hafizaAmount ||
        normalizeNum(existing.income) !== mappedData.income ||
        existing.sourceHafizaId !== hafizaRow.id;

      if (hasDiff) {
        updateAccount(existing.id, {
          ...existing,
          ...mappedData,
          expense: Number(existing.expense) || 0,
          checkNo: existing.checkNo || "",
          checkDate: existing.checkDate || "",
          revenueKey: existing.revenueKey,
          sourceHafizaId: hafizaRow.id,
        });
        byHafizaId.set(hid, { ...existing, ...mappedData, sourceHafizaId: hafizaRow.id });
        updatedCount++;
      } else {
        skippedCount++;
      }
    });

    if (addedCount > 0 || updatedCount > 0) {
      toast.success(
        `المطابقة: إضافة ${addedCount} | تحديث ${updatedCount} | تطابق ${skippedCount}`,
      );
    } else {
      toast.info(`جميع السجلات الـ ${skippedCount} متطابقة.`);
    }
  };

  const {
    rows: filtered,
    sortKey,
    sortDir,
    toggleSort,
    filters,
    setFilter,
    clearFilters,
  } = useTableControls(
    accounts,
    COLS.map((c) => c.key),
  );

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

  const totalHafiza = useMemo(
    () => accounts.reduce((sum, a) => sum + (Number(a.hafizaAmount) || 0), 0),
    [accounts],
  );
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
      String(row.description ?? "").includes("رصيد افتتاحي");

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

  const accountReportLabel =
    accountReportMode === "quarter"
      ? `الربع ${["الأول", "الثاني", "الثالث", "الرابع"][accountReportPeriod - 1]} ${accountReportYear}م`
      : accountReportMode === "halfYear"
        ? `النصف ${["الأول", "الثاني"][accountReportPeriod - 1]} ${accountReportYear}م`
        : `السنة المالية ${accountReportYear}م`;

  const accountReportRows = useMemo(() => {
    const isOpeningRow = (row: any) => String(row.description ?? "").includes("رصيد افتتاحي");
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
      description: "رصيد افتتاحي للفترة",
      specialty: "",
      name: "",
      hafizaAmount: 0,
      income: 0,
      expense: 0,
      revenueKey: "",
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
    });
    toast.success("تم ترحيل وحفظ القيد المالي بنجاح");
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
    });
    toast.success("تم تحديث السجل المالي بنجاح");
    setEditingRow(null);
  };

  const handleImportExcel = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    e.target.value = "";
    try {
      const data = await importExcelInWorker(file, "account");
      const importedAccounts = data.accounts;
      if (importedAccounts.length === 0) throw new Error("الملف فارغ");
      useStore.getState().importData({ accounts: importedAccounts });
      toast.success(`تم استيراد ${importedAccounts.length} سجل مالي بنجاح`);
    } catch (error) {
      console.error("[Excel] Account import failed", error);
      toast.error("فشل استيراد ملف الإكسل");
    }
  };

  const handleClearAll = () => {
    if (accounts.length === 0) {
      toast.info("لا توجد قيود لمسحها");
      return;
    }
    if (!confirm("هل أنت متأكد من مسح جميع قيود الحساب الجاري؟ لا يمكن التراجع عن هذا الإجراء.")) return;
    clearAccounts();
    toast.success("تم مسح جميع قيود الحساب الجاري بنجاح");
  };

  return (
    <div
      className="accounts-print-scope sheet-tabs-ui apk-tabs-ui w-full min-h-screen space-y-3.5 p-2 sm:p-4 rounded-3xl bg-gradient-to-br from-slate-100 via-teal-50/50 to-amber-50/40 text-slate-800"
      dir="rtl"
    >
      <style>{PRINT_STYLES}</style>

      {/* ===== الترويسة الرئيسية ===== */}
      <div className="accounts-print-hide flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 p-3.5 rounded-2xl bg-white/95 backdrop-blur-md border border-slate-200/80 shadow-md">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-teal-700 via-emerald-600 to-teal-500 flex items-center justify-center text-white shadow-lg shadow-teal-700/25">
            <Landmark className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-base sm:text-lg font-black text-slate-900 tracking-tight">
              دفتر الحساب الجاري
            </h1>
            <p className="text-xs text-slate-500 font-medium">
              سجل الحركات المالية المُرَحّلة ومطابقة الحوافظ
            </p>
          </div>
        </div>

        <div className="flex items-center justify-between sm:justify-end gap-2 px-3.5 py-2 rounded-xl bg-slate-50 border border-slate-200/80">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-xs text-slate-600 font-bold">إجمالي القيود</span>
          </div>
          <span className="text-slate-900 font-mono text-base tabular-nums font-black px-2 py-0.5 rounded-lg bg-white border border-slate-200">
            {accounts.length}
          </span>
        </div>
      </div>

      {/* ===== بطاقات الإجماليات (بتدرجات مميزة وظلال ناعمة) ===== */}
      <div className="accounts-print-hide grid grid-cols-2 lg:grid-cols-4 gap-2.5">
        {/* إجمالي الحوافظ */}
        <div className="relative overflow-hidden rounded-2xl p-3 sm:p-4 bg-gradient-to-br from-slate-800 to-slate-900 text-white shadow-lg shadow-slate-900/15 border border-slate-700/60 flex flex-col justify-between">
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-[11px] sm:text-xs font-bold text-slate-300">مبالغ الحوافظ</span>
            <div className="p-1.5 rounded-xl bg-white/10 text-slate-200">
              <Layers className="w-4 h-4" />
            </div>
          </div>
          <div className="text-sm sm:text-xl font-black font-mono tabular-nums text-amber-300">
            {fmt(totalHafiza)}
          </div>
        </div>

        {/* إجمالي الإيرادات */}
        <div className="relative overflow-hidden rounded-2xl p-3 sm:p-4 bg-gradient-to-br from-teal-700 via-emerald-600 to-teal-800 text-white shadow-lg shadow-teal-700/20 border border-teal-500/40 flex flex-col justify-between">
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-[11px] sm:text-xs font-bold text-teal-100">إجمالي الإيرادات</span>
            <div className="p-1.5 rounded-xl bg-white/15 text-white">
              <ArrowUpRight className="w-4 h-4" />
            </div>
          </div>
          <div className="text-sm sm:text-xl font-black font-mono tabular-nums text-white">
            {fmt(totalIncome)}
          </div>
        </div>

        {/* إجمالي المصروفات */}
        <div className="relative overflow-hidden rounded-2xl p-3 sm:p-4 bg-gradient-to-br from-rose-600 via-red-600 to-rose-700 text-white shadow-lg shadow-rose-600/20 border border-rose-400/40 flex flex-col justify-between">
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-[11px] sm:text-xs font-bold text-rose-100">إجمالي المصروفات</span>
            <div className="p-1.5 rounded-xl bg-white/15 text-white">
              <ArrowDownLeft className="w-4 h-4" />
            </div>
          </div>
          <div className="text-sm sm:text-xl font-black font-mono tabular-nums text-white">
            {fmt(totalExpense)}
          </div>
        </div>

        {/* الرصيد الحالي الصافي */}
        <div className="relative overflow-hidden rounded-2xl p-3 sm:p-4 bg-gradient-to-br from-amber-500 via-amber-600 to-yellow-600 text-slate-950 shadow-lg shadow-amber-500/25 border border-amber-300 flex flex-col justify-between">
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-[11px] sm:text-xs font-black text-slate-900">الرصيد الصافي</span>
            <div className="p-1.5 rounded-xl bg-black/10 text-slate-900">
              <Wallet className="w-4 h-4" />
            </div>
          </div>
          <div className="text-sm sm:text-xl font-black font-mono tabular-nums text-slate-950">
            {fmt(currentBalance)}
          </div>
        </div>
      </div>

      {/* ===== شريط الأزرار الرئيسي - كل سطر يحتوي على زرين (grid-cols-2) ===== */}
      <div className="accounts-print-hide bg-white/95 backdrop-blur-md p-3 rounded-2xl border border-slate-200/80 shadow-md">
        <div className="grid grid-cols-2 gap-2.5">
          {/* السطر الأول: زر القيد الجديد + زر مطابقة شاملة ٢٠٢٦ */}
          <button
            type="button"
            onClick={() => setShowForm((s) => !s)}
            className="flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-xl font-black text-xs sm:text-sm text-white bg-gradient-to-r from-teal-700 via-emerald-600 to-teal-800 shadow-md shadow-teal-700/25 hover:shadow-lg hover:shadow-teal-700/40 active:scale-95 transition-all"
          >
            <Plus className="w-4 h-4" />
            <span>{showForm ? "إخفاء النموذج" : "قيد جديد"}</span>
          </button>

          <button
            type="button"
            onClick={handleSyncFromHafiza}
            className="flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-xl font-black text-xs sm:text-sm text-white bg-gradient-to-r from-slate-800 via-indigo-900 to-slate-900 shadow-md shadow-slate-900/25 hover:shadow-lg hover:shadow-slate-900/40 active:scale-95 transition-all"
          >
            <Zap className="w-4 h-4 text-amber-300" />
            <span>مطابقة شاملة ٢٠٢٦</span>
          </button>

          {/* السطر الثاني: استيراد إكسل + التقارير الدورية */}
          <label className="relative flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-xl font-black text-xs sm:text-sm text-slate-900 cursor-pointer bg-gradient-to-r from-amber-400 via-amber-500 to-yellow-500 shadow-md shadow-amber-400/25 hover:shadow-lg hover:shadow-amber-400/40 active:scale-95 transition-all">
            <FileSpreadsheet className="w-4 h-4 text-slate-900" />
            <span>استيراد إكسل</span>
            <input
              type="file"
              accept=".xlsx, .xls, .csv"
              onChange={handleImportExcel}
              className="absolute h-0 w-0 opacity-0 overflow-hidden"
            />
          </label>

          <button
            type="button"
            onClick={() => setShowReports((s) => !s)}
            className="flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-xl font-black text-xs sm:text-sm text-white bg-gradient-to-r from-cyan-600 to-teal-600 shadow-md shadow-cyan-600/25 hover:shadow-lg hover:shadow-cyan-600/40 active:scale-95 transition-all"
          >
            <BarChart3 className="w-4 h-4" />
            <span>{showReports ? "إخفاء التقارير" : "التقارير الدورية"}</span>
          </button>
        </div>
      </div>

      {/* ===== قسم التقارير الدورية (قابل للإخفاء والإظهار) ===== */}
      {showReports && (
        <div className="accounts-print-hide rounded-2xl overflow-hidden border border-teal-200 bg-white/95 backdrop-blur-md shadow-lg p-3.5 sm:p-4">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 pb-3 border-b border-slate-200">
            <div>
              <h2 className="text-sm sm:text-base font-black text-teal-900">
                تقارير الحساب الجاري الدورية
              </h2>
              <p className="text-xs text-slate-500 font-medium">
                تصفية وتصدير الكشوفات المالية حسب الفترات والأرباع
              </p>
            </div>
            <div className="text-xs font-black text-teal-800 px-3 py-1.5 bg-teal-50 rounded-xl border border-teal-200 shadow-sm">
              {accountReportLabel}
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 mt-3 items-end">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">نوع التقرير</label>
              <select
                value={accountReportMode}
                onChange={(e) => {
                  const nextMode = e.target.value as "quarter" | "halfYear" | "year";
                  setAccountReportMode(nextMode);
                  setAccountReportPeriod(1);
                }}
                className="w-full py-2 px-2.5 text-xs font-bold rounded-xl border border-slate-300 bg-slate-50 text-slate-900 focus:border-teal-600 outline-none"
              >
                <option value="quarter">ربع سنوي</option>
                <option value="halfYear">نصف سنوي</option>
                <option value="year">سنوي</option>
              </select>
            </div>

            {accountReportMode !== "year" && (
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">الفترة</label>
                <select
                  value={accountReportPeriod}
                  onChange={(e) => setAccountReportPeriod(Number(e.target.value))}
                  className="w-full py-2 px-2.5 text-xs font-bold rounded-xl border border-slate-300 bg-slate-50 text-slate-900 focus:border-teal-600 outline-none"
                >
                  {accountReportMode === "quarter" ? (
                    <>
                      <option value={1}>الربع الأول</option>
                      <option value={2}>الربع الثاني</option>
                      <option value={3}>الربع الثالث</option>
                      <option value={4}>الربع الرابع</option>
                    </>
                  ) : (
                    <>
                      <option value={1}>النصف الأول</option>
                      <option value={2}>النصف الثاني</option>
                    </>
                  )}
                </select>
              </div>
            )}

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">السنة المالية</label>
              <input
                type="number"
                value={accountReportYear}
                onChange={(e) => setAccountReportYear(Number(e.target.value) || accountReportYear)}
                className="w-full py-2 px-2.5 text-xs font-bold font-mono text-center rounded-xl border border-slate-300 bg-slate-50 text-slate-900 focus:border-teal-600 outline-none"
              />
            </div>
          </div>

          <div className="mt-3 pt-3 border-t border-slate-200">
            <TabActions
              title={`تقرير الحساب الجاري - ${accountReportLabel}`}
              rows={accountReportRows}
              columns={COLS.filter((c) => c.key !== "revenueKey")}
              fileName={`الحساب-الجاري-${accountReportYear}`}
              numericKeys={["hafizaAmount", "income", "expense", "balance"]}
              pdfLayout="wide-centered"
              pdfOrientation="portrait"
            />
          </div>
        </div>
      )}

      {/* ===== نموذج إدخال قيد جديد - حقلين في كل سطر بالتزام تام ===== */}
      {showForm && (
        <div className="accounts-print-hide rounded-3xl overflow-hidden border border-teal-200 bg-white/95 backdrop-blur-md shadow-xl p-3 sm:p-5">
          <div className="flex items-center justify-between pb-3 mb-3 border-b border-slate-200">
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-xl bg-teal-100 text-teal-800">
                <Plus className="w-5 h-5" />
              </div>
              <h2 className="text-sm sm:text-base font-black text-slate-900">
                إدخال وترحيل قيد مالي جديد
              </h2>
            </div>
            <button
              onClick={() => setShowForm(false)}
              className="p-1 rounded-lg text-slate-400 hover:text-slate-700"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* شبكة الحقول - حقلين لكل سطر (grid-cols-2) */}
          <div className="grid grid-cols-2 gap-2.5 sm:gap-3.5">
            {/* السطر 1: التاريخ | رقم الحافظة */}
            <FormField
              label="التاريخ"
              type="date"
              icon={<Calendar className="w-4 h-4 text-teal-700" />}
              v={form.date}
              on={(v) => setForm({ ...form, date: v })}
            />
            <FormField
              label="رقم الحافظة"
              placeholder="مثال: 105"
              icon={<Hash className="w-4 h-4 text-amber-600" />}
              v={form.hafizaNo}
              on={(v) => setForm({ ...form, hafizaNo: v })}
            />

            {/* السطر 2: رقم الإشعار | تاريخ التوريد */}
            <FormField
              label="رقم الإشعار"
              placeholder="رقم إشعار البنك..."
              icon={<Hash className="w-4 h-4 text-emerald-600" />}
              v={form.notifyNo}
              on={(v) => setForm({ ...form, notifyNo: v })}
            />
            <FormField
              label="تاريخ التوريد"
              type="date"
              icon={<Calendar className="w-4 h-4 text-teal-700" />}
              v={form.notifyDate}
              on={(v) => setForm({ ...form, notifyDate: v })}
            />

            {/* السطر 3: رقم الشيك | تاريخ الشيك */}
            <FormField
              label="رقم الشيك"
              placeholder="رقم الشيك إن وجد..."
              icon={<Ticket className="w-4 h-4 text-indigo-600" />}
              v={form.checkNo}
              on={(v) => setForm({ ...form, checkNo: v })}
            />
            <FormField
              label="تاريخ الشيك"
              type="date"
              icon={<Calendar className="w-4 h-4 text-indigo-600" />}
              v={form.checkDate}
              on={(v) => setForm({ ...form, checkDate: v })}
            />

            {/* السطر 4: الاسم الكامل | التخصص الطبي */}
            <FormField
              label="الاسم الكامل"
              placeholder="اسم المتدرب / المستفيد..."
              icon={<User className="w-4 h-4 text-slate-700" />}
              v={form.name}
              on={(v) => setForm({ ...form, name: v })}
            />
            <FormField
              label="التخصص الطبي"
              placeholder="مثال: باطنة، جراحة..."
              icon={<Stethoscope className="w-4 h-4 text-teal-700" />}
              v={form.specialty}
              on={(v) => setForm({ ...form, specialty: v })}
            />

            {/* السطر 5: البيان والشرح | ربط بدليل هيكل الإيرادات */}
            <div className="w-full">
              <label className="block text-xs sm:text-sm font-bold text-slate-700 mb-1">
                البيان والشرح
              </label>
              <div className="relative flex items-center">
                <span className="absolute right-3 z-10 pointer-events-none">
                  <FileText className="w-4 h-4 text-amber-700" />
                </span>
                <input
                  list="account-descriptions"
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  placeholder="اكتب أو اختر البيان..."
                  className="w-full pr-9 pl-3 py-2 text-xs sm:text-sm rounded-xl border border-slate-300 bg-white/95 text-slate-900 font-medium focus:border-teal-600 focus:ring-2 focus:ring-teal-600/20 shadow-sm outline-none"
                />
              </div>
              <datalist id="account-descriptions">
                {Array.from(
                  new Set([...DESCRIPTIONS, ...accounts.map((a) => a.description).filter(Boolean)]),
                ).map((d) => (
                  <option key={d} value={d} />
                ))}
              </datalist>
            </div>

            <div className="w-full">
              <label className="flex items-center gap-1 text-xs sm:text-sm font-bold text-slate-700 mb-1">
                <LinkIcon className="w-3.5 h-3.5 text-purple-600" /> ربط بدليل الإيراد
              </label>
              <select
                value={form.revenueKey}
                onChange={(e) => setForm({ ...form, revenueKey: e.target.value })}
                className="w-full px-2.5 py-2 text-xs sm:text-sm rounded-xl border border-slate-300 bg-white/95 text-slate-900 font-medium focus:border-teal-600 shadow-sm outline-none"
              >
                <option value="">-- بدون ربط --</option>
                {revenueTypes.map((t) => (
                  <option key={t.key} value={t.key}>
                    {t.key} | {t.label}
                  </option>
                ))}
              </select>
            </div>

            {/* السطر 6: مبلغ الحافظة | الإيرادات */}
            <FormField
              label="مبلغ الحافظة"
              type="number"
              placeholder="0.00"
              icon={<span className="text-[11px] font-black text-slate-600">ر.ي</span>}
              v={form.hafizaAmount}
              on={(v) => setForm({ ...form, hafizaAmount: v })}
              className="font-mono tabular-nums font-bold"
            />
            <FormField
              label="الإيرادات"
              type="number"
              placeholder="0.00"
              icon={<span className="text-[11px] font-black text-emerald-600">ر.ي</span>}
              v={form.income}
              on={(v) => setForm({ ...form, income: v })}
              className="font-mono tabular-nums font-bold text-emerald-700 bg-emerald-50/40 border-emerald-200"
            />

            {/* السطر 7: المصروفات | أزرار الحفظ والمسح ثنائية */}
            <FormField
              label="المصروفات"
              type="number"
              placeholder="0.00"
              icon={<span className="text-[11px] font-black text-rose-600">ر.ي</span>}
              v={form.expense}
              on={(v) => setForm({ ...form, expense: v })}
              className="font-mono tabular-nums font-bold text-rose-700 bg-rose-50/40 border-rose-200"
            />

            <div className="flex items-end gap-2">
              <button
                type="button"
                onClick={submit}
                className="flex-1 flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-xl font-black text-xs sm:text-sm text-white bg-gradient-to-r from-emerald-600 to-teal-700 shadow-md shadow-emerald-600/25 hover:shadow-lg active:scale-95 transition-all"
              >
                <Save className="w-4 h-4" />
                <span>ترحيل القيد</span>
              </button>
              <button
                type="button"
                onClick={() => setForm(emptyForm)}
                className="flex items-center justify-center gap-1 py-2.5 px-3 rounded-xl font-bold text-xs sm:text-sm text-slate-700 bg-slate-100 hover:bg-slate-200 border border-slate-300 transition-all"
              >
                <Eraser className="w-4 h-4 text-slate-500" />
                <span>مسح</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ===== جدول كشف الحساب الجاري المالي مع الإجماليات ===== */}
<div className="accounts-print-area w-full rounded-2xl overflow-hidden border shadow-sm" style={{ background: "#fff", borderColor: "rgba(0,0,0,0.08)" }}>
        <div className="accounts-print-hide px-2 py-2 sm:px-5 sm:py-3.5 flex flex-col sm:flex-row justify-between items-stretch sm:items-center flex-wrap gap-2 border-b" style={{ background: THEME.cream, borderColor: "rgba(0,0,0,0.06)" }}>
          <div className="flex items-center gap-2.5">
            <div className="w-2 h-2 rounded-full bg-[#1E8E5A] animate-pulse"></div>
            <h2 className="text-xs sm:text-sm font-black text-[#0f2f44] tracking-wide">
              سجل حركات الحساب الجاري ({accounts.length})
            </h2>
          </div>
          <div className="grid grid-cols-2 sm:flex gap-1 sm:gap-2 w-full sm:w-auto">
            {Object.values(filters).some(Boolean) && (
              <button
                onClick={clearFilters}
                className="px-2 py-1 bg-black/5 hover:bg-black/10 text-[#0f2f44] rounded-full text-xs font-bold transition-colors"
              >
                مسح مرشحات التصفية
              </button>
            )}
            <TabActions
              title="كشف الحساب الجاري"
              rows={filteredWithBalance}
              columns={COLS.filter((c) => c.key !== "revenueKey")}
              fileName="الحساب-الجاري"
              numericKeys={["hafizaAmount", "income", "expense", "balance"]}
              pdfLayout="wide-centered"
              onClear={clearAccounts}
              className="col-span-2 w-full"
            />
          </div>
        </div>

        <div className="p-1.5 sm:p-3">
          <div className="overflow-x-auto overflow-y-auto max-h-[72vh] relative rounded-xl">
            <table className="min-w-max table-auto text-xm xm:text-base text-center font-semibold border-collapse border-2 border-black">
              <thead className="sticky top-0 z-20 text-[#0f2f44] font-black text-[16px]" style={{ background: THEME.warmCream }}>
                <tr>
                  <th className="border border-black text-center w-10 sticky top-0 z-20 px-1 py-1.5 sm:px-2 sm:py-2 text-sm whitespace-nowrap">م</th>
                  {COLS.map((c) => (
                    <th
                      key={c.key}
                      className="border border-black cursor-pointer hover:bg-[#cfe4ef] transition-colors select-none sticky top-0 z-20 px-1 py-1.5 sm:px-2 sm:py-2 text-sm"
                      onClick={() => toggleSort(c.key)}
                    >
                      <div className="flex items-center justify-center gap-1.5">
                        <span>{c.label}</span>
                        <span className="text-[14px] text-[#1f5f7a] font-mono">
                          {sortIndicator(sortKey === c.key, sortDir)}
                        </span>
                      </div>
                    </th>
                  ))}
                  <th className="border border-black text-center sticky top-0 z-20 px-1 py-1.5 sm:px-2 sm:py-2 text-sm whitespace-nowrap">إجراءات</th>
                </tr>
                <tr className="accounts-print-hide" style={{ background: THEME.cream }}>
                  <th className="border border-black px-1 py-1.5 sm:px-2 sm:py-2 text-sm whitespace-nowrap"></th>
                  {COLS.map((c) => (
                    <th key={c.key} className="border border-black px-1 py-1.5 sm:px-2 sm:py-2 text-sm whitespace-nowrap">
                      <input
                        value={filters[c.key] || ""}
                        onChange={(e) => setFilter(c.key, e.target.value)}
                        placeholder="تصفية..."
                        className="w-16 min-w-0 max-w-[50px] px-1 py-1 text-xs border rounded bg-white text-[#0f2f44] outline-none focus:border-[#0f2f44] font-bold transition-colors"
                      />
                    </th>
                  ))}
                  <th className="border border-black px-1 py-1.5 sm:px-2 sm:py-2 text-sm whitespace-nowrap"></th>
                </tr>
              </thead>

              <tbody className="text-[#0f2f44] font-bolder">
                {filteredWithBalance.length === 0 ? (
                  <tr>
                    <td
                      colSpan={COLS.length + 2}
                      className="text-center font-black border border-black bg-white px-1 py-1.5 sm:px-2 sm:py-2 text-sm whitespace-nowrap"
                    >
                      لا توجد بيانات تطابق مرشحات البحث.
                    </td>
                  </tr>
                ) : (
                  filteredWithBalance.map((acc, index) => (
                    <tr key={acc.id} className="odd:bg-white even:bg-[#f4fafd] hover:bg-[#e3f0f7] transition-colors group">
                      <td className="border border-black text-center font-mono tabular-nums numeric-cell px-1 py-1.5 sm:px-2 sm:py-2 text-xm sm:text-base whitespace-nowrap">
                        {index + 1}
                      </td>
                      <td className="border border-black font-mono tabular-nums numeric-cell text-center px-1 py-1.5 sm:px-2 sm:py-2 text-sm whitespace-nowrap">
                        {acc.date}
                      </td>
                      <td className="border border-black font-mono tabular-nums numeric-cell font-black text-center px-1 py-1.5 sm:px-2 sm:py-2 text-sm whitespace-nowrap">
                        {acc.hafizaNo || "—"}
                      </td>
                      <td className="border border-black font-mono tabular-nums numeric-cell text-center px-1 py-1.5 sm:px-2 sm:py-2 text-sm whitespace-nowrap">
                        {acc.notifyNo || "—"}
                      </td>
                      <td className="border border-black font-mono tabular-nums numeric-cell text-center px-1 py-1.5 sm:px-2 sm:py-2 text-sm whitespace-nowrap">
                        {acc.notifyDate || "—"}
                      </td>
                      <td className="border border-black font-mono tabular-nums numeric-cell text-center px-1 py-1.5 sm:px-2 sm:py-2 text-sm whitespace-nowrap">
                        {acc.checkNo || "—"}
                      </td>
                      <td className="border border-black font-mono tabular-nums numeric-cell text-center px-1 py-1.5 sm:px-2 sm:py-2 text-sm whitespace-nowrap">
                        {acc.checkDate || "—"}
                      </td>
                      <td className="border border-black px-1 py-1.5 sm:px-2 sm:py-2 text-sm whitespace-nowrap">
                        {acc.description || "—"}
                      </td>
                      <td className="border border-black px-1 py-1.5 sm:px-2 sm:py-2 text-sm whitespace-nowrap">
                        {acc.specialty || "—"}
                      </td>
                      <td className="border border-black font-black px-1 py-1.5 sm:px-2 sm:py-2 text-sm whitespace-nowrap">
                        {acc.name || "—"}
                      </td>
                      <td className="border border-black font-mono tabular-nums numeric-cell text-center px-1 py-1.5 sm:px-2 sm:py-2 text-sm whitespace-nowrap">
                        {Number(acc.hafizaAmount) > 0 ? fmt(Number(acc.hafizaAmount)) : "—"}
                      </td>
                      <td className="border border-black font-mono tabular-nums numeric-cell font-black text-center bg-[#1E8E5A]/[0.06] px-1 py-1.5 sm:px-2 sm:py-2 text-sm whitespace-nowrap">
                        {Number(acc.income) > 0 ? fmt(Number(acc.income)) : "—"}
                      </td>
                      <td className="border border-black font-mono tabular-nums numeric-cell font-black text-center bg-[#D14343]/[0.06] px-1 py-1.5 sm:px-2 sm:py-2 text-sm whitespace-nowrap">
                        {Number(acc.expense) > 0 ? fmt(Number(acc.expense)) : "—"}
                      </td>

                      <td className="accounts-print-hide border border-black text-center px-1 py-1.5 sm:px-2 sm:py-2 text-sm whitespace-nowrap">
                        <select
                          value={acc.revenueKey || ""}
                          onChange={(e) => {
                            const newKey = e.target.value;
                            updateAccount(acc.id, { ...acc, revenueKey: newKey || undefined });
                            toast.success("تم ربط رمز الإيراد بنجاح");
                          }}
                          className="w-full p-1 text-[13px] font-black text-[#7C3AED] bg-[#7C3AED]/5 border rounded outline-none focus:border-[#7C3AED] cursor-pointer"
                        >
                          <option value="">— ربط الرمز —</option>
                          {revenueTypes.map((t) => (
                            <option key={t.key} value={t.key}>
                              {t.key}
                            </option>
                          ))}
                        </select>
                      </td>

                      <td className="border border-black font-mono tabular-nums numeric-cell font-black text-center bg-[#1f5f7a]/[0.06] px-1 py-1.5 sm:px-2 sm:py-2 text-sm whitespace-nowrap">
                        {fmt(acc.balance)}
                      </td>
                      <td className="accounts-print-hide border border-black text-center px-1 py-1.5 sm:px-2 sm:py-2 text-sm whitespace-nowrap">
                        <div className="flex justify-center gap-1.5">
                          <button
                            onClick={() => setEditingRow(acc)}
                            className="p-2 text-[#1E8E5A] hover:bg-[#1E8E5A]/10 rounded transition-colors"
                            aria-label="تعديل"
                          >
                            <Edit className={ICON_MOBILE} />
                          </button>
                          <button
                            onClick={() => {
                              if (confirm("هل أنت متأكد من الحذف؟")) deleteAccount(acc.id);
                            }}
                            className="p-2 text-[#D14343] hover:bg-[#D14343]/10 rounded transition-colors"
                            aria-label="حذف"
                          >
                            <Trash2 className={ICON_MOBILE} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
              {filteredWithBalance.length > 0 && (
                <tfoot>
<tr className="bg-[#E7E2D8]">
<td colSpan={10} className="border border-black text-right font-black px-1 py-1.5 sm:px-2 sm:py-2 text-sm whitespace-nowrap">
الاجمــــــــالي: 
                    </td>
                    <td className="border border-black font-mono tabular-nums numeric-cell font-black text-center px-1 py-1.5 sm:px-2 sm:py-2 text-sm whitespace-nowrap">
                      {fmt(totalIncome)}
                    </td>
                    <td className="border border-black font-mono tabular-nums numeric-cell font-black text-center px-1 py-1.5 sm:px-2 sm:py-2 text-sm whitespace-nowrap">
                      {fmt(totalExpense)}
                    </td>
                    <td className="border border-black px-1 py-1.5 sm:px-2 sm:py-2 text-sm whitespace-nowrap"></td>
                    <td className="border border-black font-mono tabular-nums numeric-cell font-black text-center bg-[#1f5f7a]/10 px-1 py-1.5 sm:px-2 sm:py-2 text-sm whitespace-nowrap">
                      {fmt(currentBalance)}
                    </td>
                    <td className="accounts-print-hide border border-black px-1 py-1.5 sm:px-2 sm:py-2 text-sm whitespace-nowrap"></td>
                  </tr>
                </tfoot>
              )}
            </table>
          </div>
        </div>
      </div>

      {/* مودال التعديل */}
      <Modal
        title="تعديل وتدقيق السجل المالي"
        isOpen={!!editingRow}
        onClose={() => setEditingRow(null)}
      >
        {editingRow && (
          <form onSubmit={handleEditSave} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-black text-[#0f2f44]/70 mb-1 tracking-wide">التاريخ</label>
                <input
                  type="date"
                  value={editingRow.date}
                  onChange={(e) => setEditingRow({ ...editingRow, date: e.target.value })}
                  className="w-full p-2 text-[15px] border rounded-xl outline-none bg-white text-[#0f2f44] font-bold focus:border-[#0f2f44]"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-black text-[#0f2f44]/70 mb-1 tracking-wide">رقم الحافظة</label>
                <input
                  value={editingRow.hafizaNo}
                  onChange={(e) => setEditingRow({ ...editingRow, hafizaNo: e.target.value })}
                  className="w-full p-2 text-[15px] border rounded-xl outline-none bg-white text-[#0f2f44] font-bold focus:border-[#0f2f44]"
                />
              </div>
              <div>
                <label className="block text-sm font-black text-[#0f2f44]/70 mb-1 tracking-wide">رقم الإشعار</label>
                <input
                  value={editingRow.notifyNo}
                  onChange={(e) => setEditingRow({ ...editingRow, notifyNo: e.target.value })}
                  className="w-full p-2 text-[15px] border rounded-xl outline-none bg-white text-[#0f2f44] font-bold focus:border-[#0f2f44]"
                />
              </div>
              <div>
                <label className="block text-sm font-black text-[#0f2f44]/70 mb-1 tracking-wide">تاريخ التوريد</label>
                <input
                  type="date"
                  value={editingRow.notifyDate}
                  onChange={(e) => setEditingRow({ ...editingRow, notifyDate: e.target.value })}
                  className="w-full p-2 text-[15px] border rounded-xl outline-none bg-white text-[#0f2f44] font-bold focus:border-[#0f2f44]"
                />
              </div>
              <div className="sm:col-span-2">
                <label className="block text-sm font-black text-[#0f2f44]/70 mb-1 tracking-wide">البيان والشرح</label>
                <input
                  value={editingRow.description}
                  onChange={(e) => setEditingRow({ ...editingRow, description: e.target.value })}
                  className="w-full p-2 text-[15px] border rounded-xl outline-none bg-white text-[#0f2f44] font-bold focus:border-[#0f2f44]"
                />
              </div>
              <div>
                <label className="block text-sm font-black text-[#0f2f44]/70 mb-1 tracking-wide">الاسم</label>
                <input
                  value={editingRow.name}
                  onChange={(e) => setEditingRow({ ...editingRow, name: e.target.value })}
                  className="w-full p-2 text-[15px] border rounded-xl outline-none bg-white text-[#0f2f44] font-bold focus:border-[#0f2f44]"
                />
              </div>
              <div>
                <label className="block text-sm font-black text-[#0f2f44]/70 mb-1 tracking-wide">مبلغ الحافظة</label>
                <input
                  type="number"
                  value={editingRow.hafizaAmount}
                  onChange={(e) => setEditingRow({ ...editingRow, hafizaAmount: e.target.value })}
                  className="w-full p-2 text-[15px] border rounded-xl outline-none bg-white text-[#0f2f44] font-bold focus:border-[#0f2f44] font-mono tabular-nums numeric-cell"
                />
              </div>
              <div>
                <label className="block text-sm font-black text-[#1E8E5A] mb-1 tracking-wide">الإيرادات</label>
                <input
                  type="number"
                  value={editingRow.income}
                  onChange={(e) => setEditingRow({ ...editingRow, income: e.target.value })}
                  className="w-full p-2 text-[15px] border rounded-xl bg-[#1E8E5A]/5 text-[#1E8E5A] font-black outline-none focus:border-[#1E8E5A] font-mono tabular-nums numeric-cell"
                />
              </div>
              <div>
                <label className="block text-sm font-black text-[#D14343] mb-1 tracking-wide">المصروفات</label>
                <input
                  type="number"
                  value={editingRow.expense}
                  onChange={(e) => setEditingRow({ ...editingRow, expense: e.target.value })}
                  className="w-full p-2 text-[15px] border rounded-xl bg-[#D14343]/5 text-[#D14343] font-black outline-none focus:border-[#D14343] font-mono tabular-nums numeric-cell"
                />
              </div>
            </div>
            <div className="flex justify-end gap-3 pt-4 border-t" style={{ borderColor: "rgba(0,0,0,0.06)" }}>
              <button
                type="button"
                onClick={() => setEditingRow(null)}
                className="px-4 py-2 bg-black/5 text-[#0f2f44] rounded-xl font-bold text-sm hover:bg-black/10"
              >
                إلغاء
              </button>
              <button
                type="submit"
                className="px-5 py-2 bg-[#0f2f44] text-white rounded-xl font-black text-sm hover:bg-[#2A2521]"
              >
                حفظ التعديلات
              </button>
            </div>
          </form>
        )}
      </Modal>
    </div>
  );
}