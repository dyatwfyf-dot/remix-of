const normalizeFeeDescription = (value: unknown) =>
  String(value || "")
    .trim()
    .replace(/[ًٌٍَُِّْـ]/g, "")
    .replace(/[إأآ]/g, "ا")
    .replace(/\s+/g, " ");

/** Only recognize the requested registration-fee word orders in a receipt description. */
export const isRegistrationFeeDescription = (value: unknown): boolean => {
  const text = normalizeFeeDescription(value);
  return /(?:رسوم\s+(?:ال)?قيد\s+و\s*(?:ال)?تسجيل|(?:ال)?قيد\s+رسوم\s+و\s*(?:ال)?تسجيل)/.test(text);
};
