"use client"

// Packages
import { useCallback, useState } from "react"
// Types
import { Locale } from "@/dictionaries/dictionaries"
import { StageId, QuestionData } from "@/components/custom/FormPage/Form/Form"
import { DevelopmentPhase, Gap, LocalizedText } from "@/actions/organization"
import { ReportPayload } from "@/actions/report"
// Actions
import { getQuestions, getRisks, RiskData } from "@/actions/questions"
import { generateReport } from "@/actions/report"
import { getOrganizationSignature } from "@/actions/organization"
// Utils
import { withServerActionRetry } from "@/utils/serverActionRetry"

// Storage types
export interface FormStorage {
  [stageId: string]: {
    scale: string
    questions: Record<string, string>
    comments: Record<string, string>
  }
}

export type LevelStorage = Partial<Record<StageId, number>>

export type PhasesStorage = Partial<Record<StageId, DevelopmentPhase>>

export type GapsStorage = Partial<Record<StageId, Gap[]>>

export type RisksStorage = Partial<Record<StageId, RiskData>>

// Payload types
interface AnswerPayload {
  question: string
  answer: string
  comment: string
}

interface RecommendedServicePayload {
  name: string
  description: string
}

interface GapPayload {
  gapDescription: string
  hasServices: boolean
  recommendedServices: RecommendedServicePayload[]
}

interface ScalePayload {
  level: number
  phase: number
  phaseName: string
  phaseGoal: string
  strategicFocus: string
  primaryRisk: string
  isLowest: boolean
  gaps: GapPayload[]
  answers: AnswerPayload[]
}

const buildScalePayload = (
  stageId: StageId,
  lang: Locale,
  questionsData: { id: StageId; name: string; questions: QuestionData[] }[],
  formData: FormStorage,
  levelData: LevelStorage,
  phasesData: PhasesStorage,
  gapsData: GapsStorage,
  risksData: RisksStorage | null
): ScalePayload => {
  const stageQuestions =
    questionsData.find((s) => s.id === stageId)?.questions || []
  const stageForm = formData[stageId]
  const level = levelData[stageId] ?? 0
  const phase = phasesData[stageId]
  const gaps = gapsData[stageId] ?? []
  const risk = risksData?.[stageId]

  const answers: AnswerPayload[] = stageQuestions.map((q) => {
    const answerId = stageForm?.questions?.[q.id] ?? ""
    const comment = stageForm?.comments?.[q.id] ?? ""
    const answerOption = q.options.find((opt) => opt.id === answerId)

    return {
      question: q.title,
      answer: answerOption?.title ?? "",
      comment,
    }
  })

  const gapsPayload: GapPayload[] = gaps.map((gap) => ({
    gapDescription: gap.gapDescription[lang],
    hasServices: gap.hasServices,
    recommendedServices: gap.recommendedServices.map((service) => ({
      name: service.name[lang],
      description: service.description[lang],
    })),
  }))

  return {
    level,
    phase: phase?.phase ?? 0,
    phaseName: phase?.phaseName?.[lang] ?? "",
    phaseGoal: phase?.focusGoal?.[lang] ?? "",
    strategicFocus: (risk?.strategicFocus as LocalizedText)?.[lang] ?? "",
    primaryRisk: (risk?.primaryRisk as LocalizedText)?.[lang] ?? "",
    isLowest: risk?.isLowest ?? false,
    gaps: gapsPayload,
    answers,
  }
}

export const useDownloadReport = (lang: Locale) => {
  const [isLoading, setIsLoading] = useState(false)

  const downloadReport = useCallback(async () => {
    setIsLoading(true)

    try {
      // Get questions data with translated text (with retry)
      const questionsData = await withServerActionRetry(
        () => getQuestions(lang),
        1, // 1 retry for questions
        200 // 200ms delay
      )

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

      // Fetch risks data using getRisks
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
        risksData = await withServerActionRetry(
          () => getRisks({
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
          }),
          1, // 1 retry for risks
          200 // 200ms delay
        )
      }

      // Get completion date from localStorage or use current date
      const storedCompletedOn = localStorage.getItem("completedOn")
      const completedOnDate =
        storedCompletedOn ? new Date(storedCompletedOn) : new Date()

      // Format date based on locale
      const completedOn = completedOnDate.toLocaleDateString(
        lang === "fr" ? "fr-FR" : "en-US",
        { year: "numeric", month: "long", day: "numeric" }
      )

      // Get projectName from localStorage
      const projectName = localStorage.getItem("projectName") || undefined

      // Get signature from localStorage or fetch it (with retry)
      let signature = localStorage.getItem("signature")
      if (!signature) {
        signature = await withServerActionRetry(
          () => getOrganizationSignature(),
          1, // 1 retry for signature
          200 // 200ms delay
        )
        if (signature) {
          localStorage.setItem("signature", signature)
        }
      }
      const signatureUrl = signature || undefined

      // Build the payload
      const payload: ReportPayload = {
        completedOn,
        projectName,
        signature: signatureUrl,
        trl: buildScalePayload(
          "trl",
          lang,
          questionsData,
          formData,
          levelData,
          phasesData,
          gapsData,
          risksData
        ),
        mkrl: buildScalePayload(
          "mkrl",
          lang,
          questionsData,
          formData,
          levelData,
          phasesData,
          gapsData,
          risksData
        ),
        mfrl: buildScalePayload(
          "mfrl",
          lang,
          questionsData,
          formData,
          levelData,
          phasesData,
          gapsData,
          risksData
        ),
      }

      // Generate the PDF using server action with retry wrapper
      const result = await withServerActionRetry(
        () => generateReport(lang, payload),
        2, // Max 2 retries
        500 // 500ms delay between retries
      )

      if (!result || !result.success || !result.data) {
        const errorMessage = result?.error || "Failed to generate PDF"
        
        // Check if it's a 403 error
        if (errorMessage.includes("403") || errorMessage.includes("Forbidden")) {
          console.error("403 Forbidden when generating PDF - reloading page")
          // Reload page to restore state
          if (typeof window !== 'undefined') {
            window.location.reload()
            return
          }
        }
        
        throw new Error(errorMessage)
      }

      // Convert base64 to blob and download
      const byteCharacters = atob(result.data)
      const byteNumbers = new Array(byteCharacters.length)
      for (let i = 0; i < byteCharacters.length; i++) {
        byteNumbers[i] = byteCharacters.charCodeAt(i)
      }
      const byteArray = new Uint8Array(byteNumbers)
      const blob = new Blob([byteArray], { type: "application/pdf" })

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
      
      // CRITICAL: If it's a Server Action error, reload immediately
      // This prevents the server from entering an inconsistent state
      if (
        error instanceof Error &&
        (error.message.includes("Failed to find Server Action") ||
          error.message.includes("Server Action returned undefined"))
      ) {
        console.error("CRITICAL: Server Action error in PDF download - reloading immediately")
        if (typeof window !== 'undefined') {
          sessionStorage.setItem('server-action-failed', 'true')
          window.location.reload()
          return
        }
      }
      
      // Check for 403 errors - also reload immediately
      if (
        error instanceof Error &&
        (error.message.includes("403") || error.message.includes("Forbidden"))
      ) {
        console.error("CRITICAL: 403 error in PDF download - reloading immediately")
        if (typeof window !== 'undefined') {
          sessionStorage.setItem('server-action-failed', 'true')
          window.location.reload()
          return
        }
      }
      
      throw error
    } finally {
      setIsLoading(false)
    }
  }, [lang])

  return {
    downloadReport,
    isLoading,
  }
}

