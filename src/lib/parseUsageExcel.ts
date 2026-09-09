import * as XLSX from "xlsx";

const mainHeaders = ["رقم الاستمارة", "كشف التسوية", "التاريخ", "البيان"];
const dataColumnsOrder = [
  "اجمالي عام الاستخدامات",
  "اجمالي الباب الاول",
  "الفصل الاول_باب1",
  "المرتبات الاساسية",
  "اجور تعاقدية",
  "اجور عمل اضافي",
  "مكافات",
  "طبيعة عمل",
  "بدل ريف",
  "بدل سكن",
  "بدل تحديث",
  "الفصل الثاني_باب1",
  "ح/حكومة",
  "اصابة عمل",
  "اجمالي الباب الثاني",
  "الفصل الاول_باب2",
  "مياه",
  "انارة",
  "ادوات كتابية",
  "نشر واعلان",
  "اتصالات",
  "مؤتمرات واحتفالات",
  "نفقات النظافة",
  "اخرى",
  "نقل مهام",
  "انتقالات داخلية",
  "ايجار مباني",
  "ادوية ومستلزمات طبية",
  "اغذية وملبوسات",
  "اخرى_2",
  "الفصل الثاني_باب2",
  "صيانة مباني",
  "وقود وزيوت",
  "قطع غيار وصيانة وسائل النقل",
  "قطع غيار وصيانة الالات والمعدات والاثاث",
  "اجمالي الباب الرابع",
  "مركز صحي قحزة",
  "وحدة الغسيل الكلوي",
  "مشروع دعم الكلى",
  "الصالة والمطبخ",
  "مركز صحي",
  "الامانات",
];
const allCols = [...mainHeaders, ...dataColumnsOrder];
const numericColumns = new Set(dataColumnsOrder);

// الأعمدة التي يحسبها النظام تلقائياً (مجاميع/فصول) ولا يُفترض أن يوفرها
// المحاسب يدوياً — لا تُحتسب ضمن "الحد الأدنى من الأعمدة" المطلوب لقبول الملف.
const COMPUTED_COLUMNS = new Set([
  "اجمالي عام الاستخدامات",
  "اجمالي الباب الاول",
  "الفصل الاول_باب1",
  "الفصل الثاني_باب1",
  "اجمالي الباب الثاني",
  "الفصل الاول_باب2",
  "الفصل الثاني_باب2",
  "اجمالي الباب الرابع",
]);

const MONTH_ALIASES = [
  ["يناير", "jan", "january"],
  ["فبراير", "فبر", "feb", "february"],
  ["مارس", "mar", "march"],
  ["أبريل", "ابريل", "apr", "april"],
  ["مايو", "may"],
  ["يونيو", "يونية", "jun", "june"],
  ["يوليو", "july", "jul"],
  ["أغسطس", "اغسطس", "aug", "august"],
  ["سبتمبر", "sep", "september"],
  ["أكتوبر", "اكتوبر", "oct", "october"],
  ["نوفمبر", "nov", "november"],
  ["ديسمبر", "dec", "december"],
];
const IMPORT_MONTH_KEYS = [
  "monthid",
  "month id",
  "month_id",
  "month",
  "monthname",
  "الشهر",
  "شهر",
  "اسم الشهر",
  "رقم الشهر",
  "الفترة",
];
const IMPORT_DATE_KEYS = ["التاريخ", "date", "تاريخ"];

const norm = (value: unknown) =>
  String(value ?? "")
    .replace(/\s+/g, " ")
    .trim();
const normalizeDigits = (value: string) =>
  value
    .replace(/[٠-٩]/g, (digit) => String("٠١٢٣٤٥٦٧٨٩".indexOf(digit)))
    .replace(/[۰-۹]/g, (digit) => String("۰۱۲۳۴۵۶۷۸۹".indexOf(digit)));

/**
 * Excel files produced by different versions of the application — or typed
 * up manually by an accountant — may contain harmless differences in Arabic
 * hamzas, separators, plural/singular forms, or hidden characters. Keeping
 * one canonical form lets the importer accept those files without changing
 * the names used by the table itself.
 */
