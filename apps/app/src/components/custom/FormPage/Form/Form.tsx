"use client"

// Packages
import Image from "next/image"
import { useState } from "react"
import { useRouter } from "next/navigation"
// Components
import CheckpointScreen from "@/components/custom/FormPage/CheckpointScreen/CheckpointScreen"
import Question from "@/components/custom/FormPage/Question/Question"
import ProgressBar from "@/components/custom/FormPage/ProgressBar/ProgressBar"
import { Button } from "@/components/ui/button"
// Context
import { useFormContext } from "@/context/FormContext"
import { useProgressContext } from "@/context/ProgressContext"
// Types
import { QuestionProps } from "@/components/custom/FormPage/Question/Question"

export type StageId = "trl" | "mkrl" | "mfrl"

export interface StageType {
  id: StageId
  icon: string
  name: string
  title: string
  description: string
  buttonLabel: string
  questions: QuestionProps[]
}

export interface StageProps {
  stage: StageType
  nextStage: StageType
  buttonNextLabel: string
  buttonPrevLabel: string
  setStage: (stage: StageId) => void
}

export interface FormProps {
  buttonNextLabel: string
  buttonPrevLabel: string
  stages: StageType[]
}

const STAGES_STEP_NUMBER: Record<StageId, number> = {
  trl: 1,
  mkrl: 2,
  mfrl: 3,
}

const Form = ({ buttonNextLabel, buttonPrevLabel }: FormProps) => {
  const [isCheckpoint, setIsCheckpoint] = useState(false)
  const [isNextButtonEnabled, setIsNextButtonEnabled] = useState(false)
  const router = useRouter()
  const { getValues } = useFormContext()
  const {
    currStage,
    nextStage,
    currQuestionIndex,
    currQuestion,
    setCurrQuestionId,
    setCurrStageId,
    saveProgress,
  } = useProgressContext()

  const stageStepNumber = STAGES_STEP_NUMBER[currStage.id]
  const isLastQuestion = currQuestionIndex === currStage.questions.length - 1
  const isPrevButtonEnabled = currQuestionIndex !== 0

  const handlePrevButtonClick = () => {
    if (!isPrevButtonEnabled) return
    setIsNextButtonEnabled(true)
    setCurrQuestionId(currStage.questions[currQuestionIndex - 1].id)
  }

  const handleNextButtonClick = () => {
    saveProgress()

    const nextQuestionIndex = currQuestionIndex + 1
    const nextQuestionId = currStage.questions[nextQuestionIndex]?.id
    const nextQuestionHasValue = !!getValues(
      `${currStage.id}.${nextQuestionId}`
    )

    if (isLastQuestion) setIsCheckpoint(true)
    else setCurrQuestionId(currStage.questions[currQuestionIndex + 1].id)
    setIsNextButtonEnabled(nextQuestionHasValue)
  }

  const handleCheckpointButtonClick = () => {
    const isLastCheckpoint = !nextStage?.id

    if (isLastCheckpoint) {
      router.push("/results")
      return
    }

    setCurrStageId(nextStage.id)
    setCurrQuestionId(nextStage.questions[0].id)
    setIsCheckpoint(false)
  }

  const handleQuestionClick = () => setIsNextButtonEnabled(true)

  if (isCheckpoint) {
    return (
      <CheckpointScreen
        icon={currStage.icon}
        title={currStage.title}
        description={currStage.description}
        buttonLabel={currStage.buttonLabel}
        onButtonClick={handleCheckpointButtonClick}
      />
    )
  }

  return (
    <div className="w-full max-w-[1280px] px-6 flex flex-col items-start justify-start mt-7">
      <div className="w-full flex flex-col items-start justify-start gap-2 mb-7">
        <span className="text-sm lg:text-base text-muted-foreground uppercase leading-none font-semibold">
          {currStage.name} level | stage {stageStepNumber} of 3
        </span>
        <h1 className="text-xl lg:text-3xl font-semibold">
          {currQuestion.title}
        </h1>
      </div>
      <div className="w-full flex items-end justify-between gap-8 flex-wrap">
        <div className="w-full flex flex-col gap-7 lg:gap-[70px] lg:max-w-[600px]">
          <Question
            {...currQuestion}
            name={currStage.id}
            onQuestionClick={handleQuestionClick}
          />
          <div className="w-full flex items-center justify-between gap-3">
            <Button
              variant="outline"
              onClick={handlePrevButtonClick}
              disabled={!isPrevButtonEnabled}
            >
              <Image
                src="/icons/form/arrow-prev.svg"
                alt="Arrow Prev"
                width={16}
                height={16}
              />
              <span className="hidden lg:block">{buttonPrevLabel}</span>
            </Button>
            <Button
              onClick={handleNextButtonClick}
              disabled={!isNextButtonEnabled}
              className="w-full lg:w-auto"
            >
              <span>{buttonNextLabel}</span>
              <Image
                src="/icons/form/arrow-next.svg"
                alt="Arrow Next"
                width={16}
                height={16}
              />
            </Button>
          </div>
        </div>

        <ProgressBar
          min={currQuestionIndex + 1}
          max={currStage.questions.length}
          className="w-full lg:max-w-[224px]"
        />
      </div>
    </div>
  )
}

export default Form
