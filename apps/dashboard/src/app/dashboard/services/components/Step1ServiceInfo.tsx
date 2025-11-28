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
  viewOnly?: boolean;
}

export function Step1ServiceInfo({
  formData,
  errors,
  onUpdateField,
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
        </Label>
        <Textarea
          id="service-description"
          value={formData.description}
          onChange={(e) => onUpdateField("description", e.target.value)}
          placeholder={t("MODAL.STEP_1.DESCRIPTION.PLACEHOLDER")}
          rows={4}
          disabled={viewOnly}
          readOnly={viewOnly}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="service-url">
          {t("MODAL.STEP_1.URL.LABEL")}
        </Label>
        <Input
          id="service-url"
          type="url"
          value={formData.url}
          onChange={(e) => onUpdateField("url", e.target.value)}
          placeholder={t("MODAL.STEP_1.URL.PLACEHOLDER")}
          disabled={viewOnly}
          readOnly={viewOnly}
        />
      </div>
    </div>
  );
}

