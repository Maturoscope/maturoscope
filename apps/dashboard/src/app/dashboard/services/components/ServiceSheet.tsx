"use client";

import React, { useEffect } from "react";
import { useTranslation } from "react-i18next";
import {
  Sheet,
  SheetContent,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import { useServiceForm } from "../hooks/useServiceForm";
import { Step1ServiceInfo } from "./Step1ServiceInfo";
import { Step2CategoryScale } from "./Step2CategoryScale";
import { Step3Contacts } from "./Step3Contacts";

interface ServiceSheetProps {
  isOpen: boolean;
  onClose: () => void;
  serviceId?: string;
  onSuccess: (serviceName: string) => void;
}

export function ServiceSheet({
  isOpen,
  onClose,
  serviceId,
  onSuccess,
}: ServiceSheetProps) {
  const { t } = useTranslation("SERVICES");
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
  } = useServiceForm(serviceId);

  // Reset form when sheet closes
  useEffect(() => {
    if (!isOpen) {
      reset();
    }
  }, [isOpen, reset]);

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

  return (
    <Sheet open={isOpen} onOpenChange={onClose}>
      <SheetContent className="sm:max-w-[680px] text-[#0A0A0A] overflow-y-auto">
        <SheetHeader className="pb-4">
          <SheetTitle className="text-lg font-semibold">
            {serviceId ? t("MODAL.EDIT_TITLE") : t("MODAL.CREATE_TITLE")}
          </SheetTitle>
        </SheetHeader>

        <div className="w-[95%] mx-auto border-b border-slate-200 mb-4" />

        {/* Step Indicator */}
        <div className="flex items-center justify-between mb-6 px-4">
          {STEPS.map((step, index) => (
            <div key={step.number} className="flex items-center flex-1">
              <div className="flex items-center">
                <div
                  className={`
                    flex items-center justify-center w-8 h-8 rounded-full text-sm font-medium
                    ${
                      currentStep >= step.number
                        ? "bg-foreground text-background"
                        : "bg-gray-200 text-gray-600"
                    }
                  `}
                >
                  {step.number}
                </div>
                <span
                  className={`
                    ml-2 text-sm font-medium hidden md:inline
                    ${
                      currentStep >= step.number
                        ? "text-[#0A0A0A]"
                        : "text-gray-500"
                    }
                  `}
                >
                  {step.label}
                </span>
              </div>

              {/* Connector Line */}
              {index < STEPS.length - 1 && (
                <div className="flex-1 h-0.5 bg-gray-200 mx-2 md:mx-4" />
              )}
            </div>
          ))}
        </div>

        {/* Step Content */}
        <div className="flex-1 overflow-y-auto px-4 pb-4">
          {currentStep === 1 && (
            <Step1ServiceInfo
              formData={formData}
              errors={errors}
              onUpdateField={updateField}
            />
          )}
          {currentStep === 2 && (
            <Step2CategoryScale
              formData={formData}
              errors={errors}
              onUpdateField={updateField}
            />
          )}
          {currentStep === 3 && (
            <Step3Contacts
              formData={formData}
              errors={errors}
              onUpdateField={updateField}
            />
          )}
        </div>

        {/* Submit Error */}
        {errors.submit && (
          <div className="mx-4 mb-4 p-4 bg-red-50 border border-red-200 rounded-md">
            <p className="text-sm text-red-600">{errors.submit}</p>
          </div>
        )}

        {/* Navigation Buttons */}
        <SheetFooter className="px-4 pt-4 border-t flex-row justify-between sm:justify-between">
          <Button
            variant="outline"
            onClick={onClose}
            disabled={isSubmitting}
            className="order-1"
          >
            {t("MODAL.BUTTONS.CANCEL")}
          </Button>

          <div className="flex items-center gap-2 order-2">
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
                disabled={isSubmitting}
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
      </SheetContent>
    </Sheet>
  );
}

