"use client"

// Packages
import { useState } from "react"
import Image from "next/image"
import { AnimatePresence, motion } from "motion/react"
// Components
import CheckpointScreen from "@/components/custom/FormPage/CheckpointScreen/CheckpointScreen"
import Question from "@/components/custom/FormPage/Question/Question"
import { Button } from "@/components/ui/button"
// Context
import { useProgressContext } from "@/context/ProgressContext"
// Animations
import { EASE_OUT, QUESTION_TRANSITION_VARIANT } from "@/animations/common"

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
  commentPlaceholder: string
  addNoteLabel: string
  removeNoteLabel: string
  notApplicableLabel: string
  continueToLabel: string
  seeReportLabel: string
  intermediateTitle: string
  intermediateDescription: string
  finalTitle: string
  finalDescription: string
  loadingLabel?: string
  // stages are not needed here - Form gets them from ProgressContext
}

const Form = ({
  buttonNextLabel,
  buttonPrevLabel,
  commentPlaceholder,
  addNoteLabel,
  removeNoteLabel,
  notApplicableLabel,
  continueToLabel,
  seeReportLabel,
  intermediateTitle,
  intermediateDescription,
  finalTitle,
  finalDescription,
  loadingLabel,
}: FormProps) => {
  const {
    stages,
    currStage,
    currQuestion,
    isCheckpoint,
    isFormCompleted,
    isNextButtonEnabled,
    handleReviewClick,
    handleCheckpointButtonClick,
    handleQuestionClick,
    handlePrevButtonClick,
    handleNextButtonClick,
  } = useProgressContext()

  // The checkpoint CTA points to the next SELECTED scale, or "See report" when
  // the current scale is the last one selected (order: TRL → MkRL → MfRL).
  const currStageIndex = stages.findIndex((stage) => stage.id === currStage.id)
  const nextStage = stages[currStageIndex + 1]
  const checkpointButtonLabel = nextStage
    ? `${continueToLabel} ${nextStage.name}`
    : seeReportLabel

  // Copy is generic and derived from the selected scales, so it stays correct
  // for any subset/order. Intermediate checkpoints reference the current and
  // next scale; the final one is scale-agnostic.
  const checkpointTitle = nextStage
    ? intermediateTitle.replace("{scale}", currStage.name)
    : finalTitle
  const checkpointDescription = nextStage
    ? intermediateDescription.replace("{next}", nextStage.name)
    : finalDescription

  // Track navigation direction so the question crossfade slides the right way.
  const [direction, setDirection] = useState(0)

  const handleNext = () => {
    setDirection(1)
    handleNextButtonClick()
  }

  const handlePrev = () => {
    setDirection(-1)
    handlePrevButtonClick()
  }

  if (isCheckpoint) {
    return (
      <CheckpointScreen
        icon={currStage.icon}
        title={checkpointTitle}
        description={checkpointDescription}
        reviewLabel={currStage.reviewLabel}
        buttonLabel={checkpointButtonLabel}
        loadingLabel={loadingLabel}
        onReviewClick={handleReviewClick}
        onButtonClick={handleCheckpointButtonClick}
      />
    )
  }

  return (
    <div className="w-full max-w-[750px] flex-1 min-h-0 px-4 flex flex-col items-start mt-7 lg:box-content">
      <AnimatePresence mode="wait" custom={direction}>
        <motion.div
          key={`${currStage.id}-${currQuestion.id}`}
          custom={direction}
          variants={QUESTION_TRANSITION_VARIANT}
          initial="enter"
          animate="center"
          exit="exit"
          transition={{ duration: 0.5, ease: EASE_OUT }}
          className="w-full flex-1 min-h-0 flex flex-col items-start"
        >
          <h1 className="text-xl lg:text-3xl font-semibold mb-4">
            {currQuestion.title}
          </h1>

          <Question
            {...currQuestion}
            name={currStage.id}
            onQuestionClick={handleQuestionClick}
            commentPlaceholder={commentPlaceholder}
            addNoteLabel={addNoteLabel}
            removeNoteLabel={removeNoteLabel}
            notApplicableLabel={notApplicableLabel}
            disabled={isFormCompleted}
          />
        </motion.div>
      </AnimatePresence>

      <div className="w-full flex items-center justify-between gap-3 bg-background lg:bg-none py-4 lg:pt-6 lg:pb-8">
        <Button variant="outline" onClick={handlePrev}>
          <Image
            src="/icons/form/arrow-prev.svg"
            alt="Arrow Prev"
            width={16}
            height={16}
          />
          <span className="hidden lg:block">{buttonPrevLabel}</span>
        </Button>
        <Button
          onClick={handleNext}
          disabled={!isNextButtonEnabled}
          className="w-full lg:w-auto"
          accent
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
  )
}

export default Form
