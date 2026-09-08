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

/* ============================================================
   الحساب الجاري — لوحة ألوان مخصصة لكل كرت وبدون تكرار مع حدود سوداء
   ============================================================ */

/* أحجام أيقونات وأزرار محسّنة للمحمول */
const ICON_MOBILE = "w-5 h-5 sm:w-6 sm:h-6";
const BTN_MOBILE = "px-3 py-2 sm:px-4 sm:py-2.5 text-sm sm:text-sm";
const HEADING_MOBILE = "text-lg sm:text-2xl font-black";

/* أعمدة الجدول */
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

const parseAmount = (val: any): number => {
  if (val === undefined || val === null || val === "") return 0;
  if (typeof val === "number") return val;
  const cleanString = String(val).replace(/[^\d.-]/g, "");
  const parsed = parseFloat(cleanString);
  return isNaN(parsed) ? 0 : parsed;
};

/* أنماط الطباعة والالتفاف التلقائي للنصوص داخل الخلايا */
const PRINT_STYLES = `
@media print {
  .accounts-print-scope { background:#B4CEB6 !important; }
  .accounts-print-area, .accounts-print-area * { visibility: visible !important; }
  .accounts-print-hide { display: none !important; }
  .accounts-print-area table {
    border-collapse: collapse !important;
    width: 100% !important;
    min-width:auto !important;
    table-layout:auto!important;
  }
  .accounts-print-area thead th {
    color: white!important;
    font-weight: 1000 !important;
  }
  .accounts-print-area tbody td,
  .accounts-print-area tfoot td {
    color: #000 !important;
    font-weight: 800 !important;
  }
  .accounts-print-area th,
  .accounts-print-area td {
    border: 1px solid #000 !important;
    white-space: normal !important;
    overflow-wrap: anywhere !important;
    word-break: break-word !important;
    hyphens: auto !important;
    line-height: 1.1 !important;
    padding: 2px !important;
    font-size: 14px !important;
    height: auto !important;
    max-width: 100% !important;
    color: #000 !important;
  }
}
`;

const Modal = ({
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
      className="fixed inset-0 backdrop-blur-sm flex items-end sm:items-center justify-center z-50 p-2 sm:p-4"
      dir="rtl"
    >
      <div className="rounded-t-2xl sm:rounded-2xl w-full max-w-2xl shadow-2xl max-h-[90vh] overflow-y-auto border-2 border-black bg-[#fdfbf7]">
        <div className="flex justify-between items-center px-5 py-4 border-b-2 border-black bg-[#4a2e35] text-white top-0 z-10">
          <h3 className={`${HEADING_MOBILE} flex items-center gap-2 tracking-tight`}>{title}</h3>
          <button
            onClick={onClose}
            className="p-2 hover:bg-black/20 rounded-xl transition-colors text-white"
            aria-label="إغلاق"
          >
            <X className={ICON_MOBILE} />
          </button>
        </div>
        <div className="p-5">{children}</div>
      </div>
    </div>
  );
};

function Field({
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
      <label className="block text-sm font-black text-white mb-1.5 mr-0.5 tracking-wide">
        {label}
      </label>
      <div className="relative flex items-center">
        {icon && <span className="absolute right-3 z-10">{icon}</span>}
        <input
          type={type}
          value={v}
          onChange={(e) => on(e.target.value)}
          placeholder={placeholder}
          className={`w-full ${icon ? "pr-9" : "px-3"} pl-3 py-2 text-[15px] border-2 border-black rounded-xl outline-none focus:ring-2 focus:ring-black/20 bg-white text-[#0f2f44] font-bold ${className}`}
        />
      </div>
    </div>
  );
}

