"use client"

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { DynamicPageHeader } from "@/components/DynamicPageHeader"
import { useTranslation } from "react-i18next"
import { useUserContext } from "@/app/hooks/contexts/UserProvider"
import { Separator } from "@/components/ui/separator"
import { Select, SelectContent, SelectItem, SelectTrigger } from "@/components/ui/select"
import { Organization } from "../organizations/types/organization";
import { formatKPINumber } from "@/utils/numberFormat";
import { Info } from "lucide-react";
import { Tooltip as UITooltip, TooltipTrigger, TooltipContent } from "@/components/ui/tooltip";
import { DashboardStatistics, EMPTY_STATISTICS } from "@/types/statistics";
import LevelDistributionChart from "@/components/charts/LevelDistributionChart";
import ScaleFunnelChart from "@/components/charts/ScaleFunnelChart";
import ServiceConsultationsChart from "@/components/charts/ServiceConsultationsChart";

export default function ReportsPage() {
  const { t } = useTranslation("DASHBOARD")
  const { user, loading: userLoading } = useUserContext()
  const router = useRouter()
  const [statistics, setStatistics] = useState<DashboardStatistics | null>(null);
  const [loading, setLoading] = useState(true);
  const [organizations, setOrganizations] = useState<Organization[]>([]);
  const [selectedOrganizationId, setSelectedOrganizationId] = useState<string>("all");

  // Check if user is admin
  useEffect(() => {
    if (!userLoading && user) {
      const userRoles = user?.roles || [];
      const hasAdminAccess = userRoles.includes('admin');
      
      if (!hasAdminAccess) {
        router.push('/dashboard');
      }
    }
  }, [user, userLoading, router]);

  // Fetch organizations
  useEffect(() => {
    const fetchOrganizations = async () => {
      try {
        const response = await fetch('/api/organizations', {
          cache: "no-store",
        });

        if (!response.ok) {
          console.error('Failed to fetch organizations');
          return;
        }

        const data = await response.json();
        setOrganizations(data);
      } catch (err) {
        console.error('Error fetching organizations:', err);
      }
    };

    fetchOrganizations();
  }, []);

  // Fetch statistics
  useEffect(() => {
    const fetchStatistics = async () => {
      try {
        setLoading(true);
        const url = new URL('/api/statistics/reports', window.location.origin);
        if (selectedOrganizationId !== 'all') {
          url.searchParams.set('organizationId', selectedOrganizationId);
        }

        const response = await fetch(url.toString());
        
        if (!response.ok) {
          // If 401 or 403, it's an auth error - show error
          if (response.status === 401 || response.status === 403) {
            const errorData = await response.json().catch(() => ({}));
            const errorMessage = errorData.message || errorData.error || `Failed to fetch reports statistics (${response.status})`;
            throw new Error(errorMessage);
          }
          // For other errors, use default empty statistics
          setStatistics(EMPTY_STATISTICS);
          return;
        }

        const data = await response.json();
        setStatistics(data);
      } catch (err) {
        console.error('Error fetching reports statistics:', err);
        // On error, show default empty statistics instead of error message
        setStatistics(EMPTY_STATISTICS);
      } finally {
        setLoading(false);
      }
    };

    fetchStatistics();
  }, [selectedOrganizationId]);

  const generateBreadcrumbs = () => {
    return [
      { label: t('SUPER_ADMIN') },
      { label: t('REPORTS') }
    ];
  };

  return (
    <>
      <DynamicPageHeader breadcrumbs={generateBreadcrumbs()} />
      <div className="relative z-0 flex flex-1 flex-col gap-6 p-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold max-h-[100px]">
            {t('REPORTS')}
          </h1>
          
          {/* Organization Filter */}
          <div className="w-[250px]">
            <Select value={selectedOrganizationId} onValueChange={setSelectedOrganizationId}>
              <SelectTrigger>
                {selectedOrganizationId === 'all' 
                  ? t('REPORTS_FILTER.ALL_ORGANIZATIONS')
                  : organizations.find(org => org.id === selectedOrganizationId)?.name || t('REPORTS_FILTER.SELECT_ORGANIZATION')
                }
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{t('REPORTS_FILTER.ALL_ORGANIZATIONS')}</SelectItem>
                {organizations.map((org) => (
                  <SelectItem key={org.id} value={org.id}>
                    {org.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

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
    </>
  )
}
