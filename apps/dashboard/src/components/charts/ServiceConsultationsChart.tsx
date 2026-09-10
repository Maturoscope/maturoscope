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
  LabelList,
  ResponsiveContainer,
} from "recharts";
import { DashboardStatistics } from "@/types/statistics";

// Single deep-teal tone for every bar (site aesthetic).
const BAR_COLOR = "#0E7490";

// Show the top services; more than this gets noisy in a single view.
const MAX_SERVICES = 10;

interface TooltipEntry {
  value: number;
  payload: { name: string; count: number };
}

interface ServiceTooltipProps {
  active?: boolean;
  payload?: TooltipEntry[];
}

/**
 * How many times each service has been consulted (contacted through the "talk
 * to an expert" flow), as a horizontal bar chart sorted by count. Each bar
 * carries its service name inside and its value to the right.
 */
const ServiceConsultationsChart = ({
  serviceConsultations,
}: {
  serviceConsultations: DashboardStatistics["serviceConsultations"];
}) => {
  const { t } = useTranslation("DASHBOARD");

  const data = [...serviceConsultations]
    .sort((a, b) => b.count - a.count)
    .slice(0, MAX_SERVICES);

  const maxValue = data.reduce((max, d) => Math.max(max, d.count), 0);

  // Height grows with the number of services so bars keep a comfortable size.
  const chartHeight = Math.max(200, data.length * 56 + 20);

  const CustomTooltip = ({ active, payload }: ServiceTooltipProps) => {
    if (!active || !payload || !payload.length) return null;
    const entry = payload[0];
    return (
      <div className="bg-white border border-gray-200 rounded-lg shadow-lg p-3">
        <p className="font-semibold text-gray-900 mb-1">{entry.payload.name}</p>
        <div className="flex items-center gap-2">
          <span
            className="w-3 h-3 rounded-full"
            style={{ backgroundColor: BAR_COLOR }}
          />
          <span className="text-sm text-gray-600">
            {t("SERVICE_CONSULTATIONS.CONSULTATIONS")}:
          </span>
          <span className="text-sm font-semibold text-gray-900">
            {entry.value}
          </span>
        </div>
      </div>
    );
  };

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6">
      <div className="mb-8">
        <h2 className="text-xl font-bold text-gray-900 mb-2">
          {t("SERVICE_CONSULTATIONS.TITLE")}
        </h2>
        <p className="text-sm text-gray-600">
          {t("SERVICE_CONSULTATIONS.DESCRIPTION")}
        </p>
      </div>

      {data.length === 0 ? (
        <div className="flex items-center justify-center py-12">
          <p className="text-sm text-gray-500">
            {t("SERVICE_CONSULTATIONS.NO_DATA")}
          </p>
        </div>
      ) : (
        <ResponsiveContainer width="100%" height={chartHeight}>
          <BarChart
            data={data}
            layout="vertical"
            margin={{ top: 5, right: 48, left: 8, bottom: 5 }}
            barCategoryGap="30%"
          >
            <CartesianGrid stroke="#eee" horizontal={false} />
            {/* Give the value labels room on the right so they don't clip. */}
            <XAxis type="number" domain={[0, maxValue * 1.12]} hide />
            <YAxis type="category" dataKey="name" hide />
            <Tooltip
              content={<CustomTooltip />}
              cursor={{ fill: "rgba(0,0,0,0.04)" }}
            />
            <Bar
              dataKey="count"
              fill={BAR_COLOR}
              name={t("SERVICE_CONSULTATIONS.CONSULTATIONS")}
              radius={8}
              barSize={38}
            >
              <LabelList
                dataKey="name"
                position="insideLeft"
                fill="#ffffff"
                fontSize={14}
                offset={14}
              />
              <LabelList
                dataKey="count"
                position="right"
                fill="#374151"
                fontSize={14}
                fontWeight={600}
                offset={12}
              />
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      )}
    </div>
  );
};

export default ServiceConsultationsChart;