function LedgerStat({
  label,
  value,
  tone,
  icon,
  style,
}: {
  label: string;
  value: number;
  tone: "income" | "expense" | "balance";
  icon: React.ReactNode;
  style?: React.CSSProperties;
}) {
  return (
    <div
      className="relative rounded-2xl px-3 py-3 sm:px-4 sm:py-4 border-2 border-black shadow-md transition-transform hover:scale-[1.01]"
      style={style}
    >
      <div className="flex items-center justify-between">
        <div>
          <span className="text-xs sm:text-sm font-black text-white/90 tracking-wide drop-shadow-sm">{label}</span>
          <div className="text-base sm:text-2xl font-black font-mono tabular-nums numeric-cell mt-1 sm:mt-1.5 text-white drop-shadow-sm">
            {fmt(value)}
          </div>
        </div>
        <div className="p-2.5 rounded-xl flex items-center justify-center bg-black/20 border border-black/30 text-white shadow-inner">
          {React.isValidElement(icon) ? React.cloneElement(icon as any, { className: ICON_MOBILE }) : icon}
        </div>
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
  const [editingRow, setEditingRow] = useState<any | null>(null);

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
    });
    toast.success("تم تعديل السجل بنجاح");
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

  const accountEntryWebActions: WebActionItem[] = [
    {
      label: "مطابقة شاملة ٢٠٢٦",
      icon: Zap,
      onSelect: handleSyncFromHafiza,
    },
    {
      label: "استيراد Excel",
      icon: FileSpreadsheet,
      onSelect: () => undefined,
      content: (
        <label className="flex w-full relative cursor-pointer items-center gap-2 rounded-lg px-3 py-2 text-sm font-semibold text-white bg-[#5c2a1a] border-2 border-black shadow-sm hover:bg-[#4a1a0a] transition-all duration-200">
          <FileSpreadsheet className={`${ICON_MOBILE} text-white`} />
          <span>استيراد Excel</span>
          <input
            type="file"
            accept=".xlsx, .xls, .csv"
            onChange={handleImportExcel}
            className="absolute h-0 w-0 opacity-0 overflow-hidden"
          />
        </label>
      ),
    },
  ];

  return (
    <div
      className="accounts-print-scope sheet-tabs-ui apk-tabs-ui w-full space-y-4 p-1.5 sm:p-4 rounded-2xl"
      dir="rtl"
    >
      <style>{PRINT_STYLES}</style>

      {/* شريط العنوان - كرت 1 (لون: عنابي ملكي) */}
      <div className="accounts-print-hide flex items-center justify-between border-2 border-black p-4 rounded-2xl bg-[#4a2e35] shadow-lg">
        <div>
          <h1 className={`${HEADING_MOBILE} text-white tracking-tight`}>
            الحساب الجاري
          </h1>
          <p className="text-xs text-[#f3e5ab] font-bold tracking-wide mt-0.5">
            سجل الحركات المالية المُرحّلة
          </p>
        </div>

        <div className="hidden sm:flex items-center gap-2 px-3.5 py-2 rounded-xl bg-[#2a1b20] border-2 border-black shadow-sm text-white">
          <Landmark className={`${ICON_MOBILE} text-[#f3e5ab]`} />
          <span className="text-sm font-bold">عدد القيود:</span>
          <span className="font-mono text-base tabular-nums font-black text-[#f3e5ab]">{accounts.length}</span>
        </div>
      </div>
{/* ===== بطاقا
ت الإجماليا
(كرت 2, 3, 4 بألوان مختلفة كلياً وبدونتكرار وبحدود سوداء) ===== */}
      <div className="accounts-print-hide grid grid-cols-2 sm:grid-cols-2 gap-2">
        {/* إجمالي الإيرادات (أخضر زمردي داكن) */}
        <LedgerStat
          label="إجمالي الإيرادات"
          style={{ background: "#1b4d3e" }}
          value={totalIncome}
          tone="income"
          icon={<ArrowUpRight className="text-white" />}
        />

        {/* إجمالي المصروفات (أحمر قرمزي داكن) */}
        <LedgerStat
          label="إجمالي المصروفات"
          style={{ background: "#5c1d24" }}
          value={totalExpense}
          tone="expense"
          icon={<ArrowDownLeft className="text-white" />}
        />

        {/* الرصيد الحالي (أزرق بحري داكن) */}
        <LedgerStat
          label="الرصيد الحالي"
          style={{ background: "#1b365d" }}
          value={currentBalance}
          tone="balance"
          icon={<Wallet className="text-white" />}
        />
      </div>

      {/* ===== التقارير الدورية (كرت 5 بلون برونزي / خشبي دافئ) ===== */}
      <div
        className="accounts-print-hide w-full rounded-2xl overflow-hidden border-2 border-black shadow-md bg-[#614529]"
      >
        <div
          className="px-4 py-3.5 flex flex-wrap justify-between items-center gap-3 border-b-2 border-black bg-[#4e341f]"
        >
          <div>
            <h2 className="text-base font-black text-white tracking-wide">
              تقارير الحساب الدورية
            </h2>
            <p className="text-xs text-[#f3e5ab] font-bold mt-0.5">
              اختر الربع أو النصف أو السنة ثم صدّر التقرير
            </p>
          </div>

          <div className="flex flex-wrap items-end gap-2 text-center">
            <label className="text-xs font-black text-white">
              نوع التقرير
              <select
                value={accountReportMode}
                onChange={(e) => {
                  const nextMode = e.target.value as "quarter" | "halfYear" | "year";
                  setAccountReportMode(nextMode);
                  setAccountReportPeriod(1);
                }}
                className="block mt-1 px-2 py-2 border-2 border-black bg-white text-[#0f2f44] text-xs font-bold rounded-lg outline-none"
              >
                <option value="quarter">ربع سنوي</option>
                <option value="halfYear">نصف سنوي</option>
                <option value="year">سنوي</option>
              </select>
            </label>

            {accountReportMode !== "year" && (
              <label className="text-xs font-black text-white">
                الفترة
                <select
                  value={accountReportPeriod}
                  onChange={(e) => setAccountReportPeriod(Number(e.target.value))}
                  className="block mt-1 px-3 py-2 border-2 border-black bg-white text-[#0f2f44] text-xs font-bold rounded-lg outline-none"
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
              </label>
            )}

            <label className="text-xs font-black text-white">
              السنة
              <input
                type="number"
                value={accountReportYear}
                onChange={(e) => setAccountReportYear(Number(e.target.value) || accountReportYear)}
                className="block mt-1 w-24 px-2 py-2 border-2 border-black bg-white text-[#0f2f44] text-xs font-bold font-mono text-center rounded-lg outline-none"
              />
            </label>

            <div className="text-xs font-black text-[#4e341f] px-3 py-2.5 bg-[#f3e5ab] rounded-lg border-2 border-black">
              {accountReportLabel}
            </div>

            <TabActions
              title={`تقرير الحساب الجاري - ${accountReportLabel}`}
              rows={accountReportRows}
              columns={COLS.filter((c) => c.key !== "revenueKey")}
              fileName={`الحساب-الجاري-${accountReportYear}`}
              numericKeys={["hafizaAmount", "income", "expense", "balance"]}
              pdfLayout="wide-centered"
            />
          </div>
        </div>
      </div>

      {/* ===== لوحة القيد اليدوي والمطابقة (كرت 6 بلون رمادي فولاذي / بترولي داكن) ===== */}
      <div
        className="accounts-print-hide w-full rounded-2xl overflow-hidden border-2 border-black shadow-md bg-[#233d4d]"
      >
        <div
          className="px-4 py-3.5 flex flex-wrap justify-between items-center gap-3 border-b-2 border-black bg-[#1b303c]"
        >
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-lg border-2 border-black bg-[#12222b] text-white">
              <Plus className={ICON_MOBILE} />
            </div>
            <h2 className="text-xl sm:text-base font-black tracking-wide text-white">
              قيد جديد أو ترحيل مطابقة من الحوافظ
            </h2>
          </div>

          <div className="web-only-actions">
            <WebActionMenu
              label="إجراءات الإدخال والمطابقة"
              actions={accountEntryWebActions}
            />
          </div>

          <div className="apk-only-actions flex items-center gap-2.5 flex-wrap">
            <button
              onClick={handleSyncFromHafiza}
              className={`${BTN_MOBILE} flex items-center justify-center gap-2 rounded-full font-black border-2 border-black shadow-sm transition-all bg-[#fe7f2d] text-white hover:bg-[#e06d22]`}
            >
              <Zap className={`${ICON_MOBILE} text-white`} />
              <span className="text-sm">مطابقة شاملة ٢٠٢٦</span>
            </button>

            <label
              className={`${BTN_MOBILE} relative flex items-center justify-center gap-2 rounded-full border-2 border-black px-3 py-2 cursor-pointer font-black shadow-sm bg-[#33658a] text-white hover:bg-[#28506f]`}
            >
              <FileSpreadsheet className={`${ICON_MOBILE} text-white`} />
              <span>استيراد إكسل</span>
              <input
                type="file"
                accept=".xlsx, .xls, .csv"
                onChange={handleImportExcel}
                className="absolute h-0 w-0 opacity-0 overflow-hidden"
              />
            </label>
          </div>
        </div>

        <div className="p-3 sm:p-5">
          <div className="grid grid-cols-2 sm:grid-cols-2 gap-2 items-end">
            <Field
              label="التاريخ"
              type="date"
              icon={<Calendar className={`${ICON_MOBILE} text-[#233d4d]`} />}
              v={form.date}
              on={(v) => setForm({ ...form, date: v })}
            />
            <Field
              label="رقم الحافظة"
              icon={<Hash className={`${ICON_MOBILE} text-[#233d4d]`} />}
              v={form.hafizaNo}
              on={(v) => setForm({ ...form, hafizaNo: v })}
              placeholder="رقم الحافظة..."
            />
            <Field
              label="رقم الإشعار"
              icon={<Hash className={`${ICON_MOBILE} text-[#233d4d]`} />}
              v={form.notifyNo}
              on={(v) => setForm({ ...form, notifyNo: v })}
              placeholder="رقم الإشعار..."
            />
            <Field
              label="تاريخ التوريد"
              type="date"
              icon={<Calendar className={`${ICON_MOBILE} text-[#233d4d]`} />}
              v={form.notifyDate}
              on={(v) => setForm({ ...form, notifyDate: v })}
            />
            <Field
              label="رقم الشيك"
              icon={<Ticket className={`${ICON_MOBILE} text-[#233d4d]`} />}
              v={form.checkNo}
              on={(v) => setForm({ ...form, checkNo: v })}
              placeholder="رقم الشيك..."
            />
            <Field
              label="تاريخ الشيك"
              type="date"
              icon={<Calendar className={`${ICON_MOBILE} text-[#233d4d]`} />}
              v={form.checkDate}
              on={(v) => setForm({ ...form, checkDate: v })}
            />
            <div className="sm:col-span-2">
              <label className="block text-sm font-black text-white mb-1.5 mr-0.5 tracking-wide">
                البيان والشرح
              </label>
              <div className="relative flex items-center">
                <span className="absolute right-3 z-10">
                  <FileText className={`${ICON_MOBILE} text-[#233d4d]`} />
                </span>
                <input
                  list="account-descriptions"
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  placeholder="اكتب أو اختر البيان..."
                  className="w-full pr-9 pl-3 py-2 text-[15px] border-2 border-black rounded-xl outline-none shadow-sm bg-white text-[#0f2f44] font-bold"
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

            <Field
              label="التخصص الطبي"
              icon={<Stethoscope className={`${ICON_MOBILE} text-[#233d4d]`} />}
              v={form.specialty}
              on={(v) => setForm({ ...form, specialty: v })}
              placeholder="التخصص..."
            />
            <Field
              label="الاسم الكامل"
              icon={<User className={`${ICON_MOBILE} text-[#233d4d]`} />}
              v={form.name}
              on={(v) => setForm({ ...form, name: v })}
              placeholder="اسم المتدرب..."
            />

            <Field
              label="مبلغ الحافظة"
              type="number"
              icon={<span className="text-xs text-[#233d4d] font-black">ر.ي</span>}
              v={form.hafizaAmount}
              on={(v) => setForm({ ...form, hafizaAmount: v })}
              placeholder="0.00"
            />
            <Field
              label="الإيرادات"
              type="number"
              icon={<span className="text-xs text-[#233d4d] font-black">ر.ي</span>}
              v={form.income}
              on={(v) => setForm({ ...form, income: v })}
              placeholder="0.00"
            />
            <Field
              label="المصروفات"
              type="number"
              icon={<span className="text-xs text-[#233d4d] font-black">ر.ي</span>}
              v={form.expense}
              on={(v) => setForm({ ...form, expense: v })}
              placeholder="0.00"
            />

            <div className="sm:col-span-2">
              <label className="flex items-center gap-1 text-sm font-black text-white mb-1.5 mr-0.5 tracking-wide">
                <Link className={`${ICON_MOBILE} text-[#f3e5ab]`} /> ربط بدليل هيكل الإيرادات
              </label>
              <select
                value={form.revenueKey}
                onChange={(e) => setForm({ ...form, revenueKey: e.target.value })}
                className="w-full px-2 py-2 text-[15px] border-2 border-black rounded-xl outline-none shadow-sm bg-white text-[#0f2f44] font-bold"
              >
                <option value="">-- بدون ربط --</option>
                {revenueTypes.map((t) => (
                  <option key={t.key} value={t.key}>
                    {t.key} | {t.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="flex gap-2 pt-3 mt-3 border-t-2 border-black">
            <button
              onClick={submit}
              className={`${BTN_MOBILE} flex-0 flex items-center justify-center gap-2 rounded-xl font-black border-2 border-black shadow-sm transition-all bg-[#2a9d8f] text-white hover:bg-[#21867a]`}
            >
              <Save className={`${ICON_MOBILE} text-white`} /> <span>ترحيل القيد</span>
            </button>
            <button
              onClick={() => setForm(emptyForm)}
              className={`${BTN_MOBILE} flex items-center justify-center gap-2 rounded-xl border-2 border-black font-black shadow-sm transition-all bg-[#e76f51] text-white hover:bg-[#d55f41]`}
            >
              <Eraser className={`${ICON_MOBILE} text-white`} /> <span>مسح</span>
            </button>
          </div>
        </div>
      </div>

      {/* ===== جدول القيود (كرت 7 بلون أبيض ناصع مع حدود سوداء وتنسيق الالتفاف التلقائي للخلايا) ===== */}
      <div className="accounts-print-area w-full rounded-2xl overflow-hidden border-2 border-black shadow-md bg-white">
        <div className="accounts-print-hide px-3 py-3 flex flex-col sm:flex-row justify-between items-stretch sm:items-center flex-wrap gap-2 border-b-2 border-black bg-[#f4f1ea]">
          <div className="flex items-center gap-2.5">
            <div className="w-3 h-3 rounded-full bg-[#2a9d8f] animate-pulse border border-black"></div>
            <h2 className="text-xs sm:text-sm font-black text-[#0f2f44] tracking-wide">
              سجل حركات الحساب الجاري ({accounts.length})
            </h2>
          </div>
          <div className="grid grid-cols-2 sm:flex gap-1 sm:gap-2 w-full sm:w-auto">
            {Object.values(filters).some(Boolean) && (
              <button
                onClick={clearFilters}
                className="px-2 py-1 bg-black/10 hover:bg-black/20 text-[#0f2f44] rounded-full text-xs font-bold transition-colors"
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
              className="col-span-2 w-auto"
            />
          </div>
        </div>

        <div className="p-1.5 sm:p-3">
          <div className="overflow-x-auto overflow-y-auto max-h-[72vh] relative rounded-xl border border-black">
            <table className="w-full table-auto text-sm text-center font-semibold border-collapse border-2 border-black">
              <thead className="sticky top-0 z-20 text-white font-black text-[15px] bg-[#343a40]">
                <tr>
                  <th className="border-2 border-black text-center w-auto sticky top-0 z-20 px-2 py-2 whitespace-nowrap">م</th>
                  {COLS.map((c) => (
                    <th
                      key={c.key}
                      className="border-2 border-black cursor-pointer hover:bg-black/20 transition-colors select-none sticky top-0 z-20 px-2 py-2"
                      onClick={() => toggleSort(c.key)}
                    >
                      <div className="flex items-center justify-center gap-1.5">
                        <span>{c.label}</span>
                        <span className="text-[13px] text-[#f3e5ab] font-mono">
                          {sortIndicator(sortKey === c.key, sortDir)}
                        </span>
                      </div>
                    </th>
                  ))}
                  <th className="border-2 border-black text-center sticky top-0 z-20 px-2 py-2 whitespace-nowrap">إجراءات</th>
                </tr>
                <tr className="accounts-print-hide bg-[#e9ecef]">
                  <th className="border-2 border-black px-1 py-1.5 whitespace-nowrap"></th>
                  {COLS.map((c) => (
                    <th key={c.key} className="border-2 border-black px-1.5 py-1.5">
                      <input
                        value={filters[c.key] || ""}
                        onChange={(e) => setFilter(c.key, e.target.value)}
                        placeholder="تصفية..."
                        className="w-full min-w-[70px] px-2 py-1 text-xs border-2 border-black rounded bg-white text-[#0f2f44] outline-none font-bold"
                      />
                    </th>
                  ))}
                  <th className="border-2 border-black px-1.5 py-1.5"></th>
                </tr>
              </thead>

              <tbody className="text-[#0f2f44] font-bold">
                {filteredWithBalance.length === 0 ? (
                  <tr>
                    <td
                      colSpan={COLS.length + 2}
                      className="text-center font-black border-2 border-black bg-white px-2 py-4 text-sm"
                    >
                      لا توجد بيانات تطابق مرشحات البحث.
                    </td>
                  </tr>
                ) : (
                  filteredWithBalance.map((acc, index) => (
                    <tr key={acc.id} className="odd:bg-white even:bg-[#f8f9fa] hover:bg-[#e2ece9] transition-colors group">
                      <td className="border border-black text-center font-mono tabular-nums px-2 py-2 text-sm whitespace-nowrap">
                        {index + 1}
                      </td>
                      <td className="border border-black font-mono tabular-nums text-center px-2 py-2 text-sm whitespace-nowrap">
                        {acc.date}
                      </td>
                      <td className="border border-black font-mono tabular-nums font-black text-center px-2 py-2 text-sm whitespace-nowrap">
                        {acc.hafizaNo || "—"}
                      </td>
                      <td className="border border-black font-mono tabular-nums text-center px-2 py-2 text-sm whitespace-nowrap">
                        {acc.notifyNo || "—"}
                      </td>
                      <td className="border border-black font-mono tabular-nums text-center px-2 py-2 text-sm whitespace-nowrap">
                        {acc.notifyDate || "—"}
                      </td>
                      <td className="border border-black font-mono tabular-nums text-center px-2 py-2 text-sm whitespace-nowrap">
                        {acc.checkNo || "—"}
                      </td>
                      <td className="border border-black font-mono tabular-nums text-center px-2 py-2 text-sm whitespace-nowrap">
                        {acc.checkDate || "—"}
                      </td>
                      <td className="border border-black px-3 py-2 text-sm text-right whitespace-normal break-words max-w-[220px]">
                        {acc.description || "—"}
                      </td>
                      <td className="border border-black px-3 py-2 text-sm text-right whitespace-normal break-words max-w-[150px]">
                        {acc.specialty || "—"}
                      </td>
                      <td className="border border-black px-3 py-2 text-sm font-black text-right whitespace-normal break-words max-w-[150px]">
                        {acc.name || "—"}
                      </td>
                      <td className="border border-black font-mono tabular-nums text-center px-2 py-2 text-sm whitespace-nowrap">
                        {Number(acc.hafizaAmount) > 0 ? fmt(Number(acc.hafizaAmount)) : "—"}
                      </td>
                      <td className="border border-black font-mono tabular-nums font-black text-center bg-[#d8f3dc] text-[#1b4332] px-2 py-2 text-sm whitespace-nowrap">
                        {Number(acc.income) > 0 ? fmt(Number(acc.income)) : "—"}
                      </td>
                      <td className="border border-black font-mono tabular-nums font-black text-center bg-[#ffdadb] text-[#780000] px-2 py-2 text-sm whitespace-nowrap">
                        {Number(acc.expense) > 0 ? fmt(Number(acc.expense)) : "—"}
                      </td>
                      <td className="accounts-print-hide border border-black text-center px-2 py-2 text-sm whitespace-nowrap">
                        <select
                          value={acc.revenueKey || ""}
                          onChange={(e) => {
                            const newKey = e.target.value;
                            updateAccount(acc.id, { ...acc, revenueKey: newKey || undefined });
                            toast.success("تم ربط رمز الإيراد بنجاح");
                          }}
                          className="w-full p-1 text-xs font-black text-[#5a189a] bg-[#5a189a]/10 border border-black rounded outline-none cursor-pointer"
                        >
                          <option value="">— ربط الرمز —</option>
                          {revenueTypes.map((t) => (
                            <option key={t.key} value={t.key}>
                              {t.key}
                            </option>
                          ))}
                        </select>
                      </td>
                      <td className="border border-black font-mono tabular-nums font-black text-center bg-[#caf0f8] text-[#03045e] px-2 py-2 text-sm whitespace-nowrap">
                        {fmt(acc.balance)}
                      </td>
                      <td className="accounts-print-hide border border-black text-center px-2 py-2 text-sm whitespace-nowrap">
                        <div className="flex justify-center gap-1.5">
                          <button
                            onClick={() => setEditingRow(acc)}
                            className="p-1.5 bg-[#2a9d8f]/20 text-[#2a9d8f] hover:bg-[#2a9d8f]/30 rounded-lg transition-colors border border-black"
                            aria-label="تعديل"
                          >
                            <Edit className={ICON_MOBILE} />
                          </button>
                          <button
                            onClick={() => {
                              if (confirm("هل أنت متأكد من الحذف؟")) deleteAccount(acc.id);
                            }}
                            className="p-1.5 bg-[#e76f51]/20 text-[#e76f51] hover:bg-[#e76f51]/30 rounded-lg transition-colors border border-black"
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
                  <tr className="bg-[#e9ecef] font-black">
                    <td colSpan={10} className="border-2 border-black text-left px-3 py-2 text-sm whitespace-nowrap">
                      رصيد الإقفال الإجمالي
                    </td>
                    <td className="border-2 border-black font-mono tabular-nums text-center px-2 py-2 text-sm whitespace-nowrap">
                      {fmt(totalIncome)}
                    </td>
                    <td className="border-2 border-black font-mono tabular-nums text-center px-2 py-2 text-sm whitespace-nowrap">
                      {fmt(totalExpense)}
                    </td>
                    <td className="border-2 border-black px-2 py-2 text-sm whitespace-nowrap"></td>
                    <td className="border-2 border-black font-mono tabular-nums text-center bg-[#caf0f8] text-[#03045e] px-2 py-2 text-sm whitespace-nowrap">
                      {fmt(currentBalance)}
                    </td>
                    <td className="accounts-print-hide border-2 border-black px-2 py-2 text-sm whitespace-nowrap"></td>
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
                <label className="block text-sm font-black text-[#0f2f44] mb-1 tracking-wide">التاريخ</label>
                <input
                  type="date"
                  value={editingRow.date}
                  onChange={(e) => setEditingRow({ ...editingRow, date: e.target.value })}
                  className="w-full p-2 text-[15px] border-2 border-black rounded-xl outline-none bg-white text-[#0f2f44] font-bold"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-black text-[#0f2f44] mb-1 tracking-wide">رقم الحافظة</label>
                <input
                  value={editingRow.hafizaNo}
                  onChange={(e) => setEditingRow({ ...editingRow, hafizaNo: e.target.value })}
                  className="w-full p-2 text-[15px] border-2 border-black rounded-xl outline-none bg-white text-[#0f2f44] font-bold"
                />
              </div>
              <div>
                <label className="block text-sm font-black text-[#0f2f44] mb-1 tracking-wide">رقم الإشعار</label>
                <input
                  value={editingRow.notifyNo}
                  onChange={(e) => setEditingRow({ ...editingRow, notifyNo: e.target.value })}
                  className="w-full p-2 text-[15px] border-2 border-black rounded-xl outline-none bg-white text-[#0f2f44] font-bold"
                />
              </div>
              <div>
                <label className="block text-sm font-black text-[#0f2f44] mb-1 tracking-wide">تاريخ التوريد</label>
                <input
                  type="date"
                  value={editingRow.notifyDate}
                  onChange={(e) => setEditingRow({ ...editingRow, notifyDate: e.target.value })}
                  className="w-full p-2 text-[15px] border-2 border-black rounded-xl outline-none bg-white text-[#0f2f44] font-bold"
                />
              </div>
              <div className="sm:col-span-2">
                <label className="block text-sm font-black text-[#0f2f44] mb-1 tracking-wide">البيان والشرح</label>
                <input
                  value={editingRow.description}
                  onChange={(e) => setEditingRow({ ...editingRow, description: e.target.value })}
                  className="w-full p-2 text-[15px] border-2 border-black rounded-xl outline-none bg-white text-[#0f2f44] font-bold"
                />
              </div>
              <div>
                <label className="block text-sm font-black text-[#0f2f44] mb-1 tracking-wide">الاسم</label>
                <input
                  value={editingRow.name}
                  onChange={(e) => setEditingRow({ ...editingRow, name: e.target.value })}
                  className="w-full p-2 text-[15px] border-2 border-black rounded-xl outline-none bg-white text-[#0f2f44] font-bold"
                />
              </div>
              <div>
                <label className="block text-sm font-black text-[#0f2f44] mb-1 tracking-wide">التخصص</label>
                <input
                  value={editingRow.specialty}
                  onChange={(e) => setEditingRow({ ...editingRow, specialty: e.target.value })}
                  className="w-full p-2 text-[15px] border-2 border-black rounded-xl outline-none bg-white text-[#0f2f44] font-bold"
                />
              </div>
              <div>
                <label className="block text-sm font-black text-[#0f2f44] mb-1 tracking-wide">الإيرادات</label>
                <input
                  type="number"
                  value={editingRow.income}
                  onChange={(e) => setEditingRow({ ...editingRow, income: e.target.value })}
                  className="w-full p-2 text-[15px] border-2 border-black rounded-xl outline-none bg-white text-[#0f2f44] font-bold font-mono"
                />
              </div>
              <div>
                <label className="block text-sm font-black text-[#0f2f44] mb-1 tracking-wide">المصروفات</label>
                <input
                  type="number"
                  value={editingRow.expense}
                  onChange={(e) => setEditingRow({ ...editingRow, expense: e.target.value })}
                  className="w-full p-2 text-[15px] border-2 border-black rounded-xl outline-none bg-white text-[#0f2f44] font-bold font-mono"
                />
              </div>
            </div>
            <div className="flex gap-2 pt-4 border-t border-black">
              <button
                type="submit"
                className="flex-1 py-2.5 bg-[#2a9d8f] text-white font-black rounded-xl border-2 border-black shadow-sm hover:bg-[#21867a]"
              >
                حفظ التعديلات
              </button>
              <button
                type="button"
                onClick={() => setEditingRow(null)}
                className="py-2.5 px-4 bg-[#e76f51] text-white font-black rounded-xl border-2 border-black shadow-sm hover:bg-[#d55f41]"
              >
                إلغاء
              </button>
            </div>
          </form>
        )}
      </Modal>
    </div>
  );
}
