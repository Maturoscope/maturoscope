"use client"

import { PageHeader } from "@/components/Header"
import { useTranslation } from "react-i18next"

export default function ReportsPage() {
  const { t } = useTranslation("DASHBOARD")
  const breadcrumbs = [{ label: t('SUPER_ADMIN'), href: "/dashboard" }, { label: t('REPORTS') }]

  return (
    <>
      <PageHeader breadcrumbs={breadcrumbs} />
      <div className="flex flex-1 flex-col gap-4 p-6">
        <h1 className="text-3xl font-bold">{t('REPORTS')}</h1>
      </div>
    </>
  )
}