"use client"

// Packages
import { createContext, useContext, useState, useEffect } from "react"
import { useRouter } from "next/navigation"
// Context
import { useFormContext } from "@/context/FormContext"
// Types
import {
  StageId,
  StageType,
  QuestionData,
} from "@/components/custom/FormPage/Form/Form"
import { QuestionProps } from "@/components/custom/FormPage/Question/Question"
import { DefaultValues } from "@/components/custom/FormPage/Form/default"
import { Locale } from "@/dictionaries/dictionaries"
// Utils
import { calcCheckpoint } from "@/lib/calcCheckpoint"
// Actions
import { submitAssessment, ScaleType } from "@/actions/organization"

interface ProgressContextType {
  stages: StageType[]
  currStage: StageType
  currQuestionIndex: number
  currQuestion: QuestionProps
  isCheckpoint: boolean
  stageStepNumber: number
  isPrevButtonEnabled: boolean
  isNextButtonEnabled: boolean
  handlePrevButtonClick: () => void
  handleNextButtonClick: () => void
  handleReviewClick: () => void
  handleCheckpointButtonClick: () => void
  handleQuestionClick: () => void
}

interface ProgressProviderProps {
  lang: Locale
  stages: StageType[]
  children: React.ReactNode
}

const DEFAULT_STAGE_ID: StageId = "trl"

const STAGES_STEP_NUMBER: Record<StageId, number> = {
  trl: 1,
  mkrl: 2,
  mfrl: 3,
}

const STAGE_TO_SCALE: Record<StageId, ScaleType> = {
  trl: "TRL",
  mkrl: "MkRL",
  mfrl: "MfRL",
}

const ProgressContext = createContext<ProgressContextType | null>(null)

export const ProgressProvider = ({
  lang,
  stages,
  children,
}: ProgressProviderProps) => {
  const [isCheckpoint, setIsCheckpoint] = useState(false)
  const [isNextButtonEnabled, setIsNextButtonEnabled] = useState(false)
  const [currStageId, setCurrStageId] = useState<StageId>(DEFAULT_STAGE_ID)
  const [currQuestionId, setCurrQuestionId] = useState(
    stages[0].questions[0].id
  )
  const { getValues } = useFormContext()
  const router = useRouter()

  const currStageIndex = stages.findIndex((stage) => stage.id === currStageId)
  const currStage = stages[currStageIndex]
  const currQuestionData = currStage.questions.find(
    (question) => question.id === currQuestionId
  ) as QuestionData
  const currQuestionIndex = currStage.questions.findIndex(
    (question) => question.id === currQuestionId
  )
  const stageStepNumber = STAGES_STEP_NUMBER[currStage.id]
  const isPrevButtonEnabled = currQuestionIndex !== 0

  const saveProgress = () =>
    localStorage.setItem("form", JSON.stringify(getValues()))

  const handlePrevButtonClick = () => {
    if (!isPrevButtonEnabled) return
    setIsNextButtonEnabled(true)
    setCurrQuestionId(currStage.questions[currQuestionIndex - 1].id)
  }

  const handleNextButtonClick = () => {
    saveProgress()

    const isLastQuestion = currQuestionIndex === currStage.questions.length - 1
    const nextQuestionIndex = currQuestionIndex + 1
    const nextQuestionId = currStage.questions[nextQuestionIndex]?.id
    const nextQuestionHasValue = !!getValues(
      `${currStage.id}.questions.${nextQuestionId}` as `${StageId}.questions.${string}`
    )

    if (isLastQuestion) setIsCheckpoint(true)
    else setCurrQuestionId(currStage.questions[currQuestionIndex + 1].id)
    setIsNextButtonEnabled(nextQuestionHasValue)
  }

  const handleReviewClick = () => {
    router.push(`/${lang}/review/${currStage.id}`)
  }

  const handleCheckpointButtonClick = async () => {
    // Submit current stage assessment to the backend
    const scale = STAGE_TO_SCALE[currStageId]
    const stageData = getValues()[currStageId]
    await submitAssessment({ scale, answers: stageData.questions })

    const nextStage = stages[currStageIndex + 1]
    const isLastCheckpoint = !nextStage?.id

    if (isLastCheckpoint) return router.push(`/${lang}/results`)

    setCurrStageId(nextStage.id)
    setCurrQuestionId(nextStage.questions[0].id)
    setIsCheckpoint(false)
  }

  const handleQuestionClick = () => setIsNextButtonEnabled(true)

  const currQuestion: QuestionProps = {
    ...currQuestionData,
    name: currStage.id,
    onQuestionClick: handleQuestionClick,
  }

  useEffect(() => {
    const savedForm = JSON.parse(
      localStorage.getItem("form") || "{}"
    ) as DefaultValues
    const checkpoint = calcCheckpoint(savedForm)

    if (!checkpoint) return
    const { lastSavedStage, lastSavedQuestion } = checkpoint

    const hasAnswerAllQuestions = Object.values(savedForm).every((stage) =>
      Object.values(stage.questions).every((question) => !!question)
    )

    if (hasAnswerAllQuestions) return router.push(`/${lang}/results`)

    const lastStageQuestionsId = Object.keys(
      savedForm[lastSavedStage].questions
    )
    const isLastQuestionOfStage =
      lastSavedQuestion ===
      lastStageQuestionsId[lastStageQuestionsId.length - 1]
    const isLastQuestionAnswered =
      !!savedForm[lastSavedStage].questions[lastSavedQuestion]

    if (isLastQuestionOfStage) setIsCheckpoint(isLastQuestionAnswered)

    setCurrStageId(lastSavedStage)
    setCurrQuestionId(lastSavedQuestion)
  }, [getValues, router, lang])

  return (
    <ProgressContext.Provider
      value={{
        stages,
        currStage,
        currQuestionIndex,
        currQuestion,
        isCheckpoint,
        stageStepNumber,
        isPrevButtonEnabled,
        isNextButtonEnabled,
        handlePrevButtonClick,
        handleNextButtonClick,
        handleReviewClick,
        handleCheckpointButtonClick,
        handleQuestionClick,
      }}
    >
      {children}
    </ProgressContext.Provider>
  )
}

export const useProgressContext = () =>
  useContext(ProgressContext) as ProgressContextType
