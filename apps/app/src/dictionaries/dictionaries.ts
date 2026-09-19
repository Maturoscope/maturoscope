import "server-only"
import { Dictionary } from "./types"
import { Locale, DEFAULT_LANGUAGE, AVAILABLE_LANGUAGES } from "@/lib/locale"

// Re-export client-safe locale helpers so existing server-side imports from
// "@/dictionaries/dictionaries" keep working. Client components must import
// these from "@/lib/locale" directly (this module is server-only).
export type { Locale }
export { DEFAULT_LANGUAGE, AVAILABLE_LANGUAGES, resolveLocale } from "@/lib/locale"

const dictionaries = {
  en: () => import("./en.json").then((module) => module.default),
  fr: () => import("./fr.json").then((module) => module.default),
  es: () => import("./es.json").then((module) => module.default),
  it: () => import("./it.json").then((module) => module.default),
  sl: () => import("./sl.json").then((module) => module.default),
  el: () => import("./el.json").then((module) => module.default),
}

export const getDictionary = async (locale: Locale) => {
  if (!AVAILABLE_LANGUAGES.includes(locale))
    return dictionaries[DEFAULT_LANGUAGE]() as Promise<Dictionary>

  return dictionaries[locale]() as Promise<Dictionary>
}
