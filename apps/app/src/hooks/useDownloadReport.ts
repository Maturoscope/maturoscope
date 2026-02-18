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

const getLocalizedText = (value: LocalizedText | undefined, lang: Locale): string => {
  if (!value) return ""
  return (
    value[lang] ??
    value.en ??
    value.fr ??
    ""
  )
}

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
    gapDescription: getLocalizedText(gap.gapDescription as LocalizedText | undefined, lang),
    hasServices: gap.hasServices,
    recommendedServices: gap.recommendedServices.map((service) => ({
      name: getLocalizedText(service.name as LocalizedText | undefined, lang),
      description: getLocalizedText(service.description as LocalizedText | undefined, lang),
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

      // Get signature from localStorage, scoped to organization key, or fetch it
      const SIGNATURE_STORAGE_KEY = "organization-signature"

      const getCookie = (name: string): string | null => {
        const value = `; ${document.cookie}`
        const parts = value.split(`; ${name}=`)
        if (parts.length === 2) {
          return parts.pop()?.split(";").shift() || null
        }
        return null
      }

      const organizationKey = getCookie("organization-key")

      let signatureUrl: string | undefined

      if (organizationKey) {
        try {
          const stored = localStorage.getItem(SIGNATURE_STORAGE_KEY)
          if (stored) {
            const parsed = JSON.parse(stored) as {
              organizationKey: string
              url: string
            }

            if (parsed.organizationKey === organizationKey && parsed.url) {
              signatureUrl = parsed.url
            }
          }
        } catch (error) {
          console.error("Error reading organization signature from localStorage:", error)
        }
      }

      if (!signatureUrl) {
        const fetchedSignature = await getOrganizationSignature()
        if (fetchedSignature && organizationKey) {
          const payload = JSON.stringify({
            organizationKey,
            url: fetchedSignature,
          })
          localStorage.setItem(SIGNATURE_STORAGE_KEY, payload)
          signatureUrl = fetchedSignature
        }
      }

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

