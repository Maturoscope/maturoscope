"use client"

import { useCallback, useState } from "react"
import { Locale } from "@/dictionaries/dictionaries"
import { generateReport } from "@/actions/report"
import { getQuestions } from "@/actions/questions"
import { pdfCache } from "@/utils/pdfCache"
import { buildReportPayload } from "@/utils/reportPayload"

// Re-export storage types for backward compatibility
export type { FormStorage, LevelStorage, PhasesStorage, GapsStorage, RisksStorage } from "@/utils/reportPayload"

// Module-level singleton: ensures only one Puppeteer run at a time.
// Any concurrent caller (PdfPreloader + download button) shares the same Promise.
let pendingGeneration: { lang: Locale; promise: Promise<string> } | null = null

/**
 * Returns the cached PDF base64 string for the given language.
 * If already generating, waits for the in-progress generation instead of starting a new one.
 * If nothing is cached or in-progress, generates, caches, and returns the result.
 */
export const generateOrGetCachedPdf = async (lang: Locale): Promise<string> => {
  // 1. Return from cache if available
  const cached = pdfCache.get(lang)
  if (cached) return cached

  // 2. If already generating for the same lang, share that Promise
  if (pendingGeneration?.lang === lang) {
    return pendingGeneration.promise
  }

  // 3. Start a new generation
  const promise = (async () => {
    try {
      const questionsData = await getQuestions(lang)
      const payload = await buildReportPayload(lang, questionsData)
      const result = await generateReport(lang, payload)

      if (!result.success || !result.data) {
        throw new Error(result.error || "Failed to generate PDF")
      }

      pdfCache.set(result.data, lang)
      return result.data
    } finally {
      pendingGeneration = null
    }
  })()

  pendingGeneration = { lang, promise }
  return promise
}

const base64ToBlob = (base64: string): Blob => {
  const byteCharacters = atob(base64)
  const byteArray = new Uint8Array(byteCharacters.length)
  for (let i = 0; i < byteCharacters.length; i++) {
    byteArray[i] = byteCharacters.charCodeAt(i)
  }
  return new Blob([byteArray], { type: "application/pdf" })
}

export const useDownloadReport = (lang: Locale) => {
  const [isLoading, setIsLoading] = useState(false)

  const downloadReport = useCallback(async () => {
    setIsLoading(true)

    try {
      const base64 = await generateOrGetCachedPdf(lang)

      const blob = base64ToBlob(base64)
      const url = window.URL.createObjectURL(blob)
      const link = document.createElement("a")
      link.href = url
      link.download = "maturity-report.pdf"
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      window.URL.revokeObjectURL(url)
    } catch (error) {
      console.error("Error downloading PDF:", error)
      throw error
    } finally {
      setIsLoading(false)
    }
  }, [lang])

  return { downloadReport, isLoading }
}

