"use client";

import React from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useTranslation } from "react-i18next";
import { ServiceFormData } from "../hooks/useServiceForm";

interface Step1ServiceInfoProps {
  formData: ServiceFormData;
  errors: Record<string, string>;
  onUpdateField: (field: keyof ServiceFormData, value: string) => void;
  onValidateField: (field: keyof ServiceFormData) => void;
  onClearFieldError: (field: keyof ServiceFormData) => void;
  viewOnly?: boolean;
}

export function Step1ServiceInfo({
  formData,
  errors,
  onUpdateField,
  onValidateField,
  onClearFieldError,
  viewOnly = false,
}: Step1ServiceInfoProps) {
  const { t } = useTranslation("SERVICES");

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="service-name">
          {t("MODAL.STEP_1.NAME.LABEL")}
          <span className="text-black ml-1">
            {t("MODAL.STEP_1.NAME.REQUIRED")}
          </span>
        </Label>
        <Input
          id="service-name"
          value={formData.name}
          onChange={(e) => onUpdateField("name", e.target.value)}
          onFocus={() => onClearFieldError("name")}
          onBlur={() => onValidateField("name")}
          placeholder={t("MODAL.STEP_1.NAME.PLACEHOLDER")}
          className={errors.name ? "border-red-500" : ""}
          disabled={viewOnly}
          readOnly={viewOnly}
        />
        {errors.name && (
          <p className="text-sm text-red-500">{errors.name}</p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="service-description">
          {t("MODAL.STEP_1.DESCRIPTION.LABEL")}
          <span className="text-black ml-1">
            {t("MODAL.STEP_1.NAME.REQUIRED")}
          </span>
        </Label>
        <Textarea
          id="service-description"
          value={formData.description}
          onChange={(e) => {
            const value = e.target.value;
            if (value.length <= 150) {
              onUpdateField("description", value);
            }
          }}
          onFocus={() => onClearFieldError("description")}
          onBlur={() => onValidateField("description")}
          placeholder={t("MODAL.STEP_1.DESCRIPTION.PLACEHOLDER")}
          rows={4}
          disabled={viewOnly}
          readOnly={viewOnly}
          maxLength={150}
          className={errors.description ? "border-red-500" : ""}
        />
        <div className="flex justify-between items-center">
          {errors.description && (
            <p className="text-sm text-red-500">{errors.description}</p>
          )}
          <p className="text-sm text-gray-500 ml-auto">
            {formData.description.length}/150
          </p>
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="service-url">
          {t("MODAL.STEP_1.URL.LABEL")}
          <span className="text-black ml-1">
            {t("MODAL.STEP_1.NAME.REQUIRED")}
          </span>
        </Label>
        <Input
          id="service-url"
          type="text"
          value={formData.url}
          onChange={(e) => {
            onUpdateField("url", e.target.value);
            // Validar en tiempo real si hay contenido y hay un error previo
            if (e.target.value.trim() && errors.url) {
              // La validación se hará en updateField si el valor es válido
            }
          }}
          onFocus={() => onClearFieldError("url")}
          onBlur={() => onValidateField("url")}
          placeholder={t("MODAL.STEP_1.URL.PLACEHOLDER")}
          className={errors.url ? "border-red-500" : ""}
          disabled={viewOnly}
          readOnly={viewOnly}
        />
        {errors.url && (
          <p className="text-sm text-red-500">{errors.url}</p>
        )}
      </div>
    </div>
  );
}

