"use client"

// Packages
import { createContext, useContext, useState } from "react"
// Context
import { useFormContext } from "@/context/FormContext"
// Types
import { StageId, StageType } from "@/components/custom/FormPage/Form/Form"
import { QuestionProps } from "@/components/custom/FormPage/Question/Question"

interface ProgressContextType {
  currStageId: string
  nextStageId: string
  currStage: StageType
  nextStage: StageType
  currQuestionIndex: number
  currQuestion: QuestionProps
  setCurrStageId: (stage: StageId) => void
  setCurrQuestionId: (question: string) => void
  saveProgress: () => void
}

interface ProgressProviderProps {
  stages: StageType[]
  children: React.ReactNode
}

const DEFAULT_STAGE_ID: StageId = "trl"

const ProgressContext = createContext<ProgressContextType | null>(null)

export const ProgressProvider = ({
  stages,
  children,
}: ProgressProviderProps) => {
  const [currStageId, setCurrStageId] = useState<StageId>(DEFAULT_STAGE_ID)
  const [currQuestionId, setCurrQuestionId] = useState(
    stages[0].questions[0].id
  )
  const { getValues } = useFormContext()

  const currStageIndex = stages.findIndex((stage) => stage.id === currStageId)
  const currStage = stages[currStageIndex]
  const nextStage = stages[currStageIndex + 1]
  const nextStageId = nextStage?.id

  const currQuestion = currStage.questions.find(
    (question) => question.id === currQuestionId
  ) as QuestionProps
  const currQuestionIndex = currStage.questions.findIndex(
    (question) => question.id === currQuestionId
  )

  const saveProgress = () =>
    localStorage.setItem("form", JSON.stringify(getValues()))

  return (
    <ProgressContext.Provider
      value={{
        currStageId,
        nextStageId,
        currStage,
        nextStage,
        currQuestionIndex,
        currQuestion,
        setCurrStageId,
        setCurrQuestionId,
        saveProgress,
      }}
    >
      {children}
    </ProgressContext.Provider>
  )
}

export const useProgressContext = () =>
  useContext(ProgressContext) as ProgressContextType
