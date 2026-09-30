import { Locale } from "@/lib/locale"
import en from "./landing/en.json"

// The English file is the source of truth for the landing copy shape; every
// locale mirrors it. Growing a section here automatically types it everywhere.
export type LandingDictionary = typeof en

const landingDictionaries: Record<Locale, () => Promise<LandingDictionary>> = {
  en: () => import("./landing/en.json").then((m) => m.default),
  fr: () => import("./landing/fr.json").then((m) => m.default),
  es: () => import("./landing/es.json").then((m) => m.default),
  it: () => import("./landing/it.json").then((m) => m.default),
  sl: () => import("./landing/sl.json").then((m) => m.default),
  el: () => import("./landing/el.json").then((m) => m.default),
}

export const getLandingDictionary = async (
  locale: Locale,
): Promise<LandingDictionary> =>
  (landingDictionaries[locale] ?? landingDictionaries.en)()
