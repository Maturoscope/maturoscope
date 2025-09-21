"use client"

import { useUserContext } from "@/app/hooks/contexts/UserProvider"
import { useTranslation } from "react-i18next"

interface Breadcrumb {
  label: string
  href?: string
}

interface BreadcrumbsResult {
  breadcrumbs: Breadcrumb[]
  isLoading: boolean
}

export const useBreadcrumbs = (currentPageLabel: string, activeSection?: string): BreadcrumbsResult => {
  const { user, loading } = useUserContext()
  const { t } = useTranslation("USER_SETTINGS")
  
  if (loading) {
    return {
      breadcrumbs: [
        { label: "", href: "/dashboard" },
        { label: activeSection ? getSectionLabel(activeSection, t) : currentPageLabel }
      ],
      isLoading: true
    }
  }
  
  const organizationName = user?.organization?.name || "Organization"
  
  const finalLabel = activeSection ? getSectionLabel(activeSection, t) : currentPageLabel
  
  return {
    breadcrumbs: [
      { label: organizationName, href: "/dashboard" },
      { label: finalLabel },
    ],
    isLoading: false
  }
}

function getSectionLabel(section: string, t: (key: string) => string): string {
  const sectionLabels: Record<string, string> = {
    'profile': t('PROFILE.TITLE'),
    'password': t('PASSWORD.TITLE'), 
    'customization': t('CUSTOMIZATION.TITLE')
  }
  
  return sectionLabels[section] || section
}
