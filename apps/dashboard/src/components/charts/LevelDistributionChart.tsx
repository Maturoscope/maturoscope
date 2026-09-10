"use client";

import React from "react";
import { useTranslation } from "react-i18next";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import {
  formatYAxisLabel,
  formatTooltipValue,
  getYTickValues,
} from "@/utils/numberFormat";
import {
  DashboardStatistics,
  ScaleKey,
  SCALE_COLORS,
} from "@/types/statistics";

// Legend rendered manually so the order stays TRL → MkRL → MfRL (recharts
// reverses it) and the markers are circles instead of squares.
const LEGEND_SCALES: ScaleKey[] = ["TRL", "MkRL", "MfRL"];

const ScaleLegend = () => (
  <ul className="flex items-center justify-center gap-6 list-none m-0 p-0">
    {LEGEND_SCALES.map((scale) => (
      <li key={scale} className="flex items-center gap-2">
        <span
          className="w-2.5 h-2.5 rounded-full"
          style={{ backgroundColor: SCALE_COLORS[scale] }}
        />
        <span className="text-sm text-gray-700">{scale}</span>
      </li>
    ))}
  </ul>
);

interface TooltipEntry {
  name: string;
  value: number;
  color: string;
}

interface LevelTooltipProps {
  active?: boolean;
  payload?: TooltipEntry[];
  label?: number | string;
}

/**
 * Users distribution across the 9 maturity levels for each scale, as a grouped
 * bar chart (replaces the previous line chart for clearer reading).
 */
const LevelDistributionChart = ({
  chartData,
}: {
  chartData: DashboardStatistics["chartData"];
}) => {
  const { t } = useTranslation("DASHBOARD");

  const CustomTooltip = ({ active, payload, label }: LevelTooltipProps) => {
    if (!active || !payload || !payload.length) return null;
    const usersText = t("CHART.USERS");
    return (
      <div className="bg-white border border-gray-200 rounded-lg shadow-lg p-3">
        <p className="font-semibold text-gray-900 mb-2">{`${t("CHART.TOOLTIP_LEVEL")} ${label}`}</p>
        {payload.map((entry, index) => (
          <div key={index} className="flex items-center gap-2 mb-1">
            <div
              className="w-3 h-3 rounded-sm"
              style={{ backgroundColor: entry.color }}
            />
            <span className="text-sm text-gray-600">{entry.name}:</span>
            <span className="text-sm font-semibold text-gray-900">
              {formatTooltipValue(entry.value, usersText)}
            </span>
          </div>
        ))}
      </div>
    );
  };

  const maxValue = chartData.reduce(
    (max, point) => Math.max(max, point.TRL, point.MkRL, point.MfRL),
    0,
  );
  const yTickValues = getYTickValues(maxValue);

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6">
      <div className="mb-8">
        <h2 className="text-xl font-bold text-gray-900 mb-2">
          {t("CHART.TITLE")}
        </h2>
        <p className="text-sm text-gray-600">{t("CHART.DESCRIPTION")}</p>
      </div>
      <ResponsiveContainer width="100%" height={360}>
        <BarChart
          data={chartData}
          margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
        >
          <CartesianGrid stroke="#eee" strokeDasharray="5 5" />
          <XAxis
            dataKey="level"
            label={{
              value: t("CHART.X_AXIS_LABEL"),
              position: "insideBottom",
              offset: -5,
            }}
          />
          <YAxis
            type="number"
            domain={[0, "dataMax"]}
            ticks={yTickValues}
            tickFormatter={formatYAxisLabel}
            label={{
              value: t("CHART.Y_AXIS_LABEL"),
              angle: -90,
              position: "insideLeft",
            }}
            width={80}
            tick={{ fill: "#666", fontSize: 12 }}
            allowDecimals={false}
          />
          <Tooltip
            content={<CustomTooltip />}
            cursor={{ fill: "rgba(0,0,0,0.04)" }}
          />
          <Legend
            wrapperStyle={{ bottom: -20, right: 0 }}
            content={<ScaleLegend />}
          />
          <Bar dataKey="TRL" fill={SCALE_COLORS.TRL} name="TRL" radius={[4, 4, 0, 0]} />
          <Bar dataKey="MkRL" fill={SCALE_COLORS.MkRL} name="MkRL" radius={[4, 4, 0, 0]} />
          <Bar dataKey="MfRL" fill={SCALE_COLORS.MfRL} name="MfRL" radius={[4, 4, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

export default LevelDistributionChart;
