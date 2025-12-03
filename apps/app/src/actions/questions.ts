"use server"

import { StageId, QuestionData } from "@/components/custom/FormPage/Form/Form"
import { Locale } from "@/dictionaries/dictionaries"

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

/**
 * Transforms API question data structure to match the form stages format
 */
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

/**
 * Fetches questions from API and transforms them to the expected format
 */
export const getQuestions = async (lang: Locale) => {
  const endpoint = `${process.env.NEXT_PUBLIC_API_URL}/readiness-assessment/questions`
  const response = await fetch(endpoint)

  if (!response.ok) {
    throw new Error(`Failed to fetch questions: ${response.statusText}`)
  }

  const questionsData: ApiQuestionsResponse = await response.json()
  return transformQuestionsToStages(questionsData, lang)
}
