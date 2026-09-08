"use client"

import React, { useEffect, useState } from "react";
import { DynamicPageHeader } from "@/components/DynamicPageHeader"
import { useTranslation } from "react-i18next"
import { useUserContext } from "@/app/hooks/contexts/UserProvider"
import { Separator } from "@/components/ui/separator"
import { formatKPINumber } from "@/utils/numberFormat";
import { Info } from "lucide-react";
import { Tooltip as UITooltip, TooltipTrigger, TooltipContent } from "@/components/ui/tooltip";
import { WelcomeModal } from "@/components/WelcomeModal";
import { DashboardStatistics, EMPTY_STATISTICS } from "@/types/statistics";
import LevelDistributionChart from "@/components/charts/LevelDistributionChart";
import ScaleFunnelChart from "@/components/charts/ScaleFunnelChart";
import ServiceConsultationsChart from "@/components/charts/ServiceConsultationsChart";

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
          setStatistics(EMPTY_STATISTICS);
          return;
        }

        const data = await response.json();
        setStatistics(data);
      } catch (err) {
        console.error('Error fetching dashboard statistics:', err);
        // On error, show default empty statistics instead of error message
        setStatistics(EMPTY_STATISTICS);
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

  return (
    <>
      <DynamicPageHeader breadcrumbs={generateBreadcrumbs()} />
      <div className="relative z-0 flex flex-1 flex-col gap-6 p-6">
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

            {/* Users by scale and level */}
            <LevelDistributionChart chartData={statistics.chartData} />

            {/* Started vs completed vs abandoned per scale */}
            <ScaleFunnelChart assessmentsByScale={statistics.assessmentsByScale} />

            {/* Most consulted services */}
            <ServiceConsultationsChart
              serviceConsultations={statistics.serviceConsultations}
            />
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
