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
const MONTH_ALIASES: Record<string, string[]> = {
  يناير: ["يناير", "كانون الثاني", "January", "Jan"],
  فبراير: ["فبراير", "شباط", "February", "Feb"],
  مارس: ["مارس", "آذار", "March", "Mar"],
  ابريل: ["ابريل", "نيسان", "April", "Apr"],
  مايو: ["مايو", "أيار", "May"],
  يونيو: ["يونيو", "حزيران", "June", "Jun"],
  يوليو: ["يوليو", "تموز", "July", "Jul"],
  اغسطس: ["اغسطس", "آب", "August", "Aug"],
  سبتمبر: ["سبتمبر", "أيلول", "September", "Sep", "Sept"],
  اكتوبر: ["اكتوبر", "تشرين الأول", "October", "Oct"],
  نوفمبر: ["نوفمبر", "تشرين الثاني", "November", "Nov"],
  ديسمبر: ["ديسمبر", "كانون الأول", "December", "Dec"],
};
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
const normalizeHeader = (value: unknown): string =>
  normalizeNumericText(String(value ?? ""))
    .normalize("NFD")
    .replace(/[\u064B-\u065F\u0670\u0640]/g, "")
    .replace(/[أإآٱ]/g, "ا")
    .replace(/ى/g, "ي")
    .replace(/ة/g, "ه")
    .replace(/[^\p{L}\p{N}]/gu, "")
    .toLowerCase();
const monthCore = (value: unknown): string => normalizeHeader(value).replace(/20?2?[0-9]/g, "");
const editDistance = (a: string, b: string): number => {
  const row = Array.from({ length: b.length + 1 }, (_, i) => i);
  for (let i = 1; i <= a.length; i += 1) {
    let diagonal = row[0];
    row[0] = i;
    for (let j = 1; j <= b.length; j += 1) {
      const above = row[j];
      row[j] = Math.min(row[j] + 1, row[j - 1] + 1, diagonal + (a[i - 1] === b[j - 1] ? 0 : 1));
      diagonal = above;
    }
  }
  return row[b.length];
};
const similarity = (a: string, b: string): number => {
  if (!a || !b) return 0;
  if (a === b) return 1;
  if (a.includes(b) || b.includes(a)) {
    return Math.min(a.length, b.length) >= 3
      ? Math.min(a.length, b.length) / Math.max(a.length, b.length)
      : 0;
  }
  return 1 - editDistance(a, b) / Math.max(a.length, b.length);
};
const bestHeaderIndex = (headers: string[], aliases: string[], threshold = 0.65): number => {
  let bestIndex = -1;
  let bestScore = 0;
  headers.forEach((header, index) => {
    if (!header.trim()) return;
    const normalized = normalizeHeader(header);
    const score = Math.max(
      ...aliases.map((alias) => similarity(normalized, normalizeHeader(alias))),
    );
    if (score > bestScore) {
      bestScore = score;
      bestIndex = index;
    }
  });
  return bestScore >= threshold ? bestIndex : -1;
};
const monthIndex = (header: string, month: string): number => {
  const target = monthCore(month);
  const aliases = MONTH_ALIASES[target] || [month];
  const normalized = monthCore(header);
  return Math.max(...aliases.map((alias) => similarity(normalized, monthCore(alias)))) >= 0.72
    ? 1
    : 0;
};
const monthColumnIndex = (
  headers: string[],
  month: string,
  usedColumns = new Set<number>(),
): number => {
  const targetYear = month.match(/20\d{2}/)?.[0];
  const aliases = MONTH_ALIASES[monthCore(month)] || [month];
  let bestIndex = -1;
  let bestScore = 0;
  headers.forEach((header, index) => {
    if (!header.trim() || usedColumns.has(index)) return;
    const digits = normalizeNumericText(header);
    const headerYear = digits.match(/20\d{2}/)?.[0];
    if (targetYear && headerYear && targetYear !== headerYear) return;
    const normalized = monthCore(header);
    const score = Math.max(...aliases.map((alias) => similarity(normalized, monthCore(alias))));
    if (score > bestScore) {
      bestScore = score;
      bestIndex = index;
    }
  });
  return bestScore >= 0.72 ? bestIndex : -1;
};
const toHeaders = (row: unknown[]): string[] => row.map((cell) => String(cell ?? "").trim());
const headersForRow = (
  grid: unknown[][],
  worksheet: XLSX.WorkSheet,
  rowIndex: number,
  originalRowIndices: number[],
  originalColumnIndices: number[],
): string[] => {
  const headers = toHeaders(grid[rowIndex] || []);
  const originalRow = originalRowIndices[rowIndex];
  for (const merge of worksheet["!merges"] || []) {
    if (
      merge.s.c !== merge.e.c ||
      originalRow < merge.s.r ||
      originalRow > merge.e.r
    ) continue;
    const compactColumn = originalColumnIndices.indexOf(merge.s.c);
    if (compactColumn < 0) continue;
    const mergedHeader = String(worksheet[XLSX.utils.encode_cell(merge.s)]?.v ?? "").trim();
    if (mergedHeader) headers[compactColumn] = mergedHeader;
  }
  return headers;
};
const locateHeaderRow = (
  grid: unknown[][],
  worksheet: XLSX.WorkSheet,
  months: string[],
  originalRowIndices: number[],
  originalColumnIndices: number[],
): number => {
  let bestIndex = -1;
  let bestScore = -1;
  for (let index = 0; index < Math.min(grid.length, 30); index += 1) {
    const headers = headersForRow(
      grid,
      worksheet,
      index,
      originalRowIndices,
      originalColumnIndices,
    );
    const nameIndex = bestHeaderIndex(
      headers,
      ["اسم المتدرب", "اسم الطالب", "اسم", "الاسم", "trainee name", "student name", "name"],
      0.5,
    );
    if (nameIndex < 0) continue;
    const monthMatches = months.reduce(
      (count, month) => count + (monthColumnIndex(headers, month) >= 0 ? 1 : 0),
      0,
    );
    const score = 100 + monthMatches * 5 + headers.filter(Boolean).length / 100;
    if (score > bestScore) {
      bestScore = score;
      bestIndex = index;
    }
  }
  return bestIndex;
};
const valueAt = (row: unknown[], index: number): unknown => (index < 0 ? "" : (row[index] ?? ""));