const headerKey = (value: unknown) =>
  normalizeDigits(norm(value))
    .toLowerCase()
    .replace(/[\u064B-\u065F\u0670]/g, "")
    .replace(/[إأآٱ]/g, "ا")
    .replace(/[ى]/g, "ي")
    .replace(/ة/g, "ه")
    .replace(/ال/g, "")
    .replace(/[\u200B-\u200D\uFEFF]/g, "")
    .replace(/[\s_\-./\\:()]+/g, "");

const emptyCell = (value: unknown) => {
  const text = norm(value);
  return !text || ["-", "—", "–"].includes(text);
};

const parseNumber = (value: unknown): number | null => {
  if (typeof value === "number") return Number.isFinite(value) ? value : null;
  if (typeof value !== "string") return null;

  let text = normalizeDigits(value).trim();
  if (!text || ["-", "—", "–"].includes(text)) return null;
  const isNegative = text.startsWith("(") && text.endsWith(")");
  text = text
    .replace(/[٬،,\s]/g, "")
    .replace(/٫/g, ".")
    .replace(/^\((.*)\)$/, "$1");
  if (!/^[+-]?\d+(?:\.\d+)?$/.test(text)) return null;
  const number = Number(text);
  return Number.isFinite(number) ? (isNegative ? -number : number) : null;
};

const isoDate = (year: number, month: number, day: number) => {
  if (year < 1 || month < 1 || month > 12 || day < 1 || day > 31) return null;
  const date = new Date(Date.UTC(year, month - 1, day));
  if (
    date.getUTCFullYear() !== year ||
    date.getUTCMonth() !== month - 1 ||
    date.getUTCDate() !== day
  ) {
    return null;
  }
  return `${year.toString().padStart(4, "0")}-${month.toString().padStart(2, "0")}-${day
    .toString()
    .padStart(2, "0")}`;
};

const dateToInputValue = (value: unknown): string => {
  if (value instanceof Date && !Number.isNaN(value.getTime())) {
    return isoDate(value.getFullYear(), value.getMonth() + 1, value.getDate()) || "";
  }

  if (typeof value === "number" && Number.isFinite(value)) {
    const parsed = XLSX.SSF.parse_date_code(value);
    if (parsed) return isoDate(parsed.y, parsed.m, parsed.d) || "";
  }

  const text = normalizeDigits(norm(value));
  if (!text) return "";

  const normalized = text.replace(/[/.]/g, "-");
  let match = normalized.match(/^(\d{4})-(\d{1,2})-(\d{1,2})(?:[T\s].*)?$/);
  if (match) return isoDate(Number(match[1]), Number(match[2]), Number(match[3])) || text;

  match = normalized.match(/^(\d{1,2})-(\d{1,2})-(\d{4})$/);
  if (match) {
    const first = Number(match[1]);
    const second = Number(match[2]);
    const year = Number(match[3]);
    // Prefer day/month, while still accepting the unambiguous US month/day form.
    return isoDate(year, second, first) || isoDate(year, first, second) || text;
  }

  return text;
};

const parseMonthId = (value: unknown): number | null => {
  if (value instanceof Date && !Number.isNaN(value.getTime())) return value.getMonth() + 1;
  const text = normalizeDigits(norm(value)).toLowerCase();
  if (!text) return null;

  const aliasIndex = MONTH_ALIASES.findIndex((aliases) =>
    aliases.some(
      (alias) =>
        text === alias ||
        text.startsWith(`${alias} `) ||
        text.includes(`شهر ${alias}`) ||
        text.includes(`month ${alias}`),
    ),
  );
  if (aliasIndex >= 0) return aliasIndex + 1;

  const monthLabel = text.match(/(?:شهر|month)\s*([0-9]{1,2})/);
  if (monthLabel) {
    const month = Number(monthLabel[1]);
    if (month >= 1 && month <= 12) return month;
  }

  const yearFirst = text.match(
    /(?:^|[^0-9])20[0-9]{2}[-./]([0-9]{1,2})(?:[-./][0-9]{1,2})?(?:$|[^0-9])/,
  );
  if (yearFirst) {
    const month = Number(yearFirst[1]);
    if (month >= 1 && month <= 12) return month;
  }

  const dayFirst = text.match(/^(\d{1,2})[-./](\d{1,2})[-./]20\d{2}(?:\s|$)/);
  if (dayFirst) {
    const first = Number(dayFirst[1]);
    const second = Number(dayFirst[2]);
    if (second >= 1 && second <= 12) return second;
    if (first >= 1 && first <= 12) return first;
  }

  const numeric = Number(text.replace(/,/g, ""));
  return Number.isInteger(numeric) && numeric >= 1 && numeric <= 12 ? numeric : null;
};

