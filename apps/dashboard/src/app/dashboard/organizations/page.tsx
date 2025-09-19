"use client"

import React from "react";
import { PageHeader } from "@/components/Header"
import { useTranslation } from "react-i18next"

export default function OrganizationsPage() {
  const { t } = useTranslation("DASHBOARD")
  const breadcrumbs = [{ label: t('SUPER_ADMIN'), href: "/dashboard" }, { label: t('ORGANIZATIONS') }]

  return (
    <>
      <PageHeader breadcrumbs={breadcrumbs} />
      <div className="flex flex-1 flex-col gap-4 p-6">
        <h1 className="text-3xl font-bold">{t('ORGANIZATIONS')}</h1>
      </div>
    </>
  )
}
