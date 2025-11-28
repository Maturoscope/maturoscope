"use client"

// Packages
import Image from "next/image"
// Components
import CheckpointScreen from "@/components/custom/FormPage/CheckpointScreen/CheckpointScreen"
import Question from "@/components/custom/FormPage/Question/Question"
import { Button } from "@/components/ui/button"
// Context
import { useProgressContext } from "@/context/ProgressContext"

export type StageId = "trl" | "mkrl" | "mfrl"

export interface QuestionData {
  id: string
  title: string
  options: Array<{ id: string; title: string }>
}

export interface StageType {
  id: StageId
  icon: string
  name: string
  title: string
  description: string
  buttonLabel: string
  reviewLabel: string
  questions: QuestionData[]
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
  // stages are not needed here - Form gets them from ProgressContext
}

const Form = ({ buttonNextLabel, buttonPrevLabel }: FormProps) => {
  const {
    currStage,
    currQuestion,
    isCheckpoint,
    isPrevButtonEnabled,
    isNextButtonEnabled,
    handleReviewClick,
    handleCheckpointButtonClick,
    handleQuestionClick,
    handlePrevButtonClick,
    handleNextButtonClick,
  } = useProgressContext()

  if (isCheckpoint) {
    return (
      <CheckpointScreen
        icon={currStage.icon}
        title={currStage.title}
        description={currStage.description}
        reviewLabel={currStage.reviewLabel}
        buttonLabel={currStage.buttonLabel}
        onReviewClick={handleReviewClick}
        onButtonClick={handleCheckpointButtonClick}
      />
    )
  }

  return (
    <div className="w-full max-w-[750px] px-4 flex flex-col items-start justify-start mt-7">
      <div className="w-full flex flex-col items-start justify-start gap-2 mb-4 lg:mb-6">
        <h1 className="text-xl lg:text-3xl font-semibold">
          {currQuestion.title}
        </h1>
      </div>
      <div className="w-full flex items-end justify-between gap-8 flex-wrap">
        <div className="w-full flex flex-col gap-7 lg:gap-[70px]">
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
      </div>
    </div>
  )
}

export default Form
