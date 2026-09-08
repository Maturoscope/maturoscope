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
  ResponsiveContainer,
} from "recharts";
import { formatYAxisLabel, getYTickValues } from "@/utils/numberFormat";
import { DashboardStatistics } from "@/types/statistics";

const BAR_COLOR = "#C2410C"; // accent orange

// Show the top services; more than this gets noisy in a single view.
const MAX_SERVICES = 10;

/**
 * How many times each service has been consulted (contacted through the "talk
 * to an expert" flow), as a horizontal bar chart sorted by count.
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
  const xTickValues = getYTickValues(maxValue);

  // Height grows with the number of services so labels don't overlap.
  const chartHeight = Math.max(200, data.length * 48 + 40);

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
            margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
          >
            <CartesianGrid stroke="#eee" strokeDasharray="5 5" horizontal={false} />
            <XAxis
              type="number"
              domain={[0, "dataMax"]}
              ticks={xTickValues}
              tickFormatter={formatYAxisLabel}
              tick={{ fill: "#666", fontSize: 12 }}
              allowDecimals={false}
            />
            <YAxis
              type="category"
              dataKey="name"
              width={180}
              tick={{ fill: "#666", fontSize: 12 }}
            />
            <Tooltip cursor={{ fill: "rgba(0,0,0,0.04)" }} />
            <Bar
              dataKey="count"
              fill={BAR_COLOR}
              name={t("SERVICE_CONSULTATIONS.CONSULTATIONS")}
              radius={[0, 4, 4, 0]}
            />
          </BarChart>
        </ResponsiveContainer>
      )}
    </div>
  );
};

export default ServiceConsultationsChart;
