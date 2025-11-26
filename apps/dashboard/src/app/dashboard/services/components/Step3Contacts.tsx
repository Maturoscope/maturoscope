"use client";

import React from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useTranslation } from "react-i18next";
import { ServiceFormData } from "../hooks/useServiceForm";

interface Step3ContactsProps {
  formData: ServiceFormData;
  errors: Record<string, string>;
  onUpdateField: (field: keyof ServiceFormData, value: string) => void;
}

export function Step3Contacts({
  formData,
  errors,
  onUpdateField,
}: Step3ContactsProps) {
  const { t } = useTranslation("SERVICES");

  return (
    <div className="space-y-6">
      {/* Main Contact */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-gray-900">
          {t("MODAL.STEP_3.MAIN_CONTACT.TITLE")}
        </h3>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="main-first-name">
              {t("MODAL.STEP_3.MAIN_CONTACT.FIRST_NAME.LABEL")}
            </Label>
            <Input
              id="main-first-name"
              value={formData.mainContactFirstName}
              onChange={(e) =>
                onUpdateField("mainContactFirstName", e.target.value)
              }
              placeholder={t(
                "MODAL.STEP_3.MAIN_CONTACT.FIRST_NAME.PLACEHOLDER"
              )}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="main-last-name">
              {t("MODAL.STEP_3.MAIN_CONTACT.LAST_NAME.LABEL")}
            </Label>
            <Input
              id="main-last-name"
              value={formData.mainContactLastName}
              onChange={(e) =>
                onUpdateField("mainContactLastName", e.target.value)
              }
              placeholder={t(
                "MODAL.STEP_3.MAIN_CONTACT.LAST_NAME.PLACEHOLDER"
              )}
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="main-email">
            {t("MODAL.STEP_3.MAIN_CONTACT.EMAIL.LABEL")}
          </Label>
          <Input
            id="main-email"
            type="email"
            value={formData.mainContactEmail}
            onChange={(e) => onUpdateField("mainContactEmail", e.target.value)}
            placeholder={t(
              "MODAL.STEP_3.MAIN_CONTACT.EMAIL.PLACEHOLDER"
            )}
            className={errors.mainContactEmail ? "border-red-500" : ""}
          />
          {errors.mainContactEmail && (
            <p className="text-sm text-red-500">{errors.mainContactEmail}</p>
          )}
        </div>
      </div>

      {/* Secondary Contact */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-gray-900">
          {t("MODAL.STEP_3.SECONDARY_CONTACT.TITLE")}
        </h3>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="secondary-first-name">
              {t("MODAL.STEP_3.SECONDARY_CONTACT.FIRST_NAME.LABEL")}
            </Label>
            <Input
              id="secondary-first-name"
              value={formData.secondaryContactFirstName}
              onChange={(e) =>
                onUpdateField("secondaryContactFirstName", e.target.value)
              }
              placeholder={t(
                "MODAL.STEP_3.SECONDARY_CONTACT.FIRST_NAME.PLACEHOLDER"
              )}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="secondary-last-name">
              {t("MODAL.STEP_3.SECONDARY_CONTACT.LAST_NAME.LABEL")}
            </Label>
            <Input
              id="secondary-last-name"
              value={formData.secondaryContactLastName}
              onChange={(e) =>
                onUpdateField("secondaryContactLastName", e.target.value)
              }
              placeholder={t(
                "MODAL.STEP_3.SECONDARY_CONTACT.LAST_NAME.PLACEHOLDER"
              )}
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="secondary-email">
            {t("MODAL.STEP_3.SECONDARY_CONTACT.EMAIL.LABEL")}
          </Label>
          <Input
            id="secondary-email"
            type="email"
            value={formData.secondaryContactEmail}
            onChange={(e) =>
              onUpdateField("secondaryContactEmail", e.target.value)
            }
            placeholder={t(
              "MODAL.STEP_3.SECONDARY_CONTACT.EMAIL.PLACEHOLDER"
            )}
            className={errors.secondaryContactEmail ? "border-red-500" : ""}
          />
          {errors.secondaryContactEmail && (
            <p className="text-sm text-red-500">{errors.secondaryContactEmail}</p>
          )}
        </div>
      </div>
    </div>
  );
}

