"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
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

type Language = "EN" | "FR";

export function Step1ServiceInfo({
  formData,
  errors,
  onUpdateField,
  onValidateField,
  onClearFieldError,
  viewOnly = false,
}: Step1ServiceInfoProps) {
  const { t } = useTranslation("SERVICES");
  const { t: tl } = useTranslation("LANGUAJES");
  const [selectedLanguage, setSelectedLanguage] = useState<Language>("EN");

  const getCurrentName = () => {
    return selectedLanguage === "EN" ? formData.nameEn : formData.nameFr;
  };

  const getCurrentDescription = () => {
    return selectedLanguage === "EN" ? formData.descriptionEn : formData.descriptionFr;
  };

  const updateCurrentName = (value: string) => {
    if (selectedLanguage === "EN") {
      onUpdateField("nameEn", value);
    } else {
      onUpdateField("nameFr", value);
    }
  };

  const updateCurrentDescription = (value: string) => {
    if (selectedLanguage === "EN") {
      onUpdateField("descriptionEn", value);
    } else {
      onUpdateField("descriptionFr", value);
    }
  };

  return (
    <div className="space-y-4">
      {/* Language Selector */}
      <div className="inline-flex h-9 items-center gap-2 rounded-[10px] bg-[#F5F5F5] px-1">
        <button
          type="button"
          onClick={() => setSelectedLanguage("EN")}
          disabled={viewOnly}
          className={cn(
            "relative h-7 shrink-0 rounded-[8px] px-4 text-sm font-medium transition-colors",
            selectedLanguage === "EN"
              ? "text-[#0A0A0A]"
              : "text-[#0A0A0A]/60",
            viewOnly && "cursor-not-allowed opacity-50"
          )}
        >
          {selectedLanguage === "EN" && (
            <motion.div
              layoutId="activeLanguageTab"
              className="absolute inset-0 rounded-[8px] bg-white shadow-sm"
              transition={{
                type: "spring",
                stiffness: 500,
                damping: 30,
              }}
            />
          )}
          <span className="relative z-10 whitespace-nowrap">{tl("EN")}</span>
        </button>
        <button
          type="button"
          onClick={() => setSelectedLanguage("FR")}
          disabled={viewOnly}
          className={cn(
            "relative h-7 shrink-0 rounded-[8px] px-4 text-sm font-medium transition-colors",
            selectedLanguage === "FR"
              ? "text-[#0A0A0A]"
              : "text-[#0A0A0A]/60",
            viewOnly && "cursor-not-allowed opacity-50"
          )}
        >
          {selectedLanguage === "FR" && (
            <motion.div
              layoutId="activeLanguageTab"
              className="absolute inset-0 rounded-[8px] bg-white shadow-sm"
              transition={{
                type: "spring",
                stiffness: 500,
                damping: 30,
              }}
            />
          )}
          <span className="relative z-10 whitespace-nowrap">{tl("FR")}</span>
        </button>
      </div>
      {/* Service Name Translation */}
      <div className="space-y-2">
        <Label htmlFor={`service-name-${selectedLanguage.toLowerCase()}`}>
          {t("MODAL.STEP_1.NAME.LABEL")}
          <span className="text-black ml-1">
            {t("MODAL.STEP_1.NAME.REQUIRED")}
          </span>
        </Label>
        <Input
          id={`service-name-${selectedLanguage.toLowerCase()}`}
          value={getCurrentName()}
          onChange={(e) => updateCurrentName(e.target.value)}
          onFocus={() => onClearFieldError(selectedLanguage === "EN" ? "nameEn" : "nameFr")}
          onBlur={() => onValidateField(selectedLanguage === "EN" ? "nameEn" : "nameFr")}
          placeholder={t("MODAL.STEP_1.NAME.PLACEHOLDER")}
          className={errors[selectedLanguage === "EN" ? "nameEn" : "nameFr"] ? "border-red-500" : ""}
          disabled={viewOnly}
          readOnly={viewOnly}
        />
        {errors[selectedLanguage === "EN" ? "nameEn" : "nameFr"] && (
          <p className="text-sm text-red-500">{errors[selectedLanguage === "EN" ? "nameEn" : "nameFr"]}</p>
        )}
      </div>

      {/* Brief Description Translation */}
      <div className="space-y-2">
        <Label htmlFor={`service-description-${selectedLanguage.toLowerCase()}`}>
          {t("MODAL.STEP_1.DESCRIPTION.LABEL")}
          <span className="text-black ml-1">
            {t("MODAL.STEP_1.NAME.REQUIRED")}
          </span>
        </Label>
        <Textarea
          id={`service-description-${selectedLanguage.toLowerCase()}`}
          value={getCurrentDescription()}
          onChange={(e) => {
            const value = e.target.value;
            if (value.length <= 150) {
              updateCurrentDescription(value);
            }
          }}
          onFocus={() => onClearFieldError(selectedLanguage === "EN" ? "descriptionEn" : "descriptionFr")}
          onBlur={() => onValidateField(selectedLanguage === "EN" ? "descriptionEn" : "descriptionFr")}
          placeholder={t("MODAL.STEP_1.DESCRIPTION.PLACEHOLDER")}
          rows={4}
          disabled={viewOnly}
          readOnly={viewOnly}
          maxLength={150}
          className={errors[selectedLanguage === "EN" ? "descriptionEn" : "descriptionFr"] ? "border-red-500" : ""}
        />
        <div className="flex justify-between items-center">
          {errors[selectedLanguage === "EN" ? "descriptionEn" : "descriptionFr"] && (
            <p className="text-sm text-red-500">{errors[selectedLanguage === "EN" ? "descriptionEn" : "descriptionFr"]}</p>
          )}
          <p className="text-sm text-gray-500 ml-auto">
            {getCurrentDescription().length}/150
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

