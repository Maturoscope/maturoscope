import { useState, useEffect, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { CreateServicePayload, GapCoverage, ScaleType } from '../types/service';
import { LanguagesService, LanguageCode } from '@/services/languages.service';

export interface TranslationField {
  name: string;
  description: string;
}

export interface ServiceFormData {
  // Per-language title/description, keyed by language code. The organization's
  // default language is the required one (step 1); the rest are optional (step 2).
  translations: Record<string, TranslationField>;
  url: string;
  gapCoverages: GapCoverage[];
  activeCategories: Set<ScaleType>;
  mainContactFirstName: string;
  mainContactLastName: string;
  mainContactEmail: string;
  secondaryContactFirstName: string;
  secondaryContactLastName: string;
  secondaryContactEmail: string;
}

const emptyField = (): TranslationField => ({ name: '', description: '' });

const getInitialFormData = (): ServiceFormData => ({
  translations: {},
  url: '',
  gapCoverages: [],
  activeCategories: new Set(),
  mainContactFirstName: '',
  mainContactLastName: '',
  mainContactEmail: '',
  secondaryContactFirstName: '',
  secondaryContactLastName: '',
  secondaryContactEmail: '',
});

let initialFormDataSnapshot: string | null = null;

const snapshot = (data: ServiceFormData): string =>
  JSON.stringify({
    ...data,
    activeCategories: Array.from(data.activeCategories).sort(),
    gapCoverages: [...data.gapCoverages].sort((a, b) => {
      if (a.scaleType !== b.scaleType) return a.scaleType.localeCompare(b.scaleType);
      if (a.questionId !== b.questionId) return a.questionId.localeCompare(b.questionId);
      return a.level - b.level;
    }),
  });

const TOTAL_STEPS = 4;

export function useServiceForm(serviceId?: string) {
  const { t } = useTranslation('SERVICES');
  const [formData, setFormData] = useState<ServiceFormData>(getInitialFormData);
  const [currentStep, setCurrentStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Organization languages drive which fields the wizard shows.
  const [defaultLanguage, setDefaultLanguage] = useState<LanguageCode>('en');
  const [secondaryLanguages, setSecondaryLanguages] = useState<LanguageCode[]>([]);

  useEffect(() => {
    let cancelled = false;
    LanguagesService.getLanguages()
      .then((langs) => {
        if (cancelled) return;
        const def = langs.find((l) => l.isDefault)?.code ?? 'en';
        setDefaultLanguage(def);
        setSecondaryLanguages(
          langs.filter((l) => l.enabled && !l.isDefault).map((l) => l.code),
        );
      })
      .catch(() => {
        // Fallback to en/fr if the languages endpoint is unavailable.
        if (!cancelled) {
          setDefaultLanguage('en');
          setSecondaryLanguages(['fr']);
        }
      });
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (!serviceId) {
      const initialData = getInitialFormData();
      setFormData(initialData);
      setCurrentStep(1);
      setErrors({});
      initialFormDataSnapshot = snapshot(initialData);
    }
  }, [serviceId]);

  const getField = useCallback(
    (lang: string): TranslationField => formData.translations[lang] ?? emptyField(),
    [formData.translations],
  );

  const isValidUrl = (url: string): boolean => {
    if (!url.trim()) return false;
    try {
      let urlToValidate = url.trim();
      if (!urlToValidate.startsWith('http://') && !urlToValidate.startsWith('https://')) {
        urlToValidate = `https://${urlToValidate}`;
      }
      const urlObj = new URL(urlToValidate);
      if (urlObj.protocol !== 'http:' && urlObj.protocol !== 'https:') return false;
      if (!urlObj.hostname || urlObj.hostname.length < 1) return false;
      const isLocalhost = urlObj.hostname === 'localhost';
      const isIpAddress = /^(\d{1,3}\.){3}\d{1,3}$/.test(urlObj.hostname);
      if (!isLocalhost && !isIpAddress && !urlObj.hostname.includes('.')) return false;
      if (urlObj.hostname.replace(/\./g, '').length === 0) return false;
      return true;
    } catch {
      return false;
    }
  };

  const isValidEmail = (email: string): boolean =>
    /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

  const updateField = (field: keyof ServiceFormData, value: unknown) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field as string]) {
      setErrors((prev) => {
        const next = { ...prev };
        delete next[field as string];
        return next;
      });
    }
  };

  const updateTranslation = (
    lang: string,
    field: 'name' | 'description',
    value: string,
  ) => {
    setFormData((prev) => ({
      ...prev,
      translations: {
        ...prev.translations,
        [lang]: { ...(prev.translations[lang] ?? emptyField()), [field]: value },
      },
    }));
    const errorKey = `${lang}.${field}`;
    if (errors[errorKey] && value.trim()) {
      setErrors((prev) => {
        const next = { ...prev };
        delete next[errorKey];
        return next;
      });
    }
  };

  const clearFieldError = (field: keyof ServiceFormData | string): void => {
    if (errors[field as string]) {
      setErrors((prev) => {
        const next = { ...prev };
        delete next[field as string];
        return next;
      });
    }
  };

  const validateField = (field: keyof ServiceFormData): void => {
    const newErrors: Record<string, string> = { ...errors };
    const check = (key: string, ok: boolean, msg: string) => {
      if (!ok) newErrors[key] = msg;
      else delete newErrors[key];
    };

    if (field === 'url') {
      check('url', !formData.url.trim() || isValidUrl(formData.url), t('MODAL.ERRORS.URL_INVALID'));
    }
    if (field === 'mainContactFirstName') {
      check('mainContactFirstName', !!formData.mainContactFirstName.trim(), t('MODAL.ERRORS.FIRST_NAME_REQUIRED'));
    }
    if (field === 'mainContactLastName') {
      check('mainContactLastName', !!formData.mainContactLastName.trim(), t('MODAL.ERRORS.LAST_NAME_REQUIRED'));
    }
    if (field === 'mainContactEmail') {
      if (!formData.mainContactEmail.trim()) newErrors.mainContactEmail = t('MODAL.ERRORS.EMAIL_REQUIRED');
      else if (!isValidEmail(formData.mainContactEmail)) newErrors.mainContactEmail = t('MODAL.ERRORS.INVALID_EMAIL');
      else delete newErrors.mainContactEmail;
    }

    const hasAnySecondary =
      formData.secondaryContactFirstName.trim() ||
      formData.secondaryContactLastName.trim() ||
      formData.secondaryContactEmail.trim();

    if (field === 'secondaryContactFirstName') {
      check('secondaryContactFirstName', !hasAnySecondary || !!formData.secondaryContactFirstName.trim(), t('MODAL.ERRORS.FIRST_NAME_REQUIRED'));
    }
    if (field === 'secondaryContactLastName') {
      check('secondaryContactLastName', !hasAnySecondary || !!formData.secondaryContactLastName.trim(), t('MODAL.ERRORS.LAST_NAME_REQUIRED'));
    }
    if (field === 'secondaryContactEmail') {
      if (hasAnySecondary) {
        if (!formData.secondaryContactEmail.trim()) newErrors.secondaryContactEmail = t('MODAL.ERRORS.EMAIL_REQUIRED');
        else if (!isValidEmail(formData.secondaryContactEmail)) newErrors.secondaryContactEmail = t('MODAL.ERRORS.INVALID_EMAIL');
        else delete newErrors.secondaryContactEmail;
      } else {
        delete newErrors.secondaryContactEmail;
      }
    }

    setErrors(newErrors);
  };

  // Step 1: default-language name + description required; url optional but valid.
  const validateStep1 = (): boolean => {
    const newErrors: Record<string, string> = {};
    const def = getField(defaultLanguage);
    if (!def.name.trim()) newErrors[`${defaultLanguage}.name`] = t('MODAL.ERRORS.NAME_REQUIRED');
    if (!def.description.trim()) newErrors[`${defaultLanguage}.description`] = t('MODAL.ERRORS.DESCRIPTION_REQUIRED');
    if (formData.url.trim() && !isValidUrl(formData.url)) newErrors.url = t('MODAL.ERRORS.URL_INVALID');
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Step 2 (translations) is optional — always valid.
  const validateStep2 = (): boolean => true;

  // Step 3: at least one category.
  const validateStep3 = (): boolean => {
    const newErrors: Record<string, string> = {};
    if (formData.gapCoverages.length === 0) newErrors.categories = t('MODAL.ERRORS.NO_CATEGORIES');
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Step 4: contacts.
  const validateStep4 = (): boolean => {
    const newErrors: Record<string, string> = {};
    if (!formData.mainContactFirstName.trim()) newErrors.mainContactFirstName = t('MODAL.ERRORS.FIRST_NAME_REQUIRED');
    if (!formData.mainContactLastName.trim()) newErrors.mainContactLastName = t('MODAL.ERRORS.LAST_NAME_REQUIRED');
    if (!formData.mainContactEmail.trim()) newErrors.mainContactEmail = t('MODAL.ERRORS.EMAIL_REQUIRED');
    else if (!isValidEmail(formData.mainContactEmail)) newErrors.mainContactEmail = t('MODAL.ERRORS.INVALID_EMAIL');

    const hasAnySecondary =
      formData.secondaryContactFirstName.trim() ||
      formData.secondaryContactLastName.trim() ||
      formData.secondaryContactEmail.trim();
    if (hasAnySecondary) {
      if (!formData.secondaryContactFirstName.trim()) newErrors.secondaryContactFirstName = t('MODAL.ERRORS.FIRST_NAME_REQUIRED');
      if (!formData.secondaryContactLastName.trim()) newErrors.secondaryContactLastName = t('MODAL.ERRORS.LAST_NAME_REQUIRED');
      if (!formData.secondaryContactEmail.trim()) newErrors.secondaryContactEmail = t('MODAL.ERRORS.EMAIL_REQUIRED');
      else if (!isValidEmail(formData.secondaryContactEmail)) newErrors.secondaryContactEmail = t('MODAL.ERRORS.INVALID_EMAIL');
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const canProceedToNextStep = (): boolean => {
    switch (currentStep) {
      case 1: {
        const def = getField(defaultLanguage);
        return !!(
          def.name.trim() &&
          def.description.trim() &&
          (!formData.url.trim() || isValidUrl(formData.url))
        );
      }
      case 2:
        return true;
      case 3:
        return formData.gapCoverages.length > 0;
      case 4: {
        const mainValid = !!(
          formData.mainContactFirstName.trim() &&
          formData.mainContactLastName.trim() &&
          formData.mainContactEmail.trim() &&
          isValidEmail(formData.mainContactEmail)
        );
        const hasAnySecondary =
          formData.secondaryContactFirstName.trim() ||
          formData.secondaryContactLastName.trim() ||
          formData.secondaryContactEmail.trim();
        let secondaryValid = true;
        if (hasAnySecondary) {
          secondaryValid = !!(
            formData.secondaryContactFirstName.trim() &&
            formData.secondaryContactLastName.trim() &&
            formData.secondaryContactEmail.trim() &&
            isValidEmail(formData.secondaryContactEmail)
          );
        }
        return mainValid && secondaryValid;
      }
      default:
        return false;
    }
  };

  const handleNext = () => {
    let isValid = false;
    switch (currentStep) {
      case 1: isValid = validateStep1(); break;
      case 2: isValid = validateStep2(); break;
      case 3: isValid = validateStep3(); break;
      default: isValid = true;
    }
    if (isValid) setCurrentStep((prev) => Math.min(prev + 1, TOTAL_STEPS));
  };

  const handleBack = () => setCurrentStep((prev) => Math.max(prev - 1, 1));

  const handleSubmit = async (): Promise<string | boolean> => {
    if (!validateStep4()) return false;

    setIsSubmitting(true);
    try {
      const def = getField(defaultLanguage);
      const en = formData.translations['en'];
      const translations = Object.entries(formData.translations)
        .filter(([, v]) => v.name?.trim() || v.description?.trim())
        .map(([languageCode, v]) => ({
          languageCode,
          name: v.name,
          description: v.description,
        }));

      const payload: CreateServicePayload = {
        name: def.name,
        // Legacy English columns: prefer an explicit en translation, else the default.
        nameEn: en?.name ?? def.name,
        description: def.description,
        descriptionEn: en?.description ?? def.description,
        url: formData.url,
        mainContactFirstName: formData.mainContactFirstName,
        mainContactLastName: formData.mainContactLastName,
        mainContactEmail: formData.mainContactEmail,
        secondaryContactFirstName: formData.secondaryContactFirstName,
        secondaryContactLastName: formData.secondaryContactLastName,
        secondaryContactEmail: formData.secondaryContactEmail,
        gapCoverages: formData.gapCoverages,
        translations,
      };

      const url = serviceId ? `/api/services/${serviceId}` : '/api/services';
      const method = serviceId ? 'PATCH' : 'POST';
      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.message || 'Failed to save service');
      return serviceId ? true : (data.id || null);
    } catch (error) {
      console.error('Error saving service:', error);
      const fallback = serviceId
        ? t('MODAL.ERRORS.UPDATE_FAILED')
        : t('MODAL.ERRORS.CREATE_FAILED');
      setErrors({ submit: error instanceof Error ? error.message : fallback });
      return false;
    } finally {
      setIsSubmitting(false);
    }
  };

  const reset = useCallback(() => {
    const initialData = getInitialFormData();
    setFormData(initialData);
    initialFormDataSnapshot = snapshot(initialData);
    setCurrentStep(1);
    setErrors({});
    setIsSubmitting(false);
  }, []);

  const markLoaded = useCallback((data: ServiceFormData) => {
    initialFormDataSnapshot = snapshot(data);
  }, []);

  const hasUnsavedChanges = useCallback((): boolean => {
    if (!initialFormDataSnapshot) {
      return snapshot(formData) !== snapshot(getInitialFormData());
    }
    return snapshot(formData) !== initialFormDataSnapshot;
  }, [formData]);

  return {
    formData,
    currentStep,
    isSubmitting,
    errors,
    defaultLanguage,
    secondaryLanguages,
    totalSteps: TOTAL_STEPS,
    getField,
    updateField,
    updateTranslation,
    validateField,
    clearFieldError,
    handleNext,
    handleBack,
    handleSubmit,
    canProceedToNextStep,
    reset,
    markLoaded,
    hasUnsavedChanges,
    setFormData,
  };
}
