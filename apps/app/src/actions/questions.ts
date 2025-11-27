"use server"

import { DUMMY_QUESTIONS } from "@/components/custom/FormPage/Form/dummyQuestions"
import { StageId, QuestionData } from "@/components/custom/FormPage/Form/Form"
import { Locale } from "@/dictionaries/dictionaries"

interface TransformedStage {
  id: StageId
  name: string
  questions: QuestionData[]
}

/**
 * Transforms API question data structure to match the form stages format
 */
const transformQuestionsToStages = (
  questionsData: typeof DUMMY_QUESTIONS,
  lang: Locale
): TransformedStage[] => {
  const stagesMap = new Map<StageId, TransformedStage>()

  const scaleMapping: Record<string, StageId> = {
    TRL: "trl",
    MkRL: "mkrl",
    MfRL: "mfrl",
  }

  Object.entries(questionsData.scales).forEach(([scaleKey, scaleData]) => {
    const stageId = scaleMapping[scaleKey]
    if (!stageId) return

    const transformedQuestions = scaleData.questions.map((q) => ({
      id: q.id,
      title: q.question[lang],
      options: Object.entries(q.levels)
        .sort(([a], [b]) => parseInt(a) - parseInt(b))
        .map(([levelId, levelData]) => ({
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
 * For now, returns dummyQuestions data
 */
export const getQuestions = async (lang: Locale) => {
  // TODO: Replace with actual API call
  // const endpoint = `${process.env.NEXT_PUBLIC_API_BASE_URL}/questions?lang=${lang}`
  // const response = await fetch(endpoint)
  // if (!response.ok) {
  //   // Fallback to dummy data on error
  //   return transformQuestionsToStages(DUMMY_QUESTIONS, lang)
  // }
  // const questionsData = await response.json()
  // return transformQuestionsToStages(questionsData, lang)

  // For now, use dummy data
  const questionsData = DUMMY_QUESTIONS

  return transformQuestionsToStages(questionsData, lang)
}