const hasNamedMonth = (value: unknown) => {
  const text = normalizeDigits(norm(value)).toLowerCase();
  return MONTH_ALIASES.some((aliases) =>
    aliases.some(
      (alias) =>
        text === alias ||
        text.startsWith(`${alias} `) ||
        text.includes(`شهر ${alias}`) ||
        text.includes(`month ${alias}`),
    ),
  );
};

const monthIdFromLookup = (lookup: Record<string, unknown>) => {
  for (const key of [...IMPORT_MONTH_KEYS, ...IMPORT_DATE_KEYS]) {
    const monthId = parseMonthId(lookup[headerKey(key)]);
    if (monthId) return monthId;
  }
  return null;
};

const sumColumns = (row: Record<string, unknown>, columns: string[]) =>
  columns.reduce((total, column) => total + (parseNumber(row[column]) || 0), 0);

const recomputeRow = (row: Record<string, unknown>) => {
  const nextRow = { ...row };
  const fasl1Bab1 = sumColumns(nextRow, [
    "المرتبات الاساسية",
    "اجور تعاقدية",
    "اجور عمل اضافي",
    "مكافات",
    "طبيعة عمل",
    "بدل ريف",
    "بدل سكن",
    "بدل تحديث",
  ]);
  const fasl2Bab1 = sumColumns(nextRow, ["ح/حكومة", "اصابة عمل"]);
  nextRow["الفصل الاول_باب1"] = fasl1Bab1;
  nextRow["الفصل الثاني_باب1"] = fasl2Bab1;
  nextRow["اجمالي الباب الاول"] = fasl1Bab1 + fasl2Bab1;

  const fasl1Bab2 = sumColumns(nextRow, [
    "مياه",
    "انارة",
    "ادوات كتابية",
    "نشر واعلان",
    "اتصالات",
    "مؤتمرات واحتفالات",
    "نفقات النظافة",
    "اخرى",
    "نقل مهام",
    "انتقالات داخلية",
    "ايجار مباني",
    "ادوية ومستلزمات طبية",
    "اغذية وملبوسات",
    "اخرى_2",
  ]);
  const fasl2Bab2 = sumColumns(nextRow, [
    "صيانة مباني",
    "وقود وزيوت",
    "قطع غيار وصيانة وسائل النقل",
    "قطع غيار وصيانة الالات والمعدات والاثاث",
  ]);
  nextRow["الفصل الاول_باب2"] = fasl1Bab2;
  nextRow["الفصل الثاني_باب2"] = fasl2Bab2;
  nextRow["اجمالي الباب الثاني"] = fasl1Bab2 + fasl2Bab2;
  nextRow["اجمالي الباب الرابع"] = sumColumns(nextRow, [
    "مركز صحي قحزة",
    "وحدة الغسيل الكلوي",
    "مشروع دعم الكلى",
    "الصالة والمطبخ",
    "مركز صحي",
    "الامانات",
  ]);
  nextRow["اجمالي عام الاستخدامات"] =
    Number(nextRow["اجمالي الباب الاول"] || 0) +
    Number(nextRow["اجمالي الباب الثاني"] || 0) +
    Number(nextRow["اجمالي الباب الرابع"] || 0);
  return nextRow;
};

