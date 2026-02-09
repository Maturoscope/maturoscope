"use client"

import React, { useEffect, useState } from "react";
import { DynamicPageHeader } from "@/components/DynamicPageHeader"
import { useTranslation } from "react-i18next"
import { useUserContext } from "@/app/hooks/contexts/UserProvider"
import { Separator } from "@/components/ui/separator"
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { formatKPINumber, formatYAxisLabel, formatTooltipValue, getYTickValues } from "@/utils/numberFormat";
import { Info } from "lucide-react";
import { Tooltip as UITooltip, TooltipTrigger, TooltipContent } from "@/components/ui/tooltip";
import { WelcomeModal } from "@/components/WelcomeModal";

interface DashboardStatistics {
  analysisCompletionRate: number;
  contactRate: number;
  chartData: Array<{
    level: number;
    TRL: number;
    MkRL: number;
    MfRL: number;
  }>;
  rawStatistics: {
    startedAssessments: number;
    completedAssessments: number;
    contactedServices: number;
    usersByCategoryAndLevel: {
      TRL: Record<string, number>;
      MkRL: Record<string, number>;
      MfRL: Record<string, number>;
    };
  };
}


// Custom tooltip component
interface TooltipProps {
  active?: boolean;
  payload?: Array<{
    name: string;
    value: number;
    color: string;
  }>;
  label?: number | string;
  t?: (key: string) => string;
}

