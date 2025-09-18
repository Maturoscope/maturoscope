"use client"

import { DynamicPageHeader } from "@/components/DynamicPageHeader"
import { useTranslation } from "react-i18next"

export default function ServicesPage() {
  const { t } = useTranslation("DASHBOARD")

  return (
    <>
      <DynamicPageHeader currentPageLabel={t('SERVICES')} />
      <div className="flex flex-1 flex-col gap-4 p-6">
        <h1 className="text-3xl font-bold">{t('SERVICES')}</h1>
      </div>
    </>
  )
}