const headerTargets = new Map<string, string>();
allCols.forEach((column) => headerTargets.set(headerKey(column), column));
[
  ["formno", "رقم الاستمارة"],
  ["formnumber", "رقم الاستمارة"],
  ["رقم الاستماره", "رقم الاستمارة"],
  ["الاستمارة", "رقم الاستمارة"],
  ["م", "رقم الاستمارة"],
  ["settlement", "كشف التسوية"],
  ["التسوية", "كشف التسوية"],
  ["رقم كشف التسوية", "كشف التسوية"],
  ["description", "البيان"],
  ["statement", "البيان"],
  ["الوصف", "البيان"],
  ["ملاحظات", "البيان"],
  ["date", "التاريخ"],
  ["monthid", "monthId"],
  ["monthname", "monthId"],
  ["month", "monthId"],
  ["الشهر", "monthId"],
  ["شهر", "monthId"],
  ["اسم الشهر", "monthId"],
  ["رقم الشهر", "monthId"],
  ["الفترة", "monthId"],
  // ===== مرادفات إضافية شائعة لدى الملفات المُعدّة يدوياً =====
  ["الرواتب", "المرتبات الاساسية"],
  ["المرتبات", "المرتبات الاساسية"],
  ["المرتب الاساسي", "المرتبات الاساسية"],
  ["الراتب الاساسي", "المرتبات الاساسية"],
  ["مرتبات", "المرتبات الاساسية"],
  ["الاجور التعاقدية", "اجور تعاقدية"],
  ["اجور العقود", "اجور تعاقدية"],
  ["العمل الاضافي", "اجور عمل اضافي"],
  ["اجور اضافية", "اجور عمل اضافي"],
  ["الاضافي", "اجور عمل اضافي"],
  ["المكافات", "مكافات"],
  ["مكافاة", "مكافات"],
  ["مكافأت", "مكافات"],
  ["طبيعة العمل", "طبيعة عمل"],
  ["بدل الريف", "بدل ريف"],
  ["بدل السكن", "بدل سكن"],
  ["بدل التحديث", "بدل تحديث"],
  ["حساب الحكومة", "ح/حكومة"],
  ["ح حكومة", "ح/حكومة"],
  ["حكومة", "ح/حكومة"],
  ["اصابات العمل", "اصابة عمل"],
  ["الماء", "مياه"],
  ["مياة", "مياه"],
  ["الكهرباء", "انارة"],
  ["الانارة", "انارة"],
  ["كهرباء", "انارة"],
  ["القرطاسية", "ادوات كتابية"],
  ["ادوات مكتبية", "ادوات كتابية"],
  ["قرطاسية", "ادوات كتابية"],
  ["النشر والاعلان", "نشر واعلان"],
  ["اعلانات", "نشر واعلان"],
  ["الاتصالات", "اتصالات"],
  ["هاتف", "اتصالات"],
  ["المؤتمرات", "مؤتمرات واحتفالات"],
  ["احتفالات", "مؤتمرات واحتفالات"],
  ["النظافة", "نفقات النظافة"],
  ["مصاريف نظافة", "نفقات النظافة"],
  ["نظافة", "نفقات النظافة"],
  ["نقل المهام", "نقل مهام"],
  ["الانتقالات الداخلية", "انتقالات داخلية"],
  ["انتقالات", "انتقالات داخلية"],
  ["الايجار", "ايجار مباني"],
  ["ايجار", "ايجار مباني"],
  ["الادوية", "ادوية ومستلزمات طبية"],
  ["ادوية طبية", "ادوية ومستلزمات طبية"],
  ["مستلزمات طبية", "ادوية ومستلزمات طبية"],
  ["الاغذية", "اغذية وملبوسات"],
  ["اغذية", "اغذية وملبوسات"],
  ["ملبوسات", "اغذية وملبوسات"],
  ["صيانة المباني", "صيانة مباني"],
  ["الوقود", "وقود وزيوت"],
  ["وقود", "وقود وزيوت"],
  ["زيوت", "وقود وزيوت"],
  ["قطع غيار النقل", "قطع غيار وصيانة وسائل النقل"],
  ["صيانة وسائل النقل", "قطع غيار وصيانة وسائل النقل"],
  ["قطع غيار المعدات", "قطع غيار وصيانة الالات والمعدات والاثاث"],
  ["صيانة الالات", "قطع غيار وصيانة الالات والمعدات والاثاث"],
  ["مركز قحزة", "مركز صحي قحزة"],
  ["الغسيل الكلوي", "وحدة الغسيل الكلوي"],
  ["دعم الكلى", "مشروع دعم الكلى"],
  ["الصالة", "الصالة والمطبخ"],
  ["المطبخ", "الصالة والمطبخ"],
  ["الامانة", "الامانات"],
  ["امانات", "الامانات"],
].forEach(([alias, target]) => headerTargets.set(headerKey(alias), target));

/**
 * Column names differ between the many spreadsheets the office produces.
 * A hint is enough: exact key, containment, or a high bigram similarity all
 * resolve to the canonical column used by the table.
 */
