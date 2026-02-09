"use server"

import { StageId, QuestionData } from "@/components/custom/FormPage/Form/Form"
import { Locale } from "@/dictionaries/dictionaries"
import { getOrganizationKeyFromCookies } from "./organization"

interface LocalizedText {
  en: string
  fr: string
}

interface QuestionLevel {
  [level: string]: LocalizedText
}

interface ApiQuestion {
  id: string
  levels: QuestionLevel
  question: LocalizedText
}

interface ApiScale {
  name: LocalizedText
  abbreviation: string
  questions: ApiQuestion[]
}

interface ApiQuestionsResponse {
  TRL: ApiScale
  MkRL: ApiScale
  MfRL: ApiScale
}

interface TransformedStage {
  id: StageId
  name: string
  questions: QuestionData[]
}

// Risk Analysis Types
type ScaleAbbreviation = "TRL" | "MkRL" | "MfRL"

interface ScaleInput {
  scale: ScaleAbbreviation
  readinessLevel: number
  phase: number
}

interface RiskAnalysisRequest {
  scales: ScaleInput[]
}

interface RiskItem {
  scale: ScaleAbbreviation
  readinessLevel: number
  phase: number
  isLowest: boolean
  strategicFocus?: LocalizedText
  primaryRisk?: LocalizedText
}

interface RiskAnalysisResponse {
  overallPhase: number
  phasesMatch: boolean
  risks: RiskItem[]
  recommendations: LocalizedText[]
}

export interface RiskData {
  readinessLevel: number
  phase: number
  isLowest: boolean
  strategicFocus?: LocalizedText
  primaryRisk?: LocalizedText
}

export type RisksRecord = Record<StageId, RiskData>

const transformQuestionsToStages = (
  questionsData: ApiQuestionsResponse,
  lang: Locale
): TransformedStage[] => {
  const stagesMap = new Map<StageId, TransformedStage>()

  const scaleMapping: Record<string, StageId> = {
    TRL: "trl",
    MkRL: "mkrl",
    MfRL: "mfrl",
  }

  Object.entries(questionsData).forEach(([scaleKey, scaleData]) => {
    const stageId = scaleMapping[scaleKey]
    if (!stageId) return

    const transformedQuestions = scaleData.questions.map((q: ApiQuestion) => ({
      id: q.id,
      title: q.question[lang],
      options: Object.entries(q.levels)
        .sort(([a], [b]) => parseInt(a) - parseInt(b))
        .map(([levelId, levelData]: [string, LocalizedText]) => ({
          id: levelId,
          title: levelData[lang],
        })),
    }))

    stagesMap.set(stageId, {
      id: stageId,
      name: scaleData.abbreviation,
      questions: transformedQuestions,
    })
  })

  // Return stages in the correct order: trl, mkrl, mfrl
  const stagesOrder: StageId[] = ["trl", "mkrl", "mfrl"]
  return stagesOrder
    .map((stageId) => stagesMap.get(stageId))
    .filter((stage): stage is TransformedStage => stage !== undefined)
}

export const getQuestions = async (lang: Locale) => {
  const organizationKey = await getOrganizationKeyFromCookies()
  const endpoint = `${process.env.NEXT_PUBLIC_API_URL}/readiness-assessment/questions${organizationKey ? `?organizationKey=${organizationKey}` : ""}`
  const response = await fetch(endpoint)

  if (!response.ok) {
    throw new Error(`Failed to fetch questions: ${response.statusText}`)
  }

  const questionsData: ApiQuestionsResponse = await response.json()
  return transformQuestionsToStages(questionsData, lang)
}

const SCALE_TO_STAGE_ID: Record<ScaleAbbreviation, StageId> = {
  TRL: "trl",
  MkRL: "mkrl",
  MfRL: "mfrl",
}

interface GetRisksParams {
  levels: Record<StageId, number>
  phases: Record<StageId, number>
}

export const getRisks = async ({
  levels,
  phases,
}: GetRisksParams): Promise<RisksRecord> => {
  const organizationKey = await getOrganizationKeyFromCookies()
  const endpoint = `${process.env.NEXT_PUBLIC_API_URL}/readiness-assessment/analyze-risk${organizationKey ? `?organizationKey=${organizationKey}` : ""}`

  const scales: ScaleInput[] = [
    { scale: "TRL", readinessLevel: levels.trl, phase: phases.trl },
    { scale: "MkRL", readinessLevel: levels.mkrl, phase: phases.mkrl },
    { scale: "MfRL", readinessLevel: levels.mfrl, phase: phases.mfrl },
  ]

  const body: RiskAnalysisRequest = { scales }

  const response = await fetch(endpoint, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  })

  if (!response.ok) {
    throw new Error(`Failed to fetch risks: ${response.statusText}`)
  }

  const data: RiskAnalysisResponse = await response.json()

  const risksRecord: RisksRecord = {} as RisksRecord

  data.risks.forEach((risk) => {
    const stageId = SCALE_TO_STAGE_ID[risk.scale]

    risksRecord[stageId] = {
      readinessLevel: risk.readinessLevel,
      phase: risk.phase,
      isLowest: risk.isLowest,
      strategicFocus: risk.strategicFocus,
      primaryRisk: risk.primaryRisk,
    }
  })

  return risksRecord
}
