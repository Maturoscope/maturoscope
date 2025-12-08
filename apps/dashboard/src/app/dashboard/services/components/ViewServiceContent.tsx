"use client";

import React, { useMemo } from "react";
import { useTranslation } from "react-i18next";
import { ServiceFormData } from "../hooks/useServiceForm";
import { useSatisfactionOptions } from "../hooks/useSatisfactionOptions";
import { ScaleType, GapCoverage } from "../types/service";
import { cn } from "@/lib/utils";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface ViewServiceContentProps {
  formData: ServiceFormData;
  onEdit?: () => void;
  onClose?: () => void;
}

const SCALE_RANGES = [
  { min: 1, max: 3, color: "#C50D30", borderColor: "#A00B30" },
  { min: 4, max: 6, color: "#FF9A46", borderColor: "#E68A3E" },
  { min: 7, max: 9, color: "#2DC071", borderColor: "#25A85D" },
];

function ScaleBadge({ type, levels }: { type: string; levels: number[] }) {
  const sortedLevels = useMemo(
    () => [...new Set(levels)].sort((a, b) => a - b),
    [levels],
  );

  const activeRanges = SCALE_RANGES.filter((range) =>
    sortedLevels.some((level) => level >= range.min && level <= range.max)
  ).map((range) => ({
    color: range.color,
    borderColor: range.borderColor,
  }));

  if (sortedLevels.length === 0 || activeRanges.length === 0) {
    return null;
  }

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <div className="inline-flex items-center gap-2 rounded-full border border-[#E5E5E5] bg-white px-3 py-1 text-xs font-medium text-[#0A0A0A] cursor-pointer">
          <div className="flex items-center">
            {activeRanges.map(({ color, borderColor }, index) => (
              <span
                key={`${type}-dot-${index}`}
                className={cn(
                  "h-3 w-3 rounded-full border-2",
                  index > 0 && "-ml-1.5"
                )}
                style={{
                  backgroundColor: color,
                  borderColor: borderColor,
                }}
              />
            ))}
          </div>
          <span>{type}</span>
        </div>
      </TooltipTrigger>
      <TooltipContent
        side="top"
        className="bg-[#0A0A0A] text-white border-none"
        sideOffset={8}
      >
        {sortedLevels.join(", ")}
      </TooltipContent>
    </Tooltip>
  );
}

export function ViewServiceContent({
  formData,
}: ViewServiceContentProps) {
  const { t, i18n } = useTranslation("SERVICES");
  const { getQuestionsByScale, getLevelsForQuestion, getQuestionText, loading } =
    useSatisfactionOptions();

  const currentLanguage = i18n.language?.toLowerCase().startsWith("fr") ? "fr" : "en";
  const currentLanguageCode = i18n.language?.toUpperCase().startsWith("FR") ? "FR" : "EN";

  // Get translated name and description
  const getTranslatedName = () => {
    if (currentLanguageCode === "FR" && formData.nameFr) {
      return formData.nameFr;
    }
    return formData.nameEn || '';
  };

  const getTranslatedDescription = () => {
    if (currentLanguageCode === "FR" && formData.descriptionFr) {
      return formData.descriptionFr;
    }
    return formData.descriptionEn || '';
  };

  // Group gap coverages by scale type and question
  const groupedGaps = useMemo(() => {
    const groups: Record<
      ScaleType,
      Record<string, GapCoverage[]>
    > = {
      TRL: {},
      MkRL: {},
      MfRL: {},
    };

    formData.gapCoverages.forEach((coverage) => {
      if (!groups[coverage.scaleType][coverage.questionId]) {
        groups[coverage.scaleType][coverage.questionId] = [];
      }
      groups[coverage.scaleType][coverage.questionId].push(coverage);
    });

    return groups;
  }, [formData.gapCoverages]);

  // Get active scales (scales that have at least one gap coverage)
  const activeScales = useMemo(() => {
    const scales: ScaleType[] = [];
    if (Object.keys(groupedGaps.TRL).length > 0) scales.push("TRL");
    if (Object.keys(groupedGaps.MkRL).length > 0) scales.push("MkRL");
    if (Object.keys(groupedGaps.MfRL).length > 0) scales.push("MfRL");
    return scales;
  }, [groupedGaps]);

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
    <div className="space-y-8">
      {/* Service Information Section */}
      <div className="space-y-4">
        <div>
          <h3 className="text-sm text-gray-500 font-medium mb-1">
            {t("MODAL.STEPS.SERVICE_INFO")}
          </h3>
          <div className="border-b border-gray-200 mb-4" />
        </div>
        <div className="space-y-3">
          <h2 className="text-lg font-semibold text-[#0A0A0A]">
            {getTranslatedName() || "-"}
          </h2>
          <p className="text-sm text-[#0A0A0A] leading-relaxed">
            {getTranslatedDescription() || "-"}
          </p>
          {formData.url && (
            <a
              href={formData.url}
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm text-[#0A0A0A] underline hover:text-gray-700"
            >
              {formData.url}
            </a>
          )}
        </div>
      </div>

      {/* Category & Scale Section */}
      {activeScales.length > 0 && (
        <div className="space-y-6">
          <div>
            <h3 className="text-sm text-gray-500 font-medium mb-1">
              {t("MODAL.STEPS.CATEGORY_SCALE")}
            </h3>
            <div className="border-b border-gray-200 mb-4" />
          </div>

          <div className="space-y-6">
            {activeScales.map((scaleType) => {
              const questions = getQuestionsByScale(scaleType);
              const scaleGaps = groupedGaps[scaleType];
              
              // Get all questions with gaps for this scale
              const questionsWithGaps = questions.filter(
                (questionId) => scaleGaps[questionId]?.length > 0
              );

              // Get all levels from all questions in this scale for the badge
              const allScaleLevels: number[] = [];
              questionsWithGaps.forEach((questionId) => {
                const questionGaps = scaleGaps[questionId] || [];
                questionGaps.forEach((gap) => {
                  allScaleLevels.push(gap.level);
                });
              });
              const uniqueScaleLevels = [...new Set(allScaleLevels)].sort((a, b) => a - b);

              return (
                <div key={scaleType} className="space-y-4">
                  {/* Scale Badge - shown once per category */}
                  <div className="flex items-start gap-3">
                    <ScaleBadge type={scaleType} levels={uniqueScaleLevels} />
                  </div>

                  {/* All questions for this scale */}
                  <div className="space-y-6">
                    {questionsWithGaps.map((questionId) => {
                      const questionGaps = scaleGaps[questionId] || [];
                      const levels = getLevelsForQuestion(questionId);

                      return (
                        <div key={questionId} className="space-y-3">
                          <h4 className="text-base font-semibold text-[#0A0A0A]">
                            {getQuestionText(questionId, currentLanguage)}
                          </h4>

                          {/* Gap Descriptions */}
                          <div className="space-y-2">
                            {questionGaps
                              .sort((a, b) => a.level - b.level)
                              .map((gap) => {
                                const levelOption = levels.find(
                                  (l) => l.level === gap.level
                                );
                                if (!levelOption) return null;

                                return (
                                  <div
                                    key={`${gap.questionId}-${gap.level}`}
                                    className="bg-gray-50 border border-gray-200 rounded-lg p-4"
                                  >
                                    <p className="text-sm text-[#737373]">
                                      <span>
                                        {t("MODAL.STEP_2.GAP")} {gap.level}:
                                      </span>{" "}
                                      {levelOption.text[currentLanguage]}
                                    </p>
                                  </div>
                                );
                              })}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