const bigrams = (value: string) => {
  const set = new Set<string>();
  for (let index = 0; index < value.length - 1; index += 1) set.add(value.slice(index, index + 2));
  return set;
};

const similarity = (a: string, b: string) => {
  if (!a || !b) return 0;
  if (a === b) return 1;
  const first = bigrams(a);
  const second = bigrams(b);
  if (!first.size || !second.size) return 0;
  let shared = 0;
  first.forEach((gram) => {
    if (second.has(gram)) shared += 1;
  });
  return (2 * shared) / (first.size + second.size);
};

const targetKeys = Array.from(headerTargets.entries());

const resolveHeader = (rawHeader: unknown): string | null => {
  const key = headerKey(rawHeader);
  if (!key) return null;
  const exact = headerTargets.get(key);
  if (exact) return exact;

  let best: { target: string; score: number } | null = null;
  for (const [candidateKey, target] of targetKeys) {
    let score = 0;
    if (candidateKey.length >= 3 && key.includes(candidateKey)) {
      score = 0.9 + candidateKey.length / (key.length * 100);
    } else if (key.length >= 3 && candidateKey.includes(key)) {
      score = 0.85 + key.length / (candidateKey.length * 100);
    } else {
      score = similarity(key, candidateKey);
    }
    // خُفّضت العتبة من 0.62 إلى 0.55 لتقبل اختلافات الصياغة الشائعة في
    // الملفات المُعدّة يدوياً (جمع/مفرد، "ال" التعريف، ترتيب كلمات مختلف).
    if (score >= 0.55 && (!best || score > best.score)) best = { target, score };
  }
  return best ? best.target : null;
};

const importedValue = (column: string, value: unknown) => {
  if (emptyCell(value)) return "";
  if (column === "التاريخ") return dateToInputValue(value);
  if (numericColumns.has(column)) return parseNumber(value) ?? norm(value);
  return typeof value === "string" ? norm(value) : value;
};

/**
 * يبحث عن أسماء الأعمدة ضمن نافذة أوسع حول صف الترشيح (5 صفوف بدل 3)
 * لأن ملفات المحاسبين اليدوية أحياناً تضع عنوان الجدول أو الشعار في
 * الصفوف الأولى قبل صف العناوين الفعلي.
 */
const headerMapFromRows = (rows: unknown[][], index: number) => {
  const map = new Map<number, string>();
  const used = new Set<string>();
  const offsets = [0, 1, -1, 2, -2];
  const width = Math.max(
    ...offsets.map((o) => rows[index + o]?.length ?? 0),
    0,
  );
  for (let column = 0; column < width; column += 1) {
    for (const offset of offsets) {
      const candidate = rows[index + offset]?.[column];
      const target = resolveHeader(candidate);
      if (target && !used.has(target)) {
        used.add(target);
        map.set(column, target);
        break;
      }
    }
  }
  return map;
};

/** يستخرج صفوف ورقة واحدة (يُستخدم لكل أوراق الملف ثم نختار الأفضل) */
function parseUsageSheet(matrix: unknown[][], importMonthId: number, sheetIndex: number) {
  let headerRowIndex = -1;
  let headerMap = new Map<number, string>();
  for (let index = 0; index < Math.min(matrix.length, 40); index += 1) {
    const map = headerMapFromRows(matrix, index);
    if (map.size > headerMap.size) {
      headerMap = map;
      headerRowIndex = index;
    }
  }
  // الحد الأدنى صار عمود واحد فقط (بدل عمودين)، لأن ملف قد يحتوي عمود
  // "البيان" فقط بشكل صريح مع بقية الأعمدة كأرقام تُكتشف بالقرب منها.
  if (headerRowIndex < 0 || headerMap.size < 1) return [];

  let activeMonthId =
    Number.isInteger(importMonthId) && importMonthId >= 1 && importMonthId <= 12
      ? importMonthId
      : 1;
  const imported: Record<string, unknown>[] = [];

  for (let index = headerRowIndex + 1; index < matrix.length; index += 1) {
    const cells = matrix[index] ?? [];
    const lookup: Record<string, unknown> = {};
    headerMap.forEach((target, column) => {
      lookup[headerKey(target)] = cells[column];
    });

    const filled = cells.filter((cell) => !emptyCell(cell));
    if (!filled.length) continue;

    // A lone month name ("نوفمبر 2025") introduces the block of rows below it.
    const namedMonths = filled.filter(hasNamedMonth);
    if (filled.length <= 2 && namedMonths.length === filled.length) {
      const sectionMonthId = parseMonthId(namedMonths[0]);
      if (sectionMonthId) {
        activeMonthId = sectionMonthId;
        continue;
      }
    }

    const firstText = headerKey(filled[0]);
    if (
      firstText.startsWith("اجمالي") ||
      firstText.startsWith("الاجمالي") ||
      firstText.startsWith("total")
    ) {
      continue;
    }
    // Repeated header rows inside the sheet: only exact header names count, so a
    // description that merely resembles a column name is never dropped.
    const exactHeaderCells = filled.filter((cell) => headerTargets.has(headerKey(cell)));
    const numericCells = filled.filter((cell) => parseNumber(cell) !== null);
    if (exactHeaderCells.length >= 3 && numericCells.length === 0) continue;

    const hasData = allCols.some((column) => !emptyCell(lookup[headerKey(column)]));
    if (!hasData) continue;

    const rowMonthId = monthIdFromLookup(lookup) ?? activeMonthId;
    const row: Record<string, unknown> = {
      id: `${Date.now()}-${sheetIndex}-${index}-${Math.random().toString(36).slice(2, 8)}`,
      monthId: rowMonthId,
    };
    allCols.forEach((column) => {
      row[column] = importedValue(column, lookup[headerKey(column)]);
    });
    imported.push(recomputeRow(row));
  }

  return imported;
}

