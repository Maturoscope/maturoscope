"use client"

import { useEffect, useState } from "react"
import { useRouter, useParams } from "next/navigation"
import { Locale } from "@/dictionaries/dictionaries"

const ResultsRedirectHandler = () => {
  const router = useRouter()
  const { lang } = useParams<{ lang: Locale }>()
  const [shouldRedirect, setShouldRedirect] = useState<string | null>(null)

  useEffect(() => {
    const savedForm = localStorage.getItem("form")
    const completedOn = localStorage.getItem("completedOn")

    // If user hasn't started the questionnaire, redirect to home
    if (!savedForm) {
      setShouldRedirect(`/${lang}`)
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
