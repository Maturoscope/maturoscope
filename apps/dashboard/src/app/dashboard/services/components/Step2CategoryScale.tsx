"use client";

import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import { Checkbox } from "@/components/ui/checkbox";
import { ChevronDown, Minus, Plus } from "lucide-react";
import { ServiceFormData } from "../hooks/useServiceForm";
import { useSatisfactionOptions } from "../hooks/useSatisfactionOptions";
import { ScaleType, GapCoverage } from "../types/service";
import { cn } from "@/lib/utils";

interface Step2CategoryScaleProps {
  formData: ServiceFormData;
  errors: Record<string, string>;
  onUpdateField: (field: keyof ServiceFormData, value: Set<ScaleType> | GapCoverage[]) => void;
  viewOnly?: boolean;
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
  viewOnly = false,
}: Step2CategoryScaleProps) {
  const { t, i18n } = useTranslation("SERVICES");
  const { getQuestionsByScale, getLevelsForQuestion, getQuestionText, loading } =
    useSatisfactionOptions();

  const currentLanguage = i18n.language?.toLowerCase().startsWith("fr") ? "fr" : "en";
  const [expandedCategories, setExpandedCategories] = useState<Set<ScaleType>>(new Set());
  const [expandedQuestions, setExpandedQuestions] = useState<Set<string>>(new Set());

  const handleToggleExpand = (scaleType: ScaleType) => {
    setExpandedCategories((prev) => {
      const next = new Set(prev);
      if (next.has(scaleType)) {
        next.delete(scaleType);
      } else {
        next.add(scaleType);
      }
      return next;
    });
  };

  const handleToggleQuestion = (questionId: string) => {
    setExpandedQuestions((prev) => {
      const next = new Set(prev);
      if (next.has(questionId)) {
        next.delete(questionId);
      } else {
        next.add(questionId);
      }
      return next;
    });
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

    const newGapCoverages: GapCoverage[] =
      existingIndex !== -1
        ? formData.gapCoverages.filter((_, index) => index !== existingIndex)
        : [...formData.gapCoverages, { questionId, level, scaleType }];

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
          <p className="text-sm text-gray-500">{t("MODAL.STEP_2.LOADING")}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {errors.categories && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-md">
          <p className="text-sm text-red-600">{errors.categories}</p>
        </div>
      )}

      <div className="space-y-2">
        <h3 className="text-base font-semibold text-[#0A0A0A]">
          {t("MODAL.STEP_2.HEADING")}
        </h3>
        <p className="text-sm text-[#0A0A0A]">
          {t("MODAL.STEP_2.SUBTITLE")}
        </p>
      </div>

      <div className="space-y-4">
        {SCALES.map((scale) => {
          const isExpanded = expandedCategories.has(scale.type);
          const questions = getQuestionsByScale(scale.type);

          return (
            <div
              key={scale.type}
              className="rounded-lg border border-[#E5E5E5] bg-white"
            >
              <button
                type="button"
                onClick={() => handleToggleExpand(scale.type)}
                className="w-full flex items-center justify-between px-4 py-3 hover:bg-gray-50 transition-colors rounded-lg"
                disabled={viewOnly}
              >
                <div className="flex items-center gap-2">
                  <span className="text-base font-semibold text-[#0A0A0A]">
                    {scale.type}
                  </span>
                  <span className="text-sm font-normal text-[#8C8C8C]">
                    {t("MODAL.STEP_2.SELECT_ALL_THAT_APPLY")}
                  </span>
                </div>
                <ChevronDown
                  className={cn(
                    "h-4 w-4 text-[#0A0A0A] transition-transform duration-200",
                    isExpanded && "rotate-180"
                  )}
                />
              </button>

              {isExpanded && (
                <div className="px-4 pb-4 space-y-0 border-t border-[#E5E5E5] pt-4">
                  {questions.length === 0 ? (
                    <p className="text-sm text-gray-500">
                      {t("MODAL.STEP_2.NO_QUESTIONS")}
                    </p>
                  ) : (
                    questions.map((questionId, questionIndex) => {
                      const levels = getLevelsForQuestion(questionId);
                      const isQuestionExpanded = expandedQuestions.has(questionId);

                      return (
                        <div key={questionId}>
                          {questionIndex > 0 && (
                            <div className="border-t border-[#E5E5E5] my-4" />
                          )}
                          
                          <div className="space-y-3">
                            <button
                              type="button"
                              onClick={() => handleToggleQuestion(questionId)}
                              className="w-full flex items-center justify-between text-left"
                              disabled={viewOnly}
                            >
                              <h4 className="text-sm font-medium text-[#0A0A0A] flex-1 pr-2">
                                {getQuestionText(questionId, currentLanguage)}
                              </h4>
                              {isQuestionExpanded ? (
                                <Minus className="h-4 w-4 text-[#0A0A0A] shrink-0" />
                              ) : (
                                <Plus className="h-4 w-4 text-[#0A0A0A] shrink-0" />
                              )}
                            </button>

                            {isQuestionExpanded && (
                              <div className="space-y-2 pl-0">
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
                                        className={cn(
                                          "mt-0.5",
                                          !isChecked && "border-gray-300"
                                        )}
                                        disabled={viewOnly}
                                      />
                                      <label
                                        htmlFor={`${questionId}-${option.level}`}
                                        className="text-sm text-[#0A0A0A] cursor-pointer flex-1"
                                      >
                                        <span className="font-medium">
                                          {t("MODAL.STEP_2.GAP")} {option.level}:
                                        </span>{" "}
                                        {option.text[currentLanguage]}
                                      </label>
                                    </div>
                                  );
                                })}
                              </div>
                            )}
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

