"use client"

import { orgStorage } from "@/lib/orgStorage"
import { useEffect, useState } from "react"
import { useRouter, useParams } from "next/navigation"
import { Locale } from "@/dictionaries/dictionaries"
import { getOrgHomeUrl } from "@/lib/orgNavigation"

const ResultsRedirectHandler = () => {
  const router = useRouter()
  const { lang } = useParams<{ lang: Locale }>()
  const [shouldRedirect, setShouldRedirect] = useState<string | null>(null)

  useEffect(() => {
    const savedForm = orgStorage.getItem("form")
    const completedOn = orgStorage.getItem("completedOn")

    // If user hasn't started the questionnaire, redirect to the org home
    if (!savedForm) {
      setShouldRedirect(getOrgHomeUrl(lang))
      return
    }

    // If user has started but not completed, redirect to form page
    if (!completedOn) {
      setShouldRedirect(`/${lang}/form`)
      return
    }
  }, [lang])

  useEffect(() => {
    if (shouldRedirect) {
      window.location.href = shouldRedirect
    }
  }, [shouldRedirect])

  return null
}

export default ResultsRedirectHandler
