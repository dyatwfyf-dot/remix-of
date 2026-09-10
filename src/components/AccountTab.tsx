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
  Zap,
  Calendar,
  Hash,
  FileText,
  User,
  ArrowUpRight,
  ArrowDownLeft,
  Wallet,
  Stethoscope,
  Landmark,
  Ticket,
} from "lucide-react";
import TabActions from "./TabActions";
import WebActionMenu, { type WebActionItem } from "./WebActionMenu";
import schema from "@/data/revenueTemplate.json";

/* ============================================================
   الحساب الجاري — لوحة ألوان مخصصة وحجم عناصر محسّن للهواتف
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

/* أحجام العناصر المناسبة لشاشات Redmi */
const ICON_MOBILE = "w-4 h-4 sm:w-5 sm:h-5";
const BTN_MOBILE = "px-3 py-2 text-xs sm:text-sm font-black";
const HEADING_MOBILE = "text-base sm:text-xl font-black";

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

/* أنماط الطباعة */
const PRINT_STYLES = `
@media print {
  .accounts-print-scope { background:#B4CEB6 !important; }
  .accounts-print-area, .accounts-print-area * { visibility: visible !important; }
  .accounts-print-hide { display: none !important; }
  .accounts-print-area table {
    border-collapse: collapse !important;
    width: 100% !important;
    min-width:auto !important;
    table-layout:auto !important;
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
    border: 1px solid #000 !important;
    white-space:nowrap !important;
    text-overflow: clip !important;
    overflow-wrap: anywhere !important;
    word-break: break-word !important;
    hyphens: auto !important;
    line-height: 1.2 !important;
    padding: 2px 4px !important;
    font-size: 13px !important;
    height: auto !important;
    width:auto !important;
    max-width: none !important;
    color:#000 !important;
  }
  .accounts-print-area td.numeric-cell,
  .accounts-print-area th.numeric-cell,
  .accounts-print-area td.date-cell,
  .accounts-print-area th.date-cell,
  .accounts-print-area td.font-mono,
  .accounts-print-area th.font-mono {
    font-family: 'Times New Roman'!important;
    font-size: 13px !important;
    line-height: 1.1 !important;
    white-space: nowrap !important;
    overflow-wrap: normal !important;
    word-break: keep-all !important;
    hyphens: none !important;
  }
  .accounts-print-area .overflow-x-auto,
  .accounts-print-area .overflow-y-auto {
    overflow: visible !important;
    max-height: none !important;
  }
}
`;

