import schemaJson from "@/lib/expensesSchema.json";

type Row = { n: string; lv: string };
export const rows = (schemaJson as { rows: Row[] }).rows;

export function normalizeArabic(s: string): string {
  return String(s ?? "")
    .replace(/[\u064B-\u0652\u0640]/g, "")
    .replace(/[أإآ]/g, "ا")
    .replace(/ة/g, "ه")
    .replace(/ى/g, "ي")
    .replace(/\s+/g, " ")
    .trim();
}

const findRow = (name: string) => {
  const n = normalizeArabic(name);
  return rows.findIndex((r) => r.lv === "type" && normalizeArabic(r.n) === n);
};

const RULES: [string[], string][] = [
  [["بدل امتحان", "بدل اختبار", "عمل اضافي", "اضافي"], "أجور العمل الإضافي"],
  [["بدل طبيعة عمل", "طبيعة عمل"], "بدل طبيعة العمل"],
  [["بدل سكن"], "بدل سكن"],
  [["بدل ريف"], "بدل ريف"],
  [["بدل مظهر"], "بدل مظهر"],
  [["بدل تحديث"], "بدل تحديث"],
  [["مكافأة", "مكافا", "مكافئ", "مكافآت", "مكافئه"], "المكافآت"],
  [["اجور تعاقديه", "متعاقد"], "أجور تعاقدية ومؤقتة"],
  [["راتب", "رواتب", "مرتبات"], "المرتبات الأساسية"],
  [["مستلزمات طبيه", "ادويه", "دواء"], "أدوية ومستلزمات طبية ومواد أولية ومساندة"],
  [["وقود", "ديزل", "بترول", "زيوت"], "وقود وزيوت"],
  [["مياه", "ماء"], "ميــاه"],
  [["كهرباء", "اناره"], "إنــارة"],
  [["قرطاسيه", "ادوات مكتبيه", "ادوات كتابيه", "مطبوعات", "طباعه"], "أدوات كتابية ومكتبية وكتب ومطبوعات"],
  [["بريد", "اتصالات", "انترنت", "رصيد"], "البريد والاتصالات"],
  [["ضيافة", "احتفال", "مؤتمر"], "مؤتمرات واحتفالات وضيافة"],
  [["نظافه"], "نفقات النظافة"],
  [["ايجار"], "إيجار المباني"],
  [["تدريب"], "نفقات التدريب المحلي"],
  [["مواصلات", "انتقالات", "نقل"], "انتقالات داخلية"],
  [["صيانه"], "صيانة وقطع غيار الآلات والمعدات والأثاث"],
];

const COMPILED = RULES.map(([kws, name]) => ({
  kws: kws.map(normalizeArabic),
  idx: findRow(name),
})).filter((r) => r.idx >= 0);

export const FALLBACK_ROW = findRow("نفقات أخرى");

export function mapDescriptionToRow(desc: string): { idx: number; matched: boolean } {
  const d = normalizeArabic(desc);
  for (const r of COMPILED) {
    if (r.kws.some((k) => d.includes(k))) return { idx: r.idx, matched: true };
  }
  return { idx: FALLBACK_ROW, matched: false };
}

function parseYearMonth(date: string): { y: number; m: number } | null {
  const parts = String(date ?? "").match(/\d+/g);
  if (!parts || parts.length < 2) return null;
  if (parts[0].length === 4) return { y: +parts[0], m: +parts[1] - 1 };
  if (parts.length >= 3 && parts[2].length === 4) return { y: +parts[2], m: +parts[1] - 1 };
  return null;
}

export type UnmatchedEntry = { date: string; description: string; amount: number };

export function buildPostedExpenses(
  accounts: { date: string; description: string; expense: number | string }[],
  year: number,
): { posted: Record<string, number>; unmatched: UnmatchedEntry[] } {
  const posted: Record<string, number> = {};
  const unmatched: UnmatchedEntry[] = [];

  for (const a of accounts || []) {
    const amount = Number(a.expense) || 0;
    if (!amount) continue;
    if (String(a.description ?? "").includes("الرصيد الافتتاحي")) continue;

    const ym = parseYearMonth(a.date);
    if (!ym || ym.y !== year || ym.m < 0 || ym.m > 11) continue;

    const { idx, matched } = mapDescriptionToRow(a.description);
    if (idx < 0) continue;

    const key = `${ym.m}-${idx}`;
    posted[key] = (posted[key] || 0) + amount;

    if (!matched) {
      unmatched.push({ date: a.date, description: a.description, amount });
    }
  }

  return { posted, unmatched };
}
