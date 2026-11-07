import * as XLSX from "xlsx";
import type { Installment } from "./store";
import {
  MAX_INSTALLMENT_IMPORT_BYTES,
  MAX_INSTALLMENT_IMPORT_COLUMNS,
  MAX_INSTALLMENT_IMPORT_ROWS,
} from "./installmentImportLimits";

const MONTHS_2025 = [
  "يونيو 2024",
  "يوليو 2024",
  "أغسطس 2024",
  "مارس 2025",
  "ابريل 2025",
  "مايو 2025",
  "يونيو 2025",
  "يوليو 2025",
  "أغسطس 2025",
  "سبتمبر 2025",
  "أكتوبر 2025",
  "نوفمبر2025",
  "ديسمبر2025",
];

const MONTHS_2026 = [
  "يناير",
  "فبراير",
  "مارس",
  "ابريل",
  "مايو",
  "يونيو",
  "يوليو",
  "اغسطس",
  "سبتمبر",
  "اكتوبر ",
  "نوفمبر",
  "ديسمبر",
];

// تدعم ملفات Excel القديمة التي تحفظ الأرقام بالأرقام العربية أو الفارسية.
const normalizeNumericText = (value: string): string =>
  value
    .replace(/[٠-٩]/g, (digit) => String(digit.charCodeAt(0) - 1632))
    .replace(/[۰-۹]/g, (digit) => String(digit.charCodeAt(0) - 1776))
    .replace(/[٫]/g, ".")
    .replace(/[٬،]/g, ",");

const cleanNumber = (value: unknown): number => {
  const normalized = normalizeNumericText(String(value ?? "")).replace(/[^0-9.-]/g, "");
  return normalized && Number.isFinite(Number(normalized)) ? Number(normalized) : 0;
};

// تطبيع النص العربي: توحيد أشكال الألف والتاء المربوطة/الياء، وإزالة كل المسافات،
// وتوحيد حالة الأحرف — لضمان مطابقة أسماء الأعمدة حتى مع اختلافات الكتابة الشائعة.
const normalizeArabic = (value: unknown): string =>
  String(value ?? "")
    .replace(/[أإآا]/g, "ا")
    .replace(/ى/g, "ي")
    .replace(/ة/g, "ه")
    .replace(/\s+/g, "")
    .toLowerCase()
    .trim();

// إزالة الأرقام (السنة) من اسم الشهر لمطابقة مثل «نوفمبر2025» مع «نوفمبر»
const monthCore = (value: unknown): string =>
  normalizeArabic(value).replace(/[0-9\u0660-\u0669]/g, "");

// مطابقة أسماء الأشهر: تامة أولاً، ثم بتجاهل السنة الملحقة
const findKeyExact = (keys: string[], target: string, fallback: string): string => {
  const normTarget = normalizeArabic(target);
  const exact = keys.find((key) => normalizeArabic(key) === normTarget);
  if (exact) return exact;
  const core = monthCore(target);
  return (core && keys.find((key) => monthCore(key) === core)) || fallback;
};

// مطابقة جزئية (بعد التطبيع) — تُستخدم للحقول الوصفية مثل "اسم المتدرب"
const findKeyContains = (keys: string[], part: string, fallback: string): string => {
  const normPart = normalizeArabic(part);
  return keys.find((key) => normalizeArabic(key).includes(normPart)) ?? fallback;
};

// أول مطابقة ناجحة من عدة بدائل
const findKeyAny = (keys: string[], parts: string[], fallback: string): string => {
  for (const part of parts) {
    const found = findKeyContains(keys, part, "");
    if (found) return found;
  }
  return fallback;
};

