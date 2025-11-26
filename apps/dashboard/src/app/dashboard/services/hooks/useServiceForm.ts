import { useState, useEffect, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { CreateServicePayload, GapCoverage, ScaleType } from '../types/service';

export interface ServiceFormData {
  // Step 1: Service Information
  name: string;
  description: string;
  url: string;

  // Step 2: Category & Scale
  gapCoverages: GapCoverage[];
  activeCategories: Set<ScaleType>;

  // Step 3: Contact Information
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

export function useServiceForm(serviceId?: string) {
  const { t } = useTranslation();
  const [formData, setFormData] = useState<ServiceFormData>(getInitialFormData);
  const [currentStep, setCurrentStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Load service data if editing
  useEffect(() => {
    if (serviceId) {
      loadServiceData(serviceId);
    }
  }, [serviceId]);

  const loadServiceData = async (id: string) => {
    try {
      const response = await fetch(`/api/services/${id}`);
      const service = await response.json();

      if (!response.ok) {
        throw new Error(service.message || 'Failed to load service');
      }
      
      // Extract active categories from gap coverages
      const activeCategories = new Set<ScaleType>();
      service.gapCoverages.forEach((coverage: { scaleType: ScaleType }) => {
        activeCategories.add(coverage.scaleType);
      });

      setFormData({
        name: service.name,
        description: service.description || '',
        url: service.url || '',
        gapCoverages: service.gapCoverages,
        activeCategories,
        mainContactFirstName: service.mainContactFirstName || '',
        mainContactLastName: service.mainContactLastName || '',
        mainContactEmail: service.mainContactEmail || '',
        secondaryContactFirstName: service.secondaryContactFirstName || '',
        secondaryContactLastName: service.secondaryContactLastName || '',
        secondaryContactEmail: service.secondaryContactEmail || '',
      });
    } catch (error) {
      console.error('Error loading service:', error);
    }
  };

  const updateField = (field: keyof ServiceFormData, value: unknown) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    // Clear error for this field
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

    if (formData.activeCategories.size === 0) {
      newErrors.categories = t('SERVICES.MODAL.ERRORS.NO_CATEGORIES');
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const validateStep3 = (): boolean => {
    const newErrors: Record<string, string> = {};

    // Validate main contact email if provided
    if (
      formData.mainContactEmail &&
      !isValidEmail(formData.mainContactEmail)
    ) {
      newErrors.mainContactEmail = t('SERVICES.MODAL.ERRORS.INVALID_EMAIL');
    }

    // Validate secondary contact email if provided
    if (
      formData.secondaryContactEmail &&
      !isValidEmail(formData.secondaryContactEmail)
    ) {
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
        return formData.activeCategories.size > 0;
      case 3:
        return true;
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
    setFormData(getInitialFormData());
    setCurrentStep(1);
    setErrors({});
    setIsSubmitting(false);
  }, []);

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
  };
}

