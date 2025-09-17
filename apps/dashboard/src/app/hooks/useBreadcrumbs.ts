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
  
  // During loading, return loading state
  if (loading) {
    return {
      breadcrumbs: [
        { label: "", href: "/dashboard" }, // Empty label for skeleton
        { label: currentPageLabel }
      ],
      isLoading: true
    }
  }
  
  // Use dynamic organization name or fallback
  const organizationName = user?.organization?.name || "Organización"
  
  return {
    breadcrumbs: [
      { label: organizationName, href: "/dashboard" },
      { label: currentPageLabel },
    ],
    isLoading: false
  }
}
