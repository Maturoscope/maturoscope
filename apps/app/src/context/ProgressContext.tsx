"use client"

// Packages
import { createContext, useContext, useState, useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
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
import { getSelectedScales } from "@/lib/selectedScales"
import { generateOrGetCachedPdf } from "@/hooks/useDownloadReport"
// Actions
import {
  submitAssessment,
  ScaleType,
  AssessmentResponse,
  Gap,
  DevelopmentPhase,
} from "@/actions/organization"
import { trackCompletedCategory } from "@/actions/tracking"
import { getRisks } from "@/actions/questions"

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
  notScored: "notScored",
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

interface NotScoredStorage {
  trl?: boolean
  mkrl?: boolean
  mfrl?: boolean
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

  // Save phases (null when the scale was not scored — omit it so risk analysis
  // skips this scale).
  const existingPhases: PhasesStorage = JSON.parse(
    localStorage.getItem(STORAGE_KEYS.phases) || "{}"
  )
  if (data.developmentPhase) {
    existingPhases[scaleKey] = data.developmentPhase
  } else {
    delete existingPhases[scaleKey]
  }
  localStorage.setItem(STORAGE_KEYS.phases, JSON.stringify(existingPhases))

  // Save "not scored" flag (all questions marked Not Applicable)
  const existingNotScored: NotScoredStorage = JSON.parse(
    localStorage.getItem(STORAGE_KEYS.notScored) || "{}"
  )
  existingNotScored[scaleKey] = data.notScored
  localStorage.setItem(
    STORAGE_KEYS.notScored,
    JSON.stringify(existingNotScored)
  )
}

const ProgressContext = createContext<ProgressContextType | null>(null)

export const ProgressProvider = ({
  lang,
  stages: allStages,
  children,
}: ProgressProviderProps) => {
  const [isCheckpoint, setIsCheckpoint] = useState(false)
  const [isFormCompleted, setIsFormCompleted] = useState(false)
  const [isNextButtonEnabled, setIsNextButtonEnabled] = useState(false)
  // The stages the user chose to assess. Defaults to all three (server render
  // and first client paint) and is narrowed to the selection on mount.
  const [stages, setStages] = useState<StageType[]>(allStages)
  const [currStageId, setCurrStageId] = useState<StageId>(allStages[0].id)
  const [currQuestionId, setCurrQuestionId] = useState(
    allStages[0].questions[0].id
  )
  const [isInitialized, setIsInitialized] = useState(false)
  const { getValues } = useFormContext()
  const router = useRouter()
  const searchParams = useSearchParams()

  const currStageIndex = stages.findIndex((stage) => stage.id === currStageId)
  const currStage = stages[currStageIndex]
  const currQuestionData = currStage.questions.find(
    (question) => question.id === currQuestionId
  ) as QuestionData
  const currQuestionIndex = currStage.questions.findIndex(
    (question) => question.id === currQuestionId
  )
  // Step number is the position within the selected stages (1-based), so it
  // stays correct when the user assesses a subset (e.g. only MfRL => step 1).
  const stageStepNumber = currStageIndex + 1
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

      // Pre-fetch risks and save to localStorage so buildReportPayload
      // can read them without making any network calls during PDF generation.
      const levelData = JSON.parse(localStorage.getItem("level") || "{}")
      const phasesData = JSON.parse(localStorage.getItem("phases") || "{}")
      try {
        const risksData = await getRisks({
          levels: {
            trl: levelData.trl,
            mkrl: levelData.mkrl,
            mfrl: levelData.mfrl,
          },
          phases: {
            trl: phasesData.trl?.phase,
            mkrl: phasesData.mkrl?.phase,
            mfrl: phasesData.mfrl?.phase,
          },
        })
        localStorage.setItem("risks", JSON.stringify(risksData))
      } catch {
        // Risks are best-effort — PDF will still generate without them
      }

      // Kick off PDF generation in background so it's ready (or well underway)
      // by the time the user arrives at the results page and clicks Download.
      generateOrGetCachedPdf(lang).catch(() => {
        // Pre-generation is best-effort — errors are handled on actual download.
      })
      return router.push(`/${lang}/results`)
    }

    // Check if the first question of the next stage already has a value
    const firstQuestionId = nextStage.questions[0].id
    const firstQuestionHasValue = !!getValues(
      `${nextStage.id}.questions.${firstQuestionId}` as `${StageId}.questions.${string}`
    )

    setCurrStageId(nextStage.id)
    setCurrQuestionId(firstQuestionId)
    setIsCheckpoint(false)
    setIsNextButtonEnabled(firstQuestionHasValue)
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
    // Overridden by Form with the translated labels
    addNoteLabel: "",
    removeNoteLabel: "",
    notApplicableLabel: "",
  }

  // Initialize form position on mount (runs only once)
  useEffect(() => {
    // Skip if already initialized
    if (isInitialized) return

    // Narrow the flow to the scales the user chose to assess.
    const selectedScales = getSelectedScales()
    const selectedStages = allStages.filter((stage) =>
      selectedScales.includes(stage.id)
    )
    const activeStages = selectedStages.length > 0 ? selectedStages : allStages
    setStages(activeStages)

    // Check if form was already completed
    const completedOn = localStorage.getItem("completedOn")
    setIsFormCompleted(!!completedOn)

    const savedForm = JSON.parse(
      localStorage.getItem("form") || "{}"
    ) as DefaultValues

    // Check if coming from begin page (via query param)
    const fromParam = searchParams.get("from")
    if (fromParam === "begin") {
      // Remove the query param from URL so reload goes to checkpoint
      router.replace(`/${lang}/form`, { scroll: false })

      // Always show the first question of the first SELECTED stage
      const firstStage = activeStages[0]
      const firstQuestion = firstStage.questions[0]
      setCurrStageId(firstStage.id)
      setCurrQuestionId(firstQuestion.id)
      setIsCheckpoint(false)

      // Check if the first question has a value to enable the next button
      const questionHasValue = !!savedForm[firstStage.id]?.questions?.[
        firstQuestion.id
      ]
      setIsNextButtonEnabled(questionHasValue)
      setIsInitialized(true)
      return
    }

    // Use checkpoint logic (next question to answer) for all other cases,
    // restricted to the selected scales.
    const checkpoint = calcCheckpoint(savedForm, selectedScales)

    if (!checkpoint) {
      setIsInitialized(true)
      return
    }
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
    setIsInitialized(true)
  }, [isInitialized, searchParams, allStages])

  // Save last viewed question whenever position changes
  useEffect(() => {
    // Only save after initialization to avoid overwriting with default values
    if (!isInitialized) return

    const savedForm = localStorage.getItem("form")
    if (savedForm) {
      saveLastViewedQuestion(currStageId, currQuestionId, isCheckpoint)
    }
  }, [currStageId, currQuestionId, isCheckpoint, isInitialized])

  // Hold rendering until we've read the selected scales and resolved the
  // starting position, so the user never sees a flash of an unselected stage.
  if (!isInitialized) return null

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
