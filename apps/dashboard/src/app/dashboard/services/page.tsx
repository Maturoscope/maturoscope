"use client"

import React from "react";
import { DynamicPageHeader } from "@/components/DynamicPageHeader"
import { useTranslation } from "react-i18next"
import { useUserContext } from "@/app/hooks/contexts/UserProvider"

export default function ServicesPage() {
  const { t } = useTranslation("DASHBOARD")
  const { user } = useUserContext()

  const generateBreadcrumbs = () => {
    const organizationName = user?.organization?.name || "Organization";
    return [
      { label: organizationName },
      { label: t('SERVICES') }
    ];
  };

  return (
    <>
      <DynamicPageHeader breadcrumbs={generateBreadcrumbs()} />
      <div className="flex flex-1 flex-col gap-4 p-6">
        <h1 className="text-3xl font-bold">{t('SERVICES')}</h1>
      </div>
    </>
  )
}