"use client"

import React from "react";
import { PageHeader } from "@/components/Header"
import { useBreadcrumbs } from "@/app/hooks/useBreadcrumbs"
import { Separator } from "@/components/ui/separator"
import { SidebarTrigger } from "@/components/ui/sidebar"
import { UserDropdown } from "./DropdownMenu"

interface DynamicPageHeaderProps {
  currentPageLabel: string
  activeSection?: string
}

function BreadcrumbSkeleton({ currentPageLabel }: { currentPageLabel: string }) {
  return (
    <div className="flex items-center space-x-2">
      <div className="h-4 bg-gray-200 rounded animate-pulse w-20"></div>
      <span className="text-muted-foreground text-xs">{'>'}</span>
      <span className="text-muted-foreground">{currentPageLabel}</span>
    </div>
  )
}

export function DynamicPageHeader({ currentPageLabel, activeSection }: DynamicPageHeaderProps) {
  const { breadcrumbs, isLoading } = useBreadcrumbs(currentPageLabel, activeSection)
  
  if (isLoading) {
    return (
      <header className="bg-background sticky top-0 flex h-16 shrink-0 items-center justify-between border-b px-4">
        <div className="flex items-center gap-2">
          <SidebarTrigger className="-ml-1" />
          <Separator
            orientation="vertical"
            className="mr-2 z-10 data-[orientation=vertical]:h-4 data-[orientation=vertical]:w-[1px]"
          />
          <BreadcrumbSkeleton currentPageLabel={currentPageLabel} />
        </div>
        <UserDropdown />
      </header>
    )
  }
  
  return <PageHeader breadcrumbs={breadcrumbs} />
}