export function parseInstallmentsExcel(buffer: ArrayBuffer, year: 2025 | 2026): Installment[] {
  if (buffer.byteLength === 0) throw new Error("الملف فارغ.");
  if (buffer.byteLength > MAX_INSTALLMENT_IMPORT_BYTES) {
    throw new Error(
      "حجم ملف الأقساط أكبر من الحد المسموح (20 ميجابايت). قسّم الملف ثم أعد الاستيراد.",
    );
  }
  const workbook = XLSX.read(new Uint8Array(buffer), {
    type: "array",
    // Sparse mode avoids allocating the formatting-only rectangle of exported Excel sheets.
    dense: false,
    sheetRows: MAX_INSTALLMENT_IMPORT_ROWS + 2,
  });
  const worksheet = workbook.Sheets[workbook.SheetNames[0]];
  if (!worksheet) return [];
  const months = year === 2025 ? MONTHS_2025 : MONTHS_2026;
  // تجاهل الامتداد الذي تضيفه التنسيقات/الخلايا الفارغة في !ref. نبني شبكة مضغوطة
  // من الخلايا ذات القيم الفعلية فقط، لذا لا تؤثر الأعمدة الفارغة أو المدمجة على الحد.
  const populatedCells: { row: number; column: number; value: unknown }[] = [];
  for (const [address, cell] of Object.entries(worksheet)) {
    if (address.startsWith("!")) continue;
    const value = (cell as XLSX.CellObject | undefined)?.v;
    if (value === undefined || value === null || value === "") continue;
    const position = XLSX.utils.decode_cell(address);
    populatedCells.push({ row: position.r, column: position.c, value });
  }
  const originalRowIndices = [...new Set(populatedCells.map((cell) => cell.row))].sort(
    (a, b) => a - b,
  );
  const originalColumnIndices = [...new Set(populatedCells.map((cell) => cell.column))].sort(
    (a, b) => a - b,
  );
  if (originalRowIndices.length > MAX_INSTALLMENT_IMPORT_ROWS + 1) {
    throw new Error(
      `ورقة Excel تحتوي على أكثر من ${MAX_INSTALLMENT_IMPORT_ROWS.toLocaleString("en-US")} صف بيانات. احذف الصفوف الزائدة أو قسّم الملف ثم أعد المحاولة.`,
    );
  }
  if (originalColumnIndices.length > MAX_INSTALLMENT_IMPORT_COLUMNS) {
    throw new Error(
      `ورقة Excel تحتوي على أكثر من ${MAX_INSTALLMENT_IMPORT_COLUMNS} عموداً مستخدماً فعلياً. احذف البيانات الزائدة ثم أعد المحاولة.`,
    );
  }
  if (!populatedCells.length) return [];
  const rowIndexByOriginal = new Map(originalRowIndices.map((row, index) => [row, index]));
  const columnIndexByOriginal = new Map(
    originalColumnIndices.map((column, index) => [column, index]),
  );
  const grid: unknown[][] = originalRowIndices.map(() =>
    Array.from({ length: originalColumnIndices.length }, () => ""),
  );
  populatedCells.forEach(({ row, column, value }) => {
    const compactRow = rowIndexByOriginal.get(row);
    const compactColumn = columnIndexByOriginal.get(column);
    if (compactRow !== undefined && compactColumn !== undefined) {
      grid[compactRow][compactColumn] = value;
    }
  });
  const headerRowIndex = locateHeaderRow(
    grid,
    worksheet,
    months,
    originalRowIndices,
    originalColumnIndices,
  );
  if (headerRowIndex < 0) {
    throw new Error(
      "لم يتم العثور على عناوين متوافقة؛ تأكد من وجود عمود الاسم وعناوين أشهر الأقساط.",
    );
  }
  const headers = headersForRow(
    grid,
    worksheet,
    headerRowIndex,
    originalRowIndices,
    originalColumnIndices,
  );
  const usedMonthColumns = new Set<number>();
  const monthColumns = months.map((month) => {
    const column = monthColumnIndex(headers, month, usedMonthColumns);
    if (column >= 0) usedMonthColumns.add(column);
    return column;
  });
  const nameColumn = bestHeaderIndex(
    headers,
    ["اسم المتدرب", "اسم الطالب", "اسم", "الاسم", "trainee name", "student name", "name"],
    0.5,
  );
  const batchColumn = bestHeaderIndex(headers, ["رقم الدفعة", "الدفعة", "batch"]);
  const specialtyColumn = bestHeaderIndex(headers, ["المساق", "التخصص", "specialty", "course"]);
  const feesColumn = bestHeaderIndex(headers, ["مبلغ الرسوم", "الرسوم", "fees", "tuition"]);
  const prevDueColumn = bestHeaderIndex(
    headers,
    [
      "المتبقي عليهم من العام 2025",
      "المتبقي من العام",
      "متبقي سابق",
      "باقي من عام سابق",
      "رصيد سابق",
    ],
    0.72,
  );
  const remainingColumn = bestHeaderIndex(
    headers,
    ["المتبقي", "الرصيد المتبقي", "remaining", "balance"],
    0.55,
  );
  const notesColumn = bestHeaderIndex(headers, ["ملاحظات", "ملاحظة", "notes", "note"], 0.6);
  const phoneColumn = bestHeaderIndex(
    headers,
    ["رقم الهاتف", "الهاتف", "الجوال", "phone", "mobile"],
    0.55,
  );
  const totalColumn = bestHeaderIndex(headers, ["الإجمالي", "المجموع", "total"]);
  return grid.slice(headerRowIndex + 1).flatMap((row) => {
    const name = String(valueAt(row, nameColumn)).trim();
    if (!name) return [];
    const payments: Record<string, number> = {};
    let totalPaid = 0;
    months.forEach((month, index) => {
      const amount = cleanNumber(valueAt(row, monthColumns[index]));
      payments[month] = amount;
      totalPaid += amount;
    });
    const totalValue = valueAt(row, totalColumn);
    return [
      {
        name,
        batch: String(valueAt(row, batchColumn)).trim(),
        specialty: String(valueAt(row, specialtyColumn)).trim(),
        fees: cleanNumber(valueAt(row, feesColumn)),
        prevDue: cleanNumber(valueAt(row, prevDueColumn)),
        totalPaid: totalValue === "" ? totalPaid : cleanNumber(totalValue),
        remaining: cleanNumber(valueAt(row, remainingColumn)),
        notes: String(valueAt(row, notesColumn)).trim(),
        phone: String(valueAt(row, phoneColumn)).trim(),
        payments,
        customData: {},
      },
    ];
  });
}
