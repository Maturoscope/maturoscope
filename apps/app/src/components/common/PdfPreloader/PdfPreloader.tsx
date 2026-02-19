"use client"

import { useEffect } from "react"
import { useParams } from "next/navigation"
import { Locale } from "@/dictionaries/dictionaries"
import { generateOrGetCachedPdf } from "@/hooks/useDownloadReport"

/**
 * Invisibly pre-generates the PDF in the background when the results page mounts.
 * By this point all assessment data is guaranteed to be in localStorage.
 * The generated PDF is stored in the client-side cache so downloads and
 * expert-contact emails reuse it without blocking the user.
 */
const PdfPreloader = () => {
  const params = useParams<{ lang?: string }>()
  const lang = (params.lang === "fr" ? "fr" : "en") as Locale

  useEffect(() => {
    generateOrGetCachedPdf(lang).catch(() => {
      // Pre-generation is best-effort; the user can still download on demand
    })
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []) // Run once on mount — lang won't change on the results page

  return null
}

export default PdfPreloader
