"use client"

// Packages
import { useState, useCallback } from "react"
// Components
import { Button } from "@/components/ui/button"
// Utils
import { cn } from "@/lib/utils"
// Types
import { Locale } from "@/dictionaries/dictionaries"
import { StageId, QuestionData } from "@/components/custom/FormPage/Form/Form"
import { DevelopmentPhase, Gap, LocalizedText } from "@/actions/organization"
// Actions
import { getQuestions, getRisks, RiskData } from "@/actions/questions"

export interface ResultsTopBarProps {
  title: string
  subtitle: string
  downloadButtonLabel: string
  talkButtonLabel: string
  lang: Locale
}

interface ExtraProps {
  className?: string
}

interface FormStorage {
  [stageId: string]: {
    scale: string
    questions: Record<string, string>
    comments: Record<string, string>
  }
}

type LevelStorage = Partial<Record<StageId, number>>

type PhasesStorage = Partial<Record<StageId, DevelopmentPhase>>

type GapsStorage = Partial<Record<StageId, Gap[]>>

type RisksStorage = Partial<Record<StageId, RiskData>>

interface AnswerPayload {
  question: string
  answer: string
  comment: string
}

interface GapPayload {
  gapDescription: string
  hasServices: boolean
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

interface ReportPayload {
  completedOn: string
  trl: ScalePayload
  mkrl: ScalePayload
  mfrl: ScalePayload
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

const ResultsTopBar = ({
  title,
  subtitle,
  downloadButtonLabel,
  talkButtonLabel,
  lang,
  className,
}: ResultsTopBarProps & ExtraProps) => {
  const [isLoading, setIsLoading] = useState(false)

  const handleDownloadClick = useCallback(async () => {
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

      // Build the payload
      const payload: ReportPayload = {
        completedOn,
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

      console.log("payload", payload)
      console.log("api", process.env.NEXT_PUBLIC_API_URL)

      // Make the POST request to the PDF endpoint
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/report/${lang}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(payload),
        }
      )

      if (!response.ok) {
        throw new Error(`Failed to generate PDF: ${response.statusText}`)
      }

      // Get the PDF blob and download it
      const blob = await response.blob()
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
    } finally {
      setIsLoading(false)
    }
  }, [lang])

  return (
    <div
      className={cn(
        "w-full flex items-center flex-wrap gap-y-4 justify-between p-4 lg:px-6 py-4 bg-white border-b border-border",
        className
      )}
    >
      <div className="flex flex-col items-start justify-start">
        <h1 className="text-2xl font-bold">{title}</h1>
        <p className="text-sm text-muted-foreground">{subtitle}</p>
      </div>
      <div className="flex gap-2">
        <Button
          variant="outline"
          onClick={handleDownloadClick}
          disabled={isLoading}
        >
          {isLoading ? "Loading..." : downloadButtonLabel}
        </Button>
        <Button variant="default" accent>
          {talkButtonLabel}
        </Button>
      </div>
    </div>
  )
}

export default ResultsTopBar
