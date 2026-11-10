import type { TraineeFinancialRecord } from "@/lib/store";

export const STUDY_YEARS_HEADER = "عدد سنوات الدراسة";
export const ANNUAL_TUITION_FEE = 300_000;

const REGISTRATION_FEE = "رسوم القيد والتسجيل";
const TUITION_FEES = "الأقساط الدراسية المستحقة";
const FIRST_WRITTEN_STATUS = "موعد الكتابي الأول";
const FINAL_WRITTEN_STATUS = "موعد الكتابي النهائي";
const CLINICAL_STATUS = "موعد السريري الشفوي";
const EXAM_FEE_COLUMNS = [
  "رسم الكتابي الأول",
  "رسم الكتابي النهائي",
  "رسم السريري الشفوي",
] as const;
const EXAM_TOTAL = "إجمالي رسوم الامتحانات";
const GRAND_TOTAL = "إجمالي المستحق الكلي (ريال)";

const normalize = (value: unknown) =>
  String(value ?? "")
    .trim()
    .replace(/[ًٌٍَُِّْـ]/g, "")
    .replace(/[إأآ]/g, "ا")
    .replace(/\s+/g, " ");

const parseAmount = (value: unknown) =>
  Number(String(value ?? 0).replace(/[,٬\s]/g, "")) || 0;

const isFirstBatch = (value: unknown) => {
  const batch = normalize(value).replace(/^الدفعة\s*/, "").replace(/^دفعة\s*/, "");
  return ["الاولى", "اولى", "الاول", "اول", "1", "١"].includes(batch);
};

const parseLevel = (value: unknown): number | null => {
  const level = normalize(value).replace(/^المستوى\s*/, "");
  const arabicDigits = level.replace(/[٠-٩]/g, (digit) =>
    String("٠١٢٣٤٥٦٧٨٩".indexOf(digit)),
  );
  const words: Record<string, number> = {
    "الاولى": 1, "اولى": 1, "الاول": 1, "اول": 1,
    "الثانية": 2, "ثانيه": 2, "الثاني": 2, "ثاني": 2,
    "الثالثة": 3, "ثالثه": 3, "الثالث": 3, "ثالث": 3,
    "الرابعة": 4, "رابعه": 4, "الرابع": 4, "رابع": 4,
  };
  const parts = arabicDigits.split(/[\/،,\s]+/).filter(Boolean);
  const values = parts.map((part) => words[part] ?? (/^[1-4]$/.test(part) ? Number(part) : null));
  const known = values.filter((part): part is number => part !== null);
  return known.length ? Math.max(...known) : null;
};

const nextStatus = (current: string | number | undefined, proposed: string): string | number => {
  // لا نلغي مرحلة سبق تسجيلها كمكتملة عند تعديل المستوى إلى مستوى أدنى.
  if (normalize(current) === "تم") return "تم";
  return proposed;
};

/**
 * Recalculate derived financial columns from the confirmed academic rules.
 * Actual payment transactions are stored separately and are never modified here.
 */
export const recalculateTraineeFinancialRecord = (
  record: TraineeFinancialRecord,
): TraineeFinancialRecord => {
  const next = { ...record };
  const studyYears = parseAmount(next[STUDY_YEARS_HEADER]);
  const batch = next["رقم الدفعة"];

  if (isFirstBatch(batch)) {
    next[TUITION_FEES] = 0;
  } else if (studyYears > 0) {
    next[TUITION_FEES] = studyYears * ANNUAL_TUITION_FEE;
  }

  const level = parseLevel(next["المستوى الحالي"]);
  if (level !== null) {
    const firstStatus =
      level >= 3 ? "تم" : level === 2 ? "السنة الحالية" : "السنة القادمة";
    const laterStatus =
      level >= 4 ? "السنة الحالية" : level === 3 ? "السنة القادمة" : "مستقبلي";

    next[FIRST_WRITTEN_STATUS] = nextStatus(next[FIRST_WRITTEN_STATUS], firstStatus);
    next[FINAL_WRITTEN_STATUS] = nextStatus(next[FINAL_WRITTEN_STATUS], laterStatus);
    next[CLINICAL_STATUS] = nextStatus(next[CLINICAL_STATUS], laterStatus);
  }

  const examTotal = EXAM_FEE_COLUMNS.reduce(
    (total, header) => total + parseAmount(next[header]),
    0,
  );
  next[EXAM_TOTAL] = examTotal;
  next[GRAND_TOTAL] =
    parseAmount(next[REGISTRATION_FEE]) +
    parseAmount(next[TUITION_FEES]) +
    examTotal;

  return next;
};
