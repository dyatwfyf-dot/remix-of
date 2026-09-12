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
   الحساب الجاري — لوحة ألوان محسنة وتنسيق موحد للخطوط والحدود
   ============================================================ */

const THEME = {
  sage: "#d7e7f0",
  paleSage: "#eef6fb",
  cream: "#f7fbfd",
  warmCream: "#dcecf5",
  accent: "#1f5f7a",
  text: "#0f2f44",
  muted: "#5b7d90",
  Camel: "#2e6b8a",
  LightBrown: "#c98a3c",
  Lavender: "#eef6fb",
};

const ICON_MOBILE = "w-5 h-5 sm:w-6 sm:h-6 shrink-0";
const BTN_MOBILE = "px-3 py-2 sm:px-4 sm:py-2.5 text-sm sm:text-sm whitespace-nowrap";
const HEADING_MOBILE = "text-lg sm:text-xl font-black whitespace-nowrap";

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
    color: white !important;
    font-weight: 1000 !important;
  }
  .accounts-print-area tbody td,
  .accounts-print-area tfoot td {
    color: #000 !important;
    font-weight: 800 !important;
  }
  .accounts-print-area th,
  .accounts-print-area td {
    border: 2px solid #000 !important;
    white-space: nowrap!important;
    text-overflow: clip !important;
    overflow-wrap: anywhere !important;
    word-break: break-word !important;
    hyphens: auto !important;
    line-height: 1.1 !important;
    padding: 2px !important;
    font-size: 16px !important;
    height: auto !important;
    max-width: none !important;
    color: #000 !important;
  }
  .accounts-print-area td.numeric-cell,
  .accounts-print-area th.numeric-cell,
  .accounts-print-area td.date-cell,
  .accounts-print-area th.date-cell,
  .accounts-print-area td.font-mono,
  .accounts-print-area th.font-mono {
    font-family: 'Times New Roman', Times, serif !important;
    font-size: 16px !important;
    line-height: 1.05 !important;
    white-space: nowrap !important;
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
      <div className="rounded-t-2xl sm:rounded-2xl w-full max-w-2xl shadow-2xl max-h-[90vh] overflow-y-auto border-2 border-black bg-white">
        <div
          className="flex justify-between items-center px-5 py-4 border-b-2 border-black sticky top-0 z-10"
          style={{ background: THEME.LightBrown || "#c98a3c" }}
        >
          <h3 className={`${HEADING_MOBILE} text-[#0f2f44] flex items-center gap-2 tracking-tight`}>
            {title}
          </h3>
          <button
            onClick={onClose}
            className="p-2 hover:bg-black/10 rounded-xl transition-colors text-[#0f2f44]"
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
      <label className="block text-sm font-black text-[#0f2f44] mb-1.5 mr-0.5 tracking-wide whitespace-nowrap">
        {label}
      </label>
      <div className="relative flex items-center">
        {icon && <span className="absolute right-3 z-10">{icon}</span>}
        <input
          type={type}
          value={v}
          onChange={(e) => on(e.target.value)}
          placeholder={placeholder}
          className={`w-full ${icon ? "pr-9" : "px-3"} pl-3 py-2 text-[15px] border-2 border-black rounded-xl outline-none focus:ring-2 focus:ring-[#0f2f44]/20 bg-white text-[#0f2f44] font-bold ${className}`}
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
  const toneMap = {
    income: { text: "text-[#1E8E5A]", chipBg: THEME.paleSage },
    expense: { text: "text-[#D14343]", chipBg: "#FFEDEE" },
    balance: { text: "text-[#1f5f7a]", chipBg: THEME.warmCream },
  } as const;
  const t = toneMap[tone];
  return (
    <div
      className="relative rounded-2xl px-3 py-3 sm:px-4 sm:py-3.5 border-2 border-black shadow-sm"
      style={{ background: THEME.cream, ...style }}
    >
      <div className="flex items-center justify-between gap-2">
        <div>
          <span className="text-xs sm:text-sm font-black text-[#5b7d90] tracking-wide whitespace-nowrap">
            {label}
          </span>
          <div className={`text-base sm:text-xl font-black font-mono tabular-nums numeric-cell mt-1 ${t.text}`}>
            {fmt(value)}
          </div>
        </div>
        <div
          className="p-2.5 rounded-xl border-2 border-black flex items-center justify-center shrink-0"
          style={{ background: t.chipBg }}
        >
          {React.isValidElement(icon)
            ? React.cloneElement(icon as any, { className: ICON_MOBILE })
            : icon}
        </div>
      </div>
    </div>
  );
}

