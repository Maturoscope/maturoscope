"use client";

import React, { useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import {
  Sheet,
  SheetContent,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { ChevronRight, Loader2, Pencil, X } from "lucide-react";
import { useServiceForm } from "../hooks/useServiceForm";
import { Step1ServiceInfo } from "./Step1ServiceInfo";
import { Step2CategoryScale } from "./Step2CategoryScale";
import { Step3Contacts } from "./Step3Contacts";
import { UnsavedChangesDialog } from "./UnsavedChangesDialog";
import { ViewServiceContent } from "./ViewServiceContent";

interface ServiceSheetProps {
  isOpen: boolean;
  onClose: () => void;
  serviceId?: string;
  onSuccess: (serviceName: string) => void;
  viewOnly?: boolean;
  onEdit?: () => void;
}

export function ServiceSheet({
  isOpen,
  onClose,
  serviceId,
  onSuccess,
  viewOnly = false,
  onEdit,
}: ServiceSheetProps) {
  const { t } = useTranslation("SERVICES");
  const [showUnsavedAlert, setShowUnsavedAlert] = useState(false);
  const {
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
    setFormData,
  } = useServiceForm(serviceId);

  useEffect(() => {
    if (isOpen && serviceId) {
      let isMounted = true;
      
      const loadData = async () => {
        try {
          const response = await fetch(`/api/services/${serviceId}`);
          
          if (!response.ok) {
            const errorData = await response.json().catch(() => ({ message: 'Failed to load service' }));
            throw new Error(errorData.message || 'Failed to load service');
          }
          
          const service = await response.json();
          
          if (!isMounted) return;
          
          const activeCategories = new Set<string>();
          if (service.gapCoverages && Array.isArray(service.gapCoverages)) {
            service.gapCoverages.forEach((coverage: { scaleType: string }) => {
              activeCategories.add(coverage.scaleType);
            });
          }
          
          setFormData((prev) => ({
            ...prev,
            name: service.name || '',
            description: service.description || '',
            url: service.url || '',
            gapCoverages: service.gapCoverages || [],
            activeCategories: activeCategories as Set<'TRL' | 'MkRL' | 'MfRL'>,
            mainContactFirstName: service.mainContactFirstName || '',
            mainContactLastName: service.mainContactLastName || '',
            mainContactEmail: service.mainContactEmail || '',
            secondaryContactFirstName: service.secondaryContactFirstName || '',
            secondaryContactLastName: service.secondaryContactLastName || '',
            secondaryContactEmail: service.secondaryContactEmail || '',
          }));
        } catch (error) {
          console.error('Error loading service:', error);
        }
      };
      
      loadData();
      
      return () => {
        isMounted = false;
      };
    }
  }, [isOpen, serviceId, setFormData]);

  useEffect(() => {
    if (!isOpen) {
      reset();
      setShowUnsavedAlert(false);
    }
  }, [isOpen, reset]);

  const handleSheetOpenChange = (open: boolean) => {
    if (!open) {
      if (!viewOnly && hasUnsavedChanges()) {
        setShowUnsavedAlert(true);
      } else {
        onClose();
        reset();
      }
    } else {
      onClose();
    }
  };

  const handleConfirmClose = () => {
    setShowUnsavedAlert(false);
    onClose();
    reset();
  };

  const handleCancelClose = () => {
    setShowUnsavedAlert(false);
  };

  const handleFinalSubmit = async () => {
    const success = await handleSubmit();
    if (success) {
      onSuccess(formData.name);
      onClose();
    }
  };

  const STEPS = [
    { number: 1, label: t("MODAL.STEPS.SERVICE_INFO") },
    { number: 2, label: t("MODAL.STEPS.CATEGORY_SCALE") },
    { number: 3, label: t("MODAL.STEPS.CONTACTS") },
  ];

  const progressValue = useMemo(() => {
    return (currentStep / STEPS.length) * 100;
  }, [currentStep, STEPS.length]);

  // Handle edit action
  const handleEdit = () => {
    if (onEdit) {
      onEdit();
    } else {
      // Default behavior: close view and open edit mode
      onClose();
    }
  };

  return (
    <>
    <Sheet open={isOpen} onOpenChange={handleSheetOpenChange}>
      <SheetContent className={`sm:max-w-[680px] text-[#0A0A0A] overflow-y-auto ${viewOnly ? '[&>button]:hidden' : ''}`}>
        {viewOnly ? (
          <>
            <SheetHeader className="pb-1">
              <div className="flex items-center justify-between">
                <SheetTitle className="text-lg font-semibold">
                  {t("MODAL.VIEW_TITLE")}
                </SheetTitle>
                <div className="flex items-center gap-2">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={handleEdit}
                    className="h-8 w-8 p-0 border border-gray-300 rounded bg-white hover:bg-gray-50 flex items-center justify-center"
                  >
                    <Pencil className="h-4 w-4 text-[#0A0A0A]" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={onClose}
                    className="h-8 w-8 p-0 hover:bg-transparent"
                  >
                    <X className="h-4 w-4 text-[#0A0A0A]" />
                  </Button>
                </div>
              </div>
            </SheetHeader>

            <div className="flex-1 overflow-y-auto px-4 pb-4 pt-6">
              <ViewServiceContent
                formData={formData}
                onEdit={handleEdit}
                onClose={onClose}
              />
            </div>
          </>
        ) : (
          // Edit/Create Mode Layout
          <>
            <SheetHeader className="pb-1">
              <SheetTitle className="text-lg font-semibold">
                {serviceId 
                  ? t("MODAL.EDIT_TITLE") 
                  : t("MODAL.CREATE_TITLE")}
              </SheetTitle>
            </SheetHeader>

            <div className="w-[95%] mx-auto border-b border-slate-200 mb-4" />

            <div className="mb-4 px-4">
              <div className="flex items-center gap-2 mb-3">
                {STEPS.map((step, index) => (
                  <React.Fragment key={step.number}>
                    <span
                      className={`
                        text-sm font-medium
                        ${
                          currentStep >= step.number
                            ? "text-[#0A0A0A]"
                            : "text-[#8C8C8C]"
                        }
                      `}
                    >
                      {step.number}. {step.label}
                    </span>
                    {index < STEPS.length - 1 && (
                      <ChevronRight className="h-4 w-4 text-[#8C8C8C]" />
                    )}
                  </React.Fragment>
                ))}
              </div>
              <div className="relative h-2 w-full bg-[#E5E5E5] rounded-full overflow-hidden">
                <div
                  className="absolute top-0 left-0 h-full bg-[#0A0A0A] transition-all duration-300 ease-in-out rounded-full"
                  style={{ width: `${progressValue}%` }}
                />
              </div>
            </div>

            <div className="flex-1 overflow-y-auto px-4 pb-4">
              {currentStep === 1 && (
                <Step1ServiceInfo
                  formData={formData}
                  errors={errors}
                  onUpdateField={updateField}
                  viewOnly={viewOnly}
                />
              )}
              {currentStep === 2 && (
                <Step2CategoryScale
                  formData={formData}
                  errors={errors}
                  onUpdateField={updateField}
                  viewOnly={viewOnly}
                />
              )}
              {currentStep === 3 && (
                <Step3Contacts
                  formData={formData}
                  errors={errors}
                  onUpdateField={updateField}
                  viewOnly={viewOnly}
                />
              )}
            </div>

            {errors.submit && (
              <div className="mx-4 mb-4 p-4 bg-red-50 border border-red-200 rounded-md">
                <p className="text-sm text-red-600">{errors.submit}</p>
              </div>
            )}

            <SheetFooter className="px-4 pt-4 sm:justify-end">
              <div className="flex items-center gap-2 ml-auto">
                {currentStep > 1 && (
                  <Button
                    variant="outline"
                    onClick={handleBack}
                    disabled={isSubmitting}
                  >
                    {t("MODAL.BUTTONS.BACK")}
                  </Button>
                )}

                {currentStep < 3 ? (
                  <Button
                    onClick={handleNext}
                    disabled={!canProceedToNextStep() || isSubmitting}
                    className="bg-foreground text-background hover:bg-foreground/90"
                  >
                    {t("MODAL.BUTTONS.NEXT")}
                  </Button>
                ) : (
                  <Button
                    onClick={handleFinalSubmit}
                    disabled={!canProceedToNextStep() || isSubmitting}
                    className="bg-foreground text-background hover:bg-foreground/90"
                  >
                    {isSubmitting ? (
                      <span className="flex items-center gap-2">
                        <Loader2 className="h-4 w-4 animate-spin" />
                        {serviceId
                          ? t("MODAL.BUTTONS.UPDATING")
                          : t("MODAL.BUTTONS.CREATING")}
                      </span>
                    ) : serviceId ? (
                      t("MODAL.BUTTONS.UPDATE")
                    ) : (
                      t("MODAL.BUTTONS.CREATE")
                    )}
                  </Button>
                )}
              </div>
            </SheetFooter>
          </>
        )}
      </SheetContent>
    </Sheet>

    <UnsavedChangesDialog
      open={showUnsavedAlert}
      onOpenChange={setShowUnsavedAlert}
      onConfirm={handleConfirmClose}
      onCancel={handleCancelClose}
    />
    </>
  );
}

