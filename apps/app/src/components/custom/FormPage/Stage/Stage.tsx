// Packages
import { useState } from "react"
import { Control, UseFormHandleSubmit } from "react-hook-form"
// Components
import Question from "@/components/custom/FormPage/Question/Question"
// Types
import { DefaultValues } from "@/components/custom/FormPage/Form/default"
import { QuestionProps } from "@/components/custom/FormPage/Question/Question"
import { Button } from "@/components/ui/button"

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
  buttonNextLabel: string
  buttonPrevLabel: string
  control: Control<DefaultValues>
  handleFinishClick: UseFormHandleSubmit<DefaultValues, DefaultValues>
  setStage: (stage: StageId) => void
}

const STAGES_STEP_NUMBER: Record<StageId, number> = {
  trl: 1,
  mkrl: 2,
  mfrl: 3,
}

const Stage = ({
  stage,
  buttonNextLabel,
  buttonPrevLabel,
  control,
  // setStage,
  // handleFinishClick,
}: StageProps) => {
  const [currQuestionId, setCurrQuestionId] = useState<string>(
    stage.questions[0].id
  )
  const question = stage.questions.find(
    (question) => question.id === currQuestionId
  ) as QuestionProps
  const questionIndex = stage.questions.findIndex(
    (question) => question.id === currQuestionId
  )

  const stageStepNumber = STAGES_STEP_NUMBER[stage.id]
  const isPrevButtonDisabled = questionIndex === 0

  const handlePrevButtonClick = () => {
    if (isPrevButtonDisabled) return
    setCurrQuestionId(stage.questions[questionIndex - 1].id)
  }

  const handleNextButtonClick = () => {
    if (questionIndex === stage.questions.length - 1) {
      // handleFinishClick()
    } else {
      setCurrQuestionId(stage.questions[questionIndex + 1].id)
    }
  }

  return (
    <div className="w-full max-w-[1280px] px-6 flex flex-col items-start justify-start">
      <div className="w-full flex flex-col items-start justify-start gap-2 mb-7">
        <span className="text-base text-muted-foreground uppercase ">
          {stage.name} level | stage {stageStepNumber} of 3
        </span>
        <h1 className="text-3xl font-semibold">{question.title}</h1>
      </div>
      <div className="w-full">
        <div className="w-full flex flex-col gap-20 max-w-[600px]">
          <Question {...question} name={stage.id} control={control} />
          <div className="w-full flex items-center justify-between">
            <Button
              variant="outline"
              onClick={handlePrevButtonClick}
              disabled={isPrevButtonDisabled}
            >
              {buttonPrevLabel}
            </Button>
            <Button onClick={handleNextButtonClick}>{buttonNextLabel}</Button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Stage
