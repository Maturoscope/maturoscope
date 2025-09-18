import "server-only"
import { Dictionary } from "./types"

export type Locale = "en" | "fr"

export const DEFAULT_LANGUAGE: Locale = "en"

const dictionaries = {
  en: () => import("./en.json").then((module) => module.default),
  fr: () => import("./fr.json").then((module) => module.default),
}

export const getDictionary = async (locale: Locale) =>
  dictionaries[locale]() as Promise<Dictionary>
