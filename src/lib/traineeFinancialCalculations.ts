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

export const isRegistrationFeeExemptBatch = (value: unknown) => {
  const batch = normalize(value).replace(/^الدفعة\s*/, "").replace(/^دفعة\s*/, "");
  return ["الاولى", "اولى", "الاول", "اول", "1", "١"].includes(batch);
};

const isFirstBatch = isRegistrationFeeExemptBatch;

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
    (isRegistrationFeeExemptBatch(batch) ? 0 : parseAmount(next[REGISTRATION_FEE])) +
    parseAmount(next[TUITION_FEES]) +
    examTotal;

  return next;
};

/**
 * تواريخ الاستحقاق المعروضة تقديرية ومبنية على تاريخ بداية الدفعة
 * ويُحسب موعد الكتابي النهائي من مدة الدراسة المسجلة لكل متدرب.
 * لا تستبدل هذه التواريخ تقويم الامتحانات الرسمي.
 */
export const TRAINEE_FEE_SCHEDULE_HEADERS = [
  "بداية الدراسة",
  "موعد استحقاق القيد والتسجيل",
  "مواعيد استحقاق الأقساط السنوية",
  "موعد الكتابي الأول المتوقع",
  "موعد الكتابي النهائي المتوقع",
  "موعد السريري الشفوي المتوقع",
] as const;

const parseStudyStartDate = (value: string): Date | null => {
  const match = String(value || "").match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if (!match) return null;
  const year = Number(match[1]);
  const month = Number(match[2]);
  const day = Number(match[3]);
  const date = new Date(year, month - 1, day);
  if (date.getFullYear() !== year || date.getMonth() !== month - 1 || date.getDate() !== day) return null;
  date.setHours(0, 0, 0, 0);
  return date;
};

const addStudyYears = (date: Date, years: number): Date => {
  const year = date.getFullYear() + years;
  const month = date.getMonth();
  const day = Math.min(date.getDate(), new Date(year, month + 1, 0).getDate());
  return new Date(year, month, day);
};

const formatStudyDate = (date: Date): string =>
  String(date.getDate()).padStart(2, "0") + "/" +
  String(date.getMonth() + 1).padStart(2, "0") + "/" + date.getFullYear();

const isTuitionExemptBatch = (value: unknown): boolean => {
  const batch = normalize(value).replace(/^الدفعة\s*/, "").replace(/^دفعة\s*/, "");
  return ["الاولى", "اولى", "الاول", "اول", "1", "١"].includes(batch);
};

/** ينتج مواعيد القيد والرسوم السنوية ومراحل الاختبار دون تعديل أي حركة سداد. */
export const calculateTraineeFeeSchedule = (
  batch: unknown,
  startDateValue: string | undefined,
  referenceDate: Date = new Date(),
  studyYearsValue?: unknown,
): Record<(typeof TRAINEE_FEE_SCHEDULE_HEADERS)[number], string> => {
  const empty = Object.fromEntries(
    TRAINEE_FEE_SCHEDULE_HEADERS.map((header) => [header, "لم يحدد تاريخ بداية الدراسة"]),
  ) as Record<(typeof TRAINEE_FEE_SCHEDULE_HEADERS)[number], string>;
  if (isRegistrationFeeExemptBatch(batch)) {
    empty["موعد استحقاق القيد والتسجيل"] = "معفى من رسوم القيد والتسجيل";
  }
  const startDate = parseStudyStartDate(String(startDateValue || ""));
  if (!startDate) return empty;

  const firstWrittenDate = addStudyYears(startDate, 1);
  const studyYears = parseAmount(studyYearsValue);
  const finalWrittenDate = studyYears > 0 ? addStudyYears(startDate, studyYears) : null;
  const today = new Date(referenceDate.getFullYear(), referenceDate.getMonth(), referenceDate.getDate());
  const tuitionDates: string[] = [];
  if (isTuitionExemptBatch(batch)) {
    tuitionDates.push("معفى من الأقساط الدراسية");
  } else {
    for (let year = 0; year <= 80; year += 1) {
      const dueDate = addStudyYears(startDate, year);
      if (dueDate > today) break;
      tuitionDates.push(formatStudyDate(dueDate));
    }
    if (!tuitionDates.length) tuitionDates.push("لم يحل موعد القسط السنوي الأول بعد");
  }

  return {
    "بداية الدراسة": formatStudyDate(startDate),
    "موعد استحقاق القيد والتسجيل": isRegistrationFeeExemptBatch(batch)
      ? "معفى من رسوم القيد والتسجيل"
      : formatStudyDate(startDate),
    "مواعيد استحقاق الأقساط السنوية": tuitionDates.join("، "),
    "موعد الكتابي الأول المتوقع": formatStudyDate(firstWrittenDate),
    "موعد الكتابي النهائي المتوقع": finalWrittenDate
      ? formatStudyDate(finalWrittenDate)
      : "لم تحدد مدة الدراسة",
    "موعد السريري الشفوي المتوقع": finalWrittenDate
      ? formatStudyDate(finalWrittenDate)
      : "لم تحدد مدة الدراسة",
  };
};
