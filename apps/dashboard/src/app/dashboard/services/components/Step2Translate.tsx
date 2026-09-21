"use client";

import React, { useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Copy, Check } from "lucide-react";
import { useTranslation } from "react-i18next";
import { ServiceFormData } from "../hooks/useServiceForm";

interface Step2TranslateProps {
  formData: ServiceFormData;
  defaultLanguage: string;
  secondaryLanguages: string[];
  onUpdateTranslation: (lang: string, field: "name" | "description", value: string) => void;
  viewOnly?: boolean;
}

const DESCRIPTION_LIMIT = 500;

export function Step2Translate({
  formData,
  defaultLanguage,
  secondaryLanguages,
  onUpdateTranslation,
  viewOnly = false,
}: Step2TranslateProps) {
  const { t } = useTranslation("SERVICES");
  const { t: tName } = useTranslation("LANGUAJES");

  const langName = (code: string) => tName(code.toUpperCase());
  const source = formData.translations[defaultLanguage] ?? { name: "", description: "" };

  const [copied, setCopied] = useState<"name" | "description" | null>(null);

  const copy = (key: "name" | "description", value: string) => {
    if (!value) return;
    navigator.clipboard?.writeText(value).catch(() => {});
    setCopied(key);
    setTimeout(() => setCopied((c) => (c === key ? null : c)), 2000);
  };

  const copyButton = (key: "name" | "description", value: string) => (
    <button
      type="button"
      onClick={() => copy(key, value)}
      aria-label={t("MODAL.STEP_2.COPY")}
      className="absolute right-3 top-2.5 flex items-center gap-1 text-xs text-gray-500 hover:text-gray-700"
    >
      {copied === key ? (
        <>
          <Check className="h-4 w-4 text-emerald-600" />
          <span className="text-emerald-600">{t("MODAL.STEP_2.COPIED")}</span>
        </>
      ) : (
        <Copy className="h-4 w-4" />
      )}
    </button>
  );

  const sectionHeader = (code: string, optional = false) => (
    <p className="border-b border-border pb-2 text-sm font-medium text-gray-500">
      {langName(code)}
      {optional ? ` ${t("MODAL.STEP_2.OPTIONAL")}` : ""}
    </p>
  );

  if (secondaryLanguages.length === 0) {
    return <p className="text-sm text-gray-500">{t("MODAL.STEP_2.NONE")}</p>;
  }

  return (
    <div className="space-y-6">
      {/* Source (default language): read-only, copy-only */}
      <div className="space-y-3">
        {sectionHeader(defaultLanguage)}
        <div className="relative">
          <div className="min-h-9 rounded-md border border-input bg-muted px-3 py-2 pr-20 text-sm text-muted-foreground">
            {source.name || t("MODAL.STEP_1.NAME_PLACEHOLDER")}
          </div>
          {copyButton("name", source.name)}
        </div>
        <div className="relative">
          <div className="min-h-[60px] whitespace-pre-wrap rounded-md border border-input bg-muted px-3 py-2 pr-20 text-sm text-muted-foreground">
            {source.description || t("MODAL.STEP_1.DESCRIPTION_PLACEHOLDER")}
          </div>
          {copyButton("description", source.description)}
        </div>
      </div>

      {/* Secondary languages: editable, no copy icon, with character counter */}
      {secondaryLanguages.map((code) => {
        const field = formData.translations[code] ?? { name: "", description: "" };
        const upper = code.toUpperCase();
        return (
          <div key={code} className="space-y-4">
            {sectionHeader(code, true)}

            <div className="space-y-2">
              <Label htmlFor={`name-${code}`}>
                {t("MODAL.STEP_1.NAME_LABEL")} ({upper})
              </Label>
              <Input
                id={`name-${code}`}
                value={field.name}
                onChange={(e) => onUpdateTranslation(code, "name", e.target.value)}
                placeholder={t("MODAL.STEP_1.NAME_PLACEHOLDER")}
                disabled={viewOnly}
                readOnly={viewOnly}
              />
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor={`description-${code}`}>
                  {t("MODAL.STEP_1.DESCRIPTION_LABEL")} ({upper})
                </Label>
                <span className="text-sm text-gray-500">
                  {field.description.length}/{DESCRIPTION_LIMIT}
                </span>
              </div>
              <Textarea
                id={`description-${code}`}
                value={field.description}
                onChange={(e) => {
                  if (e.target.value.length <= DESCRIPTION_LIMIT) {
                    onUpdateTranslation(code, "description", e.target.value);
                  }
                }}
                placeholder={t("MODAL.STEP_1.DESCRIPTION_PLACEHOLDER")}
                rows={4}
                maxLength={DESCRIPTION_LIMIT}
                disabled={viewOnly}
                readOnly={viewOnly}
                className="resize-none"
              />
            </div>
          </div>
        );
      })}
    </div>
  );
}