/* ---------- عناصر واجهة أساسية ---------- */

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
      className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-end sm:items-center justify-center z-50 p-2 sm:p-4"
      dir="rtl"
    >
      <div className="rounded-t-2xl sm:rounded-2xl w-full max-w-2xl shadow-2xl max-h-[90vh] overflow-y-auto border border-black bg-white">
        <div
          className="flex justify-between items-center px-4 py-3 border-b border-black sticky top-0 z-10"
          style={{ background: THEME.LightBrown }}
        >
          <h3 className={`${HEADING_MOBILE} text-[#0f2f44] flex items-center gap-2 tracking-tight`}>
            {title}
          </h3>
          <button
            onClick={onClose}
            className="p-1.5 hover:bg-white/20 rounded-xl transition-colors text-white"
            aria-label="إغلاق"
          >
            <X className={ICON_MOBILE} />
          </button>
        </div>
        <div className="p-4">{children}</div>
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
      <label className="block text-xs font-black text-[#0f2f44] mb-1 truncate">
        {label}
      </label>
      <div className="relative flex items-center">
        {icon && <span className="absolute right-2.5 z-10">{icon}</span>}
        <input
          type={type}
          value={v}
          onChange={(e) => on(e.target.value)}
          placeholder={placeholder}
          className={`w-full ${icon ? "pr-8" : "px-2.5"} pl-2 py-1.5 text-xs sm:text-sm border border-black rounded-lg outline-none focus:border-[#1f5f7a] focus:ring-1 focus:ring-[#1f5f7a] text-[#0f2f44] bg-white ${className}`}
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
      className="relative rounded-xl px-2 py-2 sm:px-3 sm:py-2.5 border border-black shadow-sm"
      style={{ ...style }}
    >
      <div className="flex items-center justify-between gap-1">
        <div className="min-w-0">
          <span className="block text-[10px] sm:text-xs font-black text-black/70 truncate">
            {label}
          </span>
          <div className={`text-xs sm:text-base font-black font-mono tabular-nums numeric-cell mt-0.5 truncate ${t.text}`}>
            {fmt(value)}
          </div>
        </div>
        <div
          className="p-1.5 rounded-lg flex items-center justify-center shrink-0"
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

  // مطابقة شاملة معتمدة على sourceHafizaId
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
        `المطابقة: إضافة ${addedCount} | تحديث ${updatedCount} | تطابق ${skippedCount}`
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
    COLS.map((c) => c.key)
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
            })
          )
        )
      );
    }
    return list;
  }, []);

  const totalIncome = useMemo(
    () => accounts.reduce((sum, a) => sum + (Number(a.income) || 0), 0),
    [accounts]
  );
  const totalExpense = useMemo(
    () => accounts.reduce((sum, a) => sum + (Number(a.expense) || 0), 0),
    [accounts]
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

  const [accountReportMode, setAccountReportMode] = useState<
    "quarter" | "halfYear" | "year"
  >("quarter");
  const [accountReportYear, setAccountReportYear] = useState(
    new Date().getFullYear()
  );
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
    const isOpeningRow = (row: any) =>
      String(row.description ?? "").includes("رصيد افتتاحي");
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
        "flex w-full cursor-pointer items-center gap-2 rounded-lg px-3 py-2 text-sm font-semibold text-white bg-gradient-to-r from-[#1f5f7a] to-[#2e6b8a] border border-black/20 shadow-xs hover:brightness-105 transition-all duration-200",
    },
    {
      label: "استيراد Excel",
      icon: FileSpreadsheet,
      onSelect: () => undefined,
      content: (
        <label className="flex w-full relative cursor-pointer items-center gap-2 rounded-lg px-3 py-2 text-sm font-semibold text-white bg-gradient-to-r from-[#c98a3c] to-[#d89b4c] border border-black/20 shadow-xs hover:brightness-105 transition-all duration-200">
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
      className="accounts-print-scope sheet-tabs-ui apk-tabs-ui w-full space-y-3 p-1.5 sm:p-3 rounded-2xl bg-[#f8fafc]"
      dir="rtl"
    >
      <style>{PRINT_STYLES}</style>

      {/* ===== شريط العنوان ===== */}
      <div className="accounts-print-hide flex items-center justify-between border border-black p-2.5 rounded-xl bg-gradient-to-r from-[#fffdd5] via-[#fff3b4] to-[#ffe986] shadow-sm">
        <div>
          <h1 className={`${HEADING_MOBILE} text-black font-bold tracking-tight`}>
            الحساب الجاري
          </h1>
          <p className="text-[11px] text-[#8c6d3f] font-bold tracking-wide mt-0.5">
            سجل الحركات المالية المُرحّلة
          </p>
        </div>

        <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-[#f5f5dc] border border-black shadow-xs">
          <Landmark className={`${ICON_MOBILE} text-[#1a2a3a]`} />
          <span className="text-xs text-[#1a2a3a] font-bold">القيود</span>
          <span className="text-[#2c3e50] font-mono text-xs sm:text-sm tabular-nums font-black">
            {accounts.length}
          </span>
        </div>
      </div>

      {/* ===== بطاقات الإجماليات (3 بطاقات في سطر) ===== */}
      <div className="accounts-print-hide grid grid-cols-3 gap-1.5">
        <LedgerStat
          label="الإيرادات"
          style={{
            background: "linear-gradient(135deg, #fffdf5 0%, #fff3c4 45%, #ffe985 100%)",
            borderColor: "#000",
            color: "#7a5c00",
            boxShadow: "inset 0 1px 0 rgba(255,255,255,0.9)",
          }}
          value={totalIncome}
          tone="income"
          icon={<ArrowUpRight className="text-[#7a5c00] font-bold" />}
        />

        <LedgerStat
          label="المصروفات"
          style={{
            background: "linear-gradient(135deg, #fff6f5 0%, #ffd9d3 45%, #ffb8ac 100%)",
            borderColor: "#000",
            color: "#7a2a1a",
            boxShadow: "inset 0 1px 0 rgba(255,255,255,0.9)",
          }}
          value={totalExpense}
          tone="expense"
          icon={<ArrowDownLeft className="text-[#7a2a1a] font-bold" />}
        />

        <LedgerStat
          label="الرصيد"
          style={{
            background: "linear-gradient(135deg, #f4fbff 0%, #d9f0f7 45%, #b9e6f0 100%)",
            borderColor: "#000",
            color: "#0f4a5c",
            boxShadow: "inset 0 1px 0 rgba(255,255,255,0.9)",
          }}
          value={currentBalance}
          tone="balance"
          icon={<Wallet className="text-[#0f4a5c] font-bold" />}
        />
      </div>

      {/* ===== التقارير الدورية (حقول مرتبة 2 في سطر) ===== */}
      <div
        className="accounts-print-hide rounded-xl p-2.5 sm:p-3 border border-2-black text-[#1a2a3a]"
        style={{
          background: "linear-gradient(135deg, #f0f7f4 50%, #e2ecc9 50%)",
        }}
      >
        <div className="mb-2">
          <h2 className="text-lg:font-black text-[#1a2a3a]">
            تقارير الحساب الدورية
          </h2>
          <p className="text-[12px] text-[#5c2a1a] font-bold">
            اختر الفترة ثم صدّر التقرير
          </p>
        </div>

        {/* شبكة حقول التقارير: 2 حقل لكل سطر */}
        <div className="grid grid-cols-2 gap-2">
          <div>
            <label className="block text-[13px] font-black text-black mb-1">
              نوع التقرير
            </label>
            <select
              value={accountReportMode}
              onChange={(e) => {
                const nextMode = e.target.value as "quarter" | "halfYear" | "year";
                setAccountReportMode(nextMode);
                setAccountReportPeriod(1);
              }}
              className="w-full px-2 py-2 border border-black bg-[#1a2a3a] text-[#ffe985] text-xm font-bold rounded-lg outline-none"
            >
              <option value="quarter">ربع سنوي</option>
              <option value="halfYear">نصف سنوي</option>
              <option value="year">سنوي</option>
            </select>
          </div>

          {accountReportMode !== "year" ? (
            <div>
              <label className="block text-[11px] font-black text-[#1a2a3a] mb-1">
                الفترة
              </label>
              <select
                value={accountReportPeriod}
                onChange={(e) => setAccountReportPeriod(Number(e.target.value))}
                className="w-full px-2 py-1.5 border border-black bg-[#1a2a3a] text-[#ffe985] text-xs font-bold rounded-lg outline-none"
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
          ) : (
            <div>
              <label className="block text-[11px] font-black text-[#1a2a3a] mb-1">
                السنة
              </label>
              <input
                type="number"
                value={accountReportYear}
                onChange={(e) =>
                  setAccountReportYear(Number(e.target.value) || accountReportYear)
                }
                className="w-full px-2 py-1.5 border border-black bg-[#1a2a3a] text-[#ffe985] text-xs font-bold font-mono text-center rounded-lg outline-none"
              />
            </div>
          )}

          {accountReportMode !== "year" && (
            <div>
              <label className="block text-[11px] font-black text-[#1a2a3a] mb-1">
                السنة
              </label>
              <input
                type="number"
                value={accountReportYear}
                onChange={(e) =>
                  setAccountReportYear(Number(e.target.value) || accountReportYear)
                }
                className="w-full px-2 py-1.5 border border-black bg-[#1a2a3a] text-[#ffe985] text-xs font-bold font-mono text-center rounded-lg outline-none"
              />
            </div>
          )}

          <div className="col-span-2 flex items-center justify-between gap-2 mt-1 pt-2 border-t border-black/20">
            <div className="text-[11px] font-black text-[#5c2a1a] px-2 py-1 bg-[#d2b48c]/40 rounded-lg border border-black/50 truncate">
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

      {/* ===== لوحة القيد اليدوي والمطابقة (خلفية فاتحة، واضحة وأنيقة) ===== */}
      <div
        className="accounts-print-hide w-full rounded-2xl overflow-hidden border border-1-black shadow-md bg-#451a03"
      >
        <div
          className="px-3 py-2.5 flex items-center justify-between border- border-2-black"
          style={{ background: "linear-gradient(135deg, #451a03 70%, #d777f0 30%)" }}
        >
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg border border-1-black bg-[#1f5ffa] text-white">
              <Plus className={ICON_MOBILE} />
            </div>
            <h2 className="text-xs sm:text-sm font-black text-[#0f2f44]">
              قيد جديد / مطابقة الحوافظ
            </h2>
          </div>

          <div className="web-only-actions">
            <WebActionMenu
              label="إجراءات الإدخال والمطابقة"
              actions={accountEntryWebActions}
            />
          </div>
        </div>

        {/* شبكة زرين في سطر واحد للهواتف */}
        <div className="apk-only-actions p-2 bg-[#f0f6fa] border-b border-black/10 grid grid-cols-2 gap-2">
          <button
            onClick={handleSyncFromHafiza}
            className={`${BTN_MOBILE} flex items-center justify-center gap-1.5 rounded-xl border border-[#1f5f7a]/40 shadow-xs bg-gradient-to-r from-[#1f5f7a] to-[#2e6b8a] text-white hover:brightness-105 active:scale-98 transition-all`}
          >
            <Zap className={ICON_MOBILE} />
            <span className="truncate">مطابقة ٢٠٢٦</span>
          </button>

          <label
            className={`${BTN_MOBILE} relative flex items-center justify-center gap-1.5 rounded-xl border border-amber-600/40 cursor-pointer shadow-xs bg-gradient-to-r from-[#c98a3c] to-[#d89b4c] text-white hover:brightness-105 active:scale-98 transition-all`}
          >
            <FileSpreadsheet className={ICON_MOBILE} />
            <span className="truncate">استيراد إكسل</span>
            <input
              type="file"
              accept=".xlsx, .xls, .csv"
              onChange={handleImportExcel}
              className="absolute h-0 w-0 opacity-0 overflow-hidden"
            />
          </label>
        </div>

        <div className="p-2.5 sm:p-4 bg-gradient-to-b from-[#f8fafc] to-[#eef6fb]">
          {/* شبكة الحقول - حقلين في كل سطر دائماً */}
          <div className="grid grid-cols-2 gap-2">
            {/* السطر 1 */}
            <Field
              label="التاريخ"
              type="date"
              icon={<Calendar className={`${ICON_MOBILE} text-[#1f5f7a]`} />}
              v={form.date}
              on={(v) => setForm({ ...form, date: v })}
              className="bg-white text-[#0f2f44] font-bold border-black/30 focus:border-[#1f5f7a]"
            />
            <Field
              label="رقم الحافظة"
              icon={<Hash className={`${ICON_MOBILE} text-[#1f5f7a]`} />}
              v={form.hafizaNo}
              on={(v) => setForm({ ...form, hafizaNo: v })}
              className="bg-white text-[#0f2f44] font-bold border-black/30 focus:border-[#1f5f7a]"
            />

            {/* السطر 2 */}
            <Field
              label="رقم الإشعار"
              icon={<Hash className={`${ICON_MOBILE} text-[#1f5f7a]`} />}
              v={form.notifyNo}
              on={(v) => setForm({ ...form, notifyNo: v })}
              className="bg-white text-[#0f2f44] font-bold border-black/30 focus:border-[#1f5f7a]"
            />
            <Field
              label="تاريخ التوريد"
              type="date"
              icon={<Calendar className={`${ICON_MOBILE} text-[#1f5f7a]`} />}
              v={form.notifyDate}
              on={(v) => setForm({ ...form, notifyDate: v })}
              className="bg-white text-[#0f2f44] font-bold border-black/30 focus:border-[#1f5f7a]"
            />

            {/* السطر 3 */}
            <Field
              label="رقم الشيك"
              icon={<Ticket className={`${ICON_MOBILE} text-[#1f5f7a]`} />}
              v={form.checkNo}
              on={(v) => setForm({ ...form, checkNo: v })}
              className="bg-white text-[#0f2f44] font-bold border-black/30 focus:border-[#1f5f7a]"
            />
            <Field
              label="تاريخ الشيك"
              type="date"
              icon={<Calendar className={`${ICON_MOBILE} text-[#1f5f7a]`} />}
              v={form.checkDate}
              on={(v) => setForm({ ...form, checkDate: v })}
              className="bg-white text-[#0f2f44] font-bold border-black/30 focus:border-[#1f5f7a]"
            />

            {/* السطر 4 */}
            <div className="w-full">
              <label className="block text-xs font-black mb-1 text-[#0f2f44] truncate">
                البيان والشرح
              </label>
              <div className="relative flex items-center">
                <span className="absolute right-2.5 z-10">
                  <FileText className={`${ICON_MOBILE} text-[#1f5f7a]`} />
                </span>
                <input
                  list="account-descriptions"
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  placeholder="البيان..."
                  className="w-full pr-8 pl-2 py-1.5 text-xs sm:text-sm border border-black/30 rounded-lg outline-none shadow-xs bg-white text-[#0f2f44] font-bold focus:border-[#1f5f7a]"
                />
              </div>
              <datalist id="account-descriptions">
                {Array.from(
                  new Set([
                    ...DESCRIPTIONS,
                    ...accounts.map((a) => a.description).filter(Boolean),
                  ])
                ).map((d) => (
                  <option key={d} value={d} />
                ))}
              </datalist>
            </div>

            <Field
              label="التخصص الطبي"
              icon={<Stethoscope className={`${ICON_MOBILE} text-[#1f5f7a]`} />}
              v={form.specialty}
              on={(v) => setForm({ ...form, specialty: v })}
              className="bg-white text-[#0f2f44] font-bold border-black/30 focus:border-[#1f5f7a]"
            />

            {/* السطر 5 */}
            <Field
              label="الاسم الكامل"
              icon={<User className={`${ICON_MOBILE} text-[#1f5f7a]`} />}
              v={form.name}
              on={(v) => setForm({ ...form, name: v })}
              placeholder="الاسم..."
              className="bg-white text-[#0f2f44] font-bold border-black/30 focus:border-[#1f5f7a]"
            />
            <Field
              label="مبلغ الحافظة"
              type="number"
              icon={<span className="text-[10px] text-[#1f5f7a] font-black">ر.ي</span>}
              v={form.hafizaAmount}
              on={(v) => setForm({ ...form, hafizaAmount: v })}
              className="font-mono tabular-nums numeric-cell bg-white text-[#0f2f44] font-black border-black/30 focus:border-[#1f5f7a]"
            />

            {/* السطر 6 */}
            <Field
              label="الإيرادات"
              type="number"
              icon={<span className="text-[10px] text-[#1E8E5A] font-black">ر.ي</span>}
              v={form.income}
              on={(v) => setForm({ ...form, income: v })}
              placeholder="0.00"
              className="text-[#1E8E5A] font-black font-mono tabular-nums numeric-cell bg-white border-emerald-300 focus:border-emerald-500"
            />
            <Field
              label="المصروفات"
              type="number"
              icon={<span className="text-[10px] text-[#D14343] font-black">ر.ي</span>}
              v={form.expense}
              on={(v) => setForm({ ...form, expense: v })}
              placeholder="0.00"
              className="text-[#D14343] font-black font-mono tabular-nums numeric-cell bg-white border-rose-300 focus:border-rose-500"
            />

            {/* السطر 7: ربط الدليل */}
            <div className="col-span-2">
              <label className="flex items-center gap-1 text-xs font-black mb-1 text-[#0f2f44]">
                <Link className={`${ICON_MOBILE} text-[#1f5f7a]`} /> ربط بدليل هيكل الإيرادات
              </label>
              <select
                value={form.revenueKey}
                onChange={(e) => setForm({ ...form, revenueKey: e.target.value })}
                className="w-full px-2 py-1.5 text-xs border border-black/30 rounded-lg outline-none shadow-xs bg-white text-[#0f2f44] font-bold focus:border-[#1f5f7a]"
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

          {/* شبكة زرين في سطر واحد للإجراءات (ترحيل / مسح) */}
          <div className="grid grid-cols-2 gap-2 pt-3 mt-2 border-t border-black/10">
            <button
              onClick={submit}
              className={`${BTN_MOBILE} flex items-center justify-center gap-1.5 rounded-xl border border-[#1f5f7a]/30 shadow-sm bg-gradient-to-r from-[#1f5f7a] to-[#2e6b8a] text-white hover:brightness-105 active:scale-98 transition-all`}
            >
              <Save className={ICON_MOBILE} />
              <span className="truncate">ترحيل القيد</span>
            </button>
            <button
              onClick={() => setForm(emptyForm)}
              className={`${BTN_MOBILE} flex items-center justify-center gap-1.5 rounded-xl border border-rose-200 shadow-sm bg-[#fff0f0] text-[#a82525] hover:bg-rose-100 transition-all`}
            >
              <Eraser className={ICON_MOBILE} />
              <span className="truncate">مسح</span>
            </button>
          </div>
        </div>
      </div>

      {/* ===== جدول القيود ===== */}
      <div
        className="accounts-print-area w-full rounded-2xl overflow-hidden border border-black shadow-sm bg-white"
      >
        <div
          className="accounts-print-hide px-2 py-2 flex flex-col sm:flex-row justify-between items-stretch sm:items-center gap-1 border- border-black"
          style={{ background: THEME.cream }}
        >
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-[#1E8E5A] animate-pulse"></div>
            <h2 className="text-xs sm:text-sm font-black text-[#0f2f44]">
              سجل الحركات الجارية ({accounts.length})
            </h2>
          </div>
          <div className="grid grid-cols-2 gap-2 w-full sm:w-auto">
            {Object.values(filters).some(Boolean) && (
              <button
                onClick={clearFilters}
                className="px-2 py-1 bg-black/5 text-[#0f2f44] rounded-lg text-xs font-bold"
              >
                مسح الفلاتر
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

        <div className="p-1 sm:p-2">
          <div className="overflow-x-auto overflow-y-auto max-h-[65vh] relative rounded-xl border border-black">
            <table className="w-auto table-auto text-xs text-center font-semibold border-collapse border border-black">
              <thead
                className="sticky top-0 z-20 text-[#0f2f44] font-black text-xs"
                style={{ background: THEME.warmCream }}
              >
                <tr>
                  <th className="border border-black px-1.5 py-1.5 h-auto whitespace-nowrap">م</th>
                  {COLS.map((c) => (
                    <th
                      key={c.key}
                      className="border border-black px-1.5 py-1.5 h-auto whitespace-nowrap cursor-pointer hover:bg-[#cfe4ef] select-none"
                      onClick={() => toggleSort(c.key)}
                    >
                      <div className="flex items-center justify-center gap-1">
                        <span>{c.label}</span>
                        <span className="text-[10px] text-[#1f5f7a] font-mono">
                          {sortIndicator(sortKey === c.key, sortDir)}
                        </span>
                      </div>
                    </th>
                  ))}
                  <th className="border border-black px-1.5 py-1.5 h-auto whitespace-nowrap">إجراءات</th>
                </tr>
                <tr className="accounts-print-hide" style={{ background: THEME.cream }}>
                  <th className="border border-black px-1 py-1 h-auto"></th>
                  {COLS.map((c) => (
                    <th key={c.key} className="border border-black px-1 py-1 h-auto">
                      <input
                        value={filters[c.key] || ""}
                        onChange={(e) => setFilter(c.key, e.target.value)}
                        placeholder="تصفية..."
                        className="w-full px-1 py-0.5 text-[13px] border rounded bg-white text-[#0f2f44] outline-none font-bold"
                      />
                    </th>
                  ))}
                  <th className="border border-black px-1 py-1 h-auto"></th>
                </tr>
              </thead>

              <tbody className="text-[#0f2f44]">
                {filteredWithBalance.length === 0 ? (
                  <tr>
                    <td
                      colSpan={COLS.length + 2}
                      className="text-center font-black border border-black bg-white px-2 py-3 text-xs h-auto"
                    >
                      لا توجد بيانات تطابق مرشحات البحث.
                    </td>
                  </tr>
                ) : (
                  filteredWithBalance.map((acc, index) => (
                    <tr
                      key={acc.id}
                      className="odd:bg-white even:bg-[#f4fafd] hover:bg-[#e3f0f7] transition-colors h-auto"
                    >
                      <td className="border border-black text-center font-mono tabular-nums px-1 py-1 text-xs h-auto whitespace-nowrap">
                        {index + 1}
                      </td>
                      <td className="border border-black font-mono tabular-nums text-center px-1 py-1 text-xs h-auto whitespace-nowrap">
                        {acc.date}
                      </td>
                      <td className="border border-black font-mono tabular-nums font-black text-center px-1 py-1 text-xs h-auto whitespace-nowrap">
                        {acc.hafizaNo || "—"}
                      </td>
                      <td className="border border-black font-mono tabular-nums text-center px-1 py-1 text-xs h-auto whitespace-nowrap">
                        {acc.notifyNo || "—"}
                      </td>
                      <td className="border border-black font-mono tabular-nums text-center px-1 py-1 text-xs h-auto whitespace-nowrap">
                        {acc.notifyDate || "—"}
                      </td>
                      <td className="border border-black font-mono tabular-nums text-center px-1 py-1 text-xs h-auto whitespace-nowrap">
                        {acc.checkNo || "—"}
                      </td>
                      <td className="border border-black font-mono tabular-nums text-center px-1 py-1 text-xs h-auto whitespace-nowrap">
                        {acc.checkDate || "—"}
                      </td>
                      <td className="border border-black px-1.5 py-1 text-xs h-auto whitespace-normal break-words">
                        {acc.description || "—"}
                      </td>
                      <td className="border border-black px-1.5 py-1 text-xs h-auto whitespace-normal break-words">
                        {acc.specialty || "—"}
                      </td>
                      <td className="border border-black font-black px-1.5 py-1 text-xs h-auto whitespace-normal break-words">
                        {acc.name || "—"}
                      </td>
                      <td className="border border-black font-mono tabular-nums text-center px-1 py-1 text-xs h-auto whitespace-nowrap">
                        {Number(acc.hafizaAmount) > 0 ? fmt(Number(acc.hafizaAmount)) : "—"}
                      </td>
                      <td className="border border-black font-mono tabular-nums font-black text-center bg-[#1E8E5A]/[0.06] px-1 py-1 text-xs h-auto whitespace-nowrap">
                        {Number(acc.income) > 0 ? fmt(Number(acc.income)) : "—"}
                      </td>
                      <td className="border border-black font-mono tabular-nums font-black text-center bg-[#D14343]/[0.06] px-1 py-1 text-xs h-auto whitespace-nowrap">
                        {Number(acc.expense) > 0 ? fmt(Number(acc.expense)) : "—"}
                      </td>

                      <td className="accounts-print-hide border border-black text-center px-1 py-1 text-xs h-auto min-w-[5rem]">
                        <select
                          value={acc.revenueKey || ""}
                          onChange={(e) => {
                            const newKey = e.target.value;
                            updateAccount(acc.id, { ...acc, revenueKey: newKey || undefined });
                            toast.success("تم ربط رمز الإيراد بنجاح");
                          }}
                          className="w-full p-0.5 text-[11px] font-black text-[#7C3AED] bg-[#7C3AED]/5 border rounded outline-none"
                        >
                          <option value="">— ربط الرمز —</option>
                          {revenueTypes.map((t) => (
                            <option key={t.key} value={t.key}>
                              {t.key}
                            </option>
                          ))}
                        </select>
                      </td>

                      <td className="border border-black font-mono tabular-nums font-black text-center bg-[#1f5f7a]/[0.06] px-1 py-1 text-xs h-auto whitespace-nowrap">
                        {fmt(acc.balance)}
                      </td>
                      <td className="accounts-print-hide border border-black text-center px-1 py-1 text-xs h-auto whitespace-nowrap">
                        <div className="flex justify-center gap-1">
                          <button
                            onClick={() => setEditingRow(acc)}
                            className="p-1 text-[#1E8E5A] hover:bg-[#1E8E5A]/10 rounded"
                            aria-label="تعديل"
                          >
                            <Edit className={ICON_MOBILE} />
                          </button>
                          <button
                            onClick={() => {
                              if (confirm("هل أنت متأكد من الحذف؟")) deleteAccount(acc.id);
                            }}
                            className="p-1 text-[#D14343] hover:bg-[#D14343]/10 rounded"
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
                  <tr className="bg-[#E7E2D8] h-auto">
                    <td colSpan={10} className="border border-black text-left font-black px-2 py-1.5 text-xs h-auto">
                      رصيد الإقفال
                    </td>
                    <td className="border border-black font-mono tabular-nums font-black text-center px-1 py-1.5 text-xs h-auto whitespace-nowrap">
                      {fmt(totalIncome)}
                    </td>
                    <td className="border border-black font-mono tabular-nums font-black text-center px-1 py-1.5 text-xs h-auto whitespace-nowrap">
                      {fmt(totalExpense)}
                    </td>
                    <td className="border border-black px-1 py-1.5 text-xs h-auto"></td>
                    <td className="border border-black font-mono tabular-nums font-black text-center bg-[#1f5f7a]/10 px-1 py-1.5 text-xs h-auto whitespace-nowrap">
                      {fmt(currentBalance)}
                    </td>
                    <td className="accounts-print-hide border border-black px-1 py-1.5 text-xs h-auto"></td>
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
          <form onSubmit={handleEditSave} className="space-y-3">
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-xs font-black text-[#0f2f44] mb-1">
                  التاريخ
                </label>
                <input
                  type="date"
                  value={editingRow.date}
                  onChange={(e) => setEditingRow({ ...editingRow, date: e.target.value })}
                  className="w-full p-1.5 text-xs border border-black/30 rounded-lg outline-none bg-white font-bold"
                  required
                />
              </div>
              <div>
                <label className="block text-xs font-black text-[#0f2f44] mb-1">
                  رقم الحافظة
                </label>
                <input
                  value={editingRow.hafizaNo}
                  onChange={(e) => setEditingRow({ ...editingRow, hafizaNo: e.target.value })}
                  className="w-full p-1.5 text-xs border border-black/30 rounded-lg outline-none bg-white font-bold"
                />
              </div>
              <div>
                <label className="block text-xs font-black text-[#0f2f44] mb-1">
                  رقم الإشعار
                </label>
                <input
                  value={editingRow.notifyNo}
                  onChange={(e) => setEditingRow({ ...editingRow, notifyNo: e.target.value })}
                  className="w-full p-1.5 text-xs border border-black/30 rounded-lg outline-none bg-white font-bold"
                />
              </div>
              <div>
                <label className="block text-xs font-black text-[#0f2f44] mb-1">
                  تاريخ التوريد
                </label>
                <input
                  type="date"
                  value={editingRow.notifyDate}
                  onChange={(e) => setEditingRow({ ...editingRow, notifyDate: e.target.value })}
                  className="w-full p-1.5 text-xs border border-black/30 rounded-lg outline-none bg-white font-bold"
                />
              </div>
              <div className="col-span-2">
                <label className="block text-xs font-black text-[#0f2f44] mb-1">
                  البيان والشرح
                </label>
                <input
                  value={editingRow.description}
                  onChange={(e) => setEditingRow({ ...editingRow, description: e.target.value })}
                  className="w-full p-1.5 text-xs border border-black/30 rounded-lg outline-none bg-white font-bold"
                />
              </div>
              <div>
                <label className="block text-xs font-black text-[#0f2f44] mb-1">
                  الاسم
                </label>
                <input
                  value={editingRow.name}
                  onChange={(e) => setEditingRow({ ...editingRow, name: e.target.value })}
                  className="w-full p-1.5 text-xs border border-black/30 rounded-lg outline-none bg-white font-bold"
                />
              </div>
              <div>
                <label className="block text-xs font-black text-[#0f2f44] mb-1">
                  مبلغ الحافظة
                </label>
                <input
                  type="number"
                  value={editingRow.hafizaAmount}
                  onChange={(e) => setEditingRow({ ...editingRow, hafizaAmount: e.target.value })}
                  className="w-full p-1.5 text-xs border border-black/30 rounded-lg outline-none bg-white font-bold font-mono tabular-nums"
                />
              </div>
              <div>
                <label className="block text-xs font-black text-[#1E8E5A] mb-1">
                  الإيرادات
                </label>
                <input
                  type="number"
                  value={editingRow.income}
                  onChange={(e) => setEditingRow({ ...editingRow, income: e.target.value })}
                  className="w-full p-1.5 text-xs border border-black/30 rounded-lg bg-[#1E8E5A]/5 text-[#1E8E5A] font-black font-mono tabular-nums"
                />
              </div>
              <div>
                <label className="block text-xs font-black text-[#D14343] mb-1">
                  المصروفات
                </label>
                <input
                  type="number"
                  value={editingRow.expense}
                  onChange={(e) => setEditingRow({ ...editingRow, expense: e.target.value })}
                  className="w-full p-1.5 text-xs border border-black/30 rounded-lg bg-[#D14343]/5 text-[#D14343] font-black font-mono tabular-nums"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2 pt-3 border-t border-black/20">
              <button
                type="button"
                onClick={() => setEditingRow(null)}
                className="w-full py-1.5 bg-gray-200 text-[#0f2f44] rounded-lg font-bold text-xs"
              >
                إلغاء
              </button>
              <button
                type="submit"
                className="w-full py-1.5 bg-[#0f2f44] text-white rounded-lg font-black text-xs"
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
