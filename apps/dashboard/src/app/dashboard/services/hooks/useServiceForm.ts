import { useState, useEffect, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { CreateServicePayload, GapCoverage, ScaleType } from '../types/service';

export interface ServiceFormData {
  name: string;
  description: string;
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
  name: '',
  description: '',
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
  name: string;
  description: string;
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
  const { t } = useTranslation();
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
        name: service.name || '',
        description: service.description || '',
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
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
  };

  const validateStep1 = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) {
      newErrors.name = t('SERVICES.MODAL.ERRORS.NAME_REQUIRED');
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const validateStep2 = (): boolean => {
    const newErrors: Record<string, string> = {};
    const hasActiveCategories = formData.gapCoverages.length > 0;

    if (!hasActiveCategories) {
      newErrors.categories = t('SERVICES.MODAL.ERRORS.NO_CATEGORIES');
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const validateStep3 = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.mainContactFirstName.trim()) {
      newErrors.mainContactFirstName = t('SERVICES.MODAL.ERRORS.FIRST_NAME_REQUIRED');
    }
    if (!formData.mainContactLastName.trim()) {
      newErrors.mainContactLastName = t('SERVICES.MODAL.ERRORS.LAST_NAME_REQUIRED');
    }
    if (!formData.mainContactEmail.trim()) {
      newErrors.mainContactEmail = t('SERVICES.MODAL.ERRORS.EMAIL_REQUIRED');
    } else if (!isValidEmail(formData.mainContactEmail)) {
      newErrors.mainContactEmail = t('SERVICES.MODAL.ERRORS.INVALID_EMAIL');
    }

    if (!formData.secondaryContactFirstName.trim()) {
      newErrors.secondaryContactFirstName = t('SERVICES.MODAL.ERRORS.FIRST_NAME_REQUIRED');
    }
    if (!formData.secondaryContactLastName.trim()) {
      newErrors.secondaryContactLastName = t('SERVICES.MODAL.ERRORS.LAST_NAME_REQUIRED');
    }
    if (!formData.secondaryContactEmail.trim()) {
      newErrors.secondaryContactEmail = t('SERVICES.MODAL.ERRORS.EMAIL_REQUIRED');
    } else if (!isValidEmail(formData.secondaryContactEmail)) {
      newErrors.secondaryContactEmail = t('SERVICES.MODAL.ERRORS.INVALID_EMAIL');
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
        return !!formData.name.trim();
      case 2:
        return formData.gapCoverages.length > 0;
      case 3:
        return !!(
          formData.mainContactFirstName.trim() &&
          formData.mainContactLastName.trim() &&
          formData.mainContactEmail.trim() &&
          isValidEmail(formData.mainContactEmail) &&
          formData.secondaryContactFirstName.trim() &&
          formData.secondaryContactLastName.trim() &&
          formData.secondaryContactEmail.trim() &&
          isValidEmail(formData.secondaryContactEmail)
        );
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

  const handleSubmit = async (): Promise<boolean> => {
    if (!validateStep3()) {
      return false;
    }

    setIsSubmitting(true);
    try {
      const payload: CreateServicePayload = {
        name: formData.name,
        description: formData.description,
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

      return true;
    } catch (error) {
      console.error('Error saving service:', error);
      const errorMessage = serviceId
        ? t('SERVICES.MODAL.ERRORS.UPDATE_FAILED')
        : t('SERVICES.MODAL.ERRORS.CREATE_FAILED');
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
        formData.name.trim() ||
        formData.description.trim() ||
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

