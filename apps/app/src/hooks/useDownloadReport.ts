"use client"

// Packages
import { useCallback, useState } from "react"
// Types
import { Locale } from "@/dictionaries/dictionaries"
import { StageId, QuestionData } from "@/components/custom/FormPage/Form/Form"
import { DevelopmentPhase, Gap, LocalizedText } from "@/actions/organization"
// Actions
import { getQuestions, getRisks, RiskData } from "@/actions/questions"
import { generateReport, type ReportPayload } from "@/actions/report"
import { getOrganizationSignature } from "@/actions/organization"

// Export ReportPayload type for use in other files
export type { ReportPayload } from "@/actions/report"

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

export const buildScalePayload = (
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
    recommendedServices: gap.recommendedServices
      .filter((service) => service.name?.[lang] && service.description?.[lang]) // Filter out services with missing translations
      .map((service) => ({
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
      // Get questions data with translated text
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

      // Get signature from localStorage or fetch it
      let signature = localStorage.getItem("signature")
      if (!signature) {
        signature = await getOrganizationSignature()
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

      // Generate the PDF using server action
      const result = await generateReport(lang, payload)

      if (!result.success || !result.data) {
        throw new Error(result.error || "Failed to generate PDF")
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

