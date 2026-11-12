import type { Language } from "../types";
export function preferredLanguage(
  saved: unknown,
  browserLanguage: string,
): Language {
  if (saved === "en" || saved === "zh") return saved;
  return /^zh(?:-|$)/i.test(browserLanguage) ? "zh" : "en";
}