export function parseInstallmentsExcel(buffer: ArrayBuffer, year: 2025 | 2026): Installment[] {
  if (buffer.byteLength === 0) {
    throw new Error("الملف فارغ.");
  }
  if (buffer.byteLength > MAX_INSTALLMENT_IMPORT_BYTES) {
    throw new Error(
      "حجم ملف الأقساط أكبر من الحد المسموح (20 ميجابايت). قسّم الملف ثم أعد الاستيراد.",
    );
  }

  // اقرأ هامش صف واحد فقط فوق الحد حتى نرفض الملف الكبير برسالة واضحة، بدلاً
  // من إنشاء مصفوفات غير محدودة قد تُغلق WebView على أجهزة Android منخفضة الذاكرة.
  const workbook = XLSX.read(new Uint8Array(buffer), {
    type: "array",
    dense: true,
    sheetRows: MAX_INSTALLMENT_IMPORT_ROWS + 2,
  });
  const worksheet = workbook.Sheets[workbook.SheetNames[0]];
  if (!worksheet) return [];

  const usedRange = worksheet["!fullref"] || worksheet["!ref"];
  if (usedRange) {
    const range = XLSX.utils.decode_range(usedRange);
    const rowCount = range.e.r - range.s.r + 1;
    const columnCount = range.e.c - range.s.c + 1;
    if (rowCount > MAX_INSTALLMENT_IMPORT_ROWS + 1) {
      throw new Error(
        `ورقة Excel تحتوي على أكثر من ${MAX_INSTALLMENT_IMPORT_ROWS.toLocaleString("en-US")} صف بيانات. احذف الصفوف الزائدة أو قسّم الملف ثم أعد المحاولة.`,
      );
    }
    if (columnCount > MAX_INSTALLMENT_IMPORT_COLUMNS) {
      throw new Error(
        "نطاق ورقة Excel عريض بشكل غير طبيعي. احذف الأعمدة الفارغة/التنسيقات الزائدة ثم أعد الاستيراد.",
      );
    }
  }

  const rows = XLSX.utils.sheet_to_json<Record<string, unknown>>(worksheet, {
    defval: "",
    blankrows: false,
  });
  const months = year === 2025 ? MONTHS_2025 : MONTHS_2026;
  const keys = rows.length ? Object.keys(rows[0]) : [];

  const monthKeys = months.map((month) => findKeyExact(keys, month, ""));

  const nameKey = findKeyAny(
    keys,
    ["اسم المتدرب", "اسم الطالب", "الاسم", "اسم", "trainee name", "student name", "name"],
    "name",
  );
  if (!keys.includes(nameKey)) {
    throw new Error(
      "لم يتم العثور على عمود اسم المتدرب. تأكد من وجود عنوان مثل «اسم المتدرب» في صف العناوين.",
    );
  }
  if (!monthKeys.some((key) => key && keys.includes(key))) {
    throw new Error(`ملف الأقساط لا يحتوي على أي عمود دفعة شهري معروف للعام ${year}`);
  }
  const batchKey = findKeyAny(keys, ["رقم الدفعة", "الدفعة"], "batch");
  const specialtyKey = findKeyAny(keys, ["المساق", "التخصص"], "specialty");
  const feesKey = findKeyAny(keys, ["مبلغ الرسوم", "الرسوم"], "fees");
  const prevDueKey = findKeyAny(
    keys,
    ["المتبقي عليهم من العام 2025", "المتبقي من العام", "متبقي سابق"],
    "prevDue",
  );
  const remainingKey = findKeyExact(keys, "المتبقي", "remaining");
  const notesKey = findKeyContains(keys, "ملاحظات", "notes");
  const phoneKey = findKeyAny(keys, ["رقم الهاتف", "الهاتف", "الجوال"], "phone");

  return rows.flatMap((row) => {
    const name = String(row[nameKey] ?? "").trim();
    if (!name) return [];

    const payments: Record<string, number> = {};
    let totalPaid = 0;
    months.forEach((month, index) => {
      const monthKey = monthKeys[index];
      const amount = monthKey ? cleanNumber(row[monthKey]) : 0;
      payments[month] = amount;
      totalPaid += amount;
    });

    const fees = cleanNumber(row[feesKey]);
    const prevDue = cleanNumber(row[prevDueKey]);
    const importedTotal = row["الإجمالي"] ? cleanNumber(row["الإجمالي"]) : totalPaid;

    return [
      {
        name,
        batch: String(row[batchKey] ?? "").trim(),
        specialty: String(row[specialtyKey] ?? "").trim(),
        fees,
        prevDue,
        totalPaid: importedTotal,
        remaining: cleanNumber(row[remainingKey]),
        notes: String(row[notesKey] ?? "").trim(),
        phone: String(row[phoneKey] ?? "").trim(),
        payments,
        customData: {},
      },
    ];
  });
}
