/** Languages offered in the language switcher (English is the source). */
export const LANGUAGES: { code: string; label: string }[] = [
  { code: "en", label: "English" },
  { code: "es", label: "Español / Spanish" },
  { code: "pt-BR", label: "Português (Brasil) / Brazilian Portuguese" },
  { code: "ko", label: "한국어 / Korean" },
  { code: "gu", label: "ગુજરાતી / Gujarati" },
  { code: "zh-CN", label: "中文 (普通话) / Chinese (Simplified)" },
  { code: "yue", label: "中文 (廣東話) / Chinese (Traditional)" },
  { code: "ht", label: "Kreyòl ayisyen / Haitian Creole" },
  { code: "ar", label: "العربية / Arabic" },
];

const RTL = new Set(["ar"]);

export const isRtl = (locale?: string) => RTL.has(String(locale || "").split("-")[0]);
