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
        <Label htmlFor="service-name-en">
          {t("MODAL.STEP_1.NAME_EN.LABEL")}
          <span className="text-black ml-1">
            {t("MODAL.STEP_1.NAME.REQUIRED")}
          </span>
        </Label>
        <Input
          id="service-name-en"
          value={formData.nameEn}
          onChange={(e) => onUpdateField("nameEn", e.target.value)}
          onFocus={() => onClearFieldError("nameEn")}
          onBlur={() => onValidateField("nameEn")}
          placeholder={t("MODAL.STEP_1.NAME_EN.PLACEHOLDER")}
          className={errors.nameEn ? "border-red-500" : ""}
          disabled={viewOnly}
          readOnly={viewOnly}
        />
        {errors.nameEn && (
          <p className="text-sm text-red-500">{errors.nameEn}</p>
        )}
      </div>

      {/* Service Name (FR) */}
      <div className="space-y-2">
        <Label htmlFor="service-name-fr">
          {t("MODAL.STEP_1.NAME_FR.LABEL")}
          <span className="text-black ml-1">
            {t("MODAL.STEP_1.NAME.REQUIRED")}
          </span>
        </Label>
        <Input
          id="service-name-fr"
          value={formData.nameFr}
          onChange={(e) => onUpdateField("nameFr", e.target.value)}
          onFocus={() => onClearFieldError("nameFr")}
          onBlur={() => onValidateField("nameFr")}
          placeholder={t("MODAL.STEP_1.NAME_FR.PLACEHOLDER")}
          className={errors.nameFr ? "border-red-500" : ""}
          disabled={viewOnly}
          readOnly={viewOnly}
        />
        {errors.nameFr && (
          <p className="text-sm text-red-500">{errors.nameFr}</p>
        )}
      </div>

      {/* Brief Description (EN) */}
      <div className="space-y-2">
        <Label htmlFor="service-description-en">
          {t("MODAL.STEP_1.DESCRIPTION_EN.LABEL")}
          <span className="text-black ml-1">
            {t("MODAL.STEP_1.NAME.REQUIRED")}
          </span>
        </Label>
        <Textarea
          id="service-description-en"
          value={formData.descriptionEn}
          onChange={(e) => {
            const value = e.target.value;
            if (value.length <= 150) {
              onUpdateField("descriptionEn", value);
            }
          }}
          onFocus={() => onClearFieldError("descriptionEn")}
          onBlur={() => onValidateField("descriptionEn")}
          placeholder={t("MODAL.STEP_1.DESCRIPTION_EN.PLACEHOLDER")}
          rows={4}
          disabled={viewOnly}
          readOnly={viewOnly}
          maxLength={150}
          className={errors.descriptionEn ? "border-red-500" : ""}
        />
        <div className="flex justify-between items-center">
          {errors.descriptionEn && (
            <p className="text-sm text-red-500">{errors.descriptionEn}</p>
          )}
          <p className="text-sm text-gray-500 ml-auto">
            {formData.descriptionEn.length}/150
          </p>
        </div>
      </div>

      {/* Brief Description (FR) */}
      <div className="space-y-2">
        <Label htmlFor="service-description-fr">
          {t("MODAL.STEP_1.DESCRIPTION_FR.LABEL")}
          <span className="text-black ml-1">
            {t("MODAL.STEP_1.NAME.REQUIRED")}
          </span>
        </Label>
        <Textarea
          id="service-description-fr"
          value={formData.descriptionFr}
          onChange={(e) => {
            const value = e.target.value;
            if (value.length <= 150) {
              onUpdateField("descriptionFr", value);
            }
          }}
          onFocus={() => onClearFieldError("descriptionFr")}
          onBlur={() => onValidateField("descriptionFr")}
          placeholder={t("MODAL.STEP_1.DESCRIPTION_FR.PLACEHOLDER")}
          rows={4}
          disabled={viewOnly}
          readOnly={viewOnly}
          maxLength={150}
          className={errors.descriptionFr ? "border-red-500" : ""}
        />
        <div className="flex justify-between items-center">
          {errors.descriptionFr && (
            <p className="text-sm text-red-500">{errors.descriptionFr}</p>
          )}
          <p className="text-sm text-gray-500 ml-auto">
            {formData.descriptionFr.length}/150
          </p>
        </div>
      </div>

      {/* URL */}
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
          onChange={(e) => onUpdateField("url", e.target.value)}
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

