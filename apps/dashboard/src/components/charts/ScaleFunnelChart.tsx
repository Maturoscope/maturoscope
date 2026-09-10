"use client";

import React from "react";
import { useTranslation } from "react-i18next";
import { formatKPINumber } from "@/utils/numberFormat";
import {
  DashboardStatistics,
  ScaleKey,
  SCALE_COLORS,
} from "@/types/statistics";

const SCALES: ScaleKey[] = ["TRL", "MkRL", "MfRL"];

/**
 * Started / completed / abandoned assessments per scale, shown as one card per
 * scale with the raw numbers and a completion progress bar. Clearer than a
 * grouped bar chart and consistent with the KPI cards above.
 */
const ScaleFunnelChart = ({
  assessmentsByScale,
}: {
  assessmentsByScale: DashboardStatistics["assessmentsByScale"];
}) => {
  const { t } = useTranslation("DASHBOARD");

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6">
      <div className="mb-8">
        <h2 className="text-xl font-bold text-gray-900 mb-2">
          {t("SCALE_FUNNEL.TITLE")}
        </h2>
        <p className="text-sm text-gray-600">{t("SCALE_FUNNEL.DESCRIPTION")}</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {SCALES.map((scale) => {
          const { started = 0, completed = 0 } =
            assessmentsByScale?.[scale] ?? {};
          const abandoned = Math.max(0, started - completed);
          // Cap at 100%: completed can briefly exceed started (e.g. a failed
          // "started" POST, or resuming the flow without passing through begin).
          const completionRate =
            started > 0
              ? Math.min(100, Math.round((completed / started) * 100))
              : 0;
          const color = SCALE_COLORS[scale];

          return (
            <div
              key={scale}
              className="rounded-lg border border-gray-200 p-5 flex flex-col gap-4"
            >
              <div className="flex items-center gap-2">
                <span
                  className="w-2.5 h-2.5 rounded-sm"
                  style={{ backgroundColor: color }}
                />
                <span className="text-base font-bold text-gray-900">
                  {scale}
                </span>
              </div>

              <div className="flex flex-col gap-2">
                <Row
                  label={t("SCALE_FUNNEL.STARTED")}
                  value={formatKPINumber(started)}
                />
                <Row
                  label={t("SCALE_FUNNEL.COMPLETED")}
                  value={formatKPINumber(completed)}
                />
                <Row
                  label={t("SCALE_FUNNEL.ABANDONED")}
                  value={formatKPINumber(abandoned)}
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <div className="h-2 w-full rounded-full bg-gray-100 overflow-hidden">
                  <div
                    className="h-full rounded-full"
                    style={{
                      width: `${completionRate}%`,
                      backgroundColor: color,
                    }}
                  />
                </div>
                <span className="text-xs text-gray-500">
                  {completionRate}% {t("SCALE_FUNNEL.COMPLETION")}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

const Row = ({ label, value }: { label: string; value: string }) => (
  <div className="flex items-center justify-between">
    <span className="text-sm text-gray-600">{label}</span>
    <span className="text-sm font-semibold text-gray-900">{value}</span>
  </div>
);

export default ScaleFunnelChart;
