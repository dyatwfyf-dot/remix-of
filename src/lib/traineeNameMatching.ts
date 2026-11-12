const normalizeArabicNameText = (value: unknown): string =>
  String(value ?? "")
    .normalize("NFKC")
    .toLocaleLowerCase("ar")
    .replace(/[\u0610-\u061A\u064B-\u065F\u0670\u06D6-\u06ED]/g, "")
    .replace(/[إأآٱ]/g, "ا")
    .replace(/[ىیۍ]/g, "ي")
    .replace(/ک/g, "ك")
    .replace(/ة/g, "ه")
    .replace(/ؤ/g, "و")
    .replace(/ئ/g, "ي")
    .replace(/[\u0640\u200B-\u200F\uFEFF]/g, "");

/** Exact normalized form: strips spacing and punctuation, but preserves letter order. */
export const normalizeTraineeReportName = (value: unknown): string =>
  normalizeArabicNameText(value).replace(/[^\p{L}\p{N}]/gu, "");

/** Order-independent signature used only when the exact normalized form is absent. */
export const traineeNameTokenSignature = (value: unknown): string => {
  const tokens = normalizeArabicNameText(value)
    .split(/[^\p{L}\p{N}]+/gu)
    .map((token) => token.replace(/[^\p{L}\p{N}]/gu, ""))
    .filter(Boolean)
    .sort((a, b) => a.localeCompare(b, "ar"));
  return tokens.join("|");
};
