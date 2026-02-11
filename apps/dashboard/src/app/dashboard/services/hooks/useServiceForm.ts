import { useState, useEffect, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { CreateServicePayload, GapCoverage, ScaleType } from '../types/service';

export interface ServiceFormData {
  nameEn: string;
  nameFr: string;
  descriptionEn: string;
  descriptionFr: string;
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

const getInitialFormData = (): ServiceFormData => ({
  nameEn: '',
  nameFr: '',
  descriptionEn: '',
  descriptionFr: '',
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

interface ServiceFormDataSnapshot {
  nameEn: string;
  nameFr: string;
  descriptionEn: string;
  descriptionFr: string;
  url: string;
  gapCoverages: GapCoverage[];
  activeCategories: string[];
  mainContactFirstName: string;
  mainContactLastName: string;
  mainContactEmail: string;
  secondaryContactFirstName: string;
  secondaryContactLastName: string;
  secondaryContactEmail: string;
}

let initialFormDataSnapshot: ServiceFormDataSnapshot | null = null;

export function useServiceForm(serviceId?: string) {
  const { t } = useTranslation("SERVICES");
  const [formData, setFormData] = useState<ServiceFormData>(getInitialFormData);
  const [currentStep, setCurrentStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (!serviceId) {
      const initialData = getInitialFormData();
      setFormData(initialData);
      setCurrentStep(1);
      setErrors({});
      const snapshotData = {
        ...initialData,
        activeCategories: Array.from(initialData.activeCategories),
      };
      initialFormDataSnapshot = JSON.parse(JSON.stringify(snapshotData));
    }
  }, [serviceId]);

  const loadServiceData = useCallback(async (id: string) => {
    try {
      const response = await fetch(`/api/services/${id}`);
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ message: 'Failed to load service' }));
        throw new Error(errorData.message || 'Failed to load service');
      }
      
      const service = await response.json();
      
      const activeCategories = new Set<ScaleType>();
      if (service.gapCoverages && Array.isArray(service.gapCoverages)) {
        service.gapCoverages.forEach((coverage: { scaleType: ScaleType }) => {
          activeCategories.add(coverage.scaleType);
        });
      }

      const loadedData: ServiceFormData = {
        nameEn: service.nameEn || '',
        nameFr: service.nameFr || '',
        descriptionEn: service.descriptionEn || '',
        descriptionFr: service.descriptionFr || '',
        url: service.url || '',
        gapCoverages: service.gapCoverages || [],
        activeCategories,
        mainContactFirstName: service.mainContactFirstName || '',
        mainContactLastName: service.mainContactLastName || '',
        mainContactEmail: service.mainContactEmail || '',
        secondaryContactFirstName: service.secondaryContactFirstName || '',
        secondaryContactLastName: service.secondaryContactLastName || '',
        secondaryContactEmail: service.secondaryContactEmail || '',
      };

      setFormData(loadedData);
      setCurrentStep(1);
      setErrors({});
      
      const snapshotData = {
        ...loadedData,
        activeCategories: Array.from(loadedData.activeCategories),
      };
      initialFormDataSnapshot = JSON.parse(JSON.stringify(snapshotData));
    } catch (error) {
      console.error('Error loading service:', error);
    }
  }, []);

  const updateField = (field: keyof ServiceFormData, value: unknown) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    
    if (errors[field]) {
      const stringValue = String(value).trim();
      
      if (field === 'url') {
        if (stringValue && isValidUrl(stringValue)) {
          setErrors((prev) => {
            const newErrors = { ...prev };
            delete newErrors[field];
            return newErrors;
          });
        }
      } else if (field === 'mainContactEmail' || field === 'secondaryContactEmail') {
        if (stringValue && isValidEmail(stringValue)) {
          setErrors((prev) => {
            const newErrors = { ...prev };
            delete newErrors[field];
            return newErrors;
          });
        }
      } else {
        if (stringValue) {
          setErrors((prev) => {
            const newErrors = { ...prev };
            delete newErrors[field];
            return newErrors;
          });
        }
      }
    }
  };

  const isValidUrl = (url: string): boolean => {
    if (!url.trim()) return false;
    
    try {
      let urlToValidate = url.trim();
      
      if (!urlToValidate.startsWith('http://') && !urlToValidate.startsWith('https://')) {
        urlToValidate = `https://${urlToValidate}`;
      }
      
      const urlObj = new URL(urlToValidate);
      
      if (urlObj.protocol !== 'http:' && urlObj.protocol !== 'https:') {
        return false;
      }
      
      if (!urlObj.hostname || urlObj.hostname.length < 1) {
        return false;
      }
      
      const isLocalhost = urlObj.hostname === 'localhost';
      const isIpAddress = /^(\d{1,3}\.){3}\d{1,3}$/.test(urlObj.hostname);
      
      if (!isLocalhost && !isIpAddress && !urlObj.hostname.includes('.')) {
        return false;
      }
      
      if (urlObj.hostname.replace(/\./g, '').length === 0) {
        return false;
      }
      
      return true;
    } catch {
      return false;
    }
  };

  const clearFieldError = (field: keyof ServiceFormData): void => {
    if (errors[field]) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
  };

  const validateField = (field: keyof ServiceFormData): void => {
    const newErrors: Record<string, string> = { ...errors };

    if (field === 'nameEn') {
      if (!formData.nameEn.trim()) {
        newErrors.nameEn = t('MODAL.ERRORS.NAME_REQUIRED');
      } else {
        delete newErrors.nameEn;
      }
    }

    if (field === 'nameFr') {
      if (!formData.nameFr.trim()) {
        newErrors.nameFr = t('MODAL.ERRORS.NAME_REQUIRED');
      } else {
        delete newErrors.nameFr;
      }
    }

    if (field === 'descriptionEn') {
      if (!formData.descriptionEn.trim()) {
        newErrors.descriptionEn = t('MODAL.ERRORS.DESCRIPTION_REQUIRED');
      } else {
        delete newErrors.descriptionEn;
      }
    }

    if (field === 'descriptionFr') {
      if (!formData.descriptionFr.trim()) {
        newErrors.descriptionFr = t('MODAL.ERRORS.DESCRIPTION_REQUIRED');
      } else {
        delete newErrors.descriptionFr;
      }
    }

    if (field === 'url') {
      if (!formData.url.trim()) {
        newErrors.url = t('MODAL.ERRORS.URL_REQUIRED');
      } else if (!isValidUrl(formData.url)) {
        newErrors.url = t('MODAL.ERRORS.URL_INVALID');
      } else {
        delete newErrors.url;
      }
    }

    // Main Contact fields
    if (field === 'mainContactFirstName') {
      if (!formData.mainContactFirstName.trim()) {
        newErrors.mainContactFirstName = t('MODAL.ERRORS.FIRST_NAME_REQUIRED');
      } else {
        delete newErrors.mainContactFirstName;
      }
    }

    if (field === 'mainContactLastName') {
      if (!formData.mainContactLastName.trim()) {
        newErrors.mainContactLastName = t('MODAL.ERRORS.LAST_NAME_REQUIRED');
      } else {
        delete newErrors.mainContactLastName;
      }
    }

    if (field === 'mainContactEmail') {
      if (!formData.mainContactEmail.trim()) {
        newErrors.mainContactEmail = t('MODAL.ERRORS.EMAIL_REQUIRED');
      } else if (!isValidEmail(formData.mainContactEmail)) {
        newErrors.mainContactEmail = t('MODAL.ERRORS.INVALID_EMAIL');
      } else {
        delete newErrors.mainContactEmail;
      }
    }

    // Secondary Contact fields (optional BUT if any field is filled, all must be filled)
    if (field === 'secondaryContactFirstName') {
      const hasAnySecondaryContact = 
        formData.secondaryContactFirstName.trim() || 
        formData.secondaryContactLastName.trim() || 
        formData.secondaryContactEmail.trim();

      if (hasAnySecondaryContact && !formData.secondaryContactFirstName.trim()) {
        newErrors.secondaryContactFirstName = t('MODAL.ERRORS.FIRST_NAME_REQUIRED');
      } else {
        delete newErrors.secondaryContactFirstName;
      }
    }

    if (field === 'secondaryContactLastName') {
      const hasAnySecondaryContact = 
        formData.secondaryContactFirstName.trim() || 
        formData.secondaryContactLastName.trim() || 
        formData.secondaryContactEmail.trim();

      if (hasAnySecondaryContact && !formData.secondaryContactLastName.trim()) {
        newErrors.secondaryContactLastName = t('MODAL.ERRORS.LAST_NAME_REQUIRED');
      } else {
        delete newErrors.secondaryContactLastName;
      }
    }

    if (field === 'secondaryContactEmail') {
      const hasAnySecondaryContact = 
        formData.secondaryContactFirstName.trim() || 
        formData.secondaryContactLastName.trim() || 
        formData.secondaryContactEmail.trim();

      if (hasAnySecondaryContact) {
        if (!formData.secondaryContactEmail.trim()) {
          newErrors.secondaryContactEmail = t('MODAL.ERRORS.EMAIL_REQUIRED');
        } else if (!isValidEmail(formData.secondaryContactEmail)) {
          newErrors.secondaryContactEmail = t('MODAL.ERRORS.INVALID_EMAIL');
        } else {
          delete newErrors.secondaryContactEmail;
        }
      } else {
        delete newErrors.secondaryContactEmail;
      }
    }

    setErrors(newErrors);
  };

  const validateStep1 = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.nameEn.trim()) {
      newErrors.nameEn = t('MODAL.ERRORS.NAME_REQUIRED');
    }

    if (!formData.nameFr.trim()) {
      newErrors.nameFr = t('MODAL.ERRORS.NAME_REQUIRED');
    }

    if (!formData.descriptionEn.trim()) {
      newErrors.descriptionEn = t('MODAL.ERRORS.DESCRIPTION_REQUIRED');
    }

    if (!formData.descriptionFr.trim()) {
      newErrors.descriptionFr = t('MODAL.ERRORS.DESCRIPTION_REQUIRED');
    }

    if (!formData.url.trim()) {
      newErrors.url = t('MODAL.ERRORS.URL_REQUIRED');
    } else if (!isValidUrl(formData.url)) {
      newErrors.url = t('MODAL.ERRORS.URL_INVALID');
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const validateStep2 = (): boolean => {
    const newErrors: Record<string, string> = {};
    const hasActiveCategories = formData.gapCoverages.length > 0;

    if (!hasActiveCategories) {
      newErrors.categories = t('MODAL.ERRORS.NO_CATEGORIES');
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const validateStep3 = (): boolean => {
    const newErrors: Record<string, string> = {};

    // Main Contact is required
    if (!formData.mainContactFirstName.trim()) {
      newErrors.mainContactFirstName = t('MODAL.ERRORS.FIRST_NAME_REQUIRED');
    }
    if (!formData.mainContactLastName.trim()) {
      newErrors.mainContactLastName = t('MODAL.ERRORS.LAST_NAME_REQUIRED');
    }
    if (!formData.mainContactEmail.trim()) {
      newErrors.mainContactEmail = t('MODAL.ERRORS.EMAIL_REQUIRED');
    } else if (!isValidEmail(formData.mainContactEmail)) {
      newErrors.mainContactEmail = t('MODAL.ERRORS.INVALID_EMAIL');
    }

    // Secondary Contact is optional BUT if any field is filled, all must be filled
    const hasAnySecondaryContact = 
      formData.secondaryContactFirstName.trim() || 
      formData.secondaryContactLastName.trim() || 
      formData.secondaryContactEmail.trim();

    if (hasAnySecondaryContact) {
      // If user started filling secondary contact, all fields are required
      if (!formData.secondaryContactFirstName.trim()) {
        newErrors.secondaryContactFirstName = t('MODAL.ERRORS.FIRST_NAME_REQUIRED');
      }
      if (!formData.secondaryContactLastName.trim()) {
        newErrors.secondaryContactLastName = t('MODAL.ERRORS.LAST_NAME_REQUIRED');
      }
      if (!formData.secondaryContactEmail.trim()) {
        newErrors.secondaryContactEmail = t('MODAL.ERRORS.EMAIL_REQUIRED');
      } else if (!isValidEmail(formData.secondaryContactEmail)) {
        newErrors.secondaryContactEmail = t('MODAL.ERRORS.INVALID_EMAIL');
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const isValidEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const canProceedToNextStep = (): boolean => {
    switch (currentStep) {
      case 1:
        return !!(
          formData.nameEn.trim() &&
          formData.nameFr.trim() &&
          formData.descriptionEn.trim() &&
          formData.descriptionFr.trim() &&
          formData.url.trim() &&
          isValidUrl(formData.url)
        );
      case 2:
        return formData.gapCoverages.length > 0;
      case 3: {
        // Main Contact is required
        const mainContactValid = !!(
          formData.mainContactFirstName.trim() &&
          formData.mainContactLastName.trim() &&
          formData.mainContactEmail.trim() &&
          isValidEmail(formData.mainContactEmail)
        );

        // Secondary Contact: if any field is filled, all must be filled
        const hasAnySecondaryContact = 
          formData.secondaryContactFirstName.trim() || 
          formData.secondaryContactLastName.trim() || 
          formData.secondaryContactEmail.trim();

        let secondaryContactValid = true;
        if (hasAnySecondaryContact) {
          secondaryContactValid = !!(
            formData.secondaryContactFirstName.trim() &&
            formData.secondaryContactLastName.trim() &&
            formData.secondaryContactEmail.trim() &&
            isValidEmail(formData.secondaryContactEmail)
          );
        }

        return mainContactValid && secondaryContactValid;
      }
      default:
        return false;
    }
  };

  const handleNext = () => {
    let isValid = false;

    switch (currentStep) {
      case 1:
        isValid = validateStep1();
        break;
      case 2:
        isValid = validateStep2();
        break;
      case 3:
        isValid = validateStep3();
        break;
      default:
        isValid = true;
    }

    if (isValid) {
      setCurrentStep((prev) => Math.min(prev + 1, 3));
    }
  };

  const handleBack = () => {
    setCurrentStep((prev) => Math.max(prev - 1, 1));
  };

  const handleSubmit = async (): Promise<string | boolean> => {
    if (!validateStep3()) {
      return false;
    }

    setIsSubmitting(true);
    try {
      const payload: CreateServicePayload = {
        name: formData.nameEn, // Use English as default for backend compatibility
        nameEn: formData.nameEn,
        nameFr: formData.nameFr,
        description: formData.descriptionEn, // Use English as default for backend compatibility
        descriptionEn: formData.descriptionEn,
        descriptionFr: formData.descriptionFr,
        url: formData.url,
        mainContactFirstName: formData.mainContactFirstName,
        mainContactLastName: formData.mainContactLastName,
        mainContactEmail: formData.mainContactEmail,
        secondaryContactFirstName: formData.secondaryContactFirstName,
        secondaryContactLastName: formData.secondaryContactLastName,
        secondaryContactEmail: formData.secondaryContactEmail,
        gapCoverages: formData.gapCoverages,
      };

      const url = serviceId ? `/api/services/${serviceId}` : '/api/services';
      const method = serviceId ? 'PATCH' : 'POST';

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to save service');
      }

      // Return the service ID if it was created (not updated), or true if updated
      return serviceId ? true : (data.id || null);
    } catch (error) {
      console.error('Error saving service:', error);
      const errorMessage = serviceId
        ? t('MODAL.ERRORS.UPDATE_FAILED')
        : t('MODAL.ERRORS.CREATE_FAILED');
      const errorMsg = error instanceof Error ? error.message : errorMessage;
      setErrors({ submit: errorMsg });
      return false;
    } finally {
      setIsSubmitting(false);
    }
  };

  const reset = useCallback(() => {
    const initialData = getInitialFormData();
    setFormData(initialData);
    const snapshotData = {
      ...initialData,
      activeCategories: Array.from(initialData.activeCategories),
    };
    initialFormDataSnapshot = JSON.parse(JSON.stringify(snapshotData));
    setCurrentStep(1);
    setErrors({});
    setIsSubmitting(false);
  }, []);

  const hasUnsavedChanges = useCallback((): boolean => {
    if (!initialFormDataSnapshot) {
      return !!(
        formData.nameEn.trim() ||
        formData.nameFr.trim() ||
        formData.descriptionEn.trim() ||
        formData.descriptionFr.trim() ||
        formData.url.trim() ||
        formData.gapCoverages.length > 0 ||
        formData.mainContactFirstName.trim() ||
        formData.mainContactLastName.trim() ||
        formData.mainContactEmail.trim() ||
        formData.secondaryContactFirstName.trim() ||
        formData.secondaryContactLastName.trim() ||
        formData.secondaryContactEmail.trim()
      );
    }

    const currentData = {
      ...formData,
      activeCategories: Array.from(formData.activeCategories).sort(),
      gapCoverages: formData.gapCoverages.sort((a, b) => {
        if (a.scaleType !== b.scaleType) return a.scaleType.localeCompare(b.scaleType);
        if (a.questionId !== b.questionId) return a.questionId.localeCompare(b.questionId);
        return a.level - b.level;
      }),
    };
    const initialData = {
      ...initialFormDataSnapshot,
      activeCategories: initialFormDataSnapshot.activeCategories.sort(),
      gapCoverages: initialFormDataSnapshot.gapCoverages.sort((a, b) => {
        if (a.scaleType !== b.scaleType) return a.scaleType.localeCompare(b.scaleType);
        if (a.questionId !== b.questionId) return a.questionId.localeCompare(b.questionId);
        return a.level - b.level;
      }),
    };
    
    const current = JSON.stringify(currentData);
    const initial = JSON.stringify(initialData);
    return current !== initial;
  }, [formData]);

  useEffect(() => {
    if (!serviceId) {
      const initialData = getInitialFormData();
      const snapshotData = {
        ...initialData,
        activeCategories: Array.from(initialData.activeCategories),
      };
      initialFormDataSnapshot = JSON.parse(JSON.stringify(snapshotData));
    }
  }, [serviceId]);

  return {
    formData,
    currentStep,
    isSubmitting,
    errors,
    updateField,
    validateField,
    clearFieldError,
    handleNext,
    handleBack,
    handleSubmit,
    canProceedToNextStep,
    reset,
    hasUnsavedChanges,
    loadServiceData,
    setFormData,
  };
}