/**
 * يحسب أسماء الأعمدة التي تعذّر التعرّف عليها في أفضل ورقة تمّت معالجتها،
 * لعرضها في رسالة الخطأ حتى يعرف المستخدم بالضبط أي عمود يحتاج تصحيح
 * الصياغة بدل رسالة عامة لا تفيد.
 */
function diagnoseSheet(matrix: unknown[][]): string[] {
  let headerRowIndex = -1;
  let headerMap = new Map<number, string>();
  for (let index = 0; index < Math.min(matrix.length, 40); index += 1) {
    const map = headerMapFromRows(matrix, index);
    if (map.size > headerMap.size) {
      headerMap = map;
      headerRowIndex = index;
    }
  }
  if (headerRowIndex < 0) return [];
  const row = matrix[headerRowIndex] ?? [];
  const matchedColumns = new Set(headerMap.values());
  const unresolved: string[] = [];
  row.forEach((cell) => {
    const text = norm(cell);
    if (!text) return;
    const target = resolveHeader(cell);
    if (!target) unresolved.push(text);
  });
  return unresolved;
}

export function parseUsageExcel(buffer: ArrayBuffer, importMonthId: number) {
  const workbook = XLSX.read(new Uint8Array(buffer), { type: "array", cellDates: true });

  // نفحص كل أوراق الملف ونأخذ الورقة التي تحتوي أكبر عدد من الصفوف الصالحة،
  // فلا يهم اسم الورقة ولا ترتيبها ولا تشابه أسماء الأعمدة.
  let best: Record<string, unknown>[] = [];
  let bestUnresolved: string[] = [];
  workbook.SheetNames.forEach((sheetName, sheetIndex) => {
    const worksheet = workbook.Sheets[sheetName];
    if (!worksheet) return;
    const matrix = XLSX.utils.sheet_to_json<unknown[]>(worksheet, {
      header: 1,
      defval: "",
      blankrows: false,
    });
    const rows = parseUsageSheet(matrix, importMonthId, sheetIndex);
    if (rows.length > best.length) {
      best = rows;
      bestUnresolved = [];
    }
    if (!best.length) {
      const unresolved = diagnoseSheet(matrix);
      if (unresolved.length) bestUnresolved = unresolved;
    }
  });

  if (!best.length && bestUnresolved.length) {
    // نرفق أسماء الأعمدة غير المتعرّف عليها ضمن رسالة الخطأ حتى تظهر
    // للمستخدم في واجهة الاستيراد بدل رسالة "لم يتم العثور" العامة.
    const preview = bestUnresolved.slice(0, 6).join("، ");
    throw new Error(
      `تعذّر التعرف على أعمدة الملف. الأعمدة التالية غير معروفة: ${preview}` +
        (bestUnresolved.length > 6 ? " ..." : ""),
    );
  }

  return best;
}
