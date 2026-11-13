/** Languages offered in the language switcher (English is the source). */
export const LANGUAGES: { code: string; label: string }[] = [
  { code: "en", label: "English" },
  { code: "es", label: "Español" },
  { code: "pt-BR", label: "Português (Brasil)" },
  { code: "ko", label: "한국어" },
  { code: "gu", label: "ગુજરાતી" },
  { code: "zh-CN", label: "中文 (普通话)" },
  { code: "yue", label: "中文 (廣東話)" },
  { code: "ht", label: "Kreyòl ayisyen" },
  { code: "ar", label: "العربية" },
];

const RTL = new Set(["ar"]);

export const isRtl = (locale?: string) => RTL.has(String(locale || "").split("-")[0]);
