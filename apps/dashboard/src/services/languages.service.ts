export type LanguageCode = 'en' | 'fr' | 'es' | 'it' | 'sl' | 'el'
export type LanguageDerivedStatus = 'live' | 'draft' | 'off'

export interface LanguageStatus {
  code: LanguageCode
  isDefault: boolean
  enabled: boolean
  status: LanguageDerivedStatus
  translated: number
  total: number
}

export interface ServiceTranslationEntry {
  serviceId: string
  sourceName: string
  sourceDescription: string
  name: string
  description: string
  nameStatus: 'done' | 'missing'
  descriptionStatus: 'done' | 'missing'
}

export interface TranslationsResponse {
  language: LanguageCode
  defaultLanguage: LanguageCode
  progress: { translated: number; total: number }
  services: ServiceTranslationEntry[]
}

export interface SaveTranslationEntry {
  serviceId: string
  name?: string
  description?: string
}

export interface ServiceTranslationStatus {
  serviceId: string
  status: 'done' | 'missing'
  missingLanguages: LanguageCode[]
}

async function handle<T>(response: Response): Promise<T> {
  const data = await response.json().catch(() => ({}))
  if (!response.ok) {
    throw new Error(
      (data as { message?: string; error?: string })?.message ||
        (data as { error?: string })?.error ||
        `HTTP error! status: ${response.status}`,
    )
  }
  return data as T
}

export class LanguagesService {
  /** List the 6 languages with enabled flag + derived Live/Draft status. */
  static async getLanguages(): Promise<LanguageStatus[]> {
    const response = await fetch('/api/languages', { credentials: 'include' })
    return handle<LanguageStatus[]>(response)
  }

  /** Turn a language on/off. Returns the refreshed statuses. */
  static async setLanguageEnabled(
    code: LanguageCode,
    enabled: boolean,
  ): Promise<LanguageStatus[]> {
    const response = await fetch(`/api/languages/${encodeURIComponent(code)}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ enabled }),
    })
    return handle<LanguageStatus[]>(response)
  }

  /** Set the default language (only a Live language is accepted by the API). */
  static async setDefaultLanguage(
    language: LanguageCode,
  ): Promise<LanguageStatus[]> {
    const response = await fetch('/api/languages/default', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ language }),
    })
    return handle<LanguageStatus[]>(response)
  }

  /** Source + target text and per-field status for a language (optionally one service). */
  static async getTranslations(
    language: LanguageCode,
    serviceId?: string,
  ): Promise<TranslationsResponse> {
    const params = new URLSearchParams({ language })
    if (serviceId) params.set('serviceId', serviceId)
    const response = await fetch(`/api/languages/translations?${params.toString()}`, {
      credentials: 'include',
    })
    return handle<TranslationsResponse>(response)
  }

  /** Per-service Done/Missing across the enabled non-default languages. */
  static async getServicesStatus(): Promise<ServiceTranslationStatus[]> {
    const response = await fetch('/api/languages/services-status', {
      credentials: 'include',
    })
    return handle<ServiceTranslationStatus[]>(response)
  }

  /** Upsert target-language translations for one or more services. */
  static async saveTranslations(
    language: LanguageCode,
    entries: SaveTranslationEntry[],
  ): Promise<TranslationsResponse> {
    const response = await fetch('/api/languages/translations', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ language, entries }),
    })
    return handle<TranslationsResponse>(response)
  }
}
