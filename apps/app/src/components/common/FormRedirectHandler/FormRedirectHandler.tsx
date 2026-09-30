"use client"

import { orgStorage } from "@/lib/orgStorage"
import { useEffect } from "react"
import { useRouter, useParams } from "next/navigation"
import { Locale } from "@/dictionaries/dictionaries"

const FormRedirectHandler = () => {
  const router = useRouter()
  const { lang } = useParams<{ lang: Locale }>()

  useEffect(() => {
    const savedForm = orgStorage.getItem("form")
    if (savedForm) {
      router.push(`/${lang}/form`)
    }
  }, [router, lang])

  return null
}

export default FormRedirectHandler
