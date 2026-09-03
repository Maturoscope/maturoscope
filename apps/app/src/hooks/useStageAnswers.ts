"use client"

// Packages
import { useState, useEffect } from "react"
// Types
import { StageId } from "@/components/custom/FormPage/Form/Form"
import { Locale } from "@/dictionaries/dictionaries"
import { DefaultValues } from "@/components/custom/FormPage/Form/default"
// Actions
import { getQuestions } from "@/actions/questions"
// Utils
import { isNotApplicable } from "@/lib/notApplicable"

export interface QuestionAnswer {
  questionId: string
  question: string
  answerId: string
  answer: string
}

const useStageAnswers = (
  stageName: StageId,
  lang: Locale,
  notApplicableLabel: string
) => {
  const [questionsAndAnswers, setQuestionsAndAnswers] = useState<
    QuestionAnswer[]
  >([])

  useEffect(() => {
    const fetchQuestionsAndAnswers = async () => {
      // Fetch questions for the stage
      const questionsStages = await getQuestions(lang)
      const stageQuestions = questionsStages.find(
        (stage) => stage.id === stageName
      )

      if (!stageQuestions) {
        console.error(`No questions found for stage: ${stageName}`)
        return
      }

      // Read answers from localStorage
      const savedForm = JSON.parse(
        localStorage.getItem("form") || "{}"
      ) as DefaultValues

      const stageAnswers = savedForm[stageName]?.questions || {}

      // Match questions with answers
      const matchedQuestionsAndAnswers: QuestionAnswer[] =
        stageQuestions.questions
          .map((question) => {
            const answerId = stageAnswers[question.id]
            if (!answerId) {
              return null
            }

            // "Not applicable" has no matching option — show the label instead.
            if (isNotApplicable(answerId)) {
              return {
                questionId: question.id,
                question: question.title,
                answerId,
                answer: notApplicableLabel,
              }
            }

            // Find the answer text from the question's options
            const selectedOption = question.options.find(
              (option) => option.id === answerId
            )

            if (!selectedOption) {
              return null
            }

            return {
              questionId: question.id,
              question: question.title,
              answerId: answerId,
              answer: selectedOption.title,
            }
          })
          .filter((item): item is QuestionAnswer => item !== null)

      setQuestionsAndAnswers(matchedQuestionsAndAnswers)
    }

    fetchQuestionsAndAnswers()
  }, [stageName, lang, notApplicableLabel])

  return questionsAndAnswers
}

export default useStageAnswers
