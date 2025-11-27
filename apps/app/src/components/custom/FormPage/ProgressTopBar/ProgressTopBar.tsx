"use client"

// Utils
import { cn } from "@/lib/utils"
// Components
// import { Progress } from "@/components/ui/progress"
// Context
import { useProgressContext } from "@/context/ProgressContext"

interface ProgressTopBarProps {
  // min: number
  // max: number
  className?: string
}

const STAGES = [
  {
    id: "trl",
    name: "TRL",
    icon: "/icons/homepage/criteria-trl.svg",
  },
  {
    id: "mkrl",
    name: "MKRL",
    icon: "/icons/homepage/criteria-mkrl.svg",
  },
  {
    id: "mfrl",
    name: "MFRL",
    icon: "/icons/homepage/criteria-mfrl.svg",
  },
]

const ProgressTopBar = ({
  // min, max,
  className,
}: ProgressTopBarProps) => {
  const {
    currStage,
    currQuestionIndex,
    currQuestion,
    isCheckpoint,
    stageStepNumber,
    isPrevButtonEnabled,
    isNextButtonEnabled,
  } = useProgressContext()

  console.log({
    currStage,
    currQuestionIndex,
    currQuestion,
    isCheckpoint,
    stageStepNumber,
    isPrevButtonEnabled,
    isNextButtonEnabled,
  })
  // const value = (min / max) * 100
  // const label = `${min} of ${max}`

  return (
    <div
      className={cn(
        "w-full flex flex-col items-end justify-end gap-1.5 lg:flex-col-reverse",
        className
      )}
    >
      {/* <Progress value={value} />
      <span className="text-base font-medium">{label}</span> */}
    </div>
  )
}

export default ProgressTopBar
