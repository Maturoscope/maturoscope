import type { Locale } from "@/dictionaries/dictionaries"

// BCP 47 tags used for date formatting per supported locale.
export const DATE_LOCALES: Record<Locale, string> = {
  en: "en-US",
  fr: "fr-FR",
  es: "es-ES",
  it: "it-IT",
  sl: "sl-SI",
  el: "el-GR",
}
