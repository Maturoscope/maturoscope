/**
 * The languages Maturoscope supports, as lowercase ISO codes. Single source of
 * truth for the API (service translations, organization languages, assessment
 * scale resolution). The dashboard displays these uppercase (EN/FR/...).
 */
export const SUPPORTED_LANGUAGES = ['en', 'fr', 'es', 'it', 'sl', 'el'] as const;

export type LanguageCode = (typeof SUPPORTED_LANGUAGES)[number];

/** Narrow an arbitrary string to a supported language code (case-insensitive). */
export const isSupportedLanguage = (value: unknown): value is LanguageCode =>
  typeof value === 'string' &&
  (SUPPORTED_LANGUAGES as readonly string[]).includes(value.toLowerCase());

/** Normalize any language input to a supported code, falling back to `en`. */
export const normalizeLanguage = (value: unknown): LanguageCode => {
  if (typeof value === 'string') {
    const lower = value.toLowerCase();
    if ((SUPPORTED_LANGUAGES as readonly string[]).includes(lower)) {
      return lower as LanguageCode;
    }
  }
  return 'en';
};
