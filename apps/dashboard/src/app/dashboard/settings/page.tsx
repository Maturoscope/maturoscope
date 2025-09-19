"use client"

import React from "react";
import { DynamicPageHeader } from "@/components/DynamicPageHeader"
import { useTranslation } from "react-i18next"

export default function SettingsProfilePage() {
  const { t } = useTranslation("DASHBOARD")

  return (
    <>
      <DynamicPageHeader currentPageLabel={t('SETTINGS')} />
      <div className="flex flex-1 flex-col gap-4 p-6">
        <div className="space-y-6 max-w-2xl">
          <h2 className="text-xl font-semibold">Profile</h2>
        </div>
      </div>
    </>
  )
}
