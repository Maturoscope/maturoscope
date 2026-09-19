// Client-safe locale constants and helpers (no "server-only" — usable from
// both client and server components). The dictionary loader lives in
// "@/dictionaries/dictionaries" (server-only) and re-exports these.

export type Locale = "en" | "fr" | "es" | "it" | "sl" | "el"

export const DEFAULT_LANGUAGE: Locale = "en"

export const AVAILABLE_LANGUAGES: Locale[] = ["en", "fr", "es", "it", "sl", "el"]

/** Narrow an unknown route param to a supported Locale, falling back to the default. */
export const resolveLocale = (value: string | undefined): Locale =>
  AVAILABLE_LANGUAGES.includes(value as Locale) ? (value as Locale) : DEFAULT_LANGUAGE