export default function AccountsTab() {
  const { accounts, addAccount, updateAccount, deleteAccount, clearAccounts, hafiza = [] } =
    useStore();
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
    const isOpeningRow = (row: any) => String(row.description ?? "").includes("رصيد افتتاحي");
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
      className:
        "flex w-full cursor-pointer items-center gap-2 rounded-lg px-3 py-2 text-sm font-semibold text-[#0f4a5c] bg-gradient-to-r from-[#f4fbff] via-[#d9f0f7] to-[#b9e6f0] border-2 border-black shadow-sm hover:brightness-105 transition-all duration-200 whitespace-nowrap",
    },
    {
      label: "استيراد Excel",
      icon: FileSpreadsheet,
      onSelect: () => undefined,
      content: (
        <label className="flex w-full relative cursor-pointer items-center gap-2 rounded-lg px-3 py-2 text-sm font-semibold text-[#7a2a1a] bg-gradient-to-r from-[#fff6f5] via-[#ffd9d3] to-[#ffb8ac] border-2 border-black shadow-sm hover:brightness-105 transition-all duration-200 whitespace-nowrap">
          <FileSpreadsheet className={`${ICON_MOBILE} text-[#7a2a1a]`} />
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

      {/* شريط العنوان */}
      <div
        className="accounts-print-hide flex items-center justify-between border-2 border-black p-3.5 rounded-xl"
        style={{
          background: "linear-gradient(135deg, #f2fbfa 0%, #d4f0ec 45%, #b3e4dd 100%)",
        }}
      >
        <div>
          <h1 className={`${HEADING_MOBILE} text-[#0f4a44] font-black tracking-tight`}>
            الحساب الجاري
          </h1>
          <p className="text-xs text-[#5c6b4a] font-black tracking-wide mt-0.5">
            سجل الحركات المالية المُرحّلة
          </p>
        </div>

        <div className="hidden sm:flex items-center gap-2 px-3.5 py-2 rounded-xl bg-white border-2 border-black shadow-sm whitespace-nowrap">
          <Landmark className={`${ICON_MOBILE} text-[#0f4a44]`} />
          <span className="text-sm text-[#0f4a44] font-black">عدد القيود</span>
          <span className="text-[#2c3e50] font-mono text-base tabular-nums font-black">
            {accounts.length}
          </span>
        </div>
      </div>

      {/* بطاقات الإجماليات */}
      <div className="accounts-print-hide grid grid-cols-1 sm:grid-cols-3 gap-3">
        <LedgerStat
          label="إجمالي الإيرادات"
          style={{
            background: "linear-gradient(135deg, #fffdf5 0%, #fff3c4 45%, #ffe985 100%)",
            borderColor: "#000",
            color: "#7a5c00",
          }}
          value={totalIncome}
          tone="income"
          icon={<ArrowUpRight className="text-[#7a5c00]" />}
        />

        <LedgerStat
          label="إجمالي المصروفات"
          style={{
            background: "linear-gradient(135deg, #fff6f5 0%, #ffd9d3 45%, #ffb8ac 100%)",
            borderColor: "#000",
            color: "#7a2a1a",
          }}
          value={totalExpense}
          tone="expense"
          icon={<ArrowDownLeft className="text-[#7a2a1a]" />}
        />

        <LedgerStat
          label="الرصيد الحالي"
          style={{
            background: "linear-gradient(135deg, #f4fbff 0%, #d9f0f7 45%, #b9e6f0 100%)",
            borderColor: "#000",
            color: "#0f4a5c",
          }}
          value={currentBalance}
          tone="balance"
          icon={<Wallet className="text-[#0f4a5c]" />}
        />
      </div>

      {/* التقارير الدورية */}
      <div
        className="accounts-print-hide w-full rounded-2xl overflow-hidden border-2 border-black shadow-sm"
        style={{
          background: "linear-gradient(135deg, #f4fff2 0%, #d7f5cf 45%, #b8ecae 100%)",
        }}
      >
        <div
          className="px-4 py-3 flex flex-wrap justify-between items-center gap-3 border-b-2 border-black"
          style={{ background: "#f5f5dc" }}
        >
          <div>
            <h2 className="text-base font-black text-[#1a2a3a] tracking-wide whitespace-nowrap">
              تقارير الحساب الدورية
            </h2>
            <p className="text-xs text-[#5c2a1a] font-bold mt-1 whitespace-nowrap">
              اختر الربع أو النصف أو السنة ثم صدّر التقرير
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <label className="text-xs font-black text-[#1a2a3a] whitespace-nowrap">
              نوع التقرير
              <select
                value={accountReportMode}
                onChange={(e) => {
                  const nextMode = e.target.value as "quarter" | "halfYear" | "year";
                  setAccountReportMode(nextMode);
                  setAccountReportPeriod(1);
                }}
                className="block mt-1 px-2.5 py-2 border-2 border-black bg-[#1a2a3a] text-[#d2b48c] text-xs font-black rounded-lg outline-none cursor-pointer"
              >
                <option value="quarter">ربع سنوي</option>
                <option value="halfYear">نصف سنوي</option>
                <option value="year">سنوي</option>
              </select>
            </label>

            {accountReportMode !== "year" && (
              <label className="text-xs font-black text-[#1a2a3a] whitespace-nowrap">
                الفترة
                <select
                  value={accountReportPeriod}
                  onChange={(e) => setAccountReportPeriod(Number(e.target.value))}
                  className="block mt-1 px-2.5 py-2 border-2 border-black bg-[#1a2a3a] text-[#d2b48c] text-xs font-black rounded-lg outline-none cursor-pointer"
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

            <label className="text-xs font-black text-[#1a2a3a] whitespace-nowrap">
              السنة
              <input
                type="number"
                value={accountReportYear}
                onChange={(e) => setAccountReportYear(Number(e.target.value) || accountReportYear)}
                className="block mt-1 w-24 px-2 py-2 border-2 border-black bg-[#1a2a3a] text-[#d2b48c] text-xs font-black font-mono text-center rounded-lg outline-none"
              />
            </label>

            <div className="text-xs font-black text-[#5c2a1a] px-3 py-2 bg-[#d2b48c] rounded-lg border-2 border-black whitespace-nowrap mt-5 sm:mt-0">
              {accountReportLabel}
            </div>

            <div className="mt-5 sm:mt-0">
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
      </div>

      {/* لوحة القيد اليدوي والمطابقة */}
      <div
        className="accounts-print-hide w-full rounded-2xl overflow-hidden border-2 border-black shadow-sm"
        style={{
          background: "linear-gradient(135deg, #fef9f2 0%, #fbe8cf 45%, #f5d3a3 100%)",
        }}
      >
        <div
          className="px-4 py-3 flex flex-wrap justify-between items-center gap-3 border-b-2 border-black"
          style={{ background: "#f5f5dc" }}
        >
          <div className="flex items-center gap-2.5">
            <div
              className="p-2 rounded-lg border-2 border-black"
              style={{ background: "#c98a3c", color: "#ffffff" }}
            >
              <Plus className={ICON_MOBILE} />
            </div>
            <h2 className="text-sm sm:text-base font-black tracking-wide text-[#1a2a3a] whitespace-nowrap">
              قيد جديد أو ترحيل مطابقة من الحوافظ
            </h2>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            <div className="web-only-actions">
              <WebActionMenu
                label="إجراءات الإدخال والمطابقة"
                actions={accountEntryWebActions}
              />
            </div>

            <div className="apk-only-actions flex items-center gap-2 flex-wrap">
              <button
                onClick={handleSyncFromHafiza}
                className={`${BTN_MOBILE} flex items-center justify-center gap-2 rounded-xl font-black border-2 border-black shadow-sm transition-all bg-gradient-to-r from-[#f4fbff] to-[#b9e6f0] text-[#0f4a5c]`}
              >
                <Zap className={`${ICON_MOBILE} text-[#0f4a5c]`} />
                <span>مطابقة شاملة ٢٠٢٦</span>
              </button>

              <label
                className={`${BTN_MOBILE} relative flex items-center justify-center gap-2 rounded-xl border-2 border-black px-4 py-2 cursor-pointer font-black shadow-sm bg-gradient-to-r from-[#d2b48c] to-[#e6d7c3] text-[#1a2a3a]`}
              >
                <FileSpreadsheet className={`${ICON_MOBILE} text-[#1a2a3a]`} />
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
        </div>

        <div className="p-3 sm:p-5">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 items-end">
            <Field
              label="التاريخ"
              type="date"
              icon={<Calendar className={`${ICON_MOBILE} text-[#1a2a3a]`} />}
              v={form.date}
              on={(v) => setForm({ ...form, date: v })}
              className="bg-[#f5f5dc] text-[#1a2a3a] font-black border-2 border-black"
            />
            <Field
              label="رقم الحافظة"
              icon={<Hash className={`${ICON_MOBILE} text-[#722f37]`} />}
              v={form.hafizaNo}
              on={(v) => setForm({ ...form, hafizaNo: v })}
              className="bg-[#e6d7c3] text-[#1a2a3a] font-black border-2 border-black"
            />
            <Field
              label="رقم الإشعار"
              icon={<Hash className={`${ICON_MOBILE} text-[#c5a059]`} />}
              v={form.notifyNo}
              on={(v) => setForm({ ...form, notifyNo: v })}
              className="bg-[#f5f5dc] text-[#1a2a3a] font-black border-2 border-black"
            />
            <Field
              label="تاريخ التوريد"
              type="date"
              icon={<Calendar className={`${ICON_MOBILE} text-[#1a2a3a]`} />}
              v={form.notifyDate}
              on={(v) => setForm({ ...form, notifyDate: v })}
              className="bg-[#e6d7c3] text-[#1a2a3a] font-black border-2 border-black"
            />
            <Field
              label="رقم الشيك"
              icon={<Ticket className={`${ICON_MOBILE} text-[#722f37]`} />}
              v={form.checkNo}
              on={(v) => setForm({ ...form, checkNo: v })}
              className="bg-[#f5f5dc] text-[#1a2a3a] font-black border-2 border-black"
            />
            <Field
              label="تاريخ الشيك"
              type="date"
              icon={<Calendar className={`${ICON_MOBILE} text-[#c5a059]`} />}
              v={form.checkDate}
              on={(v) => setForm({ ...form, checkDate: v })}
              className="bg-[#e6d7c3] text-[#1a2a3a] font-black border-2 border-black"
            />

            <div className="sm:col-span-2 lg:col-span-3">
              <label className="block text-[15px] font-black mb-1.5 mr-0.5 tracking-wide text-[#1a2a3a] whitespace-nowrap">
                البيان والشرح
              </label>
              <div className="relative flex items-center">
                <span className="absolute right-3 z-10">
                  <FileText className={`${ICON_MOBILE} text-[#722f37]`} />
                </span>
                <input
                  list="account-descriptions"
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  placeholder="اكتب أو اختر البيان..."
                  className="w-full pr-9 pl-3 py-2 text-[15px] border-2 border-black rounded-xl outline-none shadow-sm bg-[#f5f5dc] text-[#1a2a3a] font-black"
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
              icon={<Stethoscope className={`${ICON_MOBILE} text-[#1a2a3a]`} />}
              v={form.specialty}
              on={(v) => setForm({ ...form, specialty: v })}
              className="bg-[#e6d7c3] text-[#1a2a3a] font-black border-2 border-black"
            />
            <Field
              label="الاسم الكامل"
              icon={<User className={`${ICON_MOBILE} text-[#1a2a3a]`} />}
              v={form.name}
              on={(v) => setForm({ ...form, name: v })}
              placeholder="اسم المتدرب..."
              className="bg-[#f5f5dc] text-[#1a2a3a] font-black border-2 border-black"
            />
            <Field
              label="مبلغ الحافظة"
              type="number"
              icon={<span className="text-xs text-[#1a2a3a] font-black">ر.ي</span>}
              v={form.hafizaAmount}
              on={(v) => setForm({ ...form, hafizaAmount: v })}
              className="font-mono tabular-nums numeric-cell bg-[#e6d7c3] text-[#1a2a3a] font-black border-2 border-black"
            />
            <Field
              label="الإيرادات"
              type="number"
              icon={<span className="text-xs text-[#c5a059] font-black">ر.ي</span>}
              v={form.income}
              on={(v) => setForm({ ...form, income: v })}
              placeholder="0.00"
              className="text-[#c5a059] font-black font-mono tabular-nums numeric-cell bg-[#f5f5dc] border-2 border-black"
            />
            <Field
              label="المصروفات"
              type="number"
              icon={<span className="text-xs text-[#722f37] font-black">ر.ي</span>}
              v={form.expense}
              on={(v) => setForm({ ...form, expense: v })}
              placeholder="0.00"
              className="text-[#722f37] font-black font-mono tabular-nums numeric-cell bg-[#e6d7c3] border-2 border-black"
            />

            <div className="sm:col-span-2 lg:col-span-3">
              <label className="flex items-center gap-1.5 text-[15px] font-black mb-1.5 mr-0.5 tracking-wide text-[#1a2a3a] whitespace-nowrap">
                <Link className={`${ICON_MOBILE} text-[#c5a059]`} /> ربط بدليل هيكل الإيرادات
              </label>
              <select
                value={form.revenueKey}
                onChange={(e) => setForm({ ...form, revenueKey: e.target.value })}
                className="w-full px-3 py-2 text-[15px] border-2 border-black rounded-xl outline-none shadow-sm bg-[#f5f5dc] text-[#1a2a3a] font-black cursor-pointer"
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

          <div className="flex gap-2 pt-4 mt-4 border-t-2 border-black">
            <button
              onClick={submit}
              className={`${BTN_MOBILE} flex-1 flex items-center justify-center gap-2 rounded-xl font-black border-2 border-black shadow-sm transition-all bg-gradient-to-r from-[#f4fff2] to-[#b8ecae] text-[#2f5c1a]`}
            >
              <Save className={`${ICON_MOBILE} text-[#2f5c1a]`} /> <span>ترحيل القيد</span>
            </button>
            <button
              onClick={() => setForm(emptyForm)}
              className={`${BTN_MOBILE} flex items-center justify-center gap-2 rounded-xl border-2 border-black font-black shadow-sm transition-all bg-[#f5f5dc] text-[#722f37]`}
            >
              <Eraser className={`${ICON_MOBILE} text-[#722f37]`} /> <span>مسح</span>
            </button>
          </div>
        </div>
      </div>

      {/* جدول القيود */}
      <div
        className="accounts-print-area w-full rounded-2xl overflow-hidden border-2 border-black shadow-sm bg-white"
      >
        <div
          className="accounts-print-hide px-3 py-3 sm:px-5 sm:py-3.5 flex flex-col sm:flex-row justify-between items-stretch sm:items-center flex-wrap gap-2 border-b-2 border-black"
          style={{ background: THEME.cream }}
        >
          <div className="flex items-center gap-2.5">
            <div className="w-2.5 h-2.5 rounded-full bg-[#1E8E5A] animate-pulse"></div>
            <h2 className="text-xs sm:text-sm font-black text-[#0f2f44] tracking-wide whitespace-nowrap">
              سجل حركات الحساب الجاري ({accounts.length})
            </h2>
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            {Object.values(filters).some(Boolean) && (
              <button
                onClick={clearFilters}
                className="px-3 py-1.5 bg-black/5 hover:bg-black/10 text-[#0f2f44] border-2 border-black rounded-xl text-xs font-black transition-colors whitespace-nowrap"
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
            />
          </div>
        </div>

        <div className="p-2 sm:p-3">
          <div className="overflow-x-auto overflow-y-auto max-h-[72vh] relative rounded-xl border-2 border-black">
            <table className="min-w-max table-auto text-sm text-center font-bold border-collapse border-2 border-black">
              <thead
                className="sticky top-0 z-20 text-[#0f2f44] font-black text-[15px]"
                style={{ background: THEME.warmCream }}
              >
                <tr>
                  <th className="border-2 border-black text-center w-12 sticky top-0 z-20 px-2 py-2 whitespace-nowrap">
                    م
                  </th>
                  {COLS.map((c) => (
                    <th
                      key={c.key}
                      className="border-2 border-black cursor-pointer hover:bg-[#cfe4ef] transition-colors select-none sticky top-0 z-20 px-2.5 py-2 whitespace-nowrap"
                      onClick={() => toggleSort(c.key)}
                    >
                      <div className="flex items-center justify-center gap-1.5 whitespace-nowrap">
                        <span>{c.label}</span>
                        <span className="text-[14px] text-[#1f5f7a] font-mono">
                          {sortIndicator(sortKey === c.key, sortDir)}
                        </span>
                      </div>
                    </th>
                  ))}
                  <th className="border-2 border-black text-center sticky top-0 z-20 px-2.5 py-2 whitespace-nowrap">
                    إجراءات
                  </th>
                </tr>
                <tr className="accounts-print-hide" style={{ background: THEME.cream }}>
                  <th className="border-2 border-black px-2 py-1.5 whitespace-nowrap"></th>
                  {COLS.map((c) => (
                    <th key={c.key} className="border-2 border-black px-2 py-1.5 whitespace-nowrap">
                      <input
                        value={filters[c.key] || ""}
                        onChange={(e) => setFilter(c.key, e.target.value)}
                        placeholder="تصفية..."
                        className="w-20 px-2 py-1 text-xs border-2 border-black rounded-lg bg-white text-[#0f2f44] outline-none font-black transition-colors"
                      />
                    </th>
                  ))}
                  <th className="border-2 border-black px-2 py-1.5 whitespace-nowrap"></th>
                </tr>
              </thead>

              <tbody className="text-[#0f2f44] font-black">
                {filteredWithBalance.length === 0 ? (
                  <tr>
                    <td
                      colSpan={COLS.length + 2}
                      className="text-center font-black border-2 border-black bg-white px-3 py-4 text-sm whitespace-nowrap"
                    >
                      لا توجد بيانات تطابق مرشحات البحث.
                    </td>
                  </tr>
                ) : (
                  filteredWithBalance.map((acc, index) => (
                    <tr
                      key={acc.id}
                      className="odd:bg-white even:bg-[#f4fafd] hover:bg-[#e3f0f7] transition-colors group"
                    >
                      <td className="border-2 border-black text-center font-mono tabular-nums numeric-cell px-2 py-2 text-sm whitespace-nowrap">
                        {index + 1}
                      </td>
                      <td className="border-2 border-black font-mono tabular-nums numeric-cell text-center px-2.5 py-2 text-sm whitespace-nowrap">
                        {acc.date}
                      </td>
                      <td className="border-2 border-black font-mono tabular-nums numeric-cell font-black text-center px-2.5 py-2 text-sm whitespace-nowrap">
                        {acc.hafizaNo || "—"}
                      </td>
                      <td className="border-2 border-black font-mono tabular-nums numeric-cell text-center px-2.5 py-2 text-sm whitespace-nowrap">
                        {acc.notifyNo || "—"}
                      </td>
                      <td className="border-2 border-black font-mono tabular-nums numeric-cell text-center px-2.5 py-2 text-sm whitespace-nowrap">
                        {acc.notifyDate || "—"}
                      </td>
                      <td className="border-2 border-black font-mono tabular-nums numeric-cell text-center px-2.5 py-2 text-sm whitespace-nowrap">
                        {acc.checkNo || "—"}
                      </td>
                      <td className="border-2 border-black font-mono tabular-nums numeric-cell text-center px-2.5 py-2 text-sm whitespace-nowrap">
                        {acc.checkDate || "—"}
                      </td>
                      <td className="border-2 border-black px-2.5 py-2 text-sm whitespace-nowrap text-right">
                        {acc.description || "—"}
                      </td>
                      <td className="border-2 border-black px-2.5 py-2 text-sm whitespace-nowrap text-right">
                        {acc.specialty || "—"}
                      </td>
                      <td className="border-2 border-black font-black px-2.5 py-2 text-sm whitespace-nowrap text-right">
                        {acc.name || "—"}
                      </td>
                      <td className="border-2 border-black font-mono tabular-nums numeric-cell text-center px-2.5 py-2 text-sm whitespace-nowrap">
                        {Number(acc.hafizaAmount) > 0 ? fmt(Number(acc.hafizaAmount)) : "—"}
                      </td>
                      <td className="border-2 border-black font-mono tabular-nums numeric-cell font-black text-center bg-[#1E8E5A]/[0.08] px-2.5 py-2 text-sm whitespace-nowrap text-[#1E8E5A]">
                        {Number(acc.income) > 0 ? fmt(Number(acc.income)) : "—"}
                      </td>
                      <td className="border-2 border-black font-mono tabular-nums numeric-cell font-black text-center bg-[#D14343]/[0.08] px-2.5 py-2 text-sm whitespace-nowrap text-[#D14343]">
                        {Number(acc.expense) > 0 ? fmt(Number(acc.expense)) : "—"}
                      </td>
                      <td className="accounts-print-hide border-2 border-black text-center px-2 py-2 whitespace-nowrap">
                        <select
                          value={acc.revenueKey || ""}
                          onChange={(e) => {
                            const newKey = e.target.value;
                            updateAccount(acc.id, { ...acc, revenueKey: newKey || undefined });
                            toast.success("تم ربط رمز الإيراد بنجاح");
                          }}
                          className="w-full px-2 py-1.5 text-xs font-black text-[#7C3AED] bg-[#7C3AED]/10 border-2 border-black rounded-lg outline-none cursor-pointer whitespace-nowrap"
                        >
                          <option value="">— ربط الرمز —</option>
                          {revenueTypes.map((t) => (
                            <option key={t.key} value={t.key}>
                              {t.key}
                            </option>
                          ))}
                        </select>
                      </td>
                      <td className="border-2 border-black font-mono tabular-nums numeric-cell font-black text-center bg-[#1f5f7a]/[0.08] px-2.5 py-2 text-sm whitespace-nowrap text-[#1f5f7a]">
                        {fmt(acc.balance)}
                      </td>
                      <td className="accounts-print-hide border-2 border-black text-center px-2 py-2 whitespace-nowrap">
                        <div className="flex justify-center gap-1.5">
                          <button
                            onClick={() => setEditingRow(acc)}
                            className="p-1.5 text-[#1E8E5A] hover:bg-[#1E8E5A]/10 border-2 border-black rounded-lg transition-colors"
                            aria-label="تعديل"
                          >
                            <Edit className={ICON_MOBILE} />
                          </button>
                          <button
                            onClick={() => {
                              if (confirm("هل أنت متأكد من الحذف؟")) deleteAccount(acc.id);
                            }}
                            className="p-1.5 text-[#D14343] hover:bg-[#D14343]/10 border-2 border-black rounded-lg transition-colors"
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
                    <td
                      colSpan={10}
                      className="border-2 border-black text-left font-black px-3 py-2.5 text-sm whitespace-nowrap"
                    >
                      رصيد الإقفال النهائي
                    </td>
                    <td className="border-2 border-black font-mono tabular-nums numeric-cell font-black text-center px-2.5 py-2.5 text-sm whitespace-nowrap">
                      {fmt(totalIncome)}
                    </td>
                    <td className="border-2 border-black font-mono tabular-nums numeric-cell font-black text-center px-2.5 py-2.5 text-sm whitespace-nowrap">
                      {fmt(totalExpense)}
                    </td>
                    <td className="border-2 border-black px-2 py-2.5 whitespace-nowrap"></td>
                    <td className="border-2 border-black font-mono tabular-nums numeric-cell font-black text-center bg-[#1f5f7a]/15 px-2.5 py-2.5 text-sm whitespace-nowrap text-[#1f5f7a]">
                      {fmt(currentBalance)}
                    </td>
                    <td className="accounts-print-hide border-2 border-black px-2 py-2.5 whitespace-nowrap"></td>
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
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-black text-[#0f2f44] mb-1 tracking-wide whitespace-nowrap">
                  التاريخ
                </label>
                <input
                  type="date"
                  value={editingRow.date}
                  onChange={(e) => setEditingRow({ ...editingRow, date: e.target.value })}
                  className="w-full p-2 text-[15px] border-2 border-black rounded-xl outline-none bg-white text-[#0f2f44] font-black"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-black text-[#0f2f44] mb-1 tracking-wide whitespace-nowrap">
                  رقم الحافظة
                </label>
                <input
                  value={editingRow.hafizaNo}
                  onChange={(e) => setEditingRow({ ...editingRow, hafizaNo: e.target.value })}
                  className="w-full p-2 text-[15px] border-2 border-black rounded-xl outline-none bg-white text-[#0f2f44] font-black"
                />
              </div>
              <div>
                <label className="block text-sm font-black text-[#0f2f44] mb-1 tracking-wide whitespace-nowrap">
                  رقم الإشعار
                </label>
                <input
                  value={editingRow.notifyNo}
                  onChange={(e) => setEditingRow({ ...editingRow, notifyNo: e.target.value })}
                  className="w-full p-2 text-[15px] border-2 border-black rounded-xl outline-none bg-white text-[#0f2f44] font-black"
                />
              </div>
              <div>
                <label className="block text-sm font-black text-[#0f2f44] mb-1 tracking-wide whitespace-nowrap">
                  تاريخ التوريد
                </label>
                <input
                  type="date"
                  value={editingRow.notifyDate}
                  onChange={(e) => setEditingRow({ ...editingRow, notifyDate: e.target.value })}
                  className="w-full p-2 text-[15px] border-2 border-black rounded-xl outline-none bg-white text-[#0f2f44] font-black"
                />
              </div>
              <div className="sm:col-span-2">
                <label className="block text-sm font-black text-[#0f2f44] mb-1 tracking-wide whitespace-nowrap">
                  البيان والشرح
                </label>
                <input
                  value={editingRow.description}
                  onChange={(e) => setEditingRow({ ...editingRow, description: e.target.value })}
                  className="w-full p-2 text-[15px] border-2 border-black rounded-xl outline-none bg-white text-[#0f2f44] font-black"
                />
              </div>
              <div>
                <label className="block text-sm font-black text-[#0f2f44] mb-1 tracking-wide whitespace-nowrap">
                  الاسم
                </label>
                <input
                  value={editingRow.name}
                  onChange={(e) => setEditingRow({ ...editingRow, name: e.target.value })}
                  className="w-full p-2 text-[15px] border-2 border-black rounded-xl outline-none bg-white text-[#0f2f44] font-black"
                />
              </div>
              <div>
                <label className="block text-sm font-black text-[#0f2f44] mb-1 tracking-wide whitespace-nowrap">
                  مبلغ الحافظة
                </label>
                <input
                  type="number"
                  value={editingRow.hafizaAmount}
                  onChange={(e) => setEditingRow({ ...editingRow, hafizaAmount: e.target.value })}
                  className="w-full p-2 text-[15px] border-2 border-black rounded-xl outline-none bg-white text-[#0f2f44] font-black font-mono tabular-nums numeric-cell"
                />
              </div>
              <div>
                <label className="block text-sm font-black text-[#1E8E5A] mb-1 tracking-wide whitespace-nowrap">
                  الإيرادات
                </label>
                <input
                  type="number"
                  value={editingRow.income}
                  onChange={(e) => setEditingRow({ ...editingRow, income: e.target.value })}
                  className="w-full p-2 text-[15px] border-2 border-black rounded-xl bg-[#1E8E5A]/10 text-[#1E8E5A] font-black outline-none font-mono tabular-nums numeric-cell"
                />
              </div>
              <div>
                <label className="block text-sm font-black text-[#D14343] mb-1 tracking-wide whitespace-nowrap">
                  المصروفات
                </label>
                <input
                  type="number"
                  value={editingRow.expense}
                  onChange={(e) => setEditingRow({ ...editingRow, expense: e.target.value })}
                  className="w-full p-2 text-[15px] border-2 border-black rounded-xl bg-[#D14343]/10 text-[#D14343] font-black outline-none font-mono tabular-nums numeric-cell"
                />
              </div>
            </div>
            <div className="flex justify-end gap-3 pt-4 border-t-2 border-black">
              <button
                type="button"
                onClick={() => setEditingRow(null)}
                className="px-4 py-2 bg-black/5 text-[#0f2f44] border-2 border-black rounded-xl font-black text-sm hover:bg-black/10 whitespace-nowrap"
              >
                إلغاء
              </button>
              <button
                type="submit"
                className="px-5 py-2 bg-[#0f2f44] text-white border-2 border-black rounded-xl font-black text-sm hover:bg-[#1a4a66] whitespace-nowrap"
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
