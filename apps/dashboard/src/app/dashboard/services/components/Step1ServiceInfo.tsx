"use client";

import React from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useTranslation } from "react-i18next";
import { ServiceFormData } from "../hooks/useServiceForm";

interface Step1ServiceInfoProps {
  formData: ServiceFormData;
  defaultLanguage: string;
  errors: Record<string, string>;
  onUpdateTranslation: (lang: string, field: "name" | "description", value: string) => void;
  onUpdateField: (field: keyof ServiceFormData, value: string) => void;
  onValidateField: (field: keyof ServiceFormData) => void;
  onClearFieldError: (field: string) => void;
  viewOnly?: boolean;
}

const DESCRIPTION_LIMIT = 500;

export function Step1ServiceInfo({
  formData,
  defaultLanguage,
  errors,
  onUpdateTranslation,
  onUpdateField,
  onValidateField,
  onClearFieldError,
  viewOnly = false,
}: Step1ServiceInfoProps) {
  const { t } = useTranslation("SERVICES");
  const code = defaultLanguage.toUpperCase();
  const field = formData.translations[defaultLanguage] ?? { name: "", description: "" };
  const nameError = errors[`${defaultLanguage}.name`];
  const descriptionError = errors[`${defaultLanguage}.description`];

  return (
    <div className="space-y-4">
      {/* Service Name (default language) */}
      <div className="space-y-2">
        <Label htmlFor="service-name">
          {t("MODAL.STEP_1.NAME_LABEL")} ({code})
          <span className="text-black ml-1">{t("MODAL.STEP_1.NAME.REQUIRED")}</span>
        </Label>
        <Input
          id="service-name"
          value={field.name}
          maxLength={255}
          onChange={(e) => onUpdateTranslation(defaultLanguage, "name", e.target.value)}
          onFocus={() => onClearFieldError(`${defaultLanguage}.name`)}
          placeholder={t("MODAL.STEP_1.NAME_PLACEHOLDER")}
          className={nameError ? "border-red-500" : ""}
          disabled={viewOnly}
          readOnly={viewOnly}
        />
        {nameError && <p className="text-sm text-red-500">{nameError}</p>}
      </div>

      {/* Brief Description (default language) */}
      <div className="space-y-2">
        <Label htmlFor="service-description">
          {t("MODAL.STEP_1.DESCRIPTION_LABEL")} ({code})
          <span className="text-black ml-1">{t("MODAL.STEP_1.NAME.REQUIRED")}</span>
        </Label>
        <Textarea
          id="service-description"
          value={field.description}
          onChange={(e) => {
            if (e.target.value.length <= DESCRIPTION_LIMIT) {
              onUpdateTranslation(defaultLanguage, "description", e.target.value);
            }
          }}
          onFocus={() => onClearFieldError(`${defaultLanguage}.description`)}
          placeholder={t("MODAL.STEP_1.DESCRIPTION_PLACEHOLDER")}
          rows={6}
          disabled={viewOnly}
          readOnly={viewOnly}
          maxLength={DESCRIPTION_LIMIT}
          className={`resize-none overflow-y-auto ${descriptionError ? "border-red-500" : ""}`}
        />
        <div className="flex justify-between items-center">
          {descriptionError && <p className="text-sm text-red-500">{descriptionError}</p>}
          <p className="text-sm text-gray-500 ml-auto">
            {field.description.length}/{DESCRIPTION_LIMIT}
          </p>
        </div>
      </div>

      {/* URL */}
      <div className="space-y-2">
        <Label htmlFor="service-url">{t("MODAL.STEP_1.URL.LABEL")}</Label>
        <Input
          id="service-url"
          type="text"
          value={formData.url}
          onChange={(e) => onUpdateField("url", e.target.value)}
          onFocus={() => onClearFieldError("url")}
          onBlur={() => onValidateField("url")}
          placeholder={t("MODAL.STEP_1.URL.PLACEHOLDER")}
          className={errors.url ? "border-red-500" : ""}
          disabled={viewOnly}
          readOnly={viewOnly}
        />
        {errors.url && <p className="text-sm text-red-500">{errors.url}</p>}
      </div>
    </div>
  );
}
