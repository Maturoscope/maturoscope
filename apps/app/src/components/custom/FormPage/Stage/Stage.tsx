// Packages
import { useState } from "react"
import { Control, UseFormGetValues } from "react-hook-form"
// Components
import CheckpointScreen from "../CheckpointScreen/CheckpointScreen"
import Question from "@/components/custom/FormPage/Question/Question"
import ProgressBar from "../ProgressBar/ProgressBar"
import { Button } from "@/components/ui/button"
// Types
import { DefaultValues } from "@/components/custom/FormPage/Form/default"
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
  control: Control<DefaultValues>
  getValues: UseFormGetValues<DefaultValues>
  setStage: (stage: StageId) => void
}

const STAGES_STEP_NUMBER: Record<StageId, number> = {
  trl: 1,
  mkrl: 2,
  mfrl: 3,
}

const Stage = ({
  stage,
  nextStage,
  buttonNextLabel,
  buttonPrevLabel,
  control,
  setStage,
}: StageProps) => {
  const [isCheckpoint, setIsCheckpoint] = useState(false)
  const [currQuestionId, setCurrQuestionId] = useState(stage.questions[0].id)
  const [isNextButtonDisabled, setIsNextButtonDisabled] = useState(true)

  const question = stage.questions.find(
    (question) => question.id === currQuestionId
  ) as QuestionProps
  const questionIndex = stage.questions.findIndex(
    (question) => question.id === currQuestionId
  )

  const stageStepNumber = STAGES_STEP_NUMBER[stage.id]
  const isLastQuestion = questionIndex === stage.questions.length - 1
  const isPrevButtonDisabled = questionIndex === 0

  const handlePrevButtonClick = () => {
    if (isPrevButtonDisabled) return
    setCurrQuestionId(stage.questions[questionIndex - 1].id)
  }

  const handleNextButtonClick = () => {
    if (isLastQuestion) {
      setIsCheckpoint(true)
    } else {
      setCurrQuestionId(stage.questions[questionIndex + 1].id)
    }
  }

  const handleQuestionClick = () => setIsNextButtonDisabled(false)

  const handleCheckpointButtonClick = () => {
    setStage(nextStage.id)
    setCurrQuestionId(nextStage.questions[0].id)
    setIsCheckpoint(false)
  }

  if (isCheckpoint) {
    return (
      <CheckpointScreen
        icon={stage.icon}
        title={stage.title}
        description={stage.description}
        buttonLabel={stage.buttonLabel}
        onButtonClick={handleCheckpointButtonClick}
      />
    )
  }

  return (
    <div className="w-full max-w-[1280px] px-6 flex flex-col items-start justify-start mt-7">
      <div className="w-full flex flex-col items-start justify-start gap-2 mb-7">
        <span className="text-base text-muted-foreground uppercase leading-none">
          {stage.name} level | stage {stageStepNumber} of 3
        </span>
        <h1 className="text-3xl font-semibold">{question.title}</h1>
      </div>
      <div className="w-full flex items-end justify-between gap-8">
        <div className="w-full flex flex-col gap-[70px] max-w-[600px]">
          <Question
            {...question}
            name={stage.id}
            control={control}
            onQuestionClick={handleQuestionClick}
          />
          <div className="w-full flex items-center justify-between">
            <Button
              variant="outline"
              onClick={handlePrevButtonClick}
              disabled={isPrevButtonDisabled}
            >
              {buttonPrevLabel}
            </Button>
            <Button
              onClick={handleNextButtonClick}
              disabled={isNextButtonDisabled}
            >
              {buttonNextLabel}
            </Button>
          </div>
        </div>

        <ProgressBar
          min={questionIndex + 1}
          max={stage.questions.length}
          className="w-full max-w-[224px]"
        />
      </div>
    </div>
  )
}

export default Stage
