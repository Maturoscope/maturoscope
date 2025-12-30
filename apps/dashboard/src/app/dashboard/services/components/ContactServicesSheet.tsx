"use client";

import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import {
  Sheet,
  SheetContent,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Loader2 } from "lucide-react";
import { useUserContext } from "@/app/hooks/contexts/UserProvider";

interface Gap {
  questionId: string;
  level: number;
  recommendedServices: string[];
}

interface ContactServicesSheetProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  gaps: Gap[];
  projectName?: string;
}

interface ContactFormData {
  company: string;
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber: string;
  additionalInformation: string;
}

export function ContactServicesSheet({
  isOpen,
  onClose,
  onSuccess,
  gaps,
  projectName,
}: ContactServicesSheetProps) {
  const { t } = useTranslation("SERVICES");
  const { user } = useUserContext();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [formData, setFormData] = useState<ContactFormData>({
    company: "",
    firstName: "",
    lastName: "",
    email: "",
    phoneNumber: "",
    additionalInformation: "",
  });

  const organizationKey = user?.organization?.key;

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.firstName.trim()) {
      newErrors.firstName = t("CONTACT.FIRST_NAME_REQUIRED");
    }
    if (!formData.lastName.trim()) {
      newErrors.lastName = t("CONTACT.LAST_NAME_REQUIRED");
    }
    if (!formData.email.trim()) {
      newErrors.email = t("CONTACT.EMAIL_REQUIRED");
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = t("CONTACT.INVALID_EMAIL");
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm()) {
      return;
    }

    if (!organizationKey) {
      setErrors({ submit: t("CONTACT.ORGANIZATION_KEY_MISSING") });
      return;
    }

    setIsSubmitting(true);
    setErrors({});

    try {
      const response = await fetch(
        `/api/services/contact?organizationKey=${encodeURIComponent(organizationKey)}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            gaps,
            company: formData.company || undefined,
            firstName: formData.firstName,
            lastName: formData.lastName,
            email: formData.email,
            phoneNumber: formData.phoneNumber,
            additionalInformation: formData.additionalInformation || undefined,
            projectName: projectName,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || t("CONTACT.SEND_FAILED"));
      }

      onSuccess();
      onClose();
      resetForm();
    } catch (error) {
      setErrors({
        submit:
          error instanceof Error
            ? error.message
            : t("CONTACT.SEND_FAILED"),
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const resetForm = () => {
    setFormData({
      company: "",
      firstName: "",
      lastName: "",
      email: "",
      phoneNumber: "",
      additionalInformation: "",
    });
    setErrors({});
  };

  const handleClose = () => {
    if (!isSubmitting) {
      resetForm();
      onClose();
    }
  };

  return (
    <Sheet open={isOpen} onOpenChange={handleClose}>
      <SheetContent className="sm:max-w-[680px] text-[#0A0A0A] overflow-y-auto">
        <SheetHeader className="pb-1">
          <SheetTitle className="text-lg font-semibold">
            {t("CONTACT.TITLE")}
          </SheetTitle>
        </SheetHeader>

        <div className="w-[95%] mx-auto border-b border-slate-200 mb-4" />

        <div className="flex-1 overflow-y-auto px-4 pb-4 space-y-6">
          <div className="space-y-2">
            <Label htmlFor="company">{t("CONTACT.COMPANY.LABEL")}</Label>
            <Input
              id="company"
              value={formData.company}
              onChange={(e) =>
                setFormData({ ...formData, company: e.target.value })
              }
              placeholder={t("CONTACT.COMPANY.PLACEHOLDER")}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="firstName">
                {t("CONTACT.FIRST_NAME.LABEL")} *
              </Label>
              <Input
                id="firstName"
                value={formData.firstName}
                onChange={(e) =>
                  setFormData({ ...formData, firstName: e.target.value })
                }
                placeholder={t("CONTACT.FIRST_NAME.PLACEHOLDER")}
                className={errors.firstName ? "border-red-500" : ""}
              />
              {errors.firstName && (
                <p className="text-sm text-red-500">{errors.firstName}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="lastName">
                {t("CONTACT.LAST_NAME.LABEL")} *
              </Label>
              <Input
                id="lastName"
                value={formData.lastName}
                onChange={(e) =>
                  setFormData({ ...formData, lastName: e.target.value })
                }
                placeholder={t("CONTACT.LAST_NAME.PLACEHOLDER")}
                className={errors.lastName ? "border-red-500" : ""}
              />
              {errors.lastName && (
                <p className="text-sm text-red-500">{errors.lastName}</p>
              )}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="email">{t("CONTACT.EMAIL.LABEL")} *</Label>
            <Input
              id="email"
              type="email"
              value={formData.email}
              onChange={(e) =>
                setFormData({ ...formData, email: e.target.value })
              }
              placeholder={t("CONTACT.EMAIL.PLACEHOLDER")}
              className={errors.email ? "border-red-500" : ""}
            />
            {errors.email && (
              <p className="text-sm text-red-500">{errors.email}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="phoneNumber">
              {t("CONTACT.PHONE.LABEL")}
            </Label>
            <Input
              id="phoneNumber"
              value={formData.phoneNumber}
              onChange={(e) =>
                setFormData({ ...formData, phoneNumber: e.target.value })
              }
              placeholder={t("CONTACT.PHONE.PLACEHOLDER")}
              className={errors.phoneNumber ? "border-red-500" : ""}
            />
            {errors.phoneNumber && (
              <p className="text-sm text-red-500">{errors.phoneNumber}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="additionalInformation">
              {t("CONTACT.ADDITIONAL_INFO.LABEL")}
            </Label>
            <Textarea
              id="additionalInformation"
              value={formData.additionalInformation}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  additionalInformation: e.target.value,
                })
              }
              placeholder={t("CONTACT.ADDITIONAL_INFO.PLACEHOLDER")}
              rows={4}
            />
          </div>
        </div>

        {errors.submit && (
          <div className="mx-4 mb-4 p-4 bg-red-50 border border-red-200 rounded-md">
            <p className="text-sm text-red-600">{errors.submit}</p>
          </div>
        )}

        <SheetFooter className="px-4 pt-4 sm:justify-end">
          <div className="flex items-center gap-2 ml-auto">
            <Button
              variant="outline"
              onClick={handleClose}
              disabled={isSubmitting}
            >
              {t("CONTACT.CANCEL")}
            </Button>
            <Button
              onClick={handleSubmit}
              disabled={isSubmitting}
              className="bg-foreground text-background hover:bg-foreground/90"
            >
              {isSubmitting ? (
                <span className="flex items-center gap-2">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  {t("CONTACT.SENDING")}
                </span>
              ) : (
                t("CONTACT.SEND")
              )}
            </Button>
          </div>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}

