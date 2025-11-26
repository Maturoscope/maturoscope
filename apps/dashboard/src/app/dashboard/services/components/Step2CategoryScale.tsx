"use client";

import React from "react";
import { useTranslation } from "react-i18next";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { ServiceFormData } from "../hooks/useServiceForm";
import { useSatisfactionOptions } from "../hooks/useSatisfactionOptions";
import { ScaleType, GapCoverage } from "../types/service";

interface Step2CategoryScaleProps {
  formData: ServiceFormData;
  errors: Record<string, string>;
  onUpdateField: (field: keyof ServiceFormData, value: Set<ScaleType> | GapCoverage[]) => void;
}

const SCALES: Array<{ type: ScaleType; label: string }> = [
  { type: "TRL", label: "MODAL.STEP_2.SCALE_LABELS.TRL" },
  { type: "MkRL", label: "MODAL.STEP_2.SCALE_LABELS.MkRL" },
  { type: "MfRL", label: "MODAL.STEP_2.SCALE_LABELS.MfRL" },
];

export function Step2CategoryScale({
  formData,
  errors,
  onUpdateField,
}: Step2CategoryScaleProps) {
  const { t, i18n } = useTranslation("SERVICES");
  const { getQuestionsByScale, getLevelsForQuestion, loading } =
    useSatisfactionOptions();

  const currentLanguage = i18n.language === "fr" ? "fr" : "en";

  const handleToggleScale = (scaleType: ScaleType) => {
    const newActiveCategories = new Set(formData.activeCategories);
    
    if (newActiveCategories.has(scaleType)) {
      // Remove scale and all its coverages
      newActiveCategories.delete(scaleType);
      const newGapCoverages = formData.gapCoverages.filter(
        (coverage) => coverage.scaleType !== scaleType
      );
      onUpdateField("gapCoverages", newGapCoverages);
    } else {
      // Add scale
      newActiveCategories.add(scaleType);
    }
    
    onUpdateField("activeCategories", newActiveCategories);
  };

  const handleToggleLevel = (
    questionId: string,
    level: number,
    scaleType: ScaleType
  ) => {
    const existingIndex = formData.gapCoverages.findIndex(
      (coverage) =>
        coverage.questionId === questionId &&
        coverage.level === level &&
        coverage.scaleType === scaleType
    );

    let newGapCoverages: GapCoverage[];

    if (existingIndex !== -1) {
      // Remove coverage
      newGapCoverages = formData.gapCoverages.filter(
        (_, index) => index !== existingIndex
      );
    } else {
      // Add coverage
      newGapCoverages = [
        ...formData.gapCoverages,
        { questionId, level, scaleType },
      ];
    }

    onUpdateField("gapCoverages", newGapCoverages);
  };

  const isLevelSelected = (
    questionId: string,
    level: number,
    scaleType: ScaleType
  ): boolean => {
    return formData.gapCoverages.some(
      (coverage) =>
        coverage.questionId === questionId &&
        coverage.level === level &&
        coverage.scaleType === scaleType
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto mb-4" />
          <p className="text-sm text-gray-500">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Title and Description */}
      <div>
        <h3 className="text-lg font-semibold text-gray-900">
          {t("MODAL.STEP_2.TITLE")}
        </h3>
        <p className="text-sm text-gray-500 mt-1">
          {t("MODAL.STEP_2.DESCRIPTION")}
        </p>
      </div>

      {/* Error message if no categories are active */}
      {errors.categories && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-md">
          <p className="text-sm text-red-600">{errors.categories}</p>
        </div>
      )}

      {/* Scale Switches */}
      <div className="space-y-4">
        {SCALES.map((scale) => {
          const isActive = formData.activeCategories.has(scale.type);
          const questions = getQuestionsByScale(scale.type);

          return (
            <div key={scale.type} className="space-y-4">
              {/* Scale Toggle */}
              <div className="flex items-center justify-between p-4 border rounded-lg bg-gray-50">
                <div>
                  <Label htmlFor={`scale-${scale.type}`} className="text-base font-medium">
                    {t(scale.label)}
                  </Label>
                  <p className="text-sm text-gray-500 mt-1">
                    {scale.type}
                  </p>
                </div>
                <Switch
                  id={`scale-${scale.type}`}
                  checked={isActive}
                  onCheckedChange={() => handleToggleScale(scale.type)}
                />
              </div>

              {/* Questions and Levels */}
              {isActive && (
                <div className="ml-4 space-y-6 border-l-2 border-gray-200 pl-4">
                  {questions.length === 0 ? (
                    <p className="text-sm text-gray-500">
                      No questions available for this category.
                    </p>
                  ) : (
                    questions.map((questionId) => {
                      const levels = getLevelsForQuestion(questionId);

                      return (
                        <div key={questionId} className="space-y-3">
                          {/* Question ID */}
                          <h4 className="text-sm font-medium text-gray-900">
                            {questionId}
                          </h4>

                          {/* Level Checkboxes */}
                          <div className="space-y-2">
                            {levels.map((option) => {
                              const isChecked = isLevelSelected(
                                questionId,
                                option.level,
                                scale.type
                              );

                              return (
                                <div
                                  key={`${questionId}-${option.level}`}
                                  className="flex items-start space-x-3"
                                >
                                  <Checkbox
                                    id={`${questionId}-${option.level}`}
                                    checked={isChecked}
                                    onCheckedChange={() =>
                                      handleToggleLevel(
                                        questionId,
                                        option.level,
                                        scale.type
                                      )
                                    }
                                  />
                                  <label
                                    htmlFor={`${questionId}-${option.level}`}
                                    className="text-sm text-gray-700 cursor-pointer flex-1"
                                  >
                                    <span className="font-medium">
                                      Level {option.level}:
                                    </span>{" "}
                                    {option.text[currentLanguage]}
                                  </label>
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

