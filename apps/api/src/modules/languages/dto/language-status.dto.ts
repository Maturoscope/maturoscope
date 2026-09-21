import { LanguageCode } from '../../../common/i18n/languages';

/**
 * Derived availability of a language for an organization:
 *  - `live`  → enabled AND every active service is fully translated (offered to users)
 *  - `draft` → enabled but some active service is missing a translation
 *  - `off`   → the language is turned off (switch)
 * The default language is always `live`.
 */
export type LanguageDerivedStatus = 'live' | 'draft' | 'off';

export class LanguageStatusDto {
  code: LanguageCode;
  isDefault: boolean;
  enabled: boolean;
  status: LanguageDerivedStatus;
  /** Fields (name/description) filled for this language across active services. */
  translated: number;
  /** Active services × 2 (name + description). */
  total: number;
}

/** Per-service translation completeness across the enabled non-default languages. */
export class ServiceTranslationStatusDto {
  serviceId: string;
  status: 'done' | 'missing';
  missingLanguages: LanguageCode[];
}
