import type { Hafiza, TraineeFinancialRecord } from "@/lib/store";

export const REQUIRED_TRAINEE_FEE_LABELS = [
  "رسوم القيد والتسجيل",
  "رسوم الامتحان الكتابي الأول",
  "رسوم الامتحان الكتابي النهائي",
  "رسوم الامتحان الشفهي",
  "رسوم البحث العلمي",
] as const;

const normalize = (value: unknown) => String(value ?? "")
  .normalize("NFKC")
  .replace(/[ًٌٍَُِّْـ]/g, "")
  .replace(/[إأآٱ]/g, "ا")
  .replace(/ى/g, "ي")
  .replace(/ة/g, "ه")
  .replace(/\s+/g, " ")
  .trim()
  .toLocaleLowerCase("ar");

const nameKey = (value: unknown) => normalize(value).replace(/[^\p{L}\p{N}]/gu, "");
const parseAmount = (value: unknown) => {
  const amount = typeof value === "number" ? value : Number(String(value ?? "").replace(/[,،٬\s]/g, ""));
  return Number.isFinite(amount) ? amount : 0;
};
const parseDate = (value: unknown): Date | null => {
  if (!value) return null;
  const date = new Date(String(value));
  return Number.isNaN(date.getTime()) ? null : date;
};

export const isInactiveTraineeStatus = (value: unknown) => {
  const status = normalize(value);
  return /(منسحب|انسحب|مفصول|متخرج|خريج)/.test(status);
};

const feeCategory = (value: unknown): number => {
  const description = normalize(value);
  if (!description) return -1;
  if (/(بحث\s*علمي|رساله|اطروحه)/.test(description)) return 4;
  if (/(قيد|تسجيل)/.test(description) && !/(كتابي|شفوي|شفهي|سريري|امتحان)/.test(description)) return 0;
  if (/(كتابي|كتابه|تحريري)/.test(description)) {
    if (/(نهائي|الاخير|ختامي)/.test(description)) return 2;
    if (/(الاول|اول|1)/.test(description)) return 1;
  }
  if (/(شفوي|شفهي|شفويه|سريري|كلينيكي|clinical|oral)/i.test(description)) return 3;
  return -1;
};

const normalizedAliasCache = new WeakMap<string[], string[]>();
const getNormalizedAliases = (aliases: string[]) => {
  let cached = normalizedAliasCache.get(aliases);
  if (!cached) {
    cached = aliases.map((alias) => normalize(alias));
    normalizedAliasCache.set(aliases, cached);
  }
  return cached;
};

const recordValue = (record: TraineeFinancialRecord, aliases: string[]) => {
  for (const alias of aliases) {
    const direct = record[alias];
    if (direct !== undefined && String(direct).trim()) return direct;
  }
  const entries = Object.entries(record);
  const normalizedAliases = getNormalizedAliases(aliases);
  for (const key of normalizedAliases) {
    const match = entries.find(([header]) => normalize(header) === key)?.[1];
    if (match !== undefined && String(match).trim()) return match;
  }
  return "";
};

export type TraineeFeeNotification = {
  name: string;
  batch: string;
  unpaidFees: string[];
};

export function buildTraineeFeeNotifications(
  records: TraineeFinancialRecord[],
  hafiza: Hafiza[],
  asOf = new Date(),
): TraineeFeeNotification[] {
  const roster = new Map<string, { name: string; batch: string; paid: Set<number> }>();
  (records || []).forEach((record) => {
    const name = recordValue(record, ["اسم المتدرب حسب الشهادة", "اسم المتدرب", "اسم الطالب", "الاسم الكامل", "الاسم"]);
    if (!String(name).trim()) return;
    const status = recordValue(record, ["الحالة الأكاديمية", "الحالة", "وضع المتدرب"]);
    if (isInactiveTraineeStatus(status)) return;
    const key = nameKey(name);
    if (!key) return;
    const current = roster.get(key) || {
      name: String(name).trim(),
      batch: String(recordValue(record, ["رقم الدفعة", "الدفعة"])).trim(),
      paid: new Set<number>(),
    };
    roster.set(key, current);
  });

  const cutoff = new Date(asOf.getFullYear(), asOf.getMonth(), asOf.getDate(), 23, 59, 59, 999);
  (hafiza || []).forEach((receipt) => {
    const key = nameKey(receipt.name);
    const trainee = roster.get(key);
    if (!trainee) return;
    const date = parseDate(receipt.notifyDate || receipt.date);
    if (!date || date > cutoff) return;
    const amount = parseAmount(receipt.notifyAmount) > 0
      ? parseAmount(receipt.notifyAmount)
      : String(receipt.hafizaNo || "").trim() && parseAmount(receipt.hafizaAmount) > 0
        ? parseAmount(receipt.hafizaAmount)
        : 0;
    if (amount <= 0) return;
    const category = feeCategory(receipt.description);
    if (category >= 0) trainee.paid.add(category);
  });

  return Array.from(roster.values())
    .map(({ name, batch, paid }) => ({
      name,
      batch,
      unpaidFees: REQUIRED_TRAINEE_FEE_LABELS.filter((_, index) => !paid.has(index)),
    }))
    .filter((trainee) => trainee.unpaidFees.length > 0)
    .sort((a, b) => a.name.localeCompare(b.name, "ar"));
}
