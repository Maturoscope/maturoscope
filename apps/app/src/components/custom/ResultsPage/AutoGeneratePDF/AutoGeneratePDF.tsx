"use client"

import { useEffect, useState } from "react"
import { useParams } from "next/navigation"
import { useCachedReport } from "@/hooks/useCachedReport"
import { getQuestions, getRisks } from "@/actions/questions"
import { getOrganizationSignature } from "@/actions/organization"
import type { Locale } from "@/dictionaries/dictionaries"
import type { StageId } from "@/components/custom/FormPage/Form/Form"
import type {
  FormStorage,
  LevelStorage,
  PhasesStorage,
  GapsStorage,
  RisksStorage,
  ReportPayload,
} from "@/hooks/useDownloadReport"
import { buildScalePayload } from "@/hooks/useDownloadReport"

/**
 * Component that automatically generates and caches a PDF report
 * when the results page loads
 */
export function AutoGeneratePDF() {
  const params = useParams<{ lang?: Locale }>()
  const lang = params.lang || "en"
  const { pdfId, generateAndCachePdf, isGenerating } = useCachedReport()
  const [hasAttempted, setHasAttempted] = useState(false)

  useEffect(() => {
    // Only generate if we don't already have a cached PDF and haven't attempted yet
    if (pdfId || isGenerating || hasAttempted) {
      return
    }
    
    setHasAttempted(true)

    const generatePDF = async () => {
      try {
        // Get questions data
        const questionsData = await getQuestions(lang)

        // Read data from localStorage
        const formData: FormStorage = JSON.parse(
          localStorage.getItem("form") || "{}"
        )
        const levelData: LevelStorage = JSON.parse(
          localStorage.getItem("level") || "{}"
        )
        const phasesData: PhasesStorage = JSON.parse(
          localStorage.getItem("phases") || "{}"
        )
        const gapsData: GapsStorage = JSON.parse(
          localStorage.getItem("gaps") || "{}"
        )

        // Fetch risks data
        let risksData: RisksStorage | null = null
        const hasAllLevels =
          levelData.trl !== undefined &&
          levelData.mkrl !== undefined &&
          levelData.mfrl !== undefined
        const hasAllPhases =
          phasesData.trl?.phase !== undefined &&
          phasesData.mkrl?.phase !== undefined &&
          phasesData.mfrl?.phase !== undefined

        if (hasAllLevels && hasAllPhases) {
          risksData = await getRisks({
            levels: {
              trl: levelData.trl as number,
              mkrl: levelData.mkrl as number,
              mfrl: levelData.mfrl as number,
            },
            phases: {
              trl: phasesData.trl!.phase,
              mkrl: phasesData.mkrl!.phase,
              mfrl: phasesData.mfrl!.phase,
            },
          })
        }

        // Get completion date
        const storedCompletedOn = localStorage.getItem("completedOn")
        const completedOnDate = storedCompletedOn
          ? new Date(storedCompletedOn)
          : new Date()

        const completedOn = completedOnDate.toLocaleDateString(
          lang === "fr" ? "fr-FR" : "en-US",
          { year: "numeric", month: "long", day: "numeric" }
        )

        // Get projectName
        const projectName = localStorage.getItem("projectName") || undefined

        // Get signature
        let signature = localStorage.getItem("signature")
        if (!signature) {
          signature = await getOrganizationSignature()
          if (signature) {
            localStorage.setItem("signature", signature)
          }
        }
        const signatureUrl = signature || undefined

        // Build the payload
        const trlPayload = buildScalePayload(
          "trl",
          lang,
          questionsData,
          formData,
          levelData,
          phasesData,
          gapsData,
          risksData
        )
        const mkrlPayload = buildScalePayload(
          "mkrl",
          lang,
          questionsData,
          formData,
          levelData,
          phasesData,
          gapsData,
          risksData
        )
        const mfrlPayload = buildScalePayload(
          "mfrl",
          lang,
          questionsData,
          formData,
          levelData,
          phasesData,
          gapsData,
          risksData
        )

        const payload: ReportPayload = {
          completedOn,
          projectName,
          signature: signatureUrl,
          trl: trlPayload,
          mkrl: mkrlPayload,
          mfrl: mfrlPayload,
        }

        // Generate and cache the PDF
        await generateAndCachePdf(payload, lang)
      } catch (error) {
        console.error("Error auto-generating PDF:", error)
      }
    }

    generatePDF()
  }, [pdfId, isGenerating, generateAndCachePdf, lang, hasAttempted])

  // This component doesn't render anything
  return null
}

