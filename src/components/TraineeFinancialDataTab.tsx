import React, { useDeferredValue, useEffect, useMemo, useRef, useState } from "react";
import "./TraineeFinancialDataTab.css";
import {
  AlertTriangle,
  Download,
  FileSpreadsheet,
  Pencil,
  Plus,
  Printer,
  RotateCcw,
  Save,
  Search,
  Trash2,
  Upload,
  X,
  WalletCards,
} from "lucide-react";
import { toast } from "sonner";
import database from "@/data/traineeFinancialDatabase.json";
import { useStore, type TraineeFinancialRecord } from "@/lib/store";
import { isRegistrationFeeDescription } from "@/lib/feeClassification";
import { openBrowserPrintPreview } from "@/lib/browserPrintPreview";
import { deliverBlobToUser, isNativeFileStorageAvailable, saveBlobToInternalStorage } from "@/lib/nativeFileStorage";
import { escapeHtml, reportLetterheadHtml } from "@/lib/printTableHtml";
import { calculateTraineeFeeSchedule, isRegistrationFeeExemptBatch, recalculateTraineeFinancialRecord, STUDY_YEARS_HEADER, TRAINEE_FEE_SCHEDULE_HEADERS } from "@/lib/traineeFinancialCalculations";

const HEADERS = database.headers as string[];
const REGISTRY_HEADER = HEADERS[1];
const VISIBLE_BASE_HEADERS = [
  HEADERS[0], HEADERS[2], HEADERS[3], HEADERS[4], STUDY_YEARS_HEADER, HEADERS[5], ...HEADERS.slice(6),
];
const SHEET_NAME = database.sheetName;
const TITLE = database.title;
const RULES = database.rules;
const PAYMENT_SUMMARY_HEADERS = [
  "المسدد من رسوم القيد والتسجيل",
  "المسدد من رسوم الامتحان الكتابي الأول",
  "المسدد من رسوم الامتحان الكتابي النهائي",
  "المسدد من رسوم الامتحان السريري الشفوي",
  "المسدد من رسوم الامتحانات",
  "حالة سداد رسوم القيد والتسجيل",
  "حالة سداد رسوم الامتحانات",
  "إجمالي المسدد من رسوم القيد والامتحانات",
  "المتبقي من رسوم القيد والامتحانات",
] as const;
const CURRENCY_COLUMNS = new Set([
  "المسدد من رسوم القيد والتسجيل",
  "المسدد من رسوم الامتحان الكتابي الأول",
  "المسدد من رسوم الامتحان الكتابي النهائي",
  "المسدد من رسوم الامتحان السريري الشفوي",
  "المسدد من رسوم الامتحانات",
  "إجمالي المسدد من رسوم القيد والامتحانات",
  "المتبقي من رسوم القيد والامتحانات",
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
const normalizeTraineeName = (value: unknown) =>
  String(value ?? "")
    .trim()
    .replace(/[ًٌٍَُِّْـ]/g, "")
    .replace(/[إأآ]/g, "ا")
    .replace(/ى/g, "ي")
    .replace(/[ـ،,.]/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .split(" ")
    .filter(Boolean)
    .sort()
    .join(" ");


const normalizeAcademicStatus = (value: unknown) =>
  String(value ?? "")
    .trim()
    .replace(/[ًٌٍَُِّْـ]/g, "")
    .replace(/[إأآ]/g, "ا")
    .replace(/ى/g, "ي")
    .replace(/ة/g, "ه")
    .replace(/\s+/g, " ")
    .toLocaleLowerCase("ar");

const getAcademicStatusRowClass = (value: unknown) => {
  const status = normalizeAcademicStatus(value);
  if (!status) return "";
  if (["منسحب", "منسحبه", "انسحب", "انسحبت", "منقطع", "منقطعه", "مستقيل", "مستقيله"].includes(status))
    return "bg-red-200 [&>td]:!bg-red-200";
  if (["مفصول", "مفصوله", "فصل", "راسب", "راسبه"].includes(status))
    return "bg-yellow-200 [&>td]:!bg-yellow-200";
  if (["متخرج", "متخرجه", "خريج", "خريجه"].includes(status))
    return "bg-green-200 [&>td]:!bg-green-200";
  if (["موقوف", "موقوفه", "معتذر", "معتذره"].includes(status))
    return "bg-orange-200 [&>td]:!bg-orange-200";
  if (["مؤجل", "مؤجله"].includes(status))
    return "bg-sky-100 [&>td]:!bg-sky-100";
  if (["مستمر", "مستمره", "منتظم", "منتظمه", "على راس العمل"].includes(status))
    return "bg-emerald-50 [&>td]:!bg-emerald-50";
  return "";
};
const formatValue = (value: unknown, header: string) =>
  CURRENCY_COLUMNS.has(header) && typeof value === "number"
    ? value.toLocaleString("en-US")
    : String(value ?? "");
const parseAmount = (value: unknown) => Number(String(value ?? 0).replace(/[,٬\s]/g, "")) || 0;
const normalizeDescription = (value: unknown) =>
  String(value ?? "")
    .replace(/[ًٌٍَُِّْـ]/g, "")
    .replace(/[إأآ]/g, "ا")
    .replace(/\s+/g, " ");
const normalizeBatchKey = (value: unknown) => normalizeAcademicStatus(value).replace(/^الدفعة\s*/, "").replace(/^دفعة\s*/, "").replace(/\s+/g, "");
const displayColumnHeader = (header: string) => ({
  "موعد الكتابي الأول": "حالة الكتابي الأول",
  "موعد الكتابي النهائي": "حالة الكتابي النهائي",
  "موعد السريري الشفوي": "حالة السريري الشفوي",
}[header] || header);

const TABLE_META_HEADERS = [...VISIBLE_BASE_HEADERS.slice(0, 6).filter((header) => header !== STUDY_YEARS_HEADER), "بداية الدراسة"] as const;

const FEE_TABLE_GROUPS = [
  {
    title: "رسوم القيد والتسجيل",
    className: "fee-group-registration",
    columns: [
      { header: "موعد استحقاق القيد والتسجيل", label: "موعد الاستحقاق" },
      { header: "حالة سداد رسوم القيد والتسجيل", label: "حالة السداد" },
      { header: "رسوم القيد والتسجيل", label: "قيمة الرسم" },
      { header: "المسدد من رسوم القيد والتسجيل", label: "المسدد" },
    ],
  },
  {
    title: "امتحان الكتابي الأول",
    className: "fee-group-first-written",
    columns: [
      { header: "موعد الكتابي الأول المتوقع", label: "موعد الامتحان" },
      { header: "موعد الكتابي الأول", label: "الحالة" },
      { header: "رسم الكتابي الأول", label: "الرسم" },
      { header: "المسدد من رسوم الامتحان الكتابي الأول", label: "المسدد" },
    ],
  },
  {
    title: "امتحان الكتابي النهائي",
    className: "fee-group-final-written",
    columns: [
      { header: "موعد الكتابي النهائي المتوقع", label: "موعد الامتحان" },
      { header: "موعد الكتابي النهائي", label: "الحالة" },
      { header: "رسم الكتابي النهائي", label: "الرسم" },
      { header: "المسدد من رسوم الامتحان الكتابي النهائي", label: "المسدد" },
    ],
  },
  {
    title: "الامتحان السريري الشفوي",
    className: "fee-group-clinical",
    columns: [
      { header: "موعد السريري الشفوي المتوقع", label: "موعد الامتحان" },
      { header: "موعد السريري الشفوي", label: "الحالة" },
      { header: "رسم السريري الشفوي", label: "الرسم" },
      { header: "المسدد من رسوم الامتحان السريري الشفوي", label: "المسدد" },
    ],
  },
] as const;

const FEE_GROUP_PAYMENT_HEADERS = [
  "المسدد من رسوم القيد والتسجيل",
  "المسدد من رسوم الامتحان الكتابي الأول",
  "المسدد من رسوم الامتحان الكتابي النهائي",
  "المسدد من رسوم الامتحان السريري الشفوي",
] as const;
const TABLE_PAYMENT_SUMMARY_HEADERS = PAYMENT_SUMMARY_HEADERS.filter(
  (header) => header !== "حالة سداد رسوم القيد والتسجيل" && !FEE_GROUP_PAYMENT_HEADERS.includes(header as (typeof FEE_GROUP_PAYMENT_HEADERS)[number]),
);
const TABLE_TOTAL_HEADERS = [
  "إجمالي رسوم الامتحانات",
  "إجمالي المستحق الكلي (ريال)",
] as const;

export default function TraineeFinancialDataTab() {
  const records = useStore((state) => state.traineeFinancialRecords);
  const setRecords = useStore((state) => state.setTraineeFinancialRecords);
  const customColumns = useStore((state) => state.traineeFinancialCustomColumns);
  const setCustomColumns = useStore((state) => state.setTraineeFinancialCustomColumns);
  const hiddenColumns = useStore((state) => state.traineeFinancialHiddenColumns || []);
  const setHiddenColumns = useStore((state) => state.setTraineeFinancialHiddenColumns);
  const batchStudyStartDates = useStore((state) => state.traineeBatchStudyStartDates || {});
  const setBatchStudyStartDates = useStore((state) => state.setTraineeBatchStudyStartDates);
  const hafiza = useStore((state) => state.hafiza);
  const installments2026 = useStore((state) => state.installments);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const columns = useMemo(() => [...VISIBLE_BASE_HEADERS, ...customColumns], [customColumns]);
  const visibleMetaHeaders = useMemo(() => TABLE_META_HEADERS.filter((header) => !hiddenColumns.includes(header)), [hiddenColumns]);
  const visibleFeeGroups = useMemo(
    () => FEE_TABLE_GROUPS.map((group) => ({ ...group, columns: group.columns.filter((column) => !hiddenColumns.includes(column.header)) }))
      .filter((group) => group.columns.length > 0),
    [hiddenColumns],
  );
  const visibleSummaryHeaders = useMemo<string[]>(
    () => [...TABLE_PAYMENT_SUMMARY_HEADERS, ...TABLE_TOTAL_HEADERS].filter((header) => !hiddenColumns.includes(header)),
    [hiddenColumns],
  );
  const visibleCustomColumns = useMemo(() => customColumns.filter((header) => !hiddenColumns.includes(header)), [customColumns, hiddenColumns]);
  // إزالة العمود من العرض فقط؛ القيم الأصلية تظل محفوظة ويمكن استعادتها.
  const tableColumns = useMemo(() => [
    ...visibleMetaHeaders,
    ...visibleFeeGroups.flatMap((group) => group.columns.map((column) => column.header)),
    ...visibleSummaryHeaders,
    ...visibleCustomColumns,
  ], [visibleMetaHeaders, visibleFeeGroups, visibleSummaryHeaders, visibleCustomColumns]);
  // يحافظ ملف Excel على كامل الحقول الأصلية، بما فيها بيانات الأقساط المخفية من عرض الجدول.
  const exportColumns = useMemo(() => [
    ...VISIBLE_BASE_HEADERS.slice(0, 6),
    ...TRAINEE_FEE_SCHEDULE_HEADERS,
    ...VISIBLE_BASE_HEADERS.slice(6),
    ...PAYMENT_SUMMARY_HEADERS,
    ...customColumns,
  ], [customColumns]);
  const batchOptions = useMemo(() => {
    const options = new Map<string, string>();
    (records || []).forEach((row) => {
      const label = normalize(row[HEADERS[3]]);
      const key = normalizeBatchKey(label);
      if (key && !["غيرمحدد", "منسحب"].includes(key) && !options.has(key)) options.set(key, label);
    });
    return Array.from(options.entries()).sort((a, b) => a[1].localeCompare(b[1], "ar", { numeric: true }));
  }, [records]);
  const [query, setQuery] = useState("");
  const deferredQuery = useDeferredValue(query);
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [draft, setDraft] = useState<TraineeFinancialRecord>({});
  const [sort, setSort] = useState<{ key: string; desc: boolean } | null>(null);
  const [cardTrainee, setCardTrainee] = useState<TraineeFinancialRecord | null>(null);

  const addColumn = () => {
    const name = normalize(window.prompt("اكتب اسم العمود الجديد:") || "");
    if (!name) return;
    if (columns.some((column) => normalize(column) === name)) {
      toast.error("يوجد عمود بهذا الاسم بالفعل");
      return;
    }
    setCustomColumns([...customColumns, name]);
    toast.success(`تمت إضافة العمود «${name}»`);
  };

  const hideColumn = (name: string) => {
    if (!window.confirm(`إزالة العمود «${name}» من الجدول؟ ستبقى بياناته محفوظة ويمكن استعادته لاحقاً.`)) return;
    setHiddenColumns(Array.from(new Set([...hiddenColumns, name])));
    if (sort?.key === name) setSort(null);
    toast.success(`تمت إزالة العمود «${name}» من العرض مع الاحتفاظ ببياناته`);
  };
  const restoreHiddenColumns = () => {
    setHiddenColumns([]);
    toast.success("تمت استعادة جميع الأعمدة المخفية");
  };
  const getFeeGroupForColumn = (header: string) => FEE_TABLE_GROUPS.find((group) => group.columns.some((column) => column.header === header));
  const isFirstColumnInFeeGroup = (header: string) => visibleFeeGroups.some((group) => group.columns[0]?.header === header);

  // تدقيق مستقل للأسماء: لا يغير المطابقة المالية أو أي بيانات محفوظة.
  const nameAuditByName = useMemo(() => {
    type NameAudit = {
      status: "exact" | "variant" | "spacing" | "typo" | "missing";
      candidate?: string;
    };
    const rawKey = (value: unknown) => String(value ?? "")
      .normalize("NFKC")
      .replace(/[\u0610-\u061A\u064B-\u065F\u0670\u06D6-\u06ED]/g, "")
      .replace(/[\u0640\u200B-\u200F\uFEFF]/g, "")
      .replace(/\s+/g, " ")
      .trim()
      .toLocaleLowerCase("ar");
    const compactKey = (value: unknown) => rawKey(value).replace(/[^\p{L}\p{N}]/gu, "");
    const differsByOneCharacter = (left: string, right: string) => {
      const a = Array.from(left);
      const b = Array.from(right);
      if (a.length < 6 || b.length < 6 || Math.abs(a.length - b.length) > 1 || left === right) return false;
      let i = 0;
      let j = 0;
      let edits = 0;
      while (i < a.length && j < b.length) {
        if (a[i] === b[j]) {
          i += 1;
          j += 1;
          continue;
        }
        edits += 1;
        if (edits > 1) return false;
        if (a.length > b.length) i += 1;
        else if (b.length > a.length) j += 1;
        else {
          i += 1;
          j += 1;
        }
      }
      if (i < a.length || j < b.length) edits += 1;
      return edits === 1;
    };

    const names = Array.from(new Set((hafiza || [])
      .map((item) => normalize(item.name))
      .filter(Boolean)));
    const hafizaNames = names.map((name) => ({
      name,
      raw: rawKey(name),
      canonical: normalizeTraineeName(name),
      compact: compactKey(name),
    }));
    const audits = new Map<string, NameAudit>();

    (records || []).forEach((record) => {
      const traineeName = normalize(record[HEADERS[2]]);
      if (!traineeName) return;
      const raw = rawKey(traineeName);
      const canonical = normalizeTraineeName(traineeName);
      const compact = compactKey(traineeName);

      if (hafizaNames.some((item) => item.raw === raw)) {
        audits.set(traineeName, { status: "exact" });
        return;
      }
      const variant = hafizaNames.find((item) => item.canonical === canonical);
      if (variant) {
        audits.set(traineeName, { status: "variant", candidate: variant.name });
        return;
      }
      const spacing = hafizaNames.find((item) => item.compact === compact && compact.length > 0);
      if (spacing) {
        audits.set(traineeName, { status: "spacing", candidate: spacing.name });
        return;
      }
      const typo = hafizaNames.find((item) => differsByOneCharacter(compact, item.compact));
      audits.set(traineeName, typo
        ? { status: "typo", candidate: typo.name }
        : { status: "missing" });
    });

    return audits;
  }, [records, hafiza]);
  const nameAuditWarningCount = (records || []).filter((record) => {
    const name = normalize(record[HEADERS[2]]);
    return Boolean(name && nameAuditByName.get(name)?.status !== "exact");
  }).length;

  // مزامنة متدربي الدفعة السادسة من جدول أقساط 2026 إلى قاعدة بيانات المتدربين.
  // تتم الإضافة/استكمال الحقول الناقصة فقط، دون تعديل سجلات الأقساط أو بيانات المتدرب الأخرى.
  useEffect(() => {
    const isSixthBatch = (value: unknown) => {
      const batch = normalize(value)
        .replace(/[ًٌٍَُِّْـ]/g, "")
        .replace(/[إأآ]/g, "ا")
        .replace(/\s+/g, "")
        .replace(/^الدفعة/, "")
        .replace(/^دفعة/, "");
      return batch === "السادسة" || batch === "سادسة" ||
        batch === "السادس" || batch === "سادس" ||
        batch === "6" || batch === "٦";
    };

    const sixthBatchRows = (installments2026 || []).filter((row) => isSixthBatch(row.batch));
    if (!sixthBatchRows.length) return;

    const nextRecords = [...(records || [])];
    let changed = false;

    sixthBatchRows.forEach((installment) => {
      const name = normalizeTraineeName(installment.name);
      if (!name) return;

      const existingIndex = nextRecords.findIndex((record) => {
        const sameName = normalizeTraineeName(record[HEADERS[2]]) === name;
        const existingBatch = normalize(record[HEADERS[3]]);
        // استكمل رقم الدفعة للمتدرب الموجود إذا كان حقل الدفعة فارغاً،
        // أو حدّث التخصص الناقص إذا كان مسجلاً بالفعل في الدفعة السادسة.
        return sameName && (!existingBatch || isSixthBatch(existingBatch));
      });

      if (existingIndex >= 0) {
        const existing = nextRecords[existingIndex];
        const next = { ...existing };
        if (!normalize(next[HEADERS[3]])) next[HEADERS[3]] = installment.batch || "السادسة";
        if (!normalize(next[HEADERS[5]])) next[HEADERS[5]] = installment.specialty || "";
        if (next[HEADERS[3]] !== existing[HEADERS[3]] ||
            next[HEADERS[5]] !== existing[HEADERS[5]]) {
          nextRecords[existingIndex] = next;
          changed = true;
        }
        return;
      }

      // إذا كان الاسم موجوداً ببيانات دفعة أخرى فلا ندمج السجلين ولا نستبدل بياناته.
      const duplicateInSource = nextRecords.some((record) =>
        normalizeTraineeName(record[HEADERS[2]]) === name &&
        isSixthBatch(record[HEADERS[3]])
      );
      if (duplicateInSource) return;

      nextRecords.push({
        [HEADERS[0]]: nextRecords.length + 1,
        [HEADERS[2]]: installment.name || "",
        [HEADERS[3]]: installment.batch || "السادسة",
        [HEADERS[5]]: installment.specialty || "",
      });
      changed = true;
    });

    if (changed) setRecords(nextRecords);
  }, [installments2026, records, setRecords]);

  const accountCardRows = useMemo(() => {
    if (!cardTrainee) return [];
    const key = normalizeTraineeName(cardTrainee[HEADERS[2]]);
    return (hafiza || [])
      .filter((item) => {
        const amount = parseAmount(item.notifyAmount);
        const description = String(item.description || "");
        const isAllowedFee =
          isRegistrationFeeDescription(description) ||
          /(امتحان|اختبار)/.test(normalizeDescription(description));
        return (
          normalizeTraineeName(item.name) === key &&
          Boolean(normalize(item.hafizaNo)) &&
          Boolean(normalize(item.notifyNo)) &&
          amount > 0 &&
          isAllowedFee
        );
      })
      .sort((a, b) =>
        String(a.notifyDate || a.date || "").localeCompare(String(b.notifyDate || b.date || "")),
      );
  }, [cardTrainee, hafiza]);

  const printTraineeAccountCard = () => {
    if (!cardTrainee) return;
    const value = (key: string, fallback = "—") =>
      String(cardTrainee[key] ?? "").trim() || fallback;
    const academicStatus =
      value("الحالة الأكاديمية", "") ||
      value("حالة أكاديمية", "") ||
      value("حالة المتدرب", "غير محدد");
    const info = [
      ["اسم المتدرب", value(HEADERS[2])],
      ["التخصص", value(HEADERS[5])],
      ["رقم الدفعة", value(HEADERS[3])],
      ["المستوى", value(HEADERS[4])],
      ["الحالة الأكاديمية", academicStatus],
    ]
      .map(
        ([label, content]) =>
          `<div class="info"><b>${escapeHtml(label)}</b><span>${escapeHtml(content)}</span></div>`,
      )
      .join("");
    const rows = accountCardRows
      .map((item) => {
        const category = isRegistrationFeeDescription(item.description)
          ? "رسوم القيد والتسجيل"
          : "رسوم الامتحانات/الاختبارات";
        return `<tr><td>${escapeHtml(category)}</td><td>${escapeHtml(item.notifyDate || item.date || "—")}</td><td>${escapeHtml(item.hafizaNo)}</td><td>${escapeHtml(item.notifyNo)}</td><td>${escapeHtml(item.description)}</td><td class="amount">${escapeHtml(parseAmount(item.notifyAmount).toLocaleString("en-US"))}</td></tr>`;
      })
      .join("");
    const total = accountCardRows.reduce((sum, item) => sum + parseAmount(item.notifyAmount), 0);
    const body = `${reportLetterheadHtml()}<h1>كشف بطاقة حساب متدرب</h1><div class="info-grid">${info}</div><table><thead><tr><th>نوع الرسم</th><th>تاريخ التوريد</th><th>رقم الحافظة</th><th>رقم الإشعار</th><th>البيان</th><th>مبلغ التوريد</th></tr></thead><tbody>${rows || '<tr><td colspan="6">لا توجد حركات مطابقة</td></tr>'}</tbody><tfoot><tr><td colspan="5">إجمالي المبالغ المسددة</td><td class="amount">${total.toLocaleString("en-US")}</td></tr></tfoot></table><div class="report-date">تاريخ الطباعة: ${new Date().toLocaleDateString("ar-YE")}</div>`;
    const contentCss = `
      .report-letterhead-block { margin-bottom: 5mm !important; }
      h1 { text-align:center; font-size:18px; margin:4mm 0; font-weight:900; }
      .info-grid { display:grid; grid-template-columns:repeat(3,minmax(0,1fr)); gap:3mm; margin:0 0 5mm; }
      .info {
        min-height:22mm;
        border:1.4px solid #8aa9c2;
        border-radius:3mm;
        padding:3mm 2mm;
        display:flex;
        flex-direction:column;
        align-items:center;
        justify-content:center;
        gap:2mm;
        text-align:center;
        font-size:12px;
        font-weight:800;
        line-height:1.5;
        white-space:normal;
        color:#172b4d;
        background:#eaf3fb;
        box-shadow:0 1mm 2mm rgba(23,43,77,.10);
        print-color-adjust:exact;
        -webkit-print-color-adjust:exact;
      }
      .info b { color:#173b63; font-size:12px; font-weight:900; }
      .info span { color:#111f33; font-size:13px; font-weight:900; overflow-wrap:anywhere; }
      .info:nth-child(2) { background:#e7f5f1; border-color:#78b8a8; }
      .info:nth-child(2) b { color:#145b4c; }
      .info:nth-child(3) { background:#fff2df; border-color:#e3b66e; }
      .info:nth-child(3) b { color:#75430d; }
      .info:nth-child(4) { background:#f0eafd; border-color:#ad98dc; }
      .info:nth-child(4) b { color:#4b347e; }
      .info:nth-child(5) { background:#fcebed; border-color:#d99aa3; }
      .info:nth-child(5) b { color:#7b2938; }
      @media print {
        .info, .info * {
          print-color-adjust:exact !important;
          -webkit-print-color-adjust:exact !important;
        }
      }
      table { width:100%; border-collapse:collapse; table-layout:auto; font-size:9px; }
      th,td { border:1px solid #334155; padding:1.5mm 0; text-align:center; white-space:nowrap; }
      thead th { background:gold !important; color:#fff !important; }
      tfoot td { background:#e2eef5 !important; font-weight:900; }
      .amount { direction:ltr; font-variant-numeric:tabular-nums; }
      .report-date { margin-top:4mm; text-align:left; font-size:9px; }
      @media print { @page { size:A4 landscape; margin:6mm; } }
    `;
    const opened = openBrowserPrintPreview({
      title: `كشف بطاقة حساب متدرب - ${escapeHtml(String(cardTrainee[HEADERS[2]] ?? ""))}`,
      tableHtml: body,
      contentCss,
      defaultOrientation: "landscape",
      defaultPageSize: "A4",
      defaultMarginMm: 6,
    });
    if (!opened) toast.error("تعذر فتح معاينة الطباعة؛ اسمح بالنوافذ المنبثقة في المتصفح");
  };

  const feeScheduleByRecord = useMemo(() => {
    const schedules = new Map<
      TraineeFinancialRecord,
      ReturnType<typeof calculateTraineeFeeSchedule>
    >();

    (records || []).forEach((row) => {
      const batchKey = normalizeBatchKey(row[HEADERS[3]]);
      schedules.set(
        row,
        calculateTraineeFeeSchedule(
          row[HEADERS[3]],
          batchStudyStartDates[batchKey],
          new Date(),
          row[STUDY_YEARS_HEADER],
        ),
      );
    });

    return schedules;
  }, [records, batchStudyStartDates]);

  const getDisplayValue = (row: TraineeFinancialRecord, header: string) => {
    if (header === "رسوم القيد والتسجيل" && isRegistrationFeeExemptBatch(row[HEADERS[3]])) return 0;
    if (header === "إجمالي المستحق الكلي (ريال)") {
      return (isRegistrationFeeExemptBatch(row[HEADERS[3]]) ? 0 : parseAmount(row["رسوم القيد والتسجيل"])) +
        parseAmount(row["الأقساط الدراسية المستحقة"]) + parseAmount(row["إجمالي رسوم الامتحانات"]);
    }
    if (TRAINEE_FEE_SCHEDULE_HEADERS.includes(header as (typeof TRAINEE_FEE_SCHEDULE_HEADERS)[number])) {
      const schedule = feeScheduleByRecord.get(row);
      return schedule?.[header as (typeof TRAINEE_FEE_SCHEDULE_HEADERS)[number]] ?? "";
    }
    if (PAYMENT_SUMMARY_HEADERS.includes(header as (typeof PAYMENT_SUMMARY_HEADERS)[number])) {
      const summary = getFeePaymentSummary(row);
      const values: Record<(typeof PAYMENT_SUMMARY_HEADERS)[number], string | number> = {
        "المسدد من رسوم القيد والتسجيل": summary.registrationPaid,
        "المسدد من رسوم الامتحان الكتابي الأول": summary.firstWrittenPaid,
        "المسدد من رسوم الامتحان الكتابي النهائي": summary.finalWrittenPaid,
        "المسدد من رسوم الامتحان السريري الشفوي": summary.clinicalPaid,
        "المسدد من رسوم الامتحانات": summary.examsPaid,
        "حالة سداد رسوم القيد والتسجيل": summary.registrationStatus,
        "حالة سداد رسوم الامتحانات": summary.examsStatus,
        "إجمالي المسدد من رسوم القيد والامتحانات": summary.totalPaid,
        "المتبقي من رسوم القيد والامتحانات": summary.remaining,
      };
      return values[header as (typeof PAYMENT_SUMMARY_HEADERS)[number]];
    }
    return row[header] ?? "";
  };


  const feePaymentSummaryByTrainee = useMemo(() => {
    const summaries = new Map<string, { registrationPaid: number; firstWrittenPaid: number; finalWrittenPaid: number; clinicalPaid: number; examsPaid: number }>();

    // Create one accumulator per normalized trainee name.
    (records || []).forEach((record) => {
      const key = normalizeTraineeName(record[HEADERS[2]]);
      if (key && !summaries.has(key)) {
        summaries.set(key, { registrationPaid: 0, firstWrittenPaid: 0, finalWrittenPaid: 0, clinicalPaid: 0, examsPaid: 0 });
      }
    });

    // Index eligible receipts in one pass instead of filtering all receipts for every trainee.
    (hafiza || []).forEach((item) => {
      const key = normalizeTraineeName(item.name);
      const summary = summaries.get(key);
      if (!summary) return;

      const amount = parseAmount(item.notifyAmount);
      if (
        amount <= 0 ||
        !normalize(item.hafizaNo) ||
        !normalize(item.notifyNo)
      ) return;

      const isRegistration = isRegistrationFeeDescription(item.description);
      const isExam = /(امتحان|اختبار)/.test(normalizeDescription(item.description));
      if (!isRegistration && !isExam) return;

      if (isRegistration) {
        summary.registrationPaid += amount;
      } else if (isExam) {
        summary.examsPaid += amount;
        const description = normalizeDescription(item.description);
        if (/كتابي/.test(description) && /(اول|الأول)/.test(description)) summary.firstWrittenPaid += amount;
        else if (/كتابي/.test(description) && /(نهائي|النهائي)/.test(description)) summary.finalWrittenPaid += amount;
        else if (/(سريري|شفوي)/.test(description)) summary.clinicalPaid += amount;
      }
    });

    return summaries;
  }, [records, hafiza]);

  const feePaymentSummaryByRow = useMemo(() => {
    const map = new Map<
      TraineeFinancialRecord,
      {
        registrationPaid: number;
        firstWrittenPaid: number;
        finalWrittenPaid: number;
        clinicalPaid: number;
        examsPaid: number;
        totalPaid: number;
        registrationStatus: string;
        examsStatus: string;
        remaining: number;
      }
    >();
    const status = (due: number, amountPaid: number) =>
      due <= 0 ? "غير مستحق" : amountPaid <= 0 ? "غير مسدد" : amountPaid < due ? "مسدد جزئياً" : "مسدد";
    (records || []).forEach((row) => {
      const paid = feePaymentSummaryByTrainee.get(normalizeTraineeName(row[HEADERS[2]])) || {
        registrationPaid: 0,
        firstWrittenPaid: 0,
        finalWrittenPaid: 0,
        clinicalPaid: 0,
        examsPaid: 0,
      };
      const registrationDue = isRegistrationFeeExemptBatch(row[HEADERS[3]]) ? 0 : parseAmount(row["رسوم القيد والتسجيل"]);
      const examsDue = parseAmount(row["إجمالي رسوم الامتحانات"]);
      map.set(row, {
        ...paid,
        totalPaid: paid.registrationPaid + paid.examsPaid,
        registrationStatus: status(registrationDue, paid.registrationPaid),
        examsStatus: status(examsDue, paid.examsPaid),
        remaining: Math.max(0, registrationDue - paid.registrationPaid) + Math.max(0, examsDue - paid.examsPaid),
      });
    });
    return map;
  }, [records, feePaymentSummaryByTrainee]);

  const getFeePaymentSummary = (row: TraineeFinancialRecord) =>
    feePaymentSummaryByRow.get(row) || {
      registrationPaid: 0,
      firstWrittenPaid: 0,
      finalWrittenPaid: 0,
      clinicalPaid: 0,
      examsPaid: 0,
      totalPaid: 0,
      registrationStatus: "غير مستحق",
      examsStatus: "غير مستحق",
      remaining: 0,
    };

  const visibleRows = useMemo(() => {
    const q = normalize(deferredQuery).toLocaleLowerCase("ar");
    const filtered = (records || [])
      .map((row, index) => ({ row, index }))
      .filter(
        ({ row }) =>
          !q ||
          tableColumns.some((header) => normalize(getDisplayValue(row, header)).toLocaleLowerCase("ar").includes(q)),
      );
    if (sort) {
      filtered.sort((a, b) => {
        const av = getDisplayValue(a.row, sort.key);
        const bv = getDisplayValue(b.row, sort.key);
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
  }, [records, deferredQuery, sort, tableColumns, batchStudyStartDates, feeScheduleByRecord, feePaymentSummaryByRow]);

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
    const nextRow = recalculateTraineeFinancialRecord(
      Object.fromEntries(columns.map((header) => [header, draft[header] ?? ""])),
    );
    if (editingIndex === next.length) next.push(nextRow);
    else next[editingIndex] = nextRow;
    setRecords(next);
    setEditingIndex(null);
    toast.success("تم حفظ بيانات المتدرب");
  };
  const addRow = () => {
    const row = Object.fromEntries(columns.map((header) => [header, ""])) as TraineeFinancialRecord;
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

  const exportExcel = async () => {
    const XLSX = await import("xlsx");
    const aoa: unknown[][] = [
      [TITLE],
      [RULES],
      [],
      exportColumns,
      ...records.map((row) => exportColumns.map((header) => getDisplayValue(row, header))),
    ];
    const sheet = XLSX.utils.aoa_to_sheet(aoa);
    sheet["!views"] = [{ rightToLeft: true }];
    sheet["!cols"] = exportColumns.map((header) => ({
      wch: Math.min(34, Math.max(14, header.length + 4)),
      // إخفاء حقول الأقساط السنوية في ملف العرض مع الاحتفاظ بقيمها لاستيرادها دون فقدان.
      hidden: header === STUDY_YEARS_HEADER || header === "مواعيد استحقاق الأقساط السنوية" || header === "الأقساط الدراسية المستحقة",
    }));
    sheet["!autofilter"] = {
      ref: `A4:${XLSX.utils.encode_col(exportColumns.length - 1)}${records.length + 4}`,
    };
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, sheet, SHEET_NAME.slice(0, 31));
    if (isNativeFileStorageAvailable()) {
      const buffer = XLSX.write(workbook, { bookType: "xlsx", type: "array" });
      const blob = new Blob([buffer], {
        type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      });
      try {
        await deliverBlobToUser(blob, "بيانات_المتدربين.xlsx");
      } catch {
        await saveBlobToInternalStorage(blob, "بيانات_المتدربين.xlsx");
      }
      toast.success("تم تصدير بيانات المتدربين");
      return;
    }
    XLSX.writeFile(workbook, "بيانات_المتدربين.xlsx");
    toast.success("تم تصدير بيانات المتدربين");
  };

  const printTraineeDataTable = () => {
    const metaHeaders = visibleMetaHeaders.map(
      (header) => `<th rowspan="2" class="meta-header">${escapeHtml(displayColumnHeader(header))}</th>`,
    ).join("");
    const feeGroupHeaders = visibleFeeGroups.map(
      (group) => `<th colspan="${group.columns.length}" class="fee-category-group ${group.className} fee-group-start">${escapeHtml(group.title)}</th>`,
    ).join("");
    const summaryColumnCount = visibleSummaryHeaders.length;
    const summaryGroupHeader = summaryColumnCount
      ? `<th colspan="${summaryColumnCount}" class="fee-category-group fee-group-summary fee-group-start">ملخص السداد والإجماليات</th>`
      : "";
    const customGroupHeader = visibleCustomColumns.length
      ? `<th colspan="${visibleCustomColumns.length}" class="fee-category-group fee-group-custom fee-group-start">حقول إضافية</th>`
      : "";
    const feeSubHeaders = visibleFeeGroups.flatMap((group) =>
      group.columns.map((column, index) =>
        `<th class="fee-subcolumn ${group.className}-sub ${index === 0 ? "fee-group-start" : ""}">${escapeHtml(column.label)}</th>`,
      ),
    ).join("");
    const summarySubHeaders = visibleSummaryHeaders
      .map((header, index) => `<th class="fee-subcolumn fee-group-summary-sub ${index === 0 ? "fee-group-start" : ""}">${escapeHtml(displayColumnHeader(header))}</th>`)
      .join("");
    const customSubHeaders = visibleCustomColumns
      .map((label, index) => `<th class="fee-subcolumn fee-group-custom-sub ${index === 0 ? "fee-group-start" : ""}">${escapeHtml(label)}</th>`)
      .join("");
    const tableHead = `<tr>${metaHeaders}${feeGroupHeaders}${summaryGroupHeader}${customGroupHeader}</tr><tr>${feeSubHeaders}${summarySubHeaders}${customSubHeaders}</tr>`;
    const getPrintStatusClass = (value: unknown) => {
      const status = normalizeAcademicStatus(value);
      if (["منسحب", "منسحبه", "انسحب", "انسحبت", "منقطع", "منقطعه", "مستقيل", "مستقيله"].includes(status)) return "status-withdrawn";
      if (["مفصول", "مفصوله", "فصل", "راسب", "راسبه"].includes(status)) return "status-dismissed";
      if (["متخرج", "متخرجه", "خريج", "خريجه"].includes(status)) return "status-graduate";
      if (["موقوف", "موقوفه", "معتذر", "معتذره"].includes(status)) return "status-paused";
      if (["مؤجل", "مؤجله"].includes(status)) return "status-postponed";
      if (["مستمر", "مستمره", "منتظم", "منتظمه", "على راس العمل"].includes(status)) return "status-active";
      return "";
    };
    const tableBody = visibleRows.map(({ row, index }) =>
      `<tr class="${getPrintStatusClass(row["الحالة الأكاديمية"]) || (index % 2 ? "row-even" : "row-odd")}">${tableColumns.map((header) => {
        const group = getFeeGroupForColumn(header);
        const groupStart = isFirstColumnInFeeGroup(header) || visibleSummaryHeaders[0] === header || visibleCustomColumns[0] === header;
        const groupClass = group ? group.className : visibleSummaryHeaders.includes(header) ? "fee-group-summary" : visibleCustomColumns.includes(header) ? "fee-group-custom" : "";
        return `<td class="${groupClass}-cell ${groupStart ? "fee-group-start" : ""}">${escapeHtml(getDisplayValue(row, header))}</td>`;
      }).join("")}</tr>`,
    ).join("");
    const firstFinancialHeader = visibleFeeGroups[0]?.columns[0]?.header || visibleSummaryHeaders[0] || visibleCustomColumns[0];
    const firstFinancialIndex = firstFinancialHeader ? tableColumns.indexOf(firstFinancialHeader) : tableColumns.length;
    const footerCells = tableColumns.slice(firstFinancialIndex).map((header) => {
      if (!CURRENCY_COLUMNS.has(header)) return "<td></td>";
      const total = visibleRows.reduce((sum, item) => sum + parseAmount(getDisplayValue(item.row, header)), 0);
      return `<td class="amount">${total.toLocaleString("en-US")}</td>`;
    }).join("");
    const tableHtml = `${reportLetterheadHtml()}<h1>${escapeHtml(TITLE)}</h1><p class="rule-line">${escapeHtml(RULES)}</p><p class="record-count">عدد السجلات المعروضة: ${visibleRows.length}</p><table class="trainee-data-print-table"><thead>${tableHead}</thead><tbody>${tableBody || `<tr><td colspan="${tableColumns.length}">لا توجد سجلات مطابقة</td></tr>`}</tbody><tfoot><tr><td colspan="${firstFinancialIndex}" class="total-label">الإجمالي العام للسجلات المعروضة</td>${footerCells}</tr></tfoot></table><p class="report-date">تاريخ الطباعة: ${new Date().toLocaleDateString("ar-YE")}</p>`;
    const contentCss = `
      h1 { text-align:center; font-size:16px; margin:3mm 0; font-weight:900; }
      .rule-line { text-align:center; font-size:8px; font-weight:800; margin:2mm 0; }
      .record-count { text-align:right; font-size:8px; font-weight:800; margin:2mm 0; }
      table { width:100%; border-collapse:collapse; table-layout:auto; font-size:7px; }
      th,td { border:1px solid #000 !important; padding:1mm .6mm; text-align:center; vertical-align:middle; white-space:normal; overflow-wrap:anywhere; line-height:1.25; font-family:"Cairo",sans-serif; font-weight:800; -webkit-print-color-adjust:exact !important; print-color-adjust:exact !important; }
      .fee-group-start { border-inline-start:4px double #17212b !important; }
      thead tr:first-child th { background:linear-gradient(180deg,#246b8d 0%,#104968 100%) !important; color:#fff !important; font-weight:900; }
      thead tr:nth-child(2) th { background:#f4e4b5 !important; color:#17212b !important; font-weight:900; }
      thead th.fee-category-group { color:#fff !important; }
      thead th.fee-group-registration { background:linear-gradient(180deg,#168b83,#075c59) !important; }
      thead th.fee-group-first-written { background:linear-gradient(180deg,#2d77a8,#164c75) !important; }
      thead th.fee-group-final-written { background:linear-gradient(180deg,#7256a4,#493476) !important; }
      thead th.fee-group-clinical { background:linear-gradient(180deg,#b06a38,#7b3f20) !important; }
      thead th.fee-group-summary { background:linear-gradient(180deg,#4b6175,#293d50) !important; }
      thead th.fee-group-custom { background:linear-gradient(180deg,#667b4d,#3f512f) !important; }
      thead th.fee-group-registration-sub { background:linear-gradient(180deg,#d5f1ed,#a9ddd5) !important; color:#064e4b !important; border-color:#168b83 !important; }
      thead th.fee-group-first-written-sub { background:linear-gradient(180deg,#dceefa,#b8d9ed) !important; color:#103e62 !important; border-color:#2d77a8 !important; }
      thead th.fee-group-final-written-sub { background:linear-gradient(180deg,#eee8f8,#d8c9ee) !important; color:#3d2b67 !important; border-color:#7256a4 !important; }
      thead th.fee-group-clinical-sub { background:linear-gradient(180deg,#f8e7d9,#edc9ae) !important; color:#683317 !important; border-color:#b06a38 !important; }
      thead th.fee-group-summary-sub { background:linear-gradient(180deg,#e1e8ef,#c5d2df) !important; color:#1e3142 !important; border-color:#71869a !important; }
      thead th.fee-group-custom-sub { background:linear-gradient(180deg,#e8eedf,#cbd9b8) !important; color:#354426 !important; border-color:#667b4d !important; }
      tbody td { background:#fff !important; color:#111 !important; }
      tbody tr.row-even td { background:#f0f9ff !important; }
      tbody tr.row-odd td { background:#fff !important; }
      /* ألوان خفيفة لأعمدة تفاصيل كل رسم، مطابقة لألوان رؤوس مجموعاتها. */
      .trainee-data-print-table tbody td.fee-group-registration-cell { background:#effaf8 !important; border-color:#a9d8d2 !important; }
      .trainee-data-print-table tbody td.fee-group-first-written-cell { background:#f0f7fc !important; border-color:#b8d9ed !important; }
      .trainee-data-print-table tbody td.fee-group-final-written-cell { background:#f6f2fb !important; border-color:#d8c9ee !important; }
      .trainee-data-print-table tbody td.fee-group-clinical-cell { background:#fcf5ef !important; border-color:#edc9ae !important; }
      tbody tr.status-withdrawn td { background:#fecaca !important; }
      tbody tr.status-dismissed td { background:#fef08a !important; }
      tbody tr.status-graduate td { background:#bbf7d0 !important; }
      tbody tr.status-paused td { background:#fed7aa !important; }
      tbody tr.status-postponed td { background:#e0f2fe !important; }
      tbody tr.status-active td { background:#d1fae5 !important; }
      tfoot td { background:linear-gradient(180deg,#bfdbfe 0%,#60a5fa 48%,#1d4ed8 100%) !important; color:#fff !important; font-weight:900; border-color:#1e40af !important; }
      .total-label { text-align:right; }
      .amount { direction:ltr; white-space:nowrap; font-variant-numeric:tabular-nums; }
      .report-date { margin-top:4mm; text-align:left; font-size:8px; }

      /* أولوية أعلى من القواعد العامة اللاحقة في browserPrintPreview؛ خاصة بهذا الجدول فقط. */
      #paperContainer #tableContainer table.trainee-data-print-table th,
      #paperContainer #tableContainer table.trainee-data-print-table td {
        border:1px solid #000 !important;
        font-family:"Cairo",sans-serif !important;
        font-weight:800 !important;
        -webkit-print-color-adjust:exact !important;
        print-color-adjust:exact !important;
      }
      #paperContainer #tableContainer table.trainee-data-print-table thead tr:first-child th {
        background:linear-gradient(180deg,#246b8d 0%,#104968 100%) !important;
        color:#fff !important;
        font-weight:900 !important;
      }
      #paperContainer #tableContainer table.trainee-data-print-table thead th.fee-group-registration {
        background:linear-gradient(180deg,#168b83,#075c59) !important;
        color:#fff !important;
        border-color:#064e4b !important;
      }
      #paperContainer #tableContainer table.trainee-data-print-table thead th.fee-group-first-written {
        background:linear-gradient(180deg,#2d77a8,#164c75) !important;
        color:#fff !important;
        border-color:#103e62 !important;
      }
      #paperContainer #tableContainer table.trainee-data-print-table thead th.fee-group-final-written {
        background:linear-gradient(180deg,#7256a4,#493476) !important;
        color:#fff !important;
        border-color:#3d2b67 !important;
      }
      #paperContainer #tableContainer table.trainee-data-print-table thead th.fee-group-clinical {
        background:linear-gradient(180deg,#b06a38,#7b3f20) !important;
        color:#fff !important;
        border-color:#683317 !important;
      }
      #paperContainer #tableContainer table.trainee-data-print-table thead th.fee-group-summary {
        background:linear-gradient(180deg,#4b6175,#293d50) !important;
        color:#fff !important;
        border-color:#1e3142 !important;
      }
      #paperContainer #tableContainer table.trainee-data-print-table thead th.fee-group-custom {
        background:linear-gradient(180deg,#667b4d,#3f512f) !important;
        color:#fff !important;
        border-color:#354426 !important;
      }
      #paperContainer #tableContainer table.trainee-data-print-table thead tr:nth-child(2) th {
        background:linear-gradient(180deg,#f4e4b5,#e9cc80) !important;
        color:#17212b !important;
        font-weight:900 !important;
      }
      #paperContainer #tableContainer table.trainee-data-print-table thead th.fee-group-registration-sub {
        background:linear-gradient(180deg,#d5f1ed,#a9ddd5) !important;
        color:#064e4b !important;
        border-color:#168b83 !important;
      }
      #paperContainer #tableContainer table.trainee-data-print-table thead th.fee-group-first-written-sub {
        background:linear-gradient(180deg,#dceefa,#b8d9ed) !important;
        color:#103e62 !important;
        border-color:#2d77a8 !important;
      }
      #paperContainer #tableContainer table.trainee-data-print-table thead th.fee-group-final-written-sub {
        background:linear-gradient(180deg,#eee8f8,#d8c9ee) !important;
        color:#3d2b67 !important;
        border-color:#7256a4 !important;
      }
      #paperContainer #tableContainer table.trainee-data-print-table thead th.fee-group-clinical-sub {
        background:linear-gradient(180deg,#f8e7d9,#edc9ae) !important;
        color:#683317 !important;
        border-color:#b06a38 !important;
      }
      #paperContainer #tableContainer table.trainee-data-print-table thead th.fee-group-summary-sub {
        background:linear-gradient(180deg,#e1e8ef,#c5d2df) !important;
        color:#1e3142 !important;
        border-color:#71869a !important;
      }
      #paperContainer #tableContainer table.trainee-data-print-table thead th.fee-group-custom-sub {
        background:linear-gradient(180deg,#e8eedf,#cbd9b8) !important;
        color:#354426 !important;
        border-color:#667b4d !important;
      }
      #paperContainer #tableContainer table.trainee-data-print-table tbody td {
        background:#fff !important;
        color:#111 !important;
      }
      #paperContainer #tableContainer table.trainee-data-print-table tbody tr.row-even td {
        background:#f0f9ff !important;
      }
      #paperContainer #tableContainer table.trainee-data-print-table tbody tr.row-odd td {
        background:#fff !important;
      }
      /* أولوية مرتفعة حتى لا تطغى القواعد العامة لمعاينة المتصفح على تلوين مجموعات الرسوم. */
      #paperContainer #tableContainer table.trainee-data-print-table tbody td.fee-group-registration-cell {
        background:#effaf8 !important; border-color:#a9d8d2 !important;
      }
      #paperContainer #tableContainer table.trainee-data-print-table tbody td.fee-group-first-written-cell {
        background:#f0f7fc !important; border-color:#b8d9ed !important;
      }
      #paperContainer #tableContainer table.trainee-data-print-table tbody td.fee-group-final-written-cell {
        background:#f6f2fb !important; border-color:#d8c9ee !important;
      }
      #paperContainer #tableContainer table.trainee-data-print-table tbody td.fee-group-clinical-cell {
        background:#fcf5ef !important; border-color:#edc9ae !important;
      }
      #paperContainer #tableContainer table.trainee-data-print-table .fee-group-start {
        border-inline-start:4px double #17212b !important;
      }
      #paperContainer #tableContainer table.trainee-data-print-table thead th.fee-category-group.fee-group-start {
        border-inline-start:5px double rgba(255,255,255,.95) !important;
      }
      #paperContainer #tableContainer table.trainee-data-print-table tbody tr.status-withdrawn td {
        background:#fecaca !important;
      }
      #paperContainer #tableContainer table.trainee-data-print-table tbody tr.status-dismissed td {
        background:#fef08a !important;
      }
      #paperContainer #tableContainer table.trainee-data-print-table tbody tr.status-graduate td {
        background:#bbf7d0 !important;
      }
      #paperContainer #tableContainer table.trainee-data-print-table tbody tr.status-paused td {
        background:#fed7aa !important;
      }
      #paperContainer #tableContainer table.trainee-data-print-table tbody tr.status-postponed td {
        background:#e0f2fe !important;
      }
      #paperContainer #tableContainer table.trainee-data-print-table tbody tr.status-active td {
        background:#ecfdf5 !important;
      }
      #paperContainer #tableContainer table.trainee-data-print-table tfoot td {
        background:linear-gradient(180deg,#bfdbfe 0%,#60a5fa 48%,#1d4ed8 100%) !important;
        color:#fff !important;
        font-weight:900 !important;
        border-color:#1e40af !important;
      }
      @media print { @page { size:A3 landscape; margin:6mm; } }
    `;
    const opened = openBrowserPrintPreview({
      title: "جدول بيانات المتدربين ومواعيد وحالات الرسوم",
      tableHtml,
      contentCss,
      defaultOrientation: "landscape",
      defaultPageSize: "A3",
      defaultMarginMm: 6,
    });
    if (!opened) toast.error("تعذر فتح معاينة الطباعة؛ اسمح بالنوافذ المنبثقة في المتصفح");
  };

  const importExcel = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;
    try {
      const XLSX = await import("xlsx");
      const workbook = XLSX.read(await file.arrayBuffer(), { type: "array", cellDates: true });
      let imported: TraineeFinancialRecord[] | null = null;
      let nextCustomColumns = customColumns;
      for (const sheetName of workbook.SheetNames) {
        const sheet = workbook.Sheets[sheetName];
        const matrix = XLSX.utils.sheet_to_json<unknown[]>(sheet, {
          header: 1,
          defval: "",
          raw: true,
        });
        const headerIndex = matrix.findIndex((row) => {
          const values = new Set(row.map(normalize));
          return values.has(HEADERS[2]) && values.has(HEADERS[6]);
        });
        if (headerIndex < 0) continue;
        const sourceHeaders = matrix[headerIndex].map(normalize);
        const importedCustomColumns = sourceHeaders.filter(
          (header) =>
            header &&
            !HEADERS.includes(header) &&
            !TRAINEE_FEE_SCHEDULE_HEADERS.includes(header as (typeof TRAINEE_FEE_SCHEDULE_HEADERS)[number]) &&
            !PAYMENT_SUMMARY_HEADERS.includes(header as (typeof PAYMENT_SUMMARY_HEADERS)[number]) &&
            header !== STUDY_YEARS_HEADER &&
            header !== REGISTRY_HEADER,
        );
        const mergedCustomColumns = [...new Set([...customColumns, ...importedCustomColumns])];
        nextCustomColumns = mergedCustomColumns;
        const importedColumns = [...VISIBLE_BASE_HEADERS, ...mergedCustomColumns];
        const indexes = importedColumns.map((header) => sourceHeaders.indexOf(header));
        const rows = matrix.slice(headerIndex + 1).flatMap((row) => {
          if (!row.some((value) => normalize(value))) return [];
          const record = Object.fromEntries(
            importedColumns.map((header, i) => [
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
          "لم أجد ورقة تحتوي الأعمدة المطلوبة (اسم المتدرب، رسوم القيد والتسجيل)",
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
      setCustomColumns(nextCustomColumns);
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
          records.reduce((sum, row) => sum + parseAmount(getDisplayValue(row, header)), 0),
        ]),
      ),
    [records, hafiza, batchStudyStartDates, feePaymentSummaryByTrainee],
  );

  return (
    <div className="mizan-trainee-financial-tab min-h-[calc(100dvh-140px)] bg-[#f4f9fd] p-2 text-slate-900 sm:p-4" dir="rtl">
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
          <div className="grid w-full grid-cols-3 gap-2 sm:grid-cols-3 xl:w-auto xl:grid-cols-3">
            <button type="button" onClick={addRow} className="flex min-h-[68px] flex-col items-center justify-center gap-1 rounded-xl border border-white/70 bg-gradient-to-br from-sky-500 via-blue-600 to-blue-800 px-2 py-2 text-xs font-black text-white shadow-[inset_0_2px_0_rgba(255,255,255,.45),0_4px_0_#173575,0_7px_12px_rgba(15,23,42,.18)] active:translate-y-0.5">
              <Plus className="h-5 w-5" /> إضافة صف
            </button>
            <button type="button" onClick={addColumn} className="flex min-h-[68px] flex-col items-center justify-center gap-1 rounded-xl border border-white/70 bg-gradient-to-br from-violet-500 via-purple-600 to-purple-800 px-2 py-2 text-xs font-black text-white shadow-[inset_0_2px_0_rgba(255,255,255,.45),0_4px_0_#4c1d95,0_7px_12px_rgba(15,23,42,.18)] active:translate-y-0.5">
              <Plus className="h-5 w-5" /> إضافة عمود
            </button>
            {hiddenColumns.length > 0 && (
              <button type="button" onClick={restoreHiddenColumns} className="flex min-h-[68px] flex-col items-center justify-center gap-1 rounded-xl border border-white/70 bg-gradient-to-br from-slate-500 via-slate-600 to-slate-800 px-2 py-2 text-xs font-black text-white shadow-[inset_0_2px_0_rgba(255,255,255,.35),0_4px_0_#334155,0_7px_12px_rgba(15,23,42,.18)] active:translate-y-0.5">
                <RotateCcw className="h-5 w-5" /> استعادة الأعمدة ({hiddenColumns.length})
              </button>
            )}
            <button type="button" onClick={() => fileInputRef.current?.click()} className="flex min-h-[68px] flex-col items-center justify-center gap-1 rounded-xl border border-white/70 bg-gradient-to-br from-teal-400 via-teal-600 to-teal-800 px-2 py-2 text-xs font-black text-white shadow-[inset_0_2px_0_rgba(255,255,255,.45),0_4px_0_#115e59,0_7px_12px_rgba(15,23,42,.18)] active:translate-y-0.5">
              <Upload className="h-5 w-5" /> استيراد Excel
            </button>
            <button type="button" onClick={exportExcel} className="flex min-h-[68px] flex-col items-center justify-center gap-1 rounded-xl border border-white/70 bg-gradient-to-br from-emerald-400 via-emerald-600 to-emerald-800 px-2 py-2 text-xs font-black text-white shadow-[inset_0_2px_0_rgba(255,255,255,.45),0_4px_0_#065f46,0_7px_12px_rgba(15,23,42,.18)] active:translate-y-0.5">
              <Download className="h-5 w-5" /> تصدير Excel
            </button>
            <button type="button" onClick={printTraineeDataTable} className="flex min-h-[68px] flex-col items-center justify-center gap-1 rounded-xl border border-white/70 bg-gradient-to-br from-amber-400 via-orange-500 to-orange-700 px-2 py-2 text-xs font-black text-white shadow-[inset_0_2px_0_rgba(255,255,255,.45),0_4px_0_#9a3412,0_7px_12px_rgba(15,23,42,.18)] active:translate-y-0.5">
              <Printer className="h-5 w-5" /> طباعة الجدول
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

<section className="mb-3 rounded-2xl border border-[#b8d4e8] bg-gradient-to-br from-white via-[#f5fbff] to-[#e3f0fa] p-3 shadow-[inset_0_1px_0_white,0_5px_15px_rgba(15,23,42,.08)] sm:p-4">
        <div className="mb-2 flex items-center justify-between gap-2">
          <h2 className="font-black text-[#17324d]">بداية الدراسة حسب الدفعة</h2>
          <span className="rounded-lg bg-[#2e6b8a] px-2 py-1 text-[10px] font-extrabold text-white">من 2021 فصاعداً</span>
        </div>
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-2 xl:grid-cols-3">
          {batchOptions.map(([key, label]) => (
            <label key={key} className="flex min-w-0 flex-col gap-1 rounded-xl border border-[#c4d9e8] bg-white/90 p-2 text-xs font-extrabold text-slate-700 shadow-sm">
              <span>{label}</span>
              <input
                type="date"
                min="2021-01-01"
                value={batchStudyStartDates[key] || ""}
                onChange={(event) => {
                  const next = { ...batchStudyStartDates };
                  if (event.target.value) next[key] = event.target.value;
                  else delete next[key];
                  setBatchStudyStartDates(next);
                }}
                className="min-h-10 w-full rounded-lg border border-slate-300 bg-white px-2 py-2 text-sm font-bold text-slate-900 outline-none focus:border-sky-600"
              />
            </label>
          ))}
        </div>
        <div className="mt-3 rounded-xl border border-[#b8d4e8] bg-white/90 p-3 shadow-sm">
          <h3 className="mb-2 font-black text-[#17324d]">ملخص المتدربين حسب الدفعة</h3>
          <div className="grid grid-cols-3 gap-2">
            {batchOptions.map(([key, label], batchIndex) => {
              const batchRecords = (records || []).filter((record) => normalizeBatchKey(record[HEADERS[3]]) === key);
              const counts = { withdrawn: 0, graduates: 0, dismissed: 0, active: 0 };
              batchRecords.forEach((record) => {
                const status = normalizeAcademicStatus(record["الحالة الأكاديمية"]);
                if (["منسحب", "منسحبه", "انسحب", "انسحبت", "منقطع", "منقطعه", "مستقيل", "مستقيله"].includes(status)) counts.withdrawn += 1;
                else if (["متخرج", "متخرجه", "خريج", "خريجه"].includes(status)) counts.graduates += 1;
                else if (["مفصول", "مفصوله", "فصل", "راسب", "راسبه"].includes(status)) counts.dismissed += 1;
                else if (["مستمر", "مستمره", "منتظم", "منتظمه", "على راس العمل"].includes(status)) counts.active += 1;
              });
              return (
                <div key={key} className={"trainee-batch-summary-card trainee-batch-summary-card-" + (batchIndex % 6) + " min-w-0 rounded-xl border p-2"}>
                  <div className="mb-2 flex min-w-0 flex-col items-center gap-1 text-center">
                    <span className="w-full break-words text-[11px] font-black leading-tight">{label}</span>
                    <span className="trainee-batch-summary-count rounded-lg px-2 py-1 text-[10px] font-black">{batchRecords.length} متدرب</span>
                  </div>
                  <div className="grid grid-cols-2 gap-1 text-[9px] font-extrabold leading-tight">
                    <span className="min-w-0 break-words rounded-md bg-red-100 px-1 py-1.5 text-center text-red-800">منسحب: {counts.withdrawn}</span>
                    <span className="min-w-0 break-words rounded-md bg-green-100 px-1 py-1.5 text-center text-green-800">متخرج: {counts.graduates}</span>
                    <span className="min-w-0 break-words rounded-md bg-yellow-100 px-1 py-1.5 text-center text-yellow-900">مفصول: {counts.dismissed}</span>
                    <span className="min-w-0 break-words rounded-md bg-emerald-100 px-1 py-1.5 text-center text-emerald-900">مستمر: {counts.active}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
        <p className="mt-2 text-[11px] font-semibold leading-5 text-slate-600">
          تُحدّث تواريخ القيد والأقساط السنوية ومواعيد الامتحانات التقديرية تلقائياً عند تغيير التاريخ. مواعيد الامتحانات تقديرية وفق تسلسل المستويات الحالي، أما إثبات السداد الفعلي فيبقى من «حوافظ التوريد» فقط.
        </p>
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
          <p className="mb-2 text-xs font-semibold leading-6 text-slate-600">
            تُحسب الرسوم الدراسية تلقائيًا بمبلغ 300,000 ريال عن كل سنة دراسة، مع إعفاء الدفعة الأولى من رسوم القيد والتسجيل والأقساط الدراسية. وتُحدّث حالات مراحل الامتحانات والإجماليات عند تعديل المستوى.
          </p>
          <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-4">
            {columns.map((header) => (
              <label
                key={header}
                className="flex min-w-0 flex-col gap-1 text-xs font-bold text-slate-700"
              >
                {header}
                <input
                  value={String(draft[header] ?? "")}
                  type={header === STUDY_YEARS_HEADER ? "number" : "text"}
                  min={header === STUDY_YEARS_HEADER ? 1 : undefined}
                  step={header === STUDY_YEARS_HEADER ? 1 : undefined}
                  onChange={(event) =>
                    setDraft((current) =>
                      recalculateTraineeFinancialRecord({
                        ...current,
                        [header]:
                          (CURRENCY_COLUMNS.has(header) || header === STUDY_YEARS_HEADER) &&
                          event.target.value !== "" &&
                          Number.isFinite(Number(event.target.value.replace(/[,٬\s]/g, "")))
                            ? Number(event.target.value.replace(/[,٬\s]/g, ""))
                            : event.target.value,
                      }),
                    )
                  }
                  className="min-w-0 rounded-md border border-slate-300 px-2 py-2 text-sm font-semibold text-black outline-none focus:border-sky-600"
                />
              </label>
            ))}
          </div>
        </section>
      )}

      <div className="mb-2 flex flex-wrap items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-bold text-slate-700">
        <span>ألوان الحالة الأكاديمية:</span>
        <span className="rounded px-2 py-1 bg-red-200">منسحب</span>
        <span className="rounded px-2 py-1 bg-yellow-200">مفصول</span>
        <span className="rounded px-2 py-1 bg-green-200">متخرج / متخرجة</span>
        <span className="rounded px-2 py-1 bg-orange-200">موقوف</span>
        <span className="rounded px-2 py-1 bg-sky-100">مؤجل</span>
        <span className="rounded px-2 py-1 bg-emerald-50">مستمر / منتظم</span>
        <span className="inline-flex items-center gap-1 rounded bg-amber-100 px-2 py-1 text-amber-900" title="يظهر التنبيه عند اختلاف الاسم أو المسافات أو عدم العثور على الاسم في حوافظ التوريد">
          <AlertTriangle className="h-3.5 w-3.5" /> تدقيق الاسم: {nameAuditWarningCount}
        </span>
      </div>
      <div
        className="trainee-data-table-wrap overflow-auto rounded-xl border border-slate-400 bg-white shadow-sm"
        style={{ maxHeight: "calc(100dvh - 280px)" }}
      >
        <table
          className="trainee-data-table w-max min-w-full table-auto border-collapse text-center text-sm text-black"
          dir="rtl"
          style={{ width: "max-content", minWidth: "100%", tableLayout: "auto" }}
        >
          <thead className="sticky top-0 z-10 text-white">
            <tr className="trainee-data-group-header-row">
              {visibleMetaHeaders.map((header) => (
                <th key={header} rowSpan={2} className="min-w-[100px] max-w-[240px] border border-slate-500 px-2 py-2 text-[15px] font-black leading-6 text-white">
                  <button
                    type="button"
                    onClick={() => setSort((current) => current?.key === header ? { key: header, desc: !current.desc } : { key: header, desc: false })}
                    className="whitespace-normal break-words"
                  >
                    {displayColumnHeader(header)}
                    {sort?.key === header ? (sort.desc ? " ↓" : " ↑") : " ↕"}
                  </button>
                  <button type="button" title={`إزالة العمود ${header} من الجدول`} onClick={() => hideColumn(header)} className="mr-1 rounded bg-rose-100 px-1 text-rose-800">×</button>
                </th>
              ))}
              {visibleFeeGroups.map((group) => (
                <th key={group.title} colSpan={group.columns.length} className={`fee-category-group ${group.className} fee-group-start border border-slate-500 px-2 py-2 text-[14px] font-black leading-5 text-white`}>
                  {group.title}
                </th>
              ))}
              {visibleSummaryHeaders.length > 0 && (
                <th colSpan={visibleSummaryHeaders.length} className="fee-category-group fee-group-summary fee-group-start border border-slate-500 px-2 py-2 text-[14px] font-black leading-5 text-white">
                  ملخص السداد والإجماليات
                </th>
              )}
              {visibleCustomColumns.length > 0 && (
                <th colSpan={visibleCustomColumns.length} className="fee-category-group fee-group-custom fee-group-start border border-slate-500 px-2 py-2 text-[14px] font-black leading-5 text-white">
                  حقول إضافية
                </th>
              )}
              <th rowSpan={2} className="min-w-[100px] max-w-[220px] border border-slate-500 bg-[#126c8e] px-2 py-2 text-[15px] font-black leading-6 text-white">
                إجراءات
              </th>
            </tr>
            <tr className="trainee-data-subheader-row">
              {visibleFeeGroups.flatMap((group) => group.columns.map((column, index) => ({ ...column, groupClassName: group.className, groupStart: index === 0 }))).map((column) => (
                <th key={column.header} className={`fee-subcolumn ${column.groupClassName}-sub ${column.groupStart ? "fee-group-start" : ""} min-w-[92px] max-w-[170px] border border-slate-400 px-2 py-2 text-[12px] font-extrabold text-slate-900`}>
                  <button
                    type="button"
                    onClick={() => setSort((current) => current?.key === column.header ? { key: column.header, desc: !current.desc } : { key: column.header, desc: false })}
                    className="whitespace-normal break-words"
                  >
                    {column.label}
                    {sort?.key === column.header ? (sort.desc ? " ↓" : " ↑") : " ↕"}
                  </button>
                  <button type="button" title={`إزالة العمود ${column.header} من الجدول`} onClick={() => hideColumn(column.header)} className="mr-1 rounded bg-rose-100 px-1 text-rose-800">×</button>
                </th>
              ))}
              {visibleSummaryHeaders.map((header, index) => (
                <th key={header} className={`fee-subcolumn fee-group-summary-sub ${index === 0 ? "fee-group-start" : ""} min-w-[100px] max-w-[190px] border border-slate-400 px-2 py-2 text-[12px] font-extrabold text-slate-900`}>
                  <button
                    type="button"
                    onClick={() => setSort((current) => current?.key === header ? { key: header, desc: !current.desc } : { key: header, desc: false })}
                    className="whitespace-normal break-words"
                  >
                    {displayColumnHeader(header)}
                    {sort?.key === header ? (sort.desc ? " ↓" : " ↑") : " ↕"}
                  </button>
                  <button type="button" title={`إزالة العمود ${header} من الجدول`} onClick={() => hideColumn(header)} className="mr-1 rounded bg-rose-100 px-1 text-rose-800">×</button>
                </th>
              ))}
              {visibleCustomColumns.map((header, index) => (
                <th key={header} className={`fee-subcolumn fee-group-custom-sub ${index === 0 ? "fee-group-start" : ""} min-w-[100px] max-w-[190px] border border-slate-400 px-2 py-2 text-[12px] font-extrabold text-slate-900`}>
                  <button
                    type="button"
                    onClick={() => setSort((current) => current?.key === header ? { key: header, desc: !current.desc } : { key: header, desc: false })}
                    className="whitespace-normal break-words"
                  >
                    {header}
                    {sort?.key === header ? (sort.desc ? " ↓" : " ↑") : " ↕"}
                  </button>
                  <button
                    type="button"
                    title={`حذف العمود ${header}`}
                    onClick={() => hideColumn(header)}
                    className="mr-1 rounded bg-rose-100 px-1 text-rose-800"
                  >
                    ×
                  </button>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {visibleRows.map(({ row, index }) => (
              <tr
                key={`${index}-${String(row[HEADERS[2]] ?? "")}`}
                className={getAcademicStatusRowClass(row["الحالة الأكاديمية"]) || (index % 2 ? "bg-slate-50" : "bg-white")}
              >
                {tableColumns.map((header) => {
                  const group = getFeeGroupForColumn(header);
                  const groupClass = group ? group.className : visibleSummaryHeaders.includes(header) ? "fee-group-summary" : visibleCustomColumns.includes(header) ? "fee-group-custom" : "";
                  const groupStart = isFirstColumnInFeeGroup(header) || visibleSummaryHeaders[0] === header || visibleCustomColumns[0] === header;
                  return (
                  <td
                    key={header}
                    className={`max-w-[280px] border border-slate-300 px-2 py-1.5 text-[14px] font-bold leading-6 text-black [overflow-wrap:anywhere] ${groupClass}-cell ${groupStart ? "fee-group-start" : ""}`}
                  >
                    {header === HEADERS[2] ? (
                      <span className="inline-flex max-w-full flex-wrap items-center justify-center gap-1.5">
                        <span>{formatValue(getDisplayValue(row, header), header)}</span>
                        {(() => {
                          const audit = nameAuditByName.get(normalize(row[HEADERS[2]]));
                          if (!audit || audit.status === "exact") return null;
                          const badgeText = audit.status === "missing"
                            ? "غير موجود"
                            : audit.status === "spacing"
                              ? "مسافات"
                              : audit.status === "typo"
                                ? "اختلاف حرف"
                                : "اختلاف كتابة";
                          const detail = audit.status === "missing"
                            ? "لا يوجد اسم مطابق لهذا المتدرب في حوافظ التوريد."
                            : `الاسم يحتاج مراجعة. الاسم الأقرب المسجل في الحوافظ: ${audit.candidate}`;
                          return (
                            <span
                              className={`inline-flex items-center gap-0.5 rounded-full border px-1.5 py-0.5 text-[10px] font-black leading-4 ${audit.status === "missing" ? "border-rose-300 bg-rose-100 text-rose-800" : "border-amber-300 bg-amber-100 text-amber-900"}`}
                              title={detail}
                              aria-label={detail}
                            >
                              <AlertTriangle className="h-3 w-3 shrink-0" />
                              {badgeText}
                            </span>
                          );
                        })()}
                      </span>
                    ) : formatValue(getDisplayValue(row, header), header)}
                  </td>
                  );
                })}
                <td className="min-w-[170px] border border-slate-300 bg-white px-1 py-1 text-black">
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
                  <button
                    type="button"
                    title="عرض بطاقة حساب المتدرب"
                    onClick={() => setCardTrainee(row)}
                    className="mx-0.5 inline-flex items-center gap-1 rounded bg-sky-100 px-2 py-1.5 text-sky-900"
                  >
                    <WalletCards className="h-4 w-4" /> بطاقة حساب متدرب
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
          <tfoot className="bg-[#e2eef5] font-extrabold text-black">
            <tr>
              <td
                colSpan={visibleFeeGroups[0]?.columns[0]?.header
                  ? tableColumns.indexOf(visibleFeeGroups[0].columns[0].header)
                  : (visibleSummaryHeaders[0] || visibleCustomColumns[0])
                    ? tableColumns.indexOf(visibleSummaryHeaders[0] || visibleCustomColumns[0])
                    : tableColumns.length}
                className="border border-slate-500 px-2 py-2 text-right text-[14px] font-black text-black"
              >
                الإجمالي العام ({records.length} متدربًا)
              </td>
              {tableColumns.slice(
                visibleFeeGroups[0]?.columns[0]?.header
                  ? tableColumns.indexOf(visibleFeeGroups[0].columns[0].header)
                  : (visibleSummaryHeaders[0] || visibleCustomColumns[0])
                    ? tableColumns.indexOf(visibleSummaryHeaders[0] || visibleCustomColumns[0])
                    : tableColumns.length,
              ).map((header) => (
                <td key={header} className="max-w-[280px] border border-slate-500 px-2 py-2 text-[14px] font-black text-black [overflow-wrap:anywhere]">
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
      {cardTrainee !== null && (
        <div
          className="fixed inset-0 z-[120] flex items-center justify-center bg-slate-950/60 p-2 sm:p-5"
          role="dialog"
          aria-modal="true"
          aria-label="بطاقة حساب المتدرب"
        >
          <section className="max-h-[92dvh] w-full max-w-5xl overflow-hidden rounded-2xl border border-sky-200 bg-white shadow-2xl">
            <header className="flex items-center justify-between gap-3 bg-[#176db1] px-4 py-3 text-white">
              <div>
                <h2 className="text-lg font-black">بطاقة حساب متدرب</h2>
                <p className="text-sm font-bold">{String(cardTrainee[HEADERS[2]] ?? "")}</p>
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={printTraineeAccountCard}
                  className="inline-flex items-center gap-1.5 rounded-lg bg-white px-3 py-2 text-sm font-extrabold text-[#176db1]"
                >
                  <Printer className="h-4 w-4" /> طباعة كشف البطاقة
                </button>
                <button
                  type="button"
                  onClick={() => setCardTrainee(null)}
                  aria-label="إغلاق"
                  className="rounded-lg bg-white/15 p-2"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
            </header>
            <div className="max-h-[calc(92dvh-90px)] overflow-auto p-3">
              <p className="mb-2 text-xs font-bold text-slate-600">
                تُعرض حركات رسوم القيد والتسجيل والامتحانات/الاختبارات فقط إذا توفر رقم الحافظة ورقم
                الإشعار ومبلغ توريد موجب.
              </p>
              <div className="overflow-auto rounded-lg border border-slate-300">
                <table className="w-full border-collapse text-center text-xs" dir="rtl">
                  <thead className="sticky top-0 bg-[#126c8e] text-white">
                    <tr>
                      {[
                        "نوع الرسم",
                        "التاريخ",
                        "رقم الحافظة",
                        "رقم الإشعار",
                        "البيان",
                        "مبلغ التوريد",
                      ].map((header) => (
                        <th
                          key={header}
                          className="whitespace-nowrap border border-slate-400 px-0 py-2"
                        >
                          {header}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {accountCardRows.map((item, index) => {
                      const description = String(item.description || "");
                      const category = isRegistrationFeeDescription(description)
                        ? "رسوم القيد والتسجيل"
                        : "رسوم الامتحانات/الاختبارات";
                      const amount = parseAmount(item.notifyAmount);
                      return (
                        <tr
                          key={`${item.id}-${index}`}
                          className={index % 2 ? "bg-slate-50" : "bg-white"}
                        >
                          <td className="whitespace-nowrap border border-slate-300 px-0 py-2">
                            {category}
                          </td>
                          <td className="whitespace-nowrap border border-slate-300 px-0 py-2">
                            {item.notifyDate || item.date || "—"}
                          </td>
                          <td className="whitespace-nowrap border border-slate-300 px-0 py-2">
                            {item.hafizaNo}
                          </td>
                          <td className="whitespace-nowrap border border-slate-300 px-0 py-2">
                            {item.notifyNo}
                          </td>
                          <td className="whitespace-nowrap border border-slate-300 px-0 py-2">
                            {description}
                          </td>
                          <td className="whitespace-nowrap border border-slate-300 px-0 py-2 font-bold">
                            {amount.toLocaleString("en-US")}
                          </td>
                        </tr>
                      );
                    })}
                    {!accountCardRows.length && (
                      <tr>
                        <td colSpan={6} className="p-8 text-center font-bold text-slate-500">
                          لا توجد حركات مطابقة ببيانات الحوافظ المتاحة.
                        </td>
                      </tr>
                    )}
                  </tbody>
                  {accountCardRows.length > 0 && (
                    <tfoot className="bg-[#e2eef5] font-black">
                      <tr>
                        <td colSpan={5} className="border border-slate-400 px-2 py-2 text-right">
                          إجمالي المبالغ المسددة
                        </td>
                        <td className="whitespace-nowrap border border-slate-400 px-0 py-2">
                          {accountCardRows
                            .reduce((sum, item) => sum + parseAmount(item.notifyAmount), 0)
                            .toLocaleString("en-US")}
                        </td>
                      </tr>
                    </tfoot>
                  )}
                </table>
              </div>
            </div>
          </section>
        </div>
      )}
      <p className="mt-2 text-[11px] font-semibold text-slate-600">
        البيانات محفوظة تلقائيًا على هذا الجهاز. استيراد ملف Excel يستبدل الجدول الحالي بعد التأكيد.
      </p>
    </div>
  );
}
