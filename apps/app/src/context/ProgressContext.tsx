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
import {
  submitAssessment,
  ScaleType,
  AssessmentResponse,
  Gap,
  DevelopmentPhase,
} from "@/actions/organization"
import { trackCompletedCategory } from "@/actions/tracking"

interface ProgressContextType {
  stages: StageType[]
  currStage: StageType
  currQuestionIndex: number
  currQuestion: QuestionProps
  isCheckpoint: boolean
  isFormCompleted: boolean
  stageStepNumber: number
  isNextButtonEnabled: boolean
  handlePrevButtonClick: () => void
  handleNextButtonClick: () => void
  handleReviewClick: () => void
  handleCheckpointButtonClick: () => void
  handleQuestionClick: () => void
  handleBackToLastQuestionClick: () => void
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

// localStorage keys for assessment results
const STORAGE_KEYS = {
  gaps: "gaps",
  level: "level",
  phases: "phases",
  lastViewedQuestion: "lastViewedQuestion",
} as const

// 24 hours in milliseconds
const LAST_VIEWED_EXPIRATION_MS = 24 * 60 * 60 * 1000

interface LastViewedQuestion {
  stageId: StageId
  questionId: string
  isCheckpoint: boolean
  timestamp: number
}

interface GapsStorage {
  trl?: Gap[]
  mkrl?: Gap[]
  mfrl?: Gap[]
}

interface LevelStorage {
  trl?: number
  mkrl?: number
  mfrl?: number
}

interface PhasesStorage {
  trl?: DevelopmentPhase
  mkrl?: DevelopmentPhase
  mfrl?: DevelopmentPhase
}

const saveAssessmentToLocalStorage = (
  stageId: StageId,
  data: AssessmentResponse
) => {
  const scaleKey = stageId.toLowerCase() as StageId

  // Save gaps
  const existingGaps: GapsStorage = JSON.parse(
    localStorage.getItem(STORAGE_KEYS.gaps) || "{}"
  )
  existingGaps[scaleKey] = data.gaps
  localStorage.setItem(STORAGE_KEYS.gaps, JSON.stringify(existingGaps))

  // Save level
  const existingLevel: LevelStorage = JSON.parse(
    localStorage.getItem(STORAGE_KEYS.level) || "{}"
  )
  existingLevel[scaleKey] = data.readinessLevel
  localStorage.setItem(STORAGE_KEYS.level, JSON.stringify(existingLevel))

  // Save phases
  const existingPhases: PhasesStorage = JSON.parse(
    localStorage.getItem(STORAGE_KEYS.phases) || "{}"
  )
  existingPhases[scaleKey] = data.developmentPhase
  localStorage.setItem(STORAGE_KEYS.phases, JSON.stringify(existingPhases))
}

const ProgressContext = createContext<ProgressContextType | null>(null)

export const ProgressProvider = ({
  lang,
  stages,
  children,
}: ProgressProviderProps) => {
  const [isCheckpoint, setIsCheckpoint] = useState(false)
  const [isFormCompleted, setIsFormCompleted] = useState(false)
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
  const isFirstStage = currStageIndex === 0
  const isFirstQuestionOfStage = currQuestionIndex === 0

  const saveProgress = () =>
    localStorage.setItem("form", JSON.stringify(getValues()))

  const saveLastViewedQuestion = (
    stageId: StageId,
    questionId: string,
    checkpoint: boolean
  ) => {
    const lastViewed: LastViewedQuestion = {
      stageId,
      questionId,
      isCheckpoint: checkpoint,
      timestamp: Date.now(),
    }
    localStorage.setItem(
      STORAGE_KEYS.lastViewedQuestion,
      JSON.stringify(lastViewed)
    )
  }

  const getLastViewedQuestion = (): LastViewedQuestion | null => {
    const stored = localStorage.getItem(STORAGE_KEYS.lastViewedQuestion)
    if (!stored) return null

    try {
      const lastViewed: LastViewedQuestion = JSON.parse(stored)
      const now = Date.now()
      const isExpired = now - lastViewed.timestamp > LAST_VIEWED_EXPIRATION_MS

      if (isExpired) {
        localStorage.removeItem(STORAGE_KEYS.lastViewedQuestion)
        return null
      }

      return lastViewed
    } catch {
      return null
    }
  }

  const handlePrevButtonClick = () => {
    const isFirstQuestionOfQuestionnaire =
      isFirstStage && isFirstQuestionOfStage

    if (isFirstQuestionOfQuestionnaire) {
      return router.push(`/${lang}/begin`)
    }

    setIsNextButtonEnabled(true)

    if (isFirstQuestionOfStage) {
      // Go to the last question of the previous stage
      const prevStage = stages[currStageIndex - 1]
      const lastQuestionOfPrevStage =
        prevStage.questions[prevStage.questions.length - 1]
      setCurrStageId(prevStage.id)
      setCurrQuestionId(lastQuestionOfPrevStage.id)
      setIsCheckpoint(true)
    } else {
      setCurrQuestionId(currStage.questions[currQuestionIndex - 1].id)
    }
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
    const result = await submitAssessment({
      scale,
      answers: stageData.questions,
    })

    if (result?.data) {
      saveAssessmentToLocalStorage(currStageId, result.data)

      // Track the completed category
      const category = scale // scale is already "TRL" | "MkRL" | "MfRL"
      const level = result.data.readinessLevel
      await trackCompletedCategory(category, level)
    }

    const nextStage = stages[currStageIndex + 1]
    const isLastCheckpoint = !nextStage?.id

    if (isLastCheckpoint) {
      localStorage.setItem("completedOn", new Date().toISOString())
      return router.push(`/${lang}/results`)
    }

    setCurrStageId(nextStage.id)
    setCurrQuestionId(nextStage.questions[0].id)
    setIsCheckpoint(false)
  }

  const handleQuestionClick = () => setIsNextButtonEnabled(true)

  const handleBackToLastQuestionClick = () => {
    setIsCheckpoint(false)
    setIsNextButtonEnabled(true)
  }

  const currQuestion: QuestionProps = {
    ...currQuestionData,
    name: currStage.id,
    onQuestionClick: handleQuestionClick,
    commentPlaceholder: "",
  }

  // Initialize form position on mount
  useEffect(() => {
    // Check if form was already completed
    const completedOn = localStorage.getItem("completedOn")
    setIsFormCompleted(!!completedOn)

    const savedForm = JSON.parse(
      localStorage.getItem("form") || "{}"
    ) as DefaultValues

    // First, check if we have a recent last viewed question (within 24 hours)
    const lastViewed = getLastViewedQuestion()
    if (lastViewed) {
      // Restore to the last viewed position
      setCurrStageId(lastViewed.stageId)
      setCurrQuestionId(lastViewed.questionId)
      setIsCheckpoint(lastViewed.isCheckpoint)

      // Check if the current question has a value to enable the next button
      const questionHasValue = !!savedForm[lastViewed.stageId]?.questions?.[
        lastViewed.questionId
      ]
      setIsNextButtonEnabled(questionHasValue)
      return
    }

    // Fallback to checkpoint logic (next question to answer)
    const checkpoint = calcCheckpoint(savedForm)

    if (!checkpoint) return
    const { lastSavedStage, lastSavedQuestion } = checkpoint

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

  // Save last viewed question whenever position changes
  useEffect(() => {
    // Only save after the initial mount has completed
    // We check if we have form data to avoid saving on fresh start
    const savedForm = localStorage.getItem("form")
    if (savedForm) {
      saveLastViewedQuestion(currStageId, currQuestionId, isCheckpoint)
    }
  }, [currStageId, currQuestionId, isCheckpoint])

  return (
    <ProgressContext.Provider
      value={{
        stages,
        currStage,
        currQuestionIndex,
        currQuestion,
        isCheckpoint,
        isFormCompleted,
        stageStepNumber,
        isNextButtonEnabled,
        handlePrevButtonClick,
        handleNextButtonClick,
        handleReviewClick,
        handleCheckpointButtonClick,
        handleQuestionClick,
        handleBackToLastQuestionClick,
      }}
    >
      {children}
    </ProgressContext.Provider>
  )
}

export const useProgressContext = () =>
  useContext(ProgressContext) as ProgressContextType