const CustomTooltip = ({ active, payload, label, t }: TooltipProps) => {
  if (active && payload && payload.length && t) {
    const usersText = t('CHART.USERS');
    return (
      <div className="bg-white border border-gray-200 rounded-lg shadow-lg p-3">
        <p className="font-semibold text-gray-900 mb-2">{`${t('CHART.TOOLTIP_LEVEL')} ${label}`}</p>
        {payload.map((entry, index: number) => (
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
  }
  return null;
};

export default function Page() {
  const { t } = useTranslation("DASHBOARD")
  const { user, loading: userLoading } = useUserContext()
  const [statistics, setStatistics] = useState<DashboardStatistics | null>(null);
  const [loading, setLoading] = useState(true);
  const [showWelcomeModal, setShowWelcomeModal] = useState(false);

  // Check if user needs to see welcome modal
  useEffect(() => {
    if (userLoading || !user) return;

    // Check if user has already dismissed the modal
    const dismissedKey = `welcome_modal_dismissed_${user.organization?.id}`;
    const dismissed = localStorage.getItem(dismissedKey);
    
    if (dismissed) return;

    // Check if user is missing avatar or signature
    const hasAvatar = user.organization?.avatar;
    const hasSignature = user.organization?.signature;
    
    if (!hasAvatar || !hasSignature) {
      setShowWelcomeModal(true);
    }
  }, [user, userLoading]);

  useEffect(() => {
    const fetchStatistics = async () => {
      try {
        setLoading(true);
        const response = await fetch('/api/statistics/dashboard');
        
        if (!response.ok) {
          // If 401 or 403, it's an auth error - show error
          if (response.status === 401 || response.status === 403) {
            const errorData = await response.json().catch(() => ({}));
            const errorMessage = errorData.message || errorData.error || `Failed to fetch dashboard statistics (${response.status})`;
            throw new Error(errorMessage);
          }
          // For other errors, use default empty statistics
          const defaultStats: DashboardStatistics = {
            analysisCompletionRate: 0,
            contactRate: 0,
            chartData: Array.from({ length: 10 }, (_, i) => ({
              level: i,
              TRL: 0,
              MkRL: 0,
              MfRL: 0,
            })),
            rawStatistics: {
              startedAssessments: 0,
              completedAssessments: 0,
              contactedServices: 0,
              usersByCategoryAndLevel: {
                TRL: {},
                MkRL: {},
                MfRL: {},
              },
            },
          };
          setStatistics(defaultStats);
          return;
        }
        
        const data = await response.json();
        setStatistics(data);
      } catch (err) {
        console.error('Error fetching dashboard statistics:', err);
        // On error, show default empty statistics instead of error message
        const defaultStats: DashboardStatistics = {
          analysisCompletionRate: 0,
          contactRate: 0,
          chartData: Array.from({ length: 9 }, (_, i) => ({
            level: i + 1,
            TRL: 0,
            MkRL: 0,
            MfRL: 0,
          })),
          rawStatistics: {
            startedAssessments: 0,
            completedAssessments: 0,
            contactedServices: 0,
            usersByCategoryAndLevel: {
              TRL: {},
              MkRL: {},
              MfRL: {},
            },
          },
        };
        setStatistics(defaultStats);
      } finally {
        setLoading(false);
      }
    };

    fetchStatistics();
  }, []);

  const generateBreadcrumbs = () => {
    const organizationName = user?.organization?.name || "Organization";
    return [
      { label: organizationName },
      { label: t('DASHBOARD') }
    ];
  };

  // Calculate max value for Y-axis
  const maxValue = statistics?.chartData.reduce((max, point) => {
    return Math.max(max, point.TRL, point.MkRL, point.MfRL);
  }, 0) || 0;

  const yTickValues = getYTickValues(maxValue);

  return (
    <>
      <DynamicPageHeader breadcrumbs={generateBreadcrumbs()} />
      <div className="flex flex-1 flex-col gap-6 p-6">
        <h1 className="text-2xl font-bold max-h-[100px]">
          {t('DASHBOARD')}
        </h1>

        <Separator />

        {loading && (
          <div className="flex items-center justify-center py-12">
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto mb-4" />
              <p className="text-sm text-gray-500">{t('LOADING')}</p>
            </div>
          </div>
        )}

        {!loading && statistics && (
          <>
            {/* KPIs */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-h-[150px]">
              <div className="bg-white rounded-lg border border-gray-200 p-6 max-h-[150px]">
                <div className="text-sm font-medium text-gray-600 mb-2">
                  {t('KPIS.TOTAL_ASSESSMENTS_STARTED')}
                </div>
                <div className="text-4xl font-bold text-gray-900">
                  {formatKPINumber(statistics.rawStatistics.startedAssessments)}
                </div>
              </div>
              <div className="bg-white rounded-lg border border-gray-200 p-6 max-h-[150px]">
                <div className="flex items-center gap-2 mb-2">
                  <div className="text-sm font-medium text-gray-600">
                    {t('KPIS.ANALYSIS_COMPLETION_RATE')}
                  </div>
                  <UITooltip>
                    <TooltipTrigger asChild>
                      <button type="button" className="flex items-center">
                        <Info className="h-4 w-4" style={{ color: '#0A0A0A' }} />
                      </button>
                    </TooltipTrigger>
                    <TooltipContent side="top" className="bg-black text-white whitespace-normal max-w-md text-center">
                      {t('KPIS.ANALYSIS_COMPLETION_RATE_TOOLTIP')}
                    </TooltipContent>
                  </UITooltip>
                </div>
                <div className="text-4xl font-bold text-gray-900">
                  {statistics.analysisCompletionRate}%
                </div>
              </div>
              <div className="bg-white rounded-lg border border-gray-200 p-6 max-h-[150px]">
                <div className="flex items-center gap-2 mb-2">
                  <div className="text-sm font-medium text-gray-600">
                    {t('KPIS.CONTACT_RATE')}
                  </div>
                  <UITooltip>
                    <TooltipTrigger asChild>
                      <button type="button" className="flex items-center">
                        <Info className="h-4 w-4" style={{ color: '#0A0A0A' }} />
                      </button>
                    </TooltipTrigger>
                    <TooltipContent side="top" className="bg-black text-white whitespace-normal max-w-md text-center">
                      {t('KPIS.CONTACT_RATE_TOOLTIP')}
                    </TooltipContent>
                  </UITooltip>
                </div>
                <div className="text-4xl font-bold text-gray-900">
                  {statistics.contactRate}%
                </div>
              </div>
            </div>

            {/* Chart */}
            <div className="bg-white rounded-lg border border-gray-200 p-6 ">
              <div className="mb-8">
                <h2 className="text-xl font-bold text-gray-900 mb-2">
                  {t('CHART.TITLE')}
                </h2>
                <p className="text-sm text-gray-600">
                  {t('CHART.DESCRIPTION')}
                </p>
              </div>
              <ResponsiveContainer width="100%" height={360}>
                <LineChart data={statistics.chartData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                  <CartesianGrid stroke="#eee" strokeDasharray="5 5" />
                  <XAxis 
                    dataKey="level" 
                    type="number"
                    domain={[0, 9]}
                    ticks={[0, 1, 2, 3, 4, 5, 6, 7, 8, 9]}
                    label={{ value: t('CHART.X_AXIS_LABEL'), position: 'insideBottom', offset: -5 }}
                  />
                  <YAxis 
                    type="number"
                    domain={[0, 'dataMax']}
                    ticks={yTickValues}
                    tickFormatter={formatYAxisLabel}
                    label={{ value: t('CHART.Y_AXIS_LABEL'), angle: -90, position: 'insideLeft' }}
                    width={80}
                    tick={{ fill: '#666', fontSize: 12 }}
                    allowDecimals={false}
                  />
                  <Tooltip content={<CustomTooltip t={t} />} />
                  <Legend wrapperStyle={{ bottom: -20, right: 0 }} />
                  <Line 
                    type="monotone" 
                    dataKey="TRL" 
                    stroke="#C2410C" 
                    strokeWidth={2}
                    dot={false}
                    name="TRL"
                  />
                  <Line 
                    type="monotone" 
                    dataKey="MkRL" 
                    stroke="#0D9488" 
                    strokeWidth={2}
                    dot={false}
                    name="MkRL"
                  />
                  <Line 
                    type="monotone" 
                    dataKey="MfRL" 
                    stroke="#2563EB" 
                    strokeWidth={2}
                    dot={false}
                    name="MfRL"
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </>
        )}
      </div>
      
      <WelcomeModal
        open={showWelcomeModal}
        onOpenChange={setShowWelcomeModal}
      />
    </>
  )
}
