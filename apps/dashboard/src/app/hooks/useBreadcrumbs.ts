"use client"

import { useUserContext } from "@/app/hooks/contexts/UserProvider"

interface Breadcrumb {
  label: string
  href?: string
}

interface BreadcrumbsResult {
  breadcrumbs: Breadcrumb[]
  isLoading: boolean
}

export const useBreadcrumbs = (currentPageLabel: string): BreadcrumbsResult => {
  const { user, loading } = useUserContext()
  
  if (loading) {
    return {
      breadcrumbs: [
        { label: "", href: "/dashboard" },
        { label: currentPageLabel }
      ],
      isLoading: true
    }
  }
  
  const organizationName = user?.organization?.name || "Organization"
  
  return {
    breadcrumbs: [
      { label: organizationName, href: "/dashboard" },
      { label: currentPageLabel },
    ],
    isLoading: false
  }
}